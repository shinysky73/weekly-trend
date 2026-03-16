import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRunDetail } from './hooks/useRunDetail';
import { useSelectionStore } from './stores/selectionStore';
import { exportCsv } from './services/newsletterApi';
import { mapSelectedToCsvItemsWithKeyword } from './services/mapSelectedNews';
import { deleteNews } from '../pipeline/services/pipelineApi';
import { RunNewsList } from './components/RunNewsList';
import { SelectionSidebar } from './components/SelectionSidebar';
import { NewsletterPreview } from './components/NewsletterPreview';

export function RunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const runId = Number(id);
  const { data, isLoading, isError, error, groupedNews, refetch } = useRunDetail(runId);
  const [mode, setMode] = useState<'select' | 'preview'>('select');
  const { selectedIds, clearAll } = useSelectionStore();

  // Filters
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [filterKeyword, setFilterKeyword] = useState<string | null>(null);

  // Derive available categories and keywords
  const categories = useMemo(() => groupedNews.map((g) => ({ id: g.categoryId, name: g.categoryName })), [groupedNews]);
  const keywords = useMemo(() => {
    const set = new Set<string>();
    for (const g of groupedNews) {
      if (filterCategory !== null && g.categoryId !== filterCategory) continue;
      for (const n of g.news) set.add(n.keyword);
    }
    return Array.from(set).sort();
  }, [groupedNews, filterCategory]);

  // Apply filters
  const filteredGroups = useMemo(() => {
    let groups = groupedNews;
    if (filterCategory !== null) {
      groups = groups.filter((g) => g.categoryId === filterCategory);
    }
    if (filterKeyword !== null) {
      groups = groups
        .map((g) => ({ ...g, news: g.news.filter((n) => n.keyword === filterKeyword) }))
        .filter((g) => g.news.length > 0);
    }
    return groups;
  }, [groupedNews, filterCategory, filterKeyword]);

  // Reset keyword filter when category changes
  useEffect(() => {
    setFilterKeyword(null);
  }, [filterCategory]);

  useEffect(() => {
    clearAll();
  }, [runId, clearAll]);

  // Auto-refresh if pipeline is still running
  useEffect(() => {
    if (data?.status !== 'running') return;
    const interval = setInterval(() => refetch(), 5000);
    return () => clearInterval(interval);
  }, [data?.status, refetch]);

  const handleDeleteNews = useCallback(async (newsId: number) => {
    try {
      await deleteNews(newsId);
      refetch();
    } catch {
      // silent
    }
  }, [refetch]);

  const handleExportCsv = useCallback(() => {
    const items = mapSelectedToCsvItemsWithKeyword(groupedNews, selectedIds);
    const blob = exportCsv(items);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-run-${runId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [groupedNews, selectedIds, runId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse" />
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm text-red-600 dark:text-red-400">
          {(error as Error)?.message ?? '데이터를 불러오지 못했습니다.'}
        </p>
        <div className="flex justify-center gap-2">
          <button onClick={() => refetch()} className="text-sm text-blue-600 hover:underline">재시도</button>
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:underline">홈으로</button>
        </div>
      </div>
    );
  }

  if (data?.status === 'running') {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 dark:text-gray-400">파이프라인 실행 중...</p>
        <p className="text-xs text-gray-400">자동으로 새로고침됩니다</p>
      </div>
    );
  }

  if (mode === 'preview') {
    return <NewsletterPreview groups={groupedNews} pipelineRunId={runId} onBack={() => setMode('select')} />;
  }

  const filteredCount = filteredGroups.reduce((sum, g) => sum + g.news.length, 0);
  const totalCount = data?.totalNews ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← 목록
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Run #{data?.id}
          </h1>
          <span className="text-xs text-gray-400">
            {data?.totalNews}건 수집 · {data?.totalSummaries}건 요약
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { setFilterCategory(null); setFilterKeyword(null); }}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              filterCategory === null
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            전체
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(filterCategory === c.id ? null : c.id)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                filterCategory === c.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {c.name}
            </button>
          ))}
          {(filterCategory !== null || filterKeyword !== null) && (
            <span className="text-xs text-gray-400 ml-1">
              {filteredCount}/{totalCount}건
            </span>
          )}
        </div>
        {keywords.length > 0 && filterCategory !== null && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterKeyword(null)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                filterKeyword === null
                  ? 'bg-gray-700 text-white border-gray-700 dark:bg-gray-300 dark:text-gray-900 dark:border-gray-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              전체 키워드
            </button>
            {keywords.map((kw) => (
              <button
                key={kw}
                onClick={() => setFilterKeyword(filterKeyword === kw ? null : kw)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  filterKeyword === kw
                    ? 'bg-gray-700 text-white border-gray-700 dark:bg-gray-300 dark:text-gray-900 dark:border-gray-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <RunNewsList groups={filteredGroups} onDeleteNews={handleDeleteNews} />
        </div>
        <div className="w-72 shrink-0 sticky top-4 self-start">
          <SelectionSidebar
            groups={groupedNews}
            onPreview={() => setMode('preview')}
            onExportCsv={handleExportCsv}
          />
        </div>
      </div>
    </div>
  );
}
