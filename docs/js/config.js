// Configuración básica y constantes
const CONFIG = {
    BOARD_SIZE: 8,
    VOXEL_SIZE: 1,
    MOVE_SPEED: 0.3,
    LOOK_SPEED: 0.002
};

// Variables globales compartidas
let scene, camera, renderer;
let sunLight, moonLight, ambientLight, stars;
let dayTime = 12;
let board = [];
let pieces = [];
let selectedPiece = null;
let validMoves = [];
let currentTurn = 'white';
let capturedPieces = { white: [], black: [] };
let gameStatus = 'playing';
let moveHistory = [];
let moveCount = 0;
let voxelCount = 0;

// Variables multijugador
let peer = null;
let isHost = false;
let roomCode = null;
const connections = {};
let localPeerId = null;
let myRoleLocal = 'spectator';

// Exponer variables globalmente
window.CONFIG = CONFIG;
window.scene = scene;
window.camera = camera;
window.renderer = renderer;
// ... y así con todas las variables necesarias
