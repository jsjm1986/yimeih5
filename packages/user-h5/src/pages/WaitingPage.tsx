import { useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { TaskDetail } from '@yimei/shared';
import { getTask, ApiError } from '../api.js';
import { usePolling } from '../hooks/usePolling.js';

export function WaitingPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const fetcher = useCallback(() => getTask(id), [id]);
  const { data, error, errorValue } = usePolling<TaskDetail>(
    fetcher,
    (d) => d.status === 'done' || d.status === 'expired',
    4000,
    (err) => err instanceof ApiError && err.status === 404,
  );

  useEffect(() => {
    if (data?.status === 'done') navigate(`/result/${id}`, { replace: true });
  }, [data?.status, id, navigate]);

  // 永久错误（如任务不存在）：停止等待，显示终态而非无限重试
  const notFound = errorValue instanceof ApiError && errorValue.status === 404;

  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      {data?.status === 'expired' ? (
        <>
          <h2>图片已过期清理</h2>
          <p className="muted" style={{ marginTop: 12 }}>该任务的图片已超过保留期被清理。</p>
        </>
      ) : notFound ? (
        <>
          <h2>找不到该任务</h2>
          <p className="muted" style={{ marginTop: 12 }}>任务可能已失效，请重新上传。</p>
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
        <Link to="/history">返回历史记录</Link>
      </p>
    </div>
  );
}
