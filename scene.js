import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.getElementById("scene");
const hero = document.querySelector(".hero");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = window.innerWidth < 700;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = backgroundTexture();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0.2, 13);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.03).texture;

const keyLight = new THREE.DirectionalLight(0xfff0d0, 2.4);
keyLight.position.set(3, 5, 6);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xffd9b0, 0.8);
fillLight.position.set(-5, 1, 3);
scene.add(fillLight);
const rimLight = new THREE.PointLight(0xff5c7a, 16, 20);
rimLight.position.set(-3.5, -1, 2);
scene.add(rimLight);
scene.add(new THREE.AmbientLight(0x3a1e26, 0.7));

function backgroundTexture() {
  const element = document.createElement("canvas");
  element.width = 64;
  element.height = 512;
  const context = element.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, "#1A0A11");
  gradient.addColorStop(0.45, "#24101A");
  gradient.addColorStop(1, "#070304");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 512);
  const texture = new THREE.CanvasTexture(element);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function bandGeometry(radius, width, thickness) {
  const points = [];
  const steps = 28;
  for (let index = 0; index <= steps; index++) {
    const angle = (Math.PI * index) / steps;
    points.push(new THREE.Vector2(radius + Math.sin(angle) * thickness, -Math.cos(angle) * width / 2));
  }
  for (let index = steps; index >= 0; index--) {
    const angle = (Math.PI * index) / steps;
    points.push(new THREE.Vector2(radius - Math.sin(angle) * thickness * 0.3, -Math.cos(angle) * width / 2));
  }
  const geometry = new THREE.LatheGeometry(points, 240);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

function diamondGeometry() {
  const profile = [
    new THREE.Vector2(0.0001, 0.13),
    new THREE.Vector2(0.12, 0.13),
    new THREE.Vector2(0.22, 0.045),
    new THREE.Vector2(0.235, 0.02),
    new THREE.Vector2(0.235, 0.0),
    new THREE.Vector2(0.0001, -0.23)
  ];
  const geometry = new THREE.LatheGeometry(profile, 16);
  return geometry.toNonIndexed();
}

const yellowGold = new THREE.MeshStandardMaterial({ color: 0xe9c27a, metalness: 1, roughness: 0.34, envMapIntensity: 1.35 });
const roseGold = new THREE.MeshStandardMaterial({ color: 0xeeb09a, metalness: 1, roughness: 0.38, envMapIntensity: 1.3 });
const diamondMaterial = new THREE.MeshStandardMaterial({
  color: 0xf4f8ff,
  metalness: 0.15,
  roughness: 0.04,
  envMapIntensity: 3.2,
  flatShading: true
});

const rings = new THREE.Group();
scene.add(rings);

const engagement = new THREE.Group();
const engagementBand = new THREE.Mesh(bandGeometry(1, 0.2, 0.085), yellowGold);
engagement.add(engagementBand);

const diamond = new THREE.Mesh(diamondGeometry(), diamondMaterial);
diamond.position.set(0, 1.36, 0);
engagement.add(diamond);

const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.07, 0.2, 24, 1, true), yellowGold);
basket.position.set(0, 1.16, 0);
engagement.add(basket);

for (let index = 0; index < 6; index++) {
  const angle = (index / 6) * Math.PI * 2;
  const prong = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.2, 4, 8), yellowGold);
  prong.position.set(Math.cos(angle) * 0.19, 1.3, Math.sin(angle) * 0.19);
  prong.lookAt(Math.cos(angle) * 0.4, 1.1, Math.sin(angle) * 0.4);
  prong.rotateX(Math.PI / 2);
  engagement.add(prong);
}

engagement.position.x = -0.42;
engagement.rotation.set(0.12, 0.45, 0);
rings.add(engagement);

const band = new THREE.Mesh(bandGeometry(0.9, 0.28, 0.1), roseGold);
band.position.set(0.5, -0.12, 0);
band.rotation.set(0.15, -1.15, 0.28);
rings.add(band);

