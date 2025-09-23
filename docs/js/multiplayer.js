// Variables multijugador
let peer = null;
let isHost = false;
let roomCode = null;
const connections = {};
let localPeerId = null;
let myRoleLocal = 'spectator';

// Inicializar PeerJS
function initializePeer() {
    return new Promise((resolve, reject) => {
        if (peer && peer.id) return resolve(peer.id);
        
        peer = new Peer();
        
        peer.once('open', id => {
            localPeerId = id;
            document.getElementById('peer-id-input').value = id;
            console.log('Peer abierto con id:', id);
            resolve(id);
        });
        
        peer.once('error', err => {
            console.error('Peer error', err);
            reject(err);
        });
        
        // Cuando otro peer se conecta a mí (si soy host), setup handlers
        peer.on('connection', (conn) => {
            console.log('peer.on(connection) -> incoming from', conn.peer, conn.metadata);
            
            conn.once('open', () => {
                // Si este peer es host, validar roomCode
                if (isHost) {
                    if (!conn.metadata || conn.metadata.roomCode !== roomCode) {
                        console.log('Código inválido o metadata faltante - cerrando conexión entrante');
                        conn.send({ type: 'error', reason: 'invalid-room-code' });
                        conn.close();
                        return;
                    }
                    
                    setupConnectionHandlers(conn);
                    
                    // Después de abrir, enviar asignación de rol y estado completo
                    conn.send({ type: 'role-assignment', role: 'black' });
                    conn.send({ type: 'full-state', state: serializeFullState() });
                } else {
                    // Si no es host, aceptar conexiones entrantes? usualmente no se espera
                    setupConnectionHandlers(conn);
                }
            });
        });
    });
}

// Configurar manejadores de conexión
function setupConnectionHandlers(conn) {
    const pid = conn.peer;
    connections[pid] = conn;
    
    conn.on('data', (data) => handleIncoming(conn, data));
    
    conn.on('close', () => {
        console.log('Conexión cerrada con', pid);
        delete connections[pid];
        refreshConnectionUI();
    });
    
    conn.on('error', (err) => {
        console.error('Conn error', err);
        updateConnectionStatus('error', 'Error de conexión');
    });
    
    refreshConnectionUI();
}

// Enviar mensaje a todas las conexiones
function broadcast(obj) {
    Object.values(connections).forEach(c => {
        try { 
            if (c.open) c.send(obj); 
        } catch(e) { 
            console.warn('broadcast err', e); 
        }
    });
}

// Serializar el estado completo del juego
function serializeFullState() {
    return {
        board: window.board.map(row => row.map(c => c ? { 
            id: c.id, 
            type: c.type, 
            color: c.color, 
            row: c.row, 
            col: c.col 
        } : null)),
        pieces: window.pieces.map(p => ({ 
            id: p.id, 
            type: p.type, 
            color: p.color, 
            row: p.row, 
            col: p.col 
        })),
        currentTurn: window.currentTurn, 
        moveHistory: window.moveHistory, 
        moveCount: window.moveCount, 
        capturedPieces: window.capturedPieces, 
        gameStatus: window.gameStatus
    };
}

// Aplicar estado completo recibido del host
function applyFullState(state) {
    // Limpiar meshes de piezas actuales
    const pieceMeshes = window.scene.children.filter(c => c.userData.type === 'piece');
    pieceMeshes.forEach(m => window.scene.remove(m));
    
    // Reset estructuras
    window.pieces.length = 0;
    for (let r=0; r<window.CONFIG.BOARD_SIZE; r++) { 
        for (let c=0; c<window.CONFIG.BOARD_SIZE; c++) { 
            window.board[r][c] = null; 
        } 
    }
    
    // Reconstruir piezas
    state.pieces.forEach(sp => {
        const p = { 
            id: sp.id, 
            type: sp.type, 
            color: sp.color, 
            row: sp.row, 
            col: sp.col 
        };
        window.pieces.push(p); 
        window.board[sp.row][sp.col] = p;
        createPieceMeshes(p);
    });
    
    window.currentTurn = state.currentTurn;
    window.moveHistory = state.moveHistory || [];
    window.moveCount = state.moveCount || 0;
    window.capturedPieces = state.capturedPieces || {white:[], black:[]};
    window.gameStatus = state.gameStatus || 'playing';
    
    window.updateTurnIndicator();
    document.getElementById('game-status').textContent = 
        window.gameStatus === 'playing' ? 'Juego en curso' : window.gameStatus;
    window.updateCapturedPieces();
    window.updateMoveHistory();
}

