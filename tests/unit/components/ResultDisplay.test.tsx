import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ResultDisplay } from '../../../src/renderer/components/workspace/ResultDisplay';
import '../../../src/renderer/i18n';

describe('ResultDisplay', () => {
  it('renders empty placeholder when no formula is present', () => {
    const handleApply = vi.fn();
    render(<ResultDisplay formula={null} onApply={handleApply} />);

    expect(screen.getByText(/ئەنجام لێرە دەردەکەوێت|Result will appear here/i)).toBeInTheDocument();
  });

  it('renders formula with Copy and Apply buttons when formula is provided', () => {
    const handleApply = vi.fn();
    render(<ResultDisplay formula="=SUM(A1:A10)" onApply={handleApply} />);

    expect(screen.getByText('=SUM(A1:A10)')).toBeInTheDocument();

    const applyButton = screen.getByText(/جێبەجێکردن لە خانەدا|Apply to Cell/i);
    expect(applyButton).toBeInTheDocument();

    fireEvent.click(applyButton);
    expect(handleApply).toHaveBeenCalledWith('=SUM(A1:A10)');
  });

  it('renders error message when error occurs', () => {
    const handleApply = vi.fn();
    render(
      <ResultDisplay
        formula={null}
        error="AI service temporarily unavailable"
        onApply={handleApply}
      />
    );

    expect(screen.getByText('AI service temporarily unavailable')).toBeInTheDocument();
  });
});
