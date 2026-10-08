import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppLauncherCardProps {
  id: 'excel' | 'word' | 'powerpoint';
  title: string;
  iconSrc: string;
  isAvailable?: boolean;
  onClick?: () => void;
  index?: number;
}

export const AppLauncherCard: React.FC<AppLauncherCardProps> = ({
  id,
  title,
  iconSrc,
  isAvailable = false,
  onClick,
  index = 0,
}) => {
  const { t } = useTranslation();

  const handleCardClick = () => {
    if (isAvailable && onClick) {
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={isAvailable ? 0 : -1}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
          handleCardClick();
        }
      }}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
      className={`relative w-[200px] h-[240px] rounded-[20px] p-6 flex flex-col items-center justify-center transition-all duration-300 select-none animate-in fade-in slide-in-from-bottom-4 ${
        isAvailable
          ? 'glass glow-green glow-green-hover hover:scale-105 active:scale-95 cursor-pointer border-white/20 hover:border-emerald-500/50'
          : 'bg-white/[0.04] backdrop-blur-md border border-white/10 opacity-40 grayscale cursor-not-allowed'
      }`}
    >
      {/* App Icon */}
      <div className="w-[72px] h-[72px] mb-4 flex items-center justify-center drop-shadow-md">
        <img
          src={iconSrc}
          alt={title}
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* App Title */}
      <h3 className="text-lg font-semibold text-slate-100 tracking-wide text-center">
        {title}
      </h3>

      {/* Subtitle if disabled */}
      {!isAvailable && (
        <span className="mt-2 text-xs font-medium text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
          {t('dashboard.apps.comingSoon')}
        </span>
      )}
    </div>
  );
};
