import { useDashboardStats } from '../hooks/useDashboardStats';
import { formatDate } from '../../../lib/format';

export function StatsCards() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-7 bg-gray-200 rounded w-12 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const summaryRate = data.totalNews > 0 ? Math.round((data.totalSummaries / data.totalNews) * 100) : 0;

  const cards = [
    {
      label: '총 수집 뉴스',
      value: data.totalNews.toLocaleString(),
      sub: `+${data.recentNewsThisWeek} 이번 주`,
      subColor: 'text-green-600',
    },
    {
      label: '요약 완료',
      value: data.totalSummaries.toLocaleString(),
      sub: `${summaryRate}% 완료율`,
      subColor: 'text-gray-400',
    },
    {
      label: '카테고리',
      value: String(data.categoryCount),
      sub: `키워드 ${data.keywordCount}개`,
      subColor: 'text-gray-400',
    },
    {
      label: '발송 이력',
      value: String(data.newsletterSendCount),
      sub: data.lastSendDate ? `최근 ${formatDate(data.lastSendDate)}` : '발송 없음',
      subColor: 'text-gray-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
        >
          <p className="text-xs text-gray-500">{card.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          <p className={`text-xs mt-1 ${card.subColor}`}>{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
