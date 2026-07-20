import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f1117",
        surface: "#171a23",
        surface2: "#1f2330",
        border: "#2a2f3d",
        accent: "#6c5ce7",
        accent2: "#a29bfe",
        high: "#ef4444",
        medium: "#f59e0b",
        low: "#22c55e",
        muted: "#8b8fa3",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
