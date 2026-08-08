/* The car — a hand-built sedan held to the screenshot bar: real silhouette
   from an extruded side profile (no naked boxes), clearcoat paint, tinted
   greenhouse, chrome trim, deep-dish wheels, working head/tail lights.
   Physics: Rapier raycast vehicle, arcade-tuned. */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const CAR = {
  length: 4.6,
  width: 1.82,
  wheelRadius: 0.34,
  wheelBase: 2.7,
  track: 1.5,
};

function bodyProfile() {
  const s = new THREE.Shape();
  s.moveTo(-2.3, 0.3);
  s.lineTo(-2.32, 0.62);
  s.quadraticCurveTo(-2.28, 0.78, -2.05, 0.82);
  s.lineTo(-0.9, 0.86);       // rear deck
  s.lineTo(0.55, 0.84);        // belt line
  s.quadraticCurveTo(1.4, 0.8, 2.0, 0.66); // hood slope
  s.quadraticCurveTo(2.32, 0.58, 2.3, 0.42);
  s.lineTo(2.28, 0.26);
  s.lineTo(1.9, 0.18);
  s.lineTo(-1.95, 0.18);
  s.lineTo(-2.3, 0.3);
  return s;
}

function glassProfile() {
  const s = new THREE.Shape();
  s.moveTo(-1.15, 0.84);
  s.lineTo(-0.62, 1.3);
  s.lineTo(0.55, 1.3);
  s.lineTo(1.05, 0.84);
  s.lineTo(-1.15, 0.84);
  return s;
}

export function buildCar(paintColor = 0x9a2f26) {
  const car = new THREE.Group();

  const paint = new THREE.MeshPhysicalMaterial({
    color: paintColor,
    metalness: 0.75,
    roughness: 0.32,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bodyProfile(), {
      depth: CAR.width - 0.24,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.11,
      bevelSegments: 4,
      curveSegments: 10,
    }),
    paint
  );
  body.rotation.y = -Math.PI / 2; // extrude depth → width across z? keep along z
  body.rotation.y = 0;
  body.position.z = -(CAR.width - 0.24) / 2;
  body.castShadow = true;
  car.add(body);

  const glass = new THREE.Mesh(
    new THREE.ExtrudeGeometry(glassProfile(), {
      depth: CAR.width - 0.62,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    }),
    new THREE.MeshPhysicalMaterial({
      color: 0x0d1216,
      metalness: 0.2,
      roughness: 0.06,
      transparent: true,
      opacity: 0.92,
    })
  );
  glass.position.z = -(CAR.width - 0.62) / 2;
  glass.castShadow = true;
  car.add(glass);

  // rocker/skirt shadow mass grounds the body visually
  const skirt = new THREE.Mesh(
    new RoundedBoxGeometry(CAR.length - 0.7, 0.16, CAR.width - 0.34, 2, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x0c0b0a, roughness: 0.7 })
  );
  skirt.position.y = 0.17;
  car.add(skirt);

  // chrome trim: belt line strips
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd8dadd, metalness: 1, roughness: 0.15 });
  for (const side of [-1, 1]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.03, 0.02), chrome);
    strip.position.set(-0.15, 0.85, side * (CAR.width / 2 - 0.1));
    car.add(strip);
  }
  // bumpers
  const bumperMat = new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: 0.5 });
  const bF = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.3, CAR.width - 0.2, 3, 0.1), bumperMat);
  bF.position.set(CAR.length / 2 - 0.2, 0.4, 0);
  const bR = bF.clone();
  bR.position.x = -(CAR.length / 2 - 0.2);
  car.add(bF, bR);

  // headlights + taillights
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x202020,
    emissive: 0xfff3d6,
    emissiveIntensity: 4,
  });
  const tailMat = new THREE.MeshStandardMaterial({
    color: 0x1a0505,
    emissive: 0xff2a1a,
    emissiveIntensity: 2.6,
  });
  const lights = [];
  for (const side of [-1, 1]) {
    const h = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.12, 0.34, 2, 0.04), headMat);
    h.position.set(CAR.length / 2 - 0.12, 0.62, side * 0.58);
    car.add(h);
    lights.push(h);
    const t = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.12, 0.4, 2, 0.03), tailMat);
    t.position.set(-(CAR.length / 2 - 0.1), 0.72, side * 0.55);
    car.add(t);
    lights.push(t);
  }
  // headlight cones
  const spots = [];
  for (const side of [-1, 1]) {
    const sp = new THREE.SpotLight(0xffedc2, 120, 30, Math.PI / 5.5, 0.55, 1.7);
    sp.position.set(CAR.length / 2 - 0.1, 0.62, side * 0.58);
    sp.target.position.set(CAR.length / 2 + 8, 0.2, side * 0.7);
    car.add(sp, sp.target);
    spots.push(sp);
  }

  // plate
  const plateCv = document.createElement("canvas");
  plateCv.width = 128; plateCv.height = 64;
  const px = plateCv.getContext("2d");
  px.fillStyle = "#e8e2d2"; px.fillRect(0, 0, 128, 64);
  px.fillStyle = "#17418a"; px.font = "700 34px 'Overpass Mono', monospace";
  px.textAlign = "center"; px.fillText("NITE-RUN", 64, 42);
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.2),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(plateCv) })
  );
  plate.position.set(-(CAR.length / 2 + 0.005), 0.5, 0);
  plate.rotation.y = -Math.PI / 2;
  car.add(plate);

  // wheels
  const wheelGroup = [];
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x131312, roughness: 0.92 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xb9bcc0, metalness: 1, roughness: 0.25 });
  const discMat = new THREE.MeshStandardMaterial({ color: 0x555b60, metalness: 0.9, roughness: 0.4 });
  const tireGeo = new THREE.CylinderGeometry(CAR.wheelRadius, CAR.wheelRadius, 0.26, 24);
  tireGeo.rotateX(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.2, 0.21, 0.27, 18);
  rimGeo.rotateX(Math.PI / 2);
  const spokeGeo = new THREE.BoxGeometry(0.32, 0.05, 0.02);
  for (let i = 0; i < 4; i++) {
    const w = new THREE.Group();
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = true;
    const rim = new THREE.Mesh(rimGeo, rimMat);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.28, 14).rotateX(Math.PI / 2), discMat);
    w.add(tire, rim, disc);
    for (let sIdx = 0; sIdx < 5; sIdx++) {
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.rotation.z = (sIdx / 5) * Math.PI * 2;
      spoke.position.z = 0.14 * (i % 2 === 0 ? 1 : -1) * 0; // centered
      w.add(spoke);
    }
    wheelGroup.push(w);
    car.add(w);
  }

  return { car, wheels: wheelGroup, spots, paint };
}

