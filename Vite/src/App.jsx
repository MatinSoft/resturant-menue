import React from "react";
import postJSON from "./postJSON.jsx";
import postForm from "./postForm.jsx";
import initialMenuData, { getLocalizedFood } from "./initialMenuData.jsx";
import categories, { getCategoryName } from "./categories.jsx";
import Header from "./Header.jsx";
import CategorySection from "./CategorySection.jsx";
import HeroSection from "./HeroSection.jsx";
import FoodFormModal from "./FoodFormModal.jsx";
import ViewFoodModal from "./ViewFoodModal.jsx";
import CategoryFormModal from "./CategoryFormModal.jsx";
import Footer from "./Footer.jsx";
import OrderListModal from "./OrderListModal.jsx";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext.jsx";
import translations from "./i18n/translations/index.js";
import OrderSidebar from "./OrderSidebar.jsx";
import Toast from "./Toast.jsx";

const { useState, useEffect } = React;

// Main App Component (Inner - with language access)
const AppContent = () => {
  const { currentLang, toggleLanguage, isRTL } = useLanguage();
  const t = translations[currentLang];
  const [toastData, setToastData] = useState(null);

  useEffect(() => {
    if (
      window.__TOAST_DATA__ &&
      window.__TOAST_DATA__.message &&
      typeof window.__TOAST_DATA__.message === "string" &&
      window.__TOAST_DATA__.message.trim() !== "" &&
      window.__TOAST_DATA__.message.toLowerCase() !== "none"
    ) {
      setToastData({
        message: window.__TOAST_DATA__.message,
        type: window.__TOAST_DATA__.type || "info",
      });
      delete window.__TOAST_DATA__;
    }
  }, []);

  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.name || "المقبلات", // Use the name property
  );

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme-dark");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const isAdminUser = !!window.__IS_ADMIN_USER__;
  const [isAdminMode, setIsAdminMode] = useState(false);
  const canAdmin = isAdminUser && isAdminMode;
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [menuData, setMenuData] = useState(initialMenuData);
  const [categoriesState, setCategoriesState] = useState(categories);

  // Helper function to get localized menu data
  const getLocalizedMenuData = (lang) => {
    return menuData.map((food) => getLocalizedFood(food, lang));
  };

  // Helper function to get localized categories
  const getLocalizedCategories = (lang) => {
    return categoriesState.map((cat) => getCategoryName(cat, lang));
  };

  // Get localized data based on current language
  const localizedMenuData = getLocalizedMenuData(currentLang);
  const localizedCategories = getLocalizedCategories(currentLang);

  // Modals state
  const [orders, setOrders] = useState([]);
  const [orderListModalOpen, setOrderListModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [viewFoodModal, setViewFoodModal] = useState(false);
  const [currentFoodView, setCurrentFoodView] = useState(null);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentCategoryForFood, setCurrentCategoryForFood] = useState(null);

  const [config, setConfig] = useState({
    restaurant_name: "لا ميزون",
    tagline: currentLang === "en" ? "Fine Dining" : "تناول فاخر",
  });

  const defaultConfig = {
    restaurant_name: "لا ميزون",
    tagline: currentLang === "en" ? "Fine Dining" : "تناول فاخر",
  };

  // Apply theme and RTL
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme-dark", JSON.stringify(isDark));

    // Set RTL direction
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [isDark, isRTL]);

  // Update config when language changes
  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      tagline: currentLang === "en" ? "Fine Dining" : "تناول فاخر",
    }));
  }, [currentLang]);

  // Initialize Element SDK
  useEffect(() => {
    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange: async (newConfig) => {
          setConfig((prev) => ({
            ...prev,
            restaurant_name:
              newConfig.restaurant_name || defaultConfig.restaurant_name,
            tagline: newConfig.tagline || defaultConfig.tagline,
          }));
        },
        mapToCapabilities: (cfg) => ({
          recolorables: [],
          borderables: [],
          fontEditable: undefined,
          fontSizeable: undefined,
        }),
        mapToEditPanelValues: (cfg) =>
          new Map([
            [
              "restaurant_name",
              cfg.restaurant_name || defaultConfig.restaurant_name,
            ],
            ["tagline", cfg.tagline || defaultConfig.tagline],
          ]),
      });
    }
  }, []);

  // Add this useEffect in App.jsx, after your other useEffect hooks
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 150;

      for (let i = categoriesState.length - 1; i >= 0; i--) {
        const cat = categoriesState[i];
        const id = cat.name.replace(/\s+/g, "-").toLowerCase();
        const el = document.getElementById(id);

        if (el && el.offsetTop <= scrollY) {
          if (activeCategory !== cat.name) {
            setActiveCategory(cat.name);
          }
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categoriesState, activeCategory]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);
  // Category Management
  const handleAddCategory = async (categoryName, categoryNameAr = null) => {
    const name = (categoryName || "").trim();
    if (!name) return;

    const payload = { name };
    if (categoryNameAr) {
      payload.name_ar = categoryNameAr.trim();
    }

    const resp = await postJSON("/api/category/create/", payload);

    const newCategory = {
      id: String(categoriesState.length + 1),
      name: resp.name,
      name_ar: resp.name_ar || resp.name,
    };
    setCategoriesState((prev) => [...prev, newCategory]);
    setCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleEditCategory = async (oldName, newName, newNameAr = null) => {
    const payload = { old_name: oldName, new_name: newName };
    if (newNameAr) payload.name_ar = newNameAr.trim();

    const resp = await postJSON("/api/category/update/", payload);

    setCategoriesState((prev) =>
      prev.map((cat) =>
        cat.name === oldName
          ? { ...cat, name: resp.name, name_ar: resp.name_ar || cat.name_ar }
          : cat,
      ),
    );

    setMenuData((prev) =>
      prev.map((item) =>
        item.category === oldName
          ? { ...item, category: resp.name, category_ar: resp.name_ar }
          : item,
      ),
    );

    setCategoryModalOpen(false);
    setEditingCategory(null);
  };
  const handleDeleteCategory = async (categoryName) => {
    if (!confirm(`${t.admin.deleteConfirm} "${categoryName}"?`)) return;

    await postJSON("/api/category/delete/", { name: categoryName });

    setCategoriesState((prev) =>
      prev.filter((cat) => cat.name !== categoryName),
    );
    setMenuData((prev) =>
      prev.filter((item) => item.category !== categoryName),
    );
  };
  // Food Management
  const handleAddFood = (category) => {
    setCurrentCategoryForFood(category);
    setEditingFood(null);
    setFoodModalOpen(true);
  };

  const handleEditFood = (food) => {
    // Find the original food from menuData by ID (which has English fields)
    const originalFood = menuData.find((item) => item.id === food.id) || food;
    setEditingFood(originalFood);
    setCurrentCategoryForFood(originalFood.category);
    setFoodModalOpen(true);
  };
  const handleSaveFood = async (
    formData,
    newImageFiles,
    removedImages,
    finalImages,
  ) => {
    if (!formData.category) {
      alert("You must select a category first");
      return;
    }

    const fd = new FormData();
    fd.append("category", formData.category);
    fd.append("name", formData.name);
    fd.append("description", formData.description || "");
    fd.append("price", formData.price);
    fd.append("final_price", formData.final_price || formData.price); // اضافه کردن final_price
    fd.append("discount", formData.discount || 0);
    fd.append("ingredients", JSON.stringify(formData.ingredients || []));
    fd.append("existing_images", JSON.stringify(finalImages));
    fd.append("removed_images", JSON.stringify(removedImages));

    // Add Arabic fields if they exist
    if (formData.name_ar) fd.append("name_ar", formData.name_ar);
    if (formData.description_ar)
      fd.append("description_ar", formData.description_ar);
    if (formData.ingredients_ar)
      fd.append(
        "ingredients_ar",
        JSON.stringify(formData.ingredients_ar || []),
      );

    if (newImageFiles && newImageFiles.length > 0) {
      newImageFiles.forEach((file) => fd.append("images", file));
    }

    if (editingFood) {
      fd.append("id", editingFood.id);
      const resp = await postForm("/api/food/update/", fd);
      setMenuData((prev) =>
        prev.map((it) => (it.id === editingFood.id ? resp.food : it)),
      );
    } else {
      const resp = await postForm("/api/food/create/", fd);
      setMenuData((prev) => [...prev, resp.food]);
    }

    setFoodModalOpen(false);
    setEditingFood(null);
  };
  const handleDeleteFood = async (foodId) => {
    if (!confirm(t.admin.deleteConfirm)) return;

    await postJSON("/api/food/delete/", { id: foodId });
    setMenuData((prev) => prev.filter((item) => item.id !== foodId));
  };

  const handleThemeToggle = () => {
    setIsDark((prev) => !prev);
  };

  // View Food Management
  const handleViewFood = (food) => {
    setCurrentFoodView(food);
    setViewFoodModal(true);
  };

  const handleOrderFood = (item, quantity) => {
    setOrders((prevOrders) => {
      const existingItemIndex = prevOrders.findIndex(
        (order) => order.id === item.id,
      );

      if (existingItemIndex !== -1) {
        const updatedOrders = [...prevOrders];
        updatedOrders[existingItemIndex] = {
          ...updatedOrders[existingItemIndex],
          quantity: quantity,
        };
        return updatedOrders;
      } else {
        return [...prevOrders, { ...item, quantity }];
      }
    });
  };

  const handleUpdateOrderQuantity = (itemId, newQuantity) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === itemId ? { ...order, quantity: newQuantity } : order,
      ),
    );
  };

  const handleRemoveOrderItem = (itemId) => {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== itemId),
    );
  };

  const handleFinalizeOrder = async () => {
    if (orders.length === 0) {
      setToastData({
        message: t.toast.noOrders, // استفاده از ترجمه
        type: "warning",
      });
      return;
    }

    // تابع محاسبه قیمت با تخفیف
    const getDiscountedPrice = (item) => {
      const price = Number(item.price) || 0;
      const discount = Number(item.discount) || 0;
      if (discount > 0) {
        return price * (1 - discount / 100);
      }
      return price;
    };

    const orderPayload = {
      items: orders.map((order) => ({
        id: order.id,
        name: order.name,
        quantity: order.quantity,
        price: order.price,
        discount: order.discount || 0,
      })),
      total_items: orders.reduce((sum, item) => sum + item.quantity, 0),
      total_amount: orders.reduce(
        (sum, item) => sum + getDiscountedPrice(item) * item.quantity,
        0,
      ),
    };

    try {
      const response = await postJSON("/api/order/create/", orderPayload);

      if (response.success) {
        setToastData({
          message: t.toast.orderSuccess, // استفاده از ترجمه
          type: "success",
        });
        setOrders([]);
        setOrderListModalOpen(false);
      } else {
        setToastData({
          message: response.message || t.toast.orderFailed, // استفاده از ترجمه
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error finalizing order:", error);
      setToastData({
        message: t.toast.orderError, // استفاده از ترجمه
        type: "error",
      });
    }
  };
  const handleOpenOrderList = () => {
    setOrderListModalOpen(true);
  };

  const handleAdminToggle = () => {
    if (!isAdminUser) return;
    setIsAdminMode((prev) => !prev);
  };

  // In App.jsx, update handleCategoryClick:
  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    const element = document.getElementById(
      categoryName.replace(" ", "-").toLowerCase(),
    );
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleSaveCategory = (categoryName, categoryNameAr) => {
    if (editingCategory) {
      handleEditCategory(editingCategory, categoryName, categoryNameAr);
    } else {
      handleAddCategory(categoryName, categoryNameAr);
    }
  };

  const groupedMenu = categoriesState.reduce((acc, category) => {
    acc[category.name] = menuData.filter(
      (item) => item.category === category.name,
    );
    return acc;
  }, {});
  // Get localized items for a category based on current language
  const getLocalizedItems = (categoryName) => {
    const items = groupedMenu[categoryName] || [];
    return items.map((item) => getLocalizedFood(item, currentLang));
  };
  // Get localized category name for display
  const getDisplayCategory = (category) => {
    return getCategoryName(category, currentLang);
  };

  return (
    <div
      className={`min-h-full transition-colors duration-300 ${
        isDark ? "bg-dark-bg text-white" : "bg-cream text-charcoal"
      }`}
    >
      {toastData &&
        toastData.message &&
        typeof toastData.message === "string" &&
        toastData.message.trim() !== "" &&
        toastData.message.toLowerCase() !== "none" && (
          <Toast
            message={toastData.message}
            type={toastData.type}
            onClose={() => setToastData(null)}
          />
        )}{" "}
      <Header
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
        config={config}
        isDark={isDark}
        onThemeToggle={handleThemeToggle}
        isAdmin={canAdmin}
        onAdminToggle={handleAdminToggle}
        isAdminUser={isAdminUser}
        orders={orders}
        onOpenOrderList={handleOpenOrderList}
        t={t}
        currentLang={currentLang}
        onLanguageToggle={toggleLanguage}
      />
      <HeroSection config={config} isDark={isDark} t={t} />
      <main className="max-w-6xl mx-auto pl-4 sm:px-6 lg:pl-8 py-2 md:py-10 lg:py-12">
        {" "}
        {canAdmin && (
          <div
            className={`mb-12 p-6 rounded-2xl border-2 ${
              isDark
                ? "bg-blue-900/20 border-blue-700/50 text-blue-200"
                : "bg-blue-50 border-blue-300 text-blue-700"
            }`}
          >
            <p className="font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>{" "}
              {t.admin.warning}
            </p>
          </div>
        )}
        {/* Add Category Button - Only in Admin Mode */}
        {canAdmin && (
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                isDark
                  ? "bg-gold-700/30 hover:bg-gold-700/50 text-gold-300 border border-gold-700/50"
                  : "bg-gold-100 hover:bg-gold-200 text-gold-700 border border-gold-300"
              }`}
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t.admin.addCategory}
            </button>
          </div>
        )}
        {/* In App.jsx, update the CategorySection rendering: */}
        {categoriesState.map((category) => (
          <CategorySection
            onFoodCardClick={handleViewFood}
            key={category.id}
            category={getCategoryName(category, currentLang)}
            originalCategory={category.name}
            items={getLocalizedItems(category.name)} // این خط مهم است
            isDark={isDark}
            isAdmin={canAdmin}
            onAddFood={handleAddFood}
            onEditFood={handleEditFood}
            onDeleteFood={handleDeleteFood}
            onEditCategory={() => {
              setEditingCategory(category);
              setCategoryModalOpen(true);
            }}
            onDeleteCategory={handleDeleteCategory}
            t={t}
          />
        ))}{" "}
      </main>
      <FoodFormModal
        isOpen={foodModalOpen}
        isDark={isDark}
        food={editingFood}
        categories={categoriesState}
        defaultCategory={currentCategoryForFood}
        onSave={handleSaveFood}
        onClose={() => {
          setFoodModalOpen(false);
          setEditingFood(null);
        }}
        t={t}
      />
      <CategoryFormModal
        isOpen={categoryModalOpen}
        isDark={isDark}
        category={editingCategory}
        onSave={handleSaveCategory}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        t={t}
      />
      {currentFoodView ? (
        <ViewFoodModal
          isOpen={viewFoodModal}
          isDark={isDark}
          item={getLocalizedFood(currentFoodView, currentLang)}
          quantity={quantity}
          setQuantity={setQuantity}
          onOrder={handleOrderFood}
          onClose={() => {
            setViewFoodModal(false);
            setCurrentFoodView(null);
            setQuantity(1);
          }}
          t={t}
        />
      ) : null}
      <OrderListModal
        isOpen={orderListModalOpen}
        isDark={isDark}
        orders={orders}
        onClose={() => setOrderListModalOpen(false)}
        onUpdateQuantity={handleUpdateOrderQuantity}
        onRemoveItem={handleRemoveOrderItem}
        onFinalizeOrder={handleFinalizeOrder}
        t={t}
      />
      {/* اضافه کردن OrderSidebar */}
      <OrderSidebar
        orders={orders}
        isDark={isDark}
        onUpdateQuantity={handleUpdateOrderQuantity}
        onRemoveItem={handleRemoveOrderItem}
        onFinalizeOrder={handleFinalizeOrder}
        t={t}
      />
      <Footer config={config} isDark={isDark} t={t} />
    </div>
  );
};

// Main App Component (Wrapper with LanguageProvider)
const App = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
