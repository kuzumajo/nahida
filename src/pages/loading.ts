import { Spine } from "pixi-spine";
import { loadingPage } from "../elements";
import { wait } from "../utils/animations";
import { spines as spinesLoaders } from "../story/spines";

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

const loadedResources = new Map<string, string>();
const loadedSpines = new Map<string, Spine>();

export async function manuallyLoadResources(
  resources: string[],
  spines: string[]
) {
  const notloadedResources = resources.filter((x) => !loadedResources.has(x));
  const notloadedSpines = spines.filter((x) => !loadedSpines.has(x));

  const total = resources.length + spines.length;
  let finished = total - notloadedResources.length - notloadedSpines.length;

  if (finished < total) {
    showLoading();
    updateLoadingText(finished, total);
    await Promise.all([
      ...notloadedResources.map(async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        loadedResources.set(url, URL.createObjectURL(blob));
        updateLoadingText(++finished, total);
      }),
      ...notloadedSpines.map(async (name) => {
        if (!(name in spinesLoaders))
          throw new TypeError(
            `${name} is not found in spines: ${Object.keys(spinesLoaders)}`
          );
        const spine = await spinesLoaders[name as keyof typeof spinesLoaders]();
        loadedSpines.set(name, spine);
        updateLoadingText(++finished, total);
      }),
    ]);
    hideLoading();
  }

  return [
    resources.map((x) => loadedResources.get(x)!),
    spines.map((x) => loadedSpines.get(x)!),
  ] as [string[], Spine[]];
}

// export async function revokeResources(urls: string[]) {
//   for (const url of urls) {
//     URL.revokeObjectURL(url);
//   }
// }
