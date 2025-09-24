// js/SceneManager/LightingManager.js
class LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.sunLight = null;
        this.moonLight = null;
        this.ambientLight = null;
        this.init();
    }
    
    init() {
        this.createSunLight();
        this.createMoonLight();
        this.createAmbientLight();
    }
    
    createSunLight() {
        this.sunLight = new THREE.DirectionalLight(
            Config.COLORS.SUN_LIGHT_COLOR, 
            1
        );
        this.sunLight.position.set(10, 40, 10);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = Config.SHADOW_MAP_WIDTH;
        this.sunLight.shadow.mapSize.height = Config.SHADOW_MAP_HEIGHT;
        this.scene.add(this.sunLight);
    }
    
    createMoonLight() {
        this.moonLight = new THREE.DirectionalLight(
            Config.COLORS.MOON_LIGHT_COLOR, 
            0.3
        );
        this.moonLight.position.set(-10, 40, -10);
        this.moonLight.castShadow = true;
        this.scene.add(this.moonLight);
    }
    
    createAmbientLight() {
        this.ambientLight = new THREE.AmbientLight(
            Config.COLORS.AMBIENT_LIGHT_COLOR, 
            Config.AMBIENT_LIGHT_INTENSITY
        );
        this.scene.add(this.ambientLight);
    }
    
    updateSunPosition(x, y, z) {
        this.sunLight.position.set(x, y, z);
    }
    
    updateMoonPosition(x, y, z) {
        this.moonLight.position.set(x, y, z);
    }
    
    setSunIntensity(intensity) {
        this.sunLight.intensity = intensity;
    }
    
    setMoonIntensity(intensity) {
        this.moonLight.intensity = intensity;
    }
}

export { LightingManager };
