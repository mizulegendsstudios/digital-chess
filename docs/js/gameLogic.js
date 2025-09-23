// Validar movimiento sin verificar jaque
function isValidMoveWithoutCheckValidation(piece, toRow, toCol) {
    // Verificar si la posición está dentro del tablero
    if (toRow < 0 || toRow >= window.CONFIG.BOARD_SIZE || toCol < 0 || toCol >= window.CONFIG.BOARD_SIZE) {
        return false;
    }
    
    // Verificar si hay una pieza del mismo color en la posición destino
    const targetPiece = window.board[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) {
        return false;
    }
    
    const rowDiff = toRow - piece.row;
    const colDiff = toCol - piece.col;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);
    
    switch(piece.type) {
        case 'pawn':
            // Lógica del peón...
            break;
        case 'rook':
            // Lógica de la torre...
            break;
        // Casos para otras piezas...
    }
    
    return false;
}

// Validar movimiento completo
function isValidMove(piece, toRow, toCol) {
    // Verificar movimiento básico
    if (!isValidMoveWithoutCheckValidation(piece, toRow, toCol)) {
        return false;
    }
    
    // Simular el movimiento para verificar si deja al rey en jaque
    const originalRow = piece.row;
    const originalCol = piece.col;
    const capturedPiece = window.board[toRow][toCol];
    
    // Actualizar tablero temporalmente
    window.board[piece.row][piece.col] = null;
    window.board[toRow][toCol] = piece;
    piece.row = toRow;
    piece.col = toCol;
    
    // Verificar si el rey queda en jaque
    const inCheck = isKingInCheck(piece.color);
    
    // Revertir el movimiento
    piece.row = originalRow;
    piece.col = originalCol;
    window.board[originalRow][originalCol] = piece;
    window.board[toRow][toCol] = capturedPiece;
    
    // Si el rey queda en jaque, el movimiento no es válido
    return !inCheck;
}

// Verificar si el rey está en jaque
function isKingInCheck(color) {
    // Encontrar el rey del color dado
    const king = window.pieces.find(p => p.type === 'king' && p.color === color);
    if (!king) return false;
    
    // Verificar si alguna pieza del color opuesto puede capturar al rey
    const opponentColor = color === 'white' ? 'black' : 'white';
    for (const piece of window.pieces) {
        if (piece.color === opponentColor) {
            if (isValidMoveWithoutCheckValidation(piece, king.row, king.col)) {
                return true;
            }
        }
    }
    return false;
}

// Obtener movimientos válidos para una pieza
function getValidMoves(piece) {
    const moves = [];
    
    for (let row = 0; row < window.CONFIG.BOARD_SIZE; row++) {
        for (let col = 0; col < window.CONFIG.BOARD_SIZE; col++) {
            if (isValidMove(piece, row, col)) {
                moves.push({row, col});
            }
        }
    }
    
    return moves;
}

// Resaltar movimientos válidos
function highlightValidMoves(moves) {
    // Eliminar resaltados anteriores
    const oldHighlights = window.scene.children.filter(child => child.userData.type === 'highlight');
    oldHighlights.forEach(highlight => window.scene.remove(highlight));
    
    // Resaltar movimientos válidos
    moves.forEach(move => {
        const highlightGeometry = new THREE.BoxGeometry(3.8, 0.2, 3.8);
        const highlightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FF00, 
            transparent: true, 
            opacity: 0.5 
        });
        const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlight.position.set(move.col * 4 + 1 - 14, 0.6, move.row * 4 + 1 - 14);
        highlight.userData.type = 'highlight';
        window.scene.add(highlight);
    });
}

