// body-content.js
function injectBodyContent() {
    return new Promise((resolve, reject) => {
        try {
            console.log("Inyectando contenido del body...");
            
            // Limpiar el body primero
            document.body.innerHTML = '';
            
            // Crear el canvas del juego
            const canvas = document.createElement('canvas');
            canvas.id = 'gameCanvas';
            document.body.appendChild(canvas);
            console.log("Canvas creado");
            
            // Crear panel UI
            const uiPanel = document.createElement('div');
            uiPanel.id = 'ui';
            uiPanel.innerHTML = `
                <div class="kamisama-title">KAMISAMA CHESS</div>
                <div class="time-display">Tiempo: 00:00</div>
                <div class="game-info">
                    <div class="turn-indicator">
                        <span>Turno: </span>
                        <span class="turn-indicator-white">Blancas</span>
                    </div>
                </div>
                <div id="game-status">Juego en curso</div>
                <div id="captured-pieces">
                    <div class="captured-white">Blancas capturadas: 0</div>
                    <div class="captured-black">Negras capturadas: 0</div>
                </div>
                <button id="restart-button">Reiniciar Juego</button>
                <div id="move-history"></div>
            `;
            document.body.appendChild(uiPanel);
            console.log("Panel UI creado");
            
            // Crear panel multijugador
            const multiplayerPanel = document.createElement('div');
            multiplayerPanel.id = 'multiplayer-panel';
            multiplayerPanel.innerHTML = `
                <div class="kamisama-title">MULTIJUGADOR</div>
                <div class="connection-status status-disconnected">Desconectado</div>
                <div class="player-role role-spectator">Espectador</div>
                <div class="input-group">
                    <label>Tu ID:</label>
                    <input type="text" id="peer-id-input" readonly>
                </div>
                <div class="input-group">
                    <label>ID del host:</label>
                    <input type="text" id="host-id-input" placeholder="Ingresa ID del host">
                </div>
                <div class="input-group">
                    <label>Código de sala:</label>
                    <input type="text" id="room-code-input" placeholder="Ingresa código de sala">
                </div>
                <button id="create-room-button">Crear Sala</button>
                <button id="join-room-button">Unirse a Sala</button>
                <div id="room-info"></div>
            `;
            document.body.appendChild(multiplayerPanel);
            console.log("Panel multijugador creado");
            
            resolve('Contenido del body inyectado correctamente');
        } catch (error) {
            console.error('Error al inyectar contenido del body:', error);
            reject(error);
        }
    });
}
