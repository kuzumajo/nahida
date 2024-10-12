import { consolePage } from "../elements";

const consoleTitle = document.getElementById(
  "console-title"
) as HTMLSpanElement;
const consoleText = document.getElementById("console-text") as HTMLSpanElement;
const consoleIdle = document.getElementById("console-idle") as HTMLDivElement;

export type ConsoleSystem = {
  show(): void;
  hide(): void;
  idle(): Promise<void>;
  wait(timeout: number): Promise<void>;
  setTitle(title: string): void;
  setText(text: string): Animation[];
  setIdle(show: boolean): void;
  clean(): void;
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
    consolePage.classList.add("show");
  },
  hide() {
    consolePage.classList.remove("show");
  },
  async idle() {
    this.setIdle(true);
    const { clicked } = registerConsoleClicked();
    await clicked;
    this.setIdle(false);
  },
  wait(timeout: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, timeout));
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
  setIdle(show: boolean) {
    if (show) consoleIdle.classList.add("show");
    else consoleIdle.classList.remove("show");
  },
  clean() {
    this.setTitle("");
    this.setText("");
    this.hide();
  },
};

export function prepareConsole() {
  consoleSystem.setTitle("");
  consoleSystem.setText("");
  consoleSystem.setIdle(false);
  consoleSystem.hide();
}
