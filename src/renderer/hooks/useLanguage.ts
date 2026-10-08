import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';

export function useLanguage() {
  const { i18n } = useTranslation();
  const { currentLanguage, setLanguage } = useAppStore();

  const toggleLanguage = useCallback(() => {
    const nextLang = currentLanguage === 'ckb' ? 'en' : 'ckb';
    setLanguage(nextLang);
  }, [currentLanguage, setLanguage]);

  const isRTL = currentLanguage === 'ckb';
  const direction: 'rtl' | 'ltr' = isRTL ? 'rtl' : 'ltr';

  return {
    currentLanguage,
    setLanguage,
    toggleLanguage,
    isRTL,
    direction,
  };
}
