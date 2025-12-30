import Phaser from 'phaser';

import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { BrahminyKite, MonitorLizard } from '../entities/Wildlife';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private mapWidth!: number;
  private mapHeight!: number;

  private npcs: NPC[] = [];
  private kites: BrahminyKite[] = [];
  private lizards: MonitorLizard[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Create the map
    const map = this.make.tilemap({ key: 'map' });
    
    // Add all tilesets
    const island0 = map.addTilesetImage('island-0', 'island-0');
    const island1 = map.addTilesetImage('island-1', 'island-1');
    const island2 = map.addTilesetImage('island-2', 'island-2');
    const island3 = map.addTilesetImage('island-layer-3', 'island-layer-3');
    const island4 = map.addTilesetImage('island-4', 'island-4');
    const island5 = map.addTilesetImage('island-5', 'island-5');
    const paraphernalia = map.addTilesetImage('paraphernalia', 'paraphernalia');
    const blueAndWhite = map.addTilesetImage('blue-and-white', 'blue-and-white');
    const coWorking = map.addTilesetImage('co-working-closed', 'co-working-closed');
    const hotel = map.addTilesetImage('hotel-closed', 'hotel-closed');
    const gym = map.addTilesetImage('gym', 'gym');
    const kkMart = map.addTilesetImage('kk-mart-closed', 'kk-mart-closed');
    const lab = map.addTilesetImage('lab', 'lab');
    
    if (!island0 || !island1 || !island2 || !island3 || !island4 || !island5 || !paraphernalia || 
        !blueAndWhite || !coWorking || !hotel || !gym || !kkMart || !lab) {
      console.error('Failed to load tilesets');
      return;
    }
    
    const tilesets = [
      island0, island1, island2, island3, island4, island5, 
      paraphernalia, blueAndWhite, coWorking, hotel, gym, kkMart, lab
    ];
    
    // Set map dimensions
    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;
    
    console.log(`Map size: ${this.mapWidth}x${this.mapHeight} pixels`);
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // Create layers (order matters)
    const waterLayer = map.createLayer('water', tilesets, 0, 0);
    const sandLayer = map.createLayer('sand', tilesets, 0, 0);
    const pavementLayer = map.createLayer('pavement', tilesets, 0, 0);
    const decorationsLayer = map.createLayer('decorations', tilesets, 0, 0);
    const vehiclesLayer = map.createLayer('vehicles', tilesets, 0, 0);
    const buildingsBaseLayer = map.createLayer('buildings-base', tilesets, 0, 0);
    const buildingsTopLayer = map.createLayer('buildings-top', tilesets, 0, 0);
    const skyLayer = map.createLayer('sky', tilesets, 0, 0);
    
    // Setup collisions
    if (waterLayer) waterLayer.setCollisionByExclusion([-1]);
    if (buildingsBaseLayer) buildingsBaseLayer.setCollisionByExclusion([-1]);
    
    // Find a good spawn point (center of map, on land)
    // Try to find a spawn point on the 'pavement' or 'sand' layer
    let spawnX = this.mapWidth / 2;
    let spawnY = this.mapHeight / 2;
    
    // Create player
    this.player = new Player(this, spawnX, spawnY);
    this.player.setDepth(10); // Ensure player is above ground but below sky/tops
    
    // Set up camera
    this.setupCamera();
    
    // Add NPCs
    this.spawnNPCs();
    
    // Add wildlife
    this.spawnWildlife();
    
    // Add colliders
    if (waterLayer) this.physics.add.collider(this.player, waterLayer);
    if (buildingsBaseLayer) this.physics.add.collider(this.player, buildingsBaseLayer);
    
    // Add colliders for NPCs and wildlife
    this.npcs.forEach(npc => {
      npc.setDepth(10);
      if (waterLayer) this.physics.add.collider(npc, waterLayer);
      if (buildingsBaseLayer) this.physics.add.collider(npc, buildingsBaseLayer);
    });
    
    this.lizards.forEach(lizard => {
      lizard.setDepth(10);
      if (waterLayer) this.physics.add.collider(lizard, waterLayer);
      if (buildingsBaseLayer) this.physics.add.collider(lizard, buildingsBaseLayer);
    });
    
    // Kites fly over everything? Maybe they don't collide with water/buildings
    this.kites.forEach(kite => kite.setDepth(20)); // High up
    
    // Add UI overlay
    this.createUI();
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
        const tileX = Math.floor(this.player.x / 16);
        const tileY = Math.floor(this.player.y / 16);
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
      
      this.player.update();
      // Collisions are handled by physics engine now
    }
    
    // Update NPCs
    this.npcs.forEach(npc => {
      const prevX = npc.x;
      const prevY = npc.y;
      
      npc.update();
      
      npc.update();
    });
    
    // Update wildlife
    this.kites.forEach(kite => kite.update(time, delta));
    
    this.lizards.forEach(lizard => {
      const prevX = lizard.x;
      const prevY = lizard.y;
      
      lizard.update();
      
      lizard.update();
    });
  }
}
