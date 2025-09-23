// Configuración básica
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87CEEB, 10, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Sistema de día/noche
let dayTime = 12; // 0-24 horas
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(10, 40, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

const moonLight = new THREE.DirectionalLight(0x6495ED, 0.3);
moonLight.position.set(-10, 40, -10);
moonLight.castShadow = true;
scene.add(moonLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Estrellas para la noche
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 2000;
const starsPositions = new Float32Array(starsCount * 3);

for(let i = 0; i < starsCount * 3; i++) {
    starsPositions[i] = (Math.random() - 0.5) * 300;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
const starsMaterial = new THREE.PointsMaterial({
    size: 0.5,
    color: 0xffffff,
    transparent: true,
    opacity: 0
});
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Crear el tablero de ajedrez
const voxelSize = 1;
const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
const voxels = [];
let voxelCount = 0;

function createVoxel(x, y, z, color, type = 'normal') {
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

// Crear tablero
const boardSize = 8;
const board = [];
const pieces = [];
let selectedPiece = null;
let validMoves = [];
let currentTurn = 'white';
let capturedPieces = { white: [], black: [] };
let gameStatus = 'playing'; // playing, check, checkmate, stalemate
let moveHistory = [];
let moveCount = 0;

// Variables multijugador
let peer = null;
let isHost = false;
let roomCode = null;
const connections = {}; // peerId => DataConnection
let localPeerId = null;
let myRoleLocal = 'spectator'; // 'white' | 'black' | 'spectator'

// Inicializar tablero
for (let row = 0; row < boardSize; row++) {
    board[row] = [];
    for (let col = 0; col < boardSize; col++) {
        const isWhite = (row + col) % 2 === 0;
        const color = isWhite ? 0xF5DEB3 : 0x8B4513;
        
        // Crear casilla
        for (let x = 0; x < 4; x++) {
            for (let z = 0; z < 4; z++) {
                const tileVoxel = createVoxel(
                    col * 4 + x - 14, 
                    0, 
                    row * 4 + z - 14, 
                    color, 
                    'tile'
                );
                scene.add(tileVoxel);
                voxels.push(tileVoxel);
                voxelCount++;
            }
        }
        
        // Crear borde del tablero
        if (row === 0 || row === boardSize - 1 || col === 0 || col === boardSize - 1) {
            for (let x = -1; x <= 4; x++) {
                for (let z = -1; z <= 4; z++) {
                    if (x === -1 || x === 4 || z === -1 || z === 4) {
                        const borderVoxel = createVoxel(
                            col * 4 + x - 14, 
                            0, 
                            row * 4 + z - 14, 
                            0x654321, 
                            'border'
                        );
                        scene.add(borderVoxel);
                        voxels.push(borderVoxel);
                        voxelCount++;
                    }
                }
            }
        }
        
        board[row][col] = null;
    }
}

// Crear piezas de ajedrez con IDs deterministas
function deterministicId(type, color, row, col) {
    return `${type}_${color}_${row}_${col}`;
}

function createPiece(type, color, row, col, meshCreator = true) {
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
                        scene.add(pawnVoxel);
                        voxels.push(pawnVoxel);
                        voxelCount++;
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
                        scene.add(rookVoxel);
                        voxels.push(rookVoxel);
                        voxelCount++;
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
                        scene.add(almenaVoxel);
                        voxels.push(almenaVoxel);
                        voxelCount++;
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
                        const knightVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        knightVoxel.userData.pieceId = pieceId;
                        scene.add(knightVoxel);
                        voxels.push(knightVoxel);
                        voxelCount++;
                    }
                }
            }
            // Cabeza
            for (let y = 3; y < 5; y++) {
                for (let x = 0; x < 2; x++) {
                    for (let z = 0; z < 1; z++) {
                        const headVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        headVoxel.userData.pieceId = pieceId;
                        scene.add(headVoxel);
                        voxels.push(headVoxel);
                        voxelCount++;
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
                        const bishopVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        bishopVoxel.userData.pieceId = pieceId;
                        scene.add(bishopVoxel);
                        voxels.push(bishopVoxel);
                        voxelCount++;
                    }
                }
            }
            // Cuerpo
            for (let y = 2; y < 4; y++) {
                const size = 4 - y;
                for (let x = 0; x < size; x++) {
                    for (let z = 0; z < size; z++) {
                        const bodyVoxel = createVoxel(
                            baseX + x + (2 - size)/2, 
                            y + 1, 
                            baseZ + z + (2 - size)/2, 
                            pieceColor, 
                            'piece'
                        );
                        bodyVoxel.userData.pieceId = pieceId;
                        scene.add(bodyVoxel);
                        voxels.push(bodyVoxel);
                        voxelCount++;
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
                        const queenVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        queenVoxel.userData.pieceId = pieceId;
                        scene.add(queenVoxel);
                        voxels.push(queenVoxel);
                        voxelCount++;
                    }
                }
            }
            // Cuerpo
            for (let y = 2; y < 5; y++) {
                const size = 6 - y;
                for (let x = 0; x < size; x++) {
                    for (let z = 0; z < size; z++) {
                        const bodyVoxel = createVoxel(
                            baseX + x + (2 - size)/2, 
                            y + 1, 
                            baseZ + z + (2 - size)/2, 
                            pieceColor, 
                            'piece'
                        );
                        bodyVoxel.userData.pieceId = pieceId;
                        scene.add(bodyVoxel);
                        voxels.push(bodyVoxel);
                        voxelCount++;
                    }
                }
            }
            // Corona
            for (let x = -1; x <= 2; x++) {
                for (let z = -1; z <= 2; z++) {
                    if (x === 0 || x === 1 || z === 0 || z === 1) {
                        const crownVoxel = createVoxel(
                            baseX + x, 
                            6, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        crownVoxel.userData.pieceId = pieceId;
                        scene.add(crownVoxel);
                        voxels.push(crownVoxel);
                        voxelCount++;
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
                        const kingVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        kingVoxel.userData.pieceId = pieceId;
                        scene.add(kingVoxel);
                        voxels.push(kingVoxel);
                        voxelCount++;
                    }
                }
            }
            // Cuerpo
            for (let y = 2; y < 4; y++) {
                const size = 5 - y;
                for (let x = 0; x < size; x++) {
                    for (let z = 0; z < size; z++) {
                        const bodyVoxel = createVoxel(
                            baseX + x + (2 - size)/2, 
                            y + 1, 
                            baseZ + z + (2 - size)/2, 
                            pieceColor, 
                            'piece'
                        );
                        bodyVoxel.userData.pieceId = pieceId;
                        scene.add(bodyVoxel);
                        voxels.push(bodyVoxel);
                        voxelCount++;
                    }
                }
            }
            // Cruz
            for (let y = 5; y < 7; y++) {
                const crossVoxel = createVoxel(
                    baseX + 0.5, 
                    y + 1, 
                    baseZ + 0.5, 
                    pieceColor, 
                    'piece'
                );
                crossVoxel.userData.pieceId = pieceId;
                scene.add(crossVoxel);
                voxels.push(crossVoxel);
                voxelCount++;
            }
            for (let x = 0; x < 2; x++) {
                const crossVoxel = createVoxel(
                    baseX + x, 
                    6, 
                    baseZ + 0.5, 
                    pieceColor, 
                    'piece'
                );
                crossVoxel.userData.pieceId = pieceId;
                scene.add(crossVoxel);
                voxels.push(crossVoxel);
                voxelCount++;
            }
            break;
    }
    
    board[row][col] = piece;
    pieces.push(piece);
    return piece;
}

// Inicializar piezas
function initializePieces() {
    // Peones
    for (let col = 0; col < boardSize; col++) {
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

initializePieces();

document.getElementById('voxelCount').textContent = voxelCount;

// Lógica del ajedrez
function isValidMoveWithoutCheckValidation(piece, toRow, toCol) {
    // Verificar si la posición está dentro del tablero
    if (toRow < 0 || toRow >= boardSize || toCol < 0 || toCol >= boardSize) {
        return false;
    }
    
    // Verificar si hay una pieza del mismo color en la posición destino
    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) {
        return false;
    }
    
    const rowDiff = toRow - piece.row;
    const colDiff = toCol - piece.col;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);
    
    switch(piece.type) {
        case 'pawn':
            // Los peones se mueven hacia adelante
            const direction = piece.color === 'white' ? -1 : 1;
            
            // Movimiento normal
            if (colDiff === 0 && rowDiff === direction && !targetPiece) {
                return true;
            }
            
            // Primer movimiento (dos casillas)
            if (colDiff === 0 && rowDiff === 2 * direction && 
                ((piece.color === 'white' && piece.row === 6) || 
                 (piece.color === 'black' && piece.row === 1)) &&
                !board[piece.row + direction][piece.col] && !targetPiece) {
                return true;
            }
            
            // Captura diagonal
            if (absColDiff === 1 && rowDiff === direction && targetPiece && targetPiece.color !== piece.color) {
                return true;
            }
            
            return false;
            
        case 'rook':
            // Las torres se mueven en línea recta
            if (rowDiff !== 0 && colDiff !== 0) {
                return false;
            }
            
            // Verificar si hay piezas en el camino
            const rowStep = rowDiff === 0 ? 0 : rowDiff / absRowDiff;
            const colStep = colDiff === 0 ? 0 : colDiff / absColDiff;
            
            let checkRow = piece.row + rowStep;
            let checkCol = piece.col + colStep;
            
            while (checkRow !== toRow || checkCol !== toCol) {
                if (board[checkRow][checkCol]) {
                    return false;
                }
                checkRow += rowStep;
                checkCol += colStep;
            }
            
            return true;
            
        case 'knight':
            // Los caballos se mueven en L
            return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
            
        case 'bishop':
            // Los alfiles se mueven en diagonal
            if (absRowDiff !== absColDiff) {
                return false;
            }
            
            // Verificar si hay piezas en el camino
            const rowStepB = rowDiff / absRowDiff;
            const colStepB = colDiff / absColDiff;
            
            let checkRowB = piece.row + rowStepB;
            let checkColB = piece.col + colStepB;
            
            while (checkRowB !== toRow || checkColB !== toCol) {
                if (board[checkRowB][checkColB]) {
                    return false;
                }
                checkRowB += rowStepB;
                checkColB += colStepB;
            }
            
            return true;
            
        case 'queen':
            // La reina se mueve como torre y alfil combinados
            if (rowDiff === 0 || colDiff === 0) {
                // Movimiento de torre
                const rowStepQ = rowDiff === 0 ? 0 : rowDiff / absRowDiff;
                const colStepQ = colDiff === 0 ? 0 : colDiff / absColDiff;
                
                let checkRowQ = piece.row + rowStepQ;
                let checkColQ = piece.col + colStepQ;
                
                while (checkRowQ !== toRow || checkColQ !== toCol) {
                    if (board[checkRowQ][checkColQ]) {
                        return false;
                    }
                    checkRowQ += rowStepQ;
                    checkColQ += colStepQ;
                }
                
                return true;
            } else if (absRowDiff === absColDiff) {
                // Movimiento de alfil
                const rowStepQ = rowDiff / absRowDiff;
                const colStepQ = colDiff / absColDiff;
                
                let checkRowQ = piece.row + rowStepQ;
                let checkColQ = piece.col + colStepQ;
                
                while (checkRowQ !== toRow || checkColQ !== toCol) {
                    if (board[checkRowQ][checkColQ]) {
                        return false;
                    }
                    checkRowQ += rowStepQ;
                    checkColQ += colStepQ;
                }
                
                return true;
            }
            
            return false;
            
        case 'king':
            // El rey se mueve una casilla en cualquier dirección
            return absRowDiff <= 1 && absColDiff <= 1;
            
        default:
            return false;
    }
}

function isValidMove(piece, toRow, toCol) {
    // Verificar movimiento básico
    if (!isValidMoveWithoutCheckValidation(piece, toRow, toCol)) {
        return false;
    }
    
    // Simular el movimiento para verificar si deja al rey en jaque
    const originalRow = piece.row;
    const originalCol = piece.col;
    const capturedPiece = board[toRow][toCol];
    
    // Actualizar tablero temporalmente
    board[piece.row][piece.col] = null;
    board[toRow][toCol] = piece;
    piece.row = toRow;
    piece.col = toCol;
    
    // Verificar si el rey queda en jaque
    const inCheck = isKingInCheck(piece.color);
    
    // Revertir el movimiento
    piece.row = originalRow;
    piece.col = originalCol;
    board[originalRow][originalCol] = piece;
    board[toRow][toCol] = capturedPiece;
    
    // Si el rey queda en jaque, el movimiento no es válido
    return !inCheck;
}

function isKingInCheck(color) {
    // Encontrar el rey del color dado
    const king = pieces.find(p => p.type === 'king' && p.color === color);
    if (!king) return false;
    
    // Verificar si alguna pieza del color opuesto puede capturar al rey
    const opponentColor = color === 'white' ? 'black' : 'white';
    for (const piece of pieces) {
        if (piece.color === opponentColor) {
            if (isValidMoveWithoutCheckValidation(piece, king.row, king.col)) {
                return true;
            }
        }
    }
    return false;
}

function getValidMoves(piece) {
    const moves = [];
    
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (isValidMove(piece, row, col)) {
                moves.push({row, col});
            }
        }
    }
    
    return moves;
}

