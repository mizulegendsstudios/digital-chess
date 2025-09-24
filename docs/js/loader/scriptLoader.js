// js/loader/scriptLoader.js

// Array con los scripts a cargar en orden específico
const scriptsToLoad = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js',
    'js/config.js',
    'js/styles.js',
    'js/body-content.js',
    'js/SceneManager/LightingManager.js',
    'js/SceneManager/SkyboxManager.js',
    'js/SceneManager/UIManager.js',
    'js/SceneManager/DayNightCycle.js',
    'js/sceneManager.js',
    'js/boardBuilder.js',
    'js/pieceFactory.js',
    'js/gameLogic.js',
    'js/inputHandler.js',
    'js/multiplayer.js',
    'js/game.js'
];

// Función para cargar scripts de forma secuencial
async function loadScriptsSequentially(scripts) {
    for (const src of scripts) {
        await loadScript(src);
    }
}

// Función para cargar un script individual
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Verificar si el script ya está cargado
        if (document.querySelector(`script[src="${src}"]`)) {
            console.log(`Script ya cargado: ${src}`);
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            console.log(`Script cargado: ${src}`);
            resolve();
        };
        script.onerror = () => {
            console.error(`Error al cargar el script: ${src}`);
            reject(new Error(`Error al cargar el script: ${src}`));
        };
        document.head.appendChild(script);
    });
}

// Exportar las funciones necesarias
window.scriptsToLoad = scriptsToLoad;
window.loadScriptsSequentially = loadScriptsSequentially;
window.loadScript = loadScript;
