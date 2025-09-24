// js/loader/appInitializer.js

import { loadScriptsSequentially, scriptsToLoad } from './scriptLoader.js';

// Cargar estilos y contenido del cuerpo
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
        
        // Esperar un poco a que el DOM se actualice
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Verificar que la clase Game esté disponible
        if (typeof Game === 'undefined') {
            throw new Error('La clase Game no está definida');
        }
        
        // Verificar que los elementos necesarios existan en el DOM
        const requiredElements = [
            'voxelCount',
            'restart-button',
            'create-room-button',
            'join-room-button'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('Elementos faltantes en el DOM:', missingElements);
            throw new Error(`Faltan elementos necesarios en el DOM: ${missingElements.join(', ')}`);
        }
        
        // Crear e iniciar el juego
        const game = new Game();
        game.start();
        
        console.log('Juego iniciado correctamente');
        return game;
    } catch (error) {
        console.error('Error al iniciar el juego:', error);
        throw error; // Re-lanzamos el error para que lo maneje el errorHandler
    }
}

// Exportar las funciones necesarias
export { initGame };
