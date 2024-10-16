import { consolePage } from "../elements";
import { convertToSkippable, empty, Skippable } from "../utils/animations";

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
      consoleText.style.animation = "none";
      void consoleText.offsetHeight;
      consoleText.style.animation = "";
      consoleText.style.animationDuration = `${text.length * TEXT_SPEED}ms`;
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
