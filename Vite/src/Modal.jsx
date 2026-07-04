// Modal.jsx
const Modal = ({ isOpen, title, isDark, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center overlay-fade"
      onClick={onClose}
    >
      <div
        className={`w-full md:max-w-3xl rounded-2xl shadow-2xl modal-enter overflow-hidden ${
          isDark ? "bg-dark-surface" : "bg-gold-100"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: "calc(100vh - 80px)",
          height: "fit-content",
        }}
      >
        <div
          className={`flex items-center justify-between px-6 md:px-8 py-2 md:pt-6 border-b sticky top-0 z-10 ${
            isDark
              ? "border-gold-700/30 bg-dark-surface"
              : "border-gold-100 bg-gold-100"
          }`}
        >
          <h3
            className={`font-serif text-2xl font-semibold ${isDark ? "text-gold-300" : "text-charcoal"}`}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all duration-200 ${
              isDark
                ? "hover:bg-dark-card text-gold-400"
                : "hover:bg-gold-100 text-charcoal"
            }`}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-4 md:px-6 py-4 max-h-[calc(100vh-180px)]">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;
