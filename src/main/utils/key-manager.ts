import * as fs from 'fs';
import * as path from 'path';
import { app, safeStorage } from 'electron';
import { preferencesRepo } from '../database/preferences.repo';
import { logger } from './logger';

export const keyManager = {
  getUserEnvPath(): string {
    try {
      if (app && typeof app.getPath === 'function') {
        const userData = app.getPath('userData');
        return path.join(userData, '.env');
      }
    } catch {
      // Non-electron context
    }
    return path.join(process.cwd(), '.env');
  },

  getApiKey(): string {
    // 1. Check SQLite preference
    const stored = preferencesRepo.get('gemini_api_key');
    if (stored) {
      const decrypted = this.decrypt(stored);
      if (decrypted) return decrypted;
    }

    // 2. Check userData .env file
    try {
      const envPath = this.getUserEnvPath();
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/GEMINI_API_KEY=(.+)/);
        if (match && match[1]) {
          const raw = match[1].trim();
          const decrypted = this.decrypt(raw);
          return decrypted || raw;
        }
      }
    } catch (err) {
      logger.warn('Failed reading userData .env file:', err);
    }

    // 3. Fallback to process.env
    return process.env.GEMINI_API_KEY || '';
  },

  setApiKey(key: string): boolean {
    try {
      const encrypted = this.encrypt(key);

      // Store in SQLite
      preferencesRepo.set('gemini_api_key', encrypted);

      // Store in userData .env file
      const envPath = this.getUserEnvPath();
      const dir = path.dirname(envPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(envPath, `GEMINI_API_KEY=${encrypted}\n`, 'utf8');

      // Also set in process.env for current process
      process.env.GEMINI_API_KEY = key;
      logger.info('Gemini API key securely stored and encrypted');
      return true;
    } catch (err) {
      logger.error('Failed to store API key:', err);
      return false;
    }
  },

  hasApiKey(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 0);
  },

  encrypt(plainText: string): string {
    if (!plainText) return '';
    try {
      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        const buffer = safeStorage.encryptString(plainText);
        return 'enc:' + buffer.toString('hex');
      }
    } catch (err) {
      logger.warn('safeStorage encryption unavailable, using base64 encoding:', err);
    }
    // Fallback if safeStorage not supported on OS/environment
    return 'b64:' + Buffer.from(plainText, 'utf8').toString('base64');
  },

  decrypt(cipherText: string): string {
    if (!cipherText) return '';
    try {
      if (cipherText.startsWith('enc:')) {
        const hex = cipherText.slice(4);
        const buffer = Buffer.from(hex, 'hex');
        if (safeStorage && safeStorage.isEncryptionAvailable()) {
          return safeStorage.decryptString(buffer);
        }
      } else if (cipherText.startsWith('b64:')) {
        const b64 = cipherText.slice(4);
        return Buffer.from(b64, 'base64').toString('utf8');
      }
    } catch (err) {
      logger.warn('Decryption failed, treating as plaintext:', err);
    }
    return cipherText;
  },
};
