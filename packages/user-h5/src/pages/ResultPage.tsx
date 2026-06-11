import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { TaskDetail } from '@yimei/shared';
import { getTask } from '../api.js';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider.js';

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

  if (error) return <div className="page"><p style={{ color: '#e54848' }}>{error}</p></div>;
  if (!task) return <div className="page"><p className="muted">加载中…</p></div>;

  if (task.status === 'expired' || !task.originalUrl || !task.resultUrl) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
        <h2>图片已过期清理</h2>
        <p className="muted" style={{ marginTop: 12 }}>该任务图片已超过保留期。</p>
        <p className="muted" style={{ marginTop: 24 }}><Link to="/">重新上传</Link></p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 style={{ marginBottom: 12 }}>处理前后对比</h2>
      <BeforeAfterSlider beforeUrl={task.originalUrl} afterUrl={task.resultUrl} />
      <p className="muted" style={{ marginTop: 12 }}>左右拖动查看效果变化</p>
      {task.prompt && <p className="muted" style={{ marginTop: 4 }}>需求：{task.prompt}</p>}
      <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
        <Link className="btn" to="/" style={{ textAlign: 'center', textDecoration: 'none' }}>
          再做一张
        </Link>
        <Link
          className="btn"
          to="/history"
          style={{ textAlign: 'center', textDecoration: 'none', background: '#888' }}
        >
          历史记录
        </Link>
      </div>
    </div>
  );
}
