'use client';

import { useState, useEffect } from 'react';
import KnowledgeFrameworkCard from '@/app/components/KnowledgeFrameworkCard';
import { PlusIcon, FunnelIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface KnowledgeFramework {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface Category {
  id: string;
  name: string;
  count: number;
}

export default function KnowledgeFrameworksPage() {
  const [frameworks, setFrameworks] = useState<KnowledgeFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPublicOnly, setShowPublicOnly] = useState(false);

  // 知识检索相关状态
  const [activeTab, setActiveTab] = useState<'local' | 'search'>('local'); // 当前激活的标签页
  const [searchResults, setSearchResults] = useState<any[]>([]); // 知识检索结果
  const [searchLoading, setSearchLoading] = useState(false); // 知识检索加载状态
  const [searchError, setSearchError] = useState(''); // 知识检索错误信息

  // 分类列表
  const categories: Category[] = [
    { id: 'all', name: '全部', count: 0 },
    { id: '个人成长', name: '个人成长', count: 12 },
    { id: '职业发展', name: '职业发展', count: 8 },
    { id: '学习提升', name: '学习提升', count: 15 },
    { id: '健康生活', name: '健康生活', count: 6 },
    { id: '人际关系', name: '人际关系', count: 9 },
    { id: '目标管理', name: '目标管理', count: 11 },
  ];

  // 模拟标签云
  const popularTags = [
    '人生规划', '时间管理', '目标设定', '学习方法', '知识内化',
    '职业规划', '技能提升', '健康管理', '情绪管理', '人际沟通'
  ];

  // 获取知识框架列表
  const fetchFrameworks = async () => {
    try {
      setLoading(true);
      setError('');

      // 构建查询参数
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (showPublicOnly) {
        params.append('isPublic', 'true');
      }

      const response = await fetch(`/api/knowledge?${params.toString()}`);

      if (!response.ok) {
        throw new Error('获取知识框架失败');
      }

      const result = await response.json();

      if (result.code === 0) {
        setFrameworks(result.data.frameworks);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('获取知识框架错误:', err);
      setError(err instanceof Error ? err.message : '未知错误');

      // 如果API失败，显示模拟数据
      setFrameworks([
        {
          id: '1',
          title: '个人成长知识框架',
          description: '涵盖心智模型、习惯养成、情绪管理等核心概念的知识框架',
          category: '个人成长',
          tags: ['心智模型', '习惯养成', '情绪管理', '自我认知'],
          isPublic: true,
          viewCount: 1200,
          likeCount: 256,
          createdAt: '2026-03-10',
          updatedAt: '2026-03-15',
          user: { id: '1', name: '成长导师', avatar: '' }
        },
        {
          id: '2',
          title: '职业发展规划框架',
          description: '从自我认知到职业路径设计的完整职业发展知识体系',
          category: '职业发展',
          tags: ['职业规划', '技能树', '行业分析', '职场技能'],
          isPublic: true,
          viewCount: 850,
          likeCount: 189,
          createdAt: '2026-03-12',
          updatedAt: '2026-03-16',
          user: { id: '2', name: '职业顾问', avatar: '' }
        },
        {
          id: '3',
          title: '高效学习方法论',
          description: '基于认知科学的有效学习方法与知识内化策略框架',
          category: '学习提升',
          tags: ['学习方法', '认知科学', '知识内化', '记忆技巧'],
          isPublic: true,
          viewCount: 1500,
          likeCount: 320,
          createdAt: '2026-03-08',
          updatedAt: '2026-03-14',
          user: { id: '3', name: '学习专家', avatar: '' }
        },
        {
          id: '4',
          title: '健康生活管理体系',
          description: '从饮食、运动到心理健康的一体化健康生活知识框架',
          category: '健康生活',
          tags: ['饮食健康', '运动科学', '心理健康', '睡眠管理'],
          isPublic: true,
          viewCount: 680,
          likeCount: 142,
          createdAt: '2026-03-05',
          updatedAt: '2026-03-10',
          user: { id: '4', name: '健康教练', avatar: '' }
        },
        {
          id: '5',
          title: '人际关系构建指南',
          description: '人际沟通、关系维护、社交网络建设的知识框架',
          category: '人际关系',
          tags: ['沟通技巧', '关系维护', '社交网络', '情商培养'],
          isPublic: true,
          viewCount: 920,
          likeCount: 210,
          createdAt: '2026-03-15',
          updatedAt: '2026-03-17',
          user: { id: '5', name: '社交达人', avatar: '' }
        },
        {
          id: '6',
          title: '目标管理实践框架',
          description: '从目标设定、分解到执行跟踪的完整管理体系',
          category: '目标管理',
          tags: ['目标设定', '任务分解', '执行跟踪', '复盘优化'],
          isPublic: true,
          viewCount: 1100,
          likeCount: 278,
          createdAt: '2026-03-01',
          updatedAt: '2026-03-12',
          user: { id: '6', name: '目标管理专家', avatar: '' }
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchFrameworks();
  }, [selectedCategory, showPublicOnly]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'local') {
      fetchFrameworks();
    } else {
      performKnowledgeSearch();
    }
  };

  // 执行知识检索搜索
  const performKnowledgeSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('请输入搜索关键词');
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError('');
      setSearchResults([]);

      const params = new URLSearchParams({
        q: searchQuery.trim(),
        count: '10'
      });

      const response = await fetch(`/api/knowledge/search?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '搜索失败');
      }

      const result = await response.json();

      if (result.code === 0) {
        setSearchResults(result.data.items || []);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('知识检索搜索错误:', err);
      setSearchError(err instanceof Error ? err.message : '搜索失败');

      // 显示模拟数据（用于演示）
      if (searchQuery.toLowerCase().includes('学习') || searchQuery.includes('知识')) {
        setSearchResults([
          {
            id: 'demo_1',
            title: '高效学习方法论',
            content: '基于认知科学的有效学习方法与知识内化策略框架',
            type: 'Article',
            url: 'https://zhihu.com/article/123',
            author: {
              name: '学习专家',
              avatar: '',
              badge: '',
              badgeText: '',
              authorityLevel: '2'
            },
            stats: {
              commentCount: 45,
              voteUpCount: 320
            },
            editTime: 1748355858,
            comments: ['很有帮助的方法论', '收藏学习了'],
            source: 'zhihu'
          },
          {
            id: 'demo_2',
            title: '个人成长知识框架',
            content: '涵盖心智模型、习惯养成、情绪管理等核心概念的知识框架',
            type: 'Answer',
            url: 'https://zhihu.com/answer/456',
            author: {
              name: '成长导师',
              avatar: '',
              badge: '',
              badgeText: '',
              authorityLevel: '3'
            },
            stats: {
              commentCount: 32,
              voteUpCount: 256
            },
            editTime: 1748269458,
            comments: ['系统性的知识框架', '值得反复学习'],
            source: 'zhihu'
          }
        ]);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // 处理标签页切换
  const handleTabChange = (tab: 'local' | 'search') => {
    setActiveTab(tab);
    if (tab === 'local' && frameworks.length === 0) {
      fetchFrameworks();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 页面标题和操作栏 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">知识框架库</h1>
              <p className="text-gray-600 mt-2">探索用户分享的知识框架，或创建自己的知识体系</p>
            </div>
            <Link
              href="/knowledge/frameworks/new"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              创建知识框架
            </Link>
          </div>

          {/* 标签切换 */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => handleTabChange('local')}
                className={`px-4 py-3 font-medium text-sm focus:outline-none transition-colors ${
                  activeTab === 'local'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                本地知识框架
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('search')}
                className={`px-4 py-3 font-medium text-sm focus:outline-none transition-colors ${
                  activeTab === 'search'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                全网知识检索
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  新
                </span>
              </button>
            </div>
          </div>

          {/* 搜索和筛选栏 */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'local' ? '搜索知识框架...' : '搜索全网知识内容（如：学习方法、个人成长）...'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 分类筛选 */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
                <FunnelIcon className="h-5 w-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>

              {/* 公开/私有切换 */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPublicOnly}
                    onChange={(e) => setShowPublicOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${showPublicOnly ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${showPublicOnly ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="ml-3 text-gray-700">只显示公开框架</span>
                </label>
              </div>

              {/* 搜索按钮 */}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {activeTab === 'local' ? '搜索' : '全网搜索'}
              </button>
            </form>
          </div>
        </div>

        {/* 主要内容区 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧：知识框架列表 */}
          <div className="lg:w-2/3">
            {/* 统计信息 */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpenIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">知识框架总数</p>
                    <p className="text-2xl font-bold text-gray-900">{frameworks.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">总点赞数</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {frameworks.reduce((sum, f) => sum + f.likeCount, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">总浏览数</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {frameworks.reduce((sum, f) => sum + f.viewCount, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 知识框架列表/搜索结果 */}
            {activeTab === 'search' ? (
              <>
                {/* 知识检索搜索状态 */}
                {searchError && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <p className="text-yellow-700">{searchError}</p>
                    <p className="text-sm text-yellow-600 mt-1">
                      知识检索功能需要配置知乎API密钥。如需使用，请设置ZHI_HU_APP_KEY和ZHI_HU_APP_SECRET环境变量。
                    </p>
                  </div>
                )}

                {searchLoading ? (
                  <div className="bg-white rounded-xl border p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">正在搜索全网知识内容...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        <p className="text-blue-700">
                          找到 {searchResults.length} 条关于 "<span className="font-medium">{searchQuery}</span>" 的知识内容
                        </p>
                      </div>
                      <p className="text-sm text-blue-600 mt-2">
                        数据来源：知乎开放平台 - 全网可信搜接口
                      </p>
                    </div>

                    {searchResults.map((item: any) => (
                      <div key={item.id} className="bg-white rounded-xl border hover:shadow-md transition-shadow overflow-hidden">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                              {item.type === 'Answer' ? '问答' : item.type === 'Article' ? '文章' : '问题'}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-4">{item.content}</p>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="flex items-center mr-4">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <span>{item.author.name}</span>
                              </div>
                              <div className="flex items-center mr-4">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{new Date(item.editTime * 1000).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                <span>{item.stats.voteUpCount}</span>
                              </div>
                            </div>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                            >
                              查看原文
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="bg-white rounded-xl border p-8 text-center">
                    <svg className="h-16 w-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 mt-4">未找到相关结果</p>
                    <p className="text-sm text-gray-500 mt-2">尝试不同的关键词或切换到本地知识框架</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border p-8 text-center">
                    <svg className="h-16 w-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-600 mt-4">搜索全网知识内容</p>
                    <p className="text-sm text-gray-500 mt-2">输入关键词搜索知乎等平台的问答、文章等内容</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {error && !frameworks.length && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-700">{error}，显示模拟数据供参考</p>
                  </div>
                )}

                {loading && frameworks.length === 0 ? (
              <div className="bg-white rounded-xl border p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">加载知识框架中...</p>
              </div>
                ) : frameworks.length === 0 ? (
              <div className="bg-white rounded-xl border p-8 text-center">
                <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto" />
                <p className="text-gray-600 mt-4">暂无知识框架</p>
                <p className="text-sm text-gray-500 mt-2">尝试调整筛选条件或创建第一个知识框架</p>
                <Link
                  href="/knowledge/frameworks/new"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  创建知识框架
                </Link>
              </div>
                ) : (
              <div className="grid grid-cols-1 gap-6">
                {frameworks.map((framework) => (
                  <div key={framework.id} className="bg-white rounded-xl border hover:shadow-md transition-shadow">
                    <KnowledgeFrameworkCard
                      title={framework.title}
                      description={framework.description}
                      category={framework.category}
                      tags={framework.tags}
                    />
                    <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{framework.user.name}</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(framework.createdAt).toLocaleDateString()}</span>
                          </div>
                          {!framework.isPublic && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                              私有
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/knowledge/frameworks/${framework.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          查看详情 →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                )
            }
            </>
            )
            }
          </div>

          {/* 右侧：标签云和热门框架 */}
          <div className="lg:w-1/3">
            {/* 标签云 */}
            <div className="bg-white rounded-xl border p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">热门标签</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 热门框架 */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">热门知识框架</h3>
              <div className="space-y-4">
                {frameworks.slice(0, 3).map((framework) => (
                  <div key={framework.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <h4 className="font-medium text-gray-900">{framework.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 truncate">{framework.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        framework.category === '个人成长' ? 'bg-blue-100 text-blue-800' :
                        framework.category === '职业发展' ? 'bg-green-100 text-green-800' :
                        framework.category === '学习提升' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {framework.category}
                      </span>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {framework.viewCount}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          {framework.likeCount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 使用指南 */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">如何使用知识框架？</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <span className="font-medium">浏览</span>：按分类或标签查找感兴趣的知识框架</li>
                <li>• <span className="font-medium">学习</span>：系统性地学习某个领域的知识结构</li>
                <li>• <span className="font-medium">创建</span>：基于个人经验构建自己的知识体系</li>
                <li>• <span className="font-medium">分享</span>：将知识框架公开，帮助他人学习</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}