// js/pieceFactory.js
class PieceFactory {
    constructor(sceneManager, board) {
        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.board = board;
        this.pieces = [];
        this.boardSize = Config.BOARD_SIZE;
    }
    
    deterministicId(type, color, row, col) {
        return `${type}_${color}_${row}_${col}`;
    }
    
    createPiece(type, color, row, col, meshCreator = true) {
        const pieceId = this.deterministicId(type, color, row, col);
        const piece = {
            id: pieceId,
            type: type,
            color: color,
            row: row,
            col: col,
            mesh: null
        };
        
        const pieceColor = color === 'white' ? Config.COLORS.WHITE_PIECE : Config.COLORS.BLACK_PIECE;
        const baseX = col * 4 + 1 - 14;
        const baseZ = row * 4 + 1 - 14;
        
        // Crear la pieza según su tipo
        switch(type) {
            case 'pawn':
                // Peón
                for (let y = 0; y < 2; y++) {
                    for (let x = 0; x < 2; x++) {
                        for (let z = 0; z < 2; z++) {
                            const pawnVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            pawnVoxel.userData.pieceId = pieceId;
                            this.scene.add(pawnVoxel);
                        }
                    }
                }
                break;
                
            case 'rook':
                // Torre
                for (let y = 0; y < 4; y++) {
                    for (let x = 0; x < 2; x++) {
                        for (let z = 0; z < 2; z++) {
                            const rookVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            rookVoxel.userData.pieceId = pieceId;
                            this.scene.add(rookVoxel);
                        }
                    }
                }
                // Almenas
                for (let x = -1; x <= 2; x++) {
                    for (let z = -1; z <= 2; z++) {
                        if ((x === -1 || x === 2) && (z === -1 || z === 2)) {
                            const almenaVoxel = this.createVoxel(
                                baseX + x, 
                                5, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            almenaVoxel.userData.pieceId = pieceId;
                            this.scene.add(almenaVoxel);
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
                            const knightVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            knightVoxel.userData.pieceId = pieceId;
                            this.scene.add(knightVoxel);
                        }
                    }
                }
                // Cabeza
                for (let y = 3; y < 5; y++) {
                    for (let x = 0; x < 2; x++) {
                        for (let z = 0; z < 1; z++) {
                            const headVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            headVoxel.userData.pieceId = pieceId;
                            this.scene.add(headVoxel);
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
                            const bishopVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            bishopVoxel.userData.pieceId = pieceId;
                            this.scene.add(bishopVoxel);
                        }
                    }
                }
                // Cuerpo
                for (let y = 2; y < 4; y++) {
                    const size = 4 - y;
                    for (let x = 0; x < size; x++) {
                        for (let z = 0; z < size; z++) {
                            const bodyVoxel = this.createVoxel(
                                baseX + x + (2 - size)/2, 
                                y + 1, 
                                baseZ + z + (2 - size)/2, 
                                pieceColor, 
                                'piece'
                            );
                            bodyVoxel.userData.pieceId = pieceId;
                            this.scene.add(bodyVoxel);
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
                            const queenVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            queenVoxel.userData.pieceId = pieceId;
                            this.scene.add(queenVoxel);
                        }
                    }
                }
                // Cuerpo
                for (let y = 2; y < 5; y++) {
                    const size = 6 - y;
                    for (let x = 0; x < size; x++) {
                        for (let z = 0; z < size; z++) {
                            const bodyVoxel = this.createVoxel(
                                baseX + x + (2 - size)/2, 
                                y + 1, 
                                baseZ + z + (2 - size)/2, 
                                pieceColor, 
                                'piece'
                            );
                            bodyVoxel.userData.pieceId = pieceId;
                            this.scene.add(bodyVoxel);
                        }
                    }
                }
                // Corona
                for (let x = -1; x <= 2; x++) {
                    for (let z = -1; z <= 2; z++) {
                        if (x === 0 || x === 1 || z === 0 || z === 1) {
                            const crownVoxel = this.createVoxel(
                                baseX + x, 
                                6, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            crownVoxel.userData.pieceId = pieceId;
                            this.scene.add(crownVoxel);
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
                            const kingVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            kingVoxel.userData.pieceId = pieceId;
                            this.scene.add(kingVoxel);
                        }
                    }
                }
                // Cuerpo
                for (let y = 2; y < 4; y++) {
                    const size = 5 - y;
                    for (let x = 0; x < size; x++) {
                        for (let z = 0; z < size; z++) {
                            const bodyVoxel = this.createVoxel(
                                baseX + x + (2 - size)/2, 
                                y + 1, 
                                baseZ + z + (2 - size)/2, 
                                pieceColor, 
                                'piece'
                            );
                            bodyVoxel.userData.pieceId = pieceId;
                            this.scene.add(bodyVoxel);
                        }
                    }
                }
                // Cruz
                for (let y = 5; y < 7; y++) {
                    const crossVoxel = this.createVoxel(
                        baseX + 0.5, 
                        y + 1, 
                        baseZ + 0.5, 
                        pieceColor, 
                        'piece'
                    );
                    crossVoxel.userData.pieceId = pieceId;
                    this.scene.add(crossVoxel);
                }
                for (let x = 0; x < 2; x++) {
                    const crossVoxel = this.createVoxel(
                        baseX + x, 
                        6, 
                        baseZ + 0.5, 
                        pieceColor, 
                        'piece'
                    );
                    crossVoxel.userData.pieceId = pieceId;
                    this.scene.add(crossVoxel);
                }
                break;
        }
        
        this.board[row][col] = piece;
        this.pieces.push(piece);
        return piece;
    }
    
    createVoxel(x, y, z, color, type = 'normal') {
        const geometry = new THREE.BoxGeometry(Config.VOXEL_SIZE, Config.VOXEL_SIZE, Config.VOXEL_SIZE);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 30
        });
        const voxel = new THREE.Mesh(geometry, material);
        voxel.position.set(x, y, z);
        voxel.castShadow = true;
        voxel.receiveShadow = true;
        voxel.userData.type = type;
        return voxel;
    }
    
