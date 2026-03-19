'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon, BookmarkIcon, ShareIcon, PencilIcon, TrashIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface KnowledgeFramework {
  id: string;
  title: string;
  description: string;
  category: string;
  content: any; // JSON格式的内容
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

interface ContentSection {
  id: string;
  title: string;
  type: 'text' | 'list' | 'diagram' | 'reference';
  content: string | string[];
  children?: ContentSection[];
}

// 模拟相关框架（API未实现时使用）
const relatedFrameworks = [
  {
    id: '2',
    title: '职业发展规划框架',
    category: '职业发展',
    description: '从自我认知到职业路径设计的完整职业发展知识体系',
    viewCount: 850,
    likeCount: 189
  },
  {
    id: '3',
    title: '高效学习方法论',
    category: '学习提升',
    description: '基于认知科学的有效学习方法与知识内化策略框架',
    viewCount: 1500,
    likeCount: 320
  },
  {
    id: '4',
    title: '目标管理实践框架',
    category: '目标管理',
    description: '从目标设定、分解到执行跟踪的完整管理体系',
    viewCount: 1100,
    likeCount: 278
  }
];

export default function KnowledgeFrameworkDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const frameworkId = searchParams.get('id');

  const [framework, setFramework] = useState<KnowledgeFramework | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 加载知识框架详情
  useEffect(() => {
    if (!frameworkId) {
      setError('缺少知识框架ID');
      setLoading(false);
      return;
    }

    const fetchFramework = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/knowledge/${frameworkId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('知识框架不存在');
          }
          throw new Error('获取知识框架失败');
        }

        const result = await response.json();

        if (result.code === 0) {
          setFramework(result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        console.error('加载知识框架详情错误:', err);
        setError(err instanceof Error ? err.message : '加载失败');

        // 如果API失败，显示模拟数据供参考
        if (!framework) {
          setFramework({
            id: '1',
            title: '个人成长知识框架',
            description: '涵盖心智模型、习惯养成、情绪管理等核心概念的知识框架',
            category: '个人成长',
            content: {
              sections: [
                {
                  id: '1',
                  title: '核心心智模型',
                  type: 'list',
                  content: [
                    '成长型思维 vs 固定型思维',
                    '第一性原理思考',
                    '双环学习模型',
                    '反思实践模型'
                  ]
                },
                {
                  id: '2',
                  title: '习惯养成系统',
                  type: 'text',
                  content: '基于习惯循环（提示-渴望-反应-奖励）的养成策略，结合环境设计和身份认同构建可持续习惯。'
                },
                {
                  id: '3',
                  title: '情绪管理框架',
                  type: 'list',
                  content: [
                    '情绪识别与命名',
                    '情绪调节策略',
                    '认知重构技术',
                    '正念冥想实践'
                  ]
                },
                {
                  id: '4',
                  title: '自我认知发展',
                  type: 'text',
                  content: '通过反思日记、360度反馈、优势识别等工具，建立清晰的自我认知系统。'
                }
              ]
            },
            tags: ['心智模型', '习惯养成', '情绪管理', '自我认知', '个人成长'],
            isPublic: true,
            viewCount: 1250,
            likeCount: 256,
            createdAt: '2026-03-10',
            updatedAt: '2026-03-15',
            user: { id: '1', name: '成长导师', avatar: '' }
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFramework();
  }, [frameworkId]);

  const handleLike = async () => {
    if (!frameworkId) return;

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    // 更新本地状态
    if (framework) {
      setFramework({
        ...framework,
        likeCount: newLikedState ? framework.likeCount + 1 : framework.likeCount - 1
      });
    }

    // 调用API更新点赞数
    try {
      const response = await fetch(`/api/knowledge/${frameworkId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: newLikedState ? 'like' : 'unlike'
        }),
      });

      const result = await response.json();
      if (result.code !== 0) {
        console.error('点赞操作失败:', result.message);
        // 回滚状态
        setIsLiked(!newLikedState);
        if (framework) {
          setFramework({
            ...framework,
            likeCount: newLikedState ? framework.likeCount - 1 : framework.likeCount + 1
          });
        }
      }
    } catch (err) {
      console.error('点赞API调用失败:', err);
      // 回滚状态
      setIsLiked(!newLikedState);
      if (framework) {
        setFramework({
          ...framework,
          likeCount: newLikedState ? framework.likeCount - 1 : framework.likeCount + 1
        });
      }
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // 这里应该调用API更新收藏状态（暂未实现）
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('链接已复制到剪贴板！');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制链接');
    }
  };

  const handleEdit = () => {
    if (!frameworkId) return;
    // 跳转到编辑页面
    router.push(`/knowledge/frameworks/${frameworkId}/edit`);
  };

  const handleDelete = async () => {
    if (!frameworkId) return;

    if (!confirm('确定要删除这个知识框架吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/knowledge/${frameworkId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.code === 0) {
        // 删除成功，跳转到列表页
        router.push('/knowledge/frameworks');
      } else {
        throw new Error(result.message || '删除失败');
      }
    } catch (err) {
      console.error('删除知识框架错误:', err);
      alert('删除失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const renderContentSection = (section: any) => {
    switch (section.type) {
      case 'list':
        return (
          <ul className="list-disc pl-5 space-y-2">
            {Array.isArray(section.content) && section.content.map((item: string, idx: number) => (
              <li key={idx} className="text-gray-700">{item}</li>
            ))}
          </ul>
        );
      case 'text':
      default:
        return <p className="text-gray-700">{section.content}</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">加载知识框架详情中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !framework) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700">{error || '知识框架不存在'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 返回和操作栏 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            返回知识框架库
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-500">分类:</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  framework.category === '个人成长' ? 'bg-blue-100 text-blue-800' :
                  framework.category === '职业发展' ? 'bg-green-100 text-green-800' :
                  framework.category === '学习提升' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {framework.category}
                </span>
                {!framework.isPublic && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                    私有
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg
                  className={`h-5 w-5 mr-2 ${isLiked ? 'fill-red-600' : 'fill-none'}`}
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {framework.likeCount}
              </button>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BookmarkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
              {/* 编辑和删除按钮（只有创建者可见） */}
              <button
                onClick={handleEdit}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧：主要内容 */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* 标题和描述 */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{framework.title}</h1>
                <p className="text-gray-600 text-lg">{framework.description}</p>
              </div>

              {/* 标签 */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                  {framework.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 内容区域 */}
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">知识框架内容</h2>
                <div className="space-y-8">
                  {framework.content?.sections?.map((section: any) => (
                    <div key={section.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h3>
                      <div className="pl-4">
                        {renderContentSection(section)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 元信息 */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">创建者</p>
                    <p className="font-medium text-gray-900">{framework.user.name}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">创建时间</p>
                    <p className="font-medium text-gray-900">
                      {new Date(framework.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">最后更新</p>
                    <p className="font-medium text-gray-900">
                      {new Date(framework.updatedAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：相关信息 */}
          <div className="lg:w-1/3">
            {/* 统计信息 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">数据统计</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">浏览次数</span>
                  <span className="font-bold text-gray-900">{framework.viewCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">点赞数</span>
                  <span className="font-bold text-gray-900">{framework.likeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">标签数</span>
                  <span className="font-bold text-gray-900">{framework.tags.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">内容模块</span>
                  <span className="font-bold text-gray-900">{framework.content?.sections?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* 相关框架 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">相关知识框架</h3>
              <div className="space-y-4">
                {relatedFrameworks.map((related) => (
                  <Link
                    key={related.id}
                    href={`/knowledge/details?id=${related.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{related.title}</h4>
                        <p className="text-sm text-gray-500 mt-1 truncate">{related.description}</p>
                        <div className="mt-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            related.category === '个人成长' ? 'bg-blue-100 text-blue-800' :
                            related.category === '职业发展' ? 'bg-green-100 text-green-800' :
                            related.category === '学习提升' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {related.category}
                          </span>
                        </div>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {related.viewCount}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        {related.likeCount}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/knowledge/frameworks"
                className="mt-4 block text-center text-blue-600 hover:text-blue-800 font-medium"
              >
                浏览更多知识框架 →
              </Link>
            </div>

            {/* 知识图谱预览 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">知识图谱预览</h3>
              <div className="h-48 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <svg className="h-12 w-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400 text-sm mt-2">生成知识图谱</p>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                    生成图谱
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                基于此知识框架内容自动生成概念关系图
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}