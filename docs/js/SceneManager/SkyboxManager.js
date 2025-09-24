// js/SceneManager/SkyboxManager.js
class SkyboxManager {
    constructor(scene) {
        this.scene = scene;
        this.stars = null;
        this.renderer = null; // Se establecerá desde SceneManager
        this.init();
    }
    
    init() {
        this.createStars();
    }
    
    setRenderer(renderer) {
        this.renderer = renderer;
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
    
    setStarsOpacity(opacity) {
        if (this.stars) {
            this.stars.material.opacity = opacity;
        }
    }
    
    setSkyColor(color) {
        this.scene.fog.color = color;
        if (this.renderer) {
            this.renderer.setClearColor(color);
        }
    }
}

export { SkyboxManager };
