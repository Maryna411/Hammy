import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FFF8EF",
        surface: "#FFFFFF",
        surface2: "#FDEEDB",
        border: "#F0DFC4",
        accent: "#6c5ce7",
        accent2: "#5B4FCF",
        high: "#DC2626",
        medium: "#B45309",
        low: "#15803D",
        muted: "#948A78",
        ink: "#2B1D0E",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
