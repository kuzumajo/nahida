import { consolePage } from "../elements";
import { convertToSkippable, Skippable } from "../utils/animations";

const consoleTitle = document.getElementById(
  "console-title"
) as HTMLSpanElement;
const consoleText = document.getElementById("console-text") as HTMLSpanElement;
const consoleIdle = document.getElementById("console-idle") as HTMLDivElement;

export function registerConsoleClicked() {
  let resolve: () => void;
  const clicked = new Promise<void>((resolve_) => (resolve = resolve_));
  const ctrl = new AbortController();
  consolePage.addEventListener("click", () => resolve && resolve(), {
    signal: ctrl.signal,
    once: true,
  });
  return { clicked, ctrl };
}

export const consoleSystem = {
  show() {
    this.setTitle("");
    this.setText("");
    consolePage.classList.add("show");
    return convertToSkippable(consolePage.getAnimations());
  },
  hide() {
    consolePage.classList.remove("show");
    return convertToSkippable(consolePage.getAnimations());
  },
  wait(timeout: number): Skippable {
    let resolved = false;
    let resolve: () => void;
    const finished = new Promise<void>((resolve_) => (resolve = resolve_));
    const finish = () => {
      if (resolved) return;
      resolved = true;
      resolve && resolve();
    };
    setTimeout(() => finish(), timeout);
    return { finished, finish };
  },
  setTitle(title: string) {
    consoleTitle.textContent = title;
  },
  setText(text: string) {
    consoleText.textContent = text;
    if (text) {
      consoleText.style.animation = "none";
      void consoleText.offsetHeight;
      consoleText.style.animation = "";
      consoleText.style.animationDuration = `${text.length * 30}ms`;
      return consoleText.getAnimations();
    }
    return [];
  },
  text(title: string, text: string) {
    this.setTitle(title);
    const animations = this.setText(text);
    return convertToSkippable(animations);
  },
  setIdle(show: boolean) {
    if (show) consoleIdle.classList.add("show");
    else consoleIdle.classList.remove("show");
  },
  async idle() {
    this.setIdle(true);
    await registerConsoleClicked().clicked;
    this.setIdle(false);
  },
};

export type ConsoleSystem = typeof consoleSystem;

export function prepareConsole() {
  consoleSystem.setTitle("");
  consoleSystem.setText("");
  consoleSystem.setIdle(false);
  consoleSystem.hide();
}
