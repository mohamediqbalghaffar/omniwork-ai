import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAI } from '../../../src/renderer/hooks/useAI';
import { useAIStore } from '../../../src/renderer/store/aiStore';
import '../../../src/renderer/i18n';

describe('useAI hook', () => {
  beforeEach(() => {
    useAIStore.setState({
      isLoading: false,
      currentRequest: null,
      currentResult: null,
      history: [],
      error: null,
    });
  });

  it('validates empty request text', async () => {
    const { result } = renderHook(() => useAI([]));

    await act(async () => {
      await result.current.requestFormula('');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentResult).toBeNull();
  });

  it('successfully generates formula for valid request', async () => {
    const mockGrid = [
      ['A', 'B'],
      ['10', '20'],
      ['30', '40'],
    ];

    const { result } = renderHook(() => useAI(mockGrid));

    await act(async () => {
      await result.current.requestFormula('Sum of column A', 'A4');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentResult).not.toBeNull();
    expect(result.current.currentResult?.formula).toMatch(/^=/);
  });
});
