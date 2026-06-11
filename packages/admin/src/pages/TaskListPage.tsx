import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AdminTaskSummary, TaskStatus } from '@yimei/shared';
import * as api from '../api.js';

const TABS: { key: TaskStatus | 'all'; label: string }[] = [
  { key: 'pending', label: '待处理' },
  { key: 'done', label: '已完成' },
  { key: 'expired', label: '已过期' },
  { key: 'all', label: '全部' },
];

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: '待处理',
  done: '已完成',
  expired: '已过期',
};

function fmt(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

export function TaskListPage() {
  const [filter, setFilter] = useState<TaskStatus | 'all'>('pending');
  const [tasks, setTasks] = useState<AdminTaskSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .fetchTasks(filter === 'all' ? undefined : filter)
      .then((t) => {
        if (active) setTasks(t);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : '加载失败');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filter]);

  return (
    <div className="container">
      <div className="card">
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab ${filter === t.key ? 'active' : ''}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {error && <p style={{ color: '#e54848' }}>{error}</p>}
        {loading ? (
          <p className="muted">加载中…</p>
        ) : tasks.length === 0 ? (
          <p className="muted">暂无任务</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>原图</th>
                <th>需求描述</th>
                <th>提交时间</th>
                <th>状态</th>
                <th>处理人</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>
                    {t.originalUrl ? (
                      <img className="thumb" src={t.originalUrl} alt="原图" />
                    ) : (
                      <div className="thumb" />
                    )}
                  </td>
                  <td style={{ maxWidth: 320 }}>{t.prompt}</td>
                  <td className="muted">{fmt(t.createdAt)}</td>
                  <td>
                    <span className={`badge ${t.status}`}>{STATUS_LABEL[t.status]}</span>
                  </td>
                  <td className="muted">{t.handledBy ?? '—'}</td>
                  <td>
                    <Link className="btn" to={`/tasks/${t.id}`}>
                      {t.status === 'pending' ? '处理' : '查看'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
