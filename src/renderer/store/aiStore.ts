import { create } from 'zustand';
import { AIRequest, AIResponse, AIHistoryEntry, AIStatusType } from '../../shared/types';

interface AIState {
  isLoading: boolean;
  currentRequest: AIRequest | null;
  currentResult: AIResponse | null;
  history: AIHistoryEntry[];
  backgroundStatus: AIStatusType;
  error: string | null;

  setLoading: (val: boolean) => void;
  setCurrentRequest: (req: AIRequest | null) => void;
  setCurrentResult: (res: AIResponse | null) => void;
  addToHistory: (entry: AIHistoryEntry) => void;
  setHistory: (history: AIHistoryEntry[]) => void;
  setBackgroundStatus: (status: AIStatusType) => void;
  setError: (err: string | null) => void;
  clearResult: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  isLoading: false,
  currentRequest: null,
  currentResult: null,
  history: [],
  backgroundStatus: 'idle',
  error: null,

  setLoading: (isLoading) => set({ isLoading }),
  setCurrentRequest: (currentRequest) => set({ currentRequest }),
  setCurrentResult: (currentResult) => set({ currentResult }),

  addToHistory: (entry) =>
    set((state) => {
      const filtered = state.history.filter((h) => h.id !== entry.id);
      return { history: [entry, ...filtered].slice(0, 30) };
    }),

  setHistory: (history) => set({ history }),
  setBackgroundStatus: (backgroundStatus) => set({ backgroundStatus }),
  setError: (error) => set({ error }),
  clearResult: () => set({ currentResult: null, error: null }),
}));
