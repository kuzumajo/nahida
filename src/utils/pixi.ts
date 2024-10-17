import { Application } from "pixi.js";

export const app = new Application<HTMLCanvasElement>({
  width: 1920,
  height: 1080,
  backgroundColor: 0x000000,
  backgroundAlpha: 0,
});
