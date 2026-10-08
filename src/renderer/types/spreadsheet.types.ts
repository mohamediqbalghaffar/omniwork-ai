export interface SelectedCellInfo {
  address: string;
  value: string;
  row: number;
  column: number;
}

export interface SpreadsheetCellData {
  row: number;
  col: number;
  value: string | number | boolean | null;
  formula?: string;
}

export interface WorkbookSheetData {
  name: string;
  data: (string | number | boolean | null)[][];
}
