import { useEffect, useState } from 'react';
import { fetchCategories } from '../services/newsApi';
import type { Category } from '../services/newsApi';

interface NewsFilterProps {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  onFilterChange: (filters: { categoryId?: number; startDate?: string; endDate?: string }) => void;
  onReset: () => void;
}

export function NewsFilter({ categoryId, startDate, endDate, onFilterChange, onReset }: NewsFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then((cats) => { setCategories(cats); setCategoryError(false); })
      .catch(() => setCategoryError(true));
  }, []);

  const hasFilters = categoryId !== undefined || startDate !== undefined || endDate !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="카테고리 필터"
        value={categoryId ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onFilterChange({ categoryId: val ? Number(val) : undefined, startDate, endDate });
        }}
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
      >
        <option value="">{categoryError ? '카테고리 로딩 실패' : '전체 카테고리'}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <input
        type="date"
        aria-label="시작일"
        value={startDate ?? ''}
        onChange={(e) => onFilterChange({ categoryId, startDate: e.target.value || undefined, endDate })}
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
      />

      <input
        type="date"
        aria-label="종료일"
        value={endDate ?? ''}
        onChange={(e) => onFilterChange({ categoryId, startDate, endDate: e.target.value || undefined })}
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
      />

      {hasFilters && (
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          초기화
        </button>
      )}
    </div>
  );
}
