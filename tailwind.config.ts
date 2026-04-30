import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts, tsx}",
    "./components/**/*.{ts, tsx}",
    "./hooks/**/*.{ts, tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tp: {
          bg: "#070c09",
          surf: "#0d1510",
          card: "#111a12",
          border: "#1c2a1e",
          primary: "#e8f2e8",
          sec: "#7a9c7e",
          muted: "#3d5040",
          accent: "#00e68e",
          red: "#ff5252",
          yellow: "f0c040",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Space Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "accent-glow": "0 0 12px rgba(0, 230, 142, 0.4)",
        "red-glow": "0 0 12px rgba(255, 82, 82, 0.4)",
      },
      keyframes: {
        pulse: {
          "0%, 100%": {opacity: "1"},
          "50%": {opacity: "0.5"},
        },
        "slide-in": {
          from: {opacity: "0", transform: "translateY(8px)"},
          to: {opacity: "1", transform: "translateY(0)"},
        },
        shimmer: {
          "0%": {backgroundPosition: "-200% 0"},
          "100%": {backgroundPosition: "200% 0"},
        }
      },
      animation: {
        pulse: "pulse 1.4s ease-in-out infinite",
        "slide-in": "slide-in 0.5s ease-in-out",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
