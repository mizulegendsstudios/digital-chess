// js/sceneManager.js
class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.dayNightCycle = null;
        this.lightingManager = null;
        this.skyboxManager = null;
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        
        // Inicializar los gestores especializados
        this.lightingManager = new LightingManager(this.scene);
        this.skyboxManager = new SkyboxManager(this.scene);
        this.dayNightCycle = new DayNightCycle(
            this.scene, 
            this.lightingManager, 
            this.skyboxManager
        );
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(Config.COLORS.DAY_SKY, 10, 100);
    }
    
    createCamera() {
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
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    update() {
        this.dayNightCycle.update();
    }
}
