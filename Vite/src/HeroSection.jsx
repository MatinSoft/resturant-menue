const HeroSection = ({ config, isDark, t }) => (
  <section
    className={`relative py-16 md:py-24 lg:py-32 overflow-hidden transition-colors duration-300 ${
      isDark
        ? "bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg"
        : "bg-gradient-to-br from-charcoal via-gray-900 to-charcoal"
    } text-white hidden md:block`}
  >
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-40 h-40 border border-gold-400 rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 border border-gold-400 rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-gold-400 rounded-full"></div>
    </div>

    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p
        className="text-gold-400 font-medium tracking-widest uppercase text-sm mb-4 fade-in"
        style={{ opacity: 0, animationFillMode: "forwards" }}
      >
        {t.hero.welcome}
      </p>
      <h1
        className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold mb-6 fade-in-up"
        style={{
          opacity: 0,
          animationFillMode: "forwards",
          animationDelay: "0.1s",
        }}
      >
        {config.restaurant_name}
      </h1>
      <div
        className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mb-6 fade-in"
        style={{
          opacity: 0,
          animationFillMode: "forwards",
          animationDelay: "0.2s",
        }}
      ></div>
      <p
        className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed fade-in-up"
        style={{
          opacity: 0,
          animationFillMode: "forwards",
          animationDelay: "0.3s",
        }}
      >
        {t.hero.description}
      </p>

      <div
        className="mt-10 flex flex-wrap justify-center gap-6 text-sm fade-in-up"
        style={{
          opacity: 0,
          animationFillMode: "forwards",
          animationDelay: "0.4s",
        }}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gold-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{t.hero.hours}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gold-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{t.hero.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gold-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <span>{t.hero.phone}</span>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
