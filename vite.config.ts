import { defineConfig } from "vite";
import markdownStory from "./src/vite/markdown-story";

export default defineConfig({
  plugins: [markdownStory()],
});
