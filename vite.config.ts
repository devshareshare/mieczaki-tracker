import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    port: 8080,
    host: true,
  },
  preview: {
    port: 8080,
    host: true,
  },
  test: {
    environment: "jsdom",
  },
});
