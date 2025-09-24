// js/styles.js
function injectStyles() {
    const styles = `
        body { margin: 0; overflow: hidden; background: linear-gradient(to bottom, #87CEEB 0%, #98D8E8 50%, #FDB813 100%); }
        canvas { display: block; }
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
        
        /* Estilos para el panel multijugador - AJUSTES PARA VER ID COMPLETO */
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
            /* Aumentar el ancho máximo para acomodar IDs largos */
            max-width: 450px;
            /* Ancho mínimo para asegurar que se vea bien */
            min-width: 350px;
            /* Permitir que el panel sea más alto si es necesario */
            max-height: 90vh;
            overflow-y: auto;
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
        
        /* Ajustes para que los IDs se vean completos */
        #peer-id-input, #host-id-input, #room-code-input { 
            width: 100%; 
            padding: 8px; 
            margin-bottom: 5px; 
            background: rgba(255,255,255,0.1); 
            border: 1px solid #555; 
            color: white; 
            border-radius: 3px;
            /* Asegurar que el texto no se corte */
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            /* Tamaño de fuente más pequeño para IDs largos */
            font-size: 11px;
            /* Altura ajustada para mostrar el contenido completo */
            height: auto;
            min-height: 36px;
            padding-top: 10px;
            padding-bottom: 10px;
            /* Forzar el modo de escritura horizontal para que no se rompa el ID */
            writing-mode: horizontal-tb;
            /* Asegurar que el campo de texto se expanda si es necesario */
            resize: none;
        }
        
        /* Estilo específico para el ID del host para asegurar que se vea completo */
        #host-id-input {
            /* Altura mayor para acomodar el ID completo */
            min-height: 50px;
            padding-top: 15px;
            padding-bottom: 15px;
            /* Tamaño de fuente aún más pequeño si es necesario */
            font-size: 10px;
            /* Espaciado de línea ajustado para mejor legibilidad */
            line-height: 1.2;
            /* Permitir scroll horizontal si es extremadamente largo */
            overflow-x: auto;
            white-space: pre;
            word-break: keep-all;
        }
        
        /* Contenedor para el ID del host con botón de copiar */
        .peer-id-container {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .peer-id-container input {
            flex: 1;
        }
        
        .copy-button {
            padding: 8px 12px;
            background: #444;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            white-space: nowrap;
            font-size: 11px;
            flex-shrink: 0;
        }
        
        .copy-button:hover {
            background: #555;
        }
        
        #create-room-button, #join-room-button { 
            width: 100%; 
            padding: 10px; 
            margin-bottom: 10px; 
            background: #444; 
            color: white; 
            border: none; 
            border-radius: 3px; 
            cursor: pointer; 
            font-weight: bold;
        }
        #create-room-button:hover, #join-room-button:hover { 
            background: #555; 
        }
        #room-info { 
            margin-top: 10px; 
            font-size: 12px; 
            display: none; 
        }
        
        /* Estilos para el botón de mostrar QR */
        #show-qr-button {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            background: #444;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-weight: bold;
        }
        
        #show-qr-button:hover {
            background: #555;
        }
        
        /* Estilos para el modal del QR */
        .qr-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .qr-modal-content {
            background-color: #333;
            padding: 20px;
            border-radius: 10px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            color: white;
        }
        
        .qr-modal h2 {
            margin-top: 0;
            color: #FFD700;
        }
        
        .qr-modal p {
            margin-bottom: 20px;
            word-break: break-all;
            font-size: 12px;
        }
        
        .qr-placeholder {
            width: 200px;
            height: 200px;
            background-color: #fff;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
        }
        
        .qr-modal button {
            padding: 8px 16px;
            background-color: #444;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        
        .qr-modal button:hover {
            background-color: #555;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}
