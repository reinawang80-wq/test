'use client';

import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';

export default function LearnMoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <footer className="border-t border-gray-200 py-4 text-center text-sm text-gray-500 dark:text-gray-400" style={{background: 'var(--gradient-bg)'}}>
        <p>人生设计社区 © 2026 - 借助AI工具，过好你的一生</p>
      </footer>
    </div>
  );
}