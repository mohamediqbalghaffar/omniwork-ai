import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SpreadsheetContainer } from '../../../src/renderer/components/workspace/SpreadsheetContainer';
import '../../../src/renderer/i18n';

describe('SpreadsheetContainer', () => {
  const mockData = [
    ['Header1', 'Header2', 'Header3'],
    ['105', '205', '305'],
    ['100', '200', '300'],
  ];

  it('renders spreadsheet container with formula bar and grid cells', () => {
    const handleCellChange = vi.fn();
    render(<SpreadsheetContainer dataGrid={mockData} onCellChange={handleCellChange} />);

    // Formula bar address indicator
    expect(screen.getByText('A1')).toBeInTheDocument();

    // Headers & Cells
    expect(screen.getByText('Header1')).toBeInTheDocument();
    expect(screen.getByText('105')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();

    // Sheet tab bar
    expect(screen.getByText('Sheet1')).toBeInTheDocument();
  });

  it('selects cell on click and updates formula bar address', () => {
    const handleCellChange = vi.fn();
    render(<SpreadsheetContainer dataGrid={mockData} onCellChange={handleCellChange} />);

    const cellB2 = screen.getByText('205');
    fireEvent.click(cellB2);

    expect(screen.getByText('B2')).toBeInTheDocument();
  });

  it('allows cell double-click edit and submits changes', () => {
    const handleCellChange = vi.fn();
    render(<SpreadsheetContainer dataGrid={mockData} onCellChange={handleCellChange} />);

    const cellA2 = screen.getByText('105');
    fireEvent.doubleClick(cellA2);

    const inputs = screen.getAllByDisplayValue('105');
    // Last input is the cell inline editor
    const cellInput = inputs[inputs.length - 1];
    fireEvent.change(cellInput, { target: { value: '555' } });
    fireEvent.keyDown(cellInput, { key: 'Enter', code: 'Enter' });

    expect(handleCellChange).toHaveBeenCalledWith('A2', '555');
  });

  it('enforces LTR direction on spreadsheet container', () => {
    const handleCellChange = vi.fn();
    const { container } = render(
      <SpreadsheetContainer dataGrid={mockData} onCellChange={handleCellChange} />
    );

    const sheetDiv = container.querySelector('.spreadsheet-container');
    expect(sheetDiv).toHaveStyle({ direction: 'ltr' });
  });
});
