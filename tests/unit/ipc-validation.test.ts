import { describe, it, expect } from 'vitest';
import {
  AIRequestSchema,
  AICellContextSchema,
  FileSaveSchema,
  FileSaveAsSchema,
  ApiKeySchema,
  DbPrefsSchema,
} from '../../src/main/ipc/validation';

describe('IPC Validation Schemas', () => {
  it('validates correct AI request payload', () => {
    const validRequest = {
      id: 'req-123',
      cellAddress: 'D14',
      userText: 'Calculate sum of column D',
      cellContext: {
        cellAddress: 'D14',
        cellValue: '',
        columnHeader: 'Total',
        rowContext: ['100', '200'],
        columnContext: ['10', '20'],
        surroundingFormulas: [],
        sheetName: 'Sheet1',
      },
    };

    const parsed = AIRequestSchema.parse(validRequest);
    expect(parsed.id).toBe('req-123');
    expect(parsed.userText).toBe('Calculate sum of column D');
  });

  it('rejects AI request missing mandatory fields', () => {
    const invalidRequest = {
      id: '',
      userText: '',
    };

    expect(() => AIRequestSchema.parse(invalidRequest)).toThrow();
  });

  it('validates FileSave payload', () => {
    const validSave = {
      filePath: 'C:/docs/sheet.xlsx',
      data: {
        sheets: [
          {
            name: 'Sheet1',
            data: [['A', 'B'], [1, 2]],
          },
        ],
      },
    };

    const parsed = FileSaveSchema.parse(validSave);
    expect(parsed.filePath).toBe('C:/docs/sheet.xlsx');
    expect(parsed.data.sheets).toHaveLength(1);
  });

  it('validates FileSaveAs payload with optional defaultName', () => {
    const validSaveAs = {
      data: {
        sheets: [{ name: 'Sheet1', data: [] }],
      },
      defaultName: 'Export.xlsx',
    };

    const parsed = FileSaveAsSchema.parse(validSaveAs);
    expect(parsed.defaultName).toBe('Export.xlsx');
  });

  it('validates ApiKeySchema', () => {
    expect(ApiKeySchema.parse({ apiKey: 'valid-api-key' }).apiKey).toBe('valid-api-key');
    expect(() => ApiKeySchema.parse({ apiKey: '' })).toThrow();
  });

  it('validates DbPrefsSchema', () => {
    const prefs = { language: 'ckb', theme: 'dark' };
    const parsed = DbPrefsSchema.parse(prefs);
    expect(parsed.language).toBe('ckb');
  });
});
