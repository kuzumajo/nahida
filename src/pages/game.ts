import { chapters } from "../story";
import { AudioSystem, audioSystem } from "../system/audio";
import { BackgroundSystem, bgSystem } from "../system/canvas";
import { consoleSystem, ConsoleSystem } from "../system/console";
import { convertToSkippable, Skippable, waitOrSkip } from "../utils/animations";
import { GameSave } from "../utils/saves";
import { showMenu } from "./menu";

export type GameContext = {
  console: ConsoleSystem;
  audio: AudioSystem;
  bg: BackgroundSystem;
  data: any;
  chapter: string;
  merge(...skippables: Skippable[]): Skippable;
};

function createGameContext(save?: GameSave): GameContext {
  return {
    console: consoleSystem,
    audio: audioSystem,
    bg: bgSystem,
    data: save?.data ?? {},
    chapter: save?.chapter ?? "start",
    merge(...skippables) {
      return convertToSkippable(skippables);
    },
  };
}

export async function startGame(ctx: GameContext) {
  ctx.audio.clean();
  ctx.bg.clean();
  ctx.console.clean();

  const story = getChapter(ctx.chapter).story;
  let generator = story(ctx);
  while (true) {
    const next = await generator.next();
    if (next.done) {
      if (next.value) {
        generator = getChapter(next.value).story(ctx);
      } else {
        break;
      }
    } else {
      const skippable = await next.value;
      if (skippable) {
        await waitOrSkip(skippable);
      }
    }
  }

  // the game is over!
  showMenu();
}

export function startGameFromSave(save: GameSave) {
  startGame(createGameContext(save));
}

export function startNewGame() {
  startGame(createGameContext());
}

function getChapter(id: string) {
  if (!chapters[id]) {
    throw new Error(`Cannot find chapter ${id}`);
  }
  return chapters[id];
}
