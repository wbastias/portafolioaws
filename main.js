import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById("three-hero");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x07131f, 8, 28);

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// =========================
// LUCES
// =========================
scene.add(new THREE.AmbientLight(0xaedfff, 1.0));

const light1 = new THREE.PointLight(0x8fe9ff, 10, 25, 2);
light1.position.set(-3, 3, 4);
scene.add(light1);

const light2 = new THREE.PointLight(0xff9cf4, 8, 20, 2);
light2.position.set(3, 2, 2);
scene.add(light2);

const light3 = new THREE.PointLight(0xffffff, 5, 20, 2);
light3.position.set(2, 4, 6);
scene.add(light3);

const fireLight = new THREE.PointLight(0xff8a2a, 4, 8, 2);
fireLight.visible = false;
scene.add(fireLight);

// =========================
// CHISPAS DEL FUEGO
// =========================
const fireSparkCount = 18;
const fireSparkGeometry = new THREE.BufferGeometry();
const fireSparkPositions = new Float32Array(fireSparkCount * 3);

for (let i = 0; i < fireSparkCount; i++) {
  fireSparkPositions[i * 3] = 0;
  fireSparkPositions[i * 3 + 1] = 0;
  fireSparkPositions[i * 3 + 2] = 0;
}

fireSparkGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(fireSparkPositions, 3)
);

const fireSparkMaterial = new THREE.PointsMaterial({
  color: 0xffb347,
  size: 0.018,
  transparent: true,
  opacity: 0.45
});

const fireSparks = new THREE.Points(fireSparkGeometry, fireSparkMaterial);
fireSparks.visible = false;
scene.add(fireSparks);



// =========================
// PARTÍCULAS DE FONDO OCULTAS
// =========================
const particleCount = 250;
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 20;
  particlePositions[i * 3 + 1] = Math.random() * 10 - 2;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3)
);

const particles = new THREE.Points(
  particlesGeometry,
  new THREE.PointsMaterial({
    color: 0xd8f7ff,
    size: 0.06,
    transparent: true,
    opacity: 0.8
  })
);

particles.visible = false;
scene.add(particles);

// =========================
// MODELO
// =========================
const loader = new GLTFLoader();

let fairyModel = null;
let alaIzquierda = null;
let alaDerecha = null;

const mariposasOriginales = {};
const mariposasOriginalesGrupos = [];

const fuegoParts = [];
const fuegoBase = new Map();

const mariposaTemplate = {};
const mariposasVoladoras = [];
const mariposasPantalla = [];

const FAIRY_POSITION = new THREE.Vector3(3.2, 0.55, 2.2);
const FAIRY_ROTATION_Y = -0.78;
const FAIRY_SCALE = 1.2;

// =========================
// MARIPOSAS ORIGINALES DEL HADA
// =========================
const configMariposasOriginales = {
  "1":  { velocidad: 20.55, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 0.0, rotacion: 0.28 },
  "2":  { velocidad: 15.50, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 0.7, rotacion: 0.37 },
  "3":  { velocidad: 20.58, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 1.4, rotacion: 0.50 },
  "4":  { velocidad: 30.52, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 2.1, rotacion: 0.66 },
  "5":  { velocidad: 26.48, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 2.8, rotacion: 0.46 },
  "6":  { velocidad: 20.60, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 3.5, rotacion: 0.78 },
  "7":  { velocidad: 20.54, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 4.2, rotacion: 0.67 },
  "8":  { velocidad: 20.56, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 4.9, rotacion: 0.47 },
  "9":  { velocidad: 20.45, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 5.6, rotacion: 0.35 },
  "11": { velocidad: 20.53, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 6.3, rotacion: 0.27 },
  "12": { velocidad: 20.50, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 7.0, rotacion: 0.36 },
  "13": { velocidad: 20.57, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 7.7, rotacion: 0.17 },
  "14": { velocidad: 20.52, amplitudX: 0.01, amplitudY: 0.01, amplitudZ: 0.01, fase: 8.4, rotacion: 0.16 }
};

