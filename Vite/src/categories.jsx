import CategoryJsonData from "./categories.json";

const categories = (() => {
  const el = document.getElementById("categories-data");

  try {
    const data = el ? JSON.parse(el.textContent) : CategoryJsonData;

    return data;
  } catch (e) {
    return CategoryJsonData;
  }
})();

// Helper function to get category name based on language
export const getCategoryName = (category, lang) => {
  if (lang === "ar") {
    return category.name_ar;
  }
  return category.name;
};

export default categories;
