const BGM_VOLUME = 0.25;
const VOICE_VOLUME = 1.0;
const SFX_VOLUME = 1.0;

export class AudioSystem {
  #bgm: HTMLAudioElement | null = null;
  #voice: HTMLAudioElement | null = null;
  #currentBgm = "";

  pauseBgm() {
    if (this.#bgm && !this.#bgm.paused) {
      const audio = this.#bgm;
      audio.pause();
    }
  }

  playBgm(src: string) {
    if (src === this.#currentBgm && this.#bgm) {
      this.#bgm.volume = BGM_VOLUME;
      this.#bgm.play();
      return;
    }
    this.pauseBgm();
    const audio = new Audio();
    audio.src = src;
    audio.loop = true;
    audio.volume = BGM_VOLUME;
    audio.oncanplay = () => audio.play();
    this.#bgm = audio;
    this.#currentBgm = src;
  }

  playVoice(src: string) {
    this.#voice?.pause();
    const audio = new Audio();
    audio.src = src;
    audio.volume = VOICE_VOLUME;
    audio.oncanplay = () => audio.play();
    this.#voice = audio;
  }

  playSfx(src: string) {
    const audio = new Audio();
    audio.src = src;
    audio.volume = SFX_VOLUME;
    audio.oncanplay = () => audio.play();
  }

  reset() {
    this.#bgm?.pause();
    this.#voice?.pause();
    this.#currentBgm = "";
  }
}
