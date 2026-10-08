import { useEffect, useRef, useCallback, useState } from 'react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';
import { spreadsheetService } from '../services/spreadsheet-service';
import { ipcBridge } from '../services/ipc-bridge';
import { useAppStore } from '../store/appStore';
import { useTranslation } from 'react-i18next';

export function useSpreadsheet(containerId: string = 'spreadsheet-container') {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const univerRef = useRef<any>(null);
  const workbookRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [dataGrid, setDataGrid] = useState<(string | number | boolean | null)[][]>([]);

  const {
    selectedCell,
    setSelectedCell,
    setDirty,
    filePath,
    setFileName,
  } = useSpreadsheetStore();

  const { addToast } = useAppStore();
  const { t } = useTranslation();

  // Initialize spreadsheet data
  useEffect(() => {
    const initialData = spreadsheetService.createEmptyWorkbookData().sheets[0].data;
    setDataGrid(initialData);
  }, []);

  // When selected cell changes, notify AI background worker
  useEffect(() => {
    if (selectedCell && dataGrid.length > 0) {
      const coord = spreadsheetService.addressToCoordinate(selectedCell.address);
      if (coord) {
        const context = spreadsheetService.extractCellContext(
          dataGrid,
          coord.row,
          coord.col,
          'Sheet1'
        );
        ipcBridge.sendCellContext(context);
      }
    }
  }, [selectedCell?.address, dataGrid]);

  // Apply formula or value to cell
  const setCellValue = useCallback(
    (address: string, val: string) => {
      const coord = spreadsheetService.addressToCoordinate(address);
      if (!coord) return;

      setDataGrid((prev) => {
        const next = prev.map((row) => [...row]);
        // Expand rows/cols if needed
        while (next.length <= coord.row) {
          next.push(new Array(coord.col + 1).fill(''));
        }
        while (next[coord.row].length <= coord.col) {
          next[coord.row].push('');
        }
        next[coord.row][coord.col] = val;
        return next;
      });

      setSelectedCell({
        address,
        value: val,
        row: coord.row,
        column: coord.col,
      });

      setDirty(true);
    },
    [setDirty, setSelectedCell]
  );

  // Load workbook data
  const loadWorkbookData = useCallback(
    (sheets: { name: string; data: (string | number | boolean | null)[][] }[]) => {
      if (sheets.length > 0 && sheets[0].data) {
        setDataGrid(sheets[0].data);
        setDirty(false);
        // Reset selected cell to A1
        setSelectedCell({
          address: 'A1',
          value: sheets[0].data[0]?.[0] != null ? String(sheets[0].data[0][0]) : '',
          row: 0,
          column: 0,
        });
      }
    },
    [setDirty, setSelectedCell]
  );

  return {
    containerRef,
    isReady,
    dataGrid,
    setCellValue,
    loadWorkbookData,
  };
}
