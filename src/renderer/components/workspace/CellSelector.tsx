import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { spreadsheetService } from '../../services/spreadsheet-service';

interface CellSelectorProps {
  value: string;
  onChange: (newAddress: string) => void;
}

export const CellSelector: React.FC<CellSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [internalVal, setInternalVal] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInternalVal(value);
    setIsValid(spreadsheetService.isValidAddress(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setInternalVal(val);
    const valid = spreadsheetService.isValidAddress(val);
    setIsValid(valid);
    if (valid) {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="cell-selector-input"
        className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
      >
        {t('workspace.sidebar.selectedCell')}
      </label>
      <div className="relative">
        <input
          id="cell-selector-input"
          type="text"
          value={internalVal}
          onChange={handleChange}
          placeholder="A1"
          maxLength={7}
          className={`w-full h-10 px-3.5 rounded-[10px] bg-white/[0.06] font-mono text-sm font-medium text-white placeholder-slate-500 outline-none transition-all duration-200 ${
            isValid
              ? 'border border-white/15 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              : 'border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
          }`}
        />
        {!isValid && (
          <span className="absolute -bottom-5 ltr:left-1 rtl:right-1 text-[10px] text-red-400">
            {t('errors.invalidCell')}
          </span>
        )}
      </div>
    </div>
  );
};
