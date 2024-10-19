import { startFromChapter } from "./pages/game";
import { hideLoading, preloadResources } from "./pages/loading";
import { showMenu } from "./pages/menu";
import "./style.css";

addEventListener("contextmenu", (e) => e.preventDefault());

async function main() {
  await preloadResources([{ type: "image", src: "/menu-bg.jpg" }]);
  showMenu();
}

if (import.meta.env.DEV) {
  hideLoading();
  startFromChapter("prologue");
}
// production
else {
  main();
}
