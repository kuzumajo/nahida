import { Chapter } from "../utils/story";
import prologue from "./prologue.md";

export const entry = "start";

export const chapters: Record<string, Chapter> = {
  start: { name: "序章", story: prologue },
};
