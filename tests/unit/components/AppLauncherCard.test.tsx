import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AppLauncherCard } from '../../../src/renderer/components/dashboard/AppLauncherCard';
import '../../../src/renderer/i18n';

describe('AppLauncherCard', () => {
  it('renders available card (Excel) with title and click ability', () => {
    const handleClick = vi.fn();
    render(
      <AppLauncherCard
        id="excel"
        title="Excel"
        iconSrc="/test-icon.svg"
        isAvailable={true}
        onClick={handleClick}
      />
    );

    const titleElement = screen.getByText('Excel');
    expect(titleElement).toBeInTheDocument();

    const card = screen.getByRole('button');
    expect(card).toHaveClass('glass');
    expect(card).toHaveClass('glow-green');

    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled card (Word) with coming soon badge and does not trigger click', () => {
    const handleClick = vi.fn();
    render(
      <AppLauncherCard
        id="word"
        title="Word"
        iconSrc="/test-icon.svg"
        isAvailable={false}
        onClick={handleClick}
      />
    );

    expect(screen.getByText('Word')).toBeInTheDocument();
    // Disabled subtitle should be visible
    expect(screen.getByText(/بەم زووانە|Coming Soon/i)).toBeInTheDocument();

    const card = screen.getByRole('button');
    expect(card).toHaveClass('grayscale');
    expect(card).toHaveClass('cursor-not-allowed');

    fireEvent.click(card);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
