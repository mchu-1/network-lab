import Phaser from 'phaser';

export class NPC extends Phaser.Physics.Arcade.Sprite {
  private moveSpeed: number;
  private wanderTimer: Phaser.Time.TimerEvent;
  private currentDirection: string = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'jackson', moveSpeed: number = 30) {
    super(scene, x, y, texture, 0);
    
    this.moveSpeed = moveSpeed;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setScale(0.35);
    this.setDepth(99);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(60, 80);
    body.setOffset(34, 40);
    body.setCollideWorldBounds(true);
    
    this.createAnimations();
    
    // Set up random wandering
    this.wanderTimer = scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 5000),
      callback: this.changeDirection,
      callbackScope: this,
      loop: true,
    });
    
    this.changeDirection();
  }

  private createAnimations(): void {
    const anims = this.scene.anims;
    
    if (!anims.exists('npc-walk-down')) {
      anims.create({
        key: 'npc-walk-down',
        frames: anims.generateFrameNumbers('jackson', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    
    if (!anims.exists('npc-walk-up')) {
      anims.create({
        key: 'npc-walk-up',
        frames: anims.generateFrameNumbers('jackson', { start: 4, end: 7 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    
    if (!anims.exists('npc-walk-right')) {
      anims.create({
        key: 'npc-walk-right',
        frames: anims.generateFrameNumbers('jackson', { start: 8, end: 11 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    
    if (!anims.exists('npc-walk-left')) {
      anims.create({
        key: 'npc-walk-left',
        frames: anims.generateFrameNumbers('jackson', { start: 12, end: 15 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    
    if (!anims.exists('npc-idle')) {
      anims.create({
        key: 'npc-idle',
        frames: [{ key: 'jackson', frame: 0 }],
        frameRate: 1,
      });
    }
  }

  private changeDirection(): void {
    const directions = ['up', 'down', 'left', 'right', 'idle', 'idle']; // More chance to idle
    this.currentDirection = directions[Phaser.Math.Between(0, directions.length - 1)];
    
    // Reset timer with new random delay
    this.wanderTimer.reset({
      delay: Phaser.Math.Between(1500, 4000),
      callback: this.changeDirection,
      callbackScope: this,
      loop: true,
    });
  }

  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    switch (this.currentDirection) {
      case 'up':
        body.setVelocity(0, -this.moveSpeed);
        this.anims.play('npc-walk-up', true);
        break;
      case 'down':
        body.setVelocity(0, this.moveSpeed);
        this.anims.play('npc-walk-down', true);
        break;
      case 'left':
        body.setVelocity(-this.moveSpeed, 0);
        this.anims.play('npc-walk-left', true);
        break;
      case 'right':
        body.setVelocity(this.moveSpeed, 0);
        this.anims.play('npc-walk-right', true);
        break;
      default:
        body.setVelocity(0, 0);
        this.anims.play('npc-idle', true);
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.wanderTimer) {
      this.wanderTimer.destroy();
    }
    super.destroy(fromScene);
  }
}
