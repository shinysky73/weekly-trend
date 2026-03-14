import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  fetchKeywords,
  createKeyword,
  deleteKeyword,
  fetchFilterKeywords,
  createFilterKeyword,
  deleteFilterKeyword,
} from './keywordApi';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('keywordApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shouldFetchKeywords: GET /categories/:id/keywords 요청', async () => {
    const mockKeywords = [{ id: 1, text: 'GPT', categoryId: 3, createdAt: '2026-03-14' }];
    mockedAxios.get.mockResolvedValue({ data: mockKeywords });

    const result = await fetchKeywords(3);

    expect(mockedAxios.get).toHaveBeenCalledWith('/categories/3/keywords');
    expect(result).toEqual(mockKeywords);
  });

  it('shouldCreateKeyword: POST /categories/:id/keywords 요청', async () => {
    const mockKeyword = { id: 2, text: 'LLM', categoryId: 3, createdAt: '2026-03-14' };
    mockedAxios.post.mockResolvedValue({ data: mockKeyword });

    const result = await createKeyword(3, 'LLM');

    expect(mockedAxios.post).toHaveBeenCalledWith('/categories/3/keywords', { text: 'LLM' });
    expect(result).toEqual(mockKeyword);
  });

  it('shouldDeleteKeyword: DELETE /keywords/:id 요청', async () => {
    mockedAxios.delete.mockResolvedValue({ status: 204 });

    await deleteKeyword(5);

    expect(mockedAxios.delete).toHaveBeenCalledWith('/keywords/5');
  });

  it('shouldFetchFilterKeywords: GET /categories/:id/filter-keywords 요청', async () => {
    const mockFilterKeywords = [{ id: 1, text: '광고', categoryId: 3, createdAt: '2026-03-14' }];
    mockedAxios.get.mockResolvedValue({ data: mockFilterKeywords });

    const result = await fetchFilterKeywords(3);

    expect(mockedAxios.get).toHaveBeenCalledWith('/categories/3/filter-keywords');
    expect(result).toEqual(mockFilterKeywords);
  });

  it('shouldCreateFilterKeyword: POST /categories/:id/filter-keywords 요청', async () => {
    const mockFilterKeyword = { id: 2, text: '스팸', categoryId: 3, createdAt: '2026-03-14' };
    mockedAxios.post.mockResolvedValue({ data: mockFilterKeyword });

    const result = await createFilterKeyword(3, '스팸');

    expect(mockedAxios.post).toHaveBeenCalledWith('/categories/3/filter-keywords', { text: '스팸' });
    expect(result).toEqual(mockFilterKeyword);
  });

  it('shouldDeleteFilterKeyword: DELETE /filter-keywords/:id 요청', async () => {
    mockedAxios.delete.mockResolvedValue({ status: 204 });

    await deleteFilterKeyword(7);

    expect(mockedAxios.delete).toHaveBeenCalledWith('/filter-keywords/7');
  });
});
