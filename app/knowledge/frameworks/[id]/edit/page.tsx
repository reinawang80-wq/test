'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ContentSection {
  id: string;
  title: string;
  type: 'text' | 'list' | 'diagram' | 'reference';
  content: string | string[];
}

export default function EditKnowledgeFrameworkPage() {
  const router = useRouter();
  const params = useParams();
  const frameworkId = params.id as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('个人成长');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [sections, setSections] = useState<ContentSection[]>([
    { id: '1', title: '核心概念', type: 'text', content: '' },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: '个人成长', label: '个人成长' },
    { value: '职业发展', label: '职业发展' },
    { value: '学习提升', label: '学习提升' },
    { value: '健康生活', label: '健康生活' },
    { value: '人际关系', label: '人际关系' },
    { value: '目标管理', label: '目标管理' },
  ];

  // 加载知识框架数据
  useEffect(() => {
    if (!frameworkId) return;

    const fetchFramework = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/knowledge/${frameworkId}`);

        if (!response.ok) {
          throw new Error('获取知识框架失败');
        }

        const result = await response.json();

        if (result.code === 0) {
          const framework = result.data;
          setTitle(framework.title);
          setDescription(framework.description || '');
          setCategory(framework.category);
          setTags(framework.tags || []);
          setIsPublic(framework.isPublic);

          // 处理内容章节
          if (framework.content?.sections) {
            setSections(framework.content.sections);
          }
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        console.error('加载知识框架错误:', err);
        setError(err instanceof Error ? err.message : '加载失败');

        // 如果无法加载，重定向到列表页
        setTimeout(() => {
          router.push('/knowledge/frameworks');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchFramework();
  }, [frameworkId, router]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddSection = () => {
    const newId = (sections.length + 1).toString();
    setSections([...sections, { id: newId, title: '新章节', type: 'text', content: '' }]);
  };

  const handleRemoveSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== sectionId));
    }
  };

  const handleUpdateSection = (sectionId: string, field: keyof ContentSection, value: any) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, [field]: value } : section
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!title.trim()) {
      setError('标题不能为空');
      setSaving(false);
      return;
    }

    if (!category) {
      setError('请选择分类');
      setSaving(false);
      return;
    }

    try {
      // 构建内容数据
      const content = { sections };

      // 调用API更新知识框架
      const response = await fetch(`/api/knowledge/${frameworkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          content,
          tags,
          isPublic,
        }),
      });

      const result = await response.json();

      if (response.ok && result.code === 0) {
        // 更新成功，跳转到详情页面
        router.push(`/knowledge/details?id=${frameworkId}`);
      } else {
        throw new Error(result.message || '更新失败');
      }
    } catch (err) {
      console.error('更新知识框架错误:', err);
      setError(err instanceof Error ? err.message : '更新失败，请稍后重试');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
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
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">加载知识框架中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 返回按钮 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            返回详情
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            删除知识框架
          </button>
        </div>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">编辑知识框架</h1>
          <p className="text-gray-600 mt-2">修改知识框架内容，保持知识体系的最新状态</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* 基本信息 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">基本信息</h2>

              <div className="space-y-6">
                {/* 标题 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：个人成长知识框架"
                    required
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    描述
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="简要描述这个知识框架的内容和价值"
                    rows={3}
                  />
                </div>

                {/* 分类 */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">选择分类</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 标签 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标签
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="输入标签，按Enter添加"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 可见性 */}
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${isPublic ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-5' : ''}`} />
                    </div>
                    <div className="ml-3">
                      <span className="font-medium text-gray-700">公开分享</span>
                      <p className="text-sm text-gray-500">其他人可以查看和学习这个知识框架</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* 内容章节 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">内容章节</h2>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  添加章节
                </button>
              </div>

              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div key={section.id} className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-500">
                          章节 {index + 1}
                        </span>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="章节标题"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={section.type}
                          onChange={(e) => handleUpdateSection(section.id, 'type', e.target.value as any)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="text">文本</option>
                          <option value="list">列表</option>
                          <option value="diagram">图表</option>
                          <option value="reference">参考资料</option>
                        </select>
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(section.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      {section.type === 'text' ? (
                        <textarea
                          value={section.content as string}
                          onChange={(e) => handleUpdateSection(section.id, 'content', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="输入章节内容..."
                          rows={4}
                        />
                      ) : section.type === 'list' ? (
                        <div className="space-y-2">
                          {Array.isArray(section.content) ? (
                            section.content.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newItems = [...(section.content as string[])];
                                    newItems[itemIndex] = e.target.value;
                                    handleUpdateSection(section.id, 'content', newItems);
                                  }}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="列表项内容"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItems = [...(section.content as string[])];
                                    newItems.splice(itemIndex, 1);
                                    handleUpdateSection(section.id, 'content', newItems);
                                  }}
                                  className="p-2 text-red-600 hover:text-red-800"
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          ) : null}
                          <button
                            type="button"
                            onClick={() => {
                              const currentItems = Array.isArray(section.content) ? section.content : [];
                              handleUpdateSection(section.id, 'content', [...currentItems, '']);
                            }}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            添加列表项
                          </button>
                        </div>
                      ) : (
                        <textarea
                          value={typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
                          onChange={(e) => handleUpdateSection(section.id, 'content', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="输入章节内容..."
                          rows={4}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    保存中...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    保存更改
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* 编辑指南 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">编辑知识框架的注意事项</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• <span className="font-medium">保持更新</span>：定期更新知识框架，确保内容的准确性和时效性</li>
            <li>• <span className="font-medium">结构优化</span>：根据反馈调整章节结构和内容组织方式</li>
            <li>• <span className="font-medium">标签优化</span>：更新标签以更好地反映内容，方便他人搜索</li>
            <li>• <span className="font-medium">可见性调整</span>：根据情况调整框架的公开/私有状态</li>
            <li>• <span className="font-medium">备份重要版本</span>：重大修改前可考虑创建备份</li>
          </ul>
        </div>
      </div>
    </div>
  );
}