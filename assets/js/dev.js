document
  .getElementById("generateCodeBtn")
  .addEventListener("click", function () {
    const comets = document.getElementById("comets").value;
    const rings = document.getElementById("rings").value;
    const timeRange = document.getElementById("timeRange").value;
    const cometSize = document.getElementById("cometSize").value;
    const orbitSpeed = document.getElementById("orbitSpeed").value;
    const cometColor = document.getElementById("cometColor").value;
    // Integrate Nasa's API
    fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${getDateBeforeYears(
        timeRange
      )}&end_date=${getDateBeforeYears(0)}&api_key=smQJlXpkhawDkKkvaejsrhT7jyxvio2xIzq0L7A8`
    )
      .then((response) => response.json())
      .then((data) => {
        renderOrrery(
          comets,
          rings,
          cometSize,
          cometColor,
          orbitSpeed,
          data.near_earth_objects
        );
      })
      .catch((error) => console.error("Error fetching NASA data:", error));

    const generatedCode = `
    const numberOfComets = ${comets};
    const numberOfRings = ${rings};
    const cometSize = ${cometSize};
    const orbitSpeed = ${orbitSpeed};
    const cometColor = '${cometColor}';
    const timeRange = ${timeRange}; // Years
    
    function renderOrrery() {
      console.log('Rendering Orrery with ' + numberOfComets + ' comets, ' +
      numberOfRings + ' rings, and data from the last ' + timeRange + ' years.');
    }
      
    renderOrrery();
    `;
    document.getElementById("generatedCode").textContent = generatedCode;
  });

document.getElementById("copyCodeBtn").addEventListener("click", function () {
  const code = document.getElementById("generatedCode").textContent;
  navigator.clipboard
    .writeText(code)
    .then(function () {
      alert("Code copied to clipboard!");
    })
    .catch(function (err) {
      console.error("Failed to copy text: ", err);
    });
});

function getDateBeforeYears(years) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().split("T")[0];
}

function renderOrrery(comets, rings, cometSize, cometColor, orbitSpeed, celestialData) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  const container = document.getElementById('scene-container');
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;

  renderer.setSize(containerWidth, containerHeight);
  container.innerHTML = ''; // Clear any previous rendring
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(50, 50, 50);
  scene.add(pointLight);

  for (let i = 0; i < comets; i++) {
    const geometry = new THREE.SphereGeometry(0.5 * cometSize, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: cometColor });
    const comet = new THREE.Mesh(geometry, material);

    comet.position.x = Math.random() * 50 - 25;
    comet.position.y = Math.random() * 50 - 25;
    comet.position.z = Math.random() * 50 - 25;

    scene.add(comet);
  }

  // Add rings
  for (let i = 0; i < rings; i++) {
    const ringGeometry = new THREE.RingGeometry(5 + i * 2, 6 + i * 2, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
  }
  camera.position.z = 50;

  // Resizing
  window.addEventListener('resize', () => {
    const newContainerWidth = container.offsetWidth;
    const newContainerHeight = container.offsetHeight;
    renderer.setSize(newContainerWidth, newContainerHeight);
    camera.aspect = newContainerWidth / newContainerHeight;
    camera.updateProjectionMatrix();
  });

  // Start the Animation
  function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += parseFloat(orbitSpeed);
    renderer.render(scene, camera);
  }
  animate();
}