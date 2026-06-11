import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTask } from '../api.js';
import { getDeviceId } from '../device.js';
import { AppHeader } from '../components/AppHeader.js';
import { PlusIcon, ClockIcon } from '../components/icons.js';

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
      navigate(`/waiting/${task.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
      setSubmitting(false);
    }
  }

  return (
    <>
      <AppHeader
        right={
          <Link className="appbar-action" to="/history">
            <ClockIcon />
            历史
          </Link>
        }
      />
      <div className="page">
        <div style={{ padding: '26px 2px 22px' }}>
          <p className="eyebrow" style={{ marginBottom: 12 }}>AI 医美效果预览</p>
          <h1 className="display">
            预见更美的
            <br />
            自己
          </h1>
          <p className="subtle" style={{ marginTop: 12 }}>
            上传一张照片，描述你想要的改变，让我们为你呈现。
          </p>
        </div>

        <label className={`dropzone${preview ? ' has-image' : ''}`}>
          {preview ? (
            <>
              <img src={preview} alt="预览" />
              <span className="dropzone-change">
                <PlusIcon />
                点击更换照片
              </span>
            </>
          ) : (
            <span className="dropzone-empty">
              <span className="dropzone-ring">
                <PlusIcon />
              </span>
              <span>
                <span className="dropzone-hint">点击上传 / 拍摄照片</span>
                <br />
                <span className="dropzone-sub">支持 jpg · png · webp，最大 10MB</span>
              </span>
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

        <div style={{ marginTop: 22 }}>
          <label className="field-label" htmlFor="prompt">
            需求描述
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想要的效果，例如：双眼皮、瘦脸、隆鼻……"
            rows={4}
          />
        </div>

        {error && (
          <p className="alert" style={{ marginTop: 16 }}>
            {error}
          </p>
        )}

        <button className="btn" onClick={onSubmit} disabled={submitting} style={{ marginTop: 24 }}>
          {submitting ? '提交中…' : '开始预览'}
        </button>

        <p className="muted" style={{ textAlign: 'center', marginTop: 18 }}>
          提交即表示同意将照片用于效果生成
        </p>
      </div>
    </>
  );
}
