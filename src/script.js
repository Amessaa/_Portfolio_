import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {};
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = 0.2;
parameters.randomnessPower = 3;
parameters.insideColor = "#ff6030";
parameters.outsideColor = "#1b3984";

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
  // Destroy old galaxy
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    // Position
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;

    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Color
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  /**
   * Material
   */
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  /**
   * Points
   */
  points = new THREE.Points(geometry, material);

  scene.add(points);
};

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Debug

if (sizes.width > 300) {
  const gui = new dat.GUI({ _closed: true });

  gui
    .add(parameters, "count")
    .min(100)
    .max(1000000)
    .step(100)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "size")
    .min(0.001)
    .max(0.1)
    .step(0.001)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "radius")
    .min(0.01)
    .max(20)
    .step(0.01)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "branches")
    .min(2)
    .max(20)
    .step(1)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "spin")
    .min(-5)
    .max(5)
    .step(0.001)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "randomness")
    .min(0)
    .max(2)
    .step(0.001)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "randomnessPower")
    .min(1)
    .max(10)
    .step(0.001)
    .onFinishChange(generateGalaxy);
  gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
  gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);
}

// Call the function initially to set the initial width

generateGalaxy();

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

/**
 * Camera
 */
// Base camera
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 0;
camera.position.z = 3;
cameraGroup.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//gltf

const gltfLoader = new GLTFLoader();
let model = null;
gltfLoader.load("/models/planet/planet/scene.gltf", (gltf) => {
  model = gltf.scene;

  if (window.innerWidth <= 300) {
    gltf.scene.scale.set(1.5, 1.5, 1.5);
    model.position.set(-2, -1, -2);
  } else {
    gltf.scene.scale.set(1.2, 1.2, 1.2);
    model.position.set(2.75, -0.2, 0);
  }
});

//SKILLS

// Function to create a cube with text
let cube = null;
function createTextCube(picture, position) {
  const cubeGeometry = new THREE.SphereGeometry(0.5, 16, 32);
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(picture);
  const cubeMaterial = new THREE.MeshBasicMaterial({ map: texture });

  cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  scene.add(cube);
  cube.position.x = position;
  cube.position.z = -cube.position.x;

  return { cube }; // Return the cube and text mesh for removal later
}

let skillCubes = []; // Array to store created cubes

// Function to initialize skill cubes
function initSkillCubes() {
  // Create cubes with text
  skillCubes.push(createTextCube("pictures/webdev4.png", -4));
  skillCubes.push(createTextCube("pictures/DSA2.png", -2));
  skillCubes.push(createTextCube("pictures/ML2.png", -0.7));
  skillCubes.push(createTextCube("pictures/DBMS2.png", 0.5));
  skillCubes.push(createTextCube("pictures/OOPS2.png", 1.5));
  skillCubes.push(createTextCube("pictures/OS2.png", 2.5));
}

// Function to remove skill cubes from the scene
function removeSkillCubes() {
  skillCubes.forEach(({ cube }) => {
    scene.remove(cube);
  });
  skillCubes = [];
}

//SCROLL
let scrollY = window.scrollY;
let modelAdded,
  skilladded = false;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY - 0.5;

  cameraGroup.position.y = Math.sin(
    cameraGroup.position.x + scrollY / window.innerHeight
  );
  cameraGroup.position.z = Math.cos(
    cameraGroup.position.x + scrollY / window.innerHeight
  );

  const modelContainer = document.getElementById("model-container");
  const modelContainerTop = modelContainer.offsetTop + 60;
  const modelContainerBottom = modelContainerTop + window.innerHeight;

  if (scrollY >= modelContainerTop && scrollY <= modelContainerBottom - 150) {
    if (!modelAdded && model) {
      const pointLight = new THREE.PointLight("#fff", 1, 100);
      pointLight.position.set(2.5, 0, 2);
      modelAdded = true;
      scene.add(model, pointLight);
    }
  } else {
    if (modelAdded && model) {
      scene.remove(model);
      modelAdded = false;
    }
  }
});

//Background Sound

let isSoundPlaying = true;
const backgroundSound = document.getElementById("backgroundSound");
backgroundSound.play();

function toggleBackgroundSound() {
  if (isSoundPlaying) {
    backgroundSound.pause();
  } else {
    backgroundSound.play();
  }

  isSoundPlaying = !isSoundPlaying;
}

document.addEventListener("click", toggleBackgroundSound);

//SKILLS

document.addEventListener("DOMContentLoaded", function () {
  const skills = document.querySelectorAll(".skill");

  skills.forEach((skill) => {
    const progress = skill.getAttribute("data-progress") / 100;
    const progressBar = skill.querySelector(".progress");
    progressBar.style.setProperty("--progress", progress);
  });
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  points.rotation.y = elapsedTime * 0.4;

  //Model
  if (model) {
    model.rotation.y = elapsedTime;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