    initializePieces() {
        // Peones
        for (let col = 0; col < this.boardSize; col++) {
            this.createPiece('pawn', 'white', 6, col);
            this.createPiece('pawn', 'black', 1, col);
        }
        
        // Torres
        this.createPiece('rook', 'white', 7, 0);
        this.createPiece('rook', 'white', 7, 7);
        this.createPiece('rook', 'black', 0, 0);
        this.createPiece('rook', 'black', 0, 7);
        
        // Caballos
        this.createPiece('knight', 'white', 7, 1);
        this.createPiece('knight', 'white', 7, 6);
        this.createPiece('knight', 'black', 0, 1);
        this.createPiece('knight', 'black', 0, 6);
        
        // Alfiles
        this.createPiece('bishop', 'white', 7, 2);
        this.createPiece('bishop', 'white', 7, 5);
        this.createPiece('bishop', 'black', 0, 2);
        this.createPiece('bishop', 'black', 0, 5);
        
        // Reinas
        this.createPiece('queen', 'white', 7, 3);
        this.createPiece('queen', 'black', 0, 3);
        
        // Reyes
        this.createPiece('king', 'white', 7, 4);
        this.createPiece('king', 'black', 0, 4);
        
        return this.pieces;
    }
    
    getPieces() {
        return this.pieces;
    }
    
