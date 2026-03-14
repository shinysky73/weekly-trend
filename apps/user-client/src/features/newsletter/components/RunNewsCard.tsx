import { useState } from 'react';
import type { RunDetailNews } from '../services/newsletterApi';

interface RunNewsCardProps {
  news: RunDetailNews;
  selected: boolean;
  onToggle: (id: number) => void;
}

const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23e5e7eb"%3E%3Crect width="80" height="80"/%3E%3C/svg%3E';

export function RunNewsCard({ news, selected, onToggle }: RunNewsCardProps) {
  const [imgError, setImgError] = useState(false);
  const summaryText = news.summary?.text ?? news.snippet ?? '';

  return (
    <label className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
      selected
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
    }`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(news.id)}
        className="mt-1 rounded border-gray-300 text-blue-600 shrink-0"
      />
      {news.thumbnailUrl && !imgError && (
        <img
          src={news.thumbnailUrl}
          alt=""
          className="w-16 h-16 rounded object-cover shrink-0"
          onError={() => setImgError(true)}
        />
      )}
      <div className="flex-1 min-w-0">
        <a
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
          onClick={(e) => e.stopPropagation()}
        >
          {news.title}
        </a>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {news.publisher && <span>{news.publisher}</span>}
          {news.publisher && news.publishedDate && <span>·</span>}
          {news.publishedDate && <span>{new Date(news.publishedDate).toLocaleDateString('ko-KR')}</span>}
        </div>
        {summaryText && (
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{summaryText}</p>
        )}
      </div>
    </label>
  );
}
