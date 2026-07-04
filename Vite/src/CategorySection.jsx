import FoodCard from "./FoodCard.jsx";

// Category Section Component
const CategorySection = ({
  category,
  originalCategory,
  items,
  isDark,
  isAdmin,
  onFoodCardClick,
  onAddFood,
  onEditFood,
  onDeleteFood,
  onEditCategory,
  onDeleteCategory,
  t,
}) => {
  const categoryId = (originalCategory || category)
    .replace(" ", "-")
    .toLowerCase();
  return (
    <section id={categoryId} className="scroll-mt-32 mb-4 md:mb-20">
      <div className="flex items-center justify-between gap-4 mb-4 md:mb-10">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1">
            {/* فقط این تکه رو inline-block کردیم تا عرضش اندازه متن بشه */}
            <div className="inline-block">
              <div className="flex items-center gap-3">
                <h2
                  className={`font-serif text-2xl md:text-3xl lg:text-4xl font-semibold ${
                    isDark ? "text-gold-300" : "text-charcoal"
                  }`}
                >
                  {category}
                </h2>

                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        onEditCategory(originalCategory || category)
                      }
                      className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded transition-all duration-200"
                      title="Edit Category"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() =>
                        onDeleteCategory(originalCategory || category)
                      }
                      className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition-all duration-200"
                      title="Delete Category"
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
                )}
              </div>

              {/* خط زیر عنوان: هم‌عرض کل inline-block (یعنی اندازه متن + دکمه‌ها) */}
              <div className="h-0.5 w-full bg-gradient-to-r from-gold-500 to-gold-300 mt-2 rounded-full"></div>
            </div>
          </div>
        </div>{" "}
        {isAdmin && (
          <button
            onClick={() => onAddFood(originalCategory || category)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
              isDark
                ? "bg-green-700/30 hover:bg-green-700/50 text-green-300 border border-green-700/50"
                : "bg-green-100 hover:bg-green-200 text-green-700 border border-green-300"
            }`}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t.admin.addFood}{" "}
          </button>
        )}
      </div>

      <div
        className="
                flex gap-6 md:gap-8 overflow-x-auto pb-2
                snap-x snap-mandatory
                md:grid md:overflow-visible md:pb-0
                md:grid-cols-2 lg:grid-cols-3 scrollbar-hide
              "
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="snap-start flex-none w-72 sm:w-80 md:w-auto"
          >
            <FoodCard
              item={item}
              index={index}
              isDark={isDark}
              isAdmin={isAdmin}
              onImageClick={onFoodCardClick}
              onEdit={onEditFood}
              onDelete={onDeleteFood}
              t={t}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
