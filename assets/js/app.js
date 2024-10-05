document.getElementById('zoomControl').addEventListener('input', function () {
    const zoom = this.value;
    document.querySelector('.solar-system').style.transform = `scale(${zoom})`;
});

document.getElementById('modeSwitch').addEventListener('change', function () {
    document.body.classList.toggle('night-mode', this.checked);
    document.body.classList.toggle('day-mode', !this.checked);
});

document.getElementById('orbitToggle').addEventListener('change', function () {
    document.querySelectorAll('.orbit').forEach(orbit => {
        orbit.style.display = this.checked ? 'block' : 'none';
    });
});

document.getElementById('planetSizeControl').addEventListener('input', function () {
    const size = this.value;
    document.querySelectorAll('.planet img').forEach(img => {
        img.style.width = `${size}px`;
        img.style.height = `${size}px`;
    });
});

let currentSpeeds = {};

function initializeCurrentSpeeds() {
    document.querySelectorAll('.orbit').forEach(orbit => {
        const planet = orbit.querySelector('.planet');
        const orbitSpeed = parseFloat(orbit.getAttribute('data-orbit-speed'));
        currentSpeeds[planet.getAttribute('data-planet')] = { orbitSpeed };
        orbit.style.animationDuration = `${orbitSpeed}s`;
    });
}

function setOrbitSpeed(speed) {
    document.querySelectorAll('.orbit').forEach(orbit => {
        const planet = orbit.querySelector('.planet');
        const planetName = planet.getAttribute('data-planet');
        const currentOrbitSpeed = currentSpeeds[planetName].orbitSpeed;
        const newDuration = (currentOrbitSpeed / speed) * 100;
        orbit.style.animationDuration = `${newDuration}s`;
    });
}

document.getElementById('rotationControl').addEventListener('input', function () {
    const rotationSpeed = this.value;
    document.querySelectorAll('.planet').forEach(planet => {
        const planetName = planet.getAttribute('data-planet');
        const rotationSpeedValue = rotationSpeed * currentSpeeds[planetName].orbitSpeed / 10;
        planet.style.animationDuration = `${rotationSpeedValue}s`;
    });
});

document.getElementById('slowMode').addEventListener('click', () => setOrbitSpeed(20));
document.getElementById('mediumMode').addEventListener('click', () => setOrbitSpeed(50));
document.getElementById('fastMode').addEventListener('click', () => setOrbitSpeed(100));

initializeCurrentSpeeds();

let timeSpent = 0;
setInterval(() => {
    timeSpent += 1;
    document.getElementById('exploreTime').textContent = timeSpent;
}, 1000);

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    if (command.includes("zoom in")) {
        document.querySelector('.solar-system').style.transform = `scale(1.5)`;
    } else if (command.includes("zoom out")) {
        document.querySelector('.solar-system').style.transform = `scale(0.5)`;
    } else if (command.includes("show earth")) {
        alert("Earth: The third planet from the Sun.");
    }
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
};

const speeds = {
    earth: 67000,
    mars: 53979,
    jupiter: 29236,
    comet: 17895,
};

function getRandomChange() {
    return Math.floor(Math.random() * 5) + 1;
}

let direction = 1;

function updateSpeed() {
    Object.keys(speeds).forEach(planet => {
        speeds[planet] += direction * getRandomChange();
        const speedText = `Speed ${speeds[planet].toLocaleString()}/mh`;
        document.querySelector(`.${planet} .speed`).innerText = speedText;
    });
    direction *= -1;
}
setInterval(updateSpeed, 1000);

document.addEventListener('DOMContentLoaded', () => {
    const comet = document.querySelector('.comet');
    const modal = document.getElementById('planet-info-modal');
    const closeModal = document.querySelector('.close');

    comet.addEventListener('click', () => {
        document.getElementById('planet-title').textContent = comet.dataset.planet;
        document.getElementById('planet-description').textContent = "479P/Elenin, with provisional designation P/2011 NO₁, is a periodic comet with an orbital period estimated at 13.3 years. The comet was discovered on 7 July 2011 when the comet was 2.38 AU from the Sun and 1.4 AU from the Earth and had an apparent magnitude of 19.5.";
        document.getElementById('planet-image').src = 'assets/images/comet.png';

        modal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});