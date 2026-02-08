/* ===============================
   Scroll Reveal (HTML)
================================ */
const scenes = document.querySelectorAll(".scene");

function revealScenes() {
  scenes.forEach(scene => {
    const top = scene.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.8) {
      scene.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealScenes);
window.addEventListener("load", revealScenes);

/* ===============================
   Three.js Scene
================================ */
const canvas = document.getElementById("webgl");

const scene3D = new THREE.Scene();
scene3D.fog = new THREE.Fog("#04101c", 2, 18);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* ===============================
   Light (Very Soft)
================================ */
const light = new THREE.DirectionalLight(0x9fdcff, 0.4);
light.position.set(1, 1, 1);
scene3D.add(light);

/* ===============================
   Bubble Particles
================================ */
const bubbleCount = 200;
const positions = new Float32Array(bubbleCount * 3);
const speeds = new Float32Array(bubbleCount);
const sizes = new Float32Array(bubbleCount);

for (let i = 0; i < bubbleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 10; // x
  positions[i * 3 + 1] = Math.random() * -20;   // y
  positions[i * 3 + 2] = (Math.random() - 0.5) * 6; // z

  speeds[i] = 0.005 + Math.random() * 0.01;
  sizes[i] = Math.random();
}

const bubbleGeometry = new THREE.BufferGeometry();
bubbleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const bubbleTexture = new THREE.TextureLoader().load("./assets/bubble.png");

const BASE_BUBBLE_SIZE = 0.14; // ⭐ 浅层基础大小（变大）

const bubbleMaterial = new THREE.PointsMaterial({
  map: bubbleTexture,
  transparent: true,
  opacity: 0.35,
  size: BASE_BUBBLE_SIZE,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});



const bubbles = new THREE.Points(bubbleGeometry, bubbleMaterial);
scene3D.add(bubbles);

/* ===============================
   Animation Loop (Bubbles + Flow)
================================ */
function animate() {
  const pos = bubbleGeometry.attributes.position.array;

  for (let i = 0; i < bubbleCount; i++) {
    // 上升
    pos[i * 3 + 1] += speeds[i] * 0.6;

    // 水流轻微左右摆动
    pos[i * 3] += Math.sin(Date.now() * 0.0005 + i) * 0.0006;

    // 超出视野 → 重置到底部
    if (pos[i * 3 + 1] > 4) {
      pos[i * 3 + 1] = -20;
      pos[i * 3] = (Math.random() - 0.5) * 10;
    }
  }

  bubbleGeometry.attributes.position.needsUpdate = true;

  renderer.render(scene3D, camera);
  requestAnimationFrame(animate);
}
animate();

/* ===============================
   Scroll → Deeper Current
================================ */
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const depth = Math.min(scrollY / window.innerHeight, 4);

  /* 相机下潜 */
  camera.position.z = 6 + scrollY * 0.001;

  /* 气泡 = 水压感 */
  bubbleMaterial.opacity = Math.max(0.08, 0.35 - depth * 0.08);
  // depth 越大 → size 越小
  bubbleMaterial.size = Math.max(
    0.1,                       // 深层最小气泡
    BASE_BUBBLE_SIZE * (1 - depth * 0.18)
  );


  /* 气泡速度随深度变慢 */
  for (let i = 0; i < speeds.length; i++) {
    speeds[i] = Math.max(0.002, speeds[i] * (1 - depth * 0.02));
  }
});



/* ===============================
   Resize
================================ */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ===============================
   Text Depth Control
================================ */
function updateTextDepth() {
  scenes.forEach(scene => {
    const rect = scene.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;

    const distance = Math.abs(center - viewportCenter);

    // 越远离中心，越暗 / 越模糊
    const opacity = Math.max(0.35, 1 - distance / 600);
    const blur = Math.min(2, distance / 400);

    scene.style.setProperty("--depth-opacity", opacity.toFixed(2));
    scene.style.setProperty("--depth-blur", `${blur.toFixed(2)}px`);
  });
}

window.addEventListener("scroll", updateTextDepth);
window.addEventListener("load", updateTextDepth);
