import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTask } from '../api.js';
import { getDeviceId, addTaskId } from '../device.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

export function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (!f) return;
    if (!ALLOWED.includes(f.type)) return setError('请选择 jpg / png / webp 图片');
    if (f.size > MAX_BYTES) return setError('图片不能超过 10MB');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function onSubmit() {
    if (!file) return setError('请先选择照片');
    if (!prompt.trim()) return setError('请填写你的需求描述');
    setSubmitting(true);
    setError(null);
    try {
      const task = await createTask(file, prompt.trim(), getDeviceId());
      addTaskId(task.id);
      navigate(`/waiting/${task.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h2 style={{ marginBottom: 12 }}>上传照片</h2>
      <label
        style={{
          display: 'block',
          aspectRatio: '3 / 4',
          border: '2px dashed #ddd',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 12,
          background: '#fafafa',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="预览"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span
            style={{
              display: 'flex',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
            }}
          >
            点击选择 / 拍摄照片
          </span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="user"
          hidden
          onChange={onPick}
        />
      </label>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="描述你想要的效果，例如：双眼皮、瘦脸、隆鼻……"
        rows={4}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 10,
          border: '1px solid #ddd',
          fontSize: 15,
          marginBottom: 12,
          resize: 'none',
        }}
      />

      {error && <p style={{ color: '#e54848', marginBottom: 12 }}>{error}</p>}

      <button className="btn" onClick={onSubmit} disabled={submitting}>
        {submitting ? '提交中…' : '提交'}
      </button>
      <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>
        <Link to="/history">查看我的历史记录</Link>
      </p>
    </div>
  );
}
