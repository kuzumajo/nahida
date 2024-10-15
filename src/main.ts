import "pixi-spine";
import { Application, Assets } from "pixi.js";
import { Spine } from "pixi-spine";

import { preloadResources } from "./pages/loading";
import { showMenu } from "./pages/menu";
import "./style.css";

addEventListener("contextmenu", (e) => e.preventDefault());

(async () => {
  await preloadResources([{ type: "image", src: "/menu-bg.jpg" }]);
  showMenu();
})();

async function createSpine(res: string) {
  const animation = await Assets.load(res);
  return new Spine(animation.spineData);
}

(async () => {
  const app = new Application({
    width: 1920,
    height: 1080,
    backgroundColor: 0x000000,
    backgroundAlpha: 0.0,
  });
  const arona = await createSpine("/assets/spine/arona/arona_spr.skel");
  arona.position.set(480, 900);
  arona.scale.set(0.6);
  arona.state.setAnimation(0, "16", true);
  arona.state.setAnimation(1, "Idle_01", true);
  arona.autoUpdate = true;
  app.stage.addChild(arona as any);

  setInterval(() => {
    setTimeout(() => {
      arona.state.setAnimation(2, "Eye_Close_01", false);
    }, Math.random() * 1000);
  }, 5000);

  const plana = await createSpine("/assets/spine/plana/NP0035_spr.skel");
  plana.position.set(1440, 900);
  plana.scale.set(0.6);
  plana.state.setAnimation(0, "18", true);
  plana.state.setAnimation(1, "Idle_01", true);
  plana.autoUpdate = true;
  app.stage.addChild(plana as any);

  setInterval(() => {
    setTimeout(() => {
      plana.state.setAnimation(2, "Eye_Close_01", false);
    }, Math.random() * 1000);
  }, 5000);

  const canvas = app.view as HTMLCanvasElement;
  document.getElementById("spine")?.appendChild(canvas);
})();
