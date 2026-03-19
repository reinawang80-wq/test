'use client';

import { useState, useEffect, useRef } from 'react';
import KnowledgeGraph from '@/app/components/KnowledgeGraph';
import NoteCard from '@/app/components/NoteCard';
import SearchBar from '@/app/components/SearchBar';
import { MagnifyingGlassIcon, BookmarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: '知乎' | '笔记' | '收藏';
  author?: string;
  createdAt: string;
  tags: string[];
}

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [noteElements, setNoteElements] = useState<Array<{id: string, element: HTMLElement}>>([]);
  const notesContainerRef = useRef<HTMLDivElement>(null);

  // 模拟搜索结果
  const mockSearchResults: SearchResult[] = [
    {
      id: '1',
      title: '如何制定有效的1-5-10年人生规划',
      content: '斯坦福人生设计课中提到，有效的规划需要结合短期行动与长期愿景。首先明确核心价值观，然后分解为可执行的小目标。',
      source: '知乎',
      author: '人生设计导师',
      createdAt: '2026-03-10',
      tags: ['人生规划', '目标管理', '斯坦福'],
    },
    {
      id: '2',
      title: '知识内化的七个层次',
      content: '从信息收集到知识内化需要经历：接收、理解、记忆、应用、分析、评估、创造七个阶段。每个阶段都有不同的学习策略。',
      source: '笔记',
      createdAt: '2026-03-15',
      tags: ['学习理论', '知识管理', '内化'],
    },
    {
      id: '3',
      title: '跨领域学习的价值与方法',
      content: '在快速变化的时代，跨领域学习能力变得尤为重要。T型人才模型：深度掌握一个领域，广度了解多个相关领域。',
      source: '收藏',
      author: '跨学科研究者',
      createdAt: '2026-03-08',
      tags: ['学习方法', '跨领域', 'T型人才'],
    },
    {
      id: '4',
      title: '如何建立个人知识框架',
      content: '个人知识框架的构建包括：1.明确知识领域 2.收集核心概念 3.建立概念间关系 4.定期更新迭代 5.实践应用验证。',
      source: '知乎',
      author: '知识管理专家',
      createdAt: '2026-03-12',
      tags: ['知识框架', '个人成长', '学习系统'],
    },
    {
      id: '5',
      title: '逆算未来规划法实践指南',
      content: '逆算未来规划法：从10年后的理想状态倒推到现在，确定每年、每月、每周需要完成的任务。这种方法能增强目标的可实现性。',
      source: '笔记',
      createdAt: '2026-03-18',
      tags: ['规划方法', '目标设定', '时间管理'],
    },
  ];

  // 处理搜索
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setSearchQuery(query);

    // 模拟API调用延迟
    setTimeout(() => {
      // 简单的关键词匹配
      const results = mockSearchResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.content.toLowerCase().includes(query.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      setSearchResults(results);
      setLoading(false);
    }, 500);
  };

  // 处理画线交互
  const handleTextSelection = (noteId: string, selectedText: string, rect: DOMRect) => {
    setSelectedNoteId(noteId);
    // 这里可以显示浮窗，需要实现浮窗组件
    console.log(`Note ${noteId} selected text: "${selectedText}" at position`, rect);
  };

  // 浮窗操作处理
  const handleSelectionAction = (action: 'add-to-note' | 'copy' | 'highlight' | 'share', selectedText: string) => {
    switch (action) {
      case 'add-to-note':
        alert(`已添加到笔记: ${selectedText}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(selectedText);
        alert('已复制到剪贴板');
        break;
      case 'highlight':
        alert('已高亮标记');
        break;
      case 'share':
        alert('分享功能开发中');
        break;
    }
    setSelectedNoteId(null);
  };

  // 初始化模拟数据
  useEffect(() => {
    setSearchResults(mockSearchResults);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">知识框架</h1>
              <p className="text-gray-600 mt-2">基于你的收藏、笔记和人生计划生成个性化知识图谱</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <a
                href="/knowledge/frameworks"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                知识框架库
              </a>
              <a
                href="/knowledge/frameworks/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                创建框架
              </a>
            </div>
          </div>
        </div>

        {/* 主内容区 - 左右布局 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧：知识图谱 */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">你的知识图谱</h2>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  刷新图谱
                </button>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                基于你的收藏内容、笔记和人生计划生成，帮助你将外部信息内化为个人知识
              </p>
              <div className="h-[400px] border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                <KnowledgeGraph />
                <p className="text-gray-400 text-center">
                  知识图谱可视化区域<br />
                  <span className="text-sm">基于用户数据生成概念关系图</span>
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookmarkIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">数据源</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 个人笔记：12篇</li>
                    <li>• 收藏内容：8个</li>
                    <li>• 人生计划：3个</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <SparklesIcon className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-gray-900">知识节点</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 核心概念：24个</li>
                    <li>• 关系连接：38条</li>
                    <li>• 最近更新：今天</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：搜索区 */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">搜索人生经验</h2>
                <SearchBar onSearch={handleSearch} loading={loading} />
                <p className="text-xs text-gray-500 mt-2">
                  支持自然语言搜索，目前接入知乎接口
                </p>
              </div>

              {/* 搜索结果统计 */}
              {searchQuery && (
                <div className="mb-4 text-sm text-gray-600">
                  搜索 "<span className="font-medium">{searchQuery}</span>" 共找到 {searchResults.length} 条结果
                </div>
              )}

              {/* 笔记信息流 */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto" ref={notesContainerRef}>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">搜索中...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-2">输入关键词搜索人生经验</p>
                    <p className="text-sm text-gray-400 mt-1">或浏览下方推荐内容</p>
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <NoteCard
                      key={result.id}
                      note={result}
                      onTextSelection={handleTextSelection}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 画线浮窗（需要实现） */}
        {selectedNoteId && (
          <div className="fixed z-50" style={{ top: '100px', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="bg-white rounded-lg shadow-xl border p-3 flex space-x-2">
              <button
                onClick={() => handleSelectionAction('add-to-note', '测试文本')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                添加到笔记
              </button>
              <button
                onClick={() => handleSelectionAction('copy', '测试文本')}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                复制
              </button>
              <button
                onClick={() => handleSelectionAction('highlight', '测试文本')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
              >
                高亮
              </button>
              <button
                onClick={() => handleSelectionAction('share', '测试文本')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                分享
              </button>
              <button
                onClick={() => setSelectedNoteId(null)}
                className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}