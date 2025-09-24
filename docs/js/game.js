// js/game.js
class Game {
    constructor() {
        this.sceneManager = null;
        this.boardBuilder = null;
        this.pieceFactory = null;
        this.gameLogic = null;
        this.inputHandler = null;
        this.multiplayer = null;
        
        // Contador de FPS
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        this.init();
    }
    
    init() {
        // Inicializar componentes del juego
        this.sceneManager = new SceneManager();
        this.boardBuilder = new BoardBuilder(this.sceneManager);
        const board = this.boardBuilder.buildBoard();
        
        this.pieceFactory = new PieceFactory(this.sceneManager, board);
        const pieces = this.pieceFactory.initializePieces();
        
        this.gameLogic = new GameLogic(board, pieces);
        this.inputHandler = new InputHandler(this.sceneManager, this.gameLogic, this.pieceFactory);
        this.multiplayer = new Multiplayer(this.gameLogic, this.inputHandler, this.pieceFactory);
        
        // Inicializar UI
        this.inputHandler.updateTurnIndicator();
        this.inputHandler.updateCapturedPieces();
        this.inputHandler.updateMoveHistory();
        
        // Sobreescribir el método makeMove del inputHandler para manejar el modo multijugador
        const originalMakeMove = this.inputHandler.makeMove.bind(this.inputHandler);
        this.inputHandler.makeMove = (piece, toRow, toCol) => {
            // Verificar si estamos en modo multijugador
            const isConnected = Object.values(this.multiplayer.connections).some(conn => conn.open);
            
            if (isConnected && !this.multiplayer.isHost) {
                // En modo cliente, enviar solicitud al host
                this.multiplayer.requestMoveToHost(piece, toRow, toCol);
                return null;
            } else {
                // En modo local o host, aplicar movimiento directamente
                const moveData = originalMakeMove(piece, toRow, toCol);
                
                // Si es host, difundir el movimiento
                if (this.multiplayer.isHost && moveData) {
                    this.multiplayer.broadcast({ 
                        type: 'move', 
                        move: moveData,
                        gameStatus: this.gameLogic.gameStatus
                    });
                }
                
                return moveData;
            }
        };
        
        // Sobreescribir el método onRestartGame del inputHandler para manejar el modo multijugador
        const originalOnRestartGame = this.inputHandler.onRestartGame.bind(this.inputHandler);
        this.inputHandler.onRestartGame = () => {
            // Si es host, enviar estado completo a los clientes
            if (this.multiplayer.isHost) {
                this.multiplayer.restartGameHost();
            } else {
                originalOnRestartGame();
            }
        };
    }
    
    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            document.getElementById('fps').textContent = this.fps;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Actualizar sistemas
        this.sceneManager.updateDayNightCycle();
        this.inputHandler.updateCamera();
        this.updateFPS();
        
        // Renderizar escena
        this.sceneManager.render();
    }
    
    start() {
        this.animate();
    }
}
