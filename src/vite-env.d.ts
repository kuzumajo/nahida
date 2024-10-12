/// <reference types="vite/client" />

declare module "*.md" {
  const x: import("./story").Story;
  export default x;
}
