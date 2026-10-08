import { AICellContext } from '../../shared/types';
import { SpreadsheetFileData } from '../../main/utils/file-manager';

export const spreadsheetService = {
  coordinateToAddress(row: number, col: number): string {
    let colName = '';
    let c = col;
    while (c >= 0) {
      colName = String.fromCharCode((c % 26) + 65) + colName;
      c = Math.floor(c / 26) - 1;
    }
    return `${colName}${row + 1}`;
  },

  addressToCoordinate(address: string): { row: number; col: number } | null {
    const match = address.trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;

    const colStr = match[1];
    const rowStr = match[2];

    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64);
    }
    col -= 1;
    const row = parseInt(rowStr, 10) - 1;

    return { row, col };
  },

  isValidAddress(address: string): boolean {
    return /^[A-Z]{1,3}[0-9]{1,7}$/i.test(address.trim());
  },

  extractCellContext(
    data: (string | number | boolean | null)[][],
    row: number,
    col: number,
    sheetName: string = 'Sheet1'
  ): AICellContext {
    const cellAddress = this.coordinateToAddress(row, col);
    const cellValue = data[row]?.[col] != null ? String(data[row][col]) : '';

    // Column header is row 0
    const columnHeader = data[0]?.[col] != null ? String(data[0][col]) : '';

    // Row context: cells in same row
    const rowContext: string[] = [];
    if (data[row]) {
      for (let c = 0; c < Math.min(data[row].length, 20); c++) {
        if (c !== col && data[row][c] != null && data[row][c] !== '') {
          rowContext.push(String(data[row][c]));
        }
      }
    }

    // Column context: cells in same column (up to 20)
    const columnContext: string[] = [];
    for (let r = 1; r < Math.min(data.length, 20); r++) {
      if (r !== row && data[r]?.[col] != null && data[r][col] !== '') {
        columnContext.push(String(data[r][col]));
      }
    }

    // Surrounding formulas
    const surroundingFormulas: string[] = [];
    const prevRow = row > 0 ? row - 1 : 0;
    if (data[prevRow]?.[col] && String(data[prevRow][col]).startsWith('=')) {
      surroundingFormulas.push(String(data[prevRow][col]));
    }

    return {
      cellAddress,
      cellValue,
      columnHeader,
      rowContext,
      columnContext,
      surroundingFormulas,
      sheetName,
    };
  },

  createEmptyWorkbookData(): SpreadsheetFileData {
    // 30 rows x 15 columns empty grid with headers
    const headers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
    const rows: (string | null)[][] = [headers];
    for (let r = 1; r <= 50; r++) {
      const row = new Array(headers.length).fill('');
      rows.push(row);
    }
    return {
      sheets: [
        {
          name: 'Sheet1',
          data: rows,
        },
      ],
    };
  },
};