// Crear meshes para una pieza
function createPieceMeshes(piece) {
    const pieceColor = piece.color === 'white' ? 0xFFFFFF : 0x333333;
    const baseX = piece.col * 4 + 1 - 14;
    const baseZ = piece.row * 4 + 1 - 14;
    
    // Crear la pieza según su tipo (misma lógica que createPiece original)
    switch(piece.type) {
        case 'pawn':
            // Peón
            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < 2; x++) {
                    for (let z = 0; z < 2; z++) {
                        const pawnVoxel = window.createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        pawnVoxel.userData.pieceId = piece.id;
                        window.scene.add(pawnVoxel);
                    }
                }
            }
            break;
            
        case 'rook':
            // Torre
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 2; x++) {
                    for (let z = 0; z < 2; z++) {
                        const rookVoxel = window.createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        rookVoxel.userData.pieceId = piece.id;
                        window.scene.add(rookVoxel);
                    }
                }
            }
            // Almenas
            for (let x = -1; x <= 2; x++) {
                for (let z = -1; z <= 2; z++) {
                    if ((x === -1 || x === 2) && (z === -1 || z === 2)) {
                        const almenaVoxel = window.createVoxel(
                            baseX + x, 
                            5, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        almenaVoxel.userData.pieceId = piece.id;
                        window.scene.add(almenaVoxel);
                    }
                }
            }
            break;
            
        case 'knight':
            // Caballo
            // Cuerpo
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 2; x++) {
                    for (let z = 0; z < 2; z++) {
                        const knightVoxel = window.createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        knightVoxel.userData.pieceId = piece.id;
                        window.scene.add(knightVoxel);
                    }
                }
            }
            // Cabeza
            for (let y = 3; y < 5; y++) {
                for (let x = 0; x < 2; x++) {
                    for (let z = 0; z < 1; z++) {
                        const headVoxel = window.createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        headVoxel.userData.pieceId = piece.id;
                        window.scene.add(headVoxel);
                    }
                }
            }
            break;
            
        case 'bishop':
            // Alfil
            // Base
            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < 2; x++) {
                    for (let z = 0; z < 2; z++) {
                        const bishopVoxel = window.createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        bishopVoxel.userData.pieceId = piece.id;
                        window.scene.add(bishopVoxel);
                    }
                }
            }
            // Cuerpo
            for (let y = 2; y < 4; y++) {
                const size = 4 - y;
                for (let x = 0; x < size; x++) {
                    for (let z = 0; z < size; z++) {
                        const bodyVoxel = window.createVoxel(
                            baseX + x + (2 - size)/2, 
                            y + 1, 
                            baseZ + z + (2 - size)/2, 
                            pieceColor, 
                            'piece'
                        );
                        bodyVoxel.userData.pieceId = piece.id;
                        window.scene.add(bodyVoxel);
                    }
                }
            }
            break;
            
        case 'queen':
            // Reina
            // Base
            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < 2; x++) {
                    for (let z = 0; z < 2; z++) {
                        const queenVoxel = window.createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        queenVoxel.userData.pieceId = piece.id;
                        window.scene.add(queenVoxel);
                    }
                }
            }
            // Cuerpo
            for (let y = 2; y < 5; y++) {
                const size = 6 - y;
                for (let x = 0; x < size; x++) {
                    for (let z = 0; z < size; z++) {
                        const bodyVoxel = window.createVoxel(
                            baseX + x + (2 - size)/2, 
                            y + 1, 
                            baseZ + z + (2 - size)/2, 
                            pieceColor, 
                            'piece'
                        );
                        bodyVoxel.userData.pieceId = piece.id;
                        window.scene.add(bodyVoxel);
                    }
                }
            }
            // Corona
            for (let x = -1; x <= 2; x++) {
                for (let z = -1; z <= 2; z++) {
                    if (x === 0 || x === 1 || z === 0 || z === 1) {
                        const crownVoxel = window.createVoxel(
                            baseX + x, 
                            6, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        crownVoxel.userData.pieceId = piece.id;
                        window.scene.add(crownVoxel);
                    }
                }
            }
            break;
            
        case 'king':
            // Rey
            // Base
            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < 2; x++) {
                    for (let z = 0; z < 2; z++) {
                        const kingVoxel = window.createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        kingVoxel.userData.pieceId = piece.id;
                        window.scene.add(kingVoxel);
                    }
                }
            }
            // Cuerpo
            for (let y = 2; y < 4; y++) {
                const size = 5 - y;
                for (let x = 0; x < size; x++) {
                    for (let z = 0; z < size; z++) {
                        const bodyVoxel = window.createVoxel(
                            baseX + x + (2 - size)/2, 
                            y + 1, 
                            baseZ + z + (2 - size)/2, 
                            pieceColor, 
                            'piece'
                        );
                        bodyVoxel.userData.pieceId = piece.id;
                        window.scene.add(bodyVoxel);
                    }
                }
            }
            // Cruz
            for (let y = 5; y < 7; y++) {
                const crossVoxel = window.createVoxel(
                    baseX + 0.5, 
                    y + 1, 
                    baseZ + 0.5, 
                    pieceColor, 
                    'piece'
                );
                crossVoxel.userData.pieceId = piece.id;
                window.scene.add(crossVoxel);
            }
            for (let x = 0; x < 2; x++) {
                const crossVoxel = window.createVoxel(
                    baseX + x, 
                    6, 
                    baseZ + 0.5, 
                    pieceColor, 
                    'piece'
                );
                crossVoxel.userData.pieceId = piece.id;
                window.scene.add(crossVoxel);
            }
            break;
    }
}

