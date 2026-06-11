import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// @testing-library 的 waitFor 只在检测到 `jest` 全局且 timers 被 mock 时
// 才会推进假定时器（jestFakeTimersAreEnabled）。vitest 默认不暴露 `jest`，
// 因此用 vi 的实现提供一个最小 shim，让 waitFor 在 vi.useFakeTimers() 下正常工作。
(globalThis as unknown as { jest?: unknown }).jest = {
  advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
};

afterEach(() => {
  cleanup();
  localStorage.clear();
});
