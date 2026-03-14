import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRunDetail } from './useRunDetail';
import * as newsletterApi from '../services/newsletterApi';
import { createQueryWrapper } from '../../../test/queryWrapper';

vi.mock('../services/newsletterApi');

const mockNews = [
  { id: 1, title: 'Cloud News', categoryId: 1, category: { id: 1, name: 'Cloud' }, summary: { text: 'cloud summary' }, link: '', snippet: null, publisher: 'A', publishedDate: '2026-03-14', thumbnailUrl: null, keyword: 'AWS' },
  { id: 2, title: 'AI News', categoryId: 2, category: { id: 2, name: 'AI' }, summary: { text: 'ai summary' }, link: '', snippet: null, publisher: 'B', publishedDate: '2026-03-14', thumbnailUrl: null, keyword: 'GPT' },
  { id: 3, title: 'Cloud News 2', categoryId: 1, category: { id: 1, name: 'Cloud' }, summary: null, link: '', snippet: 'snippet', publisher: 'C', publishedDate: '2026-03-14', thumbnailUrl: null, keyword: 'Azure' },
];

const mockRunDetail = {
  id: 1,
  status: 'completed',
  totalNews: 3,
  totalSummaries: 2,
  startedAt: '2026-03-14',
  completedAt: '2026-03-14',
  news: mockNews,
};

describe('useRunDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shouldFetchRunDetailOnMount: useRunDetail(runId) 마운트 시 API 호출하여 data 반환', async () => {
    vi.mocked(newsletterApi.fetchRunDetail).mockResolvedValue(mockRunDetail);

    const { result } = renderHook(() => useRunDetail(1), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRunDetail);
    expect(newsletterApi.fetchRunDetail).toHaveBeenCalledWith(1);
  });

  it('shouldReturnLoadingState: 초기 로딩 시 isLoading=true 반환', () => {
    vi.mocked(newsletterApi.fetchRunDetail).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useRunDetail(1), { wrapper: createQueryWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('shouldReturnErrorOnFailure: API 실패 시 isError=true, error 객체 반환', async () => {
    vi.mocked(newsletterApi.fetchRunDetail).mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useRunDetail(1), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });

  it('shouldGroupNewsByCategory: data.news를 categoryId별로 그룹화한 groupedNews 반환', async () => {
    vi.mocked(newsletterApi.fetchRunDetail).mockResolvedValue(mockRunDetail);

    const { result } = renderHook(() => useRunDetail(1), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const grouped = result.current.groupedNews;
    expect(grouped).toHaveLength(2);

    const cloudGroup = grouped.find((g) => g.categoryName === 'Cloud');
    expect(cloudGroup).toBeTruthy();
    expect(cloudGroup!.news).toHaveLength(2);

    const aiGroup = grouped.find((g) => g.categoryName === 'AI');
    expect(aiGroup).toBeTruthy();
    expect(aiGroup!.news).toHaveLength(1);
  });
});
