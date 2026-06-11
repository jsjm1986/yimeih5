import { useEffect, useState } from 'react';
import * as api from '../api.js';

export function SettingsPage() {
  const [days, setDays] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => setDays(String(s.retentionDays)))
      .catch((e) => setError(e instanceof Error ? e.message : '加载失败'));
  }, []);

  async function save() {
    const n = Number(days);
    if (!Number.isInteger(n) || n < 1) {
      setError('请输入大于 0 的整数天数');
      setMsg(null);
      return;
    }
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const s = await api.updateSettings(n);
      setDays(String(s.retentionDays));
      setMsg('已保存');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480 }}>
        <h3 style={{ marginBottom: 16 }}>图片留存设置</h3>
        <div className="field">
          <label>留存天数（超过后自动清理原图与结果图）</label>
          <input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
        {error && <p style={{ color: '#e54848', marginBottom: 12 }}>{error}</p>}
        {msg && <p style={{ color: '#1a8a4a', marginBottom: 12 }}>{msg}</p>}
        <button className="btn" onClick={save} disabled={busy}>
          {busy ? '保存中…' : '保存'}
        </button>
      </div>
    </div>
  );
}
