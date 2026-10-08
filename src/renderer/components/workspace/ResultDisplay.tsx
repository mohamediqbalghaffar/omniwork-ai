import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, CheckCheck } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface ResultDisplayProps {
  formula: string | null;
  error?: string | null;
  fromCache?: boolean;
  onApply: (formula: string) => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  formula,
  error,
  fromCache = false,
  onApply,
}) => {
  const { t } = useTranslation();
  const { addToast } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleCopy = async () => {
    if (!formula) return;
    try {
      await navigator.clipboard.writeText(formula);
      setCopied(true);
      addToast({
        type: 'success',
        message: t('workspace.sidebar.copied'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleApply = () => {
    if (!formula) return;
    onApply(formula);
    setApplied(true);
    addToast({
      type: 'success',
      message: t('workspace.sidebar.applied'),
    });
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {t('workspace.sidebar.result')}
        </label>
        {fromCache && formula && (
          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Instant (Cached)
          </span>
        )}
      </div>

      <div
        className={`min-h-[80px] p-3.5 rounded-xl bg-white/[0.06] backdrop-blur-md flex flex-col justify-between transition-all duration-200 ${
          error
            ? 'border border-red-500/40 bg-red-950/20'
            : formula
            ? 'border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
            : 'border border-white/10'
        }`}
      >
        {/* Content */}
        {error ? (
          <div className="text-xs text-red-400 leading-relaxed">{error}</div>
        ) : formula ? (
          <div className="font-mono text-sm text-emerald-400 font-semibold break-all select-all">
            {formula}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic flex items-center h-full">
            {t('workspace.sidebar.resultPlaceholder')}
          </div>
        )}

        {/* Action Buttons */}
        {formula && !error && (
          <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-white/10">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('workspace.sidebar.copied') : t('workspace.sidebar.copy')}</span>
            </button>

            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{applied ? t('workspace.sidebar.applied') : t('workspace.sidebar.apply')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
