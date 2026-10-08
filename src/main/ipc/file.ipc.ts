import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as path from 'path';
import { IPC_CHANNELS } from '../../shared/constants';
import { fileManager, SpreadsheetFileData } from '../utils/file-manager';
import { recentFilesRepo } from '../database/history.repo';
import { FileSaveSchema, FileSaveAsSchema } from './validation';
import { logger } from '../utils/logger';

export function registerFileIPC() {
  ipcMain.handle(IPC_CHANNELS.FILE_OPEN, async () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(focusedWindow || (undefined as any), {
      title: 'Open Spreadsheet',
      properties: ['openFile'],
      filters: [
        { name: 'Spreadsheets', extensions: ['xlsx', 'xls', 'csv'] },
        { name: 'Excel Workbook', extensions: ['xlsx'] },
        { name: 'Excel 97-2003 Workbook', extensions: ['xls'] },
        { name: 'CSV File', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath);

    try {
      const data = fileManager.readFile(filePath);
      recentFilesRepo.add(filePath, fileName);
      return {
        canceled: false,
        filePath,
        fileName,
        data,
      };
    } catch (err: any) {
      logger.error('Failed to open spreadsheet file:', err);
      throw new Error(`Failed to open file: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_SAVE, async (_event, rawPayload: unknown) => {
    const payload = FileSaveSchema.parse(rawPayload);
    const { filePath, data } = payload as { filePath: string | null; data: SpreadsheetFileData };

    if (!filePath) {
      // Trigger Save As dialog
      return handleSaveAs(data);
    }

    try {
      fileManager.saveFile(filePath, data);
      const fileName = path.basename(filePath);
      recentFilesRepo.add(filePath, fileName);
      return { success: true, filePath, fileName };
    } catch (err: any) {
      logger.error('Failed to save file:', err);
      throw new Error(`Failed to save file: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_SAVE_AS, async (_event, rawPayload: unknown) => {
    const payload = FileSaveAsSchema.parse(rawPayload);
    const { data, defaultName } = payload as { data: SpreadsheetFileData; defaultName?: string };
    return handleSaveAs(data, defaultName);
  });
}

async function handleSaveAs(data: SpreadsheetFileData, defaultName?: string) {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const result = await dialog.showSaveDialog(focusedWindow || (undefined as any), {
    title: 'Save Spreadsheet As',
    defaultPath: defaultName || 'Untitled.xlsx',
    filters: [
      { name: 'Excel Workbook', extensions: ['xlsx'] },
      { name: 'CSV File', extensions: ['csv'] },
    ],
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  const filePath = result.filePath;
  const fileName = path.basename(filePath);

  try {
    fileManager.saveFile(filePath, data);
    recentFilesRepo.add(filePath, fileName);
    return {
      canceled: false,
      success: true,
      filePath,
      fileName,
    };
  } catch (err: any) {
    logger.error('Failed to save file as:', err);
    throw new Error(`Failed to save file: ${err.message}`);
  }
}
