'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ContentSection {
  id: string;
  title: string;
  type: 'text' | 'list' | 'diagram' | 'reference';
  content: string | string[];
}

export default function NewKnowledgeFrameworkPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('个人成长');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [sections, setSections] = useState<ContentSection[]>([
    { id: '1', title: '核心概念', type: 'text', content: '' },
  ]);
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

      // 调用API创建知识框架
      const response = await fetch('/api/knowledge', {
        method: 'POST',
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
        // 创建成功，跳转到详情页面
        router.push(`/knowledge/frameworks`);
        // 或者跳转到编辑页面：router.push(`/knowledge/frameworks/${result.data.id}`);
      } else {
        throw new Error(result.message || '创建失败');
      }
    } catch (err) {
      console.error('创建知识框架错误:', err);
      setError(err instanceof Error ? err.message : '创建失败，请稍后重试');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          返回知识框架库
        </button>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">创建知识框架</h1>
          <p className="text-gray-600 mt-2">构建结构化的知识体系，帮助自己和他人系统性学习</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-lg p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

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
                    创建中...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    创建知识框架
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* 创建指南 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">如何创建优质的知识框架？</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• <span className="font-medium">结构清晰</span>：按逻辑顺序组织章节，从基础概念到高级应用</li>
            <li>• <span className="font-medium">内容实用</span>：提供可操作的步骤、方法和示例</li>
            <li>• <span className="font-medium">标签准确</span>：使用恰当的标签方便搜索和分类</li>
            <li>• <span className="font-medium">持续更新</span>：定期根据新知识和经验更新框架内容</li>
            <li>• <span className="font-medium">鼓励互动</span>：公开框架并欢迎他人的反馈和建议</li>
          </ul>
        </div>
      </div>
    </div>
  );
}