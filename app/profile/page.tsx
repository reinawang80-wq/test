'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  secondmeUserId: string;
  name: string;
  avatar: string;
  email: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

interface LifePlan {
  id: string;
  title: string;
  description: string | null;
  year: number;
  category: string;
  progress: number;
  startDate: string;
  endDate: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lifePlans, setLifePlans] = useState<LifePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    bio: '',
  });

  // 加载用户资料
  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error(`获取资料失败: ${response.status}`);
      }
      const result = await response.json();
      if (result.code === 0) {
        setProfile(result.data.user);
        setLifePlans(result.data.lifePlans || []);
        setFormData({
          name: result.data.user.name || '',
          avatar: result.data.user.avatar || '',
          bio: result.data.user.bio || '',
        });
      } else {
        throw new Error(`API错误: ${result.message}`);
      }
    } catch (err) {
      console.error('加载用户资料失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
      // 使用模拟数据作为fallback
      setProfile({
        id: '1',
        secondmeUserId: 'secondme_123',
        name: '当前用户',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        email: 'user@example.com',
        bio: '这是一段个人简介，描述您的兴趣、目标和价值观。',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setFormData({
        name: '当前用户',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        bio: '这是一段个人简介，描述您的兴趣、目标和价值观。',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // 保存资料
  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 0) {
        setProfile(result.data.user);
        setEditing(false);
        alert('资料更新成功！');
      } else {
        throw new Error(`保存失败: ${result.message}`);
      }
    } catch (err) {
      console.error('保存资料失败:', err);
      alert(`保存失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  // 创建新的人生规划
  const handleCreateLifePlan = () => {
    router.push('/life-design');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载个人资料...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">个人资料</h1>
        <p className="text-gray-600">管理您的个人资料和人生规划</p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            {error}。正在使用演示数据，部分功能可能受限。
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">基本信息</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {editing ? '取消编辑' : '编辑资料'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={formData.avatar || profile?.avatar}
                    alt={formData.name || profile?.name}
                    className="w-24 h-24 rounded-full border-2 border-white shadow-lg"
                  />
                  {editing && (
                    <div className="absolute -bottom-2 -right-2">
                      <button
                        onClick={() => {
                          const newAvatar = prompt('请输入头像URL:');
                          if (newAvatar) {
                            setFormData({ ...formData, avatar: newAvatar });
                          }
                        }}
                        className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                      >
                        ✎
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          姓名
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{profile?.name}</h3>
                      <p className="text-gray-600 mt-1">{profile?.email}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  个人简介
                </label>
                {editing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="介绍一下您自己..."
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {profile?.bio || '暂无个人简介'}
                  </p>
                )}
              </div>

              {editing && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    保存更改
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">人生规划</h2>
              <button
                onClick={handleCreateLifePlan}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建新规划
              </button>
            </div>

            {lifePlans.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-5xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无人生规划</h3>
                <p className="text-gray-600 mb-6">创建您的人生规划，让匹配算法更精准地为您推荐"人生搭子"</p>
                <button
                  onClick={handleCreateLifePlan}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  开始规划
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {lifePlans.map((plan) => (
                  <div key={plan.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{plan.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                        {plan.year}年目标
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>进度</span>
                        <span>{Math.round(plan.progress * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${plan.progress * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">资料完整度</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>基本信息</span>
                  <span>80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>人生规划</span>
                  <span>{lifePlans.length > 0 ? '60%' : '0%'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: lifePlans.length > 0 ? '60%' : '0%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>兴趣标签</span>
                  <span>40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                完整的个人资料有助于系统为您推荐更匹配的"人生搭子"，提高社区连接质量。
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">下一步建议</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">1</span>
                <span>添加至少3个人生规划</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">2</span>
                <span>选择5个以上兴趣标签</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">3</span>
                <span>分享您的知识框架</span>
              </li>
            </ul>
            <button
              onClick={() => router.push('/community')}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              查看匹配推荐
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}