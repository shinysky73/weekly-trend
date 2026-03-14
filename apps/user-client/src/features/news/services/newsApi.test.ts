import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchNews } from './newsApi';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('newsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchNews', () => {
    it('shouldFetchNewsPaginated: GET /news에 page, limit, categoryId, startDate, endDate 쿼리 전달', async () => {
      const mockResponse = {
        data: { data: [], total: 0, page: 2, limit: 10 },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const params = {
        page: 2,
        limit: 10,
        categoryId: 3,
        startDate: '2026-03-01',
        endDate: '2026-03-14',
      };
      const result = await fetchNews(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/news', {
        params: {
          page: 2,
          limit: 10,
          categoryId: 3,
          startDate: '2026-03-01',
          endDate: '2026-03-14',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('shouldFetchNewsWithDefaultParams: 파라미터 없이 호출 시 기본값(page=1, limit=20)으로 요청', async () => {
      const mockResponse = {
        data: { data: [], total: 0, page: 1, limit: 20 },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await fetchNews({});

      expect(mockedAxios.get).toHaveBeenCalledWith('/news', {
        params: {
          page: 1,
          limit: 20,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });
});
