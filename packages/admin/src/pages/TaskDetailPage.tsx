import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { AdminTaskSummary } from '@yimei/shared';
import * as api from '../api.js';
import { ResultUploader } from '../components/ResultUploader.js';

export function TaskDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<AdminTaskSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTask(await api.fetchTask(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpload(file: File) {
    const updated = await api.uploadResult(id, file);
    setTask(updated);
  }

  if (error) return <div className="container"><p style={{ color: '#e54848' }}>{error}</p></div>;
  if (!task) return <div className="container"><p className="muted">加载中…</p></div>;

  return (
    <div className="container">
      <button className="btn secondary" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← 返回列表
      </button>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>任务详情</h3>
        <p style={{ marginBottom: 12 }}>
          <strong>需求描述：</strong>
          {task.prompt}
        </p>
        <p className="muted" style={{ marginBottom: 16 }}>
          提交时间：{new Date(task.createdAt).toLocaleString('zh-CN', { hour12: false })}
          {task.handledBy && ` · 处理人：${task.handledBy}`}
        </p>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <p className="muted" style={{ marginBottom: 6 }}>原图</p>
            {task.originalUrl ? (
              <img src={task.originalUrl} alt="原图" style={{ maxWidth: 320, borderRadius: 8 }} />
            ) : (
              <p className="muted">（图片已清理）</p>
            )}
          </div>
          {task.resultUrl && (
            <div>
              <p className="muted" style={{ marginBottom: 6 }}>结果图</p>
              <img src={task.resultUrl} alt="结果图" style={{ maxWidth: 320, borderRadius: 8 }} />
            </div>
          )}
        </div>

        {task.status === 'expired' ? (
          <p className="muted" style={{ marginTop: 20 }}>该任务已过期清理，无法再上传结果。</p>
        ) : (
          <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 20 }}>
            <h4 style={{ marginBottom: 12 }}>
              {task.status === 'done' ? '重新上传结果图' : '上传结果图'}
            </h4>
            <ResultUploader onUpload={handleUpload} />
          </div>
        )}
      </div>
    </div>
  );
}
