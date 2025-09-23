// Variables para controles
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let keys = {};
let mouseX = 0, mouseY = 0;
let isMouseDown = false;

// Configurar controles
function setupControls() {
    // Eventos de mouse
    window.addEventListener('click', onMouseClick);
    document.addEventListener('mousedown', () => isMouseDown = true);
    document.addEventListener('mouseup', () => isMouseDown = false);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('wheel', onMouseWheel);
    
    // Eventos de teclado
    document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
    document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
    
    // Evento de ventana
    window.addEventListener('resize', onWindowResize);
}

// Manejar clic del mouse
function onMouseClick(event) {
    if (window.gameStatus !== 'playing') return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, window.camera);
    
    // Obtener todos los objetos que pueden ser seleccionados
    const selectableObjects = window.scene.children.filter(child => 
        child.userData.type === 'piece' || child.userData.type === 'highlight'
    );
    
    const intersects = raycaster.intersectObjects(selectableObjects);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        if (clickedObject.userData.type === 'piece') {
            // Obtener el ID de la pieza desde el voxel
            const pieceId = clickedObject.userData.pieceId;
            
            // Encontrar la pieza correspondiente
            const clickedPiece = window.pieces.find(piece => piece.id === pieceId);
            
            if (clickedPiece && clickedPiece.color === window.currentTurn) {
                // Seleccionar pieza
                window.selectedPiece = clickedPiece;
                window.validMoves = getValidMoves(clickedPiece);
                highlightValidMoves(window.validMoves);
            } else if (window.selectedPiece && clickedPiece && clickedPiece.color !== window.currentTurn) {
                // Intentar capturar pieza
                const targetRow = clickedPiece.row;
                const targetCol = clickedPiece.col;
                
                if (isValidMove(window.selectedPiece, targetRow, targetCol)) {
                    // Verificar si estamos en modo multijugador
                    const isConnected = Object.values(window.connections).some(conn => conn.open);
                    
                    if (isConnected && !window.isHost) {
                        // En modo cliente, enviar solicitud al host
                        requestMoveToHost(window.selectedPiece, targetRow, targetCol);
                    } else {
                        // En modo local o host, aplicar movimiento directamente
                        const moveData = applyMoveHostInternal(window.selectedPiece, targetRow, targetCol);
                        
                        // Si es host, difundir el movimiento
                        if (window.isHost) {
                            broadcast({ 
                                type: 'move', 
                                move: moveData,
                                gameStatus: window.gameStatus
                            });
                        }
                    }
                    
                    window.selectedPiece = null;
                    window.validMoves = [];
                    highlightValidMoves([]);
                }
            }
        } else if (clickedObject.userData.type === 'highlight' && window.selectedPiece) {
            // Mover pieza a la posición resaltada
            const col = Math.round((clickedObject.position.x + 14) / 4);
            const row = Math.round((clickedObject.position.z + 14) / 4);
            
            // Verificar si estamos en modo multijugador
            const isConnected = Object.values(window.connections).some(conn => conn.open);
            
            if (isConnected && !window.isHost) {
                // En modo cliente, enviar solicitud al host
                requestMoveToHost(window.selectedPiece, row, col);
            } else {
                // En modo local o host, aplicar movimiento directamente
                const moveData = applyMoveHostInternal(window.selectedPiece, row, col);
                
                // Si es host, difundir el movimiento
                if (window.isHost) {
                    broadcast({ 
                        type: 'move', 
                        move: moveData,
                        gameStatus: window.gameStatus
                    });
                }
            }
            
            window.selectedPiece = null;
            window.validMoves = [];
            highlightValidMoves([]);
        }
    }
}

// Manejar movimiento del mouse
function onMouseMove(event) {
    if (isMouseDown) {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }
}

// Manejar rueda del mouse
function onMouseWheel(event) {
    const zoomSpeed = 0.1;
    if (event.deltaY < 0) {
        window.camera.position.multiplyScalar(1 - zoomSpeed);
    } else {
        window.camera.position.multiplyScalar(1 + zoomSpeed);
    }
}

// Manejar cambio de tamaño de ventana
function onWindowResize() {
    window.camera.aspect = window.innerWidth / window.innerHeight;
    window.camera.updateProjectionMatrix();
    window.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Actualizar cámara según controles
function updateCameraControls() {
    const speed = keys['shift'] ? window.CONFIG.MOVE_SPEED * 2 : window.CONFIG.MOVE_SPEED;
    
    if (keys['w']) window.camera.translateZ(-speed);
    if (keys['s']) window.camera.translateZ(speed);
    if (keys['a']) window.camera.translateX(-speed);
    if (keys['d']) window.camera.translateX(speed);
    if (keys['q']) window.camera.position.y += speed;
    if (keys['e']) window.camera.position.y -= speed;
    
    if (keys['r']) window.camera.rotateX(-0.02);
    if (keys['f']) window.camera.rotateX(0.02);
    
    // Controles de mouse
    if (isMouseDown) {
        window.camera.rotation.y -= mouseX * window.CONFIG.LOOK_SPEED;
        window.camera.rotation.x -= mouseY * window.CONFIG.LOOK_SPEED;
        window.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, window.camera.rotation.x));
    }
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

// Exponer funciones globalmente
window.setupControls = setupControls;
window.updateCameraControls = updateCameraControls;
window.updateFPS = updateFPS;
