import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import cyan from "@park-ui/panda-preset/colors/cyan";
import slate from "@park-ui/panda-preset/colors/slate";

export default defineConfig({
  presets: [
    createPreset({
      accentColor: cyan,
      grayColor: slate,
      radius: "xl",
    }),
  ],
  preflight: true,
  include: ["./src/**/*.{ts,tsx}"],
  exclude: [],
  jsxFramework: "react",
  globalCss: {
    "html, body, #root": {
      minH: "100vh",
      m: "0",
      bg: "black",
    },
    body: {
      overflowX: "hidden",
      color: "white",
    },
  },
  theme: {
    extend: {
      tokens: {
        fonts: {
          body: {
            value:
              '"LXGW WenKai", "Microsoft YaHei UI", "Noto Sans CJK SC", sans-serif',
          },
          display: {
            value: '"FangSong", "STSong", "Georgia", serif',
          },
          mono: {
            value: '"Cascadia Code", "JetBrains Mono", monospace',
          },
        },
        colors: {
          observatory: {
            deep: { value: "#031015" },
            glass: { value: "rgba(8, 35, 43, 0.72)" },
            beam: { value: "#42f7ff" },
            ember: { value: "#ffb454" },
          },
        },
      },
    },
  },
  outdir: "styled-system",
});
