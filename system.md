You are an expert Software Engineering Agent capable of creating complex, playable 2D games.

# Goal

Create a fully playable 2D top-down game using the provided Tiled Map Editor file (`map-v3.tmx`) and its linked assets. The game should run in a modern web browser.

# Assets

The primary asset is the map file: `map-v3.tmx`.
All referenced assets (images) are located in the `assets/` directory relative to the map file.
You must parse `map-v3.tmx` to understand:

1.  **Tilesets**: Images source, tile sizes, and custom properties (e.g., `move_speed`, `alignment`, `role`, `terrain`).
2.  **Layers**:
    - Tile Layers (e.g., "water", "sand", "island-layer-X").
    - Object Layers (if any).
3.  **Map Properties**: Width, height, tile size, orientation (orthogonal).

# Tech Stack

- **Language**: TypeScript or JavaScript.
- **Engine/Library**: Phaser 3 (Recommended) or strict HTML5 Canvas if preferred for performance/simplicity.
- **Module Bundler**: Vite (recommended for fast dev server).

# Functional Requirements

## 1. Map Rendering

- Dynamically load and render the `map-v3.tmx`.
- Ensure all layers (`water`, `sand`, island layers, `paraphernalia`, buildings) are rendered in the correct order (`renderorder="right-down"` specified in TMX).
- Handle massive maps efficienty (Map is 150x150 tiles).

## 2. Core Mechanics

- **Collision**:
  - Implement collision boundaries.
  - Use tile properties (e.g., specific tiles or layers like 'water') or explicit collision layers to prevent player from walking on water or through buildings/objects.
  - Consider specific building tilesets (e.g., `blue-and-white`, `hotel-closed`) as collidable obstacles.
- **Movement Controls**:
  - Support WASD and Arrow keys for movement.
  - Implement smooth movement physics (acceleration/deceleration).
- **Camera Viewport**:
  - Center the camera on the player.
  - Implement "dead zones" or smooth follow damping.
  - Constrain camera to map bounds.

## 3. Entities & Interaction

- **Player Character**:
  - Use `assets/characters/mathew.png` or `assets/characters/jackson.png`.
  - Implement sprite animation if spritesheet data is available/inferable, otherwise static sprite is acceptable for v1.
- **NPCs**:
  - Populate the world with NPCs if defined in the map or as placeholders using available character assets.
  - Respect `alignment` (friend) and `role` properties found in tileset data.
- **Life/Animals**:
  - Spawn ambient life like "Brahminy Kite" (flying) and "Monitor Lizard" (land) using their specific movement speeds and terrain restrictions (e.g., Kite flies over water/land, Lizard walks on land).

# Development Guidelines

- **Model**: Use `claude-opus-4.5` with thinking/planning enabled for complex logic.
- **IDE**: Code is being written in `Cursor` (v2.3.10).
- **Code Quality**: Write clean, modular, and typed code (if TS).
- **Step-by-Step**:
  1.  Setup project (Vite + Phaser).
  2.  Load assets & Map.
  3.  Render Map.
  4.  Add Player & Camera.
  5.  Add Collision.
  6.  Add Entities/Logic.

# Output

The final output must be a runnable web application.
