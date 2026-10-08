import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAIStore } from '../../store/aiStore';

export const BackgroundStatusBadge: React.FC = () => {
  const { t } = useTranslation();
  const { backgroundStatus } = useAIStore();

  let dotColor = 'bg-slate-400';
  let statusText = t('workspace.sidebar.statusIdle');

  if (backgroundStatus === 'active') {
    dotColor = 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]';
    statusText = t('workspace.sidebar.statusActive');
  } else if (backgroundStatus === 'error') {
    dotColor = 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
    statusText = t('workspace.sidebar.statusError');
  }

  return (
    <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between text-xs select-none">
      <span className="text-slate-400">{t('workspace.sidebar.backgroundSync')}</span>
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-[11px] font-medium text-slate-200">{statusText}</span>
      </div>
    </div>
  );
};
