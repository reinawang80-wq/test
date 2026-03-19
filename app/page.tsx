'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginButton from './components/LoginButton';
import LifePlanCard from './components/LifePlanCard';
import KnowledgeFrameworkCard from './components/KnowledgeFrameworkCard';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/info');
      if (response.ok) {
        const data = await response.json();
        if (data.code === 0) {
          setIsLoggedIn(true);
          setUserInfo(data.data);
        }
      }
    } catch (error) {
      // 未登录
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* 欢迎区域 */}
        <div className="relative rounded-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="山间日出"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-black/05"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isLoggedIn ? `欢迎回来，${userInfo?.secondmeInfo?.name || '朋友'}！` : '欢迎来到人生设计社区'}
          </h1>
          <p className="text-lg text-white/90 mb-6">
            {isLoggedIn
              ? '今天有什么新计划吗？让我们一起规划美好人生。'
              : '基于斯坦福人生设计课和逆算未来概念，借助AI工具帮助你规划1年、5年、10年人生目标，找到志同道合的人生搭子。'}
          </p>
          {!isLoggedIn && (
            <div className="flex space-x-4">
              <LoginButton />
              <Link
                href="/about"
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 border border-white/30"
              >
                了解更多
              </Link>
            </div>
          )}
        </div>
      </div>

      {isLoggedIn ? (
        <>
          {/* 人生规划概览 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">你的人生规划</h2>
              <Link
                href="/life-design/create"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                创建新规划
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 5, 10].map((year) => (
                <LifePlanCard key={year} year={year} />
              ))}
            </div>
          </section>

          {/* 知识框架推荐 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">推荐知识框架</h2>
              <Link
                href="/knowledge"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                查看全部
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <KnowledgeFrameworkCard
                title="斯坦福人生设计课"
                description="设计思维在人生规划中的应用"
                category="个人成长"
                tags={["设计思维", "职业规划", "人生设计"]}
              />
              <KnowledgeFrameworkCard
                title="逆算未来工作法"
                description="从未来目标倒推现在行动的规划方法"
                category="目标管理"
                tags={["目标设定", "时间管理", "规划"]}
              />
              <KnowledgeFrameworkCard
                title="高效学习框架"
                description="建立系统化学习体系的方法论"
                category="学习提升"
                tags={["学习方法", "知识体系", "技能提升"]}
              />
            </div>
          </section>

          {/* 人生搭子推荐 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">你可能的人生搭子</h2>
              <Link
                href="/community"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                发现更多
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a6 6 0 01-9 5.197" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">寻找志同道合的伙伴</h3>
                <p className="text-gray-600 mb-4">基于你的人生规划，为你推荐有相似目标的朋友</p>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90">
                  点击解锁你的人生搭子
                </button>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* 未登录时的功能展示 */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">人生规划工具</h3>
            <p className="text-gray-600">
              基于斯坦福人生设计课方法论，帮助你设定1年、5年、10年人生目标，制定可执行的里程碑计划。
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">知识框架体系</h3>
            <p className="text-gray-600">
              各领域的结构化知识框架，学习路径和最佳实践，帮助你在实现目标的道路上获得正确的知识支持。
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">社区人际链接</h3>
            <p className="text-gray-600">
              找到有相似规划的人生搭子，互相支持、分享经验，借助榜样的力量将梦想具象化并实现它。
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
