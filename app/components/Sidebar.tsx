'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/info');
        if (response.ok) {
          const data = await response.json();
          if (data.code === 0) {
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const navItems = [
    { name: '首页', href: '/', icon: '🏠' },
    { name: '人生设计', href: '/life-design', icon: '🎯' },
    { name: '知识框架', href: '/knowledge', icon: '📚' },
    { name: '社区', href: '/community', icon: '👥' },
    { name: '我的笔记', href: '/notes', icon: '📝' },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden md:block transition-all duration-300`} style={{background: 'var(--gradient-bg)'}}>
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-white/30 dark:hover:bg-white/10"
            title={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
          >
            {isCollapsed ? (
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>
        <div className="mb-8">
          <h2 className={`text-lg font-semibold text-gray-900 mb-4 ${isCollapsed ? 'hidden' : 'block'}`}>导航</h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              if (isCollapsed) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-center px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100/40 text-blue-700 border border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50'
                        : 'text-gray-700 hover:bg-white/30 dark:text-gray-300 dark:hover:bg-white/10'
                    }`}
                    title={item.name}
                  >
                    <span className="text-lg">{item.icon}</span>
                  </Link>
                );
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100/40 text-blue-700 border-l-4 border-blue-600 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500'
                      : 'text-gray-700 hover:bg-white/30 dark:text-gray-300 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {isLoggedIn && !isCollapsed && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快速入口</h2>
            <div className="space-y-3">
              <Link
                href="/life-design/create"
                className="block px-4 py-3 bg-white/60 backdrop-blur-sm border border-blue-100/50 rounded-lg hover:bg-white/80 dark:bg-gray-800/60 dark:border-blue-800/50 dark:hover:bg-gray-800/80"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100/60 rounded-lg flex items-center justify-center dark:bg-blue-900/60">
                    <span className="text-blue-600">+</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">创建人生规划</p>
                    <p className="text-sm text-gray-500">设定1/5/10年目标</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">人生设计社区</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              基于斯坦福人生设计课和逆算未来概念，借助AI工具帮助你规划美好人生。
            </p>
            <Link
              href="/about"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300"
            >
              了解更多 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}