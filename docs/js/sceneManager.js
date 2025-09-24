// js/sceneManager.js
class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sunLight = null;
        this.moonLight = null;
        this.ambientLight = null;
        this.stars = null;
        this.dayTime = 12; // 0-24 horas
        this.init();
    }
    
    init() {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(Config.COLORS.DAY_SKY, 10, 100);
        
        // Crear cámara
        this.camera = new THREE.PerspectiveCamera(
            Config.CAMERA_FOV, 
            window.innerWidth / window.innerHeight, 
            Config.CAMERA_NEAR, 
            Config.CAMERA_FAR
        );
        this.camera.position.set(
            Config.CAMERA_INITIAL_POSITION.x,
            Config.CAMERA_INITIAL_POSITION.y,
            Config.CAMERA_INITIAL_POSITION.z
        );
        this.camera.lookAt(0, 0, 0);
        
        // Crear renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        
        // Crear luces
        this.createLights();
        
        // Crear estrellas
        this.createStars();
        
        // Manejar resize de ventana
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createLights() {
        // Luz del sol
        this.sunLight = new THREE.DirectionalLight(
            Config.COLORS.SUN_LIGHT_COLOR, 
            1
        );
        this.sunLight.position.set(10, 40, 10);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = Config.SHADOW_MAP_WIDTH;
        this.sunLight.shadow.mapSize.height = Config.SHADOW_MAP_HEIGHT;
        this.scene.add(this.sunLight);
        
        // Luz de la luna
        this.moonLight = new THREE.DirectionalLight(
            Config.COLORS.MOON_LIGHT_COLOR, 
            0.3
        );
        this.moonLight.position.set(-10, 40, -10);
        this.moonLight.castShadow = true;
        this.scene.add(this.moonLight);
        
        // Luz ambiental
        this.ambientLight = new THREE.AmbientLight(
            Config.COLORS.AMBIENT_LIGHT_COLOR, 
            Config.AMBIENT_LIGHT_INTENSITY
        );
        this.scene.add(this.ambientLight);
    }
    
    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = Config.STARS_COUNT;
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
        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    }
    
    updateDayNightCycle() {
        this.dayTime += Config.DAY_CYCLE_SPEED;
        if (this.dayTime >= 24) this.dayTime = 0;
        
        // Calcular posición del sol/luna
        const sunAngle = (this.dayTime / 24) * Math.PI * 2;
        this.sunLight.position.x = Math.cos(sunAngle) * 30;
        this.sunLight.position.y = Math.sin(sunAngle) * 30 + 20;
        
        this.moonLight.position.x = -Math.cos(sunAngle) * 30;
        this.moonLight.position.y = -Math.sin(sunAngle) * 30 + 20;
        
        // Cambiar intensidad de la luz según la hora
        let sunIntensity = Math.max(0, Math.sin(sunAngle));
        let moonIntensity = Math.max(0, -Math.sin(sunAngle));
        
        this.sunLight.intensity = sunIntensity;
        this.moonLight.intensity = moonIntensity * 0.3;
        
        // Cambiar color del cielo
        let skyColor;
        let dayTimeText;
        
        if (this.dayTime >= 6 && this.dayTime < 18) {
            // Día
            skyColor = new THREE.Color(Config.COLORS.DAY_SKY);
            dayTimeText = 'Día';
        } else if (this.dayTime >= 18 && this.dayTime < 20) {
            // Atardecer
            skyColor = new THREE.Color().lerpColors(
                new THREE.Color(Config.COLORS.DAY_SKY), 
                new THREE.Color(Config.COLORS.SUNSET_SKY), 
                (this.dayTime - 18) / 2
            );
            dayTimeText = 'Atardecer';
        } else if (this.dayTime >= 20 || this.dayTime < 6) {
            // Noche
            skyColor = new THREE.Color(Config.COLORS.NIGHT_SKY);
            dayTimeText = 'Noche';
        } else {
            // Amanecer
            skyColor = new THREE.Color().lerpColors(
                new THREE.Color(Config.COLORS.SUNSET_SKY), 
                new THREE.Color(Config.COLORS.DAY_SKY), 
                (this.dayTime - 4) / 2
            );
            dayTimeText = 'Amanecer';
        }
        
        this.scene.fog.color = skyColor;
        this.renderer.setClearColor(skyColor);
        
        // Mostrar/ocultar estrellas
        this.stars.material.opacity = moonIntensity;
        
        // Actualizar UI
        document.getElementById('dayTime').textContent = dayTimeText;
        
        // Actualizar reloj
        const hours = Math.floor(this.dayTime);
        const minutes = Math.floor((this.dayTime - hours) * 60);
        document.getElementById('timeDisplay').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
