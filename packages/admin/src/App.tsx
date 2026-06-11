import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, useAuth } from './auth.js';
import * as api from './api.js';
import { LoginPage } from './pages/LoginPage.js';
import { TaskListPage } from './pages/TaskListPage.js';
import { TaskDetailPage } from './pages/TaskDetailPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

function TopBar() {
  const { username, setUsername } = useAuth();
  const navigate = useNavigate();
  if (!username) return null;

  async function onLogout() {
    await api.logout();
    setUsername(null);
    navigate('/login', { replace: true });
  }

  return (
    <div className="topbar">
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <strong>医美后台</strong>
        <Link to="/">任务</Link>
        <Link to="/settings">设置</Link>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span className="muted">{username}</span>
        <button className="btn secondary" onClick={onLogout}>登出</button>
      </div>
    </div>
  );
}

function Shell() {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TaskListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <TaskDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
