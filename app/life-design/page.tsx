'use client';

import { useState, useEffect, useRef } from 'react';

// 类型定义
interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  planId?: string; // 关联的人生规划ID
  createdAt: Date;
}

interface LifePlan {
  id: string;
  title: string;
  description: string;
  year: number;
  category: string;
  goals: any[];
  milestones: any[];
  progress: number;
  isPublic: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface AiGeneratedPlan {
  keyword: string;
  plan: {
    oneYearPlan: {
      goals: string[];
      milestones: string[];
      todos: string[];
    };
    fiveYearPlan: {
      goals: string[];
      milestones: string[];
    };
    tenYearPlan: {
      vision: string;
      goals: string[];
    };
    explanation: string;
  };
  generatedAt: string;
}

interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export default function LifeDesignPage() {
  // 状态管理
  const [plans, setPlans] = useState<LifePlan[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', content: '学习Python编程基础', completed: false, createdAt: new Date() },
    { id: '2', content: '完成机器学习入门课程', completed: true, createdAt: new Date() },
    { id: '3', content: '创建个人作品集', completed: false, createdAt: new Date() },
    { id: '4', content: '每周运动3次', completed: false, createdAt: new Date() },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiKeyword, setAiKeyword] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiGeneratedPlan | null>(null);
  const [newTodo, setNewTodo] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const todoInputRef = useRef<HTMLInputElement>(null);

  // 计算进度
  const progress = todos.length > 0
    ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100)
    : 0;

  // 按年份分组规划
  const plansByYear = {
    year1: plans.filter(p => p.year === 1),
    year5: plans.filter(p => p.year === 5),
    year10: plans.filter(p => p.year === 10),
  };

