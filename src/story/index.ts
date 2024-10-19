import { Chapter } from "../utils/story";

export const entry: keyof typeof chapters = "prologue";

export const chapters = {
  prologue: { name: "引导", story: () => import("./prologue.md") },
  "chapter-0": { name: "序章", story: () => import("./chapter-0.md") },
  "chapter-1": { name: "第一章", story: () => import("./chapter-1.md") },
  "chapter-2": { name: "第二章", story: () => import("./chapter-2.md") },
  "chapter-3": { name: "第三章", story: () => import("./chapter-3.md") },
} satisfies Record<string, Chapter>;
