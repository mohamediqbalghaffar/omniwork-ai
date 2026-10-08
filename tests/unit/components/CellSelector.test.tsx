import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CellSelector } from '../../../src/renderer/components/workspace/CellSelector';
import '../../../src/renderer/i18n';

describe('CellSelector', () => {
  it('renders cell address correctly', () => {
    const handleChange = vi.fn();
    render(<CellSelector value="D14" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('A1') as HTMLInputElement;
    expect(input.value).toBe('D14');
  });

  it('updates input and calls onChange when a valid cell address is typed', () => {
    const handleChange = vi.fn();
    render(<CellSelector value="A1" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('A1') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'B25' } });

    expect(handleChange).toHaveBeenCalledWith('B25');
  });

  it('shows error state when invalid cell address is typed', () => {
    const handleChange = vi.fn();
    render(<CellSelector value="A1" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('A1') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '99XYZ' } });

    expect(handleChange).not.toHaveBeenCalled();
    expect(input).toHaveClass('border-red-500');
  });
});
