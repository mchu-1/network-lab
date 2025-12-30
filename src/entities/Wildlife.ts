import Phaser from 'phaser';

export class BrahminyKite extends Phaser.GameObjects.Sprite {
  private moveSpeed: number = 60;
  private targetX: number;
  private targetY: number;
  private mapWidth: number;
  private mapHeight: number;

  constructor(scene: Phaser.Scene, x: number, y: number, mapWidth: number, mapHeight: number) {
    super(scene, x, y, 'brahminy-kite', 0);
    
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    
    scene.add.existing(this);
    
    this.setScale(0.2);
    this.setDepth(200); // Flying above everything
    
    this.createAnimations();
    this.anims.play('kite-fly', true);
    
    this.targetX = x;
    this.targetY = y;
    this.pickNewTarget();
    
    // Pick new target periodically
    scene.time.addEvent({
      delay: Phaser.Math.Between(3000, 8000),
      callback: this.pickNewTarget,
      callbackScope: this,
      loop: true,
    });
  }

  private createAnimations(): void {
    const anims = this.scene.anims;
    
    if (!anims.exists('kite-fly')) {
      anims.create({
        key: 'kite-fly',
        frames: anims.generateFrameNumbers('brahminy-kite', { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  private pickNewTarget(): void {
    // Pick a random target within map bounds
    const padding = 200;
    this.targetX = Phaser.Math.Between(padding, this.mapWidth - padding);
    this.targetY = Phaser.Math.Between(padding, this.mapHeight - padding);
  }

  update(_time: number, delta: number): void {
    // Move towards target
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 10) {
      const speed = this.moveSpeed * (delta / 1000);
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;
      
      // Flip sprite based on direction
      this.flipX = dx < 0;
    } else {
      this.pickNewTarget();
    }
  }
}

export class MonitorLizard extends Phaser.Physics.Arcade.Sprite {
  private moveSpeed: number = 25;
  private wanderTimer: Phaser.Time.TimerEvent;
  private currentDirection: string = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'monitor-lizard', 0);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setScale(0.15);
    this.setDepth(98);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(200, 150);
    body.setOffset(80, 100);
    body.setCollideWorldBounds(true);
    
    this.createAnimations();
    
    // Set up random wandering
    this.wanderTimer = scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 6000),
      callback: this.changeDirection,
      callbackScope: this,
      loop: true,
    });
    
    this.changeDirection();
  }

  private createAnimations(): void {
    const anims = this.scene.anims;
    
    if (!anims.exists('lizard-walk')) {
      anims.create({
        key: 'lizard-walk',
        frames: anims.generateFrameNumbers('monitor-lizard', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    
    if (!anims.exists('lizard-idle')) {
      anims.create({
        key: 'lizard-idle',
        frames: [{ key: 'monitor-lizard', frame: 0 }],
        frameRate: 1,
      });
    }
  }

  private changeDirection(): void {
    const directions = ['left', 'right', 'idle', 'idle', 'idle']; // Lizards rest a lot
    this.currentDirection = directions[Phaser.Math.Between(0, directions.length - 1)];
    
    // Reset timer with new random delay
    this.wanderTimer.reset({
      delay: Phaser.Math.Between(2000, 6000),
      callback: this.changeDirection,
      callbackScope: this,
      loop: true,
    });
  }

  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    switch (this.currentDirection) {
      case 'left':
        body.setVelocity(-this.moveSpeed, 0);
        this.anims.play('lizard-walk', true);
        this.flipX = true;
        break;
      case 'right':
        body.setVelocity(this.moveSpeed, 0);
        this.anims.play('lizard-walk', true);
        this.flipX = false;
        break;
      default:
        body.setVelocity(0, 0);
        this.anims.play('lizard-idle', true);
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.wanderTimer) {
      this.wanderTimer.destroy();
    }
    super.destroy(fromScene);
  }
}
