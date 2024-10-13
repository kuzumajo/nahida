import { preloadResources } from "./pages/loading";
import { showMenu } from "./pages/menu";
import "./style.css";

addEventListener("contextmenu", (e) => e.preventDefault());

preloadResources([{ type: "image", src: "/menu-bg.jpg" }]).then(() => {
  showMenu();
});
