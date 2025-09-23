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

// Variables multijugador (declaradas aquí para evitar redeclaración)
let peer = null;
let isHost = false;
let roomCode = null;
const connections = {};
let localPeerId = null;
let myRoleLocal = 'spectator';

// Exponer variables y configuración globalmente
window.CONFIG = CONFIG;
window.scene = scene;
window.camera = camera;
window.renderer = renderer;
window.sunLight = sunLight;
window.moonLight = moonLight;
window.ambientLight = ambientLight;
window.stars = stars;
window.dayTime = dayTime;
window.board = board;
window.pieces = pieces;
window.selectedPiece = selectedPiece;
window.validMoves = validMoves;
window.currentTurn = currentTurn;
window.capturedPieces = capturedPieces;
window.gameStatus = gameStatus;
window.moveHistory = moveHistory;
window.moveCount = moveCount;
window.voxelCount = voxelCount;

// Exponer variables multijugador
window.peer = peer;
window.isHost = isHost;
window.roomCode = roomCode;
window.connections = connections;
window.localPeerId = localPeerId;
window.myRoleLocal = myRoleLocal;
