import React from 'react';
import { useTranslation } from 'react-i18next';

interface RequestInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const RequestInput: React.FC<RequestInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="request-input-textarea"
          className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          {t('workspace.sidebar.request')}
        </label>
        <span className="text-[10px] text-slate-500 font-mono">Ctrl+Enter</span>
      </div>
      <textarea
        id="request-input-textarea"
        dir="auto"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('workspace.sidebar.requestPlaceholder')}
        disabled={disabled}
        className="w-full p-3 rounded-[10px] bg-white/[0.06] border border-white/15 text-sm text-white placeholder-slate-500 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
      />
    </div>
  );
};
