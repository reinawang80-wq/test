import Link from 'next/link';

interface KnowledgeFrameworkCardProps {
  title: string;
  description: string;
  category: string;
  tags: string[];
}

export default function KnowledgeFrameworkCard({
  title,
  description,
  category,
  tags,
}: KnowledgeFrameworkCardProps) {
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      '个人成长': 'bg-blue-100 text-blue-800',
      '职业发展': 'bg-green-100 text-green-800',
      '学习提升': 'bg-purple-100 text-purple-800',
      '健康生活': 'bg-red-100 text-red-800',
      '人际关系': 'bg-yellow-100 text-yellow-800',
      '目标管理': 'bg-indigo-100 text-indigo-800',
    };
    return colors[cat] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(category)}`}>
          {category}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>1.2k</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>256</span>
          </div>
        </div>
        <Link
          href="/knowledge/details"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          查看详情 →
        </Link>
      </div>
    </div>
  );
}