# Network School Island Game

A 2D top-down exploration game built with Phaser 3 and TypeScript. Explore a beautifully crafted island with buildings, NPCs, and wildlife.

## Features

- **Dynamic Map Rendering**: Loads and renders a Tiled Map Editor (.tmx) file with multiple layers
- **Smooth Player Controls**: WASD and Arrow keys for movement with smooth physics
- **Collision Detection**: Prevents walking on water and through buildings
- **Camera System**: Smooth follow camera with dead zones and map bounds
- **NPCs**: Friendly characters that wander around the island
- **Wildlife**: Flying brahminy kites and wandering monitor lizards

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### Production Build

Build the project for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move Up |
| A / ← | Move Left |
| S / ↓ | Move Down |
| D / → | Move Right |

## Project Structure

```
├── assets/               # Game assets (images, spritesheets)
│   ├── buildings/       # Building tilesets
│   ├── characters/      # Player and NPC spritesheets
│   ├── layers/          # Island layer tilesets
│   ├── life/            # Wildlife spritesheets
│   └── props/           # Decoration tilesets
├── src/                  # TypeScript source code
│   ├── entities/        # Game entities (Player, NPC, Wildlife)
│   ├── scenes/          # Phaser scenes (Boot, Game)
│   ├── utils/           # Utility functions (TMX parser)
│   └── main.ts          # Entry point
├── map-v3.tmx           # Tiled Map Editor map file
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Technical Details

- **Engine**: Phaser 3.86
- **Build Tool**: Vite 6
- **Language**: TypeScript 5.7
- **Map Format**: Tiled Map Editor TMX (CSV encoding)
- **Map Size**: 150x150 tiles (2400x2400 pixels)

## Credits

Built with [Phaser 3](https://phaser.io/) game framework.
