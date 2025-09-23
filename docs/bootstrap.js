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
    loadScript('styles.js')
        .then(() => {
            // Ahora que styles.js está cargado, podemos usar sus funciones
            // Inyectar CSS
            return injectCSS(gameCSS, 'game-styles');
        })
        .then(() => {
            // Cargar contenido del body
            return fetch('body-content.js')
                .then(response => response.text())
                .then(html => {
                    document.body.innerHTML = html;
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
            // Cargar script principal del juego
            return loadScript('game.js');
        })
        .then(() => {
            // Iniciar animaciones después de cargar todo
            startAnimations();
        })
        .catch(error => {
            console.error('Error durante la carga:', error);
        });
});
