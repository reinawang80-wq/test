'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NoteList from '@/app/components/NoteList';
import NoteEditor from '@/app/components/NoteEditor';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

// 笔记类型选项
const NOTE_TYPES = [
  { value: '规划记录', label: '规划记录' },
  { value: '学习反思', label: '学习反思' },
  { value: '知识框架', label: '知识框架' },
  { value: '交流记录', label: '交流记录' },
  { value: '其他', label: '其他' },
];

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

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // 获取笔记列表
  const fetchNotes = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedType) params.append('type', selectedType);
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/note?${params.toString()}`);

      if (!response.ok) {
        throw new Error('获取笔记失败');
      }

      const result = await response.json();

      if (result.code === 0) {
        setNotes(result.data.notes || []);
        setPagination(result.data.pagination || {
          page: 1,
          limit: pagination.limit,
          total: 0,
          totalPages: 0,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError(err instanceof Error ? err.message : '获取笔记失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和过滤条件变化时重新获取
  useEffect(() => {
    fetchNotes(1); // 重置到第一页
  }, [searchQuery, selectedType]);

  // 处理创建新笔记
  const handleCreateNote = () => {
    setEditingNote(null);
    setShowEditor(true);
  };

  // 处理编辑笔记
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  // 处理删除笔记
  const handleDeleteNote = async (id: string) => {
    if (!confirm('确定要删除这篇笔记吗？')) return;

    try {
      const response = await fetch(`/api/note?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.code === 0) {
        // 从列表中移除
        setNotes(notes.filter(note => note.id !== id));
        alert('笔记删除成功');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
      alert('删除失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  // 处理保存笔记（创建或更新）
  const handleSaveNote = async (noteData: {
    title: string;
    content: string;
    type: string;
    tags: string[];
    isPublic: boolean;
  }) => {
    try {
      const method = editingNote ? 'PUT' : 'POST';
      const url = editingNote ? '/api/note' : '/api/note';

      const body = editingNote
        ? { ...noteData, id: editingNote.id }
        : noteData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.code === 0) {
        // 刷新列表，保持在当前页
        await fetchNotes(pagination.page);
        setShowEditor(false);
        setEditingNote(null);
        alert(editingNote ? '笔记更新成功' : '笔记创建成功');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
      alert('保存失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingNote(null);
  };

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 搜索时重置到第一页
    fetchNotes(1);
  };

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={handleCancelEdit}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← 返回笔记列表
          </button>
          <NoteEditor
            note={editingNote}
            onSave={handleSaveNote}
            onCancel={handleCancelEdit}
            noteTypes={NOTE_TYPES}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 页面标题和操作栏 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">我的笔记</h1>
              <p className="text-gray-600 mt-2">记录思考、规划和学习反思</p>
            </div>
            <button
              onClick={handleCreateNote}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新建笔记
            </button>
          </div>
        </div>

        {/* 搜索和过滤栏 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索笔记标题或内容..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                  >
                    搜索
                  </button>
                </div>
              </form>
            </div>

            {/* 类型过滤 */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">全部类型</option>
                {NOTE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {selectedType && (
                <button
                  onClick={() => setSelectedType('')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  清除
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 笔记列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">加载中...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchNotes()}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                重试
              </button>
            </div>
          ) : notes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">还没有笔记</p>
              <button
                onClick={handleCreateNote}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                创建第一篇笔记
              </button>
            </div>
          ) : (
            <>
              <NoteList
                notes={notes}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />

              {/* 分页控件 */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示第 {(pagination.page - 1) * pagination.limit + 1} 到{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} 条，
                    共 {pagination.total} 条笔记
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchNotes(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      上一页
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchNotes(pageNum)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => fetchNotes(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}