function highlightValidMoves(moves) {
    // Eliminar resaltados anteriores
    const oldHighlights = scene.children.filter(child => child.userData.type === 'highlight');
    oldHighlights.forEach(highlight => scene.remove(highlight));
    
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
        scene.add(highlight);
    });
}

function animatePieceMove(piece, toRow, toCol, callback) {
    const pieceMeshes = scene.children.filter(child => 
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
    const capturedPiece = board[toRow][toCol];
    if (capturedPiece) {
        capturedPieces[capturedPiece.color].push(capturedPiece.type);
        updateCapturedPieces();
        
        // Eliminar la pieza capturada de la escena
        const pieceMeshes = scene.children.filter(child => 
            child.userData.type === 'piece' && child.userData.pieceId === capturedPiece.id
        );
        pieceMeshes.forEach(mesh => scene.remove(mesh));
    }
    
    // Actualizar tablero
    board[piece.row][piece.col] = null;
    board[toRow][toCol] = piece;
    
    // Registrar movimiento
    moveCount++;
    const moveNotation = `${moveCount}. ${piece.type} ${String.fromCharCode(97 + originalCol)}${8 - originalRow} → ${String.fromCharCode(97 + toCol)}${8 - toRow}`;
    moveHistory.push(moveNotation);
    updateMoveHistory();
    
    // Animar el movimiento en la pantalla del anfitrión
    animatePieceMove(piece, toRow, toCol, () => {
        // Actualizar posición de la pieza después de la animación
        piece.row = toRow;
        piece.col = toCol;
        
        // Cambiar turno
        currentTurn = currentTurn === 'white' ? 'black' : 'white';
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
        nextTurn: currentTurn === 'white' ? 'black' : 'white', // El turno que será después del movimiento
        moveCount: moveCount,
        moveNotation: moveNotation
    };
}

// Función para aplicar un movimiento recibido del host
function applyMoveFromHost(move) {
    const piece = pieces.find(p => p.id === move.pieceId);
    if (!piece) return;
    
    // Capturar pieza si existe
    const capturedPiece = board[move.toRow][move.toCol];
    if (capturedPiece && capturedPiece.id !== piece.id) {
        capturedPieces[capturedPiece.color].push(capturedPiece.type);
        updateCapturedPieces();
        
        // Eliminar la pieza capturada de la escena
        const pieceMeshes = scene.children.filter(child => 
            child.userData.type === 'piece' && child.userData.pieceId === capturedPiece.id
        );
        pieceMeshes.forEach(mesh => scene.remove(mesh));
    }
    
    // Actualizar tablero
    board[piece.row][piece.col] = null;
    board[move.toRow][move.toCol] = piece;
    
    // Actualizar historial de movimientos
    if (move.moveNotation) {
        moveHistory.push(move.moveNotation);
        updateMoveHistory();
    }
    
    // Animar movimiento
    animatePieceMove(piece, move.toRow, move.toCol, () => {
        // Actualizar posición de la pieza después de la animación
        piece.row = move.toRow;
        piece.col = move.toCol;
        
        // Actualizar turno
        if (move.nextTurn) {
            currentTurn = move.nextTurn;
            updateTurnIndicator();
        }
        
        // Verificar estado del juego
        checkGameStatus();
    });
}

function updateTurnIndicator() {
    const turnElement = document.getElementById('current-turn');
    if (currentTurn === 'white') {
        turnElement.textContent = 'Blancas';
        turnElement.className = 'turn-indicator-white';
    } else {
        turnElement.textContent = 'Negras';
        turnElement.className = 'turn-indicator-black';
    }
}

function updateCapturedPieces() {
    const whiteCaptured = capturedPieces.white.length > 0 ? 
        capturedPieces.white.join(', ') : 'Ninguna';
    const blackCaptured = capturedPieces.black.length > 0 ? 
        capturedPieces.black.join(', ') : 'Ninguna';
    
    document.getElementById('captured-white').textContent = whiteCaptured;
    document.getElementById('captured-black').textContent = blackCaptured;
}

function updateMoveHistory() {
    const movesList = document.getElementById('moves-list');
    movesList.innerHTML = '';
    
    // Mostrar últimos 10 movimientos
    const recentMoves = moveHistory.slice(-10);
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
    const kingInCheck = isKingInCheck(currentTurn);
    
    // Verificar si hay movimientos legales
    let hasLegalMoves = false;
    for (const piece of pieces.filter(p => p.color === currentTurn)) {
        const moves = getValidMoves(piece);
        if (moves.length > 0) {
            hasLegalMoves = true;
            break;
        }
    }
    
    if (!hasLegalMoves) {
        if (kingInCheck) {
            gameStatus = 'checkmate';
            document.getElementById('game-status').textContent = 
                `¡Jaque mate! Ganan las ${currentTurn === 'white' ? 'negras' : 'blancas'}`;
        } else {
            gameStatus = 'stalemate';
            document.getElementById('game-status').textContent = '¡Tablas por ahogado!';
        }
    } else if (kingInCheck) {
        gameStatus = 'check';
        document.getElementById('game-status').textContent = '¡Jaque!';
    } else {
        gameStatus = 'playing';
        document.getElementById('game-status').textContent = 'Juego en curso';
    }
}

function restartGame() {
    // Eliminar todas las piezas del tablero y de la escena
    pieces.length = 0;
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            board[row][col] = null;
        }
    }
    
    // Eliminar todos los voxels de tipo 'piece' de la escena
    const pieceMeshes = scene.children.filter(child => child.userData.type === 'piece');
    pieceMeshes.forEach(mesh => scene.remove(mesh));
    
    // Reiniciar variables de juego
    selectedPiece = null;
    validMoves = [];
    currentTurn = 'white';
    capturedPieces = { white: [], black: [] };
    gameStatus = 'playing';
    moveHistory = [];
    moveCount = 0;
    
    // Volver a crear las piezas
    initializePieces();
    
    // Actualizar UI
    updateTurnIndicator();
    updateCapturedPieces();
    updateMoveHistory();
    document.getElementById('game-status').textContent = 'Juego en curso';
    
    // Si es host, enviar estado completo a los clientes
    if (isHost) {
        broadcast({ type: 'full-state', state: serializeFullState() });
    }
}

