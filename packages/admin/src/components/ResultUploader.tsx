import { useState } from 'react';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

interface Props {
  onUpload: (file: File) => Promise<void>;
}

export function ResultUploader({ onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setFile(null);
      setPreview(null);
      setError('请上传 jpg / png / webp 图片');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="btn secondary" style={{ display: 'inline-block', marginBottom: 12 }}>
        选择结果图
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          data-testid="result-file"
          hidden
          onChange={onPick}
        />
      </label>
      {preview && (
        <div style={{ marginBottom: 12 }}>
          <img src={preview} alt="结果预览" style={{ maxWidth: 240, borderRadius: 8 }} />
        </div>
      )}
      {error && <p style={{ color: '#e54848', marginBottom: 12 }}>{error}</p>}
      <button className="btn" onClick={submit} disabled={!file || busy}>
        {busy ? '上传中…' : '上传结果'}
      </button>
    </div>
  );
}
