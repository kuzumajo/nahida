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
  clean() {
    bgm.fastSeek(0);
    bgm.pause();
  },
};

export type AudioSystem = typeof audioSystem;
