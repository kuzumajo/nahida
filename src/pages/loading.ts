import { loadingPage } from "../elements";
import { wait } from "../utils/animations";

const loadingText = document.getElementById("loading-text") as HTMLSpanElement;

type LoadingTask = {
  type: "image" | "audio";
  src: string;
};

function updateLoadingText(now: number, total: number) {
  loadingText.textContent = `(${now}/${total})`;
}

export function showLoading() {
  loadingPage.classList.remove("hide");
}

export function hideLoading() {
  loadingPage.classList.add("hide");
}

export async function preloadResources(tasks: LoadingTask[]) {
  let finished = 0;

  await Promise.all(
    tasks.map(async (x) => {
      if (x.type === "image") {
        await new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.src = x.src;
          image.onload = () => resolve();
          image.onerror = (e) => reject(e);
        });
      } else if (x.type === "audio") {
        await new Promise<void>((resolve, reject) => {
          const audio = new Audio();
          audio.src = x.src;
          audio.onload = () => resolve();
          audio.onerror = (e) => reject(e);
        });
      }
      updateLoadingText(++finished, tasks.length);
    })
  );
  await wait(1000);

  hideLoading();
}

const loaded = new Map<string, string>();

export async function manuallyLoadResources(resources: string[]) {
  const notloaded = resources.filter((x) => !loaded.has(x));

  if (notloaded.length > 0) {
    showLoading();
    let finished = resources.length - notloaded.length;
    updateLoadingText(finished, resources.length);
    await Promise.all(
      notloaded.map(async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        loaded.set(url, URL.createObjectURL(blob));
        updateLoadingText(++finished, resources.length);
      })
    );
    hideLoading();
  }

  return resources.map((x) => loaded.get(x)!);
}

// export async function revokeResources(urls: string[]) {
//   for (const url of urls) {
//     URL.revokeObjectURL(url);
//   }
// }
