/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/App.jsx",
    "./src/CategoryFormModal.jsx",
    "./src/CategorySection.jsx",
    "./src/FoodCard.jsx",
    "./src/FoodFormModal.jsx",
    "./src/FoodImage.jsx",
    "./src/Footer.jsx",
    "./src/Header.jsx",
    "./src/HeroSection.jsx",
    "./src/Logo.jsx",
    "./src/Modal.jsx",
    "./src/ViewFoodModal.jsx",
    "./src/OrderSideBar.jsx",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Cairo", "system-ui", "sans-serif"],
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
        cream: "#faf8f3",
        charcoal: "#2d2d2d",
        "dark-bg": "#1a1a1a",
        "dark-surface": "#2d2d2d",
        "dark-card": "#3a3a3a",
      },
    },
  },
  plugins: [],
};
