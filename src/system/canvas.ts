import { backgroundPage } from "../elements";
import {
  convertToSkippable,
  createAnimation,
  Skippable,
} from "../utils/animations";

export class CanvasSystem {
  #stack: HTMLDivElement[] = [];

  changeBackground(
    src: string,
    animates: string = "",
    transitions: string = ""
  ) {
    while (this.#stack.length > 1) {
      this.#stack.shift()!.remove();
    }

    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.inset = "0";
    backgroundPage.append(div);
    if (src.startsWith("#")) {
      div.style.backgroundColor = src;
    } else {
      div.style.backgroundImage = `url(${src})`;
    }
    animateImage(div, transitions);
    const skippable = convertToSkippable(animateBackground(div, animates));
    this.#stack.push(div);
    return skippable;
  }

  reset() {
    while (this.#stack.length > 0) {
      this.#stack.shift()!.remove();
    }
  }
}

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
      if (animation.endsWith("ms")) {
        duration = +animation.slice(0, -2);
        return false;
      }
      if (animation.endsWith("s")) {
        duration = +animation.slice(0, -1) * 1000;
        return false;
      }
      return true;
    });

  return [animations, duration, easing] as [string[], number, Easing];
}

/**
 * Animate `fade` animations
 */
export function animateBackground(div: HTMLDivElement, animation: string) {
  const animates: (Skippable | Animation)[] = [];
  const [animations, duration, easing] = parseAnimation(animation, 1000);

  for (const animation of animations) {
    switch (animation) {
      case "fade":
        animates.push(
          div.animate(
            { opacity: [0, 1] },
            { duration, fill: "forwards", easing }
          )
        );
        break;
      case "conic":
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
      case "blinds":
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
  let isPosition = false;
  let size = [];

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
        size.push(animation);
        break;

      case "/":
        isPosition = true;
        break;

      default:
        if (animation.endsWith("%")) {
          if (isPosition) {
            if (animation.startsWith("to-")) {
              hasAnimation = true;
              toPosition.push(animation.slice(3));
            } else {
              fromPosition.push(animation);
            }
          } else {
            size.push(animation);
          }
          break;
        }

        console.warn("unknown animation: " + animation);
    }
  }

  const from = fromPosition.join(" ") || "center";
  const to = toPosition.join(" ");

  div.style.backgroundSize = size.join(" ") || "cover";
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
