"use client";

/* NIGHT RUN — drive in, fuel up, grab a snack, check out.
   Orchestrator: renderer + composer, Rapier physics (fixed 1/60), game
   states, HUD, debug harness (?debug=1 → window.__game). */

import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  SelectiveBloomEffect,
  SMAAEffect,
  VignetteEffect,
  BlendFunction,
} from "postprocessing";
import { useEffect, useRef, useState } from "react";
import { buildWorld, BLOOM_LAYER } from "./world";
import { buildCar, attachVehicle, CAR } from "./car";
import { createAudio } from "./audio";
import { pumpScreenTexture, brand } from "./texgen";

const FIXED = 1 / 60;
const FUEL_TARGET = 10.0;

/* Rapier wasm must initialize exactly once per page — StrictMode double-
   mounts would otherwise race two init() calls on the shared singleton. */
let rapierPromise = null;
const getRapier = () =>
  (rapierPromise ??= import("@dimforge/rapier3d-compat").then(async (R) => {
    await R.init();
    return R;
  }));

const POSES = {
  spawn: { mode: "drive", car: [0, 1.1, 62, -Math.PI / 2] },
  approach: { mode: "drive", car: [0, 1.1, 26, -Math.PI / 2] },
  at_pump: { mode: "drive", car: [-1.9, 1.1, -2, Math.PI] },
  fueling: { mode: "fueling", car: [-1.9, 1.1, -2, Math.PI] },
  on_foot_lot: { mode: "foot", car: [-1.9, 1.1, -2, Math.PI], foot: [0, -8] },
  store_aisle: { mode: "foot", car: [-1.9, 1.1, -2, Math.PI], foot: [-5.5, -19.5] },
  checkout: { mode: "foot", car: [-1.9, 1.1, -2, Math.PI], foot: [9, -17.2], carry: true },
  receipt: { mode: "receipt", car: [-1.9, 1.1, -2, Math.PI], foot: [9, -17.2] },
  side_profile: { mode: "drive", car: [0, 1.1, 40, -Math.PI / 2], cam: [0, 1.15, 46.5, 0, 0.8, 40] },
  three_quarter: { mode: "drive", car: [0, 1.1, 40, -Math.PI / 2], cam: [4.6, 1.7, 45.2, 0, 0.75, 40] },
};

