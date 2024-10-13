import { Skippable } from "../utils/animations";

let bgm = new Audio();

export const audioSystem = {
  currentBgm: "",
  playBgm(src: string) {
    if (src === this.currentBgm) {
      bgm.play();
      return;
    }
    bgm.pause();
    bgm = new Audio();
    bgm.src = src;
    bgm.loop = true;
    bgm.oncanplay = () => bgm.play();
    this.currentBgm = src;
  },
  playVocal(src: string): Skippable {
    let resolve: () => void;
    const finished = new Promise<void>((resolve_) => (resolve = resolve_));
    const vocal = new Audio();
    vocal.src = src;
    vocal.oncanplay = () => vocal.play();
    vocal.onended = () => resolve && resolve();
    return {
      finished,
      finish() {
        vocal.currentTime = Infinity;
      },
    };
  },
  clean() {
    bgm.currentTime = 0;
    bgm.pause();
  },
};

export type AudioSystem = typeof audioSystem;
