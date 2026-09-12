import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-cyan": "#0099CC",
        "brand-cyan-700": "#007AA3",
        "brand-magenta": "#EE2C70",
        "brand-magenta-700": "#C51F59",
        canvas: "#F6F9FB",
        "surface-muted": "#EEF4F7",
        "text-primary": "#16324F",
        "text-secondary": "#526575",
        border: "#D7E2E8",
        "focus-ring": "#006F98",
        success: "#16803C",
        danger: "#B42318",
      },
      fontFamily: {
        sans: ["Foco", "Arial", "Helvetica", "sans-serif"],
      },
      borderRadius: {
        control: "8px",
        card: "12px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgb(22 50 79 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
