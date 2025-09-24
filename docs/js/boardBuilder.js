// js/boardBuilder.js
class BoardBuilder {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.voxels = [];
        this.voxelCount = 0;
        this.board = [];
        this.boardSize = Config.BOARD_SIZE;
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
    
    buildBoard() {
        // Inicializar tablero
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                const isWhite = (row + col) % 2 === 0;
                const color = isWhite ? Config.COLORS.WHITE_SQUARE : Config.COLORS.BLACK_SQUARE;
                
                // Crear casilla
                for (let x = 0; x < 4; x++) {
                    for (let z = 0; z < 4; z++) {
                        const tileVoxel = this.createVoxel(
                            col * 4 + x - 14, 
                            0, 
                            row * 4 + z - 14, 
                            color, 
                            'tile'
                        );
                        this.scene.add(tileVoxel);
                        this.voxels.push(tileVoxel);
                        this.voxelCount++;
                    }
                }
                
                // Crear borde del tablero
                if (row === 0 || row === this.boardSize - 1 || col === 0 || col === this.boardSize - 1) {
                    for (let x = -1; x <= 4; x++) {
                        for (let z = -1; z <= 4; z++) {
                            if (x === -1 || x === 4 || z === -1 || z === 4) {
                                const borderVoxel = this.createVoxel(
                                    col * 4 + x - 14, 
                                    0, 
                                    row * 4 + z - 14, 
                                    Config.COLORS.BORDER, 
                                    'border'
                                );
                                this.scene.add(borderVoxel);
                                this.voxels.push(borderVoxel);
                                this.voxelCount++;
                            }
                        }
                    }
                }
                
                this.board[row][col] = null;
            }
        }
        
        // Actualizar contador de voxels en la UI
        document.getElementById('voxelCount').textContent = this.voxelCount;
        
        return this.board;
    }
    
    getBoard() {
        return this.board;
    }
    
    getVoxelCount() {
        return this.voxelCount;
    }
}
