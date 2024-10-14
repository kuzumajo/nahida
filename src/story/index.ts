import { Chapter } from "../utils/story";

export const entry = "start";

export const chapters: Record<string, Chapter> = {
  start: { name: "序章", story: () => import("./prologue.md") },
};