// Manejar mensajes entrantes
function handleIncoming(conn, data) {
    if (!data || !data.type) return;
    
    console.log('handleIncoming from', conn.peer, data.type, data);
    
    switch(data.type) {
        case 'hello':
            // cliente saluda - host responderá en connection.open con rol y estado completo
            break;
            
        case 'role-assignment':
            // cliente recibe rol asignado
            if (!isHost) { 
                myRoleLocal = data.role; 
                updatePlayerRole(data.role); 
                console.log('Role assigned:', data.role); 
            }
            break;
            
        case 'full-state':
            // cliente sincroniza estado completo (autoritativo del host)
            applyFullState(data.state);
            break;
            
        case 'request-move':
            // SOLO el host debe procesar request-move
            if (!isHost) {
                // clientes ignoran o reenvían? ignorar
                return;
            }
            handleRequestMoveFromClient(conn, data.move);
            break;
            
        case 'move':
            // cliente aplica movimiento enviado por host
            window.applyMoveFromHost(data.move);
            
            // opcional: aplicar gameStatus enviado por host
            if (data.gameStatus) { 
                window.gameStatus = data.gameStatus; 
                document.getElementById('game-status').textContent = data.gameStatus; 
            }
            break;
            
        case 'move-rejected':
            // cliente recibe rechazo
            alert('Movimiento rechazado: ' + (data.reason || 'motivo desconocido'));
            break;
            
        case 'restart':
            // host o cliente solicita reinicio - host debe reiniciar estado y difundir
            if (isHost) { 
                restartGameHost(); 
            }
            break;
            
        case 'error':
            console.warn('Error recibido:', data.reason);
            updateConnectionStatus('error', 'Error: ' + data.reason);
            break;
            
        default:
            console.warn('Tipo de mensaje desconocido', data.type);
    }
}

