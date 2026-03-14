import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchRunDetail, exportCsv } from './newsletterApi';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('newsletterApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchRunDetail', () => {
    it('shouldFetchRunDetail: GET /pipeline/runs/:id 요청하여 run + news(summary, category 포함) 반환', async () => {
      const mockRun = {
        id: 1,
        status: 'completed',
        news: [
          { id: 1, title: 'News 1', summary: { text: 'summary' }, category: { id: 1, name: 'Cloud' } },
        ],
      };
      mockedAxios.get.mockResolvedValue({ data: mockRun });

      const result = await fetchRunDetail(1);

      expect(mockedAxios.get).toHaveBeenCalledWith('/pipeline/runs/1');
      expect(result).toEqual(mockRun);
    });
  });

  describe('exportCsv', () => {
    it('shouldExportCsv: 선택된 뉴스를 UTF-8 BOM CSV Blob으로 생성', () => {
      const items = [
        {
          categoryName: 'Cloud',
          keyword: 'AWS',
          title: 'Test Title',
          link: 'https://example.com',
          summaryText: 'Test summary',
          publisher: 'TechNews',
          publishedDate: '2026-03-14',
        },
      ];

      const blob = exportCsv(items);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv;charset=utf-8;');
    });
  });
});
