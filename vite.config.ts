import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/mieczaki-tracker/",
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
