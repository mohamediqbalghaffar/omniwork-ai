import React from 'react';
import { useTranslation } from 'react-i18next';
import { History } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';
import { AIHistoryEntry } from '../../../shared/types';

interface FormulaHistoryListProps {
  onSelectFormula: (entry: AIHistoryEntry) => void;
}

export const FormulaHistoryList: React.FC<FormulaHistoryListProps> = ({ onSelectFormula }) => {
  const { t } = useTranslation();
  const { history } = useAIStore();

  const formatRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return t('common.timeAgo.justNow');
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return t('common.timeAgo.minutesAgo', { count: diffMin });
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return t('common.timeAgo.hoursAgo', { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    return t('common.timeAgo.daysAgo', { count: diffDays });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
        <History className="w-3.5 h-3.5 text-slate-400" />
        <span>{t('workspace.sidebar.history')}</span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
        {history.length > 0 ? (
          history.slice(0, 5).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectFormula(item)}
              title={`${item.cellAddress}: ${item.userText} -> ${item.formula}`}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs cursor-pointer transition-colors flex flex-col gap-1"
            >
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="font-semibold text-blue-400">{item.cellAddress}</span>
                <span>{formatRelativeTime(item.timestamp)}</span>
              </div>
              <div className="font-mono text-emerald-400 truncate text-[11px]">
                {item.formula}
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-500 italic py-2">
            {t('workspace.sidebar.noHistory')}
          </div>
        )}
      </div>
    </div>
  );
};
