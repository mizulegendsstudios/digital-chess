// js/styles.js
function injectStyles() {
    const styles = `
        /* Estilos base existentes */
        body { 
            margin: 0; 
            overflow: hidden; 
            background: linear-gradient(to bottom, #87CEEB 0%, #98D8E8 50%, #FDB813 100%);
            font-size: 14px; /* Tamaño base más grande para móviles */
        }
        canvas { display: block; }
        
        /* Panel principal optimizado para móviles */
        #ui {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            font-family: 'Courier New', monospace;
            background: rgba(0,0,0,0.8);
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #444;
            z-index: 100;
            max-width: 280px;
            max-height: 70vh; /* Limitar altura en móviles */
            overflow-y: auto; /* Scroll si contenido es largo */
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        /* Panel multijugador optimizado */
        #multiplayer-panel {
            position: absolute;
            top: 10px;
            right: 10px;
            color: white;
            font-family: 'Courier New', monospace;
            background: rgba(0,0,0,0.8);
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #444;
            z-index: 100;
            max-width: 280px;
            max-height: 70vh;
            overflow-y: auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        /* Títulos más compactos */
        .kamisama-title h2 {
            font-size: 18px;
            margin: 5px 0;
            text-align: center;
        }
        
        /* Controles más compactos */
        #controls h3, #multiplayer-panel h3 {
            font-size: 14px;
            margin: 8px 0;
        }
        
        /* Botones más grandes para móviles */
        button {
            padding: 12px;
            font-size: 14px;
            border-radius: 6px;
            margin: 5px 0;
            width: 100%;
            box-sizing: border-box;
        }
        
        /* Campos de entrada más grandes */
        input[type="text"] {
            padding: 12px;
            font-size: 14px;
            border-radius: 6px;
            margin: 5px 0;
            width: 100%;
            box-sizing: border-box;
        }
        
        /* Indicadores más grandes */
        .turn-indicator {
            padding: 8px;
            border-radius: 6px;
            margin: 5px 0;
        }
        
        /* Mejoras para táctil */
        .key {
            display: inline-block;
            background: #333;
            padding: 4px 8px;
            border-radius: 4px;
            margin: 2px;
            border: 1px solid #555;
            min-width: 28px;
            text-align: center;
        }
        
        /* Secciones colapsables en móviles */
        .collapsible {
            background: rgba(0,0,0,0.5);
            cursor: pointer;
            padding: 10px;
            width: 100%;
            border: none;
            text-align: left;
            outline: none;
            font-size: 14px;
            border-radius: 6px;
            margin: 5px 0;
        }
        
        .active, .collapsible:hover {
            background: rgba(255,215,0,0.2);
        }
        
        .content {
            padding: 0 10px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.2s ease-out;
            background: rgba(0,0,0,0.3);
            border-radius: 0 0 6px 6px;
        }
        
        /* Responsive para pantallas pequeñas */
        @media (max-width: 768px) {
            /* Paneles más anchos en móviles */
            #ui, #multiplayer-panel {
                max-width: calc(100% - 20px);
                left: 10px;
                right: 10px;
            }
            
            /* Posicionar paneles uno debajo del otro */
            #ui {
                top: 10px;
            }
            
            #multiplayer-panel {
                top: auto;
                bottom: 10px;
            }
            
            /* Botones más grandes */
            button {
                padding: 15px;
                font-size: 16px;
            }
            
            /* Campos de entrada más grandes */
            input[type="text"] {
                padding: 15px;
                font-size: 16px;
            }
            
            /* Reducir padding en móviles */
            #ui, #multiplayer-panel {
                padding: 8px;
            }
            
            /* Ocultar elementos no esenciales en móviles */
            #info {
                display: none;
            }
            
            /* Historial de movimientos más compacto */
            #move-history {
                max-height: 60px;
            }
        }
        
        /* Para pantallas muy pequeñas */
        @media (max-width: 480px) {
            /* Paneles ocupan todo el ancho */
            #ui, #multiplayer-panel {
                max-width: 100%;
                left: 0;
                right: 0;
                border-radius: 0;
            }
            
            /* Títulos más pequeños */
            .kamisama-title h2 {
                font-size: 16px;
            }
            
            /* Controles más compactos */
            #controls p {
                font-size: 12px;
                margin: 3px 0;
            }
            
            /* Botones más grandes aún */
            button {
                padding: 18px;
                font-size: 18px;
            }
        }
        
        /* Estilos para el modal QR en móviles */
        .qr-modal {
            padding: 20px;
        }
        
        .qr-modal-content {
            width: 95%;
            padding: 15px;
        }
        
        .qr-placeholder {
            width: 150px;
            height: 150px;
        }
        
        /* Resto de estilos existentes sin cambios */
        #controls {
            margin-bottom: 10px;
        }
        #info {
            font-size: 12px;
            color: #aaa;
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
            padding: 8px; 
            margin-bottom: 5px; 
            background: rgba(255,255,255,0.1); 
            border: 1px solid #555; 
            color: white; 
            border-radius: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 11px;
            height: auto;
            min-height: 36px;
            padding-top: 10px;
            padding-bottom: 10px;
            writing-mode: horizontal-tb;
            resize: none;
        }
        #host-id-input {
            min-height: 50px;
            padding-top: 15px;
            padding-bottom: 15px;
            font-size: 10px;
            line-height: 1.2;
            overflow-x: auto;
            white-space: pre;
            word-break: keep-all;
        }
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
