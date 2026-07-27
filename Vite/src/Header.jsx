import Logo from "./Logo.jsx";
import OrderBadge from "./OrderBadge.jsx";
import React from "react";
import categories, { getCategoryName } from "./categories.jsx";
import { languages } from "./i18n/LanguageContext.jsx";

const { useState, useEffect } = React;

const Header = ({
  activeCategory,
  onCategoryClick,
  config,
  isDark,
  onThemeToggle,
  isAdmin,
  onAdminToggle,
  isAdminUser,
  orders,
  onOpenOrderList,
  t,
  currentLang,
  onLanguageToggle,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  // Get localized categories for navigation
  const localizedCategories = categories.map((cat) =>
    getCategoryName(cat, currentLang),
  );

  // Get localized active category
  const localizedActiveCategory = getCategoryName(activeCategory, currentLang);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isDark
          ? scrolled
            ? "bg-dark-surface/95 backdrop-blur-md shadow-lg border-b border-gold-700/30"
            : "bg-dark-bg"
          : scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-cream"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1
                className={`font-serif text-xl md:text-2xl font-semibold tracking-wide ${
                  isDark ? "text-gold-400" : "text-charcoal"
                }`}
              >
                {config.restaurant_name}
              </h1>
              <p className="text-xs md:text-sm text-gold-600 font-medium tracking-widest uppercase">
                {config.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <OrderBadge
              orders={orders}
              isDark={isDark}
              isAdmin={isAdmin}
              onOpenOrderList={onOpenOrderList}
            />

            <button
              onClick={onThemeToggle}
              className={`p-2 md:p-3 rounded-full transition-all duration-300 ${
                isDark
                  ? "bg-gold-700/20 hover:bg-gold-700/40 text-gold-400"
                  : "bg-gold-100 hover:bg-gold-200 text-gold-700"
              }`}
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? (
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Desktop Navigation - Now using localized categories */}
            <nav className="hidden md:flex items-center gap-1">
              {localizedCategories.map((categoryName, index) => {
                const originalCategory = categories[index];
                return (
                  <button
                    key={originalCategory.name}
                    onClick={() => onCategoryClick(originalCategory.name)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                      activeCategory === originalCategory.name
                        ? isDark
                          ? "bg-gold-600 text-white"
                          : "bg-gold-600 text-white"
                        : isDark
                          ? "text-gold-300 hover:bg-dark-card hover:text-gold-200"
                          : "text-charcoal hover:bg-gold-100 hover:text-gold-700"
                    }`}
                  >
                    {categoryName}
                  </button>
                );
              })}
            </nav>

            {/* Language Toggle Button */}
            <button
              onClick={onLanguageToggle}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 flex items-center gap-1 ${
                isDark
                  ? "bg-gold-700/20 text-gold-300 hover:bg-gold-700/40"
                  : "bg-gold-100 text-charcoal hover:bg-gold-200"
              }`}
              title={
                currentLang === "en"
                  ? "Switch to Arabic"
                  : "التبديل إلى الإنجليزية"
              }
            >
              <span>{languages[currentLang === "en" ? "ar" : "en"].flag}</span>
              <span>{currentLang === "en" ? "AR" : "EN"}</span>
            </button>

            {isAdminUser && (
              <button
                onClick={onAdminToggle}
                className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isAdmin
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : isDark
                      ? "bg-gold-700/20 text-gold-300 hover:bg-gold-700/40"
                      : "bg-gold-100 text-charcoal hover:bg-gold-200"
                }`}
              >
                {isAdmin ? t.admin.exitAdminMode : "⚙️ Toggle View"}
              </button>
            )}
          </div>
        </div>
        {/* Mobile Navigation - Now using localized categories */}
        <nav className="md:hidden pb-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {localizedCategories.map((categoryName, index) => {
              const originalCategory = categories[index];
              return (
                <button
                  key={originalCategory.name}
                  onClick={() => onCategoryClick(originalCategory.name)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-300 ${
                    activeCategory === originalCategory.name
                      ? "bg-gold-600 text-white"
                      : isDark
                        ? "bg-dark-card text-gold-300 border border-gold-700/30"
                        : "bg-white text-charcoal border border-gold-200 hover:border-gold-400"
                  }`}
                >
                  {categoryName}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
