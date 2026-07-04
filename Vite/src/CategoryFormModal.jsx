import Modal from "./Modal.jsx";
import React from "react";
const { useState, useEffect } = React;

const CategoryFormModal = ({
  isOpen,
  isDark,
  category,
  onSave,
  onClose,
  t,
}) => {
  const [categoryName, setCategoryName] = useState(category || "");
  const [categoryNameAr, setCategoryNameAr] = useState("");

  useEffect(() => {
    if (category) {
      setCategoryName(category.name || category);
      setCategoryNameAr(category.name_ar || "");
    } else {
      setCategoryName("");
      setCategoryNameAr("");
    }
  }, [category]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(categoryName, categoryNameAr);
  };

  return (
    <Modal
      isOpen={isOpen}
      title={category ? t.admin.editCategory : t.admin.addCategory}
      isDark={isDark}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDark ? "text-gold-300" : "text-gray-700"}`}
          >
            {t.admin.categoryName} (English)
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Example: Appetizers"
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
            {t.admin.categoryName} (العربية)
          </label>
          <input
            type="text"
            value={categoryNameAr}
            onChange={(e) => setCategoryNameAr(e.target.value)}
            placeholder="مثال: المقبلات"
            className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
              isDark
                ? "bg-dark-bg border-gold-700/30 text-white focus:border-gold-500 focus:ring-gold-500/20"
                : "bg-white border-gold-200 text-charcoal focus:border-gold-500 focus:ring-gold-500/20"
            } focus:outline-none focus:ring-2`}
            dir="rtl"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            {category ? t.admin.update : t.admin.save}
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

export default CategoryFormModal;