/* Rapier vehicle wiring. */
export function attachVehicle(RAPIER, world, car) {
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(0, 1.2, 62)
    .setRotation({ x: 0, y: 1, z: 0, w: 0 }) // face -z (toward station)
    .setLinearDamping(0.18)
    .setAngularDamping(1.4)
    .setCcdEnabled(true);
  const chassis = world.createRigidBody(bodyDesc);
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(CAR.length / 2 - 0.25, 0.42, CAR.width / 2 - 0.14)
      .setTranslation(0, 0.55, 0)
      .setMass(140),
    chassis
  );

  const vehicle = makeVehicle(world, chassis);
  return { chassis, vehicle };
}

export function makeVehicle(world, chassis) {
  const vehicle = world.createVehicleController(chassis);
  const y = 0.35;
  const positions = [
    [CAR.wheelBase / 2, y, CAR.track / 2],
    [CAR.wheelBase / 2, y, -CAR.track / 2],
    [-CAR.wheelBase / 2, y, CAR.track / 2],
    [-CAR.wheelBase / 2, y, -CAR.track / 2],
  ];
  positions.forEach(([px, py, pz]) => {
    vehicle.addWheel(
      { x: px, y: py, z: pz },
      { x: 0, y: -1, z: 0 },
      { x: 0, y: 0, z: 1 },
      0.32,
      CAR.wheelRadius
    );
  });
  for (let i = 0; i < 4; i++) {
    vehicle.setWheelSuspensionStiffness(i, 32);
    vehicle.setWheelMaxSuspensionForce(i, 12000);
    vehicle.setWheelMaxSuspensionTravel(i, 0.28);
    vehicle.setWheelSuspensionCompression(i, 2.6);
    vehicle.setWheelSuspensionRelaxation(i, 3.4);
    vehicle.setWheelFrictionSlip(i, 3.4);
    vehicle.setWheelSideFrictionStiffness(i, 1.0);
  }
  return vehicle;
}
