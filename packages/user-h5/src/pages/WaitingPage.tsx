import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { TaskDetail } from '@yimei/shared';
import { getTask } from '../api.js';
import { usePolling } from '../hooks/usePolling.js';

export function WaitingPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const fetcher = useCallback(() => getTask(id), [id]);
  const { data, error } = usePolling<TaskDetail>(
    fetcher,
    (d) => d.status === 'done' || d.status === 'expired',
    4000,
  );

  if (data?.status === 'done') {
    navigate(`/result/${id}`, { replace: true });
  }

  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      {data?.status === 'expired' ? (
        <>
          <h2>图片已过期清理</h2>
          <p className="muted" style={{ marginTop: 12 }}>该任务的图片已超过保留期被清理。</p>
        </>
      ) : (
        <>
          <div className="spinner" aria-label="处理中" />
          <h2 style={{ marginTop: 24 }}>正在为你处理…</h2>
          <p className="muted" style={{ marginTop: 12 }}>
            通常需要几分钟，请保持页面打开。
          </p>
          {data?.prompt && (
            <p className="muted" style={{ marginTop: 8 }}>需求：{data.prompt}</p>
          )}
          {error && (
            <p className="muted" style={{ marginTop: 12, color: '#e58a00' }}>
              网络不稳定，正在自动重试…
            </p>
          )}
        </>
      )}
      <p className="muted" style={{ marginTop: 24 }}>
        <a href="/history">返回历史记录</a>
      </p>
    </div>
  );
}
