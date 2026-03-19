'use client';

import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

// 类型标签颜色映射
const TYPE_COLORS: Record<string, string> = {
  '规划记录': 'bg-blue-100 text-blue-800',
  '学习反思': 'bg-green-100 text-green-800',
  '知识框架': 'bg-purple-100 text-purple-800',
  '交流记录': 'bg-yellow-100 text-yellow-800',
  '其他': 'bg-gray-100 text-gray-800',
};

// 标签颜色映射
const TAG_COLORS = [
  'bg-red-100 text-red-800',
  'bg-orange-100 text-orange-800',
  'bg-yellow-100 text-yellow-800',
  'bg-green-100 text-green-800',
  'bg-blue-100 text-blue-800',
  'bg-indigo-100 text-indigo-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
];

// 获取标签颜色
const getTagColor = (index: number) => {
  return TAG_COLORS[index % TAG_COLORS.length];
};

export default function NoteList({ notes, onEdit, onDelete }: NoteListProps) {
  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  // 获取内容预览（截取前100个字符）
  const getContentPreview = (content: string) => {
    if (content.length <= 100) return content;
    return content.substring(0, 100) + '...';
  };

  return (
    <div className="divide-y divide-gray-200">
      {notes.map((note) => (
        <div key={note.id} className="p-6 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* 标题和操作按钮 */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {note.title}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${TYPE_COLORS[note.type] || TYPE_COLORS['其他']}`}>
                    {note.type}
                  </span>
                  {note.isPublic ? (
                    <span className="flex items-center text-xs text-green-600">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      公开
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-gray-600">
                      <EyeSlashIcon className="h-4 w-4 mr-1" />
                      私有
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(note)}
                    className="text-gray-600 hover:text-blue-600 p-1 rounded hover:bg-gray-100"
                    title="编辑"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(note.id)}
                    className="text-gray-600 hover:text-red-600 p-1 rounded hover:bg-gray-100"
                    title="删除"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 标签 */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags.map((tag, index) => (
                    <span
                      key={tag}
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getTagColor(index)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 内容预览 */}
              <p className="text-gray-700 mb-4 whitespace-pre-line">
                {getContentPreview(note.content)}
              </p>

              {/* 元信息 */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>创建: {formatDate(note.createdAt)}</span>
                  {note.updatedAt !== note.createdAt && (
                    <span>更新: {formatDate(note.updatedAt)}</span>
                  )}
                </div>
                <button
                  onClick={() => onEdit(note)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  阅读全文 →
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}