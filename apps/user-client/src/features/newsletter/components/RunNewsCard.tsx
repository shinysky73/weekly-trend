import { useState } from 'react';
import type { RunDetailNews } from '../services/newsletterApi';
import { formatDate } from '../../../lib/format';

interface RunNewsCardProps {
  news: RunDetailNews;
  selected: boolean;
  onToggle: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function RunNewsCard({ news, selected, onToggle, onDelete }: RunNewsCardProps) {
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
        <div className="flex items-start justify-between gap-2">
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            {news.title}
          </a>
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(news.id); }}
              className="text-xs text-gray-400 hover:text-red-500 shrink-0 transition-colors"
              aria-label="뉴스 삭제"
            >
              삭제
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {news.publisher && <span>{news.publisher}</span>}
          {news.publisher && news.publishedDate && <span>·</span>}
          {news.publishedDate && <span>{formatDate(news.publishedDate)}</span>}
        </div>
        {summaryText && (
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{summaryText}</p>
        )}
      </div>
    </label>
  );
}
