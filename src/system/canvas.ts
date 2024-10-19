import { backgroundPage } from "../elements";
import {
  convertToSkippable,
  createAnimation,
  Skippable,
} from "../utils/animations";

const ANAMORPHIC = 12.80799628079963;

export class CanvasSystem {
  changeBackground(
    src: string,
    animates: string = "",
    transitions: string = ""
  ) {
    // remove invisible backgrounds
    while (backgroundPage.childNodes.length > 1)
      backgroundPage.removeChild(backgroundPage.firstChild!);

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
    return skippable;
  }

  playVideo(src: string): Skippable {
    const div = document.createElement("div");
    const video = document.createElement("video");
    div.style.position = "absolute";
    div.style.inset = "0";
    div.style.backgroundColor = "#000";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "contain";

    let resolve: () => void;
    const finished = new Promise<void>((resolve_) => (resolve = resolve_));
    const finish = () => {
      if (!video.paused) {
        createAnimation((x) => {
          video.volume = 1 - x;
        }, 500);
      }
      resolve && resolve();
    };

    video.src = src;
    video.controls = false;
    video.autoplay = true;
    video.onended = () => finish();
    video.onerror = (e) => {
      console.error(e);
      alert("加载视频错误，请使用更加先进的浏览器呜呜呜");
      finish();
    };

    div.appendChild(video);
    backgroundPage.appendChild(div);

    return { finished, finish };
  }

  #setAspect(aspect: number) {
    backgroundPage.style.setProperty("--camera", `${aspect}%`);
  }

  #aspect = 0;
  aspect(target: number) {
    const origin = this.#aspect;
    this.#aspect = target;
    return createAnimation((p) => {
      const x = feasing["ease-out"](p);
      this.#setAspect((target - origin) * x + origin);
    }, 1000);
  }

  anamorphic() {
    return this.aspect(ANAMORPHIC);
  }

  normal() {
    return this.aspect(0);
  }

  reset() {
    this.#aspect = 0;
    this.#setAspect(0);
    while (backgroundPage.firstChild)
      backgroundPage.removeChild(backgroundPage.firstChild);
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
  const animates: Skippable[] = [];
  const [animations, duration, easing] = parseAnimation(animation, 1000);

  for (const animation of animations) {
    switch (animation) {
      case "fade":
        animates.push(
          createAnimation((progress) => {
            const x = feasing[easing](progress);
            div.style.opacity = String(x);
          }, duration)
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
    div.animate(
      { backgroundPosition: [from, to] },
      { duration, fill: "forwards", easing }
    );
  } else {
    div.style.backgroundPosition = from;
  }
}

export function setMask(elem: HTMLElement, image: string, size: string) {
  elem.style.maskImage = image;
  elem.style.maskSize = size;

  // // fix for chrome 1+
  // elem.style.webkitMaskImage = image;
  // elem.style.webkitMaskSize = size;
}
