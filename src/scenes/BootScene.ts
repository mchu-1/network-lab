import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  private mapData?: any;

  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add
      .text(width / 2, height / 2 - 50, "Loading...", {
        font: "20px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    const percentText = this.add
      .text(width / 2, height / 2, "0%", {
        font: "18px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    this.load.on("progress", (value: number) => {
      percentText.setText(Math.round(value * 100) + "%");
      progressBar.clear();
      progressBar.fillStyle(0x00a8ff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Load map file
    this.load.tilemapTiledJSON("map", "map-v3.tmx");

    // Load all tileset images
    // Note: Keys must match what Tiled expects or we map them later
    this.load.image("island-0", "assets/layers/island-layer-0.png");
    this.load.image("island-1", "assets/layers/island-layer-1.png");
    this.load.image("island-2", "assets/layers/island-layer-2.png");
    this.load.image("island-layer-3", "assets/layers/island-layer-3.png");
    this.load.image("island-4", "assets/layers/island-layer-4.png");
    this.load.image("island-5", "assets/layers/island-layer-5.png");

    // Props and Buildings
    this.load.image("paraphernalia", "assets/props/paraphernalia.png");
    this.load.image("blue-and-white", "assets/buildings/blue-and-white.png");
    this.load.image(
      "co-working-closed",
      "assets/buildings/co-working-closed.png"
    );
    this.load.image("hotel-closed", "assets/buildings/hotel-closed.png");
    this.load.image("gym", "assets/buildings/gym.png");
    this.load.image("kk-mart-closed", "assets/buildings/kk-mart-closed.png");
    this.load.image("lab", "assets/buildings/lab.png");

    // Load character spritesheets (128x128 per frame, 4 columns, 4 rows)
    this.load.spritesheet("mathew", "assets/characters/mathew.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("jackson", "assets/characters/jackson.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    // Load wildlife spritesheets
    this.load.spritesheet("brahminy-kite", "assets/life/brahminy-kite.png", {
      frameWidth: 270,
      frameHeight: 294,
    });
    this.load.spritesheet("monitor-lizard", "assets/life/monitor-lizard.png", {
      frameWidth: 360,
      frameHeight: 294,
    });
  }

  create(): void {
    // Start game scene directly
    this.scene.start("GameScene");
  }
}
