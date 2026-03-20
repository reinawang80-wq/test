'use client';

import { useState, useEffect } from 'react';
import MatchCard from '@/app/components/MatchCard';

// 模拟匹配用户数据
const mockMatches = [
  {
    id: '1',
    name: '张三',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    bio: '产品经理，热爱人生设计，正在学习斯坦福人生设计课',
    matchScore: 92,
    matchReason: '职业发展目标高度一致',
    tags: ['产品经理', '人生设计', '职业发展'],
    lifePlans: [
      { year: 1, title: '提升产品思维能力' },
      { year: 5, title: '成为产品总监' },
    ],
  },
  {
    id: '2',
    name: '李四',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    bio: '软件工程师，关注个人成长和知识管理',
    matchScore: 87,
    matchReason: '知识管理兴趣相投',
    tags: ['软件工程', '知识管理', '个人成长'],
    lifePlans: [
      { year: 1, title: '学习系统设计' },
      { year: 5, title: '技术团队管理' },
    ],
  },
  {
    id: '3',
    name: '王五',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    bio: '设计师，专注于用户体验和视觉表达',
    matchScore: 78,
    matchReason: '创意表达和视觉思维',
    tags: ['UI/UX设计', '视觉艺术', '创意表达'],
    lifePlans: [
      { year: 1, title: '建立个人设计品牌' },
      { year: 5, title: '创办设计工作室' },
    ],
  },
  {
    id: '4',
    name: '赵六',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    bio: '创业者，关注商业模式和团队建设',
    matchScore: 85,
    matchReason: '创业目标和价值观相似',
    tags: ['创业', '商业模式', '团队管理'],
    lifePlans: [
      { year: 1, title: '验证商业模式' },
      { year: 5, title: '打造行业领先公司' },
    ],
  },
  {
    id: '5',
    name: '孙七',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    bio: '心理咨询师，专注于个人成长和心理健康',
    matchScore: 90,
    matchReason: '对心理健康和个人成长的共同关注',
    tags: ['心理咨询', '心理健康', '个人成长'],
    lifePlans: [
      { year: 1, title: '深化心理咨询技能' },
      { year: 5, title: '开设心理咨询工作室' },
    ],
  },
  {
    id: '6',
    name: '周八',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    bio: '教育工作者，致力于教育创新和课程设计',
    matchScore: 82,
    matchReason: '教育理念和方法论一致',
    tags: ['教育创新', '课程设计', '教学法'],
    lifePlans: [
      { year: 1, title: '开发创新教育课程' },
      { year: 5, title: '创办教育科技公司' },
    ],
  },
];

// API响应类型
interface ApiMatch {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  matchScore: number;
  matchReason: string;
  tags: string[];
  lifePlans: Array<{ year: number; title: string }>;
}

interface ApiResponse {
  code: number;
  data: {
    matches: ApiMatch[];
    total: number;
    filter: string;
    pagination: {
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export default function CommunityPage() {
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从API获取匹配数据
  const fetchMatches = async (filterType: string = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/community/matches?filter=${filterType}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`获取数据失败: ${response.status}`);
      }
      const result: ApiResponse = await response.json();
      if (result.code === 0) {
        setMatches(result.data.matches);
      } else {
        throw new Error(`API错误: ${result.data}`);
      }
    } catch (err) {
      console.error('获取匹配数据失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
      // 如果API失败，使用模拟数据作为fallback
      setMatches(mockMatches);
    } finally {
      setLoading(false);
    }
  };

  // 刷新匹配数据
  const handleRefresh = () => {
    fetchMatches(filter);
  };

  // 初始化加载数据
  useEffect(() => {
    fetchMatches(filter);
  }, [filter]);

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    if (filter === 'high') return match.matchScore >= 85;
    if (filter === 'medium') return match.matchScore >= 70 && match.matchScore < 85;
    return match.matchScore < 70;
  });

  const handleConnect = (id: string) => {
    alert(`已发送连接请求给用户 ${id}`);
    // TODO: 实际API调用
  };

  const handleSkip = (id: string) => {
    setMatches(matches.filter(match => match.id !== id));
    alert(`已跳过用户 ${id}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载匹配用户...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">加载失败</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => fetchMatches(filter)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-right">人生设计社区</h1>
        <p className="text-gray-600">
          找到与你人生目标相似的"人生搭子"，互相支持、共同成长
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">筛选条件</h2>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">匹配度</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: '全部匹配', count: matches.length },
                  { value: 'high', label: '高匹配度 (85+)', count: matches.filter(m => m.matchScore >= 85).length },
                  { value: 'medium', label: '中等匹配度 (70-84)', count: matches.filter(m => m.matchScore >= 70 && m.matchScore < 85).length },
                  { value: 'low', label: '低匹配度 (<70)', count: matches.filter(m => m.matchScore < 70).length },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`flex justify-between items-center w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filter === option.value
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">标签筛选</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(matches.flatMap(m => m.tags))).slice(0, 8).map(tag => (
                  <button
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    onClick={() => alert(`筛选标签: ${tag} (功能开发中)`)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">匹配说明</h3>
              <p className="text-sm text-gray-600">
                匹配算法基于您的人生规划、兴趣标签和知识框架，寻找与您目标相似、能够互相启发的伙伴。
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">如何找到优质"搭子"？</h3>
              <a
                href="/community/learn-more"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                了解更多 →
              </a>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">1</span>
                <span>完善您的个人资料和人生规划</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">2</span>
                <span>参与社区讨论，分享您的见解</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">3</span>
                <span>主动发起对话，建立深度连接</span>
              </li>
            </ul>
            <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              完善我的资料
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">推荐匹配</h2>
                <p className="text-gray-600">找到{filteredMatches.length}位与您目标相似的用户</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  刷新推荐
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  完善我的资料
                </button>
              </div>
            </div>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无匹配用户</h3>
              <p className="text-gray-600 mb-6">尝试调整筛选条件或完善您的个人资料以获得更多推荐</p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                更新个人资料
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onConnect={() => handleConnect(match.id)}
                  onSkip={() => handleSkip(match.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-8 bg-white border rounded-lg p-5 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-medium text-gray-900">匹配算法说明</h3>
              <a
                href="/community/learn-more"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                深入了解 →
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 text-base font-semibold mb-1">人生规划相似度</div>
                <p className="text-gray-700 text-xs">比较1/5/10年目标的重合度，目标相似的用户更容易互相支持</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-purple-600 text-base font-semibold mb-1">兴趣标签匹配</div>
                <p className="text-gray-700 text-xs">基于用户选择的兴趣标签计算共同兴趣领域</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-green-600 text-base font-semibold mb-1">知识框架互补</div>
                <p className="text-gray-700 text-xs">分析知识框架的互补性，促进知识交换和学习</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}