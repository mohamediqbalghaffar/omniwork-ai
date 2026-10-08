import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelectedCell } from '../../../src/renderer/hooks/useSelectedCell';
import { useSpreadsheetStore } from '../../../src/renderer/store/spreadsheetStore';

describe('useSelectedCell hook', () => {
  beforeEach(() => {
    useSpreadsheetStore.setState({
      selectedCell: { address: 'A1', value: '', row: 0, column: 0 },
    });
  });

  it('updates selected cell when setAddress is called with valid address', () => {
    const { result } = renderHook(() => useSelectedCell());

    act(() => {
      result.current.setAddress('D14');
    });

    expect(result.current.selectedCell?.address).toBe('D14');
    expect(result.current.selectedCell?.row).toBe(13);
    expect(result.current.selectedCell?.column).toBe(3);
  });

  it('validates address format properly', () => {
    const { result } = renderHook(() => useSelectedCell());

    expect(result.current.isValidAddress('A1')).toBe(true);
    expect(result.current.isValidAddress('ZZ999')).toBe(true);
    expect(result.current.isValidAddress('123')).toBe(false);
    expect(result.current.isValidAddress('invalid')).toBe(false);
  });
});
