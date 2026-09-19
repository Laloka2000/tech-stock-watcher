import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tp: {
          paper: "#F4E6D3",
          surf: "#FBF4E9",
          line: "#DDCBAE",
          ink: "#22261F",
          ink2: "#6B6355",
          ink3: "#A89A82",
          teal: "#1F6F5C",
          rust: "#AC4B2F",
          gold: "#B8862E",
        },
      },
      fontFamily: {
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["IBM Plex Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        ledger: "0 1px 0 0 rgba(34, 38, 31, 0.06)",
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
