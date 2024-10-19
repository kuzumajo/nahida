import { startFromChapter } from "./pages/game";
import { preloadResources } from "./pages/loading";
import { showMenu } from "./pages/menu";
import "./style.css";

addEventListener("contextmenu", (e) => e.preventDefault());

async function main() {
  await preloadResources([{ type: "image", src: "/menu-bg.jpg" }]);
  showMenu();
}

if (import.meta.env.DEV) {
  startFromChapter("chapter-3");
  // main()
}
// production
else {
  main();
}
