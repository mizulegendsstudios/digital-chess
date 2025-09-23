

# ♔ Voxel Chess - Ajedrez Digital 3D (Multijugador)

    "Juego de ajedrez 3D con piezas voxelizadas, sistema de día/noche dinámico y capacidad multijugador en tiempo real. Construido con Three.js y PeerJS para una experiencia inmersiva sin necesidad de servidores dedicados."

![Versión](https://img.shields.io/badge/versión-1.0.0-green)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue)
![Tecnología](https://img.shields.io/badge/tecnología-Three.js_PeerJS-purple)
![Estado](https://img.shields.io/badge/status-beta-orange)

---

## 🌐 Demo en vivo

👉 [Enlace a la demo (pendiente)](https://mizulegendsstudios.github.io/digital-chess/)

---

## 🌟 Visión del Proyecto

Kamisama Chess es una implementación de ajedrez 3D que busca combinar la estética voxel con la jugabilidad clásica del ajedrez, priorizando **inmersión**, **accesibilidad** y **experiencia multijugador fluida** directamente en el navegador.

---

## 🎮 Características Principales

| Característica | Estado | Descripción |
| -------------- | ------ | ----------- |
| 🏁 Ajedrez 3D Voxel | ✅ Completo | Tablero y piezas completamente voxelizadas con iluminación dinámica |
| 🌅 Sistema Día/Noche | ✅ Completo | Ciclo dinámico con cambios de iluminación y estrellas nocturnas |
| 🎮 Controles de Cámara | ✅ Completo | Movimiento fluido con teclado (WASD+QE+RF) y mouse |
| 🌐 Multijugador P2P | ✅ Beta | Conexión directa entre jugadores sin servidor central |
| 📊 Interfaz de Juego | ✅ Completo | Información de partida, movimientos y piezas capturadas |
| 🔄 Animaciones | ✅ Completo | Movimientos suaves de piezas con transiciones |
| 🏆 Sistema de Jaque | ✅ Completo | Detección de jaque, jaque mate y tablas |

---

## 🏗️ Arquitectura Técnica
### Principios Fundamentales

    ✅ Zero Server: Comunicación P2P directa con PeerJS, sin servidores centralizados.
    ✅ Browser-First: Ejecución 100% en navegador usando WebRTC para conexiones.
    ✅ Voxel Aesthetic: Todas las piezas construidas con voxels individuales para un estilo único.
    ✅ Real-time Sync: Sincronización de estado del juego entre jugadores en tiempo real.
    ✅ Licencia permisiva: MIT — libre para usar, modificar y distribuir.

### 📦 Stack Tecnológico
    // Tecnologías principales
    - Three.js (renderizado 3D)
    - PeerJS (conexiones P2P)
    - JavaScript ES6+
    - HTML5 Canvas
    - CSS3

    // Estructura de módulos
    Kamisama Chess → Core Engine → [Game Logic, 3D Rendering, Multiplayer, UI]

---

## 🗂️ Estructura del Proyecto
```text
kamisama-chess/
├─ index.html                     # Entry-point principal
├─ README.md                      # Este archivo
├─ LICENSE                        # Licencia MIT
├─ assets/                        # Recursos (imágenes, sonidos, etc.)
├─ src/                           # Código fuente
│  ├─ js/
│  │   ├── game/                  # Lógica del juego
│  │   │   ├── board.js           # Gestión del tablero
│  │   │   ├── pieces.js          # Lógica de piezas
│  │   │   └── rules.js           # Reglas del ajedrez
│  │   ├── graphics/              # Motor gráfico
│  │   │   ├── renderer.js        # Configuración de Three.js
│  │   │   ├── voxel.js           # Creación de voxels
│  │   │   └── lighting.js        # Sistema de iluminación
│  │   ├── multiplayer/           # Sistema multijugador
│  │   │   ├── peer-manager.js    # Gestión de conexiones PeerJS
│  │   │   ├── room-manager.js    # Gestión de salas
│  │   │   └── sync.js            # Sincronización de estado
│  │   ├── ui/                    # Interfaz de usuario
│  │   │   ├── controls.js        # Controles de cámara
│  │   │   ├── game-info.js       # Información de partida
│  │   │   └── day-night.js       # Sistema día/noche
│  │   └── main.js                # Punto de entrada
│  └─ css/
│      ├── main.css               # Estilos principales
│      ├── ui.css                 # Estilos de interfaz
│      └── multiplayer.css        # Estilos del panel multijugador
└─ docs/                          # Documentación
   ├── architecture.md            # Documentación técnica
   └── api-reference.md           # Referencia de API
```

---

## 🎯 Características técnicas actuales (v1.0.0)
### ✅ Implementado

**GRÁFICOS Y RENDERIZADO**

    - 🎲 Piezas completamente voxelizadas con formas únicas para cada tipo.
    - 🌆 Sistema de iluminación dinámico con sol y luna.
    - ⭐ Efecto de estrellas durante la noche.
    - 🎨 Sombras en tiempo real para todas las piezas.
    - 🌅 Ciclo día/noche con transiciones suaves y cambios de color de cielo.
    - 📹 Cámara libre con controles de teclado y mouse.

**JUEGO**

    - ♟️ Implementación completa de reglas de ajedrez.
    - 🛡️ Detección de jaque, jaque mate y tablas.
    - 📝 Historial de movimientos con notación algebraica.
    - 🔄 Animaciones suaves al mover piezas.
    - 🎯 Resaltado de movimientos válidos al seleccionar una pieza.
    - 👁️ Sistema de selección de piezas con raycasting.

**MULTIJUGADOR**

    - 🌐 Conexiones P2P directas usando PeerJS.
    - 🏠 Sistema de creación y unión a salas con códigos.
    - 🔄 Sincronización completa del estado del juego.
    - 👥 Asignación de roles (blancas/negras/espectador).
    - 📡 Validación de movimientos en el host para prevenir trampas.
    - 🔄 Sistema de reconexión ante caídas de conexión.

**INTERFAZ**

    - 📊 Panel de información del juego con estado actual.
    - ⏰ Reloj que muestra la hora del juego según el ciclo día/noche.
    - 📋 Historial de movimientos con scroll.
    - 🏆 Indicador de piezas capturadas por cada jugador.
    - 🔄 Botón de reinicio de partida.
    - 🌐 Panel multijugador con estado de conexión.

### 🔄 En Desarrollo

    - [ ] Sistema de clasificación y partidas guardadas.
    - [ ] Modo de juego contra IA con diferentes niveles de dificultad.
    - [ ] Personalización de tableros y piezas.
    - [ ] Sistema de chat entre jugadores.
    - [ ] Modo espectador con cámara libre.
    - [ ] Soporte para partidas por tiempo (ajedrez rápido, blitz, etc.).

---

## 📜 Licencia 

Este proyecto está bajo la Licencia MIT — Usa, modifica y redistribuye libremente. Ver [LICENSE](./LICENSE) para detalles completos.

    "Se otorna permiso gratuito, a cualquier persona que obtenga una copia de este software y de los archivos de documentación asociados, para utilizar el software sin restricción alguna."

### Derechos y Obligaciones

    ✅ Puedes: Usar, modificar, distribuir, incluir en software comercial.
    ⚠️ Debes: Incluir la notificación de copyright y permiso en copias sustanciales.
    🔒 No debes: Demandar a los autores por el software.

### 🧭 Filosofía del Proyecto 

    Prioridad #1: Experiencia de usuario inmersiva.
    Regla #1: Mantener la simplicidad técnica sin sacrificar funcionalidad.
    Stack: Three.js + PeerJS para máxima compatibilidad.
    Entorno: 100% en navegador — sin instalaciones, sin plugins.

---

## 👥 Contribución - Instalación para uso o desarrollo local
¡Contribuciones son bienvenidas! Este proyecto sigue el [Código de Conducta](./CODE_OF_CONDUCT.md) y está bajo [MIT](./LICENSE).

### Prerrequisitos
    # Navegadores compatibles
    - Chrome 80+ / Firefox 75+ / Safari 13+ / Edge 80+
    - JavaScript ES6+ habilitado
    - Conexión a internet (para CDN y conexiones P2P)

### Instalación Local

    # Clonar el repositorio
    git clone https://github.com/tu-usuario/kamisama-chess.git
    cd kamisama-chess

    # Servir localmente
    # Con Python
    python -m http.server 8000

    # Con Node.js
    npx serve .

    # Con PHP
    php -S localhost:8000

### Despliegue Producción

    # Plataformas compatibles
    - GitHub Pages
    - Netlify / Vercel / Cloudflare Pages
    - Cualquier hosting estático

### Contribuir

    Fork → rama feature/nombre
    Crea tu módulo en src/js/categoria/
    Branch para feature: git checkout -b feature/amazing-feature
    Commit cambios: git commit -m 'feat: add amazing feature'
    Push al branch: git push origin feature/amazing-feature
    Pull Request con descripción detallada

### Guías de Estilo

    Commits: Conventional commits specification
    Código: ESLint config (próximamente)
    Documentación: Markdown con ejemplos de código
    Testing: Jest unit tests (futuro)

---

## 🌐 Soporte y Comunidad

📋 Reportar Issues: [Github Issues](https://github.com/tu-usuario/kamisama-chess/issues)

📚 Docs: [docs/](./docs/)

📧 Email: contacto@kamisamachess.com

---

Kamisama Chess - Reviviendo el ajedrez clásico con tecnología moderna. 🚀

    © 2025 Kamisama Chess Studios — Construido con pasión por el ajedrez y la tecnología voxel.

¡Dale una ⭐ en GitHub si te gusta esta fusión de ajedrez clásico y estética moderna!
