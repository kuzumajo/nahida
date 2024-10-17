import { Spine } from "pixi-spine";
import { chapters, entry } from "../story";
import { AudioSystem } from "../system/audio";
import { SpineSystem } from "../system/spine";
import { CanvasSystem } from "../system/canvas";
import { ConsoleSystem } from "../system/console";
import {
  idle,
  Skippable,
  skippableWait,
  waitOrSkip,
} from "../utils/animations";
import { deleteSave, GameSave, saveSave } from "../utils/saves";
import { manuallyLoadResources } from "./loading";
import { showMenu } from "./menu";

export type Command = {
  /** background */
  b?: {
    /** source */
    s: string;
    /** animations */
    a?: string;
    /** transitions */
    t?: string;
  };
  /** BGM */
  m?: string;
  /** voice */
  v?: string;
  /** Sound Effects */
  x?: string[];
  /** texts */
  t?: {
    /** text */
    t: string;
    /** title */
    l?: string;
  };
  /** figures */
  f?: {
    /** model */
    m: Spine;
    /** animation */
    a?: string;
    /** transition */
    t?: string;
  }[];
};

export const system = {
  audio: new AudioSystem(),
  spine: new SpineSystem(),
  canvas: new CanvasSystem(),
  console: new ConsoleSystem(),
};

export type GameContext = {
  sys: typeof system;
  data: any;
  chapter: string;
  selection: number;
  load(sources: string[], spines: string[]): Promise<[string[], Spine[]]>;
  wait(timeout: number): Skippable;
  exec(command: Command): Skippable;
  select(selections: string[]): Promise<void>;
};

function createGameContext(chapter: string, data: any): GameContext {
  return {
    sys: system,
    data,
    chapter,
    selection: 0,
    async load(sources, spines) {
      return await manuallyLoadResources(sources, spines);
    },
    wait(timeout) {
      this.sys.console.hide();
      return skippableWait(timeout);
    },
    async select(selections: string[]) {
      this.selection = await this.sys.console.select(selections);
    },
    exec(c) {
      const skips = [] as Skippable[];
      let skip: Skippable | null = null;

      // switch BGM
      if (c.m) this.sys.audio.playBgm(c.m);
      // play voice
      if (c.v) this.sys.audio.playVoice(c.v);
      // play sound effects
      if (c.x) for (const x of c.x) this.sys.audio.playSfx(x);

      // change background
      if (c.b)
        skips.push(this.sys.canvas.changeBackground(c.b.s, c.b.a, c.b.t));

      // create / move figures
      if (c.f) {
        for (const f of c.f) {
          skips.push(this.sys.spine.updateSpine(f.m, f.a, f.t));
        }
      }

      // show text
      if (c.t) {
        this.sys.console.show();
        skip = this.sys.console.text(c.t.t, c.t.l);
        skip.finished.then(() => this.sys.console.idle(!(skip = null)));
        const click = idle();
        skips.push(click);
        click.finished.then(() => this.sys.console.idle(false));
      } else {
        this.sys.console.hide();
      }

      return {
        finished: Promise.all([
          skip ? skip.finished : Promise.resolve(),
          ...skips.map((x) => x.finished),
        ]) as Promise<unknown> as Promise<void>,
        finish() {
          if (skip) skip.finish();
          else skips.forEach((s) => s.finish());
        },
      };
    },
  };
}

export async function startGame(ctx: GameContext) {
  ctx.sys.spine.reset();
  ctx.sys.audio.reset();
  ctx.sys.canvas.reset();
  ctx.sys.console.reset();

  const story = (await getChapter(ctx.chapter).story()).default;
  let generator = story(ctx);
  while (true) {
    const next = await generator.next();
    if (next.done) {
      if (next.value) {
        // entering next chapter
        const chapter = getChapter(next.value);
        saveSave("auto", {
          chapter: next.value,
          data: ctx.data,
          save_time: Date.now(),
        });
        const story = (await chapter.story()).default;
        ctx.sys.spine.reset();
        ctx.sys.canvas.reset();
        // ctx.sys.audio.reset();
        // ctx.sys.console.reset();
        generator = story(ctx);
      } else {
        break;
      }
    } else {
      const skippable = await next.value;
      if (skippable) await waitOrSkip(skippable);
    }
  }

  // the game is over!
  deleteSave("auto");
  showMenu();
}

export function startGameFromSave(save: GameSave) {
  startGame(createGameContext(save.chapter, save.data));
}

export function startNewGame() {
  startGame(createGameContext(entry, {}));
}

export function startFromChapter(chapter: keyof typeof chapters) {
  startGame(createGameContext(chapter, {}));
}

function getChapter(id: string) {
  if (!(id in chapters)) {
    throw new Error(`Cannot find chapter ${id}`);
  }
  return chapters[id as keyof typeof chapters];
}
