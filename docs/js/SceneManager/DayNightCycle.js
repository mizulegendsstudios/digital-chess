// js/SceneManager/DayNightCycle.js
class DayNightCycle {
    constructor(scene, lightingManager, skyboxManager, uiManager) {
        this.scene = scene;
        this.lightingManager = lightingManager;
        this.skyboxManager = skyboxManager;
        this.uiManager = uiManager;
        this.dayTime = 12; // 0-24 horas
    }
    
    update() {
        this.dayTime += Config.DAY_CYCLE_SPEED;
        if (this.dayTime >= 24) this.dayTime = 0;
        
        // Calcular posición del sol/luna
        const sunAngle = (this.dayTime / 24) * Math.PI * 2;
        const sunX = Math.cos(sunAngle) * 30;
        const sunY = Math.sin(sunAngle) * 30 + 20;
        const moonX = -Math.cos(sunAngle) * 30;
        const moonY = -Math.sin(sunAngle) * 30 + 20;
        
        this.lightingManager.updateSunPosition(sunX, sunY, 10);
        this.lightingManager.updateMoonPosition(moonX, moonY, -10);
        
        // Cambiar intensidad de la luz según la hora
        const sunIntensity = Math.max(0, Math.sin(sunAngle));
        const moonIntensity = Math.max(0, -Math.sin(sunAngle));
        
        this.lightingManager.setSunIntensity(sunIntensity);
        this.lightingManager.setMoonIntensity(moonIntensity * 0.3);
        
        // Cambiar color del cielo
        const skyInfo = this.calculateSkyColor();
        this.skyboxManager.setSkyColor(skyInfo.color);
        this.skyboxManager.setStarsOpacity(moonIntensity);
        
        // Actualizar UI
        this.updateUI(skyInfo.period);
    }
    
    calculateSkyColor() {
        let skyColor;
        let period;
        
        if (this.dayTime >= 6 && this.dayTime < 18) {
            // Día
            skyColor = new THREE.Color(Config.COLORS.DAY_SKY);
            period = 'Día';
        } else if (this.dayTime >= 18 && this.dayTime < 20) {
            // Atardecer
            skyColor = new THREE.Color().lerpColors(
                new THREE.Color(Config.COLORS.DAY_SKY), 
                new THREE.Color(Config.COLORS.SUNSET_SKY), 
                (this.dayTime - 18) / 2
            );
            period = 'Atardecer';
        } else if (this.dayTime >= 20 || this.dayTime < 6) {
            // Noche
            skyColor = new THREE.Color(Config.COLORS.NIGHT_SKY);
            period = 'Noche';
        } else {
            // Amanecer
            skyColor = new THREE.Color().lerpColors(
                new THREE.Color(Config.COLORS.SUNSET_SKY), 
                new THREE.Color(Config.COLORS.DAY_SKY), 
                (this.dayTime - 4) / 2
            );
            period = 'Amanecer';
        }
        
        return { color: skyColor, period };
    }
    
    updateUI(period) {
        const hours = Math.floor(this.dayTime);
        const minutes = Math.floor((this.dayTime - hours) * 60);
        
        this.uiManager.updateDayTime(period);
        this.uiManager.updateTimeDisplay(hours, minutes);
    }
}

// Hacer la clase disponible globalmente
window.DayNightCycle = DayNightCycle;
