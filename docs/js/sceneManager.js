// Inicialización de la escena
function initScene() {
    // Crear escena
    window.scene = new THREE.Scene();
    window.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    
    // Configurar cámara
    window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    window.camera.position.set(0, 30, 30);
    window.camera.lookAt(0, 0, 0);
    
    // Configurar renderizador
    window.renderer = new THREE.WebGLRenderer({ antialias: true });
    window.renderer.setSize(window.innerWidth, window.innerHeight);
    window.renderer.setPixelRatio(window.devicePixelRatio);
    window.renderer.shadowMap.enabled = true;
    window.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(window.renderer.domElement);
    
    // Sistema de iluminación
    setupLighting();
    
    // Sistema de día/noche
    setupDayNightCycle();
    
    return { scene: window.scene, camera: window.camera, renderer: window.renderer };
}

// Funciones de iluminación y ciclo día/noche
function setupLighting() {
    // Crear luces
    window.sunLight = new THREE.DirectionalLight(0xffffff, 1);
    window.sunLight.position.set(10, 40, 10);
    window.sunLight.castShadow = true;
    window.sunLight.shadow.mapSize.width = 2048;
    window.sunLight.shadow.mapSize.height = 2048;
    window.scene.add(window.sunLight);

    window.moonLight = new THREE.DirectionalLight(0x6495ED, 0.3);
    window.moonLight.position.set(-10, 40, -10);
    window.moonLight.castShadow = true;
    window.scene.add(window.moonLight);

    window.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    window.scene.add(window.ambientLight);
}

function setupDayNightCycle() {
    // Crear estrellas
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const starsPositions = new Float32Array(starsCount * 3);

    for(let i = 0; i < starsCount * 3; i++) {
        starsPositions[i] = (Math.random() - 0.5) * 300;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.5,
        color: 0xffffff,
        transparent: true,
        opacity: 0
    });
    
    window.stars = new THREE.Points(starsGeometry, starsMaterial);
    window.scene.add(window.stars);
}

function updateDayNightCycle() {
    // Actualizar ciclo día/noche
    window.dayTime += 0.001;
    if (window.dayTime >= 24) window.dayTime = 0;
    
    // Calcular posición del sol/luna
    const sunAngle = (window.dayTime / 24) * Math.PI * 2;
    window.sunLight.position.x = Math.cos(sunAngle) * 30;
    window.sunLight.position.y = Math.sin(sunAngle) * 30 + 20;
    
    window.moonLight.position.x = -Math.cos(sunAngle) * 30;
    window.moonLight.position.y = -Math.sin(sunAngle) * 30 + 20;
    
    // Cambiar intensidad de la luz según la hora
    let sunIntensity = Math.max(0, Math.sin(sunAngle));
    let moonIntensity = Math.max(0, -Math.sin(sunAngle));
    
    window.sunLight.intensity = sunIntensity;
    window.moonLight.intensity = moonIntensity * 0.3;
    
    // Cambiar color del cielo
    let skyColor;
    if (window.dayTime >= 6 && window.dayTime < 18) {
        skyColor = new THREE.Color(0x87CEEB);
        document.getElementById('dayTime').textContent = 'Día';
    } else if (window.dayTime >= 18 && window.dayTime < 20) {
        skyColor = new THREE.Color().lerpColors(
            new THREE.Color(0x87CEEB), 
            new THREE.Color(0xFF4500), 
            (window.dayTime - 18) / 2
        );
        document.getElementById('dayTime').textContent = 'Atardecer';
    } else if (window.dayTime >= 20 || window.dayTime < 6) {
        skyColor = new THREE.Color(0x191970);
        document.getElementById('dayTime').textContent = 'Noche';
    } else {
        skyColor = new THREE.Color().lerpColors(
            new THREE.Color(0xFF4500), 
            new THREE.Color(0x87CEEB), 
            (window.dayTime - 4) / 2
        );
        document.getElementById('dayTime').textContent = 'Amanecer';
    }
    
    window.scene.fog.color = skyColor;
    window.renderer.setClearColor(skyColor);
    
    // Mostrar/ocultar estrellas
    window.stars.material.opacity = moonIntensity;
    
    // Actualizar reloj
    const hours = Math.floor(window.dayTime);
    const minutes = Math.floor((window.dayTime - hours) * 60);
    document.getElementById('timeDisplay').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Exponer funciones globalmente
window.initScene = initScene;
window.updateDayNightCycle = updateDayNightCycle;
