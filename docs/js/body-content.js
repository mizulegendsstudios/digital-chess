// js/multiplayer.js
class Multiplayer {
    constructor(gameLogic, inputHandler, pieceFactory) {
        this.gameLogic = gameLogic;
        this.inputHandler = inputHandler;
        this.pieceFactory = pieceFactory;
        this.scene = inputHandler.scene;
        
        // Variables multijugador
        this.peer = null;
        this.isHost = false;
        this.roomCode = null;
        this.connections = {}; // peerId => DataConnection
        this.localPeerId = null;
        this.displayId = null; // ID corto para mostrar en la UI
        this.myRoleLocal = 'spectator'; // 'white' | 'black' | 'spectator'
        
        this.init();
    }
    
    init() {
        // Eventos de multijugador
        document.getElementById('create-room-button').addEventListener('click', () => this.onCreateRoom());
        document.getElementById('join-room-button').addEventListener('click', () => this.onJoinRoom());
        
        // Mejorar la UI para facilitar la conexión
        this.improveConnectionUI();
    }
    
    // Método para mejorar la UI de conexión
    improveConnectionUI() {
        // Reorganizar el campo del ID del peer para que sea más visible
        const peerIdGroup = document.querySelector('#peer-id-input').parentNode;
        
        // Crear un contenedor para el ID y el botón de copiar
        const peerIdContainer = document.createElement('div');
        peerIdContainer.className = 'peer-id-container';
        
        // Mover el input al nuevo contenedor
        const peerIdInput = document.getElementById('peer-id-input');
        peerIdContainer.appendChild(peerIdInput);
        
        // Crear el botón de copiar
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copiar Código';
        copyButton.className = 'copy-button';
        
        copyButton.addEventListener('click', () => {
            // Concatenar el código de sala y el ID del host
            const fullCode = this.roomCode + this.localPeerId;
            
            // Copiar al portapapeles
            navigator.clipboard.writeText(fullCode).then(() => {
                // Cambiar texto del botón temporalmente para indicar que se copió
                const originalText = copyButton.textContent;
                copyButton.textContent = '¡Copiado!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Error al copiar al portapapeles:', err);
                // Fallback para navegadores que no soportan clipboard API
                peerIdInput.select();
                document.execCommand('copy');
                
                const originalText = copyButton.textContent;
                copyButton.textContent = '¡Copiado!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            });
        });
        
        peerIdContainer.appendChild(copyButton);
        
        // Reemplazar el grupo original con el nuevo contenedor
        peerIdGroup.parentNode.replaceChild(peerIdContainer, peerIdGroup);
        
        // Mejorar el campo del ID del host
        const hostIdInput = document.getElementById('host-id-input');
        hostIdInput.title = 'Pega aquí el código completo (código de sala + ID del host)';
        hostIdInput.placeholder = 'Pega el código completo aquí';
        
        // Añadir evento para procesar el pegado y separar automáticamente el código de sala y el ID del host
        hostIdInput.addEventListener('paste', (event) => {
            // Prevenir el comportamiento por defecto
            event.preventDefault();
            
            // Obtener el texto pegado
            const pastedText = (event.clipboardData || window.clipboardData).getData('text');
            
            // Procesar el texto para separar el código de sala y el ID del host
            const { roomCode, hostId } = this.processPastedCode(pastedText);
            
            // Actualizar los campos correspondientes
            if (roomCode) {
                document.getElementById('room-code-input').value = roomCode;
            }
            
            if (hostId) {
                hostIdInput.value = hostId;
            }
            
            // Mostrar un mensaje de confirmación
            const originalPlaceholder = hostIdInput.placeholder;
            hostIdInput.placeholder = 'Código procesado automáticamente';
            hostIdInput.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
            
            setTimeout(() => {
                hostIdInput.placeholder = originalPlaceholder;
                hostIdInput.style.backgroundColor = '';
            }, 2000);
        });
        
        // Mejorar el campo del código de sala
        const roomCodeInput = document.getElementById('room-code-input');
        roomCodeInput.title = 'Ingresa el código de sala de 5 caracteres';
        roomCodeInput.placeholder = 'Código de sala (ej: ABCDE)';
        roomCodeInput.style.textTransform = 'uppercase';
        
        // Añadir evento para convertir automáticamente a mayúsculas
        roomCodeInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
        
        // Añadir botón para generar un código QR con la información de conexión
        const qrButton = document.createElement('button');
        qrButton.textContent = 'Mostrar QR';
        qrButton.id = 'show-qr-button';
        
        qrButton.addEventListener('click', () => this.showConnectionQR());
        
        document.getElementById('connection-controls').appendChild(qrButton);
    }
    
    // Método para procesar el código pegado y separar el código de sala y el ID del host
    processPastedCode(pastedText) {
        // Eliminar espacios en blanco y caracteres no deseados
        const cleanText = pastedText.trim().replace(/\s/g, '');
        
        // El código de sala son los primeros 5 caracteres
        const roomCode = cleanText.substring(0, 5);
        
        // El ID del host es el resto del texto (debe tener 36 caracteres)
        const hostId = cleanText.substring(5);
        
        // Validar que el ID del host tenga una longitud válida (36 caracteres para UUID)
        if (hostId.length >= 30) { // Aceptamos IDs que puedan tener entre 30 y 40 caracteres
            return {
                roomCode: roomCode.toUpperCase(),
                hostId: hostId
            };
        } else {
            // Si no hay un ID de host válido, devolver solo el código de sala
            return {
                roomCode: roomCode.toUpperCase(),
                hostId: ''
            };
        }
    }
    
    // Método para mostrar un código QR con la información de conexión
    showConnectionQR() {
        if (!this.localPeerId || !this.roomCode) {
            alert('Primero crea una sala para generar el código QR');
            return;
        }
        
        // Verificar si ya existe un modal y eliminarlo
        const existingModal = document.querySelector('.qr-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // Crear un modal para mostrar el QR
        const modal = document.createElement('div');
        modal.className = 'qr-modal';
        
        // Contenido del modal
        const content = document.createElement('div');
        content.className = 'qr-modal-content';
        
        // Título
        const title = document.createElement('h2');
        title.textContent = 'Código de Conexión';
        content.appendChild(title);
        
        // Información de conexión
        const info = document.createElement('p');
        info.innerHTML = `
            <strong>Código Completo:</strong> ${this.roomCode}${this.localPeerId}<br>
            <strong>Código de Sala:</strong> ${this.roomCode}<br>
            <strong>ID del Host:</strong> ${this.localPeerId}
        `;
        content.appendChild(info);
        
        // Placeholder para el QR (en una implementación real, aquí iría el código QR)
        const qrPlaceholder = document.createElement('div');
        qrPlaceholder.className = 'qr-placeholder';
        qrPlaceholder.textContent = 'Código QR';
        content.appendChild(qrPlaceholder);
        
        // Botón para cerrar
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cerrar';
        
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        content.appendChild(closeButton);
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Cerrar al hacer clic fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // Método para generar un ID de usuario corto y legible
    generateDisplayId(length = 8) {
        // Usar solo caracteres fáciles de distinguir
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Método para generar un código de sala corto y legible
    generateRoomCode(length = 5) {
        // Usar solo caracteres fáciles de distinguir (excluimos 0, O, 1, I, etc.)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    async initializePeer() {
        return new Promise((resolve, reject) => {
            if (this.peer && this.peer.id) {
                resolve(this.peer.id);
                return;
            }
            
            this.peer = new Peer();
            
            this.peer.once('open', id => {
                this.localPeerId = id;
                this.displayId = this.generateDisplayId(); // Generar ID corto para mostrar
                
                // Mostrar el ID largo en la UI (ahora será visible gracias a los estilos)
                const peerIdInput = document.getElementById('peer-id-input');
                peerIdInput.value = this.localPeerId;
                
                // Añadir tooltip con información adicional
                peerIdInput.title = `ID completo: ${id}\nID corto: ${this.displayId}`;
                
                console.log('Peer abierto con id:', id);
                console.log('ID de usuario para mostrar:', this.displayId);
                resolve(id);
            });
            
            this.peer.once('error', err => {
                console.error('Peer error', err);
                reject(err);
            });
            
            // Cuando otro peer se conecta a mí (si soy host), setup handlers
            this.peer.on('connection', (conn) => {
                console.log('peer.on(connection) -> incoming from', conn.peer, conn.metadata);
                
                conn.once('open', () => {
                    // Si este peer es host, validar roomCode
                    if (this.isHost) {
                        if (!conn.metadata || conn.metadata.roomCode !== this.roomCode) {
                            console.log('Código inválido o metadata faltante - cerrando conexión entrante');
                            conn.send({ type: 'error', reason: 'invalid-room-code' });
                            conn.close();
                            return;
                        }
                        
                        this.setupConnectionHandlers(conn);
                        
                        // Después de abrir, enviar asignación de rol y estado completo
                        conn.send({ type: 'role-assignment', role: 'black' });
                        conn.send({ type: 'full-state', state: this.gameLogic.serializeFullState() });
                    } else {
                        // Si no es host, aceptar conexiones entrantes? usualmente no se espera
                        this.setupConnectionHandlers(conn);
                    }
                });
            });
        });
    }
    
    setupConnectionHandlers(conn) {
        const pid = conn.peer;
        this.connections[pid] = conn;
        
        conn.on('data', (data) => this.handleIncoming(conn, data));
        
        conn.on('close', () => {
            console.log('Conexión cerrada con', pid);
            delete this.connections[pid];
            this.refreshConnectionUI();
        });
        
        conn.on('error', (err) => {
            console.error('Conn error', err);
            this.updateConnectionStatus('error', 'Error de conexión');
        });
        
        // Actualizar UI inmediatamente al establecer la conexión
        this.refreshConnectionUI();
    }
    
    broadcast(obj) {
        Object.values(this.connections).forEach(c => {
            try { 
                if (c.open) c.send(obj); 
            } catch(e) { 
                console.warn('broadcast err', e); 
            }
        });
    }
    
    updateConnectionStatus(status, message) {
        const statusEl = document.getElementById('connection-status');
        statusEl.classList.remove('status-disconnected', 'status-connecting', 'status-connected', 'status-error');
        statusEl.classList.add(`status-${status}`);
        statusEl.textContent = message;
    }
    
    refreshConnectionUI() {
        const anyOpen = Object.values(this.connections).some(c => c.open);
        if (anyOpen) {
            this.updateConnectionStatus('connected', 'Conectado');
        } else if (this.isHost) {
            this.updateConnectionStatus('connecting', 'Esperando jugador...');
        } else {
            this.updateConnectionStatus('disconnected', 'Desconectado');
        }
    }
    
    handleIncoming(conn, data) {
        if (!data || !data.type) return;
        
        console.log('handleIncoming from', conn.peer, data.type, data);
        
        switch(data.type) {
            case 'hello':
                // cliente saluda - host responderá en connection.open con rol y estado completo
                break;
                
            case 'role-assignment':
                // cliente recibe rol asignado
                if (!this.isHost) { 
                    this.myRoleLocal = data.role; 
                    this.updatePlayerRole(data.role); 
                    console.log('Role assigned:', data.role); 
                }
                break;
                
            case 'full-state':
                // cliente sincroniza estado completo (autoritativo del host)
                this.applyFullState(data.state);
                // IMPORTANTE: Actualizar el estado de conexión después de recibir el estado completo
                this.updateConnectionStatus('connected', 'Conectado');
                break;
                
            case 'request-move':
                // SOLO el host debe procesar request-move
                if (!this.isHost) {
                    // clientes ignoran o reenvían? ignorar
                    return;
                }
                this.handleRequestMoveFromClient(conn, data.move);
                break;
                
            case 'move':
                // cliente aplica movimiento enviado por host
                this.applyMoveFromHost(data.move);
                
                // opcional: aplicar gameStatus enviado por host
                if (data.gameStatus) { 
                    this.gameLogic.gameStatus = data.gameStatus; 
                    document.getElementById('game-status').textContent = data.gameStatus; 
                }
                break;
                
            case 'move-rejected':
                // cliente recibe rechazo
                alert('Movimiento rechazado: ' + (data.reason || 'motivo desconocido'));
                break;
                
            case 'restart':
                // host o cliente solicita reinicio - host debe reiniciar estado y difundir
                if (this.isHost) { 
                    this.restartGameHost(); 
                }
                break;
                
            case 'error':
                console.warn('Error recibido:', data.reason);
                this.updateConnectionStatus('error', 'Error: ' + data.reason);
                break;
                
            default:
                console.warn('Tipo de mensaje desconocido', data.type);
        }
    }
    
    handleRequestMoveFromClient(conn, moveRequest) {
        // moveRequest: { pieceId, fromRow, fromCol, toRow, toCol }
        // encontrar pieza (preferir coincidencia por id; fallback a fromRow/fromCol)
        let piece = this.gameLogic.pieces.find(p => p.id === moveRequest.pieceId);
        if (!piece) piece = this.gameLogic.board[moveRequest.fromRow][moveRequest.fromCol];
        
        if (!piece) { 
            conn.send({ type: 'move-rejected', reason: 'piece-not-found' }); 
            return; 
        }
        
        // asegurar que es el turno del jugador correcto
        if (piece.color !== this.gameLogic.currentTurn) { 
            conn.send({ type: 'move-rejected', reason: 'not-your-turn' }); 
            return; 
        }
        
        // validar movimiento usando isValidMove autoritativo
        if (!this.gameLogic.isValidMove(piece, moveRequest.toRow, moveRequest.toCol)) {
            conn.send({ type: 'move-rejected', reason: 'invalid-move' }); 
            return;
        }
        
        // aplicar movimiento en host
        const moveData = this.inputHandler.makeMove(piece, moveRequest.toRow, moveRequest.toCol);
        
        // difundir movimiento autoritativo a todos (incluyendo el solicitante original)
        this.broadcast({ 
            type: 'move', 
            move: moveData,
            gameStatus: this.gameLogic.gameStatus
        });
    }
    
    requestMoveToHost(piece, toRow, toCol) {
        // encontrar conexión host (asumimos primera conexión es host)
        const hostConn = Object.values(this.connections)[0];
        if (!hostConn || !hostConn.open) { 
            alert('No conectado al host'); 
            return; 
        }
        
        hostConn.send({ 
            type: 'request-move', 
            move: { 
                pieceId: piece.id, 
                fromRow: piece.row, 
                fromCol: piece.col, 
                toRow, 
                toCol 
            } 
        });
    }
    
    updatePlayerRole(role) {
        const roleEl = document.getElementById('player-role');
        document.getElementById('room-info').style.display = 'block';
        document.getElementById('room-code-display').textContent = this.roomCode || '-';
        
        roleEl.classList.remove('role-white', 'role-black', 'role-spectator');
        
        switch(role) {
            case 'white': 
                roleEl.classList.add('role-white'); 
                roleEl.textContent = 'Rol: Blancas'; 
                break;
            case 'black': 
                roleEl.classList.add('role-black'); 
                roleEl.textContent = 'Rol: Negras'; 
                break;
            default: 
                roleEl.classList.add('role-spectator'); 
                roleEl.textContent = 'Rol: Espectador';
        }
    }
    
    restartGameHost() {
        // solo el host debe reiniciar y difundir estado completo
        if (!this.isHost) return;
        
        // eliminar meshes de piezas
        const pieceMeshes = this.scene.children.filter(c => c.userData.type === 'piece');
        pieceMeshes.forEach(m => this.scene.remove(m));
        
        // reiniciar
        this.initializePiecesDeterministic();
        this.gameLogic.currentTurn = 'white'; 
        this.gameLogic.moveHistory = []; 
        this.gameLogic.moveCount = 0; 
        this.gameLogic.capturedPieces = {white:[], black:[]}; 
        this.gameLogic.gameStatus = 'playing';
        
        this.broadcast({ type: 'full-state', state: this.gameLogic.serializeFullState() });
    }
    
    initializePiecesDeterministic() {
        this.gameLogic.pieces.length = 0;
        for (let r=0; r<this.gameLogic.boardSize; r++) {
            for (let c=0; c<this.gameLogic.boardSize; c++) {
                this.gameLogic.board[r][c] = null;
            }
        }
        
        // peones
        for (let c=0; c<8; c++) { 
            this.pieceFactory.createPiece('pawn', 'white', 6, c); 
            this.pieceFactory.createPiece('pawn', 'black', 1, c); 
        }
        
        // torres
        this.pieceFactory.createPiece('rook', 'white', 7, 0); 
        this.pieceFactory.createPiece('rook', 'white', 7, 7);
        this.pieceFactory.createPiece('rook', 'black', 0, 0); 
        this.pieceFactory.createPiece('rook', 'black', 0, 7);
        
        // caballos
        this.pieceFactory.createPiece('knight', 'white', 7, 1); 
        this.pieceFactory.createPiece('knight', 'white', 7, 6);
        this.pieceFactory.createPiece('knight', 'black', 0, 1); 
        this.pieceFactory.createPiece('knight', 'black', 0, 6);
        
        // alfiles
        this.pieceFactory.createPiece('bishop', 'white', 7, 2); 
        this.pieceFactory.createPiece('bishop', 'white', 7, 5);
        this.pieceFactory.createPiece('bishop', 'black', 0, 2); 
        this.pieceFactory.createPiece('bishop', 'black', 0, 5);
        
        // reinas
        this.pieceFactory.createPiece('queen', 'white', 7, 3); 
        this.pieceFactory.createPiece('queen', 'black', 0, 3);
        
        // reyes
        this.pieceFactory.createPiece('king', 'white', 7, 4); 
        this.pieceFactory.createPiece('king', 'black', 0, 4);
    }
    
    applyFullState(state) {
        // Limpiar meshes de piezas actuales
        const pieceMeshes = this.scene.children.filter(c => c.userData.type === 'piece');
        pieceMeshes.forEach(m => this.scene.remove(m));
        
        // Aplicar estado del juego
        this.gameLogic.applyFullState(state);
        
        // Reconstruir meshes de piezas
        state.pieces.forEach(sp => {
            const piece = this.gameLogic.pieces.find(p => p.id === sp.id);
            if (piece) {
                this.pieceFactory.createPieceMeshes(piece);
            }
        });
        
        // Actualizar UI
        this.inputHandler.updateTurnIndicator();
        this.inputHandler.updateCapturedPieces();
        this.inputHandler.updateMoveHistory();
        this.inputHandler.updateGameStatus();
    }
    
    applyMoveFromHost(move) {
        const piece = this.gameLogic.pieces.find(p => p.id === move.pieceId);
        if (!piece) return;
        
        // Capturar pieza si existe
        const capturedPiece = this.gameLogic.board[move.toRow][move.toCol];
        if (capturedPiece && capturedPiece.id !== piece.id) {
            this.gameLogic.capturedPieces[capturedPiece.color].push(capturedPiece.type);
            this.inputHandler.updateCapturedPieces();
            
            // Eliminar la pieza capturada de la escena
            const pieceMeshes = this.scene.children.filter(child => 
                child.userData.type === 'piece' && child.userData.pieceId === capturedPiece.id
            );
            pieceMeshes.forEach(mesh => this.scene.remove(mesh));
        }
        
        // Actualizar tablero
        this.gameLogic.board[piece.row][piece.col] = null;
        this.gameLogic.board[move.toRow][move.toCol] = piece;
        
        // Actualizar historial de movimientos
        if (move.moveNotation) {
            this.gameLogic.moveHistory.push(move.moveNotation);
            this.inputHandler.updateMoveHistory();
        }
        
        // Animar movimiento
        this.inputHandler.animatePieceMove(piece, move.toRow, move.toCol, () => {
            // Actualizar posición de la pieza después de la animación
            piece.row = move.toRow;
            piece.col = move.toCol;
            
            // Actualizar turno
            if (move.nextTurn) {
                this.gameLogic.currentTurn = move.nextTurn;
                this.inputHandler.updateTurnIndicator();
            }
            
            // Verificar estado del juego
            this.gameLogic.checkGameStatus();
            this.inputHandler.updateGameStatus();
        });
    }
    
    async onCreateRoom() {
        try {
            await this.initializePeer();
            this.isHost = true;
            // Usar el nuevo método para generar un código más corto
            this.roomCode = this.generateRoomCode(5); // 5 caracteres
            document.getElementById('room-code-display').textContent = this.roomCode;
            document.getElementById('room-info').style.display = 'block';
            this.updateConnectionStatus('connecting', 'Esperando jugador...');
            this.myRoleLocal = 'white';
            this.updatePlayerRole('white');
            console.log('Sala creada. Peer ID:', this.localPeerId);
            console.log('ID de usuario para mostrar:', this.displayId);
            console.log('Room code:', this.roomCode);
        } catch(err) {
            console.error('Error initializing peer for host', err);
            this.updateConnectionStatus('error', 'No se pudo inicializar Peer');
        }
    }
    
    async onJoinRoom() {
        const hostPeerId = document.getElementById('host-id-input').value.trim();
        const code = document.getElementById('room-code-input').value.trim().toUpperCase();
        
        if (!hostPeerId || !code) { 
            alert('Por favor ingresa ID del host y código de sala'); 
            return; 
        }
        
        try {
            await this.initializePeer();
            this.roomCode = code;
            this.isHost = false;
            
            // NOTA: Seguimos usando el ID largo de PeerJS para la conexión,
            // pero mostramos el ID corto en la UI
            
            // conectar al host con metadata conteniendo código de sala solicitado
            const conn = this.peer.connect(hostPeerId, { metadata: { roomCode: code } });
            
            conn.on('open', () => {
                console.log('Conexión abierta con host', hostPeerId);
                this.setupConnectionHandlers(conn);
                conn.send({ type: 'hello', message: 'Hola host, solicito unirme', desiredRole: null });
                
                // Actualizar UI a "conectando" mientras esperamos la respuesta del host
                this.updateConnectionStatus('connecting', 'Conectando con el host...');
            });
            
            conn.on('error', (e) => { 
                console.error('Error de conexión:', e);
                this.updateConnectionStatus('error', 'Error al conectar con host: ' + e.message);
            });
            
            // Manejar cierre de conexión
            conn.on('close', () => {
                console.log('Conexión cerrada con el host');
                this.updateConnectionStatus('disconnected', 'Desconectado del host');
            });
            
            this.updatePlayerRole('spectator');
        } catch(err) {
            console.error('Error initializing peer for joiner', err);
            this.updateConnectionStatus('error', 'No se pudo inicializar Peer: ' + err.message);
        }
    }
}