// Animar movimiento de pieza
function animatePieceMove(piece, toRow, toCol, callback) {
    const pieceMeshes = window.scene.children.filter(child => 
        child.userData.type === 'piece' && child.userData.pieceId === piece.id
    );
    
    const newX = toCol * 4 + 1 - 14;
    const newZ = toRow * 4 + 1 - 14;
    const oldX = piece.col * 4 + 1 - 14;
    const oldZ = piece.row * 4 + 1 - 14;
    
    const deltaX = newX - oldX;
    const deltaZ = newZ - oldZ;
    
    const duration = 500; // ms
    const startTime = performance.now();
    
    function animate() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease in-out
        const easedProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        pieceMeshes.forEach(mesh => {
            mesh.position.x = oldX + deltaX * easedProgress;
            mesh.position.z = oldZ + deltaZ * easedProgress;
        });
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Asegurar posición final
            pieceMeshes.forEach(mesh => {
                mesh.position.x = newX;
                mesh.position.z = newZ;
            });
            if (callback) callback();
        }
    }
    
    animate();
}

// Función para aplicar un movimiento en el host
function applyMoveHostInternal(piece, toRow, toCol) {
    // Guardar las posiciones originales
    const originalCol = piece.col;
    const originalRow = piece.row;
    
    // Capturar pieza si existe
    const capturedPiece = window.board[toRow][toCol];
    if (capturedPiece) {
        window.capturedPieces[capturedPiece.color].push(capturedPiece.type);
        updateCapturedPieces();
        
        // Eliminar la pieza capturada de la escena
        const pieceMeshes = window.scene.children.filter(child => 
            child.userData.type === 'piece' && child.userData.pieceId === capturedPiece.id
        );
        pieceMeshes.forEach(mesh => window.scene.remove(mesh));
    }
    
    // Actualizar tablero
    window.board[piece.row][piece.col] = null;
    window.board[toRow][toCol] = piece;
    
    // Registrar movimiento
    window.moveCount++;
    const moveNotation = `${window.moveCount}. ${piece.type} ${String.fromCharCode(97 + originalCol)}${8 - originalRow} → ${String.fromCharCode(97 + toCol)}${8 - toRow}`;
    window.moveHistory.push(moveNotation);
    updateMoveHistory();
    
    // Animar el movimiento en la pantalla del anfitrión
    animatePieceMove(piece, toRow, toCol, () => {
        // Actualizar posición de la pieza después de la animación
        piece.row = toRow;
        piece.col = toCol;
        
        // Cambiar turno
        window.currentTurn = window.currentTurn === 'white' ? 'black' : 'white';
        updateTurnIndicator();
        
        // Verificar estado del juego
        checkGameStatus();
    });
    
    // Crear objeto de movimiento para broadcast (usando valores originales)
    return {
        pieceId: piece.id,
        fromRow: originalRow,
        fromCol: originalCol,
        toRow: toRow,
        toCol: toCol,
        nextTurn: window.currentTurn === 'white' ? 'black' : 'white', // El turno que será después del movimiento
        moveCount: window.moveCount,
        moveNotation: moveNotation
    };
}

// Función para aplicar un movimiento recibido del host
function applyMoveFromHost(move) {
    const piece = window.pieces.find(p => p.id === move.pieceId);
    if (!piece) return;
    
    // Capturar pieza si existe
    const capturedPiece = window.board[move.toRow][move.toCol];
    if (capturedPiece && capturedPiece.id !== piece.id) {
        window.capturedPieces[capturedPiece.color].push(capturedPiece.type);
        updateCapturedPieces();
        
        // Eliminar la pieza capturada de la escena
        const pieceMeshes = window.scene.children.filter(child => 
            child.userData.type === 'piece' && child.userData.pieceId === capturedPiece.id
        );
        pieceMeshes.forEach(mesh => window.scene.remove(mesh));
    }
    
    // Actualizar tablero
    window.board[piece.row][piece.col] = null;
    window.board[move.toRow][move.toCol] = piece;
    
    // Actualizar historial de movimientos
    if (move.moveNotation) {
        window.moveHistory.push(move.moveNotation);
        updateMoveHistory();
    }
    
    // Animar movimiento
    animatePieceMove(piece, move.toRow, move.toCol, () => {
        // Actualizar posición de la pieza después de la animación
        piece.row = move.toRow;
        piece.col = move.toCol;
        
        // Actualizar turno
        if (move.nextTurn) {
            window.currentTurn = move.nextTurn;
            updateTurnIndicator();
        }
        
        // Verificar estado del juego
        checkGameStatus();
    });
}

