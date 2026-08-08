/* The station world: night lot, canopy, pumps, store shell + interior.
   PBR materials, crafted edges (RoundedBox), emissives for bloom. Returns
   scene refs + collider descriptors for physics. */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  signTexture,
  stripeTexture,
  priceBoardTexture,
  productLabelTexture,
  pumpScreenTexture,
  asphaltRoughness,
  products,
  brand,
} from "./texgen";

export const BLOOM_LAYER = 1;

const M = {
  paint: (color, opts = {}) =>
    new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.1,
      roughness: 0.55,
      clearcoat: 0,
      ...opts,
    }),
  metal: (color, rough = 0.35) =>
    new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: rough }),
  plastic: (color, rough = 0.5) =>
    new THREE.MeshStandardMaterial({ color, metalness: 0.05, roughness: rough }),
  emissive: (color, intensity = 2.2, base = 0x111111) =>
    new THREE.MeshStandardMaterial({
      color: base,
      emissive: color,
      emissiveIntensity: intensity,
    }),
};

function rbox(w, h, d, r, mat, x, y, z, ry = 0) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true;
  return m;
}

function glow(mesh) {
  mesh.layers.enable(BLOOM_LAYER);
  return mesh;
}

export function buildWorld(scene, quality) {
  const colliders = []; // {x,y,z,hx,hy,hz,ry}
  const addCol = (x, y, z, hx, hy, hz, ry = 0) =>
    colliders.push({ x, y, z, hx, hy, hz, ry });

  /* ---------- ground ---------- */
  const rough = asphaltRoughness();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220, 1, 1),
    new THREE.MeshStandardMaterial({
      color: 0x191512,
      roughness: 1,
      roughnessMap: rough,
      metalness: 0.12,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // approach road with lane paint
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 150),
    new THREE.MeshStandardMaterial({
      color: 0x14110e,
      roughness: 0.95,
      roughnessMap: rough,
      metalness: 0.15,
    })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, 55);
  road.receiveShadow = true;
  scene.add(road);
  const laneGeo = new THREE.PlaneGeometry(0.22, 3.2);
  const laneMat = new THREE.MeshStandardMaterial({ color: 0xcfc6a8, roughness: 0.8 });
  const lanes = new THREE.InstancedMesh(laneGeo, laneMat, 18);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 18; i++) {
    m4.makeRotationX(-Math.PI / 2);
    m4.setPosition(0, 0.02, 14 + i * 7);
    lanes.setMatrixAt(i, m4);
  }
  lanes.receiveShadow = true;
  scene.add(lanes);

  // station apron (lighter concrete)
  const apron = new THREE.Mesh(
    new THREE.PlaneGeometry(58, 40),
    new THREE.MeshStandardMaterial({
      color: 0x24201b,
      roughness: 0.9,
      roughnessMap: rough,
      metalness: 0.08,
    })
  );
  apron.rotation.x = -Math.PI / 2;
  apron.position.set(0, 0.015, -12);
  apron.receiveShadow = true;
  scene.add(apron);

  /* ---------- canopy ---------- */
  const canopy = new THREE.Group();
  const colMat = M.paint(0xd8d2c6, { roughness: 0.4, metalness: 0.3 });
  for (const cx of [-8, 8]) {
    for (const cz of [-6, 2]) {
      canopy.add(rbox(0.55, 6.4, 0.55, 0.06, colMat, cx, 3.2, cz));
      addCol(cx, 3.2, cz, 0.35, 3.2, 0.35);
    }
  }
  const slab = rbox(24, 1.1, 13, 0.1, M.paint(0x2a2622, { roughness: 0.5 }), 0, 6.9, -2);
  canopy.add(slab);
  // brand stripe band around the fascia
  const band = new THREE.Mesh(
    new THREE.BoxGeometry(24.2, 0.9, 13.2),
    new THREE.MeshStandardMaterial({ map: stripeTexture(), roughness: 0.4 })
  );
  band.position.set(0, 6.9, -2);
  canopy.add(band);
  // under-canopy light housings
  const lightMat = M.emissive(0xffe9c4, 3.0);
  for (const lx of [-5.5, 0, 5.5]) {
    for (const lz of [-5.5, 1.5]) {
      canopy.add(glow(rbox(1.6, 0.12, 0.8, 0.03, lightMat, lx, 6.32, lz)));
    }
  }
  scene.add(canopy);

  /* ---------- pumps (two islands, four bays) ---------- */
  const pumpGroup = new THREE.Group();
  const pumpBodyMat = M.paint(0xe8e2d6, { roughness: 0.35, clearcoat: 0.4 });
  const pumpDarkMat = M.plastic(0x1c1916, 0.45);
  const screenMat = new THREE.MeshStandardMaterial({
    map: pumpScreenTexture(["NITE-SEVEN", "READY", "LIFT NOZZLE"]),
    emissive: 0x9fe89f,
    emissiveIntensity: 0.55,
    emissiveMap: pumpScreenTexture(["NITE-SEVEN", "READY", "LIFT NOZZLE"]),
  });
  const readerMat = M.emissive(0x4aa3ff, 1.6, 0x101418);
  const pumpBays = [];
  for (const px of [-4.5, 4.5]) {
    // island curb
    const island = rbox(2.6, 0.24, 9.5, 0.05, M.plastic(0x3a352f, 0.85), px, 0.12, -2);
    pumpGroup.add(island);
    addCol(px, 0.35, -2, 1.3, 0.35, 4.75);
    // dispenser
    const disp = new THREE.Group();
    disp.position.set(px, 0, -2);
    disp.add(rbox(1.7, 2.3, 0.85, 0.07, pumpBodyMat, 0, 1.4, 0));
    disp.add(rbox(1.78, 0.5, 0.93, 0.05, pumpDarkMat, 0, 0.45, 0));
    // stripe crown
    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(1.78, 0.34, 0.93),
      new THREE.MeshStandardMaterial({ map: stripeTexture(), roughness: 0.45 })
    );
    crown.position.y = 2.68;
    disp.add(crown);
    for (const side of [-1, 1]) {
      // screen
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.48), screenMat);
      scr.position.set(0.2 * side, 1.72, side * 0.44);
      scr.rotation.y = side < 0 ? Math.PI : 0;
      disp.add(glow(scr));
      // card reader (the EMV signature — keypad + tap pad + slot)
      const reader = new THREE.Group();
      reader.position.set(-0.42 * side, 1.5, side * 0.445);
      reader.rotation.y = side < 0 ? Math.PI : 0;
      const pad = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), readerMat.clone());
      pad.position.y = 0.1;
      reader.add(glow(pad));
      const slot = rbox(0.24, 0.035, 0.03, 0.01, M.metal(0x888888), 0, -0.04, 0.01);
      reader.add(slot);
      disp.add(reader);
      if (side === 1) disp.userData.reader = pad;
      // nozzle + hose
      const noz = rbox(0.12, 0.3, 0.18, 0.03, M.plastic(0x111010, 0.35), 0.62, 1.15, side * 0.34);
      disp.add(noz);
      const hosePts = [
        new THREE.Vector3(0.62, 1.0, side * 0.34),
        new THREE.Vector3(0.85, 0.55, side * 0.3),
        new THREE.Vector3(0.8, 1.7, side * 0.2),
      ];
      const hose = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hosePts), 16, 0.035, 6),
        M.plastic(0x0d0c0b, 0.6)
      );
      disp.add(hose);
    }
    pumpGroup.add(disp);
    addCol(px, 1.4, -2, 0.9, 1.15, 0.5);
    // bay markers (stop zones either side of island)
    for (const side of [-1, 1]) {
      pumpBays.push({
        x: px + side * 2.6,
        z: -2,
        heading: Math.PI, // face north
        dispenser: disp,
      });
    }
  }
  scene.add(pumpGroup);

  /* ---------- price board ---------- */
  const board = new THREE.Group();
  board.position.set(-16, 0, 16);
  const pole = rbox(0.5, 7.5, 0.5, 0.05, M.metal(0x3c3835, 0.5), 0, 3.75, 0);
  board.add(pole);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 5.5),
    new THREE.MeshStandardMaterial({
      map: priceBoardTexture(),
      emissive: 0xffffff,
      emissiveMap: priceBoardTexture(),
      emissiveIntensity: 0.75,
    })
  );
  face.position.set(0, 7.2, 0.26);
  face.rotation.y = Math.PI * 0.08;
  board.add(glow(face));
  const back = rbox(4.6, 5.7, 0.3, 0.06, M.plastic(0x191613), 0, 7.2, 0, Math.PI * 0.08);
  board.add(back);
  scene.add(board);
  addCol(-16, 3.75, 16, 0.4, 3.75, 0.4);

  /* ---------- store ---------- */
  const store = new THREE.Group();
  const SW = 26, SD = 12, SH = 4.6, SZ = -22; // store front at z = SZ+SD/2 = -16
  const wallMat = M.paint(0x8d867b, { roughness: 0.7 });
  const front = SZ + SD / 2;
  // walls (leave a door gap centered at x=0, width 3.4)
  const wallL = rbox(SW / 2 - 4.2, SH, 0.4, 0.05, wallMat, -(SW / 4 + 2.1), SH / 2, front);
  const wallR = rbox(SW / 2 - 4.2, SH, 0.4, 0.05, wallMat, SW / 4 + 2.1, SH / 2, front);
  store.add(wallL, wallR);
  addCol(-(SW / 4 + 2.1), SH / 2, front, SW / 4 - 2.1, SH / 2, 0.2);
  addCol(SW / 4 + 2.1, SH / 2, front, SW / 4 - 2.1, SH / 2, 0.2);
  // glass strip on the front walls
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x8fb0a8,
    transparent: true,
    opacity: 0.32,
    roughness: 0.08,
    metalness: 0,
    emissive: 0xffd9a0,
    emissiveIntensity: 0.22,
  });
  store.add(rbox(SW - 8.4, 1.9, 0.1, 0.02, glassMat, 0, 2.6, front + 0.05));
  // door frame + sliding doors
  const doorL = rbox(1.7, 3.0, 0.08, 0.02, glassMat.clone(), -0.85, 1.5, front);
  const doorR = rbox(1.7, 3.0, 0.08, 0.02, glassMat.clone(), 0.85, 1.5, front);
  store.add(doorL, doorR);
  // header sign above the door
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 2.5),
    new THREE.MeshStandardMaterial({
      map: signTexture(),
      emissive: 0xffffff,
      emissiveMap: signTexture(),
      emissiveIntensity: 0.9,
      transparent: false,
    })
  );
  sign.position.set(0, SH + 1.5, front + 0.12);
  store.add(glow(sign));
  const signBack = rbox(10.4, 2.8, 0.25, 0.05, M.plastic(0x141210), 0, SH + 1.5, front - 0.05);
  store.add(signBack);
  // remaining shell
  store.add(rbox(SW, SH, 0.4, 0.05, wallMat, 0, SH / 2, SZ - SD / 2)); // back
  addCol(0, SH / 2, SZ - SD / 2, SW / 2, SH / 2, 0.2);
  store.add(rbox(0.4, SH, SD, 0.05, wallMat, -SW / 2, SH / 2, SZ));
  store.add(rbox(0.4, SH, SD, 0.05, wallMat, SW / 2, SH / 2, SZ));
  addCol(-SW / 2, SH / 2, SZ, 0.2, SH / 2, SD / 2);
  addCol(SW / 2, SH / 2, SZ, 0.2, SH / 2, SD / 2);
  const roof = rbox(SW + 0.6, 0.4, SD + 0.6, 0.05, M.plastic(0x15120f), 0, SH + 0.2, SZ);
  store.add(roof);
  // interior floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(SW - 0.8, SD - 0.8),
    new THREE.MeshStandardMaterial({ color: 0xcfc9bd, roughness: 0.25, metalness: 0.05 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.02, SZ);
  floor.receiveShadow = true;
  store.add(floor);
  // interior ceiling light boxes
  for (const lx of [-8, 0, 8]) {
    store.add(glow(rbox(3.2, 0.1, 1.2, 0.02, M.emissive(0xfff2da, 2.6), lx, SH - 0.1, SZ)));
  }

  /* cooler wall along the back */
  const cooler = new THREE.Group();
  const coolerMat = M.metal(0x2e2b28, 0.4);
  for (let i = 0; i < 6; i++) {
    const cx = -10 + i * 4;
    cooler.add(rbox(3.8, 3.2, 0.7, 0.05, coolerMat, cx, 1.6, SZ - SD / 2 + 0.75));
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(3.3, 2.5),
      new THREE.MeshPhysicalMaterial({
        color: 0xbfe4ff,
        emissive: 0x9fd0ff,
        emissiveIntensity: 0.75,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
      })
    );
    glass.position.set(cx, 1.7, SZ - SD / 2 + 1.12);
    cooler.add(glow(glass));
  }
  store.add(cooler);
  addCol(0, 1.6, SZ - SD / 2 + 0.75, 12, 1.6, 0.5);

  /* aisles: two shelf gondolas, instanced products */
  const shelfMat = M.plastic(0x59544d, 0.6);
  const shelfItems = [];
  const labelMats = products.map(
    (p) =>
      new THREE.MeshStandardMaterial({
        map: productLabelTexture(p),
        roughness: 0.4,
      })
  );
  const aisleZ = SZ + 0.6;
  for (const ax of [-5.5, 5.5]) {
    const gondola = new THREE.Group();
    gondola.position.set(ax, 0, aisleZ);
    gondola.add(rbox(1.1, 0.18, 7.6, 0.03, shelfMat, 0, 0.09, 0));
    for (const sy of [0.65, 1.15, 1.65]) {
      gondola.add(rbox(1.0, 0.06, 7.4, 0.02, shelfMat, 0, sy, 0));
    }
    gondola.add(rbox(1.06, 2.0, 0.1, 0.02, shelfMat, 0, 1.0, -3.78));
    gondola.add(rbox(1.06, 2.0, 0.1, 0.02, shelfMat, 0, 1.0, 3.78));
    // product rows (instanced boxes per product type)
    products.forEach((p, pi) => {
      const kindGeo =
        p.kind === "can"
          ? new THREE.CylinderGeometry(0.09, 0.09, 0.26, 12)
          : p.kind === "bottle"
            ? new THREE.CylinderGeometry(0.07, 0.09, 0.34, 10)
            : new RoundedBoxGeometry(0.2, 0.28, 0.09, 2, 0.02);
      const inst = new THREE.InstancedMesh(kindGeo, labelMats[pi], 12);
      const side = pi % 2 === 0 ? 1 : -1;
      const sy = 0.65 + Math.floor(pi / 2) * 0.5 + (p.kind === "bag" ? 0.17 : 0.14);
      for (let i = 0; i < 12; i++) {
        m4.makeRotationY(side > 0 ? 0 : Math.PI);
        m4.setPosition(side * 0.32, sy, -3.2 + i * 0.58);
        inst.setMatrixAt(i, m4);
      }
      gondola.add(inst);
    });
    store.add(gondola);
    addCol(ax, 1.0, aisleZ, 0.6, 1.0, 3.8);
    // one pickable item per gondola end
    const pick = products[ax < 0 ? 0 : 2];
    const pickMesh = new THREE.Mesh(
      pick.kind === "can"
        ? new THREE.CylinderGeometry(0.09, 0.09, 0.26, 14)
        : new RoundedBoxGeometry(0.2, 0.28, 0.09, 2, 0.02),
      labelMats[products.indexOf(pick)].clone()
    );
    pickMesh.position.set(ax, 1.32, aisleZ + 3.3);
    pickMesh.castShadow = true;
    store.add(pickMesh);
    shelfItems.push({ mesh: pickMesh, product: pick, x: ax, z: aisleZ + 3.3 });
  }

  /* checkout counter + register */
  const counter = new THREE.Group();
  counter.position.set(9, 0, SZ + 3.6);
  counter.add(rbox(3.4, 1.05, 1.2, 0.05, M.paint(0x4d453c, { roughness: 0.4, clearcoat: 0.3 }), 0, 0.53, 0));
  const regScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.36),
    new THREE.MeshStandardMaterial({
      map: pumpScreenTexture(["SELF CHECKOUT", "SCAN OR TAP"], "#e8a01a"),
      emissive: 0xffd27a,
      emissiveIntensity: 0.6,
      emissiveMap: pumpScreenTexture(["SELF CHECKOUT", "SCAN OR TAP"], "#e8a01a"),
    })
  );
  regScreen.position.set(-0.6, 1.5, 0.2);
  regScreen.rotation.x = -0.35;
  counter.add(glow(regScreen));
  const regReader = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.15), readerMat.clone());
  regReader.position.set(0.2, 1.25, 0.35);
  regReader.rotation.x = -0.5;
  counter.add(glow(regReader));
  counter.add(rbox(0.6, 0.5, 0.4, 0.04, M.plastic(0x24211d), 0.2, 1.0, 0.2));
  store.add(counter);
  addCol(9, 0.55, SZ + 3.6, 1.7, 0.55, 0.6);
  scene.add(store);

  /* ---------- props: crates, dumpster, bollards, ice box ---------- */
  const crateMat = M.plastic(0x7a6a4f, 0.8);
  const crates = [];
  for (const [cx, cz] of [[12, 4], [12.8, 4.6], [12.3, 5.4], [-13, -8]]) {
    const c = rbox(0.75, 0.75, 0.75, 0.04, crateMat, cx, 0.38, cz, 0.4);
    scene.add(c);
    crates.push({ mesh: c, dynamic: true, size: 0.75 });
  }
  const dumpster = rbox(3.2, 1.7, 1.6, 0.08, M.paint(0x2e5c3f, { roughness: 0.6 }), -19, 0.85, -18);
  scene.add(dumpster);
  addCol(-19, 0.85, -18, 1.6, 0.85, 0.8);
  const iceBox = rbox(1.6, 1.9, 1.0, 0.05, M.paint(0xdfe4e6, { roughness: 0.3 }), 8.4, 0.95, -15.4);
  scene.add(iceBox);
  addCol(8.4, 0.95, -15.4, 0.8, 0.95, 0.5);
  const bolMat = M.paint(0xc9834a, { roughness: 0.45 });
  const bolGeo = new THREE.CylinderGeometry(0.14, 0.16, 1.0, 10);
  const bols = new THREE.InstancedMesh(bolGeo, bolMat, 6);
  const bolPos = [[-7.5, -15.2], [7.5, -15.2], [-12, 3], [12, 3], [-2, -15.2], [2, -15.2]];
  bolPos.forEach(([bx, bz], i) => {
    m4.identity();
    m4.setPosition(bx, 0.5, bz);
    bols.setMatrixAt(i, m4);
    addCol(bx, 0.5, bz, 0.18, 0.5, 0.18);
  });
  bols.castShadow = true;
  scene.add(bols);

  /* ---------- lights ---------- */
  const moon = new THREE.DirectionalLight(0x8fa8c8, 0.55);
  moon.position.set(-30, 42, 20);
  moon.castShadow = true;
  moon.shadow.mapSize.set(quality === "desktop" ? 2048 : 1024, quality === "desktop" ? 2048 : 1024);
  moon.shadow.camera.left = -40;
  moon.shadow.camera.right = 40;
  moon.shadow.camera.top = 40;
  moon.shadow.camera.bottom = -40;
  moon.shadow.bias = -0.0004;
  scene.add(moon);
  scene.add(new THREE.AmbientLight(0x1c2026, 1.4));

  const canopySpots = [];
  for (const lx of [-5.5, 5.5]) {
    const s = new THREE.SpotLight(0xffdfae, 260, 22, Math.PI / 3.2, 0.5, 1.9);
    s.position.set(lx, 6.2, -2);
    s.target.position.set(lx, 0, -2);
    scene.add(s, s.target);
    canopySpots.push(s);
  }
  const storeLight = new THREE.PointLight(0xffe3b8, 90, 26, 1.9);
  storeLight.position.set(0, 3.6, SZ);
  scene.add(storeLight);
  const doorGlow = new THREE.PointLight(0xffd9a0, 40, 12, 1.9);
  doorGlow.position.set(0, 2.6, front + 1.6);
  scene.add(doorGlow);

  return {
    colliders,
    crates,
    pumpBays,
    shelfItems,
    doors: { left: doorL, right: doorR, x: 0, z: front },
    register: { x: 9, z: SZ + 3.6, screen: regScreen, reader: regReader },
    store: { front, SZ, SW, SD },
    screenMat,
  };
}
