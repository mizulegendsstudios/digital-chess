// js/inputHandler.js
class InputHandler {
    constructor(sceneManager, gameLogic, pieceFactory) {
        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.camera = sceneManager.camera;
        this.gameLogic = gameLogic;
        this.pieceFactory = pieceFactory;
        this.boardSize = Config.BOARD_SIZE;
        
        // Variables para controles de cámara
        this.moveSpeed = Config.MOVE_SPEED;
        this.lookSpeed = Config.LOOK_SPEED;
        this.zoomSpeed = Config.ZOOM_SPEED;
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        
        // Sistema de selección con el mouse
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Referencia al módulo multijugador (se establecerá después)
        this.multiplayer = null;
        
        this.init();
    }
    
    setMultiplayer(multiplayer) {
        this.multiplayer = multiplayer;
    }
    
    init() {
        // Eventos de teclado
        document.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
        
        // Eventos de mouse
        document.addEventListener('mousedown', () => this.isMouseDown = true);
        document.addEventListener('mouseup', () => this.isMouseDown = false);
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('click', (e) => this.onMouseClick(e));
        document.addEventListener('wheel', (e) => this.onMouseWheel(e));
        
        // Evento de reinicio - verificar si el elemento existe
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.onRestartGame());
        } else {
            console.warn('Elemento restart-button no encontrado en el DOM');
        }
    }
    
    onMouseMove(event) {
        if (this.isMouseDown) {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    }
    
    onMouseClick(event) {
        if (this.gameLogic.gameStatus !== 'playing') return;
        
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Obtener todos los objetos que pueden ser seleccionados
        const selectableObjects = this.scene.children.filter(child => 
            child.userData.type === 'piece' || child.userData.type === 'highlight'
        );
        
        const intersects = this.raycaster.intersectObjects(selectableObjects);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            
            if (clickedObject.userData.type === 'piece') {
                // Obtener el ID de la pieza desde el voxel
                const pieceId = clickedObject.userData.pieceId;
                
                // Encontrar la pieza correspondiente
                const clickedPiece = this.gameLogic.pieces.find(piece => piece.id === pieceId);
                
                if (clickedPiece && clickedPiece.color === this.gameLogic.currentTurn) {
                    // Seleccionar pieza
                    this.gameLogic.selectPiece(clickedPiece);
                    this.highlightValidMoves(this.gameLogic.validMoves);
                } else if (this.gameLogic.selectedPiece && clickedPiece && clickedPiece.color !== this.gameLogic.currentTurn) {
                    // Intentar capturar pieza
                    const targetRow = clickedPiece.row;
                    const targetCol = clickedPiece.col;
                    
                    if (this.gameLogic.isValidMove(this.gameLogic.selectedPiece, targetRow, targetCol)) {
                        this.makeMove(this.gameLogic.selectedPiece, targetRow, targetCol);
                    }
                }
            } else if (clickedObject.userData.type === 'highlight' && this.gameLogic.selectedPiece) {
                // Mover pieza a la posición resaltada
                const col = Math.round((clickedObject.position.x + 14) / 4);
                const row = Math.round((clickedObject.position.z + 14) / 4);
                
                this.makeMove(this.gameLogic.selectedPiece, row, col);
            }
        }
    }
    
    onMouseWheel(event) {
        if (event.deltaY < 0) {
            this.camera.position.multiplyScalar(1 - this.zoomSpeed);
        } else {
            this.camera.position.multiplyScalar(1 + this.zoomSpeed);
        }
    }
    
    onRestartGame() {
        // Verificar si estamos en modo multijugador
        if (this.multiplayer && Object.keys(this.multiplayer.connections).length > 0) {
            // En modo multijugador, el host reinicia y difunde el estado
            if (this.multiplayer.isHost) {
                this.multiplayer.restartGameHost();
            } else {
                // Los clientes envían solicitud de reinicio al host
                const hostConn = Object.values(this.multiplayer.connections)[0];
                if (hostConn && hostConn.open) {
                    hostConn.send({ type: 'restart' });
                }
            }
        } else {
            // En modo local, reiniciar normalmente
            this.gameLogic.restartGame();
            
            // Eliminar todas las piezas del tablero y de la escena
            this.gameLogic.pieces.length = 0;
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    this.gameLogic.board[row][col] = null;
                }
            }
            
            // Eliminar todos los voxels de tipo 'piece' de la escena
            const pieceMeshes = this.scene.children.filter(child => child.userData.type === 'piece');
            pieceMeshes.forEach(mesh => this.scene.remove(mesh));
            
            // Volver a crear las piezas
            this.pieceFactory.initializePieces();
            
            // Actualizar UI
            this.updateTurnIndicator();
            this.updateCapturedPieces();
            this.updateMoveHistory();
            
            const gameStatusEl = document.getElementById('game-status');
            if (gameStatusEl) {
                gameStatusEl.textContent = 'Juego en curso';
            }
        }
    }
    
    makeMove(piece, toRow, toCol) {
        // Verificar si estamos en modo multijugador
        if (this.multiplayer && Object.keys(this.multiplayer.connections).length > 0 && !this.multiplayer.isHost) {
            // En modo cliente, enviar solicitud al host
            this.multiplayer.requestMoveToHost(piece, toRow, toCol);
            
            // No ejecutar el movimiento localmente, esperar confirmación del host
            this.gameLogic.deselectPiece();
            this.highlightValidMoves([]);
            return null;
        }
        
        // En modo local o host, aplicar movimiento directamente
        const moveData = this.gameLogic.makeMove(piece, toRow, toCol);
        
        if (moveData) {
            // Animar el movimiento
            this.animatePieceMove(piece, toRow, toCol, () => {
                // Actualizar posición de la pieza después de la animación
                piece.row = toRow;
                piece.col = toCol;
                
                // Actualizar UI
                this.updateTurnIndicator();
                this.updateCapturedPieces();
                this.updateMoveHistory();
                this.updateGameStatus();
                
                // Deseleccionar pieza
                this.gameLogic.deselectPiece();
                this.highlightValidMoves([]);
                
                // Si es host, difundir el movimiento a los clientes
                if (this.multiplayer && this.multiplayer.isHost) {
                    this.multiplayer.broadcast({ 
                        type: 'move', 
                        move: moveData,
                        gameStatus: this.gameLogic.gameStatus
                    });
                }
            });
            
            return moveData;
        }
        
        return null;
    }
    
    animatePieceMove(piece, toRow, toCol, callback) {
        const pieceMeshes = this.scene.children.filter(child => 
            child.userData.type === 'piece' && child.userData.pieceId === piece.id
        );
        
        const newX = toCol * 4 + 1 - 14;
        const newZ = toRow * 4 + 1 - 14;
        const oldX = piece.col * 4 + 1 - 14;
        const oldZ = piece.row * 4 + 1 - 14;
        
        const deltaX = newX - oldX;
        const deltaZ = newZ - oldZ;
        
        const duration = Config.MOVE_ANIMATION_DURATION;
        const startTime = performance.now();
        
        const animate = () => {
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
        };
        
        animate();
    }
    
    highlightValidMoves(moves) {
        // Eliminar resaltados anteriores
        const oldHighlights = this.scene.children.filter(child => child.userData.type === 'highlight');
        oldHighlights.forEach(highlight => this.scene.remove(highlight));
        
        // Resaltar movimientos válidos
        moves.forEach(move => {
            const highlightGeometry = new THREE.BoxGeometry(3.8, 0.2, 3.8);
            const highlightMaterial = new THREE.MeshBasicMaterial({ 
                color: Config.COLORS.HIGHLIGHT, 
                transparent: true, 
                opacity: 0.5 
            });
            const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
            highlight.position.set(move.col * 4 + 1 - 14, 0.6, move.row * 4 + 1 - 14);
            highlight.userData.type = 'highlight';
            this.scene.add(highlight);
        });
    }
    
    updateCamera() {
        // Controles de teclado
        const speed = this.keys['shift'] ? this.moveSpeed * 2 : this.moveSpeed;
        
        if (this.keys['w']) this.camera.translateZ(-speed);
        if (this.keys['s']) this.camera.translateZ(speed);
        if (this.keys['a']) this.camera.translateX(-speed);
        if (this.keys['d']) this.camera.translateX(speed);
        if (this.keys['q']) this.camera.position.y += speed;
        if (this.keys['e']) this.camera.position.y -= speed;
        
        if (this.keys['r']) this.camera.rotateX(-0.02);
        if (this.keys['f']) this.camera.rotateX(0.02);
        
        // Controles de mouse
        if (this.isMouseDown) {
            this.camera.rotation.y -= this.mouseX * this.lookSpeed;
            this.camera.rotation.x -= this.mouseY * this.lookSpeed;
            this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
        }
    }
    
    updateTurnIndicator() {
        const turnElement = document.getElementById('current-turn');
        if (turnElement) {
            if (this.gameLogic.currentTurn === 'white') {
                turnElement.textContent = 'Blancas';
                turnElement.className = 'turn-indicator-white';
            } else {
                turnElement.textContent = 'Negras';
                turnElement.className = 'turn-indicator-black';
            }
        }
    }
    
    updateCapturedPieces() {
        const whiteCapturedEl = document.getElementById('captured-white');
        const blackCapturedEl = document.getElementById('captured-black');
        
        if (whiteCapturedEl && blackCapturedEl) {
            const whiteCaptured = this.gameLogic.capturedPieces.white.length > 0 ? 
                this.gameLogic.capturedPieces.white.join(', ') : 'Ninguna';
            const blackCaptured = this.gameLogic.capturedPieces.black.length > 0 ? 
                this.gameLogic.capturedPieces.black.join(', ') : 'Ninguna';
            
            whiteCapturedEl.textContent = whiteCaptured;
            blackCapturedEl.textContent = blackCaptured;
        }
    }
    
    updateMoveHistory() {
        const movesList = document.getElementById('moves-list');
        if (movesList) {
            movesList.innerHTML = '';
            
            // Mostrar últimos 10 movimientos
            const recentMoves = this.gameLogic.moveHistory.slice(-10);
            recentMoves.forEach(move => {
                const moveEntry = document.createElement('div');
                moveEntry.className = 'move-entry';
                moveEntry.textContent = move;
                movesList.appendChild(moveEntry);
            });
            
            // Scroll al final
            movesList.scrollTop = movesList.scrollHeight;
        }
    }
    
    updateGameStatus() {
        const gameStatusEl = document.getElementById('game-status');
        if (gameStatusEl) {
            switch(this.gameLogic.gameStatus) {
                case 'playing':
                    gameStatusEl.textContent = 'Juego en curso';
                    break;
                case 'check':
                    gameStatusEl.textContent = '¡Jaque!';
                    break;
                case 'checkmate':
                    gameStatusEl.textContent = 
                        `¡Jaque mate! Ganan las ${this.gameLogic.currentTurn === 'white' ? 'negras' : 'blancas'}`;
                    break;
                case 'stalemate':
                    gameStatusEl.textContent = '¡Tablas por ahogado!';
                    break;
            }
        }
    }
    
    updateFPS() {
        let fps = 0;
        let frameCount = 0;
        let lastTime = performance.now();
        
        frameCount++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
            fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            const fpsElement = document.getElementById('fps');
            if (fpsElement) {
                fpsElement.textContent = fps;
            }
            frameCount = 0;
            lastTime = currentTime;
        }
    }
}
