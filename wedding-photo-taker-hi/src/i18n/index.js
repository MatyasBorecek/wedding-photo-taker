import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import cs from './locales/cs.json';
import en from './locales/en.json';

const resources = {
  cs: {
    translation: cs
  },
  en: {
    translation: en
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'cs', // Czech as default
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      checkWhitelist: true
    },

    interpolation: {
      escapeValue: false
    },

    // Custom language detection logic
    lng: (() => {
      const browserLang = navigator.language || navigator.languages[0];
      const countryCode = browserLang.split('-')[1]?.toLowerCase();
      const langCode = browserLang.split('-')[0]?.toLowerCase();
      
      // Czech/Slovak users get Czech interface
      if (langCode === 'cs' || langCode === 'sk' || countryCode === 'cz' || countryCode === 'sk') {
        return 'cs';
      }
      
      // All others get English
      return 'en';
    })()
  });

export default i18n;