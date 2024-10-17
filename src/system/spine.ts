import { Spine } from "pixi-spine";
import {
  convertToSkippable,
  createAnimation,
  Skippable,
} from "../utils/animations";
import { app } from "../utils/pixi";

export class SpineSystem {
  constructor() {
    document.getElementById("spine")!.appendChild(app.view);
  }

  updateSpine(spine: Spine, animation = "", transition = "") {
    if (!app.stage.children.includes(spine)) {
      app.stage.addChild(spine);
    }
    return parseAnimation(spine, animation, transition);
  }

  reset() {
    const children = [...app.stage.children];
    for (const child of children) {
      app.stage.removeChild(child);
    }
  }
}

function parseAnimation(spine: Spine, animation: string, transition: string) {
  let duration = 500;
  const animations = [] as { channel: number; name: string; loop: boolean }[];
  const fromPosition = [] as number[];
  const toPosition = [] as number[];
  const fromScale = [] as number[];
  const toScale = [] as number[];
  const skippables = [] as Skippable[];
  const fade = [] as number[];

  for (const name of animation.split(/\s+/).filter(Boolean)) {
    if (name === "fade-in") {
      fade.push(0, 1);
    } else if (name === "fade-out") {
      fade.push(1, 0);
    } else if (name.startsWith("once-")) {
      const once = name.slice(5);
      const index = once.lastIndexOf("/");
      if (index > -1) {
        animations.push({
          channel: +once.slice(index + 1),
          name: once.slice(0, index),
          loop: false,
        });
      } else {
        animations.push({
          channel: 0,
          name: once,
          loop: false,
        });
      }
    } else if (name.startsWith("loop-")) {
      const loop = name.slice(5);
      const index = loop.lastIndexOf("/");
      if (index > -1) {
        animations.push({
          channel: +loop.slice(index + 1),
          name: loop.slice(0, index),
          loop: true,
        });
      } else {
        animations.push({
          channel: 0,
          name: loop,
          loop: true,
        });
      }
    } else if (name.startsWith("duration-")) {
      duration = +name.slice(9);
    } else if (name.endsWith("ms")) {
      duration = +name.slice(0, -2);
    } else if (name.endsWith("s")) {
      duration = +name.slice(0, -1) * 1000;
    } else if (name.startsWith("to-") && name.slice(3).indexOf("/") > -1) {
      const cut = name.slice(3);
      const index = cut.indexOf("/");
      const pos = +cut.slice(0, index);
      const tot = +cut.slice(index + 1);
      toPosition.push((pos - 0.5) / tot);
    } else if (name.startsWith("to-") && name.slice(3).endsWith("%")) {
      toPosition.push(+name.slice(3, -1) / 100);
    } else if (name.indexOf("/") > -1) {
      const index = name.indexOf("/");
      const pos = +name.slice(0, index);
      const tot = +name.slice(index + 1);
      fromPosition.push((pos - 0.5) / tot);
    } else if (name.endsWith("%")) {
      fromPosition.push(+name.slice(0, -1) / 100);
    }
  }

  for (const name of transition.split(/\s+/).filter(Boolean)) {
    if (name.startsWith("duration-")) {
      duration = +name.slice(9);
    } else if (name.startsWith("to-") && name.endsWith("%")) {
      toScale.push(+name.slice(3, -1) / 100);
    } else if (name.endsWith("%")) {
      fromScale.push(+name.slice(0, -1) / 100);
    } else {
      console.warn(`Unknown transition: ${name}`);
    }
  }

  if (fade.length === 2) {
    skippables.push(
      createAnimation((x) => {
        spine.alpha = (fade[1] - fade[0]) * x + fade[0];
      }, duration)
    );
  }

  if (fromPosition.length == 0) fromPosition.push(spine.position.x / 1920);
  if (fromPosition.length == 1) fromPosition.push(spine.position.y / 1080);
  if (toPosition.length > 0) {
    if (toPosition.length == 1) toPosition.push(fromPosition[1]);
    skippables.push(
      createAnimation((x) => {
        spine.position.set(
          ((toPosition[0] - fromPosition[0]) * x + fromPosition[0]) * 1920,
          ((toPosition[1] - fromPosition[1]) * x + fromPosition[1]) * 1080
        );
      }, duration)
    );
  } else {
    spine.position.set(fromPosition[0] * 1920, fromPosition[1] * 1080);
  }

  for (const anime of animations) {
    spine.state.setAnimation(anime.channel, anime.name, anime.loop);
  }

  if (fromScale.length == 0) fromScale.push(spine.scale.x);
  if (toScale.length > 0) {
    skippables.push(
      createAnimation((x) => {
        spine.scale.set((toScale[0] - fromScale[0]) * x + fromScale[0]);
      }, duration)
    );
  } else {
    spine.scale.set(fromScale[0]);
  }

  return convertToSkippable(skippables);
}
