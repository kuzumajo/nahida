import { app, settingsPage } from "../elements";

const fullscreenCheckbox = document.getElementById(
  "fullscreen-checkbox"
) as HTMLInputElement;

function requestFullscreen() {
  if (!document.fullscreenElement) app.requestFullscreen();
}

function exitFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
}

export function showSettings() {
  settingsPage.classList.remove("hide");
  settingsPage.classList.add("show");
}

function hideSettings() {
  settingsPage.classList.remove("show");
  settingsPage.classList.add("hide");
}

settingsPage.addEventListener("mousedown", (e) => {
  if (e.button === 2) {
    // right click
    hideSettings();
  }
});

fullscreenCheckbox.addEventListener("change", (e) => {
  if (fullscreenCheckbox.checked) {
    requestFullscreen();
  } else {
    exitFullscreen();
  }
});
