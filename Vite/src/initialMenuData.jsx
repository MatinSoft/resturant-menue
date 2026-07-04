import FoodJsonData from "./foods.json";

const initialMenuData = (() => {
  const el = document.getElementById("menu-data");
  try {
    console.log("salam dadash chetori");
    return el ? JSON.parse(el.textContent) : FoodJsonData;
  } catch (e) {
    console.log(e);
    return FoodJsonData;
  }
})();

// Helper function to get food data in the correct language
// Helper function to get food data in the correct language
export const getLocalizedFood = (food, lang = "en") => {
  if (lang === "ar") {
    return {
      ...food,
      name: food.name_ar || food.name,
      description: food.description_ar || food.description,
      ingredients: food.ingredients_ar || food.ingredients,
      category: food.category_ar || food.category,
      // final_price رو هم حفظ کن
      final_price: food.final_price,
    };
  }
  return {
    ...food,
    name: food.name,
    description: food.description,
    ingredients: food.ingredients,
    category: food.category,
    // final_price رو هم حفظ کن
    final_price: food.final_price,
  };
};
export default initialMenuData;
