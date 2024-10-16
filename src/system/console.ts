import { consolePage } from "../elements";
import { createAnimation, empty, Skippable } from "../utils/animations";

const consoleTitle = document.getElementById(
  "console-title"
) as HTMLSpanElement;
const consoleText = document.getElementById("console-text") as HTMLSpanElement;
const consoleIdle = document.getElementById("console-idle") as HTMLDivElement;

const skippables = new Set<Skippable>();

export function registerSkippable(skippable: Skippable) {
  skippables.add(skippable);
  skippable.finished.then(() => skippables.delete(skippable));
}

consolePage.addEventListener("click", () => {
  const skips = [...skippables];
  for (const skip of skips) skip.finish();
});

const TEXT_SPEED = 30;

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
      return createAnimation((x) => {
        consoleText.style.backgroundSize = `${x * 100}% 100%, 3rem 100%`;
        consoleText.style.backgroundPosition = `0 0, calc((100% + 3rem) * ${x}) 0`;
      }, text.length * TEXT_SPEED);
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
