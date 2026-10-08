import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { keyManager } from '../../src/main/utils/key-manager';
import { initDatabase, closeDatabase } from '../../src/main/database';
import * as path from 'path';
import * as fs from 'fs';

describe('KeyManager', () => {
  const testDb = path.join(process.cwd(), 'test-key-mgr.db');

  beforeEach(() => {
    if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
    initDatabase(testDb);
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
  });

  it('encrypts and decrypts strings correctly', () => {
    const original = 'AIzaSySecretGeminiKey123';
    const encrypted = keyManager.encrypt(original);
    expect(encrypted).not.toBe(original);

    const decrypted = keyManager.decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it('sets and retrieves API key through keyManager', () => {
    const key = 'AIzaSyNewTestingKey999';
    const saved = keyManager.setApiKey(key);
    expect(saved).toBe(true);

    const retrieved = keyManager.getApiKey();
    expect(retrieved).toBe(key);
    expect(keyManager.hasApiKey()).toBe(true);
  });
});
