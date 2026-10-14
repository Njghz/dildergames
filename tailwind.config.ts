import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        13: "3.25rem",
      },
      colors: {
        nexus: {
          950: "#07070d",
          900: "#0b0b14",
          850: "#10101c",
          800: "#151524",
          700: "#1d1d30",
          600: "#2a2a42",
          500: "#3d3d5c",
          violet: {
            400: "#a78bfa",
            500: "#8b5cf6",
            600: "#7c3aed",
          },
          blue: {
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#2563eb",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
