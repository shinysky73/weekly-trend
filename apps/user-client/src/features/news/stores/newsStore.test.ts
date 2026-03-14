import { describe, it, expect, beforeEach } from 'vitest';
import { useNewsStore } from './newsStore';

describe('newsStore', () => {
  beforeEach(() => {
    useNewsStore.setState(useNewsStore.getInitialState());
  });

  it('shouldHaveInitialState: 초기 상태 검증', () => {
    const state = useNewsStore.getState();

    expect(state.news).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.page).toBe(1);
    expect(state.loading).toBe(false);
  });

  it('shouldSetFilters: categoryId, startDate, endDate 필터 설정', () => {
    useNewsStore.getState().setFilters({
      categoryId: 3,
      startDate: '2026-03-01',
      endDate: '2026-03-14',
    });

    const state = useNewsStore.getState();
    expect(state.categoryId).toBe(3);
    expect(state.startDate).toBe('2026-03-01');
    expect(state.endDate).toBe('2026-03-14');
  });

  it('shouldResetPageWhenFiltersChange: 필터 변경 시 page를 1로 리셋', () => {
    useNewsStore.getState().setPage(5);
    useNewsStore.getState().setFilters({ categoryId: 2 });

    expect(useNewsStore.getState().page).toBe(1);
  });

  it('shouldResetFilters: 필터 초기화 시 모든 필터와 page를 리셋', () => {
    useNewsStore.getState().setFilters({
      categoryId: 3,
      startDate: '2026-03-01',
      endDate: '2026-03-14',
    });
    useNewsStore.getState().setPage(5);

    useNewsStore.getState().resetFilters();

    const state = useNewsStore.getState();
    expect(state.categoryId).toBeUndefined();
    expect(state.startDate).toBeUndefined();
    expect(state.endDate).toBeUndefined();
    expect(state.page).toBe(1);
  });

  it('shouldSetPage: 페이지 변경 시 상태 업데이트', () => {
    useNewsStore.getState().setPage(5);

    expect(useNewsStore.getState().page).toBe(5);
  });

  it('shouldSetLoading: 로딩 상태 토글', () => {
    useNewsStore.getState().setLoading(true);
    expect(useNewsStore.getState().loading).toBe(true);

    useNewsStore.getState().setLoading(false);
    expect(useNewsStore.getState().loading).toBe(false);
  });

  it('shouldSetNewsData: 뉴스 데이터 및 total 설정', () => {
    const mockNews = [
      { id: 1, title: 'Test News', link: 'http://example.com', snippet: null, content: null, publisher: 'Test', publishedDate: '2026-03-14', thumbnailUrl: null, keyword: 'AI', categoryId: 1, collectionType: 'google_cse', pipelineRunId: 1, createdAt: '2026-03-14' },
    ];

    useNewsStore.getState().setNewsData(mockNews, 100);

    const state = useNewsStore.getState();
    expect(state.news).toEqual(mockNews);
    expect(state.total).toBe(100);
  });
});
