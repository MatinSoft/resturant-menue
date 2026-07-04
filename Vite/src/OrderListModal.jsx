import Modal from "./Modal.jsx";
import React from "react";

const OrderListModal = ({
  isOpen,
  isDark,
  orders,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onFinalizeOrder,
  t,
}) => {
  // محاسبه قیمت نهایی با استفاده از final_price
  const getDiscountedPrice = (item) => {
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

  const totalAmount = orders.reduce(
    (sum, item) => sum + getDiscountedPrice(item) * item.quantity,
    0,
  );

  return (
    <Modal
      isOpen={isOpen}
      title={t.order.yourOrders}
      isDark={isDark}
      onClose={onClose}
    >
      <div className="p-6 md:p-8">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p
              className={`text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {t.order.noOrders}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
              {orders.map((order, idx) => (
                <div
                  key={idx}
                  className={`flex flex-row items-stretch rounded-lg transition-all ${
                    isDark
                      ? "bg-dark-bg border border-gold-700/30"
                      : "bg-cream border border-gold-200"
                  }`}
                >
                  <div className="w-32 h-32 rounded-l-lg overflow-hidden flex-shrink-0">
                    {order.images?.[0] ? (
                      <img
                        src={order.images[0]}
                        alt={order.name}
                        className="w-32 h-32 object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${
                          isDark ? "bg-dark-surface" : "bg-gold-50"
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

                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <h4
                      className={`font-semibold text-lg ${isDark ? "text-gold-300" : "text-charcoal"}`}
                    >
                      {order.name}
                    </h4>
                    <p
                      className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {getDiscountedPrice(order).toFixed(3)} {t.food.price}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            order.id,
                            Math.max(1, order.quantity - 1),
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-lg font-bold"
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {order.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(order.id, order.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-lg font-bold"
                      >
                        +
                      </button>

                      <button
                        onClick={() => onRemoveItem(order.id)}
                        className="ml-2 p-2 text-red-500 hover:text-red-700 transition-colors"
                        title={t.order.removeItem}
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
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <span
                  className={`text-lg font-semibold ${isDark ? "text-gold-300" : "text-charcoal"}`}
                >
                  {t.order.totalAmount}:
                </span>
                <span
                  className={`text-2xl font-bold ${isDark ? "text-gold-400" : "text-gold-700"}`}
                >
                  {totalAmount.toFixed(3)} {t.food.price}
                </span>
              </div>

              <button
                onClick={onFinalizeOrder}
                className="w-full py-3 bg-gold-600 hover:bg-gold-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02]"
              >
                {t.order.finalizeOrder}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default OrderListModal;
