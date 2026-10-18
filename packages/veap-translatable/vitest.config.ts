import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    globals: false,
    server: {
      deps: {
        inline: [/@veap\//],
      },
    },
  },
});
