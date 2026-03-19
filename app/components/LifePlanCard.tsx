'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LifePlanCardProps {
  year: number;
}

export default function LifePlanCard({ year }: LifePlanCardProps) {
  const [progress, setProgress] = useState(Math.floor(Math.random() * 100));

  const getYearDescription = () => {
    switch (year) {
      case 1:
        return '短期目标，关注当前阶段的成长和技能提升';
      case 5:
        return '中期规划，职业发展、能力积累的重要阶段';
      case 10:
        return '长期愿景，人生方向和价值观的体现';
      default:
        return '';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{year}年规划</h3>
          <p className="text-sm text-gray-500 mt-1">{getYearDescription()}</p>
        </div>
        <div className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
          {progress}%
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>完成进度</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(progress)} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-gray-700">设定明确的目标和里程碑</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-700">定期回顾和调整计划</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
          <span className="text-gray-700">记录成长和收获</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <Link
          href={`/life-design/${year}`}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium text-center rounded-md hover:bg-blue-700"
        >
          {progress === 0 ? '开始规划' : '查看详情'}
        </Link>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">
          分享
        </button>
      </div>
    </div>
  );
}