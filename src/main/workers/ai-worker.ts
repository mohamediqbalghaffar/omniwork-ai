import { parentPort, workerData } from 'worker_threads';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AICellContext, AIRequest, PredictionFormula } from '../../shared/types';

let genAI: GoogleGenerativeAI | null = null;
let apiKey: string = (workerData && workerData.apiKey) || process.env.GEMINI_API_KEY || '';

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.error('[AI Worker] Failed to initialize Gemini API:', err);
  }
}

function buildPrompt(request: AIRequest): string {
  const ctx = request.cellContext || {
    cellAddress: request.cellAddress,
    cellValue: '',
    columnHeader: '',
    rowContext: [],
    columnContext: [],
    surroundingFormulas: [],
    sheetName: '',
  };

  return `You are an Excel formula expert assistant. The user is working on a spreadsheet.

CONTEXT:
- Target cell: ${request.cellAddress}
- Current cell value: ${ctx.cellValue || '(empty)'}
- Column header (row 1): ${ctx.columnHeader || 'None'}
- Values in the same row: ${(ctx.rowContext || []).join(', ')}
- Values in the same column (sample): ${(ctx.columnContext || []).slice(0, 10).join(', ')}
- Nearby formulas: ${(ctx.surroundingFormulas || []).join(', ')}

USER REQUEST: "${request.userText}"

INSTRUCTIONS:
1. Generate ONLY the Excel formula that fulfills the user's request.
2. The formula must be valid Excel syntax.
3. Use cell references relative to the target cell position.
4. If the request is ambiguous, generate the most common interpretation.
5. Respond with ONLY the formula, nothing else. No explanation, no markdown, no backticks.
   Example valid response: =IFERROR((C14-B14)/B14, 0)`;
}

function buildPredictionPrompt(context: AICellContext): string {
  return `You are an Excel formula expert. Analyze this cell context and predict the 3 most likely formulas the user might want.

CELL: ${context.cellAddress}
COLUMN HEADER: ${context.columnHeader || 'None'}
ROW DATA: ${(context.rowContext || []).join(', ')}
COLUMN DATA (sample): ${(context.columnContext || []).slice(0, 10).join(', ')}
NEARBY FORMULAS: ${(context.surroundingFormulas || []).join(', ')}

Respond with a JSON array of exactly 3 objects:
[
  { "description": "brief description", "formula": "=FORMULA()" },
  { "description": "brief description", "formula": "=FORMULA()" },
  { "description": "brief description", "formula": "=FORMULA()" }
]

Respond with ONLY the JSON array, no other text.`;
}

