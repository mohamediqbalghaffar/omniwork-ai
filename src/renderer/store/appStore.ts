import { create } from 'zustand';
import i18n from '../i18n';
import { ToastMessage } from '../types/app.types';

interface AppState {
  currentLanguage: 'en' | 'ckb';
  currentPage: 'dashboard' | 'workspace';
  isMaximized: boolean;
  toasts: ToastMessage[];
  showApiKeyModal: boolean;

  setLanguage: (lang: 'en' | 'ckb') => void;
  setPage: (page: 'dashboard' | 'workspace') => void;
  setMaximized: (val: boolean) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  setShowApiKeyModal: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentLanguage: (i18n.language as 'en' | 'ckb') || 'ckb',
  currentPage: 'dashboard',
  isMaximized: false,
  toasts: [],
  showApiKeyModal: false,

  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ckb' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
    // Also persist via IPC if available
    if (window.electronAPI) {
      window.electronAPI.setPreferences({ language: lang }).catch(() => {});
    }
    set({ currentLanguage: lang });
  },

  setPage: (page) => set({ currentPage: page }),

  setMaximized: (isMaximized) => set({ isMaximized }),

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    const duration = toast.duration ?? 3500;
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  setShowApiKeyModal: (show) => set({ showApiKeyModal: show }),
}));
