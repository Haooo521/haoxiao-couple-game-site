import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fff8ed",
        candy: "#ff7eb6",
        lilac: "#c8a5ff",
        skysoft: "#9dd8ff",
        cocoa: "#5c3951"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(255, 126, 182, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
