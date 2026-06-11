import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BeforeAfterSlider } from '../src/components/BeforeAfterSlider.js';

describe('BeforeAfterSlider', () => {
  it('渲染前后两张图', () => {
    render(<BeforeAfterSlider beforeUrl="/uploads/a.png" afterUrl="/uploads/b.png" />);
    expect(screen.getByAltText('处理前')).toHaveAttribute('src', '/uploads/a.png');
    expect(screen.getByAltText('处理后')).toHaveAttribute('src', '/uploads/b.png');
  });

  it('滑块默认 50%，range 改变后更新裁切位置', () => {
    render(<BeforeAfterSlider beforeUrl="/a.png" afterUrl="/b.png" />);
    const range = screen.getByRole('slider') as HTMLInputElement;
    expect(range.value).toBe('50');
    fireEvent.change(range, { target: { value: '20' } });
    expect(range.value).toBe('20');
    // 「后」图层的 clip 宽度应反映 20%
    const afterLayer = screen.getByTestId('after-layer');
    expect(afterLayer.style.clipPath).toContain('20%');
  });
});
