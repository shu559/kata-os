import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // KATA design tokens
        bg:        "#0a1120",
        "bg-2":    "#0c1424",
        surface:   "#111d31",
        "surface-2": "#16243c",
        navy:      "#13213a",
        gold:      "#d2ad6b",
        "gold-hi": "#ecc886",
        teal:      "#44c2ae",
        amber:     "#eaa642",
        dim:       "#93a2bc",
        faint:     "#5b6b86",
      },
      fontFamily: {
        sans: ["var(--font-zen)", "system-ui", "sans-serif"],
        mono: ["var(--font-jb)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
