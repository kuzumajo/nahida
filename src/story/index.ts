import { GameContext } from "../pages/game";
import prologue from "./entry.md";

export type Story = (
  ctx: GameContext
) => AsyncGenerator<string, Story | void, void>;

export type Chapter = {
  name: string;
  story: Story;
};

export const chapters: Record<string, Chapter> = {
  start: {
    name: "序章",
    story: prologue,
  },
};
