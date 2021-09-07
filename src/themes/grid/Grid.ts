import { loadImage } from "canvas";
import { Base } from "../base";

export interface Item {
  description?: string;
  image: string;
  title: string;
}

const getWidthAndHeight = (itemsLength: number, coverSize: number) => {
  const size = Math.sqrt(itemsLength) * coverSize;
  return { width: size, height: size };
};

export class Grid extends Base {
  private static readonly COVER_SIZE = 250;

  private readonly SIZE: number;
  private readonly items: Item[];
  private readonly displayCaptions: boolean;

  constructor(items: Item[], displayCaptions = true) {
    super(getWidthAndHeight(items.length, Grid.COVER_SIZE));

    this.SIZE = Math.sqrt(items.length);
    this.items = items;
    this.displayCaptions = displayCaptions;
  }

  protected async generateCanvas() {
    await Promise.all([
      this.generateDisplayCaptions(),
      this.generateCoverImages(),
    ]);
  }

  private async generateDisplayCaptions() {
    if (!this.displayCaptions) return;

    let POSITION = 0;
    for (let i = 0; i < this.SIZE; i++) {
      for (let j = 0; j < this.SIZE; j++) {
        const { title, description } = this.items[POSITION];
        const xAxis = j * Grid.COVER_SIZE;
        const yAxis = i * Grid.COVER_SIZE;

        this.context.globalCompositeOperation = "source-over";
        this.addGradient(xAxis, yAxis);
        if (title) this.addTitle(title, xAxis, yAxis);
        if (description) this.addDescription(description, xAxis, yAxis);

        POSITION++;
      }
    }
  }

  private addGradient(xAxis: number, yAxis: number) {
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
  }

  private addTitle(text: string, xAxis: number, yAxis: number) {
    this.context.fillStyle = "rgb(255, 255, 255)";
    this.addScalableText(
      text,
      xAxis + 5,
      yAxis + 5 + 16,
      Grid.COVER_SIZE - 10,
      'bold %Spx "RobotoCondensed-Bold, ArialUnicode"',
      16
    );
  }

  private addDescription(text: string, xAxis: number, yAxis: number) {
    this.context.fillStyle = "rgb(240, 240, 240)";
    this.addScalableText(
      text,
      xAxis + 5,
      yAxis + 5 + 20 + 14,
      Grid.COVER_SIZE - 10,
      'bold %Spx "RobotoCondensed, ArialUnicode"',
      14
    );
  }

  private async generateCoverImages() {
    const promises = [];

    let POSITION = 0;
    for (let i = 0; i < this.SIZE; i++) {
      for (let j = 0; j < this.SIZE; j++) {
        const { image } = this.items[POSITION];
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
}
