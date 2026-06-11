import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import * as api from './api.js';

interface AuthState {
  username: string | null;
  ready: boolean;
  setUsername: (u: string | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((r) => setUsername(r.username))
      .catch(() => setUsername(null))
      .finally(() => setReady(true));
  }, []);

  return (
    <AuthContext.Provider value={{ username, ready, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { username, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="container">加载中…</div>;
  if (!username) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
