import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/mieczaki-tracker/",
  test: {
    environment: "jsdom",
  },
});
