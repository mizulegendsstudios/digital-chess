// js/loader.js
// Array con los scripts a cargar en orden específico
const scriptsToLoad = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js',
    'js/config.js',
    'js/styles.js',
    'js/body-content.js',
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

// Función para inyectar estilos y contenido del cuerpo
function injectStylesAndContent() {
    console.log('Inyectando estilos y contenido...');
    
    // Cargar estilos
    if (typeof injectStyles === 'function') {
        injectStyles();
        console.log('Estilos inyectados correctamente');
    } else {
        console.error('La función injectStyles no está disponible');
    }
    
    // Cargar contenido del cuerpo
    if (typeof injectBodyContent === 'function') {
        injectBodyContent();
        console.log('Contenido del cuerpo inyectado correctamente');
    } else {
        console.error('La función injectBodyContent no está disponible');
    }
}

// Función principal para iniciar el juego
async function initGame() {
    try {
        console.log('Iniciando carga del juego...');
        
        // Cargar todos los scripts necesarios
        await loadScriptsSequentially(scriptsToLoad);
        
        console.log('Todos los scripts cargados correctamente');
        
        // Inyectar estilos y contenido del cuerpo
        injectStylesAndContent();
        
        // Verificar que la clase Game esté disponible
        if (typeof Game === 'undefined') {
            throw new Error('La clase Game no está definida');
        }
        
        // Crear e iniciar el juego
        const game = new Game();
        game.start();
        
        console.log('Juego iniciado correctamente');
    } catch (error) {
        console.error('Error al iniciar el juego:', error);
        
        // Mostrar mensaje de error en la página
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.padding = '20px';
        errorDiv.style.fontFamily = 'Arial, sans-serif';
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.right = '0';
        errorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        errorDiv.style.color = 'white';
        errorDiv.style.zIndex = '9999';
        errorDiv.innerHTML = `
            <h2>Error al cargar el juego</h2>
            <p>${error.message}</p>
            <p>Por favor, recarga la página para intentar de nuevo.</p>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Iniciar el juego cuando se cargue la página
window.addEventListener('load', initGame);