function starTexture() {
  const size = 128;
  const element = document.createElement("canvas");
  element.width = size;
  element.height = size;
  const context = element.getContext("2d");
  const middle = size / 2;
  const glow = context.createRadialGradient(middle, middle, 0, middle, middle, middle);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.12, "rgba(255,246,220,.9)");
  glow.addColorStop(0.35, "rgba(255,230,170,.15)");
  glow.addColorStop(1, "rgba(255,230,170,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, size, size);
  context.strokeStyle = "rgba(255,250,235,.95)";
  context.lineCap = "round";
  for (const [width, length] of [[3, 0.48], [1.5, 0.3]]) {
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(middle - size * length, middle);
    context.lineTo(middle + size * length, middle);
    context.moveTo(middle, middle - size * length);
    context.lineTo(middle, middle + size * length);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(element);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const starMap = starTexture();
const glints = [];
const glintSpots = [
  [0.06, 1.47, 0.12],
  [-0.12, 1.4, 0.1],
  [0.14, 1.36, 0.14],
  [-0.5, 0.75, 0.12],
  [0.7, -0.6, 0.15]
];
for (const [x, y, z] of glintSpots) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: starMap, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  sprite.position.set(x, y, z);
  sprite.userData.phase = Math.random() * 10;
  engagement.add(sprite);
  glints.push(sprite);
}

const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 }));
halo.scale.set(5.5, 5.5, 1);
halo.position.z = -1.2;
rings.add(halo);

function haloTexture() {
  const size = 256;
  const element = document.createElement("canvas");
  element.width = size;
  element.height = size;
  const context = element.getContext("2d");
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(201,140,90,.35)");
  gradient.addColorStop(0.5, "rgba(140,40,60,.12)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(element);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function petalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.14);
  shape.bezierCurveTo(0.13, -0.08, 0.14, 0.1, 0, 0.16);
  shape.bezierCurveTo(-0.14, 0.1, -0.13, -0.08, 0, -0.14);
  const geometry = new THREE.ShapeGeometry(shape, 10);
  const position = geometry.attributes.position;
  for (let index = 0; index < position.count; index++) {
    const x = position.getX(index);
    const y = position.getY(index);
    position.setZ(index, x * x * 2.2 - y * 0.25);
  }
  geometry.computeVertexNormals();
  return geometry;
}

const petalCount = small ? 24 : 50;
const petalMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.05, side: THREE.DoubleSide, emissive: 0x220006 });
const petals = new THREE.InstancedMesh(petalGeometry(), petalMaterial, petalCount);
scene.add(petals);
const petalState = [];
const palette = [new THREE.Color(0x9e1230), new THREE.Color(0xc4304e), new THREE.Color(0xf0cfc5)];
for (let index = 0; index < petalCount; index++) {
  petalState.push({
    x: (Math.random() - 0.5) * 10,
    y: Math.random() * 10 - 4,
    z: (Math.random() - 0.5) * 5 - 0.5,
    speed: 0.004 + Math.random() * 0.007,
    sway: Math.random() * Math.PI * 2,
    spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.025),
    rotation: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
    scale: 0.6 + Math.random() * 0.9
  });
  const pick = Math.random();
  petals.setColorAt(index, palette[pick < 0.55 ? 0 : pick < 0.85 ? 1 : 2]);
}
petals.instanceColor.needsUpdate = true;

