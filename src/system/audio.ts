let bgm = new Audio();

export const audioSystem = {
  playBgm(src: string) {
    if (src == bgm.src) {
      return;
    }
    bgm.pause();
    bgm = new Audio();
    bgm.src = src;
    bgm.oncanplay = () => bgm.play();
  },
};

export type AudioSystem = typeof audioSystem;