// =========================
// MARIPOSAS CLONADAS CERCA DEL HADA
// =========================
const configVoladoras = [
  { x: 1.4, y: 1.15, z: 2.0, escala: 1.4, velocidad: 25.45, amplitudX: 0.01, amplitudY: 0.01, fase: 0.0 },
  { x: 3.9, y: 1.05, z: 2.0, escala: 1.3, velocidad: 20.42, amplitudX: 0.01, amplitudY: 0.01, fase: 0.0 },
  { x: 4.6, y: 0.45, z: 2.2, escala: 1.1, velocidad: 20.35, amplitudX: 0.01, amplitudY: 0.01, fase: 0.0 },
  { x: 4.3, y: 1.55, z: 2.1, escala: 1.05, velocidad: 20.40, amplitudX: 0.01, amplitudY: 0.01, fase: 0.0 }
];

// =========================
// MARIPOSAS EXTRA POR TODA LA PANTALLA
// direction: 1 entra desde izquierda hacia derecha
// direction: -1 entra desde derecha hacia izquierda
// =========================
const configExtraPantalla = [
  { x: -2.8, y: 2.10, z: 2.0, escala: 0.75, velocidad: 25.45, amplitudX: 0.01, amplitudY: 0.01, fase: 0.0 },
  { x: -1.8, y: 1.65, z: 2.1, escala: 1.65, velocidad: 20.42, amplitudX: 0.01, amplitudY: 0.01, fase: 0.4 },
  { x: -0.8, y: 0.95, z: 2.2, escala: 0.60, velocidad: 20.35, amplitudX: 0.01, amplitudY: 0.01, fase: 0.8 },

  { x: 0.4, y: 2.45, z: 2.0, escala: 0.55, velocidad: 20.40, amplitudX: 0.01, amplitudY: 0.01, fase: 1.2 },
  { x: 1.2, y: 0.45, z: 2.3, escala: 1.20, velocidad: 25.45, amplitudX: 0.01, amplitudY: 0.01, fase: 1.6 },
  { x: 2.3, y: 2.20, z: 2.1, escala: 0.55, velocidad: 20.42, amplitudX: 0.01, amplitudY: 0.01, fase: 2.0 },

  { x: 3.4, y: 0.65, z: 2.2, escala: 0.60, velocidad: 20.35, amplitudX: 0.01, amplitudY: 0.01, fase: 2.4 },
  { x: 4.8, y: 2.35, z: 2.0, escala: 1.50, velocidad: 20.40, amplitudX: 0.01, amplitudY: 0.01, fase: 2.8 },
  { x: 5.8, y: 1.25, z: 2.2, escala: 0.65, velocidad: 25.45, amplitudX: 0.01, amplitudY: 0.01, fase: 3.2 },

  { x: 6.5, y: 2.00, z: 2.1, escala: 0.55, velocidad: 20.42, amplitudX: 0.01, amplitudY: 0.01, fase: 3.6 },
  { x: 0.0, y: 1.35, z: 3.2, escala: 1.42, velocidad: 20.35, amplitudX: 0.01, amplitudY: 0.01, fase: 4.0 },
  { x: 5.2, y: 0.35, z: 3.3, escala: 0.40, velocidad: 20.40, amplitudX: 0.01, amplitudY: 0.01, fase: 4.4 }
];

// =========================
// HELPERS
// =========================
function normalizarNombre(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\./g, "_");
}

function esFuego(name) {
  const n = normalizarNombre(name);
  return n === "fuego1_base" || n === "fuego1_medio" || n === "fuego1_alto";
}

function guardarBase(obj, mapa) {
  mapa.set(obj, {
    position: obj.position.clone(),
    rotation: obj.rotation.clone(),
    scale: obj.scale.clone()
  });
}

