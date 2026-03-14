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
      const existing = map.get(item.categoryId);
      if (existing) {
        existing.news.push(item);
      } else {
        map.set(item.categoryId, {
          categoryId: item.categoryId,
          categoryName: item.category.name,
          news: [item],
        });
      }
    }
    return Array.from(map.values());
  }, [query.data]);

  return { ...query, groupedNews };
}
