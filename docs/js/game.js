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
        
        // Establecer la referencia entre el módulo multijugador y el manejador de entrada
        this.inputHandler.setMultiplayer(this.multiplayer);
        
        // Inicializar UI
        this.inputHandler.updateTurnIndicator();
        this.inputHandler.updateCapturedPieces();
        this.inputHandler.updateMoveHistory();
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
