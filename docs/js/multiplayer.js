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
        this.myRoleLocal = 'spectator'; // 'white' | 'black' | 'spectator'
        
        this.init();
    }
    
    init() {
        // Eventos de multijugador
        document.getElementById('create-room-button').addEventListener('click', () => this.onCreateRoom());
        document.getElementById('join-room-button').addEventListener('click', () => this.onJoinRoom());
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
                document.getElementById('peer-id-input').value = id;
                console.log('Peer abierto con id:', id);
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
            this.roomCode = Math.random().toString(36).substring(2,8).toUpperCase();
            document.getElementById('room-code-display').textContent = this.roomCode;
            document.getElementById('room-info').style.display = 'block';
            this.updateConnectionStatus('connecting', 'Esperando jugador...');
            this.myRoleLocal = 'white';
            this.updatePlayerRole('white');
            console.log('Sala creada. Peer ID:', this.localPeerId, 'Room code:', this.roomCode);
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
