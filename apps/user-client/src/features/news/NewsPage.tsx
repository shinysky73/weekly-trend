import { useEffect, useCallback, useState } from 'react';
import { useNewsStore } from './stores/newsStore';
import { fetchNews } from './services/newsApi';
import { NewsList } from './components/NewsList';
import { NewsFilter } from './components/NewsFilter';
import { Pagination } from './components/Pagination';

const LIMIT = 20;

export function NewsPage() {
  const { news, total, page, loading, categoryId, startDate, endDate, refreshKey, setFilters, resetFilters, setPage, setLoading, setNewsData } = useNewsStore();
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNews({ page, limit: LIMIT, categoryId, startDate, endDate });
      setNewsData(result.data, result.total);
    } catch {
      setError('뉴스를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [page, categoryId, startDate, endDate, refreshKey, setLoading, setNewsData]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const hasFilters = categoryId !== undefined || startDate !== undefined || endDate !== undefined;

  return (
    <div className="space-y-4">
      <NewsFilter
        categoryId={categoryId}
        startDate={startDate}
        endDate={endDate}
        onFilterChange={setFilters}
        onReset={resetFilters}
      />

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadNews}
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            재시도
          </button>
        </div>
      )}

      <NewsList news={news} loading={loading} hasFilters={hasFilters} />

      <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
    </div>
  );
}
