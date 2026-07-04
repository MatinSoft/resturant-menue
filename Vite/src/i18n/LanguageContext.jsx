import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const languages = {
  en: {
    code: 'en',
    name: 'English',
    dir: 'ltr',
    flag: '🇬🇧'
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    dir: 'rtl',
    flag: '🇴🇲'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    const saved = localStorage.getItem('app-language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = languages[currentLang].dir;
  }, [currentLang]);

  const toggleLanguage = () => {
    setCurrentLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLang, 
      setCurrentLang, 
      toggleLanguage,
      isRTL: currentLang === 'ar'
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageContext;