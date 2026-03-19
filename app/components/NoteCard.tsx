'use client';

import { useRef, useEffect } from 'react';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: '知乎' | '笔记' | '收藏';
  author?: string;
  createdAt: string;
  tags: string[];
}

interface NoteCardProps {
  note: SearchResult;
  onTextSelection: (noteId: string, selectedText: string, rect: DOMRect) => void;
}

export default function NoteCard({ note, onTextSelection }: NoteCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // 根据来源设置颜色
  const getSourceColor = (source: SearchResult['source']) => {
    switch (source) {
      case '知乎':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case '笔记':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case '收藏':
        return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const sourceColor = getSourceColor(note.source);

  // 处理文本选择
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const selectedText = selection.toString().trim();
      if (!selectedText) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // 检查选择是否在当前卡片内
      if (contentElement.contains(range.commonAncestorContainer)) {
        onTextSelection(note.id, selectedText, rect);
      }
    };

    contentElement.addEventListener('mouseup', handleMouseUp);
    return () => contentElement.removeEventListener('mouseup', handleMouseUp);
  }, [note.id, onTextSelection]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      {/* 标题行 */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">{note.title}</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 ${sourceColor.bg} ${sourceColor.text} ${sourceColor.border} rounded-full text-xs font-medium`}>
            {note.source}
          </span>
          {note.author && (
            <span className="text-xs text-gray-500">@{note.author}</span>
          )}
        </div>
      </div>

      {/* 内容 */}
      <div
        ref={contentRef}
        className="mb-4 text-gray-700 leading-relaxed cursor-text select-text"
        style={{ userSelect: 'text' }}
      >
        {note.content}
        <div className="mt-2 text-xs text-gray-400">
          选择文字可进行高亮、添加到笔记等操作
        </div>
      </div>

      {/* 标签和时间 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="text-xs text-gray-500">
          {formatDate(note.createdAt)}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-3">
        <button
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          onClick={() => {
            // 模拟添加到笔记操作
            const mockRect = new DOMRect(100, 100, 200, 50);
            onTextSelection(note.id, note.title, mockRect);
          }}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加到笔记
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          分享
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          收藏
        </button>
      </div>
    </div>
  );
}