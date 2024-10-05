fetch(
  `https://api.nasa.gov/neo/rest/v1/feed?start_date=2024-09-25&end_date=2024-09-26&api_key=smQJlXpkhawDkKkvaejsrhT7jyxvio2xIzq0L7A8`
)
  .then((response) => response.json())
  .then((data) => {
    const neoObjects = data.near_earth_objects["2024-09-25"];
    neoObjects.forEach((neo) => {
      const size = neo.estimated_diameter.meters.estimated_diameter_max;
      const distance = neo.close_approach_data[0].miss_distance.kilometers;
      const name = neo.name;
      createCometWithRing(name, size, distance);
    });
  })
  .catch((error) => console.error("Error:", error));

function getRandomColor() {
  return new THREE.Color(Math.random(), Math.random(), Math.random());
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("orbitCanvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const comets = [];
const rings = [];
const cometGeometry = new THREE.SphereGeometry(0.5, 16, 16);

const cometNames = [
  "Halley",
  "Encke",
  "Hale-Bopp",
  "Hyakutake",
  "Tempel-Tuttle",
  "Swift-Tuttle",
  "Borrelly",
  "Wild 2",
  "Ikeya-Seki",
  "McNaught",
];

const cometTypeColors = {
  "Near-Earth Asteroids": 0xff0000,
  "Near-Earth Comets": 0x00ff00,
  "Potentially Hazardous Asteroids": 0x0000ff,
};

const cometTypes = [
  "Near-Earth Asteroids",
  "Near-Earth Comets",
  "Potentially Hazardous Asteroids",
];

function createCometWithRing() {
  const type = cometTypes[Math.floor(Math.random() * cometTypes.length)];
  const cometColor = cometTypeColors[type];
  const cometMaterial = new THREE.MeshBasicMaterial({ color: cometColor });
  const comet = new THREE.Mesh(cometGeometry, cometMaterial);
  const cometLabel = createSpriteLabel(type);
  cometLabel.position.y = 1;
  comet.add(cometLabel);
  const radius = Math.random() * 50 + 20;
  const speed = Math.random() * 0.01 + 0.001;
  const ringGeometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  rings.push(ring);
  scene.add(ring);
  comet.angle = Math.random() * Math.PI * 2;
  comet.radius = radius;
  comet.speed = speed;
  comet.orbitRing = ring;
  comets.push(comet);
  scene.add(comet);
}

for (let i = 0; i < 10; i++) {
  createCometWithRing();
}

camera.position.set(0, 100, 0);
camera.lookAt(0, 0, 0);

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeed = 0.005;
let panSpeed = 0.5;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
let isPanning = false;
let cameraOffset = new THREE.Vector3(0, 0, 100);

document.addEventListener("mousedown", function (e) {
  if (e.button === 0) {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    isPanning = e.shiftKey;
  }
});

document.addEventListener("mousemove", function (e) {
  if (isDragging) {
    let deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y,
    };

    if (isPanning) {
      cameraOffset.x -= deltaMove.x * panSpeed * 0.01;
      cameraOffset.y += deltaMove.y * panSpeed * 0.01;
    } else {
      targetRotationY += deltaMove.x * rotationSpeed;
      targetRotationX += deltaMove.y * rotationSpeed;
      targetRotationX = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, targetRotationX)
      );
    }

    previousMousePosition = { x: e.clientX, y: e.clientY };
  }
});

document.addEventListener("mouseup", function () {
  isDragging = false;
});

function animate() {
  requestAnimationFrame(animate);
  currentRotationX += (targetRotationX - currentRotationX) * 0.1;
  currentRotationY += (targetRotationY - currentRotationY) * 0.1;
  camera.position.x =
    cameraOffset.x +
    100 * Math.sin(currentRotationY) * Math.cos(currentRotationX);
  camera.position.z =
    cameraOffset.z +
    100 * Math.cos(currentRotationY) * Math.cos(currentRotationX);
  camera.position.y = cameraOffset.y + 100 * Math.sin(currentRotationX);
  camera.lookAt(scene.position);

  comets.forEach((comet) => {
    comet.angle += comet.speed;
    comet.position.x = comet.radius * Math.cos(comet.angle);
    comet.position.z = comet.radius * Math.sin(comet.angle);
  });

  renderer.render(scene, camera);
}

animate();

document.addEventListener("wheel", function (e) {
  if (e.deltaY < 0) {
    camera.position.y -= 5;
  } else {
    camera.position.y += 5;
  }
});

let zoomLevel = 1;
const zoomSpeed = 0.1;

document.addEventListener("wheel", function (event) {
  event.preventDefault();
  if (event.deltaY < 0) {
    zoomLevel -= zoomSpeed;
  } else {
    zoomLevel += zoomSpeed;
  }

  zoomLevel = Math.min(Math.max(0.5, zoomLevel), 5);
  updateZoom();
});

function updateZoom() {
  const orreryElement = document.getElementById("orrery");
  orreryElement.style.transform = `scale(${zoomLevel})`;
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function createSpriteLabel(text) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const fontSize = 24;
  context.font = `${fontSize}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const textWidth = context.measureText(text).width;
  const textHeight = fontSize;
  const scaleFactor = 2;
  canvas.width = textWidth * scaleFactor;
  canvas.height = textHeight * scaleFactor;
  context.scale(scaleFactor, scaleFactor);
  context.fillStyle = "#000000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.fillText(text, textWidth / 2, textHeight / 2);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(textWidth / 10, textHeight / 10, 1);
  return sprite;
}

scene.background = new THREE.Color(0x000000);