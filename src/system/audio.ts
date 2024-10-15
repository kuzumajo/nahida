export class AudioSystem {
  #bgm: HTMLAudioElement | null = null;
  #vocal: HTMLAudioElement | null = null;
  #currentBgm = "";

  playBgm(src: string) {
    if (src === this.#currentBgm) {
      this.#bgm?.play();
      return;
    }
    this.#bgm?.pause();
    this.#bgm = new Audio();
    this.#bgm.src = src;
    this.#bgm.loop = true;
    this.#bgm.volume = 0.25;
    this.#bgm.oncanplay = () => this.#bgm?.play();
    this.#currentBgm = src;
  }

  playVocal(src: string) {
    this.#vocal?.pause();
    this.#vocal = new Audio();
    this.#vocal.src = src;
    this.#vocal.oncanplay = () => this.#vocal?.play();
  }

  reset() {
    this.#bgm?.pause();
    this.#vocal?.pause();
    this.#currentBgm = "";
  }
}
