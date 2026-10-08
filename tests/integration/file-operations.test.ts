import { describe, it, expect, afterEach } from 'vitest';
import { fileManager } from '../../src/main/utils/file-manager';
import * as path from 'path';
import * as fs from 'fs';

describe('File Operations Integration', () => {
  const testXlsx = path.join(process.cwd(), 'test-export.xlsx');
  const testCsv = path.join(process.cwd(), 'test-export.csv');

  afterEach(() => {
    if (fs.existsSync(testXlsx)) fs.unlinkSync(testXlsx);
    if (fs.existsSync(testCsv)) fs.unlinkSync(testCsv);
  });

  it('exports to .xlsx and reads back correctly', () => {
    const originalData = {
      sheets: [
        {
          name: 'Revenue',
          data: [
            ['Month', 'Income', 'Expense'],
            ['Jan', 1000, 400],
            ['Feb', 1500, 600],
          ],
        },
      ],
    };

    fileManager.saveFile(testXlsx, originalData);
    expect(fs.existsSync(testXlsx)).toBe(true);

    const loadedData = fileManager.readFile(testXlsx);
    expect(loadedData.sheets).toHaveLength(1);
    expect(loadedData.sheets[0].name).toBe('Revenue');
    expect(loadedData.sheets[0].data[0][0]).toBe('Month');
    expect(loadedData.sheets[0].data[1][1]).toBe(1000);
  });

  it('exports to .csv and reads back correctly', () => {
    const originalData = {
      sheets: [
        {
          name: 'Data',
          data: [
            ['A', 'B'],
            ['10', '20'],
          ],
        },
      ],
    };

    fileManager.saveFile(testCsv, originalData);
    expect(fs.existsSync(testCsv)).toBe(true);

    const loadedData = fileManager.readFile(testCsv);
    expect(loadedData.sheets).toHaveLength(1);
    expect(loadedData.sheets[0].data[0][0]).toBe('A');
  });
});
