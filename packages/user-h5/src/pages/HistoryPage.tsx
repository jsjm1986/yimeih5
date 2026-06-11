import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TaskSummary } from '@yimei/shared';
import { listTasks } from '../api.js';
import { getDeviceId } from '../device.js';
import { AppHeader } from '../components/AppHeader.js';
import { BackIcon, ChevronIcon, SparkleIcon } from '../components/icons.js';

const STATUS_TEXT: Record<TaskSummary['status'], string> = {
  pending: '处理中',
  done: '已完成',
  expired: '已过期',
};

function targetPath(t: TaskSummary): string {
  if (t.status === 'done') return `/result/${t.id}`;
  if (t.status === 'pending') return `/waiting/${t.id}`;
  return `/result/${t.id}`; // expired 也进结果页，显示过期提示
}

function fmt(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function HistoryPage() {
  const [tasks, setTasks] = useState<TaskSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTasks(getDeviceId())
      .then(setTasks)
      .catch((e) => setError(e instanceof Error ? e.message : '加载失败'));
  }, []);

  return (
    <>
      <AppHeader
        right={
          <Link className="appbar-action" to="/">
            <BackIcon />
            上传
          </Link>
        }
      />
      <div className="page">
        <div style={{ padding: '22px 2px 18px' }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>
            MY RECORDS
          </p>
          <h1 className="title">我的记录</h1>
        </div>

        {error && <p className="alert">{error}</p>}

        {tasks && tasks.length === 0 && (
          <div className="empty">
            <span className="empty-ring">
              <SparkleIcon />
            </span>
            <div>
              <p className="subtle" style={{ marginBottom: 4 }}>
                还没有任何记录
              </p>
              <p className="muted">
                <Link to="/" style={{ color: 'var(--gold-deep)' }}>
                  去上传第一张照片
                </Link>
              </p>
            </div>
          </div>
        )}

        {tasks && tasks.length > 0 && (
          <div className="list">
            {tasks.map((t) => (
              <Link key={t.id} className="list-row" to={targetPath(t)}>
                <div className="list-row-body">
                  <div className="list-row-title">{t.prompt}</div>
                  <div className="list-row-meta">
                    <span className={`badge badge--${t.status}`}>{STATUS_TEXT[t.status]}</span>
                    <span className="list-row-time">{fmt(t.createdAt)}</span>
                  </div>
                </div>
                <span className="list-row-chevron">
                  <ChevronIcon />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