function dotTexture() {
  const size = 64;
  const element = document.createElement("canvas");
  element.width = size;
  element.height = size;
  const context = element.getContext("2d");
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,248,220,1)");
  gradient.addColorStop(0.25, "rgba(241,221,160,.8)");
  gradient.addColorStop(1, "rgba(241,221,160,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(element);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const sparkCount = small ? 90 : 160;
const sparkPositions = new Float32Array(sparkCount * 3);
for (let index = 0; index < sparkCount; index++) {
  sparkPositions[index * 3] = (Math.random() - 0.5) * 14;
  sparkPositions[index * 3 + 1] = (Math.random() - 0.5) * 11;
  sparkPositions[index * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
}
const sparkGeometry = new THREE.BufferGeometry();
sparkGeometry.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
const sparks = new THREE.Points(
  sparkGeometry,
  new THREE.PointsMaterial({ size: 0.09, map: dotTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xf1dda0 })
);
scene.add(sparks);


let pointerX = 0;
let pointerY = 0;
window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX / window.innerWidth - 0.5;
  pointerY = event.clientY / window.innerHeight - 0.5;
});
window.addEventListener("deviceorientation", (event) => {
  if (event.gamma == null) {
    return;
  }
  pointerX = Math.max(-0.5, Math.min(0.5, event.gamma / 60));
  pointerY = Math.max(-0.5, Math.min(0.5, (event.beta - 45) / 60));
});

let baseY = 2;

function resize() {
  const width = hero.clientWidth;
  const height = hero.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  const narrow = camera.aspect < 0.8;
  camera.fov = narrow ? 48 : 35;
  baseY = narrow ? 2.7 : 2.4;
  rings.position.set(0, baseY, 0);
  rings.scale.setScalar(narrow ? 0.86 : 0.7);
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

let visible = true;
new IntersectionObserver((entries) => {
  visible = entries[0].isIntersecting;
}).observe(hero);

let active = document.body.classList.contains("opened");
let introStart = performance.now();
window.addEventListener("invite:open", () => {
  active = true;
  introStart = performance.now();
});

const dummy = new THREE.Object3D();
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  if (!visible || !active || document.hidden) {
    return;
  }
  const time = clock.getElapsedTime();
  const motion = reduceMotion ? 0.15 : 1;

  const intro = Math.min(1, (performance.now() - introStart) / 3000);
  const ease = 1 - Math.pow(1 - intro, 3);
  camera.position.z = 13 - 4 * ease;

  rings.rotation.y = Math.sin(time * 0.3) * 0.7 * motion + pointerX * 0.9 + (1 - ease) * 2.5;
  rings.rotation.x = Math.sin(time * 0.45) * 0.1 * motion + pointerY * 0.45;
  rings.position.y += (Math.sin(time * 1.1) * 0.07 * motion + baseY - rings.position.y) * 0.05;
  diamond.rotation.y = time * 0.6;

  for (const glint of glints) {
    const wave = Math.max(0, Math.sin(time * 1.7 + glint.userData.phase * 3));
    const flare = Math.pow(wave, 14);
    glint.material.opacity = flare;
    glint.material.rotation = time * 0.4 + glint.userData.phase;
    glint.scale.setScalar(0.15 + flare * 0.55);
  }

  camera.position.x += (pointerX * 0.8 - camera.position.x) * 0.04;
  camera.position.y += (0.2 - pointerY * 0.6 - camera.position.y) * 0.04;
  camera.lookAt(0, 0.6, 0);

  for (let index = 0; index < petalCount; index++) {
    const petal = petalState[index];
    petal.y -= petal.speed * motion;
    petal.x += Math.sin(time * 0.8 + petal.sway) * 0.004 * motion;
    if (petal.y < -5.5) {
      petal.y = 5.5 + Math.random() * 2;
      petal.x = (Math.random() - 0.5) * 10;
    }
    petal.rotation.x += petal.spin.x * motion;
    petal.rotation.y += petal.spin.y * motion;
    petal.rotation.z += petal.spin.z * motion;
    dummy.position.set(petal.x, petal.y, petal.z);
    dummy.rotation.copy(petal.rotation);
    dummy.scale.setScalar(petal.scale);
    dummy.updateMatrix();
    petals.setMatrixAt(index, dummy.matrix);
  }
  petals.instanceMatrix.needsUpdate = true;

  sparks.rotation.y = time * 0.02;
  sparks.material.opacity = 0.6 + Math.sin(time * 2) * 0.25;
  rimLight.intensity = 13 + Math.sin(time * 1.3) * 4;

  renderer.render(scene, camera);
}

animate();
