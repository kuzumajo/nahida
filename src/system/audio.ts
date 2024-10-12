const bgm = new Audio();

export const audioSystem = {
  playBgm(src: string) {
    if (src == bgm.src) {
      return;
    }
    bgm.pause();
    bgm.src = src;
    bgm.addEventListener("canplay", () => bgm.play(), { once: true });
  },
};

export type AudioSystem = typeof audioSystem;
