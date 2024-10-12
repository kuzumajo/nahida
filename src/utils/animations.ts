import { registerConsoleClicked } from "../system/console";

export type Skippable = {
  finished: Promise<void>;
  finish(): void;
};

export function convertToSkippable(animations: Animation[]): Skippable {
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
  timing: (x: number) => number;
  duration: number;
  startTime: number;
  callback: (x: number) => void;
  onfinish: () => void;
};

const animations = new Set<CurrentAnimation>();

export function createAnimation(
  callback: (x: number) => void,
  options: {
    timing: (x: number) => number;
    duration: number;
  }
): Skippable {
  let resolve: () => void;
  const finished = new Promise<void>((resolve_) => (resolve = resolve_));

  const animation: CurrentAnimation = {
    skip: false,
    callback,
    timing: options.timing,
    duration: options.duration,
    startTime: Date.now(),
    onfinish() {
      resolve && resolve();
    },
  };
  animations.add(animation);

  return {
    finished,
    finish() {
      animation.skip = true;
    },
  };
}

export async function waitOrSkip(skippable: Skippable) {
  const { clicked, ctrl } = registerConsoleClicked();

  try {
    await Promise.race([skippable.finished, clicked]);
  } finally {
    ctrl.abort();
    skippable.finish();
  }
}

export function wait(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

requestAnimationFrame(function animate() {
  requestAnimationFrame(animate);

  const shouldRemove = [] as CurrentAnimation[];

  const now = Date.now();
  for (const animation of animations) {
    const current = animation.skip
      ? 1
      : Math.min(1, (now - animation.startTime) / animation.duration);
    animation.callback(current);
    if (current === 1) shouldRemove.push(animation);
  }

  for (const remove of shouldRemove) {
    animations.delete(remove);
    remove.onfinish();
  }
});
