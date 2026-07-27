// FILE: ViewFoodModal.jsx
// PATH: ViewFoodModal.jsx
// FULL PATH: E:\Django Projects\Oman Restaurant\Vite\src\ViewFoodModal.jsx

import Modal from "./Modal.jsx";
import FoodImage from "./FoodImage.jsx";
import { useRef } from "react";

const ViewFoodModal = ({
  isOpen,
  isDark,
  item,
  quantity,
  setQuantity,
  onOrder,
  onClose,
  t,
}) => {
  const scrollContainerRef = useRef(null);
  const isAdminUser = !!window.__IS_ADMIN_USER__;

  const handleOrder = () => {
    onOrder(item, quantity);
    onClose();
  };

  const images = Array.isArray(item.images)
    ? item.images
    : item.images
      ? [item.images]
      : [];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // محاسبه قیمت نهایی
  const getFinalPrice = () => {
    if (
      item.final_price !== undefined &&
      item.final_price !== null &&
      item.final_price !== "" &&
      Number(item.final_price) >= 0
    ) {
      return Number(item.final_price);
    }

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

  return (
    <Modal isOpen={isOpen} isDark={isDark} onClose={onClose} title={item.name}>
      <div className="relative px-6">
        <div
          ref={scrollContainerRef}
          className={`relative overflow-x-auto overflow-y-hidden scroll-smooth`}
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="flex gap-3">
            {images.length > 0 ? (
              images.map((imgUrl, idx) => (
                <div key={idx} className="w-64 h-64 flex-shrink-0">
                  <img
                    src={imgUrl}
                    alt={`${item.name} - ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              ))
            ) : (
              <div className="w-64 h-64 flex-shrink-0 flex items-center justify-center p-10">
                <FoodImage type={item.image} className="w-full h-full" />
              </div>
            )}
          </div>
        </div>

        {images.length > 2 && (
          <>
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm z-10">
            {images.length} photos
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <h2
          className={`font-serif text-3xl font-semibold ${
            isDark ? "text-gold-300" : "text-charcoal"
          }`}
        >
          {item.name}
        </h2>
        <p
          className={`text-base leading-relaxed ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {item.description}
        </p>

        {/* نمایش قیمت */}
        {hasDiscount ? (
          <div>
            <span
              dir="ltr"
              className="font-serif text-xl text-gray-500 line-through"
            >
              {originalPrice.toFixed(3)} {t.food.price}
            </span>
            <br />
            <span
              dir="ltr"
              className={`font-serif text-2xl font-semibold ${
                isDark ? "text-gold-400" : "text-gold-700"
              }`}
            >
              {finalPrice.toFixed(3)} {t.food.price}
            </span>
          </div>
        ) : (
          <span
            dir="ltr"
            className={`font-serif text-2xl font-semibold ${
              isDark ? "text-gold-400" : "text-gold-700"
            }`}
          >
            {finalPrice.toFixed(3)} {t.food.price}
          </span>
        )}

        <div className="pt-4 border-t border-gold-300/20">
          <p
            className={`text-xs font-medium uppercase tracking-wider mb-2 ${
              isDark ? "text-gold-400" : "text-gold-600"
            }`}
          >
            {t.food.ingredients}
          </p>
          <div className="flex flex-wrap gap-2">
            {item.ingredients?.map((ing, idx) => (
              <span
                key={idx}
                className={`text-xs px-3 py-1 rounded-full ${
                  isDark
                    ? "bg-dark-surface text-gold-300"
                    : "bg-cream text-charcoal"
                }`}
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* دکمه‌های سفارش - فقط برای ادمین‌ها نمایش داده شود */}
      {isAdminUser && (
        <div className="p-6 border-t border-gold-300/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-lg font-bold"
            >
              −
            </button>
            <span className="text-lg font-semibold w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-lg font-bold"
            >
              +
            </button>
          </div>

          <button
            onClick={handleOrder}
            className={`px-5 py-2 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02]
              ${isDark ? "bg-gold-500 hover:bg-gold-600" : "bg-gold-700 hover:bg-gold-800"}`}
          >
            {t.food.addToOrder}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default ViewFoodModal;