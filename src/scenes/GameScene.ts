import Phaser from 'phaser';
import { MapData, getTilesetForGid } from '../utils/TMXParser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { BrahminyKite, MonitorLizard } from '../entities/Wildlife';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private mapData!: MapData;
  private mapWidth!: number;
  private mapHeight!: number;
  private collisionLayer: Set<string> = new Set();
  private npcs: NPC[] = [];
  private kites: BrahminyKite[] = [];
  private lizards: MonitorLizard[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.mapData = this.registry.get('mapData');
    
    if (!this.mapData) {
      console.error('No map data found!');
      return;
    }
    
    // Calculate map dimensions in pixels
    this.mapWidth = this.mapData.width * this.mapData.tileWidth;
    this.mapHeight = this.mapData.height * this.mapData.tileHeight;
    
    console.log(`Map size: ${this.mapWidth}x${this.mapHeight} pixels`);
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // Render map layers
    this.renderMapLayers();
    
    // Find a good spawn point (center of map, on land)
    const spawnX = this.mapWidth / 2;
    const spawnY = this.mapHeight / 2;
    
    // Create player
    this.player = new Player(this, spawnX, spawnY);
    
    // Set up camera
    this.setupCamera();
    
    // Add NPCs
    this.spawnNPCs();
    
    // Add wildlife
    this.spawnWildlife();
    
    // Add collision detection
    this.setupCollisions();
    
    // Add UI overlay
    this.createUI();
  }

  private getTextureKey(tilesetName: string): string {
    // Handle naming differences between tileset names and texture keys
    if (tilesetName === 'island-0') return 'island-layer-0';
    if (tilesetName === 'island-1') return 'island-layer-1';
    if (tilesetName === 'island-2') return 'island-layer-2';
    if (tilesetName === 'island-4') return 'island-layer-4';
    if (tilesetName === 'island-5') return 'island-layer-5';
    return tilesetName;
  }

  private renderMapLayers(): void {
    // Layer rendering order (from bottom to top)
    const layerOrder = [
      'water',
      'sand',
      'pavement',
      'decorations',
      'vehicles',
      'buildings-base',
      'buildings-top',
      'sky'
    ];
    
    // Render each layer
    layerOrder.forEach((layerName, layerIndex) => {
      const layer = this.mapData.layers.find(l => l.name === layerName);
      if (!layer) {
        console.warn(`Layer ${layerName} not found`);
        return;
      }
      
      console.log(`Rendering layer: ${layerName} with ${layer.data.length} tiles`);
      
      // Create a render texture for this layer
      const renderTexture = this.add.renderTexture(0, 0, this.mapWidth, this.mapHeight);
      renderTexture.setOrigin(0, 0);
      renderTexture.setDepth(layerIndex);
      
      // Create a temporary sprite for drawing tiles
      const tempSprite = this.add.sprite(0, 0, '__DEFAULT');
      tempSprite.setOrigin(0, 0);
      tempSprite.setVisible(false);
      
      // Draw tiles to render texture
      for (let y = 0; y < layer.height; y++) {
        for (let x = 0; x < layer.width; x++) {
          const index = y * layer.width + x;
          const gid = layer.data[index];
          
          if (gid === 0) continue; // Empty tile
          
          // Find the tileset for this gid
          const tileset = getTilesetForGid(this.mapData.tilesets, gid);
          if (!tileset) continue;
          
          const textureKey = this.getTextureKey(tileset.name);
          if (!this.textures.exists(textureKey)) continue;
          
          // Calculate local tile ID and frame name
          const localId = gid - tileset.firstgid;
          const frameName = `${tileset.name}_${localId}`;
          
          // Check if frame exists
          const texture = this.textures.get(textureKey);
          if (!texture.has(frameName)) continue;
          
          // Set up temp sprite and draw to render texture
          const worldX = x * this.mapData.tileWidth;
          const worldY = y * this.mapData.tileHeight;
          
          tempSprite.setTexture(textureKey, frameName);
          tempSprite.setPosition(worldX, worldY);
          renderTexture.draw(tempSprite);
          
          // Track collision tiles (water layer = collision)
          if (layerName === 'water') {
            this.collisionLayer.add(`${x},${y}`);
          }
        }
      }
      
      // Clean up temp sprite
      tempSprite.destroy();
    });
    
    // Build collision map from non-water ground tiles
    this.buildCollisionMap();
  }

  private buildCollisionMap(): void {
    // Get the sand layer to determine walkable areas
    const sandLayer = this.mapData.layers.find(l => l.name === 'sand');
    const pavementLayer = this.mapData.layers.find(l => l.name === 'pavement');
    
    // Clear water collision for tiles that have sand or pavement
    if (sandLayer) {
      for (let y = 0; y < sandLayer.height; y++) {
        for (let x = 0; x < sandLayer.width; x++) {
          const index = y * sandLayer.width + x;
          const gid = sandLayer.data[index];
          if (gid !== 0) {
            this.collisionLayer.delete(`${x},${y}`);
          }
        }
      }
    }
    
    if (pavementLayer) {
      for (let y = 0; y < pavementLayer.height; y++) {
        for (let x = 0; x < pavementLayer.width; x++) {
          const index = y * pavementLayer.width + x;
          const gid = pavementLayer.data[index];
          if (gid !== 0) {
            this.collisionLayer.delete(`${x},${y}`);
          }
        }
      }
    }
    
    // Add building collision from buildings-base layer
    const buildingsLayer = this.mapData.layers.find(l => l.name === 'buildings-base');
    if (buildingsLayer) {
      for (let y = 0; y < buildingsLayer.height; y++) {
        for (let x = 0; x < buildingsLayer.width; x++) {
          const index = y * buildingsLayer.width + x;
          const gid = buildingsLayer.data[index];
          if (gid !== 0) {
            // Check if this gid is from a building tileset
            const tileset = getTilesetForGid(this.mapData.tilesets, gid);
            if (tileset && ['blue-and-white', 'co-working-closed', 'hotel-closed', 'gym', 'kk-mart-closed', 'lab'].includes(tileset.name)) {
              this.collisionLayer.add(`${x},${y}`);
            }
          }
        }
      }
    }
    
    console.log(`Collision tiles: ${this.collisionLayer.size}`);
  }

  private setupCamera(): void {
    const camera = this.cameras.main;
    
    // Set camera bounds to map size
    camera.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // Follow player with smooth damping
    camera.startFollow(this.player, true, 0.08, 0.08);
    
    // Set dead zone (area where player can move without camera moving)
    camera.setDeadzone(100, 100);
    
    // Zoom to show more of the map
    camera.setZoom(2);
  }

  private spawnNPCs(): void {
    // Spawn a few NPCs at various locations on the island
    const npcLocations = [
      { x: this.mapWidth / 2 + 100, y: this.mapHeight / 2 + 50 },
      { x: this.mapWidth / 2 - 150, y: this.mapHeight / 2 - 100 },
      { x: this.mapWidth / 2 + 200, y: this.mapHeight / 2 - 150 },
    ];
    
    npcLocations.forEach(loc => {
      const npc = new NPC(this, loc.x, loc.y, 'jackson', 30);
      this.npcs.push(npc);
    });
  }

  private spawnWildlife(): void {
    // Spawn brahminy kites (flying birds)
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(200, this.mapWidth - 200);
      const y = Phaser.Math.Between(200, this.mapHeight - 200);
      const kite = new BrahminyKite(this, x, y, this.mapWidth, this.mapHeight);
      this.kites.push(kite);
    }
    
    // Spawn monitor lizards on land
    const lizardLocations = [
      { x: this.mapWidth / 2 + 300, y: this.mapHeight / 2 },
      { x: this.mapWidth / 2 - 200, y: this.mapHeight / 2 + 200 },
    ];
    
    lizardLocations.forEach(loc => {
      const lizard = new MonitorLizard(this, loc.x, loc.y);
      this.lizards.push(lizard);
    });
  }

  private setupCollisions(): void {
    // We use tile-based collision checking instead of individual bodies for performance
    // This is handled in the update loop via checkTileCollision()
  }

  private checkTileCollision(x: number, y: number, width: number, height: number): boolean {
    // Convert world position to tile position
    const tileX1 = Math.floor(x / this.mapData.tileWidth);
    const tileY1 = Math.floor(y / this.mapData.tileHeight);
    const tileX2 = Math.floor((x + width) / this.mapData.tileWidth);
    const tileY2 = Math.floor((y + height) / this.mapData.tileHeight);
    
    for (let ty = tileY1; ty <= tileY2; ty++) {
      for (let tx = tileX1; tx <= tileX2; tx++) {
        if (this.collisionLayer.has(`${tx},${ty}`)) {
          return true;
        }
      }
    }
    return false;
  }

  private createUI(): void {
    // Create a simple UI overlay
    const uiContainer = this.add.container(0, 0);
    uiContainer.setScrollFactor(0);
    uiContainer.setDepth(1000);
    
    // Add instructions text
    const instructionsText = this.add.text(10, 10, 'WASD / Arrow Keys to move', {
      font: '14px monospace',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 },
    });
    
    uiContainer.add(instructionsText);
    
    // Add location indicator
    const locationText = this.add.text(10, 40, '', {
      font: '12px monospace',
      color: '#88ff88',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 },
    });
    uiContainer.add(locationText);
    
    // Update location text periodically
    this.time.addEvent({
      delay: 200,
      callback: () => {
        const tileX = Math.floor(this.player.x / this.mapData.tileWidth);
        const tileY = Math.floor(this.player.y / this.mapData.tileHeight);
        locationText.setText(`Position: ${tileX}, ${tileY}`);
      },
      loop: true,
    });
  }

  update(time: number, delta: number): void {
    // Update player
    if (this.player) {
      // Store previous position for collision resolution
      const prevX = this.player.x;
      const prevY = this.player.y;
      
      this.player.update();
      
      // Check collision and revert if needed
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      const halfW = body.width / 2;
      const halfH = body.height / 2;
      
      if (this.checkTileCollision(
        this.player.x - halfW,
        this.player.y - halfH,
        body.width,
        body.height
      )) {
        // Try to slide along walls
        // First try horizontal only
        if (!this.checkTileCollision(this.player.x - halfW, prevY - halfH, body.width, body.height)) {
          this.player.y = prevY;
        }
        // Then try vertical only
        else if (!this.checkTileCollision(prevX - halfW, this.player.y - halfH, body.width, body.height)) {
          this.player.x = prevX;
        }
        // If both fail, revert both
        else {
          this.player.x = prevX;
          this.player.y = prevY;
        }
      }
    }
    
    // Update NPCs
    this.npcs.forEach(npc => {
      const prevX = npc.x;
      const prevY = npc.y;
      
      npc.update();
      
      const body = npc.body as Phaser.Physics.Arcade.Body;
      const halfW = body.width / 2;
      const halfH = body.height / 2;
      
      if (this.checkTileCollision(npc.x - halfW, npc.y - halfH, body.width, body.height)) {
        npc.x = prevX;
        npc.y = prevY;
      }
    });
    
    // Update wildlife
    this.kites.forEach(kite => kite.update(time, delta));
    
    this.lizards.forEach(lizard => {
      const prevX = lizard.x;
      const prevY = lizard.y;
      
      lizard.update();
      
      const body = lizard.body as Phaser.Physics.Arcade.Body;
      const halfW = body.width / 2;
      const halfH = body.height / 2;
      
      if (this.checkTileCollision(lizard.x - halfW, lizard.y - halfH, body.width, body.height)) {
        lizard.x = prevX;
        lizard.y = prevY;
      }
    });
  }
}
