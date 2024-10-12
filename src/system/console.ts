import { consolePage } from "../elements";
import { convertToSkippable, Skippable } from "../utils/animations";

const consoleTitle = document.getElementById(
  "console-title"
) as HTMLSpanElement;
const consoleText = document.getElementById("console-text") as HTMLSpanElement;
const consoleIdle = document.getElementById("console-idle") as HTMLDivElement;

export type ConsoleSystem = {
  show(): Skippable;
  hide(): Skippable;
  idle(): Promise<void>;
  wait(timeout: number): Skippable;
  setTitle(title: string): void;
  setText(text: string): Animation[];
  setIdle(show: boolean): void;
  text(title: string, text: string): Skippable;
};

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

export const consoleSystem: ConsoleSystem = {
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
  async idle() {
    this.setIdle(true);
    const { clicked } = registerConsoleClicked();
    await clicked;
    this.setIdle(false);
  },
  wait(timeout: number) {
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
};

export function prepareConsole() {
  consoleSystem.setTitle("");
  consoleSystem.setText("");
  consoleSystem.setIdle(false);
  consoleSystem.hide();
}
