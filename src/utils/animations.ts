import { registerSkippable } from "../system/console";
import { app } from "./pixi";

export type Skippable = {
  finished: Promise<void>;
  finish(): void;
};

export function convertToSkippable(animations: Skippable[]): Skippable {
  return {
    finished: Promise.all(
      animations.map((x) => x.finished)
    ) as Promise<unknown> as Promise<void>,
    finish() {
      animations.forEach((x) => x.finish());
    },
  };
}

type CurrentAnimation = {
  skip: boolean;
  duration: number;
  startTime: number;
  callback: (x: number) => void;
  onfinish: () => void;
};

const animations = new Set<CurrentAnimation>();

export function createAnimation(
  callback: (x: number) => void,
  duration: number
): Skippable {
  let resolve: () => void;
  const finished = new Promise<void>((resolve_) => (resolve = resolve_));

  const animation: CurrentAnimation = {
    skip: false,
    callback,
    duration: duration,
    startTime: Date.now(),
    onfinish() {
      resolve && resolve();
    },
  };
  animations.add(animation);
  callback(0);

  return {
    finished,
    finish() {
      animation.skip = true;
    },
  };
}

export async function waitOrSkip(skippable: Skippable) {
  registerSkippable(skippable);
  await skippable.finished;
}

export function wait(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export function idle(): Skippable {
  let resolve: () => void;
  const finished = new Promise<void>((resolve_) => (resolve = resolve_));
  return {
    finished,
    finish() {
      resolve && resolve();
    },
  };
}

export function skippableWait(timeout: number): Skippable {
  let resolve: void | (() => void);
  const finished = new Promise<void>((resolve_) => (resolve = resolve_));
  const finish = () => resolve && (resolve = resolve());
  setTimeout(finish, timeout);
  return { finished, finish };
}

export function empty(): Skippable {
  return { finished: Promise.resolve(), finish() {} };
}

app.ticker.add(() => {
  const now = Date.now();
  for (const animation of [...animations]) {
    const current = animation.skip
      ? 1
      : Math.min(1, (now - animation.startTime) / animation.duration);
    animation.callback(current);
    if (current === 1) {
      animations.delete(animation);
      animation.onfinish();
    }
  }
});
