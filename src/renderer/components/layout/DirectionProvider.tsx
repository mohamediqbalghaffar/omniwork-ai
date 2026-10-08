import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

const DirectionContext = createContext<'ltr' | 'rtl'>('rtl');

export const DirectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const dir = i18n.language === 'ckb' ? 'rtl' : 'ltr';

  return (
    <DirectionContext.Provider value={dir}>
      <div dir={dir} className={`min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col ${dir === 'rtl' ? 'font-kurdish' : 'font-english'}`}>
        {children}
      </div>
    </DirectionContext.Provider>
  );
};

export const useDirection = () => useContext(DirectionContext);
