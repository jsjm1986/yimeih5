import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePolling } from '../src/hooks/usePolling.js';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('usePolling', () => {
  it('立即拉取一次，stop 条件满足后不再调度', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'done' });
    const stop = (d: { status: string }) => d.status === 'done';

    const { result } = renderHook(() => usePolling(fetcher, stop, 4000));

    // 首次立即拉取
    await vi.advanceTimersByTimeAsync(0);
    expect(fetcher).toHaveBeenCalledTimes(1);

    // 4 秒后第二次，拿到 done
    await vi.advanceTimersByTimeAsync(4000);
    expect(fetcher).toHaveBeenCalledTimes(2);

    await waitFor(() => expect(result.current.data?.status).toBe('done'));

    // 再推进时间不应继续拉取
    await vi.advanceTimersByTimeAsync(8000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('拉取出错时写入 error 并继续重试', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('网络错误'))
      .mockResolvedValueOnce({ status: 'done' });
    const { result } = renderHook(() => usePolling(fetcher, (d: any) => d.status === 'done', 4000));

    await vi.advanceTimersByTimeAsync(0);
    await waitFor(() => expect(result.current.error).toBe('网络错误'));

    await vi.advanceTimersByTimeAsync(4000);
    await waitFor(() => expect(result.current.data?.status).toBe('done'));
  });
});
