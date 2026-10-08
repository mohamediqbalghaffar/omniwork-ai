import { ipcMain, BrowserWindow } from 'electron';
import { Worker } from 'worker_threads';
import * as path from 'path';
import * as crypto from 'crypto';
import { IPC_CHANNELS } from '../../shared/constants';
import { AICellContext, AIRequest, AIResponse, PredictionFormula } from '../../shared/types';
import { cacheRepo } from '../database/cache.repo';
import { historyRepo } from '../database/history.repo';
import { keyManager } from '../utils/key-manager';
import { AIRequestSchema, AICellContextSchema, ApiKeySchema } from './validation';
import { logger } from '../utils/logger';

let worker: Worker | null = null;
let isRestarting = false;
const pendingRequests = new Map<string, (res: any) => void>();

export function getWorker(): Worker {
  if (!worker) {
    const workerPath = path.join(__dirname, '../workers/ai-worker.js');
    const apiKey = keyManager.getApiKey();

    try {
      worker = new Worker(workerPath, {
        workerData: { apiKey },
      });

      worker.on('message', (msg: any) => {
        const { type, requestId, formula, formulas, confidence, error } = msg;

        if (pendingRequests.has(requestId)) {
          const resolver = pendingRequests.get(requestId)!;
          pendingRequests.delete(requestId);
          resolver({ formula, formulas, confidence, error });
        }
      });

      worker.on('error', (err) => {
        logger.error('[AI Worker] Error:', err);
        broadcastAIStatus('error');
      });

      worker.on('exit', (code) => {
        logger.warn(`[AI Worker] Exited with code ${code}`);
        worker = null;
        if (code !== 0 && !isRestarting) {
          isRestarting = true;
          logger.info('[AI Worker] Crash detected. Automatically restarting worker thread...');
          broadcastAIStatus('restarting' as any);
          setTimeout(() => {
            try {
              getWorker();
              broadcastAIStatus('idle');
              logger.info('[AI Worker] Worker thread successfully restarted');
            } catch (restartErr) {
              logger.error('[AI Worker] Failed to restart worker:', restartErr);
              broadcastAIStatus('error');
            } finally {
              isRestarting = false;
            }
          }, 1000);
        } else {
          broadcastAIStatus('idle');
        }
      });
    } catch (err) {
      logger.error('Failed to start worker thread:', err);
    }
  }
  return worker!;
}

export function broadcastAIStatus(status: 'active' | 'idle' | 'error' | 'restarting') {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.AI_STATUS, status);
    }
  });
}

