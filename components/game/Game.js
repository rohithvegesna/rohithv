"use client";

/*
  NIGHT SHIFT — Store 2A-347, 2:00 a.m.

  A small hand-built low-poly world: you're the on-call engineer walking
  the lot. Every model is procedural (composed primitives, vertex colors,
  merged + instanced). No physics engine — circle/AABB kinematics below.

  Zones open panels that render the SAME section components as the classic
  page. The uplink starts dark; each zone visited relights one link on the
  rooftop dish. 6/6 lights the canopy sign. Nothing is gated.
*/

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useEffect, useRef, useState } from "react";
import AboutSection from "@/components/sections/AboutSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import WorkGrid from "@/components/sections/WorkGrid";
import PublicationsPreview from "@/components/sections/PublicationsPreview";
import PressList from "@/components/sections/PressList";
import ContactSection from "@/components/sections/ContactSection";
import { site } from "@/data/site";

const C = {
  asphalt: 0x1d1813,
  asphalt2: 0x241d17,
  substrate: 0x2a2219,
  substrate3: 0x17120e,
  copper: 0xc9834a,
  copperDim: 0x8a5a34,
  gold: 0xe2b96b,
  goldBright: 0xf0cd85,
  silk: 0xf2ead9,
  led: 0x8fd98f,
  ledOff: 0x3a4438,
  red: 0xe0705a,
  fog: 0x0d0a08,
  sky: 0x0a0807,
};

const ZONES = [
  { id: "experience", label: "Experience", x: 0, z: 4.6, r: 2.6 },
  { id: "about", label: "About", x: -8.2, z: -8.6, r: 2.3 },
  { id: "work", label: "Work", x: -1.5, z: -8.6, r: 2.3 },
  { id: "publications", label: "Publications", x: 4.6, z: -8.6, r: 2.4 },
  { id: "press", label: "Press", x: -5.2, z: -8.2, r: 2.0 },
  { id: "contact", label: "Contact", x: 9.5, z: -2.0, r: 2.3 },
];

const PANELS = {
  about: { title: "About", body: <AboutSection /> },
  experience: { title: "Experience", body: <ExperienceSection /> },
  work: { title: "Selected work", body: <WorkGrid /> },
  publications: { title: "Publications", body: <PublicationsPreview /> },
  press: { title: "Press", body: <PressList HeadingTag="h3" /> },
  contact: { title: "Contact", body: <ContactSection /> },
};

/* ---------- procedural helpers ---------- */

function paint(geometry, hex, jitter = 0) {
  const color = new THREE.Color(hex);
  const count = geometry.attributes.position.count;
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const j = jitter ? (Math.random() - 0.5) * jitter : 0;
    arr[i * 3] = Math.min(1, Math.max(0, color.r + j));
    arr[i * 3 + 1] = Math.min(1, Math.max(0, color.g + j));
    arr[i * 3 + 2] = Math.min(1, Math.max(0, color.b + j));
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  return geometry;
}

function box(w, h, d, hex, x, y, z, ry = 0, jitter = 0) {
  const g = paint(new THREE.BoxGeometry(w, h, d), hex, jitter);
  g.rotateY(ry);
  g.translate(x, y, z);
  return g;
}

function cyl(rt, rb, h, seg, hex, x, y, z) {
  const g = paint(new THREE.CylinderGeometry(rt, rb, h, seg), hex);
  g.translate(x, y, z);
  return g;
}

