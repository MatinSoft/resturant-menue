import Logo from "./Logo.jsx";

const Footer = ({ config, isDark, t }) => (
  <footer
    className={`transition-colors duration-300 py-12 md:py-16 ${
      isDark
        ? "bg-dark-surface text-gray-300 border-t border-gold-700/30"
        : "bg-charcoal text-white"
    } hidden md:block`}
  >
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Logo />
            <span className="font-serif text-xl font-semibold">
              {config.restaurant_name}
            </span>
          </div>
          <p
            className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-400"}`}
          >
            {t.footer.about}
          </p>
        </div>

        <div>
          <h4
            className={`font-serif text-lg font-semibold mb-4 ${isDark ? "text-gold-400" : "text-gold-400"}`}
          >
            {t.footer.openingHours}
          </h4>
          <div
            className={`space-y-2 text-sm ${isDark ? "text-gray-400" : "text-gray-400"}`}
          >
            <p>Tuesday - Thursday: 5:00 PM - 10:00 PM</p>
            <p>Friday - Saturday: 5:00 PM - 11:00 PM</p>
            <p>Sunday: 4:00 PM - 9:00 PM</p>
            <p>Monday: Closed</p>
          </div>
        </div>

        <div>
          <h4
            className={`font-serif text-lg font-semibold mb-4 ${isDark ? "text-gold-400" : "text-gold-400"}`}
          >
            {t.footer.contact}
          </h4>
          <div
            className={`space-y-2 text-sm ${isDark ? "text-gray-400" : "text-gray-400"}`}
          >
            <p>{t.footer.address}</p>
            <p>{t.footer.city}</p>
            <p>{t.footer.email}</p>
            <p>{t.hero.phone}</p>
          </div>
        </div>
      </div>

      <div
        className={`mt-12 pt-8 border-t text-center ${isDark ? "border-gold-700/30 text-gray-500" : "border-gray-800 text-gray-500"}`}
      >
        <p className="text-sm">
          © 2024 {config.restaurant_name}. {t.footer.rights}
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
