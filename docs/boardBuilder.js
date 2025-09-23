// Crear un voxel
function createVoxel(x, y, z, color, type = 'normal') {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
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
function createBoard() {
    // Inicializar matriz del tablero
    for (let row = 0; row < window.CONFIG.BOARD_SIZE; row++) {
        window.board[row] = [];
        for (let col = 0; col < window.CONFIG.BOARD_SIZE; col++) {
            window.board[row][col] = null;
            
            // Crear casilla
            const isWhite = (row + col) % 2 === 0;
            const color = isWhite ? 0xF5DEB3 : 0x8B4513;
            
            // Crear voxels para la casilla
            for (let x = 0; x < 4; x++) {
                for (let z = 0; z < 4; z++) {
                    const tileVoxel = createVoxel(
                        col * 4 + x - 14, 
                        0, 
                        row * 4 + z - 14, 
                        color, 
                        'tile'
                    );
                    window.scene.add(tileVoxel);
                    window.voxelCount++;
                }
            }
            
            // Crear borde del tablero si es necesario
            if (row === 0 || row === window.CONFIG.BOARD_SIZE - 1 || col === 0 || col === window.CONFIG.BOARD_SIZE - 1) {
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
                            window.scene.add(borderVoxel);
                            window.voxelCount++;
                        }
                    }
                }
            }
        }
    }
    
    // Actualizar contador de voxels
    document.getElementById('voxelCount').textContent = window.voxelCount;
}

// Exponer funciones globalmente
window.createBoard = createBoard;
