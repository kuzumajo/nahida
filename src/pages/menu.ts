import { menuPage } from "../elements";
import { startGameFromSave, startNewGame } from "./game";
import { hasSave, loadSave } from "../utils/saves";
import { showSettings } from "./settings";
import { wait } from "../utils/animations";

const continueButton = document.getElementById(
  "menu-continue"
) as HTMLButtonElement;
const newButton = document.getElementById("menu-new") as HTMLButtonElement;
const settingsButton = document.getElementById(
  "menu-settings"
) as HTMLButtonElement;
const staffButton = document.getElementById("menu-staff") as HTMLButtonElement;
const quitButton = document.getElementById("menu-quit") as HTMLButtonElement;

export function showMenu() {
  continueButton.disabled = !hasSave("auto");
  menuPage.classList.remove("hide");
  menuPage.classList.add("show");
  return wait(6000);
}

export function hideMenu() {
  menuPage.classList.remove("show");
  menuPage.classList.add("hide");
  return wait(2000);
}

continueButton.addEventListener("click", () => {
  const auto = loadSave("auto");
  hideMenu();
  startGameFromSave(auto);
});

newButton.addEventListener("click", () => {
  hideMenu();
  startNewGame();
});

settingsButton.addEventListener("click", () => {
  showSettings();
});

staffButton.addEventListener("click", () => {
  alert("Made By You.");
});

quitButton.addEventListener("click", () => {
  alert("你可以自己关闭标签页");
});
