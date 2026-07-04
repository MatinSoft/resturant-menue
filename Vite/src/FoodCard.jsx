import FoodImage from "./FoodImage.jsx";
import React from "react";
const { useState } = React;

const FoodCard = ({
  item,
  index,
  isDark,
  isAdmin,
  onEdit,
  onImageClick,
  onDelete,
  t,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Function to format price
  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") return "0.000";
    return Number(price).toFixed(3);
  };

  // Get final price - همیشه از final_price استفاده کن
  const getFinalPrice = () => {
    // اولویت با final_price است
    if (
      item.final_price !== undefined &&
      item.final_price !== null &&
      item.final_price !== "" &&
      Number(item.final_price) >= 0
    ) {
      return Number(item.final_price);
    }

    // اگر final_price وجود نداشت، از discount محاسبه کن
    const price = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;

    if (discount > 0 && discount <= 100) {
      return price * (1 - discount / 100);
    }

    return price;
  };

  const finalPrice = getFinalPrice();
  const originalPrice = Number(item.price) || 0;
  const hasDiscount = finalPrice < originalPrice;
  const discountPercent = item.discount || 0;

  return (
    <article
      className={`group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 fade-in-up stagger-${(index % 4) + 1} relative ${
        isDark ? "bg-dark-card" : "bg-white"
      } flex flex-col h-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ opacity: 0, animationFillMode: "forwards" }}
    >
      <div
        className={`relative overflow-hidden ${isDark ? "bg-dark-surface" : "bg-gradient-to-br from-cream to-gold-50"}`}
      >
        <div
          className={`aspect-square transition-transform duration-500 ${isHovered ? "scale-105" : "scale-100"}`}
          onClick={() => onImageClick(item)}
        >
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="p-6 w-full h-full">
              <FoodImage type={item.image} className="w-full h-full" />
            </div>
          )}
        </div>

        {isAdmin && isHovered && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center gap-3 admin-overlay">
            <button
              onClick={() => onEdit(item)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              title={t.admin.editFood}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {t.admin.editFood}
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              title={t.admin.deleteFood}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {t.admin.deleteFood}
            </button>
          </div>
        )}

        {/* نمایش درصد تخفیف روی تصویر */}
        {discountPercent > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
            -{Math.round(discountPercent)}%
          </div>
        )}
      </div>

      <div className="p-5 md:p-6 flex flex-col flex-1">
        <div className="flex flex-col items-start justify-between gap-4 mb-2">
          <h3
            className={`font-serif text-xl md:text-2xl font-semibold group-hover:text-gold-600 transition-colors duration-300 ${
              isDark ? "text-gold-300" : "text-charcoal"
            }`}
          >
            {item.name}
          </h3>
        </div>
        <p
          className={`text-sm md:text-base line-clamp-2 leading-normal mb-2 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {item.description}
        </p>

        {/* نمایش قیمت */}
        <div className="mb-2">
          {hasDiscount ? (
            <div className="flex flex-wrap items-center gap-2">
              <span
                dir="ltr"
                className="font-serif text-sm md:text-base font-semibold whitespace-nowrap text-gray-500 line-through"
              >
                {formatPrice(originalPrice)}
              </span>
              <span
                dir="ltr"
                className={`font-serif text-lg md:text-xl font-semibold whitespace-nowrap ${
                  isDark ? "text-gold-400" : "text-gold-700"
                }`}
              >
                {formatPrice(finalPrice)} {t.food.price}
              </span>
            </div>
          ) : (
            <span
              dir="ltr"
              className={`font-serif text-lg md:text-xl font-semibold whitespace-nowrap ${
                isDark ? "text-gold-400" : "text-gold-700"
              }`}
            >
              {formatPrice(finalPrice)} {t.food.price}
            </span>
          )}
        </div>

        <div
          className={`pt-2 border-t ${isDark ? "border-gold-700/30" : "border-gold-100"}`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wider mb-2 ${
              isDark ? "text-gold-400" : "text-gold-600"
            }`}
          >
            {t.food.ingredients}
          </p>
          <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-7">
            {item.ingredients &&
              item.ingredients.map((ingredient, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-2.5 py-1 rounded-full ${
                    isDark
                      ? "bg-dark-surface text-gold-300"
                      : "bg-cream text-charcoal"
                  }`}
                >
                  {ingredient}
                </span>
              ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export default FoodCard;
