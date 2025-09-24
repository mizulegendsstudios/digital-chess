// js/loader/errorHandler.js

// Función para mostrar errores en la interfaz de usuario
function showErrorToUser(error) {
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

// Función para registrar errores en la consola
function logError(error) {
    console.error('Error en la aplicación:', error);
}

// Exportar las funciones necesarias
export { showErrorToUser, logError };