function prepararMaterialClone(obj) {
  obj.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      child.material.side = THREE.DoubleSide;
      child.material.transparent = true;
      child.material.opacity = 0.95;
      child.material.needsUpdate = true;
    }
  });
}

function crearMariposaDesdeTemplate(template, cfg, index, lista, nombre) {
  if (!template.body || !template.izq || !template.der) return;

  const group = new THREE.Group();
  group.name = `${nombre}_${index}`;

  const body = template.body.clone(true);
  const izq = template.izq.clone(true);
  const der = template.der.clone(true);

  prepararMaterialClone(body);
  prepararMaterialClone(izq);
  prepararMaterialClone(der);

  const anchor = template.body.position.clone();

  body.position.sub(anchor);
  izq.position.sub(anchor);
  der.position.sub(anchor);

  group.add(body);
  group.add(izq);
  group.add(der);

  const x = cfg.x ?? cfg.startX ?? 0;
  group.position.set(x, cfg.y, cfg.z);
  group.scale.setScalar(cfg.escala);
  group.rotation.y = cfg.direction === -1 ? 0.65 : -0.65;

  scene.add(group);

  lista.push({
    group,
    izq,
    der,
    base: new THREE.Vector3(x, cfg.y, cfg.z),
    cfg,
    izqRot: izq.rotation.clone(),
    derRot: der.rotation.clone()
  });
}

function crearMariposasVoladoras() {
  configVoladoras.forEach((cfg, index) => {
    crearMariposaDesdeTemplate(mariposaTemplate, cfg, index, mariposasVoladoras, "mariposa_voladora");
  });
}

function crearMariposasPantalla() {
  configExtraPantalla.forEach((cfg, index) => {
    crearMariposaDesdeTemplate(mariposaTemplate, cfg, index, mariposasPantalla, "mariposa_pantalla");
  });
}

function crearGruposMariposasOriginales() {
  Object.keys(mariposasOriginales).forEach((id) => {
    const m = mariposasOriginales[id];
    if (!m.body) return;

    const group = new THREE.Group();
    group.name = `grupo_mariposa_original_${id}`;

    const anchor = m.body.position.clone();
    group.position.copy(anchor);

    fairyModel.add(group);

    const partes = [m.body, m.izq, m.der].filter(Boolean);

    partes.forEach((parte) => {
      parte.position.sub(anchor);
      group.add(parte);
    });

    const cfg = configMariposasOriginales[id] || {
      velocidad: 0.45,
      amplitudX: 0.04,
      amplitudY: 0.025,
      amplitudZ: 0.018,
      fase: 0,
      rotacion: 0.06
    };

    mariposasOriginalesGrupos.push({
      id,
      group,
      base: group.position.clone(),
      rotBase: group.rotation.clone(),
      cfg
    });
  });
}

// =========================
// CARGA MODELO
// =========================
loader.load(
  `assets/ada_movi1.glb?v=${Date.now()}`,
  (gltf) => {
    fairyModel = gltf.scene;

    fairyModel.traverse((child) => {
      const name = normalizarNombre(child.name);

      if (name === "ala_izquierda") alaIzquierda = child;
      if (name === "ala_derecha") alaDerecha = child;

      if (name === "mariposa1") mariposaTemplate.body = child;
      if (name === "mariposa1_iz" || name === "mariposa1_izq") mariposaTemplate.izq = child;
      if (name === "mariposa1_der") mariposaTemplate.der = child;

      const bodyMatch = name.match(/^mariposa(\d+)$/);
      if (bodyMatch) {
        const id = bodyMatch[1];
        if (!mariposasOriginales[id]) {
          mariposasOriginales[id] = { body: null, izq: null, der: null };
        }
        mariposasOriginales[id].body = child;
      }

      const wingMatch = name.match(/^mariposa(\d+)_(izq|iz|der)$/);
      if (wingMatch) {
        const id = wingMatch[1];
        const lado = wingMatch[2];

        if (!mariposasOriginales[id]) {
          mariposasOriginales[id] = { body: null, izq: null, der: null };
        }

        if (lado === "iz" || lado === "izq") mariposasOriginales[id].izq = child;
        if (lado === "der") mariposasOriginales[id].der = child;
      }

      if (esFuego(name)) {
        fuegoParts.push(child);
        guardarBase(child, fuegoBase);
      }

      if (child.isMesh && child.material) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.material.side = THREE.DoubleSide;
        child.material.needsUpdate = true;
      }
    });

    fairyModel.scale.set(FAIRY_SCALE, FAIRY_SCALE, FAIRY_SCALE);
    fairyModel.position.copy(FAIRY_POSITION);
    fairyModel.rotation.set(0, FAIRY_ROTATION_Y, 0);

    scene.add(fairyModel);

    crearMariposasVoladoras();
    crearMariposasPantalla();
    crearGruposMariposasOriginales();

    console.log("Mariposas originales agrupadas:", mariposasOriginalesGrupos.length);
    console.log("Mariposas clonadas cerca:", mariposasVoladoras.length);
    console.log("Mariposas pantalla completa:", mariposasPantalla.length);
    console.log("Fuego detectado:", fuegoParts.map(f => f.name));
  },
  undefined,
  (error) => {
    console.error("Error cargando GLB:", error);
  }
);