function cleanFormula(raw: string): string {
  let cleaned = raw.trim();
  // Strip code block markers
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  // Ensure starts with =
  if (!cleaned.startsWith('=')) {
    cleaned = '=' + cleaned;
  }
  return cleaned;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delays = [1000, 2000, 4000]
): Promise<T> {
  let lastError: any = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        const delay = delays[attempt] || 1000 * Math.pow(2, attempt);
        console.warn(`[AI Worker] Attempt ${attempt + 1} failed: ${err.message}. Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

function generateLocalFallbackFormula(request: AIRequest): string {
  const text = (request.userText || '').toLowerCase();
  const cell = request.cellAddress || 'A1';
  const match = cell.match(/^([A-Z]+)(\d+)$/i);
  const col = match ? match[1].toUpperCase() : 'A';
  const row = match ? parseInt(match[2], 10) : 1;
  const prevRow = Math.max(1, row - 1);

  if (text.includes('sum') || text.includes('کۆکردنەوە') || text.includes('total')) {
    return `=SUM(${col}1:${col}${prevRow})`;
  }
  if (text.includes('avg') || text.includes('average') || text.includes('تێکڕا')) {
    return `=AVERAGE(${col}1:${col}${prevRow})`;
  }
  if (text.includes('max') || text.includes('گەورەترین')) {
    return `=MAX(${col}1:${col}${prevRow})`;
  }
  if (text.includes('min') || text.includes('بچووکترین')) {
    return `=MIN(${col}1:${col}${prevRow})`;
  }
  if (text.includes('count') || text.includes('ژماردن')) {
    return `=COUNT(${col}1:${col}${prevRow})`;
  }
  if (text.includes('diff') || text.includes('minus') || text.includes('کەمکردنەوە')) {
    return `=IFERROR(B${row}-A${row}, 0)`;
  }
  if (text.includes('percentage') || text.includes('percent') || text.includes('ڕێژە')) {
    return `=IFERROR((B${row}-A${row})/A${row}, 0)`;
  }

  // Default smart formula based on surrounding context
  if (request.cellContext?.surroundingFormulas && request.cellContext.surroundingFormulas.length > 0) {
    return request.cellContext.surroundingFormulas[0];
  }
  return `=SUM(${col}1:${col}${prevRow})`;
}

function generateLocalPredictions(context: AICellContext): PredictionFormula[] {
  const cell = context.cellAddress || 'A1';
  const match = cell.match(/^([A-Z]+)(\d+)$/i);
  const col = match ? match[1].toUpperCase() : 'A';
  const row = match ? parseInt(match[2], 10) : 1;
  const prevRow = Math.max(1, row - 1);

  return [
    {
      description: `Sum of column ${col}`,
      formula: `=SUM(${col}1:${col}${prevRow})`,
    },
    {
      description: `Average of column ${col}`,
      formula: `=AVERAGE(${col}1:${col}${prevRow})`,
    },
    {
      description: `Row difference`,
      formula: `=IFERROR(B${row}-A${row}, 0)`,
    },
  ];
}

parentPort?.on('message', async (message: any) => {
  const { type, payload, requestId } = message;

  switch (type) {
    case 'set_api_key': {
      apiKey = payload.apiKey || '';
      if (apiKey) {
        try {
          genAI = new GoogleGenerativeAI(apiKey);
          console.log('[AI Worker] Gemini client initialized with new API key');
        } catch (err) {
          console.error('[AI Worker] Error setting API key:', err);
        }
      } else {
        genAI = null;
      }
      break;
    }

    case 'generate': {
      const request = payload as AIRequest;

      if (!apiKey || !genAI) {
        // Fallback to local heuristic engine
        const formula = generateLocalFallbackFormula(request);
        parentPort?.postMessage({
          type: 'result',
          requestId,
          formula,
          confidence: 0.85,
          error: null,
        });
        return;
      }

      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256,
            topP: 0.95,
          },
        });

        const prompt = buildPrompt(request);

        // Perform call with exponential backoff: 3 attempts (1s, 2s, 4s)
        const result = await callWithExponentialBackoff(
          () => model.generateContent(prompt),
          3,
          [1000, 2000, 4000]
        );

        const rawFormula = result.response.text();
        const formula = cleanFormula(rawFormula);

        parentPort?.postMessage({
          type: 'result',
          requestId,
          formula,
          confidence: 0.95,
          error: null,
        });
      } catch (error: any) {
        console.warn('[AI Worker] Gemini call failed after retries, falling back to heuristic formula:', error.message);
        const fallbackFormula = generateLocalFallbackFormula(request);
        parentPort?.postMessage({
          type: 'result',
          requestId,
          formula: fallbackFormula,
          confidence: 0.7,
          error: `AI service temporarily unavailable (${error.message})`,
        });
      }
      break;
    }

    case 'predict': {
      const context = payload as AICellContext;

      if (!apiKey || !genAI) {
        const formulas = generateLocalPredictions(context);
        parentPort?.postMessage({
          type: 'prediction',
          requestId,
          formulas,
          error: null,
        });
        return;
      }

      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 512,
            topP: 0.95,
          },
        });

        const prompt = buildPredictionPrompt(context);
        const result = await callWithExponentialBackoff(
          () => model.generateContent(prompt),
          2,
          [1000, 2000]
        );

        let text = result.response.text().trim();
        if (text.startsWith('```')) {
          text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
        }
        const formulas = JSON.parse(text);

        parentPort?.postMessage({
          type: 'prediction',
          requestId,
          formulas: Array.isArray(formulas) ? formulas : generateLocalPredictions(context),
          error: null,
        });
      } catch (err: any) {
        // Predictions silently fallback
        const fallback = generateLocalPredictions(context);
        parentPort?.postMessage({
          type: 'prediction',
          requestId,
          formulas: fallback,
          error: null,
        });
      }
      break;
    }
  }
});
