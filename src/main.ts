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

(async () => {
  const app = new Application({
    width: 1920,
    height: 1080,
    backgroundColor: 0x000000,
    backgroundAlpha: 0.0,
  });
  const arona = await Assets.load("/assets/spine/arona/arona_spr.skel");
  const animation = new Spine(arona.spineData);
  animation.position.set(480, 900);
  animation.scale.set(0.6);
  animation.state.setAnimation(0, "16", true);
  animation.state.setAnimation(1, "Idle_01", true);
  animation.autoUpdate = true;
  app.stage.addChild(animation as any);

  const plana = await Assets.load("/assets/spine/plana/NP0035_spr.skel");
  const anime = new Spine(plana.spineData);
  anime.position.set(1440, 900);
  anime.scale.set(0.6);
  anime.state.setAnimation(0, "18", true);
  anime.state.setAnimation(1, "Idle_01", true);
  anime.autoUpdate = true;
  app.stage.addChild(anime as any);

  const canvas = app.view as HTMLCanvasElement;
  document.getElementById("spine")?.appendChild(canvas);
})();
