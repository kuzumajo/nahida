import { defineConfig } from "vite";
import markdownStory from "./src/vite/markdown-story";

export default defineConfig({
  plugins: [markdownStory()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/c-[hash].js",
        chunkFileNames: "assets/c-[hash].js",
        assetFileNames: "assets/a-[hash].[ext]",
      },
    },
  },
});
