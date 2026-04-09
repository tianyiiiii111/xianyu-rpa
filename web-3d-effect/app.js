// 3D Effect with Three.js

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);

// Torus (主环)
const torusGeometry = new THREE.TorusGeometry(2, 0.5, 16, 100);
const torusMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff, shininess: 100 });
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
scene.add(torus);

// Orbiting spheres
const spheres = [];
for (let i = 0; i < 5; i++) {
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 32, 32),
        new THREE.MeshPhongMaterial({ color: 0xff00ff })
    );
    spheres.push(sphere);
    scene.add(sphere);
}

// Particles
const particleCount = 500;
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Lights
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

camera.position.z = 8;

let speed = 0.01;
let angle = 0;

// Animation
function animate() {
    requestAnimationFrame(animate);
    
    torus.rotation.x += speed;
    torus.rotation.y += speed;
    
    angle += speed * 2;
    spheres.forEach((sphere, i) => {
        const radius = 4;
        const sphereAngle = angle + (i * Math.PI * 2) / 5;
        sphere.position.x = Math.cos(sphereAngle) * radius;
        sphere.position.y = Math.sin(sphereAngle) * radius;
    });
    
    particles.rotation.y += speed * 0.5;
    
    renderer.render(scene, camera);
}

// Controls
document.getElementById('speed').addEventListener('input', (e) => {
    speed = e.target.value / 5000;
});

document.getElementById('particles').addEventListener('input', (e) => {
    // Reload particles on change
});

document.getElementById('toggle').addEventListener('click', () => {
    camera.position.z = camera.position.z === 8 ? 15 : 8;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();