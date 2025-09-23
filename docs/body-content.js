// ... (código existente de game.js sin la función injectBodyContent)

// Función para cargar un script externo
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(`Script ${src} cargado`);
        script.onerror = () => reject(new Error(`Error al cargar ${src}`));
        document.head.appendChild(script);
    });
}

// Modificar la función existente para cargar el body-content.js después del CSS
document.addEventListener('DOMContentLoaded', () => {
    // Inyectar CSS principal
    injectCSS(gameCSS, 'game-styles')
        .then(() => {
            // Cargar el script que inyecta el contenido del body
            return loadScript('body-content.js');
        })
        .then(() => {
            // Ahora que el script está cargado, podemos llamar a la función
            return injectBodyContent();
        })
        .then(() => {
            // Preparar elementos para animación
            const uiPanel = document.getElementById('ui');
            const multiplayerPanel = document.getElementById('multiplayer-panel');
            
            if (uiPanel) {
                uiPanel.classList.add('animate-in');
                // Añadir clase de animación a elementos internos
                const uiElements = uiPanel.querySelectorAll('.kamisama-title, .time-display, .game-info, #game-status, #captured-pieces, #restart-button, #move-history');
                uiElements.forEach(el => el.classList.add('panel-element'));
            }
            
            if (multiplayerPanel) {
                multiplayerPanel.classList.add('animate-in');
                // Añadir clase de animación a elementos internos
                const mpElements = multiplayerPanel.querySelectorAll('.connection-status, .player-role, .input-group, #create-room-button, #join-room-button, #room-info');
                mpElements.forEach(el => el.classList.add('panel-element'));
            }
            
            // Iniciar animaciones
            startAnimations();
            
            // Ahora que el body está inyectado, podemos cargar el script del juego
            return loadScript('chess-game.js');
        })
        .then(() => {
            console.log('Todos los recursos cargados correctamente');
        })
        .catch(console.error);
});
