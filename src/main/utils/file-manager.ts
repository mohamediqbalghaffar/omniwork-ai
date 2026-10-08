import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { logger } from './logger';

export interface SpreadsheetFileData {
  sheets: {
    name: string;
    data: (string | number | boolean | null)[][];
  }[];
}

export const fileManager = {
  readFile(filePath: string): SpreadsheetFileData {
    logger.info(`Reading file from: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.csv') {
      const content = fs.readFileSync(filePath, 'utf8');
      const workbook = XLSX.read(content, { type: 'string' });
      return workbookToSpreadsheetData(workbook);
    } else if (ext === '.xlsx' || ext === '.xls') {
      const buffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      return workbookToSpreadsheetData(workbook);
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  },

  saveFile(filePath: string, data: SpreadsheetFileData): void {
    logger.info(`Saving file to: ${filePath}`);
    const workbook = XLSX.utils.book_new();

    for (const sheet of data.sheets) {
      const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name || 'Sheet1');
    }

    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.csv') {
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const csvContent = XLSX.utils.sheet_to_csv(firstSheet);
      fs.writeFileSync(filePath, csvContent, 'utf8');
    } else {
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: ext === '.xls' ? 'biff8' : 'xlsx' });
      fs.writeFileSync(filePath, buffer);
    }
  }
};

function workbookToSpreadsheetData(workbook: XLSX.WorkBook): SpreadsheetFileData {
  const sheets: { name: string; data: (string | number | boolean | null)[][] }[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as (string | number | boolean | null)[][];
    sheets.push({
      name: sheetName,
      data,
    });
  }

  return { sheets };
}
