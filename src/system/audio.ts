import { createAnimation } from "../utils/animations";

const BGM_VOLUME = 0.25;
const VOICE_VOLUME = 1.0;
const SFX_VOLUME = 1.0;

export class AudioSystem {
  #bgm: HTMLAudioElement | null = null;
  #voice: HTMLAudioElement | null = null;
  #currentBgm = "";

  async pauseBgm() {
    if (this.#bgm && !this.#bgm.paused) {
      const audio = this.#bgm;
      const animation = createAnimation(
        (x) => (audio.volume = BGM_VOLUME * (1 - x)),
        500
      );
      await animation.finished;
      audio.pause();
    }
  }

  async playBgm(src: string) {
    if (src === this.#currentBgm) {
      this.#bgm?.play();
      return;
    }
    await this.pauseBgm();
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
