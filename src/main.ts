import { hideLoading, loadResources } from "./pages/loading";
import { showMenu } from "./pages/menu";
import "./style.css";

addEventListener("contextmenu", (e) => e.preventDefault());

await loadResources();
hideLoading();
showMenu();
