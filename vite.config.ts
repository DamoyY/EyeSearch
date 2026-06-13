import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const reactCompiler = reactCompilerPreset();

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompiler] })],
  build: {
    rollupOptions: {
      checks: {
        pluginTimings: false,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
