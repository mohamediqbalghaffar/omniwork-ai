import { AIRequest, AIResponse, AICellContext, RecentFileEntry, AIHistoryEntry, AIStatusType } from '../../shared/types';
import { SpreadsheetFileData } from '../../main/utils/file-manager';

export const ipcBridge = {
  // AI
  async sendAIRequest(request: AIRequest): Promise<AIResponse> {
    if (window.electronAPI?.sendAIRequest) {
      return window.electronAPI.sendAIRequest(request);
    }
    // Mock fallback if running in pure browser / vitest
    const cell = request.cellAddress || 'A1';
    const match = cell.match(/^([A-Z]+)(\d+)$/i);
    const col = match ? match[1].toUpperCase() : 'A';
    const row = match ? parseInt(match[2], 10) : 1;
    const prevRow = Math.max(1, row - 1);
    return {
      id: request.id,
      requestId: request.id,
      formula: `=SUM(${col}1:${col}${prevRow})`,
      confidence: 0.95,
      fromCache: false,
      timestamp: Date.now(),
      error: null,
    };
  },

  sendCellContext(context: AICellContext): void {
    if (window.electronAPI?.sendCellContext) {
      window.electronAPI.sendCellContext(context);
    }
  },

  async setApiKey(apiKey: string): Promise<{ success: boolean }> {
    if (window.electronAPI?.setApiKey) {
      return window.electronAPI.setApiKey(apiKey);
    }
    return { success: true };
  },

  async hasApiKey(): Promise<{ hasKey: boolean }> {
    if (window.electronAPI?.hasApiKey) {
      return window.electronAPI.hasApiKey();
    }
    return { hasKey: true };
  },

  onAIResponse(callback: (response: AIResponse) => void): () => void {
    if (window.electronAPI?.onAIResponse) {
      return window.electronAPI.onAIResponse(callback);
    }
    return () => {};
  },

  onAIStatus(callback: (status: AIStatusType) => void): () => void {
    if (window.electronAPI?.onAIStatus) {
      return window.electronAPI.onAIStatus(callback);
    }
    return () => {};
  },

  // File
  async openFile(): Promise<{ canceled: boolean; filePath?: string; fileName?: string; data?: SpreadsheetFileData }> {
    if (window.electronAPI?.openFile) {
      return window.electronAPI.openFile();
    }
    return { canceled: true };
  },

  async saveFile(payload: { filePath: string | null; data: SpreadsheetFileData }): Promise<{ success: boolean; filePath?: string; fileName?: string }> {
    if (window.electronAPI?.saveFile) {
      return window.electronAPI.saveFile(payload);
    }
    return { success: true, filePath: 'mock.xlsx', fileName: 'mock.xlsx' };
  },

  async saveFileAs(payload: { data: SpreadsheetFileData; defaultName?: string }): Promise<{ canceled: boolean; success?: boolean; filePath?: string; fileName?: string }> {
    if (window.electronAPI?.saveFileAs) {
      return window.electronAPI.saveFileAs(payload);
    }
    return { canceled: true };
  },

  // Database
  async getRecentFiles(): Promise<RecentFileEntry[]> {
    if (window.electronAPI?.getRecentFiles) {
      return window.electronAPI.getRecentFiles();
    }
    return [];
  },

  async getAIHistory(): Promise<AIHistoryEntry[]> {
    if (window.electronAPI?.getAIHistory) {
      return window.electronAPI.getAIHistory();
    }
    return [];
  },

  async getPreferences(): Promise<Record<string, string>> {
    if (window.electronAPI?.getPreferences) {
      return window.electronAPI.getPreferences();
    }
    return { language: 'ckb', theme: 'dark' };
  },

  async setPreferences(prefs: Record<string, string>): Promise<{ success: boolean }> {
    if (window.electronAPI?.setPreferences) {
      return window.electronAPI.setPreferences(prefs);
    }
    return { success: true };
  },

  // Window Controls
  minimize(): void {
    if (window.electronAPI?.minimize) window.electronAPI.minimize();
  },

  maximize(): void {
    if (window.electronAPI?.maximize) window.electronAPI.maximize();
  },

  close(): void {
    if (window.electronAPI?.close) window.electronAPI.close();
  },

  async isMaximized(): Promise<boolean> {
    if (window.electronAPI?.isMaximized) {
      return window.electronAPI.isMaximized();
    }
    return false;
  },
};
