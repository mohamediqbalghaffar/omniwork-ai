import { z } from 'zod';

export const AICellContextSchema = z.object({
  cellAddress: z.string().min(1),
  cellValue: z.string().optional().default(''),
  columnHeader: z.string().optional().default(''),
  rowContext: z.array(z.string()).optional().default([]),
  columnContext: z.array(z.string()).optional().default([]),
  surroundingFormulas: z.array(z.string()).optional().default([]),
  sheetName: z.string().optional().default('Sheet1'),
});

export const AIRequestSchema = z.object({
  id: z.string().min(1),
  cellAddress: z.string().min(1),
  userText: z.string().min(1),
  cellContext: AICellContextSchema,
  timestamp: z.number().optional().default(() => Date.now()),
  isPrediction: z.boolean().optional().default(false),
});

export const SheetDataSchema = z.object({
  name: z.string(),
  data: z.array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))),
});

export const SpreadsheetFileDataSchema = z.object({
  sheets: z.array(SheetDataSchema),
});

export const FileSaveSchema = z.object({
  filePath: z.string().nullable(),
  data: SpreadsheetFileDataSchema,
});

export const FileSaveAsSchema = z.object({
  data: SpreadsheetFileDataSchema,
  defaultName: z.string().optional(),
});

export const DbPrefsSchema = z.record(z.string(), z.string());

export const ApiKeySchema = z.object({
  apiKey: z.string().min(1),
});
