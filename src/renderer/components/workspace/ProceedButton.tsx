import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import { Tooltip } from '../shared/Tooltip';

interface ProceedButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ProceedButton: React.FC<ProceedButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <Tooltip
        content={disabled && !isLoading ? t('errors.emptyRequest') : ''}
        position="top"
      >
        <button
          onClick={onClick}
          disabled={disabled || isLoading}
          title={disabled && !isLoading ? t('errors.emptyRequest') : undefined}
          className={`w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 select-none shadow-lg ${
            disabled || isLoading
              ? 'bg-blue-600/50 text-white/50 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.98] cursor-pointer'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('workspace.sidebar.processing')}</span>
            </span>
          ) : (
            <>
              <span>{t('workspace.sidebar.proceed')}</span>
              <Play className="w-3.5 h-3.5 fill-current proceed-icon shrink-0" />
            </>
          )}
        </button>
      </Tooltip>
    </div>
  );
};
