// Rust 3D Effect - WebGL Version
// Using Three.js for web rendering

// Scene setup
let scene, camera, renderer;
let torus, spheres = [];
let lights = [];
let frameCount = 0;
let lastTime = performance.now();
let fps = 60;

// Control parameters
let rotationSpeed = 1;
let orbitSpeed = 1;
let emissiveIntensity = 1;

// Initialize the 3D scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(8, 4, 0);
    camera.lookAt(0, 1, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Add objects
    createTorus();
    createSpheres();
    createGround();
    createLights();
    createParticles();

    // Setup controls
    setupControls();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 1000);

    // Start animation
    animate();
}

// Create central torus
function createTorus() {
    const geometry = new THREE.TorusGeometry(1.5, 0.6, 32, 64);
    const material = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x00ffff,
        emissiveIntensity: 0.3
    });
    
    torus = new THREE.Mesh(geometry, material);
    torus.position.set(0, 1.5, 0);
    torus.castShadow = true;
    torus.receiveShadow = true;
    scene.add(torus);
}

// Create orbiting spheres
function createSpheres() {
    const colors = [0xff00ff, 0xffd700, 0x00ff88, 0x8800ff];
    const radii = [3.0, 3.5, 4.0, 4.5];
    const speeds = [0.5, 0.7, 0.6, 0.8];
    const heights = [1.3, 1.6, 1.9, 2.2];

    for (let i = 0; i < 4; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: colors[i],
            metalness: 0.7,
            roughness: 0.3,
            emissive: colors[i],
            emissiveIntensity: 0.5
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        
        sphere.userData = {
            radius: radii[i],
            speed: speeds[i],
            angle: (i / 4) * Math.PI * 2,
            height: heights[i]
        };
        
        spheres.push(sphere);
        scene.add(sphere);
    }
}

// Create ground plane
function createGround() {
    const geometry = new THREE.PlaneGeometry(40, 40);
    const material = new THREE.MeshStandardMaterial({
        color: 0x0a0a15,
        metalness: 0.9,
        roughness: 0.1
    });
    
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add grid helper
    const grid = new THREE.GridHelper(40, 40, 0x00ffff, 0x111122);
    grid.position.y = -0.49;
    scene.add(grid);
}

// Create lights
function createLights() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x202040, 0.5);
    scene.add(ambient);

    // Main directional light
    const directional = new THREE.DirectionalLight(0xfff5e6, 1.5);
    directional.position.set(5, 10, 5);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 2048;
    directional.shadow.mapSize.height = 2048;
    scene.add(directional);

    // Colored point lights
    const pointLightColors = [0x00ffff, 0xff00ff, 0xffd700];
    const pointLightPositions = [
        { x: 4, y: 2, z: 0 },
        { x: -4, y: 2, z: 0 },
        { x: 0, y: 2, z: 4 }
    ];

    for (let i = 0; i < 3; i++) {
        const pointLight = new THREE.PointLight(pointLightColors[i], 1, 15);
        pointLight.position.set(
            pointLightPositions[i].x,
            pointLightPositions[i].y,
            pointLightPositions[i].z
        );
        lights.push(pointLight);
        scene.add(pointLight);
    }
}

// Create particle effects
function createParticles() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = Math.random() * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        
        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.2 + 0.5, 1, 0.6);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    particles.userData.isParticles = true;
    scene.add(particles);
}

// Setup UI controls
function setupControls() {
    document.getElementById('rotationSpeed').addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
    });

    document.getElementById('orbitSpeed').addEventListener('input', (e) => {
        orbitSpeed = parseFloat(e.target.value);
    });

    document.getElementById('emissiveIntensity').addEventListener('input', (e) => {
        emissiveIntensity = parseFloat(e.target.value);
        updateEmissive();
    });
}

// Update emissive intensity
function updateEmissive() {
    if (torus) {
        torus.material.emissiveIntensity = 0.3 * emissiveIntensity;
    }
    spheres.forEach(sphere => {
        sphere.material.emissiveIntensity = 0.5 * emissiveIntensity;
    });
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const time = performance.now() * 0.001;
    const delta = 0.016; // Approximate delta time

    // Rotate torus
    if (torus) {
        torus.rotation.y += 0.5 * delta * rotationSpeed;
        torus.rotation.z += 0.3 * delta * rotationSpeed;
    }

    // Animate orbiting spheres
    spheres.forEach((sphere, index) => {
        sphere.userData.angle += sphere.userData.speed * delta * orbitSpeed;
        sphere.position.x = Math.cos(sphere.userData.angle) * sphere.userData.radius;
        sphere.position.z = Math.sin(sphere.userData.angle) * sphere.userData.radius;
        sphere.position.y = sphere.userData.height + Math.sin(time * 2 + index) * 0.2;
    });

    // Animate camera orbit
    const cameraAngle = time * 0.2;
    camera.position.x = Math.cos(cameraAngle) * 8;
    camera.position.z = Math.sin(cameraAngle) * 8;
    camera.position.y = 4 + Math.sin(cameraAngle) * 0.5;
    camera.lookAt(0, 1, 0);

    // Animate lights
    lights.forEach((light, index) => {
        light.intensity = 1 + Math.sin(time * 2 + index * 2) * 0.3;
    });

    // Update particles
    scene.children.forEach(child => {
        if (child.userData.isParticles) {
            child.rotation.y += 0.0005;
        }
    });

    // Render
    renderer.render(scene, camera);

    // Update FPS counter
    frameCount++;
    const currentTime = performance.now();
    if (currentTime - lastTime >= 1000) {
        fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
        document.getElementById('fps').textContent = fps + ' FPS';
        frameCount = 0;
        lastTime = currentTime;
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);