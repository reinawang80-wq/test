'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 检查登录状态
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/info');
        if (response.ok) {
          const data = await response.json();
          if (data.code === 0) {
            setIsLoggedIn(true);
            setUserName(data.data.secondmeInfo.name || '用户');
          }
        }
      } catch (error) {
        // 未登录状态
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setUserName('');
      router.push('/');
    } catch (error) {
      console.error('登出错误:', error);
    }
  };

  return (
    <header className="shadow-sm" style={{background: 'var(--gradient-bg)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">人生设计社区</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">借助AI工具，过好你的一生</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{userName.charAt(0)}</span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:inline">{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  退出
                </button>
              </>
            ) : (
              <Link
                href="/api/auth/login"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}