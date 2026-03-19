import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "人生设计社区 - 借助AI规划美好人生",
  description: "基于斯坦福人生设计课和逆算未来概念，帮助你规划1年、5年、10年人生目标，找到志同道合的人生搭子。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} text-gray-900`}>
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
      </body>
    </html>
  );
}
