import { Base } from "../base";

export class Classic extends Base {
  constructor() {
    super({ width: 1000, height: 1000 });
  }

  protected async generateCanvas() {
    console.log("Banana nanica");
  }
}
