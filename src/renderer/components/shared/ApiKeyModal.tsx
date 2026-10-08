import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, Sparkles, X, ShieldCheck } from 'lucide-react';
import { ipcBridge } from '../../services/ipc-bridge';
import { useAppStore } from '../../store/appStore';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { addToast } = useAppStore();
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await ipcBridge.setApiKey(apiKey.trim());
      if (res.success) {
        addToast({
          type: 'success',
          message: 'Gemini API key saved securely',
        });
        onClose();
      } else {
        addToast({
          type: 'error',
          message: 'Failed to save API key',
        });
      }
    } catch {
      addToast({
        type: 'error',
        message: 'Error saving API key',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    ipcBridge.setPreferences({ apiKeySkipped: 'true' }).catch(() => {});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900/90 border border-white/15 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl text-slate-100 flex flex-col gap-5">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 ltr:right-4 rtl:left-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={t('common.close')}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              {t('setup.apiKeyTitle')}
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {t('setup.apiKeyDescription')}
            </p>
          </div>
        </div>

        {/* Security Info Badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Encrypted with safeStorage & stored strictly locally on your device.</span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t('setup.apiKeyPlaceholder')}
              autoFocus
              className="w-full h-11 px-3.5 rounded-xl bg-white/[0.06] border border-white/15 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-mono text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              type="submit"
              disabled={!apiKey.trim() || isSubmitting}
              className="w-full sm:flex-1 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{t('setup.apiKeySubmit')}</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto px-4 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer border border-white/10"
            >
              {t('setup.apiKeySkip')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