  // 获取人生规划
  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/life-plans');
      if (!response.ok) {
        throw new Error(`获取数据失败: ${response.status}`);
      }
      const result: ApiResponse<LifePlan[]> = await response.json();
      if (result.code === 0) {
        setPlans(result.data);
      } else {
        throw new Error(`API错误: ${result.message}`);
      }
    } catch (err) {
      console.error('获取人生规划失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  // AI生成规划
  const handleAiGenerate = async () => {
    if (!aiKeyword.trim()) {
      alert('请输入关键词');
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: aiKeyword.trim() }),
      });

      if (!response.ok) {
        throw new Error(`生成失败: ${response.status}`);
      }

      const result: ApiResponse<AiGeneratedPlan> = await response.json();
      if (result.code === 0) {
        setAiResult(result.data);

        // 将AI生成的待办事项添加到待办列表
        const newTodos = result.data.plan.oneYearPlan.todos.map((todo, index) => ({
          id: `ai_${Date.now()}_${index}`,
          content: todo,
          completed: false,
          createdAt: new Date(),
        }));

        setTodos(prev => [...newTodos, ...prev]);

        // 提示用户规划已生成
        alert('AI规划已生成！待办事项已添加到左侧列表，长期规划建议已生成。');
      } else {
        throw new Error(result.message || '生成失败');
      }
    } catch (err) {
      console.error('AI规划生成失败:', err);
      alert(`生成失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setAiLoading(false);
    }
  };

  // 待办事项操作
  const handleAddTodo = () => {
    if (!newTodo.trim()) return;

    const todo: TodoItem = {
      id: `todo_${Date.now()}`,
      content: newTodo.trim(),
      completed: false,
      createdAt: new Date(),
    };

    setTodos(prev => [todo, ...prev]);
    setNewTodo('');

    if (todoInputRef.current) {
      todoInputRef.current.focus();
    }
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // 初始化加载数据
  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载人生规划...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面标题和AI生成区域 */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">人生设计工作台</h1>
            <p className="text-gray-600">
              输入目标 → AI生成规划 → 拆解执行 → 跟踪进度
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? '取消创建' : '手动创建规划'}
          </button>
        </div>

        {/* AI规划生成框 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 AI智能规划生成</h2>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={aiKeyword}
                onChange={(e) => setAiKeyword(e.target.value)}
                placeholder="输入您的目标关键词，如：成为自由职业者、学习AI、健康生活、创业..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
              />
            </div>
            <button
              onClick={handleAiGenerate}
              disabled={aiLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {aiLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中...
                </span>
              ) : '生成规划'}
            </button>
          </div>
          <p className="text-sm text-gray-600">
            基于斯坦福人生设计和逆算未来理念，AI将为您拆解目标为可执行的1年、5年、10年规划
          </p>

          {aiResult && (
            <div className="mt-4 p-4 bg-white border border-green-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">生成结果: "{aiResult.keyword}"</h3>
                <button
                  onClick={() => setAiResult(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-3">{aiResult.plan.explanation}</p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-medium text-blue-700">1年规划</div>
                  <div className="text-gray-600">{aiResult.plan.oneYearPlan.goals.length}个目标</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="font-medium text-purple-700">5年规划</div>
                  <div className="text-gray-600">{aiResult.plan.fiveYearPlan.goals.length}个目标</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-medium text-green-700">10年愿景</div>
                  <div className="text-gray-600">{aiResult.plan.tenYearPlan.goals.length}个目标</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 手动创建规划表单 */}
        {showCreateForm && (
          <div className="bg-white border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">手动创建规划</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：提升产品思维能力"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年份 *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="1">1年目标</option>
                    <option value="5">5年目标</option>
                    <option value="10">10年目标</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="详细描述您的规划"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  创建规划
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 主内容区域 - 左右布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* 左侧：当前进行中的计划 */}
        <div className="lg:col-span-1 flex flex-col h-full">
          <div className="bg-white rounded-xl shadow-sm p-6 flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 当前进行中的计划</h2>

            {/* 进度图 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">整体进度</span>
                <span className="text-lg font-bold text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>已完成: {todos.filter(t => t.completed).length}</span>
                <span>总计: {todos.length}</span>
              </div>
            </div>

            {/* 待办事项列表 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900">待办事项</h3>
                <span className="text-sm text-gray-500">{todos.filter(t => !t.completed).length}项待办</span>
              </div>

              {/* 新增待办输入 */}
              <div className="flex gap-2 mb-4">
                <input
                  ref={todoInputRef}
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                  placeholder="添加新的待办事项..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddTodo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  添加
                </button>
              </div>

              {/* 待办列表 */}
              <div className="space-y-3">
                {todos.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    暂无待办事项
                  </div>
                ) : (
                  todos.map(todo => (
                    <div key={todo.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <button
                        onClick={() => handleToggleTodo(todo.id)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                          todo.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {todo.completed && '✓'}
                      </button>
                      <div className="flex-1">
                        <span className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {todo.content}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {todo.createdAt.toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 左侧底部提示 */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-2">💡 执行建议</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• 每天完成2-3项关键待办</li>
              <li>• 每周回顾进度并调整计划</li>
              <li>• 将大目标拆解为小步骤</li>
              <li>• 定期奖励自己的成就</li>
            </ul>
          </div>
        </div>

        {/* 右侧：长期规划区域 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 h-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">🗺️ 你的长期规划</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1年计划 */}
              <div className="border border-blue-200 rounded-xl p-5 bg-gradient-to-b from-blue-50 to-white">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">1年计划</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">具体可实现的短期目标</p>

                {plansByYear.year1.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-gray-400 text-3xl mb-2">🎯</div>
                    <p className="text-gray-500 text-sm">暂无1年计划</p>
                    <button className="mt-2 text-blue-600 text-sm hover:text-blue-700">
                      + 添加计划
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plansByYear.year1.slice(0, 3).map(plan => (
                      <div key={plan.id} className="p-3 bg-white border border-blue-100 rounded-lg">
                        <div className="font-medium text-gray-800 mb-1">{plan.title}</div>
                        <div className="text-xs text-gray-600 mb-2">{plan.description || '暂无描述'}</div>
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {plan.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            进度 {plan.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                    {plansByYear.year1.length > 3 && (
                      <div className="text-center pt-2">
                        <button className="text-blue-600 text-sm hover:text-blue-700">
                          查看全部 {plansByYear.year1.length} 项
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 5年计划 */}
              <div className="border border-purple-200 rounded-xl p-5 bg-gradient-to-b from-purple-50 to-white">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3 font-bold">
                    5
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">5年计划</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">中期职业和个人发展目标</p>

                {plansByYear.year5.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-gray-400 text-3xl mb-2">🚀</div>
                    <p className="text-gray-500 text-sm">暂无5年计划</p>
                    <button className="mt-2 text-purple-600 text-sm hover:text-purple-700">
                      + 添加计划
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plansByYear.year5.slice(0, 3).map(plan => (
                      <div key={plan.id} className="p-3 bg-white border border-purple-100 rounded-lg">
                        <div className="font-medium text-gray-800 mb-1">{plan.title}</div>
                        <div className="text-xs text-gray-600 mb-2">{plan.description || '暂无描述'}</div>
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            {plan.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            进度 {plan.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                    {plansByYear.year5.length > 3 && (
                      <div className="text-center pt-2">
                        <button className="text-purple-600 text-sm hover:text-purple-700">
                          查看全部 {plansByYear.year5.length} 项
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 10年计划 */}
              <div className="border border-green-200 rounded-xl p-5 bg-gradient-to-b from-green-50 to-white">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 font-bold">
                    10
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">10年计划</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">长期人生愿景和理想</p>

                {plansByYear.year10.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-gray-400 text-3xl mb-2">🌟</div>
                    <p className="text-gray-500 text-sm">暂无10年计划</p>
                    <button className="mt-2 text-green-600 text-sm hover:text-green-700">
                      + 添加计划
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plansByYear.year10.slice(0, 3).map(plan => (
                      <div key={plan.id} className="p-3 bg-white border border-green-100 rounded-lg">
                        <div className="font-medium text-gray-800 mb-1">{plan.title}</div>
                        <div className="text-xs text-gray-600 mb-2">{plan.description || '暂无描述'}</div>
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {plan.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            进度 {plan.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                    {plansByYear.year10.length > 3 && (
                      <div className="text-center pt-2">
                        <button className="text-green-600 text-sm hover:text-green-700">
                          查看全部 {plansByYear.year10.length} 项
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AI规划建议展示区域 */}
            {aiResult && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI规划建议</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">1年行动建议</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {aiResult.plan.oneYearPlan.goals.slice(0, 3).map((goal, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">5年发展路径</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {aiResult.plan.fiveYearPlan.goals.slice(0, 3).map((goal, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-purple-500 mr-2">•</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">10年愿景</h4>
                    <p className="text-sm text-gray-700 mb-2">{aiResult.plan.tenYearPlan.vision}</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {aiResult.plan.tenYearPlan.goals.slice(0, 2).map((goal, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 规划统计和操作 */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">规划统计</h3>
                  <p className="text-sm text-gray-600">共 {plans.length} 个规划目标</p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    导出规划
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    分享进展
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex">
            <div className="flex-1">
              <div className="text-red-800 font-medium mb-1">加载失败</div>
              <div className="text-red-700 text-sm">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 ml-4"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}