import { useCallback } from 'react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';
import { useAppStore } from '../store/appStore';
import { ipcBridge } from '../services/ipc-bridge';
import { useTranslation } from 'react-i18next';

export function useFileOperations(
  dataGrid: (string | number | boolean | null)[][],
  onDataLoaded?: (sheets: { name: string; data: (string | number | boolean | null)[][] }[]) => void
) {
  const { filePath, setFilePath, setFileName, setDirty, addRecentFile } = useSpreadsheetStore();
  const { addToast } = useAppStore();
  const { t } = useTranslation();

  const openFile = useCallback(async () => {
    try {
      const res = await ipcBridge.openFile();
      if (!res.canceled && res.data && res.filePath && res.fileName) {
        setFilePath(res.filePath);
        setFileName(res.fileName);
        setDirty(false);
        addRecentFile({ path: res.filePath, name: res.fileName });
        if (onDataLoaded) {
          onDataLoaded(res.data.sheets);
        }
        addToast({
          type: 'success',
          message: `${res.fileName} opened successfully`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        message: t('errors.fileOpenFailed'),
      });
    }
  }, [setFilePath, setFileName, setDirty, addRecentFile, onDataLoaded, addToast, t]);

  const saveFile = useCallback(async () => {
    try {
      const payload = {
        filePath,
        data: {
          sheets: [{ name: 'Sheet1', data: dataGrid }],
        },
      };

      const res = await ipcBridge.saveFile(payload);
      if (res.success && res.filePath && res.fileName) {
        setFilePath(res.filePath);
        setFileName(res.fileName);
        setDirty(false);
        addRecentFile({ path: res.filePath, name: res.fileName });
        addToast({
          type: 'success',
          message: `${res.fileName} saved`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        message: t('errors.fileSaveFailed'),
      });
    }
  }, [filePath, dataGrid, setFilePath, setFileName, setDirty, addRecentFile, addToast, t]);

  const saveFileAs = useCallback(async () => {
    try {
      const res = await ipcBridge.saveFileAs({
        data: { sheets: [{ name: 'Sheet1', data: dataGrid }] },
        defaultName: 'Workbook.xlsx',
      });

      if (!res.canceled && res.success && res.filePath && res.fileName) {
        setFilePath(res.filePath);
        setFileName(res.fileName);
        setDirty(false);
        addRecentFile({ path: res.filePath, name: res.fileName });
        addToast({
          type: 'success',
          message: `${res.fileName} saved`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        message: t('errors.fileSaveFailed'),
      });
    }
  }, [dataGrid, setFilePath, setFileName, setDirty, addRecentFile, addToast, t]);

  return {
    openFile,
    saveFile,
    saveFileAs,
  };
}
