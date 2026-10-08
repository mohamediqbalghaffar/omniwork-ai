export const logger = {
  info: (msg: string, ...args: any[]) => {
    console.log(`[OmniWork AI INFO ${new Date().toISOString()}] ${msg}`, ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    console.warn(`[OmniWork AI WARN ${new Date().toISOString()}] ${msg}`, ...args);
  },
  error: (msg: string, ...args: any[]) => {
    console.error(`[OmniWork AI ERROR ${new Date().toISOString()}] ${msg}`, ...args);
  },
  debug: (msg: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[OmniWork AI DEBUG ${new Date().toISOString()}] ${msg}`, ...args);
    }
  }
};
