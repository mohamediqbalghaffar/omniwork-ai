import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AISidebar } from '../../../src/renderer/components/workspace/AISidebar';
import '../../../src/renderer/i18n';

describe('AISidebar', () => {
  it('renders all sidebar sections properly', () => {
    const handleApply = vi.fn();
    render(<AISidebar dataGrid={[]} onApplyFormula={handleApply} />);

    // Header
    expect(screen.getByText(/یاریدەدەری AI|AI Assistant/i)).toBeInTheDocument();

    // Cell Selector
    expect(screen.getByText(/خانەی هەڵبژێردراو|Selected Cell/i)).toBeInTheDocument();

    // Request Input
    expect(screen.getByText(/داواکاری|Request/i)).toBeInTheDocument();

    // Proceed Button
    expect(screen.getByText(/جێبەجێکردن|Proceed/i)).toBeInTheDocument();

    // Result Display (matched via getAllByText since label and placeholder both contain the word)
    const resultElements = screen.getAllByText(/ئەنجام|Result/i);
    expect(resultElements.length).toBeGreaterThanOrEqual(1);

    // Background Badge
    expect(screen.getByText(/هاوکاتکردنی AI لە پشتەوە|AI Background Sync/i)).toBeInTheDocument();
  });

  it('enables proceed button when user inputs text', () => {
    const handleApply = vi.fn();
    render(<AISidebar dataGrid={[]} onApplyFormula={handleApply} />);

    const textarea = screen.getByPlaceholderText(/باسبکە چی دەتەوێت|Describe what you want/i);
    const proceedBtn = screen.getByText(/جێبەجێکردن|Proceed/i).closest('button');

    expect(proceedBtn).toBeDisabled();

    fireEvent.change(textarea, { target: { value: 'Calculate sum of column A' } });
    expect(proceedBtn).not.toBeDisabled();
  });
});
