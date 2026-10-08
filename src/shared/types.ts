export interface AICellContext {
  cellAddress: string;          // e.g., "D14"
  cellValue: string;            // current value of the cell
  columnHeader: string;         // value of the first row in this column
  rowContext: string[];          // values of all cells in the same row
  columnContext: string[];       // values of cells in the same column (up to 20)
  surroundingFormulas: string[]; // formulas in adjacent cells
  sheetName: string;            // current sheet name
}

export interface AIRequest {
  id: string;                   // UUID
  cellAddress: string;
  userText: string;             // natural language request
  cellContext: AICellContext;
  timestamp: number;
  isPrediction: boolean;        // true if background prediction, false if user-initiated
}

export interface AIResponse {
  id: string;                   // matches request ID
  requestId: string;
  formula: string;              // generated Excel formula
  confidence: number;           // 0-1, how confident the AI is
  fromCache: boolean;           // true if served from cache
  timestamp: number;
  error?: string | null;        // error message if failed
}

export interface AIHistoryEntry {
  id: string;
  cellAddress: string;
  userText: string;
  formula: string;
  sheetName?: string;
  filePath?: string;
  timestamp: number;
  wasApplied: boolean;          // whether user clicked "Apply"
}

export interface PredictionFormula {
  description: string;
  formula: string;
}

export interface RecentFileEntry {
  id?: number;
  path: string;
  name: string;
  lastOpened: number;
}

export interface UserPreferences {
  language: 'en' | 'ckb';
  theme: 'dark' | 'light';
  geminiApiKey?: string;
}

export type Language = 'en' | 'ckb';
export type PageType = 'dashboard' | 'workspace';
export type AIStatusType = 'active' | 'idle' | 'error';
