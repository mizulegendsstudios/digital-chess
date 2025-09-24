// js/body-content.js
function injectBodyContent() {
    const bodyContent = `
        <div id="ui">
            <div class="kamisama-title">
                <h2>♔ Kamisama Chess ♚</h2>
            </div>
            <div id="controls">
                <h3>🎮 Controles</h3>
                <p><span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span> Mover cámara</p>
                <p><span class="key">Q</span><span class="key">E</span> Subir/Bajar</p>
                <p><span class="key">R</span><span class="key">F</span> Rotar vista</p>
                <p><span class="key">Shift</span> Acelerar</p>
                <p><span class="key">Mouse</span> Seleccionar pieza</p>
                <p><span class="key">Scroll</span> Zoom</p>
            </div>
            <div id="info">
                <p>FPS: <span id="fps">60</span></p>
                <p>Vóxeles: <span id="voxelCount">0</span></p>
                <div class="time-display">
                    <p>🌅 Día: <span id="dayTime">Día</span></p>
                    <p>⏰ Hora: <span id="timeDisplay">12:00</span></p>
                </div>
                <div class="game-info">
                    <div class="turn-indicator">
                        Turno: <span id="current-turn" class="turn-indicator-white">Blancas</span>
                    </div>
                    <div id="game-status">Juego en curso</div>
                    <div id="captured-pieces">
                        <p>Capturadas:</p>
                        <p class="captured-white">Blancas: <span id="captured-white">Ninguna</span></p>
                        <p class="captured-black">Negras: <span id="captured-black">Ninguna</span></p>
                    </div>
                    <button id="restart-button">Reiniciar Juego</button>
                    <div id="move-history">
                        <p><strong>Movimientos:</strong></p>
                        <div id="moves-list"></div>
                    </div>
                </div>
            </div>
        </div>

        <div id="multiplayer-panel">
            <h3>🌐 Multijugador</h3>
            <div id="connection-status" class="connection-status status-disconnected">
                Desconectado
            </div>

            <div id="connection-controls">
                <div class="input-group">
                    <label>Tu ID:</label>
                    <input type="text" id="peer-id-input" placeholder="Tu ID (se genera automáticamente)" readonly>
                </div>
                <button id="create-room-button">Crear Sala</button>
                <div class="input-group">
                    <label>ID del Host:</label>
                    <input type="text" id="host-id-input" placeholder="ID del host">
                </div>
                <div class="input-group">
                    <label>Código de Sala:</label>
                    <input type="text" id="room-code-input" placeholder="Código de sala">
                </div>
                <button id="join-room-button">Unirse a Sala</button>
            </div>

            <div id="room-info">
                <p><strong>Sala:</strong> <span id="room-code-display">-</span></p>
                <div id="player-role" class="player-role role-spectator">
                    Rol: Espectador
                </div>
            </div>
        </div>
    `;
    
    document.body.innerHTML = bodyContent;
}
