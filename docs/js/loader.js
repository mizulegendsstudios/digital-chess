// js/loader.js

import { initGame } from './loader/appInitializer.js';
import { showErrorToUser, logError } from './loader/errorHandler.js';

// Función principal que se ejecuta al cargar la página
async function onLoad() {
    try {
        await initGame();
    } catch (error) {
        logError(error);
        showErrorToUser(error);
    }
}

// Iniciar el juego cuando se cargue la página
window.addEventListener('load', onLoad);
