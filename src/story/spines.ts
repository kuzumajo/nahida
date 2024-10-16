import { Spine } from "pixi-spine";
import { Assets } from "pixi.js";

export const spines = {
  plana: createSpine("/assets/spine/plana/NP0035_spr.skel", (spine) => {
    spine.position.set(0, 1080 * 0.9);
    spine.scale.set(0.7);
    spine.autoUpdate = true;
    // idle animations
    spine.state.setAnimation(1, "Idle_01", true);
    // blink eye
    setInterval(() => {
      setTimeout(() => {
        spine.state.setAnimation(2, "Eye_Close_01", false);
      }, Math.random() * 1000);
    }, 5000 + Math.random() * 1000);
  }),
  arona: createSpine("/assets/spine/arona/arona_spr.skel", (spine) => {
    spine.position.set(0, 1080 * 0.9);
    spine.scale.set(0.7);
    spine.autoUpdate = true;
    // idle animations
    spine.state.setAnimation(1, "Idle_01", true);
    // blink eye
    setInterval(() => {
      setTimeout(() => {
        spine.state.setAnimation(2, "Eye_Close_01", false);
      }, Math.random() * 1000);
    }, 5000 + Math.random() * 1000);
  }),
} satisfies Record<string, () => Promise<Spine>>;

function createSpine(url: string, callback?: (spine: Spine) => void) {
  return async () => {
    const resource = await Assets.load(url);
    const spine = new Spine(resource.spineData);
    if (callback) callback(spine);
    return spine;
  };
}
