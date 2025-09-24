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
        
        // Variables para controles táctiles
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.lastTouchDistance = 0;
        this.isTouching = false;
        this.selectedPiece = null;
        
        // Variables para controles de TV/gamepad
        this.gamepad = null;
        this.gamepadIndex = null;
        this.gamepadButtons = {};
        this.gamepadAxes = [];
        this.selectedSquare = { row: 4, col: 4 }; // Posición inicial del cursor
        
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
        
        // Eventos táctiles para dispositivos móviles
        document.addEventListener('touchstart', (e) => this.onTouchStart(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e));
        document.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Eventos de gamepad para TV y consolas
        window.addEventListener('gamepadconnected', (e) => this.onGamepadConnected(e));
        window.addEventListener('gamepaddisconnected', (e) => this.onGamepadDisconnected(e));
        
        // Evento de reinicio - verificar si el elemento existe
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.onRestartGame());
        } else {
            console.warn('Elemento restart-button no encontrado en el DOM');
        }
        
        // Crear cursor visual para TV/gamepad
        this.createTVCursor();
    }
    
    // Métodos para controles de mouse
    onMouseMove(event) {
        if (this.isMouseDown) {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Rotar cámara con el mouse
            this.camera.rotation.y -= this.mouseX * this.lookSpeed;
            this.camera.rotation.x -= this.mouseY * this.lookSpeed;
            this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
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
        event.preventDefault();
        if (event.deltaY < 0) {
            this.camera.position.multiplyScalar(1 - this.zoomSpeed);
        } else {
            this.camera.position.multiplyScalar(1 + this.zoomSpeed);
        }
    }
    
    // Métodos para controles táctiles
    onTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;
            this.isTouching = true;
            
            // Convertir coordenadas táctiles a coordenadas normalizadas
            this.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            
            // Verificar si se tocó una pieza
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const selectableObjects = this.scene.children.filter(child => 
                child.userData.type === 'piece' || child.userData.type === 'highlight'
            );
            const intersects = this.raycaster.intersectObjects(selectableObjects);
            
            if (intersects.length > 0) {
                const touchedObject = intersects[0].object;
                if (touchedObject.userData.type === 'piece') {
                    const pieceId = touchedObject.userData.pieceId;
                    const touchedPiece = this.gameLogic.pieces.find(piece => piece.id === pieceId);
                    
                    if (touchedPiece && touchedPiece.color === this.gameLogic.currentTurn) {
                        this.selectedPiece = touchedPiece;
                        this.gameLogic.selectPiece(touchedPiece);
                        this.highlightValidMoves(this.gameLogic.validMoves);
                    }
                }
            }
        } else if (event.touches.length === 2) {
            // Para zoom con dos dedos
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            this.lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1 && this.isTouching) {
            this.touchEndX = event.touches[0].clientX;
            this.touchEndY = event.touches[0].clientY;
            
            // Calcular el desplazamiento
            const deltaX = this.touchEndX - this.touchStartX;
            const deltaY = this.touchEndY - this.touchStartY;
            
            // Si hay una pieza seleccionada, verificar si se quiere mover
            if (this.selectedPiece) {
                this.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
                
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const highlights = this.scene.children.filter(child => child.userData.type === 'highlight');
                const intersects = this.raycaster.intersectObjects(highlights);
                
                if (intersects.length > 0) {
                    const highlight = intersects[0].object;
                    const col = Math.round((highlight.position.x + 14) / 4);
                    const row = Math.round((highlight.position.z + 14) / 4);
                    
                    // Mover la pieza si es un movimiento válido
                    if (this.gameLogic.isValidMove(this.selectedPiece, row, col)) {
                        this.makeMove(this.selectedPiece, row, col);
                        this.selectedPiece = null;
                    }
                }
            } else {
                // Rotar cámara con un dedo
                this.camera.rotation.y -= deltaX * 0.005;
                this.camera.rotation.x -= deltaY * 0.005;
                this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
                
                // Actualizar posición inicial para el siguiente movimiento
                this.touchStartX = this.touchEndX;
                this.touchStartY = this.touchEndY;
            }
        } else if (event.touches.length === 2) {
            // Zoom con dos dedos
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (this.lastTouchDistance > 0) {
                const deltaDistance = distance - this.lastTouchDistance;
                const scaleFactor = 1 + deltaDistance * 0.01;
                this.camera.position.multiplyScalar(scaleFactor);
            }
            
            this.lastTouchDistance = distance;
        }
    }
    
    onTouchEnd(event) {
        event.preventDefault();
        this.isTouching = false;
        
        // Si no hay una pieza seleccionada, verificar si se tocó una casilla vacía
        if (!this.selectedPiece && event.touches.length === 0) {
            this.mouse.x = (this.touchEndX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(this.touchEndY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const boardObjects = this.scene.children.filter(child => 
                child.userData.type === 'board' || child.userData.type === 'highlight'
            );
            const intersects = this.raycaster.intersectObjects(boardObjects);
            
            if (intersects.length > 0) {
                const boardObject = intersects[0].object;
                const col = Math.round((boardObject.position.x + 14) / 4);
                const row = Math.round((boardObject.position.z + 14) / 4);
                
                // Verificar si hay una pieza en esa posición
                const piece = this.gameLogic.board[row][col];
                if (piece && piece.color === this.gameLogic.currentTurn) {
                    this.selectedPiece = piece;
                    this.gameLogic.selectPiece(piece);
                    this.highlightValidMoves(this.gameLogic.validMoves);
                }
            }
        }
    }
    
    // Métodos para controles de TV/gamepad
    onGamepadConnected(event) {
        console.log('Gamepad conectado:', event.gamepad.id);
        this.gamepad = event.gamepad;
        this.gamepadIndex = event.gamepad.index;
        this.updateTVCursorVisibility(true);
    }
    
    onGamepadDisconnected(event) {
        console.log('Gamepad desconectado:', event.gamepad.id);
        this.gamepad = null;
        this.gamepadIndex = null;
        this.updateTVCursorVisibility(false);
    }
    
    createTVCursor() {
        // Crear un cursor visual para la navegación con gamepad
        const cursorGeometry = new THREE.RingGeometry(1.8, 2.2, 32);
        const cursorMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00, 
            transparent: true, 
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        this.tvCursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
        this.tvCursor.rotation.x = -Math.PI / 2; // Horizontal
        this.tvCursor.position.y = 0.7; // Ligeramente sobre el tablero
        this.tvCursor.visible = false; // Inicialmente oculto
        this.tvCursor.userData.type = 'tvCursor';
        this.scene.add(this.tvCursor);
    }
    
    updateTVCursorVisibility(visible) {
        if (this.tvCursor) {
            this.tvCursor.visible = visible;
        }
    }
    
    updateGamepad() {
        if (this.gamepadIndex !== null) {
            const gamepads = navigator.getGamepads();
            const gamepad = gamepads[this.gamepadIndex];
            
            if (gamepad) {
                // Actualizar estado de botones
                for (let i = 0; i < gamepad.buttons.length; i++) {
                    const button = gamepad.buttons[i];
                    const wasPressed = this.gamepadButtons[i] || false;
                    const isPressed = button.pressed;
                    
                    this.gamepadButtons[i] = isPressed;
                    
                    // Detectar flancos de subida (botón recién presionado)
                    if (isPressed && !wasPressed) {
                        this.handleGamepadButtonPress(i);
                    }
                }
                
                // Actualizar estado de ejes
                this.gamepadAxes = gamepad.axes;
                this.handleGamepadAxes();
            }
        }
    }
    
    handleGamepadButtonPress(buttonIndex) {
        switch (buttonIndex) {
            case 0: // Botón A (seleccionar/mover)
            case 1: // Botón B (deseleccionar)
                this.handleTVCursorAction();
                break;
            case 2: // Botón X (reiniciar juego)
                this.onRestartGame();
                break;
            case 3: // Botón Y (ver ayuda)
                this.showHelp();
                break;
            case 9: // Botón Start (pausar)
                this.togglePause();
                break;
        }
    }
    
    handleGamepadAxes() {
        // Ejes 0 y 1: stick izquierdo (movimiento del cursor)
        const deadZone = 0.2;
        const moveSpeed = 0.15;
        
        if (Math.abs(this.gamepadAxes[0]) > deadZone) {
            this.selectedSquare.col += Math.sign(this.gamepadAxes[0]) * moveSpeed;
            this.selectedSquare.col = Math.max(0, Math.min(this.boardSize - 1, this.selectedSquare.col));
        }
        
        if (Math.abs(this.gamepadAxes[1]) > deadZone) {
            this.selectedSquare.row += Math.sign(this.gamepadAxes[1]) * moveSpeed;
            this.selectedSquare.row = Math.max(0, Math.min(this.boardSize - 1, this.selectedSquare.row));
        }
        
        // Ejes 2 y 3: stick derecho (control de cámara)
        if (Math.abs(this.gamepadAxes[2]) > deadZone) {
            this.camera.rotation.y -= this.gamepadAxes[2] * 0.03;
        }
        
        if (Math.abs(this.gamepadAxes[3]) > deadZone) {
            this.camera.rotation.x -= this.gamepadAxes[3] * 0.03;
            this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
        }
        
        // Actualizar posición del cursor visual
        if (this.tvCursor) {
            const x = this.selectedSquare.col * 4 + 1 - 14;
            const z = this.selectedSquare.row * 4 + 1 - 14;
            this.tvCursor.position.set(x, this.tvCursor.position.y, z);
        }
    }
    
    handleTVCursorAction() {
        // Obtener la pieza en la posición del cursor
        const piece = this.gameLogic.board[Math.round(this.selectedSquare.row)][Math.round(this.selectedSquare.col)];
        
        if (this.gameLogic.selectedPiece) {
            // Si hay una pieza seleccionada, intentar moverla a la posición del cursor
            const targetRow = Math.round(this.selectedSquare.row);
            const targetCol = Math.round(this.selectedSquare.col);
            
            if (this.gameLogic.isValidMove(this.gameLogic.selectedPiece, targetRow, targetCol)) {
                this.makeMove(this.gameLogic.selectedPiece, targetRow, targetCol);
            } else {
                // Si el movimiento no es válido, deseleccionar
                this.gameLogic.deselectPiece();
                this.highlightValidMoves([]);
            }
        } else if (piece && piece.color === this.gameLogic.currentTurn) {
            // Si no hay pieza seleccionada y hay una pieza del turno actual, seleccionarla
            this.gameLogic.selectPiece(piece);
            this.highlightValidMoves(this.gameLogic.validMoves);
        }
    }
    
    showHelp() {
        // Mostrar un diálogo de ayuda
        const helpDialog = document.getElementById('help-dialog');
        if (helpDialog) {
            helpDialog.style.display = 'block';
            
            // Cerrar después de unos segundos o con un botón
            setTimeout(() => {
                helpDialog.style.display = 'none';
            }, 5000);
        }
    }
    
    togglePause() {
        // Implementar lógica de pausa
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            const isVisible = pauseOverlay.style.display === 'block';
            pauseOverlay.style.display = isVisible ? 'none' : 'block';
            this.gameLogic.isPaused = !isVisible;
        }
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
    
    // Método para actualizar todos los controles en cada frame
    update() {
        this.updateCamera();
        this.updateGamepad();
        this.updateFPS();
    }
}
