import { Story } from "../story";
import { consoleSystem, ConsoleSystem } from "../system/console";
import { GameSave } from "./saves";

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

export async function startGame(ctx: GameContext, story: Story) {
  const generator = story(ctx);
  while (true) {
    const next = await generator.next();
    if (next.done) {
      if (next.value) {
        // TODO: goto next chapter
      } else {
        break;
      }
    } else {
      // TODO: perform next
    }
  }
}

export async function startGameFromSave(save: GameSave) {
  const ctx = createGameContext(save);
  // TODO
}

export async function startNewGame() {
  const ctx = createGameContext();
  // TODO
}
