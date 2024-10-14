import { GameContext } from "../pages/game";
import { Skippable } from "./animations";

export type Story = (
  ctx: GameContext
) => AsyncGenerator<Skippable | Promise<void>, string | void, void>;

export type Chapter = {
  name: string;
  story: () => Promise<{ default: Story }>;
};
