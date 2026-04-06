import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-8">{children}</div>
      </main>
    </div>
  );
}
