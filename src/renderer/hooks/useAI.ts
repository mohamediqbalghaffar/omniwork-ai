import { useCallback } from 'react';
import { useAIStore } from '../store/aiStore';
import { useSpreadsheetStore } from '../store/spreadsheetStore';
import { useAppStore } from '../store/appStore';
import { ipcBridge } from '../services/ipc-bridge';
import { spreadsheetService } from '../services/spreadsheet-service';
import { AIRequest } from '../../shared/types';
import { useTranslation } from 'react-i18next';

export function useAI(dataGrid: (string | number | boolean | null)[][] = []) {
  const {
    isLoading,
    currentResult,
    error,
    setLoading,
    setCurrentRequest,
    setCurrentResult,
    addToHistory,
    setError,
    clearResult,
  } = useAIStore();

  const { selectedCell } = useSpreadsheetStore();
  const { addToast } = useAppStore();
  const { t } = useTranslation();

  const requestFormula = useCallback(
    async (requestText: string, customAddress?: string) => {
      const address = customAddress || selectedCell?.address || 'A1';

      if (!requestText.trim()) {
        addToast({
          type: 'warning',
          message: t('errors.emptyRequest'),
        });
        return;
      }

      if (!spreadsheetService.isValidAddress(address)) {
        addToast({
          type: 'error',
          message: t('errors.invalidCell'),
        });
        return;
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        addToast({
          type: 'warning',
          message: t('errors.noInternet'),
        });
      }

      setLoading(true);
      setError(null);

      const coord = spreadsheetService.addressToCoordinate(address) || { row: 0, col: 0 };
      const cellContext = spreadsheetService.extractCellContext(
        dataGrid,
        coord.row,
        coord.col,
        'Sheet1'
      );

      const request: AIRequest = {
        id: Math.random().toString(36).substring(2, 9),
        cellAddress: address,
        userText: requestText.trim(),
        cellContext,
        timestamp: Date.now(),
        isPrediction: false,
      };

      setCurrentRequest(request);

      try {
        const response = await ipcBridge.sendAIRequest(request);
        setCurrentResult(response);

        if (response.error && !response.formula) {
          setError(response.error);
          addToast({
            type: 'error',
            message: t('errors.aiUnavailable'),
          });
        } else {
          addToHistory({
            id: response.id,
            cellAddress: address,
            userText: requestText,
            formula: response.formula,
            sheetName: cellContext.sheetName,
            timestamp: response.timestamp,
            wasApplied: false,
          });
        }
      } catch (err: any) {
        const msg = err.message || t('errors.aiUnavailable');
        setError(msg);
        addToast({
          type: 'error',
          message: msg,
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedCell?.address, dataGrid, setLoading, setError, setCurrentRequest, setCurrentResult, addToHistory, addToast, t]
  );

  return {
    requestFormula,
    isLoading,
    currentResult,
    error,
    clearResult,
  };
}
