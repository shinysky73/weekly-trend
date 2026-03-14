import type { NewsItem } from '../services/newsApi';
import { NewsCard } from './NewsCard';

interface NewsListProps {
  news: NewsItem[];
  loading: boolean;
  hasFilters: boolean;
}

export function NewsList({ news, loading, hasFilters }: NewsListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden animate-pulse">
            <div className="w-full h-36 bg-gray-200 dark:bg-gray-800" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        {hasFilters ? '조건에 맞는 뉴스가 없습니다' : '수집된 뉴스가 없습니다'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
}
