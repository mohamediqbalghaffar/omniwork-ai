import React from 'react';
import { useAppStore } from '../../store/appStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-12 ltr:right-4 rtl:left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderAndBg = 'border-blue-500/30 bg-slate-900/90 text-blue-200';
        let Icon = Info;

        if (toast.type === 'success') {
          borderAndBg = 'border-emerald-500/40 bg-slate-900/95 text-emerald-200';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          borderAndBg = 'border-red-500/40 bg-slate-900/95 text-red-200';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          borderAndBg = 'border-amber-500/40 bg-slate-900/95 text-amber-200';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${borderAndBg}`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
