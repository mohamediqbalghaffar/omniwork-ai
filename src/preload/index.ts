import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';

const electronAPI = {
  // AI
  sendAIRequest: (request: any) => ipcRenderer.invoke(IPC_CHANNELS.AI_REQUEST, request),
  sendCellContext: (context: any) => ipcRenderer.send(IPC_CHANNELS.AI_CELL_CONTEXT, context),
  setApiKey: (apiKey: string) => ipcRenderer.invoke(IPC_CHANNELS.AI_SET_API_KEY, { apiKey }),
  hasApiKey: () => ipcRenderer.invoke(IPC_CHANNELS.AI_HAS_API_KEY),
  onAIResponse: (callback: (response: any) => void) => {
    const handler = (_event: any, response: any) => callback(response);
    ipcRenderer.on(IPC_CHANNELS.AI_RESPONSE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.AI_RESPONSE, handler);
  },
  onAIStatus: (callback: (status: string) => void) => {
    const handler = (_event: any, status: string) => callback(status);
    ipcRenderer.on(IPC_CHANNELS.AI_STATUS, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.AI_STATUS, handler);
  },

  // File
  openFile: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN),
  saveFile: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE, data),
  saveFileAs: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE_AS, data),

  // Database
  getRecentFiles: () => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_RECENT),
  getAIHistory: () => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_HISTORY),
  getPreferences: () => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_PREFS),
  setPreferences: (prefs: any) => ipcRenderer.invoke(IPC_CHANNELS.DB_SET_PREFS, prefs),

  // App window controls
  minimize: () => ipcRenderer.send(IPC_CHANNELS.APP_MINIMIZE),
  maximize: () => ipcRenderer.send(IPC_CHANNELS.APP_MAXIMIZE),
  close: () => ipcRenderer.send(IPC_CHANNELS.APP_CLOSE),
  isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.APP_IS_MAXIMIZED),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error('Error exposing electronAPI in main world:', error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = electronAPI;
}
