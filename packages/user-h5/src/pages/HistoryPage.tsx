import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TaskSummary } from '@yimei/shared';
import { listTasks } from '../api.js';
import { getDeviceId } from '../device.js';

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

export function HistoryPage() {
  const [tasks, setTasks] = useState<TaskSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTasks(getDeviceId())
      .then(setTasks)
      .catch((e) => setError(e instanceof Error ? e.message : '加载失败'));
  }, []);

  return (
    <div className="page">
      <h2 style={{ marginBottom: 16 }}>我的记录</h2>
      {error && <p style={{ color: '#e54848' }}>{error}</p>}
      {tasks && tasks.length === 0 && (
        <p className="muted">还没有记录，<Link to="/">去上传第一张</Link></p>
      )}
      {tasks?.map((t) => (
        <Link
          key={t.id}
          to={targetPath(t)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '14px 12px',
            borderBottom: '1px solid #eee',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.prompt}
          </span>
          <span className="muted" style={{ marginLeft: 12 }}>{STATUS_TEXT[t.status]}</span>
        </Link>
      ))}
      <p className="muted" style={{ marginTop: 20, textAlign: 'center' }}>
        <Link to="/">返回上传</Link>
      </p>
    </div>
  );
}
