'use client';

import { Match } from '@/types/match';

interface MatchCardProps {
  match: Match;
  onConnect: () => void;
  onSkip: () => void;
}

export default function MatchCard({ match, onConnect, onSkip }: MatchCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (score >= 70) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 85) return 'text-green-700';
    if (score >= 70) return 'text-yellow-700';
    return 'text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={match.avatar}
                alt={match.name}
                className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
              />
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${getScoreColor(match.matchScore)} flex items-center justify-center`}>
                <span className="text-xs font-bold text-white">{match.matchScore}</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{match.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{match.bio}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full ${getScoreTextColor(match.matchScore)} bg-opacity-10 ${match.matchScore >= 85 ? 'bg-green-100' : match.matchScore >= 70 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <span className="text-sm font-semibold">匹配度 {match.matchScore}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">匹配原因: {match.matchReason}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-700 mr-3">兴趣标签</span>
            <div className="flex flex-wrap gap-2">
              {match.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm font-medium text-gray-700 mb-2 block">人生规划</span>
            <div className="space-y-2">
              {match.lifePlans.map((plan, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-16">
                    <span className="text-xs font-medium text-gray-500">{plan.year}年目标</span>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-800">{plan.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            基于人生规划、兴趣标签和知识框架匹配
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onSkip}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              暂时跳过
            </button>
            <button
              onClick={onConnect}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm"
            >
              发起连接
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}