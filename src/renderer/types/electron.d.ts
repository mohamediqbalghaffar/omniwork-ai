import { AIRequest, AIResponse, AICellContext, RecentFileEntry, AIHistoryEntry, AIStatusType } from '../../shared/types';
import { SpreadsheetFileData } from '../../main/utils/file-manager';

export interface ElectronAPI {
  // AI
  sendAIRequest: (request: AIRequest) => Promise<AIResponse>;
  sendCellContext: (context: AICellContext) => void;
  setApiKey: (apiKey: string) => Promise<{ success: boolean }>;
  hasApiKey: () => Promise<{ hasKey: boolean }>;
  onAIResponse: (callback: (response: AIResponse) => void) => () => void;
  onAIStatus: (callback: (status: AIStatusType) => void) => () => void;

  // File
  openFile: () => Promise<{ canceled: boolean; filePath?: string; fileName?: string; data?: SpreadsheetFileData }>;
  saveFile: (payload: { filePath: string | null; data: SpreadsheetFileData }) => Promise<{ success: boolean; filePath?: string; fileName?: string }>;
  saveFileAs: (payload: { data: SpreadsheetFileData; defaultName?: string }) => Promise<{ canceled: boolean; success?: boolean; filePath?: string; fileName?: string }>;

  // Database
  getRecentFiles: () => Promise<RecentFileEntry[]>;
  getAIHistory: () => Promise<AIHistoryEntry[]>;
  getPreferences: () => Promise<Record<string, string>>;
  setPreferences: (prefs: Record<string, string>) => Promise<{ success: boolean }>;

  // App window controls
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.woff2' {
  const content: string;
  export default module;
}
