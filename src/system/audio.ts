let bgm: HTMLAudioElement | null = null;
let vocal: HTMLAudioElement | null = null;

export const audioSystem = {
  currentBgm: "",
  playBgm(src: string) {
    if (src === this.currentBgm) {
      bgm?.play();
      return;
    }
    bgm?.pause();
    bgm = new Audio();
    bgm.src = src;
    bgm.loop = true;
    bgm.volume = 0.25;
    bgm.oncanplay = () => bgm?.play();
    this.currentBgm = src;
  },
  playVocal(src: string) {
    vocal?.pause();
    vocal = new Audio();
    vocal.src = src;
    vocal.oncanplay = () => vocal?.play();
  },
  reset() {
    bgm?.pause();
    vocal?.pause();
    this.currentBgm = "";
  },
};

export type AudioSystem = typeof audioSystem;
