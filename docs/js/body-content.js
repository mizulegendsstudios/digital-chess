// Contenido HTML del body
const bodyContent = `
    <div id="game-ui">
        <div id="info-panel" class="panel">
            <div>Voxels: <span id="voxelCount">0</span></div>
            <div>Hora: <span id="dayTime">Día</span> <span id="timeDisplay">12:00</span></div>
            <div>Estado: <span id="game-status">Juego en curso</span></div>
        </div>
        
        <div id="turn-panel" class="panel">
            <div>Turno: <span id="current-turn" class="turn-indicator-white">Blancas</span></div>
            <button id="restart-button">Reiniciar</button>
        </div>
        
        <div id="captured-panel" class="panel">
            <div>Capturadas:</div>
            <div>Blancas: <span id="captured-white">Ninguna</span></div>
            <div>Negras: <span id="captured-black">Ninguna</span></div>
        </div>
        
        <div id="moves-panel" class="panel">
            <div>Movimientos:</div>
            <div id="moves-list"></div>
        </div>
        
        <div id="multiplayer-panel" class="panel">
            <div id="connection-status" class="status-disconnected">Desconectado</div>
            <div id="room-info" style="display: none;">
                <div>Código: <span id="room-code-display">-</span></div>
                <div>Rol: <span id="player-role" class="role-spectator">Espectador</span></div>
            </div>
            <div>
                <input type="text" id="peer-id-input" placeholder="Tu Peer ID" readonly>
                <button id="create-room-button">Crear sala</button>
            </div>
            <div>
                <input type="text" id="host-id-input" placeholder="ID del host">
                <input type="text" id="room-code-input" placeholder="Código de sala">
                <button id="join-room-button">Unirse</button>
            </div>
        </div>
        
        <div id="fps-panel" class="panel">
            <div>FPS: <span id="fps">0</span></div>
        </div>
    </div>
`;

// Exponer el contenido
window.bodyContent = bodyContent;
