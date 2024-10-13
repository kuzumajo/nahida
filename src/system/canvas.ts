import { backgroundPage } from "../elements";
import {
  convertToSkippable,
  createAnimation,
  Skippable,
} from "../utils/animations";

export const bgSystem = {
  stack: [] as { src: string; div: HTMLDivElement }[],
  clean() {
    while (this.stack.length > 0) this.stack.shift()!.div.remove();
  },
  change(src: string, animates: string, transitions: string) {
    while (this.stack.length > 1) this.stack.shift()!.div.remove();

    if (
      this.stack.length === 0 ||
      this.stack[this.stack.length - 1].src !== src
    ) {
      const div = document.createElement("div");
      div.style.position = "absolute";
      div.style.inset = "0";
      backgroundPage.append(div);
      div.style.backgroundImage = `url(${src})`;
      animateImage(div, transitions);
      const skippable = convertToSkippable(animateBackground(div, animates));
      this.stack.push({ src, div });
      return skippable;
    } else {
      const div = this.stack[this.stack.length - 1].div;
      return convertToSkippable(animateBackground(div, animates));
    }
  },
};

export type BackgroundSystem = typeof bgSystem;

const feasing = {
  linear: (x: number) => x,
  "ease-in": (x: number) => x * x,
  "ease-out": (x: number) => 1 - (1 - x) * (1 - x),
  "ease-in-out": (x: number) => 3 * x * x - 2 * x * x * x,
};
type Easing = keyof typeof feasing;

function parseAnimation(animation: string, duration: number) {
  let easing: Easing = "linear";
  const animations = animation
    .split(" ")
    .filter((x) => x.length > 0)
    .filter((animation) => {
      if (animation.startsWith("duration-")) {
        duration = +animation.slice(9);
        return false;
      }
      if (animation === "linear") {
        easing = "linear";
        return false;
      }
      if (animation === "ease-in") {
        easing = "ease-in";
        return false;
      }
      if (animation === "ease-out") {
        easing = "ease-out";
        return false;
      }
      if (animation === "ease-in-out" || animation === "ease") {
        easing = "ease-in-out";
        return false;
      }
      return true;
    });

  return [animations, duration, easing] as [string[], number, Easing];
}

/**
 * Animate `fade-in`, `fade-out` animations
 */
export function animateBackground(div: HTMLDivElement, animation: string) {
  const animates: (Skippable | Animation)[] = [];
  const [animations, duration, easing] = parseAnimation(animation, 1000);

  for (const animation of animations) {
    switch (animation) {
      case "fade-in":
        animates.push(
          div.animate(
            { opacity: [0, 1] },
            { duration, fill: "forwards", easing }
          )
        );
        break;
      case "fade-out":
        animates.push(
          div.animate(
            { opacity: [1, 0] },
            { duration, fill: "forwards", easing }
          )
        );
        break;
      case "conic-in":
        animates.push(
          createAnimation((progress) => {
            const x = feasing[easing](progress);
            const a = x * 1.1 - 0.1;
            const b = x * 1.1;
            setMask(
              div,
              `conic-gradient(white ${a * 100}%, transparent ${b * 100}%)`,
              "100%"
            );
          }, duration)
        );
        break;
      case "conic-out":
        animates.push(
          createAnimation((progress) => {
            const x = feasing[easing](progress);
            const a = x * 1.1 - 0.1;
            const b = x * 1.1;
            setMask(
              div,
              `conic-gradient(transparent ${a * 100}%, white ${b * 100}%)`,
              "100%"
            );
          }, duration)
        );
        break;
      case "blinds-in":
        animates.push(
          createAnimation((progress) => {
            const x = feasing[easing](progress);
            const a = x * 1.5 - 0.5;
            const b = x * 1.5;
            setMask(
              div,
              `linear-gradient(to right, white ${a * 100}%, transparent ${
                b * 100
              }%)`,
              "5%"
            );
          }, duration)
        );
        break;
      case "blinds-out":
        animates.push(
          createAnimation((progress) => {
            const x = feasing[easing](progress);
            const a = x * 1.5 - 0.5;
            const b = x * 1.5;
            setMask(
              div,
              `linear-gradient(to right, transparent ${a * 100}%, white ${
                b * 100
              }%)`,
              "5%"
            );
          }, duration)
        );
        break;

      default:
        console.warn(`Unknown background animation: ${animation}`);
    }
  }

  return animates;
}

/**
 * Animate `to-bottom`, `to-top` animations
 */
export function animateImage(div: HTMLDivElement, animation: string) {
  const animates: Animation[] = [];
  const [animations, duration, easing] = parseAnimation(animation, 60000);

  let fromPosition = [];
  let toPosition = [];
  let hasAnimation = false;

  for (const animation of animations) {
    switch (animation) {
      case "left":
      case "right":
      case "top":
      case "bottom":
      case "center":
        fromPosition.push(animation);
        break;

      case "to-left":
      case "to-right":
      case "to-top":
      case "to-bottom":
      case "to-center":
        hasAnimation = true;
        toPosition.push(animation.slice(3));
        break;

      case "cover":
      case "contain":
      case "fill":
        div.style.backgroundSize = animation;
        break;

      default:
        if (animation.endsWith("%")) {
          div.style.backgroundSize = animation;
          break;
        }

        console.warn("unknown animation: " + animation);
    }
  }

  const from = fromPosition.join(" ");
  const to = toPosition.join(" ");

  if (hasAnimation && from !== to) {
    animates.push(
      div.animate(
        { backgroundPosition: [from, to] },
        { duration, fill: "forwards", easing }
      )
    );
  } else {
    div.style.backgroundPosition = from;
  }

  return animates;
}

export function setMask(elem: HTMLElement, image: string, size: string) {
  elem.style.maskImage = image;
  elem.style.maskSize = size;

  // // fix for chrome 1+
  // elem.style.webkitMaskImage = image;
  // elem.style.webkitMaskSize = size;
}
