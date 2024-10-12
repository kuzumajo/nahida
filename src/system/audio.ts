let bgm = new Audio();

export const audioSystem = {
  currentBgm: "",
  playBgm(src: string) {
    if (src === this.currentBgm) {
      return;
    }
    bgm.pause();
    bgm = new Audio();
    bgm.src = src;
    bgm.loop = true;
    bgm.oncanplay = () => bgm.play();
  },
};

export type AudioSystem = typeof audioSystem;
