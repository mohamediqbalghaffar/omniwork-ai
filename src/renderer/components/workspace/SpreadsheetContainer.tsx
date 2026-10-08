import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Univer, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import { spreadsheetService } from '../../services/spreadsheet-service';
import { GlowButton } from '../shared/GlowButton';

interface SpreadsheetContainerProps {
  dataGrid: (string | number | boolean | null)[][];
  onCellChange: (address: string, value: string) => void;
}

export const SpreadsheetContainer: React.FC<SpreadsheetContainerProps> = ({
  dataGrid,
  onCellChange,
}) => {
  const { t } = useTranslation();
  const { selectedCell, setSelectedCell } = useSpreadsheetStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const univerRef = useRef<Univer | null>(null);
  const workbookRef = useRef<any>(null);

  const [engineError, setEngineError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [useFallbackGrid, setUseFallbackGrid] = useState(false);

  const numRows = Math.max(40, dataGrid.length);
  const numCols = 15;
  const colHeaders = Array.from({ length: numCols }, (_, i) => String.fromCharCode(65 + i));

  // Initialize Univer instance
  const initUniver = () => {
    try {
      setEngineError(null);

      // Check if canvas/DOM is available
      if (typeof window === 'undefined' || !containerRef.current) {
        setUseFallbackGrid(true);
        return;
      }

      // Check for real browser canvas support (suppressing jsdom warnings)
      const isJsdom = typeof window !== 'undefined' && (
        'jsdom' in window ||
        navigator.userAgent.includes('jsdom') ||
        (process.env.VITEST !== undefined)
      );
      if (isJsdom) {
        setUseFallbackGrid(true);
        return;
      }

      const testCanvas = document.createElement('canvas');
      const has2d = Boolean(testCanvas.getContext && testCanvas.getContext('2d'));
      if (!has2d) {
        setUseFallbackGrid(true);
        return;
      }

      // Clean up previous instance if any
      if (univerRef.current) {
        try {
          univerRef.current.dispose();
        } catch {
          // Ignore dispose errors
        }
        univerRef.current = null;
      }

      const univer = new Univer();
      univer.registerPlugin(UniverSheetsPlugin);
      univer.registerPlugin(UniverFormulaEnginePlugin);
      univer.registerPlugin(UniverSheetsFormulaPlugin);
      univer.registerPlugin(UniverSheetsNumfmtPlugin);

      // Build cellData from dataGrid
      const cellData: Record<number, Record<number, { v: string }>> = {};
      dataGrid.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val != null && val !== '') {
            if (!cellData[r]) cellData[r] = {};
            cellData[r][c] = { v: String(val) };
          }
        });
      });

      const wb = univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
        id: 'workbook-omniwork',
        sheets: {
          sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            cellData,
          },
        },
      });

      univerRef.current = univer;
      workbookRef.current = wb;
    } catch (err: any) {
      console.warn('Univer initialization fallback to interactive grid:', err);
      // As per Section 17, catch error and permit restart or fallback
      setUseFallbackGrid(true);
    }
  };

  useEffect(() => {
    initUniver();

    return () => {
      if (univerRef.current) {
        try {
          univerRef.current.dispose();
        } catch {
          // Ignore dispose errors
        }
        univerRef.current = null;
      }
    };
  }, []);

  const handleRestartEngine = () => {
    setEngineError(null);
    setUseFallbackGrid(false);
    initUniver();
  };

  const handleCellClick = (r: number, c: number) => {
    const address = spreadsheetService.coordinateToAddress(r, c);
    const value = dataGrid[r]?.[c] != null ? String(dataGrid[r][c]) : '';
    setSelectedCell({
      address,
      value,
      row: r,
      column: c,
    });
    setEditingCell(null);
  };

  const handleCellDoubleClick = (r: number, c: number) => {
    const value = dataGrid[r]?.[c] != null ? String(dataGrid[r][c]) : '';
    setEditingCell({ row: r, col: c });
    setEditValue(value);
  };

  const handleEditSubmit = () => {
    if (editingCell) {
      const address = spreadsheetService.coordinateToAddress(editingCell.row, editingCell.col);
      onCellChange(address, editValue);

      // Also update Univer cellMatrix if active
      if (workbookRef.current) {
        try {
          const sheet = workbookRef.current.getActiveSheet();
          sheet?.getCellMatrix()?.setValue(editingCell.row, editingCell.col, { v: editValue });
        } catch {
          // Non-critical
        }
      }

      setEditingCell(null);
    }
  };

  // Evaluate simple formulas for display
  const renderCellValue = (raw: string | number | boolean | null) => {
    if (raw == null) return '';
    const str = String(raw);
    if (!str.startsWith('=')) return str;

    // Evaluate basic formulas like =SUM(A1:A5)
    const sumMatch = str.match(/^=SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)$/i);
    if (sumMatch) {
      const colStart = sumMatch[1].toUpperCase().charCodeAt(0) - 65;
      const rowStart = parseInt(sumMatch[2], 10) - 1;
      const colEnd = sumMatch[3].toUpperCase().charCodeAt(0) - 65;
      const rowEnd = parseInt(sumMatch[4], 10) - 1;

      let sum = 0;
      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const val = parseFloat(String(dataGrid[r]?.[c] || '0'));
          if (!isNaN(val)) sum += val;
        }
      }
      return sum.toString();
    }

    return str;
  };

  // Error overlay according to PRD Section 17 & 23
  if (engineError) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-950 p-6 text-center select-none">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-100 mb-2">
          {t('errors.spreadsheetError')}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          {engineError}
        </p>
        <GlowButton variant="blue" onClick={handleRestartEngine} className="gap-2 text-xs">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('errors.restart')}</span>
        </GlowButton>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="spreadsheet-container"
      className="spreadsheet-container flex flex-col flex-1 h-full bg-slate-950 text-slate-200 select-none overflow-hidden font-sans"
      style={{ direction: 'ltr', textAlign: 'left' }}
    >
      {/* 1. Formula Bar */}
      <div className="h-9 bg-slate-900 border-b border-white/10 flex items-center px-3 gap-2 flex-shrink-0 text-xs">
        <div className="w-14 font-mono font-bold text-center bg-white/5 py-1 rounded border border-white/10 text-emerald-400">
          {selectedCell?.address || 'A1'}
        </div>
        <span className="font-serif italic font-bold text-slate-500 text-sm">fx</span>
        <input
          type="text"
          value={
            editingCell
              ? editValue
              : (selectedCell?.value ?? String(dataGrid[selectedCell?.row || 0]?.[selectedCell?.column || 0] ?? ''))
          }
          onChange={(e) => {
            const val = e.target.value;
            if (editingCell) {
              setEditValue(val);
            } else if (selectedCell) {
              setEditingCell({ row: selectedCell.row, col: selectedCell.column });
              setEditValue(val);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEditSubmit();
            if (e.key === 'Escape') setEditingCell(null);
          }}
          placeholder="Enter a formula or value..."
          className="flex-1 bg-transparent px-2 py-0.5 text-slate-100 font-mono text-xs outline-none"
        />
      </div>

      {/* 2. Grid Canvas */}
      <div className="flex-1 overflow-auto bg-slate-950 relative">
        <table className="border-collapse table-fixed w-full min-w-[900px] text-xs">
          <thead>
            <tr className="bg-slate-900/90 sticky top-0 z-10 border-b border-white/10">
              <th className="w-12 h-6 border-r border-white/10 bg-slate-900 sticky left-0 z-20" />
              {colHeaders.map((col) => (
                <th
                  key={col}
                  className="w-24 h-6 border-r border-white/10 font-medium text-slate-400 text-center tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numRows }, (_, r) => (
              <tr key={r} className="border-b border-white/5 hover:bg-white/[0.01]">
                {/* Row Header */}
                <td className="w-12 h-6 bg-slate-900/90 border-r border-white/10 text-center text-[11px] font-mono text-slate-500 font-medium sticky left-0 z-10">
                  {r + 1}
                </td>
                {/* Cells */}
                {Array.from({ length: numCols }, (_, c) => {
                  const isSelected = selectedCell?.row === r && selectedCell?.column === c;
                  const isEditing = editingCell?.row === r && editingCell?.col === c;
                  const cellRawValue = dataGrid[r]?.[c] ?? '';
                  const displayValue = renderCellValue(cellRawValue);

                  return (
                    <td
                      key={c}
                      onClick={() => handleCellClick(r, c)}
                      onDoubleClick={() => handleCellDoubleClick(r, c)}
                      className={`h-6 border-r border-white/5 px-2 font-mono text-xs truncate relative cursor-cell transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/15 ring-2 ring-emerald-500 z-10'
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleEditSubmit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSubmit();
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="w-full h-full bg-slate-900 text-white outline-none font-mono text-xs px-1"
                        />
                      ) : (
                        <span className={String(cellRawValue).startsWith('=') ? 'text-emerald-400 font-semibold' : ''}>
                          {displayValue}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Sheet Tabs Footer */}
      <div className="h-7 bg-slate-900 border-t border-white/10 flex items-center px-3 gap-2 flex-shrink-0 text-xs text-slate-400 select-none">
        <div className="px-3 py-1 bg-slate-800 text-slate-200 border-t border-emerald-500 font-medium rounded-t text-[11px]">
          Sheet1
        </div>
        <span className="text-[10px] text-slate-500 ltr:ml-auto rtl:mr-auto">Ready</span>
      </div>
    </div>
  );
};
