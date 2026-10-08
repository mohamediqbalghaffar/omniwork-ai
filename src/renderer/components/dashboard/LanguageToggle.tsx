import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

export const LanguageToggle: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <div
      role="radiogroup"
      aria-label="Language selector"
      className="flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 text-xs font-semibold select-none backdrop-blur-md"
    >
      <button
        role="radio"
        aria-checked={currentLanguage === 'en'}
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
          currentLanguage === 'en'
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/50'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        EN
      </button>
      <button
        role="radio"
        aria-checked={currentLanguage === 'ckb'}
        onClick={() => setLanguage('ckb')}
        className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
          currentLanguage === 'ckb'
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/50'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        کو
      </button>
    </div>
  );
};