    createPieceMeshes(piece) {
        const pieceColor = piece.color === 'white' ? Config.COLORS.WHITE_PIECE : Config.COLORS.BLACK_PIECE;
        const baseX = piece.col * 4 + 1 - 14;
        const baseZ = piece.row * 4 + 1 - 14;
        
        // Crear la pieza según su tipo (misma lógica que createPiece original)
        switch(piece.type) {
            case 'pawn':
                // Peón
                for (let y = 0; y < 2; y++) {
                    for (let x = 0; x < 2; x++) {
                        for (let z = 0; z < 2; z++) {
                            const pawnVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            pawnVoxel.userData.pieceId = piece.id;
                            this.scene.add(pawnVoxel);
                        }
                    }
                }
                break;
                
            case 'rook':
                // Torre
                for (let y = 0; y < 4; y++) {
                    for (let x = 0; x < 2; x++) {
                        for (let z = 0; z < 2; z++) {
                            const rookVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            rookVoxel.userData.pieceId = piece.id;
                            this.scene.add(rookVoxel);
                        }
                    }
                }
                // Almenas
                for (let x = -1; x <= 2; x++) {
                    for (let z = -1; z <= 2; z++) {
                        if ((x === -1 || x === 2) && (z === -1 || z === 2)) {
                            const almenaVoxel = this.createVoxel(
                                baseX + x, 
                                5, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            almenaVoxel.userData.pieceId = piece.id;
                            this.scene.add(almenaVoxel);
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
                            const knightVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            knightVoxel.userData.pieceId = piece.id;
                            this.scene.add(knightVoxel);
                        }
                    }
                }
                // Cabeza
                for (let y = 3; y < 5; y++) {
                    for (let x = 0; x < 2; x++) {
                        for (let z = 0; z < 1; z++) {
                            const headVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            headVoxel.userData.pieceId = piece.id;
                            this.scene.add(headVoxel);
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
                            const bishopVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            bishopVoxel.userData.pieceId = piece.id;
                            this.scene.add(bishopVoxel);
                        }
                    }
                }
                // Cuerpo
                for (let y = 2; y < 4; y++) {
                    const size = 4 - y;
                    for (let x = 0; x < size; x++) {
                        for (let z = 0; z < size; z++) {
                            const bodyVoxel = this.createVoxel(
                                baseX + x + (2 - size)/2, 
                                y + 1, 
                                baseZ + z + (2 - size)/2, 
                                pieceColor, 
                                'piece'
                            );
                            bodyVoxel.userData.pieceId = piece.id;
                            this.scene.add(bodyVoxel);
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
                            const queenVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            queenVoxel.userData.pieceId = piece.id;
                            this.scene.add(queenVoxel);
                        }
                    }
                }
                // Cuerpo
                for (let y = 2; y < 5; y++) {
                    const size = 6 - y;
                    for (let x = 0; x < size; x++) {
                        for (let z = 0; z < size; z++) {
                            const bodyVoxel = this.createVoxel(
                                baseX + x + (2 - size)/2, 
                                y + 1, 
                                baseZ + z + (2 - size)/2, 
                                pieceColor, 
                                'piece'
                            );
                            bodyVoxel.userData.pieceId = piece.id;
                            this.scene.add(bodyVoxel);
                        }
                    }
                }
                // Corona
                for (let x = -1; x <= 2; x++) {
                    for (let z = -1; z <= 2; z++) {
                        if (x === 0 || x === 1 || z === 0 || z === 1) {
                            const crownVoxel = this.createVoxel(
                                baseX + x, 
                                6, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            crownVoxel.userData.pieceId = piece.id;
                            this.scene.add(crownVoxel);
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
                            const kingVoxel = this.createVoxel(
                                baseX + x, 
                                y + 1, 
                                baseZ + z, 
                                pieceColor, 
                                'piece'
                            );
                            kingVoxel.userData.pieceId = piece.id;
                            this.scene.add(kingVoxel);
                        }
                    }
                }
                // Cuerpo
                for (let y = 2; y < 4; y++) {
                    const size = 5 - y;
                    for (let x = 0; x < size; x++) {
                        for (let z = 0; z < size; z++) {
                            const bodyVoxel = this.createVoxel(
                                baseX + x + (2 - size)/2, 
                                y + 1, 
                                baseZ + z + (2 - size)/2, 
                                pieceColor, 
                                'piece'
                            );
                            bodyVoxel.userData.pieceId = piece.id;
                            this.scene.add(bodyVoxel);
                        }
                    }
                }
                // Cruz
                for (let y = 5; y < 7; y++) {
                    const crossVoxel = this.createVoxel(
                        baseX + 0.5, 
                        y + 1, 
                        baseZ + 0.5, 
                        pieceColor, 
                        'piece'
                    );
                    crossVoxel.userData.pieceId = piece.id;
                    this.scene.add(crossVoxel);
                }
                for (let x = 0; x < 2; x++) {
                    const crossVoxel = this.createVoxel(
                        baseX + x, 
                        6, 
                        baseZ + 0.5, 
                        pieceColor, 
                        'piece'
                    );
                    crossVoxel.userData.pieceId = piece.id;
                    this.scene.add(crossVoxel);
                }
                break;
        }
    }
}
