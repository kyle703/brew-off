/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        paper: "var(--paper)",
        sheet: "var(--sheet)",
        accent: "var(--accent)",
        brass: "var(--brass)",
        muted: "var(--muted)",
        rule: "var(--rule)",
        navy: {
          950: "#0f172a",
          900: "#0E1623",
          800: "#1e2d4a",
        },
        amber: {
          500: "#f59e0b",
          400: "#fbbf24",
        },
        cream: {
          100: "#fef3c7",
          200: "#f5f5dc",
        },
        parchment: "#F3E9D2",
        "gold-600": "#E3B341",
        "gold-200": "#F1D98A",
      },
      fontFamily: {
        display: ["var(--font-display)", "Palatino", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        fraktur: ["UnifrakturCook", "UnifrakturMaguntia", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