function hashContext(ctx: AICellContext): string {
  const content = `${ctx.cellAddress}:${ctx.columnHeader}:${(ctx.rowContext || []).join(',')}:${(ctx.columnContext || []).join(',')}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

export function registerAIIPC() {
  // Check if API key is configured
  ipcMain.handle(IPC_CHANNELS.AI_HAS_API_KEY, async () => {
    return { hasKey: keyManager.hasApiKey() };
  });

  // Set API key securely
  ipcMain.handle(IPC_CHANNELS.AI_SET_API_KEY, async (_event, payload: unknown) => {
    const validated = ApiKeySchema.parse(payload);
    const success = keyManager.setApiKey(validated.apiKey);
    if (success) {
      // Update running worker with new key
      const aiWorker = getWorker();
      if (aiWorker) {
        aiWorker.postMessage({
          type: 'set_api_key',
          payload: { apiKey: validated.apiKey },
        });
      }
    }
    return { success };
  });

  // Handle user Proceed click
  ipcMain.handle(IPC_CHANNELS.AI_REQUEST, async (_event, rawRequest: unknown): Promise<AIResponse> => {
    // Validate request with Zod schema
    const request = AIRequestSchema.parse(rawRequest) as AIRequest;
    logger.info(`Received AI request for cell: ${request.cellAddress}, text: "${request.userText}"`);
    broadcastAIStatus('active');

    const ctx = request.cellContext;
    const contextHash = hashContext(ctx);
    const cacheKey = `${request.cellAddress}:${contextHash}`;

    // 1. Check cache for instant match (<50ms)
    const cachedFormulas = cacheRepo.get(cacheKey);
    if (cachedFormulas && cachedFormulas.length > 0) {
      const userTextLower = (request.userText || '').toLowerCase();
      // See if request matches any cached prediction description or formula keyword
      const match = cachedFormulas.find(
        (f) =>
          userTextLower.includes(f.description.toLowerCase()) ||
          userTextLower.includes(f.formula.toLowerCase().replace('=', '').split('(')[0])
      );

      if (match) {
        logger.info(`Serving AI request from cache for ${request.cellAddress}`);
        const response: AIResponse = {
          id: request.id,
          requestId: request.id,
          formula: match.formula,
          confidence: 0.98,
          fromCache: true,
          timestamp: Date.now(),
        };

        historyRepo.add({
          id: request.id,
          cellAddress: request.cellAddress,
          userText: request.userText,
          formula: response.formula,
          sheetName: ctx.sheetName,
          timestamp: response.timestamp,
          wasApplied: false,
        });

        broadcastAIStatus('idle');
        return response;
      }
    }

    // 2. Call Worker or fallback directly
    try {
      const aiWorker = getWorker();
      const requestId = request.id || crypto.randomUUID();

      const workerPromise = new Promise<{ formula: string; confidence: number; error: string | null }>(
        (resolve) => {
          pendingRequests.set(requestId, resolve);

          // Timeout after 15s
          setTimeout(() => {
            if (pendingRequests.has(requestId)) {
              pendingRequests.delete(requestId);
              resolve({
                formula: `=SUM(${request.cellAddress.charAt(0)}1:${request.cellAddress})`,
                confidence: 0.5,
                error: 'Request timeout',
              });
            }
          }, 15000);

          if (aiWorker) {
            aiWorker.postMessage({
              type: 'generate',
              requestId,
              payload: request,
            });
          } else {
            // Direct fallback
            resolve({
              formula: `=SUM(${request.cellAddress.charAt(0)}1:${request.cellAddress})`,
              confidence: 0.8,
              error: null,
            });
          }
        }
      );

      const workerRes = await workerPromise;

      const response: AIResponse = {
        id: requestId,
        requestId,
        formula: workerRes.formula,
        confidence: workerRes.confidence || 0.9,
        fromCache: false,
        timestamp: Date.now(),
        error: workerRes.error,
      };

      // Save to history
      historyRepo.add({
        id: requestId,
        cellAddress: request.cellAddress,
        userText: request.userText,
        formula: response.formula,
        sheetName: ctx.sheetName,
        timestamp: response.timestamp,
        wasApplied: false,
      });

      // Update cache
      cacheRepo.set(cacheKey, request.cellAddress, contextHash, [
        { description: request.userText, formula: response.formula },
      ]);

      broadcastAIStatus('idle');
      return response;
    } catch (err: any) {
      logger.error('Error in AI request processing:', err);
      broadcastAIStatus('error');
      return {
        id: request.id,
        requestId: request.id,
        formula: '',
        confidence: 0,
        fromCache: false,
        timestamp: Date.now(),
        error: err.message || 'Unknown error occurred',
      };
    }
  });

  // Handle background silent cell context notification
  ipcMain.on(IPC_CHANNELS.AI_CELL_CONTEXT, async (_event, rawContext: unknown) => {
    try {
      const context = AICellContextSchema.parse(rawContext) as AICellContext;
      if (!context || !context.cellAddress) return;

      const contextHash = hashContext(context);
      const cacheKey = `${context.cellAddress}:${contextHash}`;

      // If already in cache, do nothing
      if (cacheRepo.get(cacheKey)) {
        return;
      }

      broadcastAIStatus('active');
      const aiWorker = getWorker();
      const requestId = 'pred_' + crypto.randomUUID();

      if (aiWorker) {
        pendingRequests.set(requestId, (data: { formulas: PredictionFormula[] }) => {
          if (data && data.formulas && data.formulas.length > 0) {
            cacheRepo.set(cacheKey, context.cellAddress, contextHash, data.formulas);
          }
          broadcastAIStatus('idle');
        });

        aiWorker.postMessage({
          type: 'predict',
          requestId,
          payload: context,
        });
      }
    } catch (err) {
      logger.error('Error during background prediction:', err);
      broadcastAIStatus('idle');
    }
  });
}