document.getElementById('restart-button').addEventListener('click', restartGame);

// Sistema de selección con el mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    if (gameStatus !== 'playing') return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Obtener todos los objetos que pueden ser seleccionados
    const selectableObjects = scene.children.filter(child => 
        child.userData.type === 'piece' || child.userData.type === 'highlight'
    );
    
    const intersects = raycaster.intersectObjects(selectableObjects);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        if (clickedObject.userData.type === 'piece') {
            // Obtener el ID de la pieza desde el voxel
            const pieceId = clickedObject.userData.pieceId;
            
            // Encontrar la pieza correspondiente
            const clickedPiece = pieces.find(piece => piece.id === pieceId);
            
            if (clickedPiece && clickedPiece.color === currentTurn) {
                // Seleccionar pieza
                selectedPiece = clickedPiece;
                validMoves = getValidMoves(clickedPiece);
                highlightValidMoves(validMoves);
            } else if (selectedPiece && clickedPiece && clickedPiece.color !== currentTurn) {
                // Intentar capturar pieza
                const targetRow = clickedPiece.row;
                const targetCol = clickedPiece.col;
                
                if (isValidMove(selectedPiece, targetRow, targetCol)) {
                    // Verificar si estamos en modo multijugador
                    const isConnected = Object.values(connections).some(conn => conn.open);
                    
                    if (isConnected && !isHost) {
                        // En modo cliente, enviar solicitud al host
                        requestMoveToHost(selectedPiece, targetRow, targetCol);
                    } else {
                        // En modo local o host, aplicar movimiento directamente
                        const moveData = applyMoveHostInternal(selectedPiece, targetRow, targetCol);
                        
                        // Si es host, difundir el movimiento
                        if (isHost) {
                            broadcast({ 
                                type: 'move', 
                                move: moveData,
                                gameStatus: gameStatus
                            });
                        }
                    }
                    
                    selectedPiece = null;
                    validMoves = [];
                    highlightValidMoves([]);
                }
            }
        } else if (clickedObject.userData.type === 'highlight' && selectedPiece) {
            // Mover pieza a la posición resaltada
            const col = Math.round((clickedObject.position.x + 14) / 4);
            const row = Math.round((clickedObject.position.z + 14) / 4);
            
            // Verificar si estamos en modo multijugador
            const isConnected = Object.values(connections).some(conn => conn.open);
            
            if (isConnected && !isHost) {
                // En modo cliente, enviar solicitud al host
                requestMoveToHost(selectedPiece, row, col);
            } else {
                // En modo local o host, aplicar movimiento directamente
                const moveData = applyMoveHostInternal(selectedPiece, row, col);
                
                // Si es host, difundir el movimiento
                if (isHost) {
                    broadcast({ 
                        type: 'move', 
                        move: moveData,
                        gameStatus: gameStatus
                    });
                }
            }
            
            selectedPiece = null;
            validMoves = [];
            highlightValidMoves([]);
        }
    }
}

