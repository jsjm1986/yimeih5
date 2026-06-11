import type { ReactNode } from 'react';

interface AppHeaderProps {
  sub?: string;
  right?: ReactNode;
}

export function AppHeader({ sub = '光环 · 美学预览', right }: AppHeaderProps) {
  return (
    <header className="appbar">
      <div className="brand">
        <span className="brand-mark">AURA</span>
        <span className="brand-sub">{sub}</span>
      </div>
      {right}
    </header>
  );
}
