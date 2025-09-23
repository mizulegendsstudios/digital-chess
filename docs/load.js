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

// Función para verificar si un elemento existe antes de intentar manipularlo
function safeElementQuery(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Elemento no encontrado: ${selector}`);
    }
    return element;
}

// Modificar la función existente para cargar el body-content.js después del CSS
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado, iniciando proceso de inicialización...");
    
    // Inyectar CSS principal
    injectCSS(gameCSS, 'game-styles')
        .then(() => {
            console.log("CSS inyectado correctamente");
            // Cargar el script que inyecta el contenido del body
            return loadScript('body-content.js');
        })
        .then(() => {
            console.log("Script body-content.js cargado");
            // Verificar si la función existe antes de llamarla
            if (typeof injectBodyContent === 'function') {
                console.log("Llamando a injectBodyContent...");
                return injectBodyContent();
            } else {
                console.error("La función injectBodyContent no está definida");
                throw new Error("La función injectBodyContent no está definida");
            }
        })
        .then(() => {
            console.log("Contenido del body inyectado");
            
            // Preparar elementos para animación
            const uiPanel = safeElementQuery('#ui');
            const multiplayerPanel = safeElementQuery('#multiplayer-panel');
            
            if (uiPanel) {
                uiPanel.classList.add('animate-in');
                // Añadir clase de animación a elementos internos
                const uiElements = uiPanel.querySelectorAll('.kamisama-title, .time-display, .game-info, #game-status, #captured-pieces, #restart-button, #move-history');
                uiElements.forEach(el => el.classList.add('panel-element'));
                console.log("Panel UI preparado para animación");
            }
            
            if (multiplayerPanel) {
                multiplayerPanel.classList.add('animate-in');
                // Añadir clase de animación a elementos internos
                const mpElements = multiplayerPanel.querySelectorAll('.connection-status, .player-role, .input-group, #create-room-button, #join-room-button, #room-info');
                mpElements.forEach(el => el.classList.add('panel-element'));
                console.log("Panel multijugador preparado para animación");
            }
            
            // Iniciar animaciones
            startAnimations();
            console.log("Animaciones iniciadas");
            
            // Ahora que el body está inyectado, podemos cargar el script del juego
            return loadScript('chess-game.js');
        })
        .then(() => {
            console.log('Todos los recursos cargados correctamente');
        })
        .catch(error => {
            console.error('Error durante la inicialización:', error);
            // Mostrar un mensaje de error en la página
            const errorDiv = document.createElement('div');
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '10px';
            errorDiv.style.left = '50%';
            errorDiv.style.transform = 'translateX(-50%)';
            errorDiv.style.padding = '10px';
            errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
            errorDiv.style.color = 'white';
            errorDiv.style.borderRadius = '5px';
            errorDiv.style.zIndex = '1000';
            errorDiv.textContent = 'Error al cargar el juego. Por favor, recarga la página.';
            document.body.appendChild(errorDiv);
        });
});
