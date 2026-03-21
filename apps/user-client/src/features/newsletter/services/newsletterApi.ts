import axios from 'axios';

export interface RunDetailNews {
  id: number;
  title: string;
  link: string;
  snippet: string | null;
  publisher: string | null;
  publishedDate: string | null;
  thumbnailUrl: string | null;
  keyword: string;
  categoryId: number | null;
  category: { id: number; name: string } | null;
  summary: { text: string } | null;
}

export interface RunDetail {
  id: number;
  status: string;
  totalNews: number;
  totalSummaries: number;
  startedAt: string;
  completedAt: string | null;
  news: RunDetailNews[];
}

export async function fetchRunDetail(id: number): Promise<RunDetail> {
  const response = await axios.get<RunDetail>(`/pipeline/runs/${id}`);
  return response.data;
}

export interface CsvItem {
  categoryName: string;
  keyword: string;
  title: string;
  link: string;
  summaryText: string;
  publisher: string;
  publishedDate: string;
}

export function exportCsv(items: CsvItem[]): Blob {
  const BOM = '\uFEFF';
  const header = '카테고리,키워드,제목,링크,요약,출처,발행일';
  const rows = items.map((item) =>
    [item.categoryName, item.keyword, item.title, item.link, item.summaryText, item.publisher, item.publishedDate]
      .map((v) => `"${(v ?? '').replace(/"/g, '""')}"`)
      .join(','),
  );
  const csv = BOM + [header, ...rows].join('\n');
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}
