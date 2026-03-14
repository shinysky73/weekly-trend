import type { Keyword } from '../services/keywordApi';

interface KeywordListProps {
  keywords: Keyword[];
  onDelete: (id: number) => void;
  emptyMessage?: string;
}

export function KeywordList({ keywords, onDelete, emptyMessage = '키워드가 없습니다' }: KeywordListProps) {
  if (keywords.length === 0) {
    return <p className="text-sm text-gray-400 py-2">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw) => (
        <span
          key={kw.id}
          className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm text-gray-700 dark:text-gray-300"
        >
          {kw.text}
          <button
            onClick={() => onDelete(kw.id)}
            className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors"
            aria-label={`${kw.text} 삭제`}
          >
            &times;
          </button>
        </span>
      ))}
    </div>
  );
}
