import {
  Canvas,
  createCanvas,
  NodeCanvasRenderingContext2D,
  registerFont,
} from "canvas";
import path from "path";
import sharp from "sharp";

interface ConstructorProps {
  width: number;
  height: number;
}

const ASSETS_SRC = path.resolve(__dirname, "..", "..", "assets");

export class Base {
  protected readonly PREFIX = "data:image/png;base64,";

  protected canvas: Canvas;
  protected context: NodeCanvasRenderingContext2D;

  constructor({ width, height }: ConstructorProps) {
    console.log(ASSETS_SRC);
    this.registerFonts();
    this.canvas = createCanvas(width, height);
    this.context = this.canvas.getContext("2d");
  }

  async getImage() {
    await this.generateCanvas();
    return this.toBase64();
  }

  protected async generateCanvas() {
    throw new Error("Missing theme generate function");
  }

  protected async toBase64() {
    const sharpBuffer = await sharp(this.canvas.toBuffer()).png().toBuffer();
    return this.PREFIX + sharpBuffer.toString("base64");
  }

  protected async addScalableText(
    text: string,
    xAxis: number,
    yAxis: number,
    maxWidth: number,
    style: string,
    startSize: number
  ) {
    this.context.font = style.replace("%S", startSize.toString());

    let width = this.context.measureText(text).width;
    let size = startSize;

    while (width > maxWidth) {
      size--;

      this.context.font = style.replace("%S", size.toString());
      width = this.context.measureText(text).width;
      if (size === 2) break;
    }

    this.context.fillText(text, xAxis, yAxis);
  }

  private registerFonts() {
    registerFont(ASSETS_SRC + "/fonts/RobotoCondensed-Bold.ttf", {
      family: "RobotoCondensed-Bold",
    });
    registerFont(ASSETS_SRC + "/fonts/RobotoCondensed-Light.ttf", {
      family: "RobotoCondensed-Light",
    });
    registerFont(ASSETS_SRC + "/fonts/RobotoCondensed-Regular.ttf", {
      family: "RobotoCondensed",
    });
  }
}
