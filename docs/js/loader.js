// Función para cargar scripts de forma secuencial
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Iniciar el proceso de carga
document.addEventListener('DOMContentLoaded', () => {
    // Cargar el archivo de estilos primero
    loadScript('js/styles.js')
        .then(() => {
            // Ahora que styles.js está cargado, podemos usar sus funciones
            // Inyectar CSS
            return injectCSS(gameCSS, 'game-styles');
        })
        .then(() => {
            // Cargar contenido del body
            return fetch('js/body-content.js')
                .then(response => response.text())
                .then(html => {
                    // Evaluar el contenido para obtener la variable bodyContent
                    eval(html);
                    document.body.innerHTML = window.bodyContent;
                });
        })
        .then(() => {
            // Cargar bibliotecas externas
            return loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        })
        .then(() => {
            return loadScript('https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js');
        })
        .then(() => {
            // Cargar scripts del juego en orden
            return loadScript('js/config.js');
        })
        .then(() => {
            return loadScript('js/sceneManager.js');
        })
        .then(() => {
            return loadScript('js/boardBuilder.js');
        })
        .then(() => {
            return loadScript('js/pieceFactory.js');
        })
        .then(() => {
            return loadScript('js/gameLogic.js');
        })
        .then(() => {
            return loadScript('js/inputHandler.js');
        })
        .then(() => {
            return loadScript('js/multiplayer.js');
        })
        .then(() => {
            // Cargar script principal del juego
            return loadScript('js/game.js');
        })
        .catch(error => {
            console.error('Error durante la carga:', error);
        });
});
