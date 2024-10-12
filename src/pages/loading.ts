import { loadingPage } from "../elements";

const loadingText = document.getElementById("loading-text") as HTMLSpanElement;

type LoadingTask = {
  type: "image" | "audio";
  src: string;
};

const loadingTasks: LoadingTask[] = [
  { type: "image", src: "" },
  { type: "image", src: "" },
  { type: "image", src: "" },
  { type: "image", src: "" },
  { type: "image", src: "" },
  { type: "image", src: "" },
  { type: "image", src: "" },
  { type: "image", src: "" },
];
let finished = 0;

function updateLoadingText() {
  loadingText.textContent = `(${finished}/${loadingTasks.length})`;
}

export async function loadResources() {
  await Promise.all(
    loadingTasks.map(async (x) => {
      if (!x.src) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 1000 + 1000)
        );
      } else if (x.type === "image") {
        await new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.src = x.src;
          image.onload = () => resolve();
          image.onerror = (e) => reject(e);
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          const audio = new Audio();
          audio.src = x.src;
          audio.onload = () => resolve();
          audio.onerror = (e) => reject(e);
        });
      }
      finished++;
      updateLoadingText();
    })
  );
}

export function hideLoading() {
  loadingPage.classList.add("hide");
}