// Manejar solicitud de movimiento del cliente
function handleRequestMoveFromClient(conn, moveRequest) {
    // moveRequest: { pieceId, fromRow, fromCol, toRow, toCol }
    // encontrar pieza (preferir coincidencia por id; fallback a fromRow/fromCol)
    let piece = window.pieces.find(p => p.id === moveRequest.pieceId);
    if (!piece) piece = window.board[moveRequest.fromRow][moveRequest.fromCol];
    
    if (!piece) { 
        conn.send({ type: 'move-rejected', reason: 'piece-not-found' }); 
        return; 
    }
    
    // asegurar que es el turno del jugador correcto
    if (piece.color !== window.currentTurn) { 
        conn.send({ type: 'move-rejected', reason: 'not-your-turn' }); 
        return; 
    }
    
    // validar movimiento usando isValidMove autoritativo
    if (!window.isValidMove(piece, moveRequest.toRow, moveRequest.toCol)) {
        conn.send({ type: 'move-rejected', reason: 'invalid-move' }); 
        return;
    }
    
    // aplicar movimiento en host
    const originalRow = piece.row, originalCol = piece.col;
    const moveData = window.applyMoveHostInternal(piece, moveRequest.toRow, moveRequest.toCol);
    
    // difundir movimiento autoritativo a todos (incluyendo el solicitante original)
    broadcast({ 
        type: 'move', 
        move: moveData,
        gameStatus: window.gameStatus
    });
}