function signTexture(lit) {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 96;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#0f0c0a";
  ctx.fillRect(0, 0, 512, 96);
  const word = "ROHITHV";
  ctx.font = "700 64px 'Big Shoulders', 'Arial Narrow', sans-serif";
  ctx.textBaseline = "middle";
  let x = 26;
  for (let i = 0; i < word.length; i++) {
    ctx.fillStyle = i < lit ? "#f0cd85" : "#3a3129";
    if (i < lit) {
      ctx.shadowColor = "#e2b96b";
      ctx.shadowBlur = 18;
    } else ctx.shadowBlur = 0;
    ctx.fillText(word[i], x, 52);
    x += ctx.measureText(word[i]).width + 14;
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- the component ---------- */

export default function Game({ active, onClassic }) {
  const hostRef = useRef(null);
  const engineRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [nearZone, setNearZone] = useState(null);
  const [panel, setPanel] = useState(null);
  const [visited, setVisited] = useState([]);
  const [soundOn, setSoundOn] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [moved, setMoved] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const panelRef = useRef(null);
  const audioRef = useRef(null);
  const keyActionsRef = useRef({});

  const done = visited.length >= ZONES.length;

  /* ---------- build the world once ---------- */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    setCoarse(isCoarse);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarse ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = !isCoarse;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(C.sky);
    scene.fog = new THREE.FogExp2(C.fog, 0.026);

    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.5,
      120
    );

    /* lights */
    scene.add(new THREE.AmbientLight(0x453629, 2.6));
    scene.add(new THREE.HemisphereLight(0x332920, 0x0f0c0a, 1.0));
    const key = new THREE.DirectionalLight(0xe2b96b, 1.25);
    key.position.set(-14, 18, 8);
    if (!isCoarse) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -22;
      key.shadow.camera.right = 22;
      key.shadow.camera.top = 22;
      key.shadow.camera.bottom = -22;
    }
    scene.add(key);
    for (const gx of [-3.2, 3.2]) {
      const g = new THREE.PointLight(0xe2b96b, 120, 24, 1.8);
      g.position.set(gx, 4.3, 4.6);
      scene.add(g);
    }
    const storeGlow = new THREE.PointLight(0xd9a75e, 60, 18, 1.8);
    storeGlow.position.set(0, 2.4, -7.4);
    scene.add(storeGlow);

    /* ---------- static world, merged ---------- */
    const statics = [];

    // ground: lot + surround
    const ground = paint(new THREE.PlaneGeometry(90, 90, 24, 24), 0x1f1a15, 0.016);
    ground.rotateX(-Math.PI / 2);
    statics.push(ground);
    const lotPad = paint(new THREE.BoxGeometry(34, 0.08, 26), 0x2e2620, 0.012);
    lotPad.translate(0, 0.04, -1);
    statics.push(lotPad);

    // canopy island: 4 columns + slab + pump bases
    for (const cx of [-5.5, 5.5]) {
      for (const cz of [2.6, 6.6]) {
        statics.push(box(0.45, 4.6, 0.45, C.substrate, cx, 2.3, cz));
      }
    }
    statics.push(box(16, 0.7, 7.5, C.substrate, 0, 4.95, 4.6));
    statics.push(box(16.3, 0.16, 0.24, C.copper, 0, 5.0, 8.47));
    statics.push(box(16.3, 0.16, 0.24, C.copper, 0, 5.0, 0.73));
    statics.push(box(0.24, 0.16, 7.8, C.copper, -8.12, 5.0, 4.6));
    statics.push(box(0.24, 0.16, 7.8, C.copper, 8.12, 5.0, 4.6));
    statics.push(box(9, 0.25, 2.2, 0x332a22, 0, 0.13, 4.6, 0, 0.01));

    // store building
    statics.push(box(17, 4.2, 7, C.substrate, 0, 2.1, -12));
    statics.push(box(17.4, 0.3, 7.4, C.substrate3, 0, 4.35, -12));
    statics.push(box(17.4, 0.18, 0.5, C.copper, 0, 3.6, -8.35));
    // door (About)
    statics.push(box(1.5, 2.6, 0.18, C.substrate3, -8.2, 1.3, -8.45));
    statics.push(box(1.9, 0.16, 0.8, C.copper, -8.2, 2.75, -8.25));
    // rack annex window frame (Work)
    statics.push(box(3.4, 2.4, 0.18, C.substrate3, -1.5, 1.55, -8.45));
    // kiosk (Contact)
    statics.push(box(2.2, 3, 2.2, C.substrate, 9.5, 1.5, -4.4));
    statics.push(box(2.5, 0.18, 2.5, C.copper, 9.5, 3.05, -4.4));
    // news rack (Press)
    statics.push(box(1.3, 1.1, 0.6, C.substrate3, -5.2, 0.55, -8.1));
    // dish mast (Publications) on the roof, marker at ground ladder
    statics.push(cyl(0.12, 0.16, 3.4, 6, C.substrate3, 4.6, 6.1, -11.4));
    statics.push(box(0.5, 3.6, 0.14, C.substrate3, 4.6, 2.0, -8.45)); // ladder rails
    for (let i = 0; i < 7; i++)
      statics.push(box(0.5, 0.07, 0.05, C.copper, 4.6, 0.6 + i * 0.5, -8.42));
    // van (set dressing)
    statics.push(box(4.2, 1.7, 1.9, C.substrate, -13.5, 0.85, 3.5, 0.35));
    statics.push(box(1.3, 1.1, 1.86, C.substrate3, -11.9, 2.0 - 0.85, 3.0, 0.35));
    // light poles
    for (const [px, pz] of [[-16, 10], [16, 10]]) {
      statics.push(cyl(0.09, 0.12, 6, 6, C.substrate3, px, 3, pz));
      statics.push(box(1.4, 0.15, 0.4, C.substrate3, px, 6, pz));
    }

    const staticMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const staticMesh = new THREE.Mesh(mergeGeometries(statics, false), staticMat);
    staticMesh.receiveShadow = !isCoarse;
    staticMesh.castShadow = !isCoarse;
    scene.add(staticMesh);

    /* ---------- emissive fixtures, merged ---------- */
    const glows = [];
    // canopy underside
    const under = paint(new THREE.PlaneGeometry(15.4, 6.9), C.gold);
    under.rotateX(Math.PI / 2);
    under.translate(0, 4.58, 4.6);
    glows.push(under);
    // store window strip
    glows.push(box(9.5, 1.7, 0.06, 0xe8c98a, 1.6, 2.0, -8.44));
    // kiosk screen
    glows.push(box(0.9, 0.7, 0.05, 0xd9ecd0, 9.5, 1.9, -3.28));
    // pole lamps
    glows.push(box(1.2, 0.08, 0.3, C.silk, -16, 5.92, 10));
    glows.push(box(1.2, 0.08, 0.3, C.silk, 16, 5.92, 10));
    const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
    scene.add(new THREE.Mesh(mergeGeometries(glows, false), glowMat));

    /* ---------- dispensers (instanced) ---------- */
    const pumpGeo = mergeGeometries(
      [
        box(1.0, 1.7, 0.62, C.substrate, 0, 1.15, 0),
        box(1.06, 0.14, 0.68, C.copper, 0, 2.05, 0),
        box(0.5, 0.4, 0.66, C.substrate3, -0.2, 1.35, 0),
        box(1.2, 0.3, 0.8, C.asphalt2, 0, 0.15, 0),
      ],
      false
    );
    const pumpMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const pumps = new THREE.InstancedMesh(pumpGeo, pumpMat, 4);
    const pumpPos = [
      [-3.4, 3.4], [-3.4, 5.8], [3.4, 3.4], [3.4, 5.8],
    ];
    const m4 = new THREE.Matrix4();
    pumpPos.forEach(([px, pz], i) => {
      m4.makeRotationY(px < 0 ? Math.PI / 2 : -Math.PI / 2);
      m4.setPosition(px, 0, pz);
      pumps.setMatrixAt(i, m4);
    });
    pumps.castShadow = !isCoarse;
    scene.add(pumps);
    // pump screens (emissive)
    const screenGeo = paint(new THREE.PlaneGeometry(0.4, 0.28), 0xbfe6b4);
    const screens = new THREE.InstancedMesh(
      screenGeo,
      new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
      4
    );
    pumpPos.forEach(([px, pz], i) => {
      m4.makeRotationY(px < 0 ? Math.PI / 2 : -Math.PI / 2);
      m4.setPosition(px + (px < 0 ? 0.33 : -0.33), 1.55, pz + 0.18);
      screens.setMatrixAt(i, m4);
    });
    scene.add(screens);

    /* ---------- bollards (instanced) ---------- */
    const bolGeo = mergeGeometries(
      [cyl(0.09, 0.11, 0.9, 6, C.substrate3, 0, 0.45, 0), cyl(0.1, 0.1, 0.12, 6, C.copper, 0, 0.95, 0)],
      false
    );
    const bollards = new THREE.InstancedMesh(
      bolGeo,
      new THREE.MeshLambertMaterial({ vertexColors: true }),
      8
    );
    const bolPos = [
      [-7.6, 2.0], [-7.6, 7.2], [7.6, 2.0], [7.6, 7.2],
      [-10.6, -7.2], [11.2, -7.2], [7.4, -3.2], [-13.2, -7.2],
    ];
    bolPos.forEach(([px, pz], i) => {
      m4.identity();
      m4.setPosition(px, 0, pz);
      bollards.setMatrixAt(i, m4);
    });
    scene.add(bollards);

    /* ---------- dish + uplink LEDs + beam ---------- */
    const dish = new THREE.Mesh(
      paint(new THREE.SphereGeometry(1.1, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2.6), C.substrate),
      new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })
    );
    dish.rotation.x = -Math.PI / 3.2;
    dish.position.set(4.6, 7.9, -11.4);
    scene.add(dish);

    const linkGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const linkMats = [];
    const links = new THREE.Group();
    for (let i = 0; i < ZONES.length; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: C.ledOff, toneMapped: false });
      linkMats.push(mat);
      const s = new THREE.Mesh(linkGeo, mat);
      s.position.set(4.6, 4.9 + i * 0.42, -11.15);
      links.add(s);
    }
    scene.add(links);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.34, 40, 8, 1, true),
      new THREE.MeshBasicMaterial({
        color: C.goldBright,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    beam.position.set(4.6, 28, -11.4);
    scene.add(beam);

    /* ---------- canopy sign ---------- */
    let signTex = signTexture(0);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: false, toneMapped: false });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.15), signMat);
    sign.position.set(0, 5.0, 8.42);
    scene.add(sign);
    const signBack = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.15), signMat.clone());
    signBack.rotation.y = Math.PI;
    signBack.position.set(0, 5.0, 8.41);
    scene.add(signBack);

    /* ---------- rack LEDs (blink) ---------- */
    const rackLedGeo = paint(new THREE.PlaneGeometry(0.09, 0.05), C.led);
    const rackLeds = new THREE.InstancedMesh(
      rackLedGeo,
      new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true }),
      10
    );
    for (let i = 0; i < 10; i++) {
      m4.identity();
      m4.setPosition(-2.4 + (i % 2) * 0.5 + 0.2, 0.7 + Math.floor(i / 2) * 0.36, -8.43);
      rackLeds.setMatrixAt(i, m4);
    }
    scene.add(rackLeds);

    /* ---------- stars ---------- */
    const starPos = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.random() * Math.PI * 0.42;
      const r = 70;
      starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      starPos[i * 3 + 1] = r * Math.cos(ph) + 4;
      starPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xcfc6b4, size: 0.16, sizeAttenuation: true })
    );
    scene.add(stars);

    /* ---------- zone rings ---------- */
    const ringGeo = new THREE.TorusGeometry(1.0, 0.055, 8, 40);
    ringGeo.rotateX(Math.PI / 2);
    const rings = new Map();
    for (const z of ZONES) {
      const mat = new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.95, toneMapped: false });
      const ring = new THREE.Mesh(ringGeo, mat);
      ring.position.set(z.x, 0.09, z.z);
      ring.scale.setScalar(z.r * 0.55);
      scene.add(ring);
      rings.set(z.id, ring);
    }

    /* ---------- player ---------- */
    const player = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const bodyGeo = mergeGeometries(
      [
        (() => { const g = paint(new THREE.CapsuleGeometry(0.32, 0.55, 3, 8), 0x4a3d31); g.translate(0, 0.88, 0); return g; })(),
        box(0.6, 0.22, 0.46, C.gold, 0, 1.02, 0),
        (() => { const g = paint(new THREE.SphereGeometry(0.21, 10, 10), 0xd9b490); g.translate(0, 1.62, 0); return g; })(),
        (() => { const g = paint(new THREE.SphereGeometry(0.225, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.1), C.copper); g.translate(0, 1.67, 0); return g; })(),
        box(0.5, 0.06, 0.5, C.copper, 0, 1.72, 0.06),
      ],
      false
    );
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = !isCoarse;
    player.add(bodyMesh);
    player.position.set(4, 0, 15);
    scene.add(player);

    /* ---------- collisions ---------- */
    const circles = [
      ...pumpPos.map(([px, pz]) => ({ x: px, z: pz, r: 0.85 })),
      ...[[-5.5, 2.6], [-5.5, 6.6], [5.5, 2.6], [5.5, 6.6]].map(([px, pz]) => ({ x: px, z: pz, r: 0.5 })),
      ...bolPos.map(([px, pz]) => ({ x: px, z: pz, r: 0.28 })),
      { x: 9.5, z: -4.4, r: 1.6 },
      { x: -13.5, z: 3.5, r: 2.4 },
      { x: -16, z: 10, r: 0.35 }, { x: 16, z: 10, r: 0.35 },
    ];
    const storeBox = { minX: -8.9, maxX: 8.9, minZ: -15.8, maxZ: -8.2 };

    /* ---------- input ---------- */
    const keys = new Set();
    const joy = { active: false, dx: 0, dz: 0 };
    const onKeyDown = (e) => {
      if (e.repeat) return;
      const acts = engine.keyActions?.current;
      if (e.key === "Escape") return acts?.escape();
      if (e.code === "KeyE" || e.key === "Enter") return acts?.interact();
      if (e.code === "KeyM") return acts?.sound();
      keys.add(e.code);
      engine.onFirstInput?.();
    };
    const onKeyUp = (e) => keys.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    /* ---------- loop state ---------- */
    const vel = new THREE.Vector2(0, 0);
    const camTarget = new THREE.Vector3();
    const camPos = new THREE.Vector3(12.5, 8, 23.5);
    camera.position.copy(camPos);
    let facing = 0;
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let fpsAt = last;

    const engine = {
      renderer, scene, camera, keys, joy, rings, linkMats, beam, sign, signBack,
      paused: false, nearId: null, visitedCount: 0,
      onFirstInput: null,
      setSign(n) {
        signTex.dispose();
        signTex = signTexture(Math.ceil((7 * n) / ZONES.length));
        signMat.map = signTex;
        signBack.material.map = signTex;
        signMat.needsUpdate = true;
        signBack.material.needsUpdate = true;
      },
    };
    engine.keyActions = keyActionsRef;
    engineRef.current = engine;

    const clampPlayer = (nx, nz) => {
      // world bounds
      nx = Math.max(-24, Math.min(24, nx));
      nz = Math.max(-7.0, Math.min(20, nz)) === nz ? nz : nz; // placeholder, store handled below
      nz = Math.max(-16.5, Math.min(20, nz));
      // store building AABB (walk around, not through)
      if (nx > storeBox.minX - 0.4 && nx < storeBox.maxX + 0.4 && nz > storeBox.minZ - 0.4 && nz < storeBox.maxZ + 0.4) {
        const dxMin = Math.abs(nx - (storeBox.minX - 0.4));
        const dxMax = Math.abs(storeBox.maxX + 0.4 - nx);
        const dzMax = Math.abs(storeBox.maxZ + 0.4 - nz);
        const dzMin = Math.abs(nz - (storeBox.minZ - 0.4));
        const m = Math.min(dxMin, dxMax, dzMax, dzMin);
        if (m === dzMax) nz = storeBox.maxZ + 0.4;
        else if (m === dxMin) nx = storeBox.minX - 0.4;
        else if (m === dxMax) nx = storeBox.maxX + 0.4;
        else nz = storeBox.minZ - 0.4;
      }
      // prop circles
      for (const c of circles) {
        const dx = nx - c.x;
        const dz = nz - c.z;
        const rr = c.r + 0.42;
        const d2 = dx * dx + dz * dz;
        if (d2 < rr * rr && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          nx = c.x + (dx / d) * rr;
          nz = c.z + (dz / d) * rr;
        }
      }
      return [nx, nz];
    };

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      frames++;
      if (now - fpsAt > 1000) {
        window.__nsFps = frames;
        frames = 0;
        fpsAt = now;
      }

      // input → desired dir (screen-relative: up = away from camera)
      let ix = 0, iz = 0;
      if (keys.has("KeyW") || keys.has("ArrowUp")) iz -= 1;
      if (keys.has("KeyS") || keys.has("ArrowDown")) iz += 1;
      if (keys.has("KeyA") || keys.has("ArrowLeft")) ix -= 1;
      if (keys.has("KeyD") || keys.has("ArrowRight")) ix += 1;
      if (joy.active) { ix = joy.dx; iz = joy.dz; }
      // rotate input 45° so "up" walks up-left along the camera diagonal
      const ang = -Math.PI / 4;
      const dx = ix * Math.cos(ang) - iz * Math.sin(ang);
      const dz = ix * Math.sin(ang) + iz * Math.cos(ang);
      const len = Math.hypot(dx, dz);
      const max = 4.4;
      if (len > 0.01) {
        vel.x += (dx / Math.max(1, len)) * 26 * dt;
        vel.y += (dz / Math.max(1, len)) * 26 * dt;
        engine.onFirstInput?.();
      }
      const sp = vel.length();
      if (sp > max) vel.multiplyScalar(max / sp);
      const damp = Math.exp(-7 * dt);
      if (len <= 0.01) vel.multiplyScalar(damp);

      let [nx, nz] = clampPlayer(
        player.position.x + vel.x * dt,
        player.position.z + vel.y * dt
      );
      player.position.x = nx;
      player.position.z = nz;
      if (sp > 0.4) {
        const target = Math.atan2(vel.x, vel.y);
        let d = target - facing;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        facing += d * Math.min(1, 12 * dt);
        player.rotation.y = facing;
        bodyMesh.position.y = Math.abs(Math.sin(now * 0.012)) * 0.05;
      } else {
        bodyMesh.position.y *= damp;
      }

      // camera follow with lag
      camTarget.set(player.position.x + 8.5, 8, player.position.z + 8.5);
      camPos.lerp(camTarget, Math.min(1, 3.2 * dt));
      camera.position.copy(camPos);
      camera.lookAt(player.position.x, 1.2, player.position.z - 0.5);

      // zone proximity
      let near = null;
      for (const z of ZONES) {
        const d = Math.hypot(player.position.x - z.x, player.position.z - z.z);
        if (d < z.r) { near = z; break; }
      }
      if ((near?.id ?? null) !== engine.nearId) {
        engine.nearId = near?.id ?? null;
        setNearZone(near ? { id: near.id, label: near.label } : null);
      }

      // ring pulse
      const pulse = 1 + Math.sin(now * 0.004) * 0.07;
      for (const [, ring] of rings) ring.scale.setScalar(ring.userData.base ?? ring.scale.x);
      for (const z of ZONES) {
        const ring = rings.get(z.id);
        if (!ring.userData.base) ring.userData.base = ring.scale.x;
        ring.scale.setScalar(ring.userData.base * (engine.nearId === z.id ? pulse * 1.12 : pulse));
      }

      // rack led blink
      rackLeds.material.opacity = 0.55 + 0.45 * ((Math.sin(now * 0.006) > 0.2) ? 1 : 0.2);

      // beam swell once done
      if (engine.visitedCount >= ZONES.length && beam.material.opacity < 0.16)
        beam.material.opacity += dt * 0.08;

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        cancelAnimationFrame(raf);
        engine.paused = true;
      } else if (engine.paused && !engine.panelOpen) {
        engine.paused = false;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    engine.stop = () => { cancelAnimationFrame(raf); engine.paused = true; };
    engine.resume = () => {
      if (!engine.paused) return;
      engine.paused = false;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    engine.resetPos = () => { player.position.set(4, 0, 15); vel.set(0, 0); };
    engine.teleport = (x, z) => { player.position.set(x, 0, z); vel.set(0, 0); };
    window.__ns = engine;

    setReady(true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        if (o.material) {
          for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
            m.map?.dispose?.();
            m.dispose?.();
          }
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      engineRef.current = null;
    };
  }, []);

  /* ---------- pause/resume with panel + active ---------- */
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.panelOpen = Boolean(panel) || helpOpen;
    if (!active || panel || helpOpen) engine.stop();
    else engine.resume();
  }, [active, panel, helpOpen, ready]);

  /* ---------- audio (off by default, created on first enable) ---------- */
  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    const hum = ctx.createGain();
    hum.gain.value = 0.02;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 220;
    for (const f of [55, 55.6]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.connect(lp);
      o.start();
    }
    lp.connect(hum);
    hum.connect(master);
    audioRef.current = { ctx, master };
    return audioRef.current;
  };
  const toggleSound = () => {
    setSoundOn((on) => {
      const next = !on;
      const a = ensureAudio();
      a.ctx.resume();
      a.master.gain.linearRampToValueAtTime(next ? 1 : 0, a.ctx.currentTime + 0.2);
      return next;
    });
  };
  const note = (freq, t0, dur, type = "square", gain = 0.05) => {
    const a = audioRef.current;
    if (!a || !soundOn) return;
    const o = a.ctx.createOscillator();
    const g = a.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, a.ctx.currentTime + t0);
    g.gain.linearRampToValueAtTime(gain, a.ctx.currentTime + t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, a.ctx.currentTime + t0 + dur);
    o.connect(g);
    g.connect(a.master);
    o.start(a.ctx.currentTime + t0);
    o.stop(a.ctx.currentTime + t0 + dur + 0.05);
  };
  const blip = () => { note(660, 0, 0.09); note(880, 0.07, 0.1); };
  const chime = () => { note(523, 0, 0.16, "triangle", 0.07); note(659, 0.14, 0.16, "triangle", 0.07); note(784, 0.28, 0.3, "triangle", 0.07); };

  /* ---------- zone visit ---------- */
  const openZone = (id) => {
    setPanel(id);
    blip();
    setVisited((v) => {
      if (v.includes(id)) return v;
      const nv = [...v, id];
      const engine = engineRef.current;
      if (engine) {
        engine.visitedCount = nv.length;
        engine.linkMats[nv.length - 1]?.color.set(0x8fd98f);
        engine.rings.get(id)?.material.color.set(0x8fd98f);
        engine.setSign(nv.length);
        if (nv.length === ZONES.length) chime();
      }
      return nv;
    });
  };

  /* ---------- keyboard actions (dispatched by the world's listener) ---------- */
  useEffect(() => {
    keyActionsRef.current = {
    interact: () => {
      if (active && !panel && !helpOpen && nearZone) openZone(nearZone.id);
    },
    escape: () => {
      if (!active) return;
      if (panel) setPanel(null);
      if (helpOpen) setHelpOpen(false);
    },
    sound: () => {
      if (active) toggleSound();
    },
    };
  });

  /* ---------- first input hides onboarding ---------- */
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.onFirstInput = () => {
      if (!moved) setMoved(true);
      engine.onFirstInput = null;
    };
  }, [ready, moved]);

  /* ---------- focus management for panels ---------- */
  useEffect(() => {
    if (panel && panelRef.current) {
      const el = panelRef.current.querySelector("button");
      el?.focus();
    }
  }, [panel]);

  /* ---------- joystick (touch) ---------- */
  const joyRef = useRef(null);
  const knobRef = useRef(null);
  useEffect(() => {
    const zone = joyRef.current;
    const knob = knobRef.current;
    const engine = engineRef.current;
    if (!zone || !knob || !engine) return;
    let pid = null;
    const R = 44;
    const set = (dx, dz) => {
      engine.joy.dx = dx;
      engine.joy.dz = dz;
      knob.style.transform = `translate(${dx * R}px, ${dz * R}px)`;
    };
    const down = (e) => {
      pid = e.pointerId;
      zone.setPointerCapture(pid);
      engine.joy.active = true;
      move(e);
    };
    const move = (e) => {
      if (pid === null || e.pointerId !== pid) return;
      const rect = zone.getBoundingClientRect();
      let dx = (e.clientX - rect.left - rect.width / 2) / R;
      let dz = (e.clientY - rect.top - rect.height / 2) / R;
      const l = Math.hypot(dx, dz);
      if (l > 1) { dx /= l; dz /= l; }
      set(dx, dz);
    };
    const up = () => {
      pid = null;
      engine.joy.active = false;
      set(0, 0);
    };
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
  }, [ready, coarse]);

  const pc = PANELS[panel];

  return (
    <div className="fixed inset-0 z-[80] bg-substrate" role="application" aria-label="NIGHT SHIFT — interactive portfolio. Press question mark for help.">
      <div ref={hostRef} className="absolute inset-0" />

      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="silk-label flex items-center gap-3 text-silk-muted">
            <span className="led led-on pulse-none" aria-hidden="true" />
            Loading the lot…
          </p>
        </div>
      ) : null}

      {/* HUD — top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="max-w-[60vw]">
          <p className="silk-label bg-substrate/80 px-2.5 py-1.5 text-silk">
            {site.name}
          </p>
          <p className="silk-label mt-1 hidden bg-substrate/80 px-2.5 py-1.5 text-[0.6rem] text-silk-muted sm:block">
            {site.role} · {site.company}
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button type="button" onClick={toggleSound} className="silk-label border border-silk/25 bg-substrate/80 px-2.5 py-1.5 text-silk-muted transition-colors hover:border-gold hover:text-silk" aria-pressed={soundOn}>
            {soundOn ? "Sound on" : "Sound off"}
          </button>
          <button type="button" onClick={() => setHelpOpen(true)} className="silk-label border border-silk/25 bg-substrate/80 px-2.5 py-1.5 text-silk-muted transition-colors hover:border-gold hover:text-silk">
            Help
          </button>
          <button type="button" onClick={onClassic} className="silk-label border border-gold/60 bg-substrate/80 px-2.5 py-1.5 text-gold transition-colors hover:border-gold hover:bg-gold/10">
            Classic site
          </button>
        </div>
      </div>

      {/* objective */}
      <div className="pointer-events-none absolute left-3 top-16 sm:left-4 sm:top-20">
        <p className="silk-label bg-substrate/80 px-2.5 py-1.5 text-[0.62rem] text-silk-muted">
          {done ? (
            <span className="text-led">Uplink restored — thanks for stopping by.</span>
          ) : (
            <>Store 2A-347 · uplink dark · visit all 6 stations</>
          )}
        </p>
        <p className="silk-label mt-1 inline-block bg-substrate/80 px-2.5 py-1.5 text-[0.62rem] text-gold">
          {visited.length}/6 visited
        </p>
      </div>

      {/* onboarding */}
      {ready && !moved && visited.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center sm:bottom-24">
          <div className="silk-label bg-substrate/85 px-4 py-3 text-center leading-relaxed text-silk">
            {coarse ? "Drag the stick to walk" : "WASD / arrows — walk"}
            <span className="mx-2 text-silk-faint">·</span>
            walk to a glowing ring
          </div>
        </div>
      ) : null}

      {/* interact hint / button */}
      {nearZone && !panel ? (
        <div className="absolute inset-x-0 bottom-10 flex justify-center">
          <button
            type="button"
            onClick={() => openZone(nearZone.id)}
            className="pad flex items-center gap-2.5"
          >
            {!coarse ? (
              <kbd className="rounded-[2px] border border-substrate/40 px-1.5 text-[0.7rem]">E</kbd>
            ) : null}
            Open {nearZone.label}
          </button>
        </div>
      ) : null}

      {/* joystick */}
      {coarse && ready ? (
        <div
          ref={joyRef}
          className="absolute bottom-8 left-6 h-28 w-28 touch-none rounded-full border border-silk/25 bg-substrate/60"
          aria-hidden="true"
        >
          <div
            ref={knobRef}
            className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full border border-gold/70 bg-gold/25"
          />
        </div>
      ) : null}

      {/* content panel */}
      {pc ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={pc.title}
          className="absolute inset-0 z-10 flex items-center justify-center bg-substrate-3/80 p-3 sm:p-8"
        >
          <div className="flex max-h-full w-full max-w-3xl flex-col border border-gold/60 bg-substrate">
            <div className="flex items-center justify-between border-b border-silk/15 px-5 py-3">
              <h2 className="section-h !text-xl after:!hidden">{pc.title}</h2>
              <button
                type="button"
                onClick={() => setPanel(null)}
                className="silk-label border border-silk/25 px-2.5 py-1.5 text-silk-muted transition-colors hover:border-gold hover:text-silk"
              >
                Close · Esc
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
              {pc.body}
            </div>
          </div>
        </div>
      ) : null}

      {/* help */}
      {helpOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Help"
          className="absolute inset-0 z-10 flex items-center justify-center bg-substrate-3/80 p-4"
        >
          <div className="w-full max-w-md border border-gold/60 bg-substrate p-6">
            <h2 className="section-h !text-xl after:!hidden">Help</h2>
            <ul className="mt-5 space-y-2.5 font-mono text-sm text-silk-muted">
              <li>{coarse ? "Drag the stick — walk" : "WASD / arrows — walk"}</li>
              <li>{coarse ? "Tap the gold button — open a station" : "E — open a station"}</li>
              <li>Esc — close panels</li>
              <li>M — sound on / off</li>
              <li>Visit all 6 stations to restore the uplink.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => { engineRef.current?.resetPos(); setHelpOpen(false); }}
                className="pad-nc"
              >
                Reset position
              </button>
              <button type="button" onClick={() => setHelpOpen(false)} className="pad">
                Back to the lot
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