// =========================
// ANIMACIÓN
// =========================
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  if (fairyModel) {
    fairyModel.position.copy(FAIRY_POSITION);
    fairyModel.rotation.set(0, FAIRY_ROTATION_Y, 0);
    fairyModel.position.y = FAIRY_POSITION.y + Math.sin(t * 1.6) * 0.04;

    // =========================
    // ALAS DEL HADA
    // =========================
    if (alaIzquierda && alaDerecha) {
      const wingSpeed = 21.5;
      const wingPower = 0.22;

      const baseFlap = Math.sin(t * wingSpeed);
      const microFlap = Math.sin(t * wingSpeed * 2.7) * 0.18;
      const organicFlap = Math.sign(baseFlap) * Math.pow(Math.abs(baseFlap), 0.55);

      const flap = (organicFlap + microFlap) * wingPower;

      alaIzquierda.rotation.z = flap;
      alaDerecha.rotation.z = -flap;

      alaIzquierda.rotation.y = Math.sin(t * wingSpeed * 0.55) * 0.045;
      alaDerecha.rotation.y = -Math.sin(t * wingSpeed * 0.55) * 0.045;
    }

    // =========================
    // MARIPOSAS ORIGINALES DEL HADA
    // =========================
    mariposasOriginalesGrupos.forEach((m) => {
      const cfg = m.cfg;
      const move = t * cfg.velocidad + cfg.fase;

      m.group.position.x = m.base.x + Math.sin(move) * cfg.amplitudX;
      m.group.position.y = m.base.y + Math.cos(move * 1.25) * cfg.amplitudY;
      m.group.position.z = m.base.z + Math.sin(move * 0.7) * cfg.amplitudZ;

      m.group.rotation.copy(m.rotBase);
      m.group.rotation.y += Math.sin(move * 0.8) * cfg.rotacion;
      m.group.rotation.z += Math.sin(move * 1.1) * cfg.rotacion * 0.45;
    });

    // =========================
    // MARIPOSAS CLONADAS CERCA DEL HADA
    // =========================
    mariposasVoladoras.forEach((m) => {
      const cfg = m.cfg;
      const move = t * cfg.velocidad + cfg.fase;

      m.group.position.x = m.base.x + Math.sin(move) * cfg.amplitudX;
      m.group.position.y = m.base.y + Math.cos(move * 1.25) * cfg.amplitudY;
      m.group.position.z = m.base.z + Math.sin(move * 0.7) * 0.04;

      m.group.rotation.y = -0.65 + Math.sin(move * 0.8) * 0.35;
      m.group.rotation.z = Math.sin(move * 1.1) * 0.08;

      m.izq.rotation.copy(m.izqRot);
      m.der.rotation.copy(m.derRot);
    });

    // =========================
    // MARIPOSAS EXTRA POR TODA LA PANTALLA
    // entran y salen, manteniendo movimiento vibrante
    // =========================
    mariposasPantalla.forEach((m, i) => {
      const cfg = m.cfg;

      const direction = i % 2 === 0 ? 1 : -1;
      const progress = (t * 0.02 + cfg.fase * 0.08) % 1;

      const startX = direction === 1 ? -6.5 : 8.5;
      const endX = direction === 1 ? 8.5 : -6.5;

      const travelX = THREE.MathUtils.lerp(startX, endX, progress);

      const vibracion = t * cfg.velocidad + cfg.fase;

      m.group.position.x = travelX + Math.sin(vibracion) * cfg.amplitudX;
      m.group.position.y =
  cfg.y +
  Math.cos(vibracion * 1.25) * cfg.amplitudY +
  Math.sin(t * 0.35 + i) * 2.2;
      m.group.position.z = cfg.z + Math.sin(vibracion * 0.7) * 0.04;

      m.group.rotation.y = direction === 1 ? -0.65 : 0.65;
      m.group.rotation.y += Math.sin(vibracion * 0.8) * 0.35;
      m.group.rotation.z = Math.sin(vibracion * 1.1) * 0.08;

      m.izq.rotation.copy(m.izqRot);
      m.der.rotation.copy(m.derRot);
    });

    // =========================
    // FUEGO UNIDO + CHISPAS
    // =========================
    const flameX = 1 + Math.sin(t * 1.6) * 0.04 + Math.sin(t * 3.2) * 0.015;
    const flameY = 1 + Math.sin(t * 2.2) * 0.08 + Math.sin(t * 4.5) * 0.02;
    const flameZ = 1 + Math.sin(t * 1.8) * 0.04 + Math.sin(t * 3.8) * 0.015;

    const rotY = Math.sin(t * 1.5) * 0.02;
    const rotZ = Math.sin(t * 1.8) * 0.015;

    fuegoParts.forEach((f) => {
      const base = fuegoBase.get(f);
      if (!base) return;

      f.position.copy(base.position);
      f.rotation.copy(base.rotation);

      f.position.y += Math.sin(t * 3 + f.id * 0.5) * 0.002;

      f.scale.set(
        base.scale.x * flameX,
        base.scale.y * flameY,
        base.scale.z * flameZ
      );

      f.rotation.y += rotY;
      f.rotation.z += rotZ;
    });

    if (fuegoParts.length > 0) {
      const fireAnchor = fuegoParts.find(f => normalizarNombre(f.name) === "fuego1_alto")
        || fuegoParts.find(f => normalizarNombre(f.name) === "fuego1_medio")
        || fuegoParts[0];

      fireAnchor.getWorldPosition(fireLight.position);

      fireLight.position.x -= 0.68;
      fireLight.position.y += 0.28;
      fireLight.position.z += 0.02;

      fireLight.visible = true;
      fireLight.intensity = 2.8 + Math.sin(t * 2.5) * 0.5;

      fireSparks.visible = true;
      fireSparks.position.copy(fireLight.position);

      const arr = fireSparkGeometry.attributes.position.array;

      for (let i = 0; i < fireSparkCount; i++) {
        const life = (t * 0.30 + i * 0.12) % 1;

        const y = life * 0.18 + 0.25;
        const spread = 0.01 + life * 0.02;
        const angle = i * 1.7;

        arr[i * 3] = Math.cos(angle) * spread;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = Math.sin(angle) * spread * 0.5;
      }

      fireSparkMaterial.opacity = 0.35 + Math.sin(t * 1.2) * 0.05;
      fireSparkGeometry.attributes.position.needsUpdate = true;
    }
  }

  particles.rotation.y = t * 0.03;

  camera.position.set(0, 1.55, 5.4);
  camera.lookAt(2.2, 1.15, 1.8);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// =========================
// RESIZE
// =========================
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});