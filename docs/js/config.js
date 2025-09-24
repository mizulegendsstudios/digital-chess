// js/config.js
const Config = {
    // Configuración del juego-
    GAME_TITLE: "Voxel Chess - Ajedrez Digital 3D (Multijugador) v1.0.2",
    BOARD_SIZE: 8,
    VOXEL_SIZE: 1,
    
    // Configuración de la cámara
    CAMERA_FOV: 75,
    CAMERA_NEAR: 0.1,
    CAMERA_FAR: 1000,
    CAMERA_INITIAL_POSITION: { x: 0, y: 30, z: 30 },
    
    // Configuración de controles
    MOVE_SPEED: 0.3,
    LOOK_SPEED: 0.002,
    ZOOM_SPEED: 0.1,
    
    // Configuración de día/noche
    DAY_CYCLE_SPEED: 0.001,
    STARS_COUNT: 2000,
    
    // Configuración de luces
    SUN_LIGHT_COLOR: 0xffffff,
    MOON_LIGHT_COLOR: 0x6495ED,
    AMBIENT_LIGHT_COLOR: 0x404040,
    AMBIENT_LIGHT_INTENSITY: 0.5,
    
    // Configuración de sombras
    SHADOW_MAP_WIDTH: 2048,
    SHADOW_MAP_HEIGHT: 2048,
    
    // Configuración de animación
    MOVE_ANIMATION_DURATION: 500,
    
    // Configuración multiplayer
    ROOM_CODE_LENGTH: 6,
    
    // Colores
    COLORS: {
        WHITE_SQUARE: 0xF5DEB3,
        BLACK_SQUARE: 0x8B4513,
        BORDER: 0x654321,
        WHITE_PIECE: 0xFFFFFF,
        BLACK_PIECE: 0x333333,
        HIGHLIGHT: 0x00FF00,
        DAY_SKY: 0x87CEEB,
        NIGHT_SKY: 0x191970,
        SUNSET_SKY: 0xFF4500
    }
};