// Solicitar movimiento al host
function requestMoveToHost(piece, toRow, toCol) {
    // encontrar conexión host (asumimos primera conexión es host)
    const hostConn = Object.values(connections)[0];
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

// Actualizar rol del jugador en UI
function updatePlayerRole(role) {
    const roleEl = document.getElementById('player-role');
    document.getElementById('room-info').style.display = 'block';
    document.getElementById('room-code-display').textContent = roomCode || '-';
    
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

// Reiniciar juego como host
function restartGameHost() {
    // solo el host debe reiniciar y difundir estado completo
    if (!isHost) return;
    
    // eliminar meshes de piezas
    const pieceMeshes = window.scene.children.filter(c => c.userData.type === 'piece');
    pieceMeshes.forEach(m => window.scene.remove(m));
    
    // reiniciar
    initializePiecesDeterministic();
    window.currentTurn = 'white'; 
    window.moveHistory = []; 
    window.moveCount = 0; 
    window.capturedPieces = {white:[], black:[]}; 
    window.gameStatus = 'playing';
    
    broadcast({ type: 'full-state', state: serializeFullState() });
}

// Inicializar piezas deterministas
function initializePiecesDeterministic() {
    window.pieces.length = 0;
    for (let r=0; r<window.CONFIG.BOARD_SIZE; r++) {
        for (let c=0; c<window.CONFIG.BOARD_SIZE; c++) {
            window.board[r][c] = null;
        }
    }
    
    // peones
    for (let c=0; c<8; c++) { 
        window.createPiece('pawn', 'white', 6, c); 
        window.createPiece('pawn', 'black', 1, c); 
    }
    
    // torres
    window.createPiece('rook', 'white', 7, 0); 
    window.createPiece('rook', 'white', 7, 7);
    window.createPiece('rook', 'black', 0, 0); 
    window.createPiece('rook', 'black', 0, 7);
    
    // caballos
    window.createPiece('knight', 'white', 7, 1); 
    window.createPiece('knight', 'white', 7, 6);
    window.createPiece('knight', 'black', 0, 1); 
    window.createPiece('knight', 'black', 0, 6);
    
    // alfiles
    window.createPiece('bishop', 'white', 7, 2); 
    window.createPiece('bishop', 'white', 7, 5);
    window.createPiece('bishop', 'black', 0, 2); 
    window.createPiece('bishop', 'black', 0, 5);
    
    // reinas
    window.createPiece('queen', 'white', 7, 3); 
    window.createPiece('queen', 'black', 0, 3);
    
    // reyes
    window.createPiece('king', 'white', 7, 4); 
    window.createPiece('king', 'black', 0, 4);
}

// Actualizar estado de conexión en UI
function updateConnectionStatus(status, message) {
    const statusEl = document.getElementById('connection-status');
    statusEl.classList.remove('status-disconnected', 'status-connecting', 'status-connected', 'status-error');
    statusEl.classList.add(`status-${status}`);
    statusEl.textContent = message;
}

// Actualizar UI de conexiones
function refreshConnectionUI() {
    const anyOpen = Object.values(connections).some(c => c.open);
    if (anyOpen) {
        updateConnectionStatus('connected', 'Conectado');
    } else if (isHost) {
        updateConnectionStatus('connecting', 'Esperando jugador...');
    } else {
        updateConnectionStatus('disconnected', 'Desconectado');
    }
}

// Crear sala
function createRoom() {
    initializePeer()
        .then(() => {
            isHost = true;
            roomCode = Math.random().toString(36).substring(2,8).toUpperCase();
            document.getElementById('room-code-display').textContent = roomCode;
            document.getElementById('room-info').style.display = 'block';
            updateConnectionStatus('connecting', 'Esperando jugador...');
            myRoleLocal = 'white';
            updatePlayerRole('white');
            console.log('Sala creada. Peer ID:', localPeerId, 'Room code:', roomCode);
        })
        .catch(err => {
            console.error('Error initializing peer for host', err);
            updateConnectionStatus('error', 'No se pudo inicializar Peer');
        });
}

// Unirse a sala
function joinRoom() {
    const hostPeerId = document.getElementById('host-id-input').value.trim();
    const code = document.getElementById('room-code-input').value.trim().toUpperCase();
    
    if (!hostPeerId || !code) { 
        alert('Por favor ingresa ID del host y código de sala'); 
        return; 
    }
    
    initializePeer()
        .then(() => {
            roomCode = code;
            isHost = false;
            
            // conectar al host con metadata conteniendo código de sala solicitado
            const conn = peer.connect(hostPeerId, { metadata: { roomCode: code } });
            
            conn.on('open', () => {
                console.log('Conexión abierta con host', hostPeerId);
                setupConnectionHandlers(conn);
                conn.send({ type: 'hello', message: 'Hola host, solicito unirme', desiredRole: null });
            });
            
            conn.on('error', (e) => { 
                console.error(e); 
                updateConnectionStatus('error', 'Error al conectar con host'); 
            });
            
            updateConnectionStatus('connecting', 'Conectando...');
            updatePlayerRole('spectator');
        })
        .catch(err => {
            console.error('Error initializing peer for joiner', err);
            updateConnectionStatus('error', 'No se pudo inicializar Peer');
        });
}

// Manejar reinicio
function handleRestart() {
    if (isHost) {
        restartGameHost();
    } else {
        // Si es cliente, solicitar reinicio al host
        const hostConn = Object.values(connections)[0];
        if (hostConn && hostConn.open) {
            hostConn.send({ type: 'restart' });
        }
    }
}

// Configurar interfaz de multijugador
function setupMultiplayerUI() {
    // Eventos para crear sala y unirse a sala
    document.getElementById('create-room-button').addEventListener('click', createRoom);
    document.getElementById('join-room-button').addEventListener('click', joinRoom);
    document.getElementById('restart-button').addEventListener('click', handleRestart);
}

// Exponer funciones globalmente
window.initializePeer = initializePeer;
window.setupMultiplayerUI = setupMultiplayerUI;
