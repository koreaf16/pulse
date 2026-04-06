import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'Pulse | Trading Pipeline',
  description: 'Live views for raw ingestion, feature processing, and context generation.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#FAFBFC] text-[#1A1D23]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
