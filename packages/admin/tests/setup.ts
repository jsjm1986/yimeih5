import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom 未实现 URL.createObjectURL，组件预览图需要它，补一个最小桩。
if (typeof globalThis.URL.createObjectURL !== 'function') {
  globalThis.URL.createObjectURL = () => 'blob:stub';
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
