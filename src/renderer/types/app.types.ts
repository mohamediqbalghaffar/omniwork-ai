export type Language = 'en' | 'ckb';
export type Page = 'dashboard' | 'workspace';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
}
