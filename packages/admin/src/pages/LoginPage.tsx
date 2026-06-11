import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as api from '../api.js';
import { useAuth } from '../auth.js';

interface FromState {
  from?: { pathname: string };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUsername } = useAuth();
  const [username, setUser] = useState('');
  const [password, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const redirectTo = (location.state as FromState | null)?.from?.pathname ?? '/';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.login(username, password);
      setUsername(res.username);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '120px auto', padding: '0 24px' }}>
      <div className="card">
        <h2 style={{ marginBottom: 20 }}>后台登录</h2>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>用户名</label>
            <input value={username} onChange={(e) => setUser(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>密码</label>
            <input type="password" value={password} onChange={(e) => setPass(e.target.value)} />
          </div>
          {error && <p style={{ color: '#e54848', marginBottom: 12 }}>{error}</p>}
          <button className="btn" style={{ width: '100%' }} disabled={busy}>
            {busy ? '登录中…' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
