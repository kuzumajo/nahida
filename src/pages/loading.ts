import { loadingPage, loadingText } from "../elements";

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
  // mock loading
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  await Promise.all(
    loadingTasks.map(async (x) => {
      if (x.type === "image") {
        if (x.src) {
          return new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.src = x.src;
            image.onload = () => resolve();
            image.onerror = (e) => reject(e);
          });
        } else {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 1000 + 1000)
          );
        }
      } else {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 1000 + 1000)
        );
      }
      finished++;
      updateLoadingText();
    })
  );
}

export function hideLoading() {
  loadingPage.classList.add("hide");
}
