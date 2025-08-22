/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
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
        // Visual tokens
        "bavarian-blue": "#0E1623",
        "navy-ink": "#171922",
        parchment: "#F3E9D2",
        "gold-600": "#E3B341",
        "gold-200": "#F1D98A",
        "muted-ink": "#AAB0C0",
      },
      fontFamily: {
        fraktur: ["UnifrakturCook", "UnifrakturMaguntia", "serif"],
        sans: [
          "Inter",
          "system-ui",
          "Avenir",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
