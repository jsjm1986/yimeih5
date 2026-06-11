import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResultUploader } from '../src/components/ResultUploader.js';

function makeFile(type = 'image/png') {
  return new File([new Uint8Array([1, 2, 3])], 'r.png', { type });
}

describe('ResultUploader', () => {
  it('选图后启用上传按钮，点击触发 onUpload', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined);
    render(<ResultUploader onUpload={onUpload} />);

    const btn = screen.getByRole('button', { name: /上传结果/ });
    expect(btn).toBeDisabled();

    const input = screen.getByTestId('result-file') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile()] } });
    expect(btn).not.toBeDisabled();

    fireEvent.click(btn);
    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
  });

  it('非图片类型显示错误且不启用按钮', () => {
    render(<ResultUploader onUpload={vi.fn()} />);
    const input = screen.getByTestId('result-file') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('application/pdf')] } });
    expect(screen.getByText(/jpg \/ png \/ webp/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /上传结果/ })).toBeDisabled();
  });
});
