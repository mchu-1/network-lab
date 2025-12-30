import Phaser from 'phaser';
import { parseTMX, MapData } from '../utils/TMXParser';

export class BootScene extends Phaser.Scene {
  private mapData?: MapData;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px monospace',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);
    
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px monospace',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);
    
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.round(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0x00a8ff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Load all tileset images
    this.load.image('island-layer-0', 'assets/layers/island-layer-0.png');
    this.load.image('island-layer-1', 'assets/layers/island-layer-1.png');
    this.load.image('island-layer-2', 'assets/layers/island-layer-2.png');
    this.load.image('island-layer-3', 'assets/layers/island-layer-3.png');
    this.load.image('island-layer-4', 'assets/layers/island-layer-4.png');
    this.load.image('island-layer-5', 'assets/layers/island-layer-5.png');
    this.load.image('paraphernalia', 'assets/props/paraphernalia.png');
    this.load.image('blue-and-white', 'assets/buildings/blue-and-white.png');
    this.load.image('co-working-closed', 'assets/buildings/co-working-closed.png');
    this.load.image('hotel-closed', 'assets/buildings/hotel-closed.png');
    this.load.image('gym', 'assets/buildings/gym.png');
    this.load.image('kk-mart-closed', 'assets/buildings/kk-mart-closed.png');
    this.load.image('lab', 'assets/buildings/lab.png');
    
    // Load character spritesheets (128x128 per frame, 4 columns, 4 rows)
    this.load.spritesheet('mathew', 'assets/characters/mathew.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet('jackson', 'assets/characters/jackson.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
    
    // Load wildlife spritesheets
    this.load.spritesheet('brahminy-kite', 'assets/life/brahminy-kite.png', {
      frameWidth: 270,
      frameHeight: 294,
    });
    this.load.spritesheet('monitor-lizard', 'assets/life/monitor-lizard.png', {
      frameWidth: 360,
      frameHeight: 294,
    });
  }

  async create(): Promise<void> {
    // Parse the TMX file
    try {
      this.mapData = await parseTMX('map-v3.tmx');
      console.log('Map loaded:', this.mapData);
      
      // Create tile frames for each tileset
      this.createTileFrames();
      
      // Store map data in registry for access by other scenes
      this.registry.set('mapData', this.mapData);
      
      // Start game scene
      this.scene.start('GameScene');
    } catch (error) {
      console.error('Failed to load map:', error);
    }
  }

  private createTileFrames(): void {
    if (!this.mapData) return;
    
    // Create frames for each tileset
    this.mapData.tilesets.forEach(tileset => {
      let textureKey = tileset.name;
      
      // Handle naming differences
      if (tileset.name === 'island-0') textureKey = 'island-layer-0';
      else if (tileset.name === 'island-1') textureKey = 'island-layer-1';
      else if (tileset.name === 'island-2') textureKey = 'island-layer-2';
      else if (tileset.name === 'island-4') textureKey = 'island-layer-4';
      else if (tileset.name === 'island-5') textureKey = 'island-layer-5';
      
      const texture = this.textures.get(textureKey);
      if (!texture || texture.key === '__MISSING') return;
      
      // Add frames for each tile in the tileset
      const rows = Math.ceil(tileset.tileCount / tileset.columns);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < tileset.columns; col++) {
          const tileIndex = row * tileset.columns + col;
          if (tileIndex >= tileset.tileCount) break;
          
          const frameName = `${tileset.name}_${tileIndex}`;
          const x = col * tileset.tileWidth;
          const y = row * tileset.tileHeight;
          
          // Add frame if it doesn't exist
          if (!texture.has(frameName)) {
            texture.add(frameName, 0, x, y, tileset.tileWidth, tileset.tileHeight);
          }
        }
      }
      
      console.log(`Created ${tileset.tileCount} frames for ${tileset.name}`);
    });
  }
}
