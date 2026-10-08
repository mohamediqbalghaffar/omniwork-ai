import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ApiKeyModal } from '../../../src/renderer/components/shared/ApiKeyModal';
import { ipcBridge } from '../../../src/renderer/services/ipc-bridge';
import '../../../src/renderer/i18n';

describe('ApiKeyModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<ApiKeyModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal elements properly when open', () => {
    render(<ApiKeyModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/دامەزراندنی AI|Set Up AI/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/کلیلی API ی Gemini بنووسە|Enter your Gemini API key/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/هەڵگرتن و بەردەوامبوون|Save & Continue/i)).toBeInTheDocument();
    expect(screen.getByText(/تێپەڕاندن|Skip/i)).toBeInTheDocument();
  });

  it('saves API key when user submits form', async () => {
    const handleClose = vi.fn();
    const setApiKeySpy = vi.spyOn(ipcBridge, 'setApiKey').mockResolvedValue({ success: true });

    render(<ApiKeyModal isOpen={true} onClose={handleClose} />);

    const input = screen.getByPlaceholderText(/کلیلی API ی Gemini بنووسە|Enter your Gemini API key/i);
    const submitBtn = screen.getByText(/هەڵگرتن و بەردەوامبوون|Save & Continue/i).closest('button');

    fireEvent.change(input, { target: { value: 'AIzaSyTest123456789' } });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn!);

    await waitFor(() => {
      expect(setApiKeySpy).toHaveBeenCalledWith('AIzaSyTest123456789');
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('calls onClose and records preference on skip', async () => {
    const handleClose = vi.fn();
    const setPrefsSpy = vi.spyOn(ipcBridge, 'setPreferences').mockResolvedValue({ success: true });

    render(<ApiKeyModal isOpen={true} onClose={handleClose} />);

    const skipBtn = screen.getByText(/تێپەڕاندن|Skip/i);
    fireEvent.click(skipBtn);

    expect(setPrefsSpy).toHaveBeenCalledWith({ apiKeySkipped: 'true' });
    expect(handleClose).toHaveBeenCalled();
  });
});
