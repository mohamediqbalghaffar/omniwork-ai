export const IPC_CHANNELS = {
  // AI channels
  AI_REQUEST: 'ai:request',
  AI_RESPONSE: 'ai:response',
  AI_CELL_CONTEXT: 'ai:cell-context',
  AI_STATUS: 'ai:status',
  AI_SET_API_KEY: 'ai:set-api-key',
  AI_HAS_API_KEY: 'ai:has-api-key',

  // File channels
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  FILE_SAVE_AS: 'file:save-as',
  FILE_DATA: 'file:data',

  // Database channels
  DB_GET_RECENT: 'db:get-recent-files',
  DB_GET_HISTORY: 'db:get-ai-history',
  DB_GET_PREFS: 'db:get-preferences',
  DB_SET_PREFS: 'db:set-preferences',

  // App channels
  APP_MINIMIZE: 'app:minimize',
  APP_MAXIMIZE: 'app:maximize',
  APP_CLOSE: 'app:close',
  APP_IS_MAXIMIZED: 'app:is-maximized',
} as const;

export const APP_CONFIG = {
  DEFAULT_LANG: 'ckb',
  FALLBACK_LANG: 'en',
  DEFAULT_THEME: 'dark',
  WINDOW_WIDTH: 1280,
  WINDOW_HEIGHT: 800,
  MIN_WIDTH: 960,
  MIN_HEIGHT: 600,
  SIDEBAR_WIDTH_PX: 280,
} as const;
