import { Chapter } from "../utils/story";

export const entry = "start";

export const chapters = {
  start: { name: "序章", story: () => import("./prologue.md") },
  "chapter-1": { name: "第一章", story: () => import("./chapter-1.md") },
} satisfies Record<string, Chapter>;
