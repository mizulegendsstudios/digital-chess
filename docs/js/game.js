// Función principal para inicializar el juego
function initGame() {
    // Inicializar escena
    initScene();
    
    // Crear tablero
    createBoard();
    
    // Inicializar piezas
    initializePieces();
    
    // Configurar controles
    setupControls();
    
    // Configurar multijugador
    setupMultiplayerUI();
    
    // Iniciar bucle de animación
    animate();
}

// Bucle de animación
function animate() {
    requestAnimationFrame(animate);
    
    // Actualizar controles de cámara
    updateCameraControls();
    
    // Actualizar sistemas
    updateDayNightCycle();
    updateFPS();
    
    window.renderer.render(window.scene, window.camera);
}

// Iniciar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', initGame);
