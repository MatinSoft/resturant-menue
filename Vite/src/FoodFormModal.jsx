import Modal from "./Modal.jsx";
import React from "react";
const { useState, useEffect } = React;

const FoodFormModal = ({
  isOpen,
  isDark,
  food,
  categories,
  defaultCategory,
  onSave,
  onClose,
  t,
}) => {
  const [formData, setFormData] = useState(
    food || {
      name: "",
      name_ar: "",
      description: "",
      description_ar: "",
      price: "",
      final_price: "",
      category: defaultCategory || categories[0]?.name || "",
      ingredients: [],
      ingredients_ar: [],
      images: [],
    },
  );
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientArInput, setIngredientArInput] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  // Calculate discount percentage
  const calculateDiscount = () => {
    const price = parseFloat(formData.price);
    const finalPrice = parseFloat(formData.final_price);
    if (price && finalPrice && price > 0 && finalPrice < price) {
      const discount = ((price - finalPrice) / price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  useEffect(() => {
    if (food) {
      setFormData({
        ...food,
        name: food.name || "",
        name_ar: food.name_ar || "",
        description: food.description || "",
        description_ar: food.description_ar || "",
        price: food.price ? String(food.price) : "",
        final_price: food.final_price ? String(food.final_price) : "",
        category: food.category || defaultCategory || categories[0]?.name || "",
        ingredients: food.ingredients || [],
        ingredients_ar: food.ingredients_ar || [],
        images: food.images || [],
      });
      setExistingImages(food.images || []);
      setIngredientInput("");
      setIngredientArInput("");
      setNewImageFiles([]);
      setPreviewUrls([]);
      setRemovedImages([]);
    } else {
      setFormData({
        name: "",
        name_ar: "",
        description: "",
        description_ar: "",
        price: "",
        final_price: "",
        category: defaultCategory || categories[0]?.name || "",
        ingredients: [],
        ingredients_ar: [],
        images: [],
      });
      setExistingImages([]);
      setIngredientInput("");
      setIngredientArInput("");
      setNewImageFiles([]);
      setPreviewUrls([]);
      setRemovedImages([]);
    }
  }, [food, defaultCategory, categories]);

  // Handle price change
  const handlePriceChange = (value) => {
    setFormData({ ...formData, price: value });
  };

  // Handle final price change
  const handleFinalPriceChange = (value) => {
    setFormData({ ...formData, final_price: value });
  };

  const handleAddIngredient = (isArabic = false) => {
    if (isArabic) {
      if (ingredientArInput.trim()) {
        setFormData((prev) => ({
          ...prev,
          ingredients_ar: [...prev.ingredients_ar, ingredientArInput.trim()],
        }));
        setIngredientArInput("");
      }
    } else {
      if (ingredientInput.trim()) {
        setFormData((prev) => ({
          ...prev,
          ingredients: [...prev.ingredients, ingredientInput.trim()],
        }));
        setIngredientInput("");
      }
    }
  };

  const handleRemoveIngredient = (index, isArabic = false) => {
    if (isArabic) {
      setFormData((prev) => ({
        ...prev,
        ingredients_ar: prev.ingredients_ar.filter((_, i) => i !== index),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles((prev) => [...prev, ...files]);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index) => {
    const removedImage = existingImages[index];
    setRemovedImages((prev) => [...prev, removedImage]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // محاسبه درصد تخفیف از روی قیمت‌ها
    const price = parseFloat(formData.price) || 0;
    const finalPriceValue = parseFloat(formData.final_price) || 0;
    let discount = 0;

    if (price > 0 && finalPriceValue > 0 && finalPriceValue < price) {
      discount = Math.round(((price - finalPriceValue) / price) * 100);
    }

    const finalImages = [...existingImages];

    // ارسال مقادیر صحیح - هم final_price و هم discount رو می‌فرستیم
    const formDataWithDiscount = {
      ...formData,
      discount: discount,
      price: price,
      final_price: finalPriceValue > 0 ? finalPriceValue : price, // همیشه final_price رو بفرست
    };

    onSave(formDataWithDiscount, newImageFiles, removedImages, finalImages);
  };
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <Modal
      isOpen={isOpen}
      title={food ? t.admin.editFood : t.admin.addFood}
      isDark={isDark}
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="p-6 md:px-8 space-y-4 border-t border-gold-300"
      >
        {/* بخش تصاویر */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
          >
            {t.admin.images}
          </label>

          {/* نمایش تصاویر موجود */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p
                className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                {t.admin.currentImages}:
              </p>
              <div className="flex gap-2 flex-wrap">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`existing ${idx}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* نمایش تصاویر جدید + دکمه آپلود */}
          {previewUrls.length > 0 ? (
            <div className="mb-4">
              <p
                className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                {t.admin.newImages}:
              </p>
              <div className="flex gap-2">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group flex-shrink-0">
                    <img
                      src={url}
                      alt={`preview ${idx}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* دکمه آپلود کنار آخرین تصویر */}
                <div
                  className={`w-20 h-20 flex-shrink-0 flex items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-gold-500 hover:bg-gold-500/10 ${
                    isDark
                      ? "border-gold-700/50 text-gold-400 hover:text-gold-300"
                      : "border-gold-300 text-gold-600 hover:text-gold-500"
                  }`}
                  onClick={() =>
                    document.getElementById("image-upload").click()
                  }
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            /* اگر هیچ تصویر جدیدی نیست، فقط دکمه آپلود */
            <div className="mb-4">
              <div
                className={`w-20 h-20 flex items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-gold-500 hover:bg-gold-500/10 ${
                  isDark
                    ? "border-gold-700/50 text-gold-400 hover:text-gold-300"
                    : "border-gold-300 text-gold-600 hover:text-gold-500"
                }`}
                onClick={() => document.getElementById("image-upload").click()}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* input مخفی برای آپلود */}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddImages}
            className="hidden"
          />

          <p
            className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            {t.admin.imageHint}
          </p>
        </div>

        {/* English Name & Arabic Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
            >
              {t.admin.foodName} (English)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                isDark
                  ? "bg-dark-bg border-gold-700/30 text-white focus:border-gold-500 focus:ring-gold-500/20"
                  : "bg-white border-gold-200 text-charcoal focus:border-gold-500 focus:ring-gold-500/20"
              } focus:outline-none focus:ring-2`}
              required
              dir="ltr"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
            >
              {t.admin.foodName} (العربية)
            </label>
            <input
              type="text"
              value={formData.name_ar}
              onChange={(e) =>
                setFormData({ ...formData, name_ar: e.target.value })
              }
              className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                isDark
                  ? "bg-dark-bg border-gold-700/30 text-white focus:border-gold-500 focus:ring-gold-500/20"
                  : "bg-white border-gold-200 text-charcoal focus:border-gold-500 focus:ring-gold-500/20"
              } focus:outline-none focus:ring-2`}
              dir="rtl"
            />
          </div>
        </div>

        {/* انتخاب دسته‌بندی */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
          >
            {t.admin.selectCategory}
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
              isDark
                ? "bg-dark-bg border-gold-700/30 text-white focus:border-gold-500 focus:ring-gold-500/20"
                : "bg-white border-gold-200 text-charcoal focus:border-gold-500 focus:ring-gold-500/20"
            } focus:outline-none focus:ring-2`}
          >
            {categories.map((cat) => (
              <option key={cat.id || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* توضیحات انگلیسی */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
          >
            {t.admin.description} (English)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 h-24 resize-none ${
              isDark
                ? "bg-dark-bg border-gold-700/30 text-white focus:border-gold-500 focus:ring-gold-500/20"
                : "bg-white border-gold-200 text-charcoal focus:border-gold-500 focus:ring-gold-500/20"
            } focus:outline-none focus:ring-2`}
            dir="ltr"
          />
        </div>

        {/* توضیحات عربی */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
          >
            {t.admin.description} (العربية)
          </label>
          <textarea
            value={formData.description_ar}
            onChange={(e) =>
              setFormData({ ...formData, description_ar: e.target.value })
            }
            className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 h-24 resize-none ${
              isDark
                ? "bg-dark-bg border-gold-700/30 text-white focus:border-gold-500 focus:ring-gold-500/20"
                : "bg-white border-gold-200 text-charcoal focus:border-gold-500 focus:ring-gold-500/20"
            } focus:outline-none focus:ring-2`}
            dir="rtl"
          />
        </div>

        {/* قیمت اولیه و قیمت نهایی */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
            >
              {t.admin.originalPrice || "Original Price"}
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.price}
              onChange={(e) => handlePriceChange(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                isDark
                  ? "bg-dark-bg border-gold-700/30 text-white focus:border-gold-500 focus:ring-gold-500/20"
                  : "bg-white border-gold-200 text-charcoal focus:border-gold-500 focus:ring-gold-500/20"
              } focus:outline-none focus:ring-2`}
              required
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
            >
              {t.admin.finalPrice || "Final Price"}
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.final_price}
              onChange={(e) => handleFinalPriceChange(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                isDark
                  ? "bg-dark-bg border-gold-700/30 text-white focus:border-gold-500 focus:ring-gold-500/20"
                  : "bg-white border-gold-200 text-charcoal focus:border-gold-500 focus:ring-gold-500/20"
              } focus:outline-none focus:ring-2`}
              required
            />
          </div>
        </div>

        {/* نمایش درصد تخفیف (غیرفعال) */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
          >
            {t.admin.discountPercent || "Discount Percentage"}
          </label>
          <input
            type="number"
            value={calculateDiscount()}
            disabled
            className={`w-full px-4 py-2 rounded-lg border bg-gray-100 cursor-not-allowed ${
              isDark
                ? "bg-dark-bg/50 border-gold-700/30 text-gold-400"
                : "bg-gray-100 border-gold-200 text-gray-600"
            }`}
          />
          <p
            className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            {t.admin.discountAutoCalc || "Automatically calculated from prices"}
          </p>
        </div>

        {/* مواد اولیه انگلیسی */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
          >
            {t.admin.ingredients} (English)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddIngredient(false);
                }
              }}
              placeholder={t.admin.addIngredient}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-300 ${
                isDark
                  ? "bg-dark-bg border-gold-700/30 text-white focus:border-gold-500 focus:ring-gold-500/20"
                  : "bg-white border-gold-200 text-charcoal focus:border-gold-500 focus:ring-gold-500/20"
              } focus:outline-none focus:ring-2`}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => handleAddIngredient(false)}
              className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              {t.common.add}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.ingredients.map((ing, idx) => (
              <div
                key={idx}
                className={`px-3 py-1 rounded-full flex items-center gap-2 ${
                  isDark ? "bg-dark-bg text-gold-300" : "bg-cream text-charcoal"
                }`}
              >
                {ing}
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx, false)}
                  className="hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* مواد اولیه عربی */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
          >
            {t.admin.ingredients} (العربية)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={ingredientArInput}
              onChange={(e) => setIngredientArInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddIngredient(true);
                }
              }}
              placeholder={t.admin.addIngredient}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-300 ${
                isDark
                  ? "bg-dark-bg border-gold-700/30 text-white focus:border-gold-500 focus:ring-gold-500/20"
                  : "bg-white border-gold-200 text-charcoal focus:border-gold-500 focus:ring-gold-500/20"
              } focus:outline-none focus:ring-2`}
              dir="rtl"
            />
            <button
              type="button"
              onClick={() => handleAddIngredient(true)}
              className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              {t.common.add}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.ingredients_ar.map((ing, idx) => (
              <div
                key={idx}
                className={`px-3 py-1 rounded-full flex items-center gap-2 ${
                  isDark ? "bg-dark-bg text-gold-300" : "bg-cream text-charcoal"
                }`}
              >
                {ing}
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx, true)}
                  className="hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* دکمه‌های ذخیره و لغو */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            {food ? t.admin.update : t.admin.save}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isDark
                ? "bg-dark-bg hover:bg-dark-card text-gold-300 border border-gold-700/30"
                : "bg-gold-100 hover:bg-gold-200 text-charcoal"
            }`}
          >
            {t.admin.cancel}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FoodFormModal;
