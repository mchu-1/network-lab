import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private moveSpeed: number = 150;
  private facing: string = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'mathew', 0);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setScale(0.35);
    this.setDepth(100);
    
    // Set up physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(60, 80);
    body.setOffset(34, 40);
    body.setCollideWorldBounds(true);
    
    // Set up keyboard controls
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }
    
    // Create animations
    this.createAnimations();
  }

  private createAnimations(): void {
    const anims = this.scene.anims;
    
    // Mathew spritesheet layout (4x4 grid):
    // Row 0 (frames 0-3): Down
    // Row 1 (frames 4-7): Up
    // Row 2 (frames 8-11): Right
    // Row 3 (frames 12-15): Left
    
    if (!anims.exists('player-walk-down')) {
      anims.create({
        key: 'player-walk-down',
        frames: anims.generateFrameNumbers('mathew', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    
    if (!anims.exists('player-walk-up')) {
      anims.create({
        key: 'player-walk-up',
        frames: anims.generateFrameNumbers('mathew', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    
    if (!anims.exists('player-walk-right')) {
      anims.create({
        key: 'player-walk-right',
        frames: anims.generateFrameNumbers('mathew', { start: 8, end: 11 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    
    if (!anims.exists('player-walk-left')) {
      anims.create({
        key: 'player-walk-left',
        frames: anims.generateFrameNumbers('mathew', { start: 12, end: 15 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    
    if (!anims.exists('player-idle-down')) {
      anims.create({
        key: 'player-idle-down',
        frames: [{ key: 'mathew', frame: 0 }],
        frameRate: 1,
      });
    }
    
    if (!anims.exists('player-idle-up')) {
      anims.create({
        key: 'player-idle-up',
        frames: [{ key: 'mathew', frame: 4 }],
        frameRate: 1,
      });
    }
    
    if (!anims.exists('player-idle-right')) {
      anims.create({
        key: 'player-idle-right',
        frames: [{ key: 'mathew', frame: 8 }],
        frameRate: 1,
      });
    }
    
    if (!anims.exists('player-idle-left')) {
      anims.create({
        key: 'player-idle-left',
        frames: [{ key: 'mathew', frame: 12 }],
        frameRate: 1,
      });
    }
  }

  update(): void {
    if (!this.cursors || !this.wasd) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Get input
    const left = this.cursors.left?.isDown || this.wasd.A.isDown;
    const right = this.cursors.right?.isDown || this.wasd.D.isDown;
    const up = this.cursors.up?.isDown || this.wasd.W.isDown;
    const down = this.cursors.down?.isDown || this.wasd.S.isDown;
    
    // Calculate velocity with smooth acceleration
    let vx = 0;
    let vy = 0;
    
    if (left) vx = -this.moveSpeed;
    else if (right) vx = this.moveSpeed;
    
    if (up) vy = -this.moveSpeed;
    else if (down) vy = this.moveSpeed;
    
    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }
    
    body.setVelocity(vx, vy);
    
    // Update animation based on movement
    if (vx !== 0 || vy !== 0) {
      // Determine facing direction (prioritize horizontal when moving diagonally)
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? 'right' : 'left';
      } else {
        this.facing = vy > 0 ? 'down' : 'up';
      }
      this.anims.play(`player-walk-${this.facing}`, true);
    } else {
      this.anims.play(`player-idle-${this.facing}`, true);
    }
  }
}