function updateTurnIndicator() {
    const turnElement = document.getElementById('current-turn');
    if (window.currentTurn === 'white') {
        turnElement.textContent = 'Blancas';
        turnElement.className = 'turn-indicator-white';
    } else {
        turnElement.textContent = 'Negras';
        turnElement.className = 'turn-indicator-black';
    }
}

function updateCapturedPieces() {
    const whiteCaptured = window.capturedPieces.white.length > 0 ? 
        window.capturedPieces.white.join(', ') : 'Ninguna';
    const blackCaptured = window.capturedPieces.black.length > 0 ? 
        window.capturedPieces.black.join(', ') : 'Ninguna';
    
    document.getElementById('captured-white').textContent = whiteCaptured;
    document.getElementById('captured-black').textContent = blackCaptured;
}

function updateMoveHistory() {
    const movesList = document.getElementById('moves-list');
    movesList.innerHTML = '';
    
    // Mostrar últimos 10 movimientos
    const recentMoves = window.moveHistory.slice(-10);
    recentMoves.forEach(move => {
        const moveEntry = document.createElement('div');
        moveEntry.className = 'move-entry';
        moveEntry.textContent = move;
        movesList.appendChild(moveEntry);
    });
    
    // Scroll al final
    movesList.scrollTop = movesList.scrollHeight;
}

function checkGameStatus() {
    // Verificar si el rey actual está en jaque
    const kingInCheck = isKingInCheck(window.currentTurn);
    
    // Verificar si hay movimientos legales
    let hasLegalMoves = false;
    for (const piece of window.pieces.filter(p => p.color === window.currentTurn)) {
        const moves = getValidMoves(piece);
        if (moves.length > 0) {
            hasLegalMoves = true;
            break;
        }
    }
    
    if (!hasLegalMoves) {
        if (kingInCheck) {
            window.gameStatus = 'checkmate';
            document.getElementById('game-status').textContent = 
                `¡Jaque mate! Ganan las ${window.currentTurn === 'white' ? 'negras' : 'blancas'}`;
        } else {
            window.gameStatus = 'stalemate';
            document.getElementById('game-status').textContent = '¡Tablas por ahogado!';
        }
    } else if (kingInCheck) {
        window.gameStatus = 'check';
        document.getElementById('game-status').textContent = '¡Jaque!';
    } else {
        window.gameStatus = 'playing';
        document.getElementById('game-status').textContent = 'Juego en curso';
    }
}

function restartGame() {
    // Eliminar todas las piezas del tablero y de la escena
    window.pieces.length = 0;
    for (let row = 0; row < window.CONFIG.BOARD_SIZE; row++) {
        for (let col = 0; col < window.CONFIG.BOARD_SIZE; col++) {
            window.board[row][col] = null;
        }
    }
    
    // Eliminar todos los voxels de tipo 'piece' de la escena
    const pieceMeshes = window.scene.children.filter(child => child.userData.type === 'piece');
    pieceMeshes.forEach(mesh => window.scene.remove(mesh));
    
    // Reiniciar variables de juego
    window.selectedPiece = null;
    window.validMoves = [];
    window.currentTurn = 'white';
    window.capturedPieces = { white: [], black: [] };
    window.gameStatus = 'playing';
    window.moveHistory = [];
    window.moveCount = 0;
    
    // Volver a crear las piezas
    initializePieces();
    
    // Actualizar UI
    updateTurnIndicator();
    updateCapturedPieces();
    updateMoveHistory();
    document.getElementById('game-status').textContent = 'Juego en curso';
    
    // Si es host, enviar estado completo a los clientes
    if (window.isHost) {
        broadcast({ type: 'full-state', state: serializeFullState() });
    }
}

// Exponer funciones globalmente
window.isValidMove = isValidMove;
window.getValidMoves = getValidMoves;
window.highlightValidMoves = highlightValidMoves;
window.animatePieceMove = animatePieceMove;
window.applyMoveHostInternal = applyMoveHostInternal;
window.applyMoveFromHost = applyMoveFromHost;
window.restartGame = restartGame;
