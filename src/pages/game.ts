import { chapters } from "../story";
import { consoleSystem, ConsoleSystem } from "../system/console";
import { waitOrSkip } from "../utils/animations";
import { GameSave } from "../utils/saves";
import { showMenu } from "./menu";

export type GameContext = {
  console: ConsoleSystem;
  data: any;
  chapter: string;
};

function createGameContext(save?: GameSave): GameContext {
  return {
    console: consoleSystem,
    data: save?.data ?? {},
    chapter: save?.chapter ?? "start",
  };
}

export async function startGame(ctx: GameContext) {
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