export default function NightRun({ onClassic, onProgress, started }) {
  const hostRef = useRef(null);
  const G = useRef({}).current; // mutable game bag
  const [hud, setHud] = useState({
    prompt: null,
    objectives: { fuel: false, snack: false, paid: false },
    carried: null,
    receipt: false,
    perfect: false,
    mode: "drive",
    done: false,
    muted: false,
    hint: true,
  });
  const hudRef = useRef(hud);
  useEffect(() => {
    hudRef.current = hud;
  });

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    const debug = new URLSearchParams(location.search).has("debug");
    const coarse = matchMedia("(pointer: coarse)").matches;
    const tierAuto =
      coarse || (navigator.deviceMemory && navigator.deviceMemory < 6) ? "mobile" : "desktop";
    const tier = localStorage.getItem("nr-quality") || tierAuto;

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, tier === "desktop" ? 2 : 1.5));
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.info.autoReset = false;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090d);
    scene.fog = new THREE.Fog(0x0a0c10, 30, 130);
    const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.3, 300);

    const audio = createAudio();
    G.audioToggle = () => audio.toggle();
    setTimeout(() => setHud((h) => ({ ...h, muted: audio.muted })), 0);

    /* ---------- load env + physics in parallel, report progress ---------- */
    const manager = new THREE.LoadingManager();
    manager.onProgress = (u, l, t) => onProgress?.(Math.round((l / t) * 60));
    let world, RAPIER, refs, carRig, composer, bloom;

    const boot = (async () => {
      const [hdr, rapier] = await Promise.all([
        new HDRLoader(manager).loadAsync("/assets/night_1k.hdr"),
        getRapier(),
      ]);
      if (disposed) return;
      onProgress?.(70);
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = hdr;
      scene.environmentIntensity = 0.5;

      RAPIER = rapier;
      world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
      world.timestep = FIXED;

      refs = buildWorld(scene, tier);
      // ground collider
      world.createCollider(RAPIER.ColliderDesc.cuboid(120, 0.1, 120).setTranslation(0, -0.1, 0));
      for (const c of refs.colliders) {
        world.createCollider(
          RAPIER.ColliderDesc.cuboid(c.hx, c.hy, c.hz)
            .setTranslation(c.x, c.y, c.z)
            .setRotation({ x: 0, y: Math.sin((c.ry || 0) / 2), z: 0, w: Math.cos((c.ry || 0) / 2) })
        );
      }
      // dynamic crates
      for (const cr of refs.crates) {
        const rb = world.createRigidBody(
          RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(cr.mesh.position.x, cr.mesh.position.y, cr.mesh.position.z)
            .setAngularDamping(0.8)
        );
        world.createCollider(
          RAPIER.ColliderDesc.cuboid(cr.size / 2, cr.size / 2, cr.size / 2).setMass(6),
          rb
        );
        cr.body = rb;
      }

      const built = buildCar();
      scene.add(built.car);
      const rig = attachVehicle(RAPIER, world, built.car);
      rig.chassis.setRotation({ x: 0, y: Math.sin(-Math.PI / 4), z: 0, w: Math.cos(-Math.PI / 4) }, true);
      carRig = { ...built, ...rig };

      // character body (on foot)
      G.footBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0.9, -8)
      );
      G.footCol = world.createCollider(RAPIER.ColliderDesc.capsule(0.55, 0.3), G.footBody);
      G.charCtl = world.createCharacterController(0.03);
      G.charCtl.enableSnapToGround(0.3);

      /* composer */
      composer = new EffectComposer(renderer, { multisampling: 0 });
      composer.addPass(new RenderPass(scene, camera));
      if (tier === "desktop") {
        try {
          const { N8AOPostPass } = await import("n8ao");
          const ao = new N8AOPostPass(scene, camera, innerWidth, innerHeight);
          ao.configuration.aoRadius = 1.8;
          ao.configuration.intensity = 2.4;
          composer.addPass(ao);
          G.aoPass = ao;
        } catch {}
      }
      bloom = new SelectiveBloomEffect(scene, camera, {
        blendFunction: BlendFunction.ADD,
        luminanceThreshold: 0.1,
        intensity: 0.85,
        radius: 0.7,
        mipmapBlur: true,
      });
      bloom.selection.layer = BLOOM_LAYER;
      composer.addPass(
        new EffectPass(camera, bloom, new SMAAEffect(), new VignetteEffect({ darkness: 0.42, offset: 0.28 }))
      );
      onProgress?.(90);
      await renderer.compileAsync(scene, camera);
      onProgress?.(100);
      G.ready = true;
    })();

    /* ---------- input ---------- */
    const keys = new Set();
    const joy = { active: false, x: 0, y: 0 };
    G.touch = { throttle: 0, brake: 0, action: false };
    const kd = (e) => {
      if (e.repeat) return;
      keys.add(e.code);
      audio.unlock();
      if (hudRef.current.hint) setHud((h) => ({ ...h, hint: false }));
      if (e.code === "KeyE" || e.key === "Enter") G.interact?.();
      if (e.code === "KeyF") G.enterExit?.();
      if (e.code === "KeyM") setHud((h) => ({ ...h, muted: audio.toggle() }));
      if (e.key === "Escape") G.closePanels?.();
    };
    const ku = (e) => keys.delete(e.code);
    addEventListener("keydown", kd);
    addEventListener("keyup", ku);

    /* pointer-lock look (on foot) */
    let yaw = Math.PI, pitch = 0;
    const onMove = (e) => {
      if (document.pointerLockElement === renderer.domElement && G.mode === "foot") {
        yaw -= e.movementX * 0.0024;
        pitch = Math.max(-1.2, Math.min(1.2, pitch - e.movementY * 0.0022));
      }
    };
    addEventListener("mousemove", onMove);
    const onClick = () => {
      if (G.mode === "foot" && !coarse && !hudRef.current.receipt)
        renderer.domElement.requestPointerLock?.();
    };
    renderer.domElement.addEventListener("click", onClick);

    /* ---------- game state ---------- */
    G.mode = "drive";
    G.objectives = { fuel: false, snack: false, paid: false };
    G.carried = null;
    G.gallons = 0;
    G.filling = false;
    G.fuelPhase = null; // 'pay' | 'fill' | 'done'
    let doorOpen = 0;
    let chimed = false;
    let nearBay = false;
    let prompt = null;

    const setPrompt = (p) => {
      if (p !== prompt) {
        prompt = p;
        setHud((h) => ({ ...h, prompt: p }));
      }
    };
    const setMode = (m) => {
      G.mode = m;
      setHud((h) => ({ ...h, mode: m }));
    };

    const carPose = () => {
      const t = carRig.chassis.translation();
      const r = carRig.chassis.rotation();
      return { t, r };
    };
    const carSpeed = () => {
      const v = carRig.chassis.linvel();
      return Math.hypot(v.x, v.z);
    };

    G.interact = () => {
      if (!G.ready) return;
      if (G.mode === "drive" && nearBay && carSpeed() < 1.2) {
        setMode("fueling");
        G.fuelPhase = "pay";
        G.payT = 0;
        audio.pumpClick();
      } else if (G.mode === "fueling" && G.fuelPhase === "fill") {
        // handled by hold logic (keydown sets filling via keys set)
      } else if (G.mode === "foot") {
        // pickup
        if (!G.carried) {
          for (const it of refs.shelfItems) {
            const fp = G.footBody.translation();
            if (Math.hypot(fp.x - it.x, fp.z - it.z) < 1.6 && it.mesh.visible) {
              it.mesh.visible = false;
              G.carried = it.product;
              G.objectives.snack = true;
              audio.beep();
              setHud((h) => ({
                ...h,
                carried: it.product.name,
                carriedPrice: it.product.price,
                objectives: { ...G.objectives },
              }));
              return;
            }
          }
        }
        // checkout
        const fp = G.footBody.translation();
        if (G.carried && !G.objectives.paid && Math.hypot(fp.x - refs.register.x, fp.z - refs.register.z) < 2.0) {
          G.objectives.paid = true;
          audio.approve();
          refs.register.reader.material.emissiveIntensity = 5;
          setMode("receipt");
          setHud((h) => ({
            ...h,
            receipt: true,
            objectives: { ...G.objectives },
            done: true,
          }));
        }
      }
    };

    G.enterExit = () => {
      if (!G.ready) return;
      if (G.mode === "drive" && carSpeed() < 1.5) {
        const { t, r } = carPose();
        const side = new THREE.Vector3(0, 0, 2.2).applyQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w));
        G.footBody.setNextKinematicTranslation({ x: t.x + side.x, y: 0.9, z: t.z + side.z });
        yaw = Math.atan2(-(t.x + side.x), -(t.z + side.z) + -16); // face store-ish
        setMode("foot");
      } else if (G.mode === "foot") {
        const fp = G.footBody.translation();
        const { t } = carPose();
        if (Math.hypot(fp.x - t.x, fp.z - t.z) < 3.2) {
          document.exitPointerLock?.();
          setMode("drive");
        }
      }
    };

    G.closePanels = () => {
      if (hudRef.current.receipt) {
        setHud((h) => ({ ...h, receipt: false }));
        setMode("foot");
      }
      document.exitPointerLock?.();
    };

    /* route line for the first moments */
    const routeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.12, 58),
      new THREE.Vector3(0, 0.12, 12),
      new THREE.Vector3(-1.9, 0.12, 4),
      new THREE.Vector3(-1.9, 0.12, -0.5),
    ]);
    const routeMat = new THREE.LineDashedMaterial({
      color: 0xe8a01a,
      dashSize: 0.9,
      gapSize: 0.55,
      transparent: true,
      opacity: 0.85,
    });
    const route = new THREE.Line(routeGeo, routeMat);
    route.computeLineDistances();
    scene.add(route);

    /* ---------- loop ---------- */
    const camPos = new THREE.Vector3(6, 5, 70);
    const camLook = new THREE.Vector3();
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const frames = [];
    let steerVis = 0;
    let elapsed = 0;

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      renderer.info.reset();
      let dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!G.ready) {
        renderer.render(scene, camera);
        return;
      }
      elapsed += dt;
      frames.push(1 / dt);
      if (frames.length > 600) frames.shift();

      const throttleKey = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) + G.touch.throttle;
      const reverseKey = (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0) + G.touch.brake;
      const steerKey =
        (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0) -
        (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) +
        (joy.active ? -joy.x : 0);
      const handbrake = keys.has("Space") || G.touch.action;

      if (G.pendingCarPose) {
        const [px2, py2, pz2, pry] = G.pendingCarPose;
        G.pendingCarPose = null;
        carRig.chassis.setTranslation({ x: px2, y: py2, z: pz2 }, true);
        carRig.chassis.setRotation(
          { x: 0, y: Math.sin(pry / 2), z: 0, w: Math.cos(pry / 2) },
          true
        );
        carRig.chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);
        carRig.chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
        if (G.pendingFootPose) {
          G.footBody.setNextKinematicTranslation({ x: G.pendingFootPose[0], y: 0.9, z: G.pendingFootPose[1] });
          G.footBody.setTranslation({ x: G.pendingFootPose[0], y: 0.9, z: G.pendingFootPose[1] }, true);
          G.pendingFootPose = null;
        }
        const settle = G.pendingSettle || 30;
        G.pendingSettle = 0;
        for (let i = 0; i < settle; i++) {
          try {
            carRig.vehicle.updateVehicle(
              FIXED,
              undefined,
              undefined,
              (c) => c.handle !== carRig.chassisCol.handle
            );
          } catch {
            G.physErrors = (G.physErrors || 0) + 1;
          }
          world.step();
        }
        acc = 0;
      }
      acc += dt;
      while (acc >= FIXED) {
        acc -= FIXED;
        if (G.mode === "drive" || G.mode === "fueling") {
          const speed = carSpeed();
          const steer = THREE.MathUtils.clamp(steerKey, -1, 1) * (0.42 - Math.min(0.24, speed * 0.012));
          carRig.vehicle.setWheelSteering(0, steer);
          carRig.vehicle.setWheelSteering(1, steer);
          const drive = G.mode === "drive" ? (throttleKey - reverseKey * 0.7) * 620 : 0;
          carRig.vehicle.setWheelEngineForce(2, drive);
          carRig.vehicle.setWheelEngineForce(3, drive);
          const brake = handbrake ? 10 : throttleKey || reverseKey ? 0 : 1.6;
          for (let i = 0; i < 4; i++) carRig.vehicle.setWheelBrake(i, i > 1 && handbrake ? 14 : brake);
          try {
            carRig.vehicle.updateVehicle(
              FIXED,
              undefined,
              undefined,
              (c) => c.handle !== carRig.chassisCol.handle
            );
          } catch {
            G.physErrors = (G.physErrors || 0) + 1;
          }
          audio.engine(speed, throttleKey);
        } else if (G.mode === "foot") {
          const f = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
          const r = new THREE.Vector3(-f.z, 0, f.x);
          const mv = new THREE.Vector3();
          const fw = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) + (joy.active ? -joy.y : 0);
          const bw = keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0;
          const lt = keys.has("KeyQ") ? 1 : 0;
          const rt = keys.has("KeyE2") ? 1 : 0; // unused
          if (!document.pointerLockElement) {
            yaw += ((keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0) - (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0)) * FIXED * 2.2 + (joy.active ? -joy.x * FIXED * 2.4 : 0);
          } else {
            mv.addScaledVector(r, ((keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0)) * 1);
          }
          mv.addScaledVector(f, fw - bw);
          if (mv.lengthSq() > 0) mv.normalize().multiplyScalar(3.4 * FIXED);
          G.charCtl.computeColliderMovement(G.footCol, { x: mv.x, y: -0.3 * FIXED, z: mv.z });
          const cm = G.charCtl.computedMovement();
          const fp = G.footBody.translation();
          G.footBody.setNextKinematicTranslation({ x: fp.x + cm.x, y: 0.9, z: fp.z + cm.z });
        }
        world.step();
      }

      /* visuals from physics — chassis group mirrors the body exactly;
         wheels are body-space children driven from the controller. */
      const { t, r } = carPose();
      carRig.car.position.set(t.x, t.y, t.z);
      carRig.car.quaternion.set(r.x, r.y, r.z, r.w);
      const speed = carSpeed();
      steerVis = THREE.MathUtils.lerp(steerVis, THREE.MathUtils.clamp(steerKey, -1, 1) * 0.42, 0.2);
      const _steerQ = new THREE.Quaternion();
      const _spinQ = new THREE.Quaternion();
      const _axis = new THREE.Vector3();
      carRig.wheels.forEach((w, i) => {
        const v = carRig.vehicle;
        const conn = v.wheelChassisConnectionPointCs?.(i);
        const dir = v.wheelDirectionCs?.(i) ?? { x: 0, y: -1, z: 0 };
        const sLen = v.wheelSuspensionLength?.(i);
        const rest = v.wheelSuspensionRestLength?.(i) ?? 0.36;
        const sUse = sLen == null || Number.isNaN(sLen) ? rest : sLen;
        if (conn) {
          w.position.set(conn.x + dir.x * sUse, conn.y + dir.y * sUse, conn.z + dir.z * sUse);
        }
        const steer = v.wheelSteering?.(i) ?? 0;
        const spin = v.wheelRotation?.(i) ?? 0;
        _steerQ.setFromAxisAngle(_axis.set(0, 1, 0), steer);
        const ax = v.wheelAxleCs?.(i) ?? { x: 0, y: 0, z: 1 };
        _spinQ.setFromAxisAngle(_axis.set(ax.x, ax.y, ax.z).normalize(), -spin);
        w.quaternion.copy(_steerQ).multiply(_spinQ);
      });
      /* brake / reverse light logic */
      const braking = handbrake || (reverseKey > 0 && speed > 0.6);
      carRig.tailMat.emissiveIntensity = braking ? 7 : 2.6;
      carRig.revMat.emissiveIntensity = reverseKey > 0 && speed < 4 ? 4 : 0;

      /* crates sync */
      for (const cr of refs.crates) {
        if (!cr.body) continue;
        const ct = cr.body.translation();
        const cq = cr.body.rotation();
        cr.mesh.position.set(ct.x, ct.y, ct.z);
        cr.mesh.quaternion.set(cq.x, cq.y, cq.z, cq.w);
      }

      /* bay proximity + prompts */
      let bay = null;
      for (const b of refs.pumpBays) {
        if (Math.hypot(t.x - b.x, t.z - b.z) < 2.4) { bay = b; break; }
      }
      nearBay = Boolean(bay);
      if (G.mode === "drive") {
        if (nearBay && speed < 1.2 && !G.objectives.fuel) setPrompt(coarse ? "Tap ⚡ — Fuel up" : "E — Fuel up");
        else if (nearBay && speed < 1.2 && G.objectives.fuel) setPrompt(coarse ? "Tap 🚶 — Get out" : "F — Get out");
        else setPrompt(null);
      } else if (G.mode === "foot") {
        const fp = G.footBody.translation();
        let p = null;
        if (!G.carried) {
          for (const it of refs.shelfItems)
            if (it.mesh.visible && Math.hypot(fp.x - it.x, fp.z - it.z) < 1.6)
              p = coarse ? `Tap ⚡ — Take ${it.product.name}` : `E — Take ${it.product.name}`;
        }
        if (!p && G.carried && !G.objectives.paid && Math.hypot(fp.x - refs.register.x, fp.z - refs.register.z) < 2.0)
          p = coarse ? "Tap ⚡ — Pay" : "E — Pay";
        if (!p && Math.hypot(fp.x - t.x, fp.z - t.z) < 3.2)
          p = coarse ? "Tap 🚶 — Drive" : "F — Drive";
        setPrompt(p);
      }

      /* fueling flow */
      if (G.mode === "fueling") {
        if (G.fuelPhase === "pay") {
          G.payT += dt;
          const reader = refs.pumpBays[0].dispenser.userData.reader;
          if (reader) reader.material.emissiveIntensity = 1.6 + Math.sin(elapsed * 10) * 1.2;
          setPrompt("Tap to pay…");
          if (G.payT > 1.4) {
            G.fuelPhase = "fill";
            audio.approve();
            if (reader) reader.material.emissiveIntensity = 4;
            refs.screenMat.map = pumpScreenTexture(["APPROVED", "HOLD E", `TARGET ${FUEL_TARGET.toFixed(1)} GAL`]);
            refs.screenMat.emissiveMap = refs.screenMat.map;
            refs.screenMat.needsUpdate = true;
          }
        } else if (G.fuelPhase === "fill") {
          const holding = keys.has("KeyE") || keys.has("Space") || G.touch.action;
          audio.fuelFlow(holding && G.gallons < FUEL_TARGET + 0.4);
          if (holding && G.gallons < FUEL_TARGET + 0.4) {
            G.gallons += dt * 1.7;
            if (Math.floor(G.gallons * 10) !== G.lastTick) {
              G.lastTick = Math.floor(G.gallons * 10);
              refs.screenMat.map = pumpScreenTexture([
                `${G.gallons.toFixed(1)} GAL`,
                `$${(G.gallons * brand.fuel.pricePerGallon).toFixed(2)}`,
                `TARGET ${FUEL_TARGET.toFixed(1)}`,
              ]);
              refs.screenMat.emissiveMap = refs.screenMat.map;
              refs.screenMat.needsUpdate = true;
            }
            setPrompt(`Release at ${FUEL_TARGET.toFixed(1)} gal`);
          } else if (!holding && G.gallons > 0.2) {
            const perfect = G.gallons >= FUEL_TARGET - 0.35 && G.gallons <= FUEL_TARGET + 0.05;
            G.objectives.fuel = true;
            G.fuelPhase = null;
            audio.fuelFlow(false);
            if (perfect) audio.perfect();
            setHud((h) => ({
              ...h,
              perfect,
              objectives: { ...G.objectives },
            }));
            if (perfect) setTimeout(() => setHud((h) => ({ ...h, perfect: false })), 2600);
            refs.screenMat.map = pumpScreenTexture([perfect ? "PERFECT STOP" : "COMPLETE", `${G.gallons.toFixed(1)} GAL`, "THANK YOU"]);
            refs.screenMat.emissiveMap = refs.screenMat.map;
            refs.screenMat.needsUpdate = true;
            setMode("drive");
          } else {
            setPrompt("Hold E to fuel");
          }
        }
      }

      /* doors */
      const fp2 = G.mode === "foot" ? G.footBody.translation() : t;
      const nearDoor = Math.hypot(fp2.x - refs.doors.x, fp2.z - refs.doors.z) < 3.4;
      doorOpen = THREE.MathUtils.lerp(doorOpen, nearDoor && G.mode === "foot" ? 1 : 0, 0.12);
      refs.doors.left.position.x = -0.85 - doorOpen * 1.55;
      refs.doors.right.position.x = 0.85 + doorOpen * 1.55;
      if (nearDoor && G.mode === "foot" && !chimed) { chimed = true; audio.chime(); }
      if (!nearDoor) chimed = false;

      /* route line fade */
      if (elapsed > 10 || G.objectives.fuel) routeMat.opacity = Math.max(0, routeMat.opacity - dt * 0.8);
      route.visible = routeMat.opacity > 0.02;

      /* camera */
      if (G.debugCam) {
        camera.position.set(...G.debugCam.pos);
        camera.lookAt(...G.debugCam.look);
        camera.fov = 46;
        camera.updateProjectionMatrix();
      } else if (G.mode === "drive" || G.mode === "receipt") {
        const q = new THREE.Quaternion(r.x, r.y, r.z, r.w);
        const back = new THREE.Vector3(-8.2, 3.3, 0).applyQuaternion(q);
        camPos.lerp(new THREE.Vector3(t.x + back.x, t.y + back.y, t.z + back.z), Math.min(1, 4.5 * dt));
        camera.position.copy(camPos);
        camLook.lerp(new THREE.Vector3(t.x, t.y + 1.1, t.z), Math.min(1, 8 * dt));
        camera.lookAt(camLook);
        camera.fov = THREE.MathUtils.lerp(camera.fov, 55 + Math.min(14, speed * 1.1), 0.08);
        camera.updateProjectionMatrix();
      } else if (!G.debugCam && G.mode === "fueling") {
        const b = refs.pumpBays[0];
        camPos.lerp(new THREE.Vector3(b.x + 1.6, 1.75, b.z + 2.4), Math.min(1, 3 * dt));
        camera.position.copy(camPos);
        camLook.lerp(new THREE.Vector3(b.dispenser.position.x, 1.6, b.dispenser.position.z), Math.min(1, 5 * dt));
        camera.lookAt(camLook);
      } else if (G.mode === "foot") {
        const fp = G.footBody.translation();
        camera.position.set(fp.x, 1.62, fp.z);
        // (debugCam handled above)
        camera.rotation.set(pitch, yaw, 0, "YXZ");
        camera.fov = THREE.MathUtils.lerp(camera.fov, 62, 0.1);
        camera.updateProjectionMatrix();
      }

      composer ? composer.render() : renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    /* joystick + touch buttons wire-up happens in HUD via G */
    G.joy = joy;

    const onResize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      composer?.setSize(innerWidth, innerHeight);
    };
    addEventListener("resize", onResize);
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { last = performance.now(); raf = requestAnimationFrame(tick); }
    };
    document.addEventListener("visibilitychange", onVis);

    /* ---------- debug harness ---------- */
    if (debug) {
      const stats = () => {
        const arr = [...frames].sort((a, b) => a - b);
        const p = (q) => arr[Math.floor(q * (arr.length - 1))] || 0;
        return {
          min: Math.round(arr[0] || 0),
          avg: Math.round(arr.reduce((s, v) => s + v, 0) / (arr.length || 1)),
          p95: Math.round(p(0.05)),
        };
      };
      window.__game = {
        ready: boot,
        state: () => ({
          mode: G.mode,
          objectives: { ...G.objectives },
          car: carRig ? carPose().t : null,
          foot: G.footBody?.translation(),
          fps: stats(),
          drawCalls: renderer.info.render.calls,
          physErrors: G.physErrors || 0,
          triangles: renderer.info.render.triangles,
          tier,
        }),
        teleport: (name) => {
          const p = POSES[name];
          if (!p || !G.ready) return false;
          G.pendingCarPose = p.car;
          G.pendingFootPose = p.foot || null;
          if (p.carry && !G.carried) {
            const it = refs.shelfItems[0];
            it.mesh.visible = false;
            G.carried = it.product;
            G.objectives.snack = true;
            setHud((h) => ({ ...h, carried: it.product.name, carriedPrice: it.product.price, objectives: { ...G.objectives } }));
          }
          G.debugCam = p.cam
            ? { pos: p.cam.slice(0, 3), look: p.cam.slice(3, 6) }
            : null;
          G.pendingSettle = p.cam ? 240 : 30;
          if (name === "fueling") { G.fuelPhase = "pay"; G.payT = 0; }
          if (name === "receipt") {
            G.objectives = { fuel: true, snack: true, paid: true };
            setHud((h) => ({ ...h, receipt: true, done: true, objectives: { ...G.objectives } }));
          }
          setMode(p.mode === "receipt" ? "receipt" : p.mode);
          setHud((h) => ({ ...h, hint: false }));
          return true;
        },
        input: (seq) => {
          for (const step of seq) {
            if (step.down) keys.add(step.down);
            if (step.up) keys.delete(step.up);
          }
        },
        wheelState: () => {
          const out = [];
          const t = carRig.chassis.translation();
          const r = carRig.chassis.rotation();
          const q = new THREE.Quaternion(r.x, r.y, r.z, r.w);
          for (let i = 0; i < 4; i++) {
            const v = carRig.vehicle;
            const conn = v.wheelChassisConnectionPointCs?.(i) ?? null;
            const sus = v.wheelSuspensionLength?.(i);
            const axle = v.wheelAxleCs?.(i) ?? { x: 0, y: 0, z: 1 };
            const world_ = carRig.wheels[i]?.getWorldPosition(new THREE.Vector3());
            const axleWorld = new THREE.Vector3(axle.x, axle.y, axle.z).applyQuaternion(q);
            const rel = world_ ? world_.clone().sub(new THREE.Vector3(t.x, t.y, t.z)) : null;
            out.push({
              worldY: world_ ? +world_.y.toFixed(3) : null,
              lateral: rel ? +Math.abs(rel.dot(axleWorld)).toFixed(3) : null,
              suspension: sus != null ? +sus.toFixed(3) : null,
              rotation: +(v.wheelRotation?.(i) ?? 0).toFixed(3),
              steering: +(v.wheelSteering?.(i) ?? 0).toFixed(3),
              conn: conn ? [+conn.x.toFixed(2), +conn.y.toFixed(2), +conn.z.toFixed(2)] : null,
            });
          }
          return { wheels: out, chassisY: +t.y.toFixed(3), wheelRadius: CAR.wheelRadius, halfTrack: CAR.track / 2 };
        },
        setQuality: (t2) => localStorage.setItem("nr-quality", t2),
        screenshotReady: async () => {
          await boot;
          await renderer.compileAsync(scene, camera);
          await new Promise((res) => setTimeout(res, 450));
          return true;
        },
      };
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener("keydown", kd);
      removeEventListener("keyup", ku);
      removeEventListener("resize", onResize);
      removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      renderer.domElement.removeEventListener("click", onClick);
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        for (const m of Array.isArray(o.material) ? o.material : o.material ? [o.material] : []) {
          m.map?.dispose?.(); m.dispose?.();
        }
      });
      composer?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      if (window.__game) delete window.__game;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- joystick (touch) ---------- */
  const joyRef = useRef(null);
  const knobRef = useRef(null);
  useEffect(() => {
    const zone = joyRef.current;
    const knob = knobRef.current;
    if (!zone || !knob) return;
    let pid = null;
    const R = 40;
    const set = (x, y) => {
      G.joy.x = x; G.joy.y = y;
      knob.style.transform = `translate(${x * R}px, ${y * R}px)`;
    };
    const down = (e) => { pid = e.pointerId; zone.setPointerCapture(pid); G.joy.active = true; move(e); };
    const move = (e) => {
      if (pid === null || e.pointerId !== pid) return;
      const rect = zone.getBoundingClientRect();
      let x = (e.clientX - rect.left - rect.width / 2) / R;
      let y = (e.clientY - rect.top - rect.height / 2) / R;
      const l = Math.hypot(x, y);
      if (l > 1) { x /= l; y /= l; }
      set(x, y);
    };
    const up = () => { pid = null; G.joy.active = false; set(0, 0); };
    zone.addEventListener("pointerdown", down);
    zone.addEventListener("pointermove", move);
    zone.addEventListener("pointerup", up);
    zone.addEventListener("pointercancel", up);
    return () => {
      zone.removeEventListener("pointerdown", down);
      zone.removeEventListener("pointermove", move);
      zone.removeEventListener("pointerup", up);
      zone.removeEventListener("pointercancel", up);
    };
  });

  const coarse = typeof window !== "undefined" && matchMedia("(pointer: coarse)").matches;
  const obj = hud.objectives;

  return (
    <div className="absolute inset-0" role="application" aria-label="Night Run — drive to the station, fuel up, grab a snack, check out. Press E to interact, F to get out of the car.">
      <div ref={hostRef} className="absolute inset-0" />

      {/* objectives */}
      <div className="pointer-events-none absolute left-3 top-3 sm:left-4 sm:top-4">
        <div className="silk-label space-y-1 bg-substrate/85 px-3 py-2.5 text-[0.66rem] leading-relaxed">
          <p className={obj.fuel ? "text-led" : "text-silk"}>{obj.fuel ? "✓" : "①"} Fuel up</p>
          <p className={obj.snack ? "text-led" : "text-silk"}>{obj.snack ? "✓" : "②"} Grab a snack</p>
          <p className={obj.paid ? "text-led" : "text-silk"}>{obj.paid ? "✓" : "③"} Check out</p>
        </div>
        {hud.carried && !obj.paid ? (
          <p className="silk-label mt-1.5 bg-substrate/85 px-3 py-1.5 text-[0.62rem] text-gold">
            Carrying: {hud.carried}
          </p>
        ) : null}
      </div>

      {/* top-right controls */}
      <div className="absolute right-3 top-3 flex items-center gap-2 sm:right-4 sm:top-4">
        <button
          type="button"
          onClick={() => setHud((h) => ({ ...h, muted: G.audioToggle ? G.audioToggle() : !h.muted }))}
          className="silk-label border border-silk/25 bg-substrate/85 px-2.5 py-1.5 text-[0.62rem] text-silk-muted hover:border-gold hover:text-silk"
        >
          {hud.muted ? "Sound off" : "Sound on"}
        </button>
        <button
          type="button"
          onClick={onClassic}
          className="silk-label border border-gold bg-substrate/85 px-3 py-1.5 text-[0.62rem] text-gold hover:bg-gold/15"
        >
          Classic site
        </button>
      </div>

      {/* first-time hint */}
      {hud.hint ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center sm:bottom-16">
          <p className="silk-label bg-substrate/90 px-4 py-3 text-center text-[0.68rem] leading-relaxed text-silk">
            {coarse ? "Drag to steer · pedals below" : "WASD / arrows — drive"} · follow the gold line to the pumps
          </p>
        </div>
      ) : null}

      {/* prompt */}
      {hud.prompt && !hud.receipt ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center">
          <p className="pad px-4 py-2.5 text-[0.8rem]">{hud.prompt}</p>
        </div>
      ) : null}

      {/* PERFECT STOP */}
      {hud.perfect ? (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
          <p className="display bg-substrate/80 px-6 py-3 text-4xl uppercase text-gold">
            Perfect stop
          </p>
        </div>
      ) : null}

      {/* completion nudge */}
      {hud.done && !hud.receipt ? (
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <button type="button" onClick={onClassic} className="silk-label border border-gold/60 bg-substrate/85 px-3 py-2 text-[0.62rem] text-gold hover:bg-gold/15">
            All done — see the work → Classic site
          </button>
        </div>
      ) : null}

      {/* receipt */}
      {hud.receipt ? (
        <div role="dialog" aria-modal="true" aria-label="Receipt" className="absolute inset-0 z-10 flex items-center justify-center bg-substrate-3/70 p-4">
          <div className="w-full max-w-xs origin-top animate-[receipt_600ms_ease-out] border border-silk/30 bg-[#f4efe2] px-5 py-6 font-mono text-[0.78rem] leading-relaxed text-[#221d18] shadow-2xl">
            <p className="text-center font-bold">{brand.storeName}</p>
            <p className="text-center text-[0.65rem]">{brand.tagline} · LANE 1</p>
            <p className="mt-3 border-t border-dashed border-[#221d18]/40 pt-3">
              {hud.carried ?? "VOLT KOLA"} ……… ${(hud.carriedPrice ?? 1.89).toFixed(2)}
            </p>
            <p>{brand.fuel.productName} × {FUEL_TARGET.toFixed(1)} gal</p>
            <p className="border-b border-dashed border-[#221d18]/40 pb-3">
              CONTACTLESS · APPROVED · AID A0000000031010
            </p>
            <p className="mt-3 text-[0.65rem]">
              Every EMV tap you make at a real pump runs through systems like
              the ones this driver builds.
            </p>
            <p className="mt-2 text-[0.65rem] font-bold">{brand.receiptFooter}</p>
            <div className="mt-4 flex justify-center gap-2">
              <button type="button" onClick={onClassic} className="border border-[#221d18] px-3 py-1.5 text-[0.65rem] font-bold hover:bg-[#221d18] hover:text-[#f4efe2]">
                Classic site
              </button>
              <button
                type="button"
                onClick={() => { setHud((h) => ({ ...h, receipt: false })); G.closePanels?.(); }}
                className="border border-[#221d18]/40 px-3 py-1.5 text-[0.65rem] hover:border-[#221d18]"
              >
                Keep exploring
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* touch controls */}
      {coarse && started ? (
        <>
          <div ref={joyRef} className="absolute bottom-7 left-5 h-24 w-24 touch-none rounded-full border border-silk/25 bg-substrate/60" aria-hidden="true">
            <div ref={knobRef} className="absolute left-1/2 top-1/2 -ml-5 -mt-5 h-10 w-10 rounded-full border border-gold/70 bg-gold/25" />
          </div>
          <div className="absolute bottom-7 right-5 flex gap-2.5">
            <button type="button" className="pad-nc h-14 w-14 rounded-full !p-0 text-lg" onPointerDown={() => (G.touch.brake = 1)} onPointerUp={() => (G.touch.brake = 0)} aria-label="Brake / reverse">▼</button>
            <button type="button" className="pad h-14 w-14 rounded-full !p-0 text-lg" onPointerDown={() => (G.touch.throttle = 1)} onPointerUp={() => (G.touch.throttle = 0)} aria-label="Accelerate">▲</button>
            <button type="button" className="pad-nc h-14 w-14 rounded-full !p-0 text-sm" onPointerDown={() => { G.touch.action = true; G.interact?.(); }} onPointerUp={() => (G.touch.action = false)} aria-label="Interact">⚡</button>
            <button type="button" className="pad-nc h-14 w-14 rounded-full !p-0 text-sm" onClick={() => G.enterExit?.()} aria-label="Enter or exit the car">🚶</button>
          </div>
        </>
      ) : null}
    </div>
  );
}
