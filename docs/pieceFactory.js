// Crear ID determinista para piezas
function deterministicId(type, color, row, col) {
    return `${type}_${color}_${row}_${col}`;
}

// Crear una pieza de ajedrez
function createPiece(type, color, row, col) {
    const pieceId = deterministicId(type, color, row, col);
    const piece = {
        id: pieceId,
        type: type,
        color: color,
        row: row,
        col: col,
        mesh: null
    };
    
    const pieceColor = color === 'white' ? 0xFFFFFF : 0x333333;
    const baseX = col * 4 + 1 - 14;
    const baseZ = row * 4 + 1 - 14;
    
    // Crear la pieza según su tipo
    switch(type) {
        case 'pawn':
            // Peón
            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < 2; x++) {
                    for (let z = 0; z < 2; z++) {
                        const pawnVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        pawnVoxel.userData.pieceId = pieceId;
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
                        const rookVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        rookVoxel.userData.pieceId = pieceId;
                        window.scene.add(rookVoxel);
                    }
                }
            }
            // Almenas
            for (let x = -1; x <= 2; x++) {
                for (let z = -1; z <= 2; z++) {
                    if ((x === -1 || x === 2) && (z === -1 || z === 2)) {
                        const almenaVoxel = createVoxel(
                            baseX + x, 
                            5, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        almenaVoxel.userData.pieceId = pieceId;
                        window.scene.add(almenaVoxel);
                    }
                }
            }
            break;
            
        // Casos para otras piezas (knight, bishop, queen, king)...
    }
    
    window.board[row][col] = piece;
    window.pieces.push(piece);
    return piece;
}

// Inicializar todas las piezas
function initializePieces() {
    // Peones
    for (let col = 0; col < window.CONFIG.BOARD_SIZE; col++) {
        createPiece('pawn', 'white', 6, col);
        createPiece('pawn', 'black', 1, col);
    }
    
    // Torres
    createPiece('rook', 'white', 7, 0);
    createPiece('rook', 'white', 7, 7);
    createPiece('rook', 'black', 0, 0);
    createPiece('rook', 'black', 0, 7);
    
    // Caballos
    createPiece('knight', 'white', 7, 1);
    createPiece('knight', 'white', 7, 6);
    createPiece('knight', 'black', 0, 1);
    createPiece('knight', 'black', 0, 6);
    
    // Alfiles
    createPiece('bishop', 'white', 7, 2);
    createPiece('bishop', 'white', 7, 5);
    createPiece('bishop', 'black', 0, 2);
    createPiece('bishop', 'black', 0, 5);
    
    // Reinas
    createPiece('queen', 'white', 7, 3);
    createPiece('queen', 'black', 0, 3);
    
    // Reyes
    createPiece('king', 'white', 7, 4);
    createPiece('king', 'black', 0, 4);
}

// Exponer funciones globalmente
window.createPiece = createPiece;
window.initializePieces = initializePieces;
