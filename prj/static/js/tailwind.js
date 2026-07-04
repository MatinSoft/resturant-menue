import tailwind from "tailwindcss";

tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["Cairo", "sans-serif"],
        sans: ["Cairo", "sans-serif"],
      },
      colors: {
        gold: {
          50: "#fdfcf7",
          100: "#f9f5e8",
          200: "#f1e6c5",
          300: "#e8d49d",
          400: "#dbb86d",
          500: "#c9a047",
          600: "#b8893a",
          700: "#996b31",
          800: "#7c562c",
          900: "#664728",
        },
        cream: "#e6cbb6",
        charcoal: "#1d312f",
        "dark-bg": "#1a1a1a",
        "dark-surface": "#1d312f",
        "dark-card": "#3a3a3a",
      },
    },
  },
};
