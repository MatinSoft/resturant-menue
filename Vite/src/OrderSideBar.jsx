// FILE: OrderSideBar.jsx
// PATH: OrderSideBar.jsx
// FULL PATH: E:\Django Projects\Oman Restaurant\Vite\src\OrderSideBar.jsx

import React from "react";
import { useLanguage } from "./i18n/LanguageContext.jsx";

const OrderSidebar = ({
  orders,
  isDark,
  onUpdateQuantity,
  onRemoveItem,
  onFinalizeOrder,
  t,
}) => {
  const { isRTL } = useLanguage();
  const [isMobile, setIsMobile] = React.useState(false);
  const [tableNumber, setTableNumber] = React.useState("");
  const [isTakeaway, setIsTakeaway] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const totalAmount = orders.reduce((sum, item) => {
    const price = item.final_price
      ? Number(item.final_price)
      : Number(item.price) * (1 - (Number(item.discount) || 0) / 100);
    return sum + price * item.quantity;
  }, 0);

  const handleFinalizeOrder = () => {
    onFinalizeOrder({
      tableNumber: isTakeaway ? "Takeaway" : tableNumber,
      isTakeaway,
    });
  };

  // Effect برای اضافه کردن padding به main content در موبایل
  React.useEffect(() => {
    if (isMobile && orders.length > 0) {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        if (isRTL) {
          mainContent.style.paddingRight = '80px';
          mainContent.style.paddingLeft = '';
        } else {
          mainContent.style.paddingLeft = '80px';
          mainContent.style.paddingRight = '';
        }
      }
    } else if (isMobile) {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.paddingLeft = '';
        mainContent.style.paddingRight = '';
      }
    }

    return () => {
      if (isMobile) {
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.style.paddingLeft = '';
          mainContent.style.paddingRight = '';
        }
      }
    };
  }, [isMobile, orders.length, isRTL]);

  if (orders.length === 0) return null;

  // نسخه موبایل: سایدبار عمودی
  if (isMobile) {
    return (
      <div
        className={`fixed z-40 ${
          isRTL ? "right-0" : "left-0"
        } top-[130px] bottom-0 w-[72px] flex flex-col ${
          isDark
            ? "bg-dark-surface border-gold-700/30"
            : "bg-white border-gold-200"
        } ${isRTL ? "border-l-2" : "border-r-2"} shadow-xl`}
      >
        {/* محتوای سایدبار */}
        <div className="flex flex-col h-full py-3">
          {/* غذاها از بالا */}
          <div className="flex-1 flex flex-col items-center gap-3 overflow-y-auto pt-2">
            {orders.map((order) => (
              <div key={order.id} className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold-500 shadow-lg">
                  {order.images?.[0] ? (
                    <img
                      src={order.images[0]}
                      alt={order.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        isDark ? "bg-dark-bg" : "bg-gold-100"
                      }`}
                    >
                      <svg
                        className="w-6 h-6 text-gold-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Badge تعداد - پایین سمت چپ */}
                <span className="absolute -bottom-1 -left-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                  {order.quantity}
                </span>

                {/* Badge افزایش - بالای سمت راست */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(order.id, order.quantity + 1);
                  }}
                  className="absolute -top-1 -right-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg transition-colors"
                >
                  +
                </button>

                {/* Badge کاهش - بالای سمت چپ */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(order.id, Math.max(1, order.quantity - 1));
                  }}
                  className="absolute -top-1 -left-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg transition-colors"
                >
                  −
                </button>

                {/* Badge حذف - پایین سمت راست */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(order.id);
                  }}
                  className="absolute -bottom-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* چک‌باکس Takeaway - موبایل */}
          <div className="flex flex-col items-center gap-1 px-2">
            <label
              htmlFor="takeaway-mobile"
              className={`text-[9px] font-medium cursor-pointer select-none leading-none ${
                isDark ? "text-gold-300" : "text-charcoal"
              }`}
            >
              {t.order.takeaway || "Takeaway"}
            </label>
            <input
              type="checkbox"
              id="takeaway-mobile"
              checked={isTakeaway}
              onChange={(e) => setIsTakeaway(e.target.checked)}
              className="w-4 h-4 accent-gold-500 cursor-pointer"
            />
          </div>

          {/* Input شماره میز - فقط وقتی Takeaway غیرفعال است */}
          {!isTakeaway && (
            <div className="flex flex-col items-center gap-1 px-2 mt-1">
              <label
                htmlFor="table-number-mobile"
                className={`text-[9px] font-medium cursor-pointer select-none leading-none ${
                  isDark ? "text-gold-300" : "text-charcoal"
                }`}
              >
                {t.order.tableNumber || "Table"}
              </label>
              <input
                type="number"
                id="table-number-mobile"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="#"
                className={`w-full px-1.5 py-1 rounded-md border text-[10px] text-center transition-all duration-200 ${
                  isDark
                    ? "bg-dark-bg border-gold-700/30 text-white placeholder-gray-500 focus:border-gold-500"
                    : "bg-white border-gold-200 text-charcoal placeholder-gray-400 focus:border-gold-500"
                } focus:outline-none`}
                min="1"
              />
            </div>
          )}

          {/* دکمه ثبت سفارش با تیک - پایین سایدبار */}
          <div className="flex justify-center pt-1.5 pb-2">
            <button
              onClick={handleFinalizeOrder}
              className="w-12 h-12 rounded-full bg-gold-600 hover:bg-gold-700 text-white shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // نسخه دسکتاپ: سایدبار کامل
  return (
    <div
      className={`fixed top-0 h-full z-40 transition-all duration-300 ${
        isRTL ? "right-0" : "left-0"
      }`}
      style={{ width: "380px", maxWidth: "100vw" }}
    >
      {/* Background blur overlay */}
      <div
        className={`absolute inset-0 backdrop-blur-md ${
          isDark ? "bg-dark-surface/80" : "bg-white/80"
        } ${isRTL ? "border-r" : "border-l"} ${
          isDark ? "border-gold-700/30" : "border-gold-200"
        }`}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDark ? "border-gold-700/30" : "border-gold-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-gold-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <h3
              className={`font-serif text-xl font-semibold ${
                isDark ? "text-gold-300" : "text-charcoal"
              }`}
            >
              {t.order.yourOrders || "Your Orders"}
            </h3>
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
              {orders.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div
          className="overflow-y-auto flex-1"
          style={{ paddingBottom: "100px" }}
        >
          <div className="p-4 ">
            {orders.map((order) => {
              const finalPrice = order.final_price
                ? Number(order.final_price)
                : Number(order.price) *
                  (1 - (Number(order.discount) || 0) / 100);

              return (
                <div
                  key={order.id}
                  className={`flex items-center gap-3 p-3 transition-all duration-200 backdrop-blur-sm border-b border-gold-500 ${
                    isDark
                      ? "hover:bg-dark-card/50"
                      : "hover:bg-gold-50/50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold-500">
                      {order.images?.[0] ? (
                        <img
                          src={order.images[0]}
                          alt={order.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            isDark ? "bg-dark-surface" : "bg-gold-100"
                          }`}
                        >
                          <svg
                            className="w-8 h-8 text-gold-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                      {order.quantity}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-semibold text-sm truncate ${
                        isDark ? "text-gold-300" : "text-charcoal"
                      }`}
                    >
                      {order.name}
                    </h4>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {finalPrice.toFixed(3)} {t.food.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          order.id,
                          Math.max(1, order.quantity - 1),
                        )
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200/80 hover:bg-gray-300/80 text-sm font-bold transition-colors"
                    >
                      −
                    </button>
                    <button
                      onClick={() =>
                        onUpdateQuantity(order.id, order.quantity + 1)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200/80 hover:bg-gray-300/80 text-sm font-bold transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemoveItem(order.id)}
                      className="ml-1 p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
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
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer با دکمه نهایی کردن */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 border-t backdrop-blur-md ${
            isDark
              ? "border-gold-700/30 bg-dark-surface/80"
              : "border-gold-200 bg-white/80"
          }`}
        >
          {/* Table number input و checkbox - دسکتاپ */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="takeaway-desktop"
                checked={isTakeaway}
                onChange={(e) => setIsTakeaway(e.target.checked)}
                className="w-4 h-4 accent-gold-500 cursor-pointer"
              />
              <label
                htmlFor="takeaway-desktop"
                className={`text-sm font-medium cursor-pointer select-none ${
                  isDark ? "text-gold-300" : "text-charcoal"
                }`}
              >
                {t.order.takeaway || "Takeaway"}
              </label>
            </div>
            
            {!isTakeaway && (
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder={t.order.tableNumber || "Table Number"}
                className={`w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                  isDark
                    ? "bg-dark-bg border-gold-700/30 text-white placeholder-gray-500 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                    : "bg-white border-gold-200 text-charcoal placeholder-gray-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                } focus:outline-none`}
                min="1"
              />
            )}
          </div>

          <div className="flex justify-between items-center mb-3">
            <span
              className={`font-semibold ${
                isDark ? "text-gold-300" : "text-charcoal"
              }`}
            >
              {t.order.totalAmount || "Total"}:
            </span>
            <span
              className={`text-xl font-bold ${
                isDark ? "text-gold-400" : "text-gold-700"
              }`}
            >
              {totalAmount.toFixed(3)} {t.food.price}
            </span>
          </div>

          <button
            onClick={handleFinalizeOrder}
            className="w-full py-3 bg-gold-600 hover:bg-gold-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
          >
            {t.order.finalizeOrder || "Finalize Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSidebar;