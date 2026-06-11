import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { TaskDetail } from '@yimei/shared';
import { getTask } from '../api.js';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider.js';
import { AppHeader } from '../components/AppHeader.js';
import { BackIcon, SparkleIcon } from '../components/icons.js';

export function ResultPage() {
  const { id = '' } = useParams();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTask(await getTask(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error)
    return (
      <>
        <AppHeader />
        <div className="page">
          <p className="alert" style={{ marginTop: 24 }}>
            {error}
          </p>
        </div>
      </>
    );
  if (!task)
    return (
      <>
        <AppHeader />
        <div className="page">
          <div className="stage">
            <div className="loader">
              <span className="loader-dot" />
            </div>
            <p className="subtle">加载中…</p>
          </div>
        </div>
      </>
    );

  if (task.status === 'expired' || !task.originalUrl || !task.resultUrl) {
    return (
      <>
        <AppHeader />
        <div className="page">
          <div className="stage">
            <span className="empty-ring">
              <SparkleIcon />
            </span>
            <h2 className="title">图片已过期清理</h2>
            <p className="subtle">该任务图片已超过保留期。</p>
            <Link className="btn btn--ghost" to="/" style={{ maxWidth: 240, marginTop: 8 }}>
              重新上传
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader
        right={
          <Link className="appbar-action" to="/history">
            <BackIcon />
            历史
          </Link>
        }
      />
      <div className="page">
        <div style={{ padding: '22px 2px 18px', textAlign: 'center' }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>
            BEFORE · AFTER
          </p>
          <h1 className="title">前后效果对比</h1>
        </div>

        <BeforeAfterSlider beforeUrl={task.originalUrl} afterUrl={task.resultUrl} />

        <p className="muted" style={{ textAlign: 'center', marginTop: 14 }}>
          左右拖动滑块，查看效果变化
        </p>

        {task.prompt && (
          <div className="card" style={{ marginTop: 18 }}>
            <p className="field-label" style={{ marginBottom: 6 }}>
              你的需求
            </p>
            <p style={{ color: 'var(--ink)' }}>{task.prompt}</p>
          </div>
        )}

        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link className="btn" to="/">
            再做一张
          </Link>
          <Link className="btn btn--ghost" to="/history">
            历史记录
          </Link>
        </div>
      </div>
    </>
  );
}
