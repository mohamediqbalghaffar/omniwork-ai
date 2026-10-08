import { describe, it, expect, beforeEach } from 'vitest';
import { useAIStore } from '../../../src/renderer/store/aiStore';

describe('aiStore', () => {
  beforeEach(() => {
    useAIStore.setState({
      isLoading: false,
      currentRequest: null,
      currentResult: null,
      history: [],
      backgroundStatus: 'idle',
      error: null,
    });
  });

  it('updates loading state correctly', () => {
    expect(useAIStore.getState().isLoading).toBe(false);
    useAIStore.getState().setLoading(true);
    expect(useAIStore.getState().isLoading).toBe(true);
  });

  it('adds entry to history and clears result', () => {
    const entry = {
      id: 'test-1',
      cellAddress: 'D14',
      userText: 'sum of C',
      formula: '=SUM(C1:C13)',
      timestamp: Date.now(),
      wasApplied: false,
    };

    useAIStore.getState().addToHistory(entry);
    expect(useAIStore.getState().history).toHaveLength(1);
    expect(useAIStore.getState().history[0].formula).toBe('=SUM(C1:C13)');

    useAIStore.getState().setCurrentResult({
      id: 'res-1',
      requestId: 'test-1',
      formula: '=SUM(C1:C13)',
      confidence: 1,
      fromCache: true,
      timestamp: Date.now(),
    });
    expect(useAIStore.getState().currentResult).not.toBeNull();

    useAIStore.getState().clearResult();
    expect(useAIStore.getState().currentResult).toBeNull();
  });

  it('updates background sync status', () => {
    useAIStore.getState().setBackgroundStatus('active');
    expect(useAIStore.getState().backgroundStatus).toBe('active');
    useAIStore.getState().setBackgroundStatus('error');
    expect(useAIStore.getState().backgroundStatus).toBe('error');
  });
});
