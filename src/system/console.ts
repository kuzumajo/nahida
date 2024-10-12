import { consolePage } from "../elements";

const consoleTitle = document.getElementById("console-title") as HTMLDivElement;
const consoleText = document.getElementById("console-text") as HTMLDivElement;
const consoleIdle = document.getElementById("console-idle") as HTMLDivElement;

export type ConsoleSystem = {
  show(): void;
  hide(): void;
  wait(timeout: number): Promise<void>;
  setTitle(title: string): void;
  setText(text: string): void;
  setIdle(show: boolean): void;
};

export const consoleSystem: ConsoleSystem = {
  show() {
    consolePage.classList.add("show");
  },
  hide() {
    consolePage.classList.remove("show");
  },
  wait(timeout: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, timeout));
  },
  setTitle(title: string) {
    consoleTitle.textContent = title;
  },
  setText(text: string) {
    consoleText.textContent = text;
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
  consoleSystem.hide()
}