window.addEventListener('click', onMouseClick);

// Controles de cámara
const moveSpeed = 0.3;
const lookSpeed = 0.002;
const keys = {};

document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

let mouseX = 0, mouseY = 0;
let isMouseDown = false;

document.addEventListener('mousedown', () => isMouseDown = true);
document.addEventListener('mouseup', () => isMouseDown = false);
document.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }
});

document.addEventListener('wheel', (e) => {
    const zoomSpeed = 0.1;
    if (e.deltaY < 0) {
        camera.position.multiplyScalar(1 - zoomSpeed);
    } else {
        camera.position.multiplyScalar(1 + zoomSpeed);
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Sistema de día/noche
function updateDayNightCycle() {
    dayTime += 0.001; // Velocidad del ciclo
    if (dayTime >= 24) dayTime = 0;
    
    // Calcular posición del sol/luna
    const sunAngle = (dayTime / 24) * Math.PI * 2;
    sunLight.position.x = Math.cos(sunAngle) * 30;
    sunLight.position.y = Math.sin(sunAngle) * 30 + 20;
    
    moonLight.position.x = -Math.cos(sunAngle) * 30;
    moonLight.position.y = -Math.sin(sunAngle) * 30 + 20;
    
    // Cambiar intensidad de la luz según la hora
    let sunIntensity = Math.max(0, Math.sin(sunAngle));
    let moonIntensity = Math.max(0, -Math.sin(sunAngle));
    
    sunLight.intensity = sunIntensity;
    moonLight.intensity = moonIntensity * 0.3;
    
    // Cambiar color del cielo
    let skyColor;
    if (dayTime >= 6 && dayTime < 18) {
        // Día
        skyColor = new THREE.Color(0x87CEEB);
        document.getElementById('dayTime').textContent = 'Día';
    } else if (dayTime >= 18 && dayTime < 20) {
        // Atardecer
        skyColor = new THREE.Color().lerpColors(
            new THREE.Color(0x87CEEB), 
            new THREE.Color(0xFF4500), 
            (dayTime - 18) / 2
        );
        document.getElementById('dayTime').textContent = 'Atardecer';
    } else if (dayTime >= 20 || dayTime < 6) {
        // Noche
        skyColor = new THREE.Color(0x191970);
        document.getElementById('dayTime').textContent = 'Noche';
    } else {
        // Amanecer
        skyColor = new THREE.Color().lerpColors(
            new THREE.Color(0xFF4500), 
            new THREE.Color(0x87CEEB), 
            (dayTime - 4) / 2
        );
        document.getElementById('dayTime').textContent = 'Amanecer';
    }
    
    scene.fog.color = skyColor;
    renderer.setClearColor(skyColor);
    
    // Mostrar/ocultar estrellas
    starsMaterial.opacity = moonIntensity;
    
    // Actualizar reloj
    const hours = Math.floor(dayTime);
    const minutes = Math.floor((dayTime - hours) * 60);
    document.getElementById('timeDisplay').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Contador de FPS
let fps = 0;
let frameCount = 0;
let lastTime = performance.now();

function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        document.getElementById('fps').textContent = fps;
        frameCount = 0;
        lastTime = currentTime;
    }
}

// ============ FUNCIONES MULTIPLAYER ============

// Serializar el estado completo del juego
function serializeFullState() {
    return {
        board: board.map(row => row.map(c => c ? { 
            id: c.id, 
            type: c.type, 
            color: c.color, 
            row: c.row, 
            col: c.col 
        } : null)),
        pieces: pieces.map(p => ({ 
            id: p.id, 
            type: p.type, 
            color: p.color, 
            row: p.row, 
            col: p.col 
        })),
        currentTurn, 
        moveHistory, 
        moveCount, 
        capturedPieces, 
        gameStatus
    };
}

// Aplicar estado completo recibido del host
function applyFullState(state) {
    // Limpiar meshes de piezas actuales
    const pieceMeshes = scene.children.filter(c => c.userData.type === 'piece');
    pieceMeshes.forEach(m => scene.remove(m));
    
    // Reset estructuras
    pieces.length = 0;
    for (let r=0; r<boardSize; r++) { 
        for (let c=0; c<boardSize; c++) { 
            board[r][c] = null; 
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
        pieces.push(p); 
        board[sp.row][sp.col] = p;
        createPieceMeshes(p);
    });
    
    currentTurn = state.currentTurn;
    moveHistory = state.moveHistory || [];
    moveCount = state.moveCount || 0;
    capturedPieces = state.capturedPieces || {white:[], black:[]};
    gameStatus = state.gameStatus || 'playing';
    
    updateTurnIndicator();
    document.getElementById('game-status').textContent = 
        gameStatus === 'playing' ? 'Juego en curso' : gameStatus;
    updateCapturedPieces();
    updateMoveHistory();
}

// CORRECCIÓN: Crear meshes para una pieza - ahora reproduce todas las formas correctamente
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
                        const pawnVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        pawnVoxel.userData.pieceId = piece.id;
                        scene.add(pawnVoxel);
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
                        rookVoxel.userData.pieceId = piece.id;
                        scene.add(rookVoxel);
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
                        almenaVoxel.userData.pieceId = piece.id;
                        scene.add(almenaVoxel);
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
                        const knightVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        knightVoxel.userData.pieceId = piece.id;
                        scene.add(knightVoxel);
                    }
                }
            }
            // Cabeza
            for (let y = 3; y < 5; y++) {
                for (let x = 0; x < 2; x++) {
                    for (let z = 0; z < 1; z++) {
                        const headVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        headVoxel.userData.pieceId = piece.id;
                        scene.add(headVoxel);
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
                        const bishopVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        bishopVoxel.userData.pieceId = piece.id;
                        scene.add(bishopVoxel);
                    }
                }
            }
            // Cuerpo
            for (let y = 2; y < 4; y++) {
                const size = 4 - y;
                for (let x = 0; x < size; x++) {
                    for (let z = 0; z < size; z++) {
                        const bodyVoxel = createVoxel(
                            baseX + x + (2 - size)/2, 
                            y + 1, 
                            baseZ + z + (2 - size)/2, 
                            pieceColor, 
                            'piece'
                        );
                        bodyVoxel.userData.pieceId = piece.id;
                        scene.add(bodyVoxel);
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
                        const queenVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        queenVoxel.userData.pieceId = piece.id;
                        scene.add(queenVoxel);
                    }
                }
            }
            // Cuerpo
            for (let y = 2; y < 5; y++) {
                const size = 6 - y;
                for (let x = 0; x < size; x++) {
                    for (let z = 0; z < size; z++) {
                        const bodyVoxel = createVoxel(
                            baseX + x + (2 - size)/2, 
                            y + 1, 
                            baseZ + z + (2 - size)/2, 
                            pieceColor, 
                            'piece'
                        );
                        bodyVoxel.userData.pieceId = piece.id;
                        scene.add(bodyVoxel);
                    }
                }
            }
            // Corona
            for (let x = -1; x <= 2; x++) {
                for (let z = -1; z <= 2; z++) {
                    if (x === 0 || x === 1 || z === 0 || z === 1) {
                        const crownVoxel = createVoxel(
                            baseX + x, 
                            6, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        crownVoxel.userData.pieceId = piece.id;
                        scene.add(crownVoxel);
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
                        const kingVoxel = createVoxel(
                            baseX + x, 
                            y + 1, 
                            baseZ + z, 
                            pieceColor, 
                            'piece'
                        );
                        kingVoxel.userData.pieceId = piece.id;
                        scene.add(kingVoxel);
                    }
                }
            }
            // Cuerpo
            for (let y = 2; y < 4; y++) {
                const size = 5 - y;
                for (let x = 0; x < size; x++) {
                    for (let z = 0; z < size; z++) {
                        const bodyVoxel = createVoxel(
                            baseX + x + (2 - size)/2, 
                            y + 1, 
                            baseZ + z + (2 - size)/2, 
                            pieceColor, 
                            'piece'
                        );
                        bodyVoxel.userData.pieceId = piece.id;
                        scene.add(bodyVoxel);
                    }
                }
            }
            // Cruz
            for (let y = 5; y < 7; y++) {
                const crossVoxel = createVoxel(
                    baseX + 0.5, 
                    y + 1, 
                    baseZ + 0.5, 
                    pieceColor, 
                    'piece'
                );
                crossVoxel.userData.pieceId = piece.id;
                scene.add(crossVoxel);
            }
            for (let x = 0; x < 2; x++) {
                const crossVoxel = createVoxel(
                    baseX + x, 
                    6, 
                    baseZ + 0.5, 
                    pieceColor, 
                    'piece'
                );
                crossVoxel.userData.pieceId = piece.id;
                scene.add(crossVoxel);
            }
            break;
    }
}

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
            applyMoveFromHost(data.move);
            
            // opcional: aplicar gameStatus enviado por host
            if (data.gameStatus) { 
                gameStatus = data.gameStatus; 
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
    let piece = pieces.find(p => p.id === moveRequest.pieceId);
    if (!piece) piece = board[moveRequest.fromRow][moveRequest.fromCol];
    
    if (!piece) { 
        conn.send({ type: 'move-rejected', reason: 'piece-not-found' }); 
        return; 
    }
    
    // asegurar que es el turno del jugador correcto
    if (piece.color !== currentTurn) { 
        conn.send({ type: 'move-rejected', reason: 'not-your-turn' }); 
        return; 
    }
    
    // validar movimiento usando isValidMove autoritativo
    if (!isValidMove(piece, moveRequest.toRow, moveRequest.toCol)) {
        conn.send({ type: 'move-rejected', reason: 'invalid-move' }); 
        return;
    }
    
    // aplicar movimiento en host
    const originalRow = piece.row, originalCol = piece.col;
    const moveData = applyMoveHostInternal(piece, moveRequest.toRow, moveRequest.toCol);
    
    // difundir movimiento autoritativo a todos (incluyendo el solicitante original)
    broadcast({ 
        type: 'move', 
        move: moveData,
        gameStatus: gameStatus
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
    const pieceMeshes = scene.children.filter(c => c.userData.type === 'piece');
    pieceMeshes.forEach(m => scene.remove(m));
    
    // reiniciar
    initializePiecesDeterministic();
    currentTurn = 'white'; 
    moveHistory = []; 
    moveCount = 0; 
    capturedPieces = {white:[], black:[]}; 
    gameStatus = 'playing';
    
    broadcast({ type: 'full-state', state: serializeFullState() });
}

// Inicializar piezas deterministas
function initializePiecesDeterministic() {
    pieces.length = 0;
    for (let r=0; r<boardSize; r++) {
        for (let c=0; c<boardSize; c++) {
            board[r][c] = null;
        }
    }
    
    // peones
    for (let c=0; c<8; c++) { 
        createPiece('pawn', 'white', 6, c); 
        createPiece('pawn', 'black', 1, c); 
    }
    
    // torres
    createPiece('rook', 'white', 7, 0); 
    createPiece('rook', 'white', 7, 7);
    createPiece('rook', 'black', 0, 0); 
    createPiece('rook', 'black', 0, 7);
    
    // caballos
    createPiece('knight', 'white', 7, 1); 
    createPiece('knight', 'white', 7, 6);
    createPiece('knight', 'black', 0, 1); 
    createPiece('knight', 'black', 0, 6);
    
    // alfiles
    createPiece('bishop', 'white', 7, 2); 
    createPiece('bishop', 'white', 7, 5);
    createPiece('bishop', 'black', 0, 2); 
    createPiece('bishop', 'black', 0, 5);
    
    // reinas
    createPiece('queen', 'white', 7, 3); 
    createPiece('queen', 'black', 0, 3);
    
    // reyes
    createPiece('king', 'white', 7, 4); 
    createPiece('king', 'black', 0, 4);
}

// Eventos de multijugador
document.getElementById('create-room-button').addEventListener('click', async () => {
    try {
        await initializePeer();
        isHost = true;
        roomCode = Math.random().toString(36).substring(2,8).toUpperCase();
        document.getElementById('room-code-display').textContent = roomCode;
        document.getElementById('room-info').style.display = 'block';
        updateConnectionStatus('connecting', 'Esperando jugador...');
        myRoleLocal = 'white';
        updatePlayerRole('white');
        console.log('Sala creada. Peer ID:', localPeerId, 'Room code:', roomCode);
    } catch(err) {
        console.error('Error initializing peer for host', err);
        updateConnectionStatus('error', 'No se pudo inicializar Peer');
    }
});

document.getElementById('join-room-button').addEventListener('click', async () => {
    const hostPeerId = document.getElementById('host-id-input').value.trim();
    const code = document.getElementById('room-code-input').value.trim().toUpperCase();
    
    if (!hostPeerId || !code) { 
        alert('Por favor ingresa ID del host y código de sala'); 
        return; 
    }
    
    try {
        await initializePeer();
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
    } catch(err) {
        console.error('Error initializing peer for joiner', err);
        updateConnectionStatus('error', 'No se pudo inicializar Peer');
    }
});

// Bucle de animación
function animate() {
    requestAnimationFrame(animate);
    
    // Controles de teclado
    const speed = keys['shift'] ? moveSpeed * 2 : moveSpeed;
    
    if (keys['w']) camera.translateZ(-speed);
    if (keys['s']) camera.translateZ(speed);
    if (keys['a']) camera.translateX(-speed);
    if (keys['d']) camera.translateX(speed);
    if (keys['q']) camera.position.y += speed;
    if (keys['e']) camera.position.y -= speed;
    
    if (keys['r']) camera.rotateX(-0.02);
    if (keys['f']) camera.rotateX(0.02);
    
    // Controles de mouse
    if (isMouseDown) {
        camera.rotation.y -= mouseX * lookSpeed;
        camera.rotation.x -= mouseY * lookSpeed;
        camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
    }
    
    // Actualizar sistemas
    updateDayNightCycle();
    updateFPS();
    
    renderer.render(scene, camera);
}

animate();
