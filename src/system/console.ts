import { consolePage } from "../elements";
import { convertToSkippable, empty } from "../utils/animations";

const consoleTitle = document.getElementById(
  "console-title"
) as HTMLSpanElement;
const consoleText = document.getElementById("console-text") as HTMLSpanElement;
const consoleIdle = document.getElementById("console-idle") as HTMLDivElement;

const clickCallbacks = new Set<() => void>();

export function registerConsoleClicked() {
  let resolve: () => void;
  const callback = () => {
    clickCallbacks.delete(callback);
    resolve && resolve();
  };
  const clicked = new Promise<void>((resolve_) => (resolve = resolve_));
  clickCallbacks.add(callback);
  return { clicked, abort: () => clickCallbacks.delete(callback) };
}

consolePage.addEventListener("click", () => {
  for (const callback of clickCallbacks) callback();
});

export class ConsoleSystem {
  show() {
    consolePage.classList.add("show");
  }
  hide() {
    consolePage.classList.remove("show");
  }
  text(text: string, title: string = "") {
    consoleText.textContent = text;
    consoleTitle.textContent = title;
    if (text) {
      consoleText.style.animation = "none";
      void consoleText.offsetHeight;
      consoleText.style.animation = "";
      consoleText.style.animationDuration = `${text.length * 30}ms`;
      return convertToSkippable(consoleText.getAnimations());
    }
    return empty();
  }
  idle(show: boolean) {
    if (show) consoleIdle.classList.add("show");
    else consoleIdle.classList.remove("show");
  }
  reset() {
    this.text("");
    this.idle(false);
    this.hide();
  }
}
