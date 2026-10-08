import { create } from 'zustand';

export interface SelectedCellData {
  address: string;
  value: string;
  row: number;
  column: number;
}

export interface RecentFileItem {
  path: string;
  name: string;
  lastOpened: number;
}

interface SpreadsheetState {
  filePath: string | null;
  fileName: string;
  isDirty: boolean;
  selectedCell: SelectedCellData | null;
  recentFiles: RecentFileItem[];

  setSelectedCell: (cell: SelectedCellData | null) => void;
  setFilePath: (path: string | null) => void;
  setFileName: (name: string) => void;
  setDirty: (dirty: boolean) => void;
  setRecentFiles: (files: RecentFileItem[]) => void;
  addRecentFile: (file: { path: string; name: string }) => void;
  resetSpreadsheet: () => void;
}

export const useSpreadsheetStore = create<SpreadsheetState>((set) => ({
  filePath: null,
  fileName: 'Untitled Spreadsheet',
  isDirty: false,
  selectedCell: {
    address: 'A1',
    value: '',
    row: 0,
    column: 0,
  },
  recentFiles: [],

  setSelectedCell: (selectedCell) => set({ selectedCell }),
  setFilePath: (filePath) => set({ filePath }),
  setFileName: (fileName) => set({ fileName }),
  setDirty: (isDirty) => set({ isDirty }),
  setRecentFiles: (recentFiles) => set({ recentFiles }),

  addRecentFile: (file) =>
    set((state) => {
      const filtered = state.recentFiles.filter((f) => f.path !== file.path);
      return {
        recentFiles: [
          { path: file.path, name: file.name, lastOpened: Date.now() },
          ...filtered,
        ].slice(0, 10),
      };
    }),

  resetSpreadsheet: () =>
    set({
      filePath: null,
      fileName: 'Untitled Spreadsheet',
      isDirty: false,
      selectedCell: {
        address: 'A1',
        value: '',
        row: 0,
        column: 0,
      },
    }),
}));
