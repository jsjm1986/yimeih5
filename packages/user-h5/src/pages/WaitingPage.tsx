import { useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { TaskDetail } from '@yimei/shared';
import { getTask, ApiError } from '../api.js';
import { usePolling } from '../hooks/usePolling.js';
import { AppHeader } from '../components/AppHeader.js';
import { SparkleIcon } from '../components/icons.js';

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
    <>
      <AppHeader />
      <div className="page">
        {data?.status === 'expired' ? (
          <div className="stage">
            <span className="empty-ring">
              <SparkleIcon />
            </span>
            <h2 className="title">图片已过期清理</h2>
            <p className="subtle">该任务的图片已超过保留期被清理。</p>
            <Link className="btn btn--ghost" to="/" style={{ maxWidth: 240, marginTop: 8 }}>
              重新上传
            </Link>
          </div>
        ) : notFound ? (
          <div className="stage">
            <span className="empty-ring">
              <SparkleIcon />
            </span>
            <h2 className="title">找不到该任务</h2>
            <p className="subtle">任务可能已失效，请重新上传。</p>
            <Link className="btn btn--ghost" to="/" style={{ maxWidth: 240, marginTop: 8 }}>
              重新上传
            </Link>
          </div>
        ) : (
          <div className="stage">
            <div className="loader" aria-label="处理中">
              <span className="loader-dot" />
            </div>
            <p className="eyebrow" style={{ marginTop: 6 }}>
              PROCESSING
            </p>
            <h2 className="title">正在为你打造</h2>
            <p className="subtle" style={{ maxWidth: 280 }}>
              专业团队正在精心处理，通常需要几分钟，请保持页面打开。
            </p>
            {data?.prompt && (
              <div className="card" style={{ marginTop: 8, width: '100%' }}>
                <p className="field-label" style={{ marginBottom: 6 }}>
                  你的需求
                </p>
                <p style={{ color: 'var(--ink)' }}>{data.prompt}</p>
              </div>
            )}
            {error && <p className="alert alert--soft">网络不稳定，正在自动重试…</p>}
            <p className="muted" style={{ marginTop: 8 }}>
              <Link to="/history" style={{ color: 'var(--gold-deep)' }}>
                返回历史记录
              </Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
