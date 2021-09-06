import {
  Canvas,
  createCanvas,
  loadImage,
  NodeCanvasRenderingContext2D,
} from "canvas";
import sharp from "sharp";

interface Item {
  description?: string;
  image: string;
  title: string;
}

export class Grid {
  private static readonly PREFIX = "data:image/png;base64,";
  private static readonly COVER_SIZE = 250;

  private readonly SIZE: number;
  private readonly items: Item[];
  private readonly displayCaptions: boolean;

  private readonly canvas: Canvas;
  private readonly context: NodeCanvasRenderingContext2D;

  constructor(items: Item[], displayCaptions = true) {
    this.items = items;
    this.displayCaptions = displayCaptions;
    this.SIZE = Math.sqrt(this.items.length);

    const canvasSize = Grid.COVER_SIZE * this.SIZE;

    this.canvas = createCanvas(canvasSize, canvasSize);
    this.context = this.canvas.getContext("2d");
  }

  async generate() {
    await Promise.all([this.addDisplayCaptions(), this.addCoverImages()]);

    return this.toBase64();
  }

  private async addDisplayCaptions() {
    if (!this.displayCaptions) return;

    let POSITION = 0;
    for (let i = 0; i < this.SIZE; i++) {
      for (let j = 0; j < this.SIZE; j++) {
        const { title, description } = this.items[POSITION];
        const xAxis = j * Grid.COVER_SIZE;
        const yAxis = i * Grid.COVER_SIZE;

        this.context.globalCompositeOperation = "source-over";
        const GRADIENT = this.context.createLinearGradient(
          xAxis,
          yAxis,
          xAxis,
          yAxis + Grid.COVER_SIZE
        );
        GRADIENT.addColorStop(0, "rgba(0, 0, 0, .5)");
        GRADIENT.addColorStop(0.1, "rgba(0, 0, 0, .4)");
        GRADIENT.addColorStop(0.28, "rgba(0, 0, 0, 0)");

        this.context.fillStyle = GRADIENT;
        this.context.fillRect(xAxis, yAxis, Grid.COVER_SIZE, Grid.COVER_SIZE);

        this.context.font = 'bold 16px "RobotoCondensed, ArialUnicode"';
        this.context.fillStyle = "rgb(255, 255, 255)";

        this.writeScalableText(
          title,
          xAxis + 5,
          yAxis + 5 + 16,
          Grid.COVER_SIZE - 10,
          'bold %S%px "RobotoCondensed, ArialUnicode"',
          16
        );

        POSITION++;
      }
    }
  }

  private async addCoverImages() {
    const promises = [];

    let POSITION = 0;
    for (let i = 0; i < this.SIZE; i++) {
      for (let j = 0; j < this.SIZE; j++) {
        const image = this.items[POSITION].image;
        const xAxis = j * Grid.COVER_SIZE;
        const yAxis = i * Grid.COVER_SIZE;

        promises.push({ xAxis, yAxis, image });
        POSITION++;
      }
    }

    await Promise.all(
      promises.map(async ({ xAxis, yAxis, image }) => {
        const loadedImage = await loadImage(image);
        this.context.globalCompositeOperation = "destination-over";
        this.context.drawImage(
          loadedImage,
          xAxis,
          yAxis,
          Grid.COVER_SIZE,
          Grid.COVER_SIZE
        );
      })
    );
  }

  private writeScalableText(
    text: string,
    xAxis: number,
    yAxis: number,
    maxWidth: number,
    style: string,
    startingSize: number
  ) {
    this.context.font = style.replace("%S%", startingSize.toString());

    let width = this.context.measureText(text).width;
    let size = startingSize;

    while (width > maxWidth) {
      size--;
      this.context.font = style.replace("%S%", size.toString());
      width = this.context.measureText(text).width;
      if (size === 2) break;
    }

    this.context.font = style.replace("%S%", size.toString());
    this.context.fillText(text, xAxis, yAxis);
  }

  private async toBase64() {
    const sharped = await sharp(this.canvas.toBuffer()).png().toBuffer();
    return Grid.PREFIX + sharped.toString("base64");
  }
}
