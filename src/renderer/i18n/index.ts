import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import ckb from './locales/ckb/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ckb: { translation: ckb },
  },
  lng: 'ckb',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ckb' ? 'rtl' : 'ltr';
  if (typeof document !== 'undefined') {
    document.documentElement.dir = dir;
    document.documentElement.lang = lng;
  }
});

// Set initial document direction if DOM is available
if (typeof document !== 'undefined') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ckb';
}

export default i18n;
