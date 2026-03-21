import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchRunDetail } from '../services/newsletterApi';
import type { RunDetailNews } from '../services/newsletterApi';

export interface CategoryGroup {
  categoryId: number;
  categoryName: string;
  news: RunDetailNews[];
}

export function useRunDetail(runId: number) {
  const query = useQuery({
    queryKey: ['runDetail', runId],
    queryFn: () => fetchRunDetail(runId),
  });

  const groupedNews = useMemo<CategoryGroup[]>(() => {
    if (!query.data?.news) return [];

    const map = new Map<number, CategoryGroup>();
    for (const item of query.data.news) {
      const catId = item.categoryId ?? 0;
      const catName = item.category?.name ?? '미분류';
      const existing = map.get(catId);
      if (existing) {
        existing.news.push(item);
      } else {
        map.set(catId, {
          categoryId: catId,
          categoryName: catName,
          news: [item],
        });
      }
    }
    return Array.from(map.values());
  }, [query.data]);

  return { ...query, groupedNews };
}
