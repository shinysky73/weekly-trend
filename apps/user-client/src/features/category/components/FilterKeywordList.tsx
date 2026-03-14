import type { FilterKeyword } from '../services/keywordApi';

interface FilterKeywordListProps {
  filterKeywords: FilterKeyword[];
  onDelete: (id: number) => void;
}

export function FilterKeywordList({ filterKeywords, onDelete }: FilterKeywordListProps) {
  if (filterKeywords.length === 0) {
    return <p className="text-sm text-gray-400 py-2">제외 키워드가 없습니다</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filterKeywords.map((fk) => (
        <span
          key={fk.id}
          className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/20 px-3 py-1 text-sm text-red-600 dark:text-red-400"
        >
          {fk.text}
          <button
            onClick={() => onDelete(fk.id)}
            className="ml-0.5 text-red-300 hover:text-red-500 transition-colors"
            aria-label={`${fk.text} 삭제`}
          >
            &times;
          </button>
        </span>
      ))}
    </div>
  );
}
