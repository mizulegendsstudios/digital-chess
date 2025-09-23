// CSS principal que se cargará dinámicamente
const gameCSS = `
    body { 
        margin: 0; 
        overflow: hidden; 
        background: linear-gradient(to bottom, #87CEEB 0%, #98D8E8 50%, #FDB813 100%); 
    }
    canvas { 
        display: block; 
    }
    #ui {
        position: absolute;
        top: 10px;
        left: 10px;
        color: white;
        font-family: 'Courier New', monospace;
        background: rgba(0,0,0,0.7);
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #444;
        z-index: 100;
        max-width: 300px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    #ui.visible {
        opacity: 1;
        transform: translateY(0);
    }
    #controls {
        margin-bottom: 10px;
    }
    #info {
        font-size: 12px;
        color: #aaa;
    }
    .key {
        display: inline-block;
        background: #333;
        padding: 2px 6px;
        border-radius: 3px;
        margin: 0 2px;
        border: 1px solid #555;
    }
    .kamisama-title {
        color: #FFD700;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        margin-bottom: 10px;
    }
    .time-display {
        font-size: 14px;
        margin-top: 10px;
        padding: 5px;
        background: rgba(0,0,0,0.5);
        border-radius: 3px;
    }
    .game-info {
        margin-top: 10px;
        padding: 5px;
        background: rgba(0,0,0,0.5);
        border-radius: 3px;
    }
    .turn-indicator {
        display: flex;
        align-items: center;
        margin-top: 5px;
    }
    .turn-indicator-white {
        color: #ffffff;
        background: rgba(255,255,255,0.2);
        padding: 3px 6px;
        border-radius: 3px;
    }
    .turn-indicator-black {
        color: #333333;
        background: rgba(0,0,0,0.2);
        padding: 3px 6px;
        border-radius: 3px;
    }
    #game-status {
        margin-top: 10px;
        padding: 5px;
        background: rgba(255,215,0,0.2);
        border-radius: 3px;
        border: 1px solid #FFD700;
        color: #FFD700;
    }
    #captured-pieces {
        margin-top: 10px;
        font-size: 11px;
    }
    .captured-white {
        color: #ffffff;
    }
    .captured-black {
        color: #333333;
    }
    #restart-button {
        margin-top: 10px;
        padding: 5px 10px;
        background: #444;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        width: 100%;
        transition: background 0.3s ease;
    }
    #restart-button:hover {
        background: #555;
    }
    #move-history {
        margin-top: 10px;
        max-height: 100px;
        overflow-y: auto;
        font-size: 11px;
        background: rgba(0,0,0,0.3);
        padding: 5px;
        border-radius: 3px;
    }
    .move-entry {
        margin-bottom: 2px;
    }
    
    /* Estilos para el panel multijugador */
    #multiplayer-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        font-family: 'Courier New', monospace;
        background: rgba(0,0,0,0.7);
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #444;
        z-index: 100;
        max-width: 320px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    #multiplayer-panel.visible {
        opacity: 1;
        transform: translateY(0);
    }
    .connection-status { 
        margin-top: 10px; 
        padding: 5px; 
        border-radius: 3px; 
    }
    .status-disconnected { 
        background: rgba(255,0,0,0.2); 
        border: 1px solid #ff0000; 
        color: #ff9999; 
    }
    .status-connecting { 
        background: rgba(255,165,0,0.2); 
        border: 1px solid #ffa500; 
        color: #ffcc99; 
    }
    .status-connected { 
        background: rgba(0,255,0,0.2); 
        border: 1px solid #00ff00; 
        color: #99ff99; 
    }
    .status-error { 
        background: rgba(255,0,0,0.25); 
        border: 1px solid #ff4444; 
        color: #ffdddd; 
    }
    .player-role { 
        margin-top: 5px; 
        padding: 3px; 
        border-radius: 3px; 
    }
    .role-white { 
        background: rgba(255,255,255,0.2); 
        color: white; 
    }
    .role-black { 
        background: rgba(0,0,0,0.2); 
        color: #ccc; 
    }
    .role-spectator { 
        background: rgba(128,128,128,0.2); 
        color: #aaa; 
    }
    .input-group { 
        margin-bottom: 10px; 
    }
    .input-group label { 
        display: block; 
        margin-bottom: 3px; 
        font-size: 12px; 
    }
    #peer-id-input, #host-id-input, #room-code-input { 
        width: 100%; 
        padding: 5px; 
        margin-bottom: 5px; 
        background: rgba(255,255,255,0.1); 
        border: 1px solid #555; 
        color: white; 
        border-radius: 3px; 
    }
    #create-room-button, #join-room-button { 
        width: 100%; 
        padding: 5px; 
        margin-bottom: 5px; 
        background: #444; 
        color: white; 
        border: none; 
        border-radius: 3px; 
        cursor: pointer; 
        transition: background 0.3s ease;
    }
    #create-room-button:hover, #join-room-button:hover { 
        background: #555; 
    }
    #room-info { 
        margin-top: 10px; 
        font-size: 12px; 
        display: none; 
    }
    
    /* Clases para animaciones suaves */
    .animate-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-in.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Animación para elementos dentro de los paneles */
    .panel-element {
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s;
    }
    
    .panel-element.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;

// Función para inyectar estilos CSS
function injectCSS(cssText, id) {
    return new Promise((resolve) => {
        // Eliminar estilo existente si hay uno con el mismo ID
        const existingStyle = document.getElementById(id);
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Crear elemento style
        const style = document.createElement('style');
        style.id = id;
        style.textContent = cssText;
        
        // Añadir al documento
        document.head.appendChild(style);
        resolve('Estilos inyectados correctamente');
    });
}

// Función para iniciar animaciones
function startAnimations() {
    // Animar panel UI
    const uiPanel = document.getElementById('ui');
    if (uiPanel) {
        setTimeout(() => {
            uiPanel.classList.add('visible');
            
            // Animar elementos internos
            const uiElements = uiPanel.querySelectorAll('.panel-element');
            uiElements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('visible');
                }, 100 * index);
            });
        }, 100);
    }
    
    // Animar panel multijugador
    const multiplayerPanel = document.getElementById('multiplayer-panel');
    if (multiplayerPanel) {
        setTimeout(() => {
            multiplayerPanel.classList.add('visible');
            
            // Animar elementos internos
            const mpElements = multiplayerPanel.querySelectorAll('.panel-element');
            mpElements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('visible');
                }, 100 * index);
            });
        }, 300);
    }
}
