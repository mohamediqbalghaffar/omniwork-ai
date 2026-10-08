import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { CellSelector } from './CellSelector';
import { RequestInput } from './RequestInput';
import { ProceedButton } from './ProceedButton';
import { ResultDisplay } from './ResultDisplay';
import { FormulaHistoryList } from './FormulaHistoryList';
import { BackgroundStatusBadge } from './BackgroundStatusBadge';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import { useAI } from '../../hooks/useAI';
import { AIHistoryEntry } from '../../../shared/types';

interface AISidebarProps {
  dataGrid: (string | number | boolean | null)[][];
  onApplyFormula: (address: string, formula: string) => void;
}

export const AISidebar: React.FC<AISidebarProps> = ({ dataGrid, onApplyFormula }) => {
  const { t } = useTranslation();
  const { selectedCell, setSelectedCell } = useSpreadsheetStore();
  const [requestText, setRequestText] = useState('');

  const { requestFormula, isLoading, currentResult, error } = useAI(dataGrid);

  const handleProceed = () => {
    if (requestText.trim()) {
      requestFormula(requestText, selectedCell?.address);
    }
  };

  const handleApply = (formula: string) => {
    const address = selectedCell?.address || 'A1';
    onApplyFormula(address, formula);
  };

  const handleSelectHistory = (item: AIHistoryEntry) => {
    if (item.cellAddress) {
      setSelectedCell({
        address: item.cellAddress,
        value: item.formula,
        row: selectedCell?.row || 0,
        column: selectedCell?.column || 0,
      });
    }
    setRequestText(item.userText);
  };

  return (
    <aside className="w-[280px] min-w-[280px] h-full bg-slate-900/75 backdrop-blur-2xl border-l rtl:border-l-0 rtl:border-r border-white/10 p-5 flex flex-col gap-4 overflow-y-auto select-none z-20">
      {/* 1. Header */}
      <div className="flex items-center gap-2 pb-1 border-b border-white/10">
        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-slate-100 tracking-wide">
          {t('workspace.sidebar.title')}
        </h2>
      </div>

      {/* 2. Cell Selector */}
      <CellSelector
        value={selectedCell?.address || 'A1'}
        onChange={(addr) => {
          setSelectedCell({
            address: addr,
            value: selectedCell?.value || '',
            row: selectedCell?.row || 0,
            column: selectedCell?.column || 0,
          });
        }}
      />

      {/* 3. Request Input */}
      <RequestInput
        value={requestText}
        onChange={setRequestText}
        onSubmit={handleProceed}
        disabled={isLoading}
      />

      {/* 4. Proceed Button */}
      <ProceedButton
        onClick={handleProceed}
        isLoading={isLoading}
        disabled={!requestText.trim()}
      />

      {/* 5. Result Display */}
      <ResultDisplay
        formula={currentResult?.formula || null}
        error={error || currentResult?.error || null}
        fromCache={currentResult?.fromCache}
        onApply={handleApply}
      />

      {/* 6. Divider */}
      <div className="h-px w-full bg-white/10 my-1" />

      {/* 7. Formula History */}
      <FormulaHistoryList onSelectFormula={handleSelectHistory} />

      {/* 8. Background Status Badge (pinned to bottom) */}
      <BackgroundStatusBadge />
    </aside>
  );
};
