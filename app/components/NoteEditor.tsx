'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, TagIcon } from '@heroicons/react/24/outline';

interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface NoteEditorProps {
  note?: Note | null;
  onSave: (noteData: {
    title: string;
    content: string;
    type: string;
    tags: string[];
    isPublic: boolean;
  }) => void;
  onCancel: () => void;
  noteTypes: Array<{ value: string; label: string }>;
}

export default function NoteEditor({ note, onSave, onCancel, noteTypes }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [type, setType] = useState(note?.type || '规划记录');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(note?.isPublic || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当note变化时更新表单
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setType(note.type);
      setTags(note.tags || []);
      setIsPublic(note.isPublic);
    } else {
      setTitle('');
      setContent('');
      setType('规划记录');
      setTags([]);
      setIsPublic(false);
    }
  }, [note]);

  // 添加标签
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 处理新标签输入（回车添加）
  const handleNewTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('请输入笔记标题');
      return;
    }

    if (!content.trim()) {
      alert('请输入笔记内容');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        type,
        tags,
        isPublic,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {note ? '编辑笔记' : '新建笔记'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          disabled={isSubmitting}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 标题 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            标题 *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="请输入笔记标题"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* 类型选择 */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            笔记类型
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            disabled={isSubmitting}
          >
            {noteTypes.map((noteType) => (
              <option key={noteType.value} value={noteType.value}>
                {noteType.label}
              </option>
            ))}
          </select>
        </div>

        {/* 内容编辑区 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            内容 *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
            placeholder="开始记录你的思考..."
            required
            disabled={isSubmitting}
          />
          <p className="mt-1 text-sm text-gray-500">
            支持Markdown格式，建议每行不超过80个字符
          </p>
        </div>

        {/* 标签管理 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  disabled={isSubmitting}
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleNewTagKeyDown}
                placeholder="添加标签（按回车添加）"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              disabled={isSubmitting}
            >
              添加
            </button>
          </div>
        </div>

        {/* 隐私设置 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
            设为公开笔记（其他用户可见）
          </label>
        </div>

        {/* 表单操作按钮 */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                保存中...
              </span>
            ) : (
              '保存笔记'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}