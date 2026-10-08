import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { historyRepo, recentFilesRepo } from '../database/history.repo';
import { preferencesRepo } from '../database/preferences.repo';
import { DbPrefsSchema } from './validation';

export function registerDbIPC() {
  ipcMain.handle(IPC_CHANNELS.DB_GET_RECENT, async () => {
    return recentFilesRepo.getAll();
  });

  ipcMain.handle(IPC_CHANNELS.DB_GET_HISTORY, async () => {
    return historyRepo.getAll();
  });

  ipcMain.handle(IPC_CHANNELS.DB_GET_PREFS, async () => {
    return preferencesRepo.getAll();
  });

  ipcMain.handle(IPC_CHANNELS.DB_SET_PREFS, async (_event, rawPrefs: unknown) => {
    const prefs = DbPrefsSchema.parse(rawPrefs);
    for (const [key, val] of Object.entries(prefs)) {
      preferencesRepo.set(key, val);
    }
    return { success: true };
  });
}
