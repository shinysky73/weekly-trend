import { useState } from 'react';
import type { NewsItem } from '../services/newsApi';

interface NewsCardProps {
  news: NewsItem;
}

const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="90" fill="%23e5e7eb"%3E%3Crect width="160" height="90"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function NewsCard({ news }: NewsCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <div className="w-full h-36 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        <img
          src={imgError || !news.thumbnailUrl ? PLACEHOLDER_IMG : news.thumbnailUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <a
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
        >
          {news.title}
        </a>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {news.publisher && <span>{news.publisher}</span>}
          {news.publisher && news.publishedDate && <span>·</span>}
          {news.publishedDate && <span>{formatDate(news.publishedDate)}</span>}
        </div>
        {news.snippet && (
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-3 flex-1">
            {news.snippet}
          </p>
        )}
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {news.keyword}
        </div>
      </div>
    </div>
  );
}
