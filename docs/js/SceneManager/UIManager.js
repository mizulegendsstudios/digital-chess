// js/SceneManager/UIManager.js
class UIManager {
    constructor() {
        this.dayTimeElement = document.getElementById('dayTime');
        this.timeDisplayElement = document.getElementById('timeDisplay');
    }
    
    updateDayTime(period) {
        if (this.dayTimeElement) {
            this.dayTimeElement.textContent = period;
        }
    }
    
    updateTimeDisplay(hours, minutes) {
        if (this.timeDisplayElement) {
            this.timeDisplayElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    }
}

// Hacer la clase disponible globalmente
window.UIManager = UIManager;
