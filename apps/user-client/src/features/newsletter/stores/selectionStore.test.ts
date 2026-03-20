import { describe, it, expect, beforeEach } from 'vitest';
import { useSelectionStore, getDefaultTitle } from './selectionStore';

describe('selectionStore', () => {
  beforeEach(() => {
    useSelectionStore.setState(useSelectionStore.getInitialState());
  });

  it('shouldHaveInitialState: 초기 상태 검증', () => {
    const state = useSelectionStore.getState();
    expect(state.selectedIds.size).toBe(0);
    expect(state.title).toBe(getDefaultTitle());
  });

  it('shouldToggleNewsItem: toggleItem(id)으로 뉴스 선택/해제 토글', () => {
    useSelectionStore.getState().toggleItem(1);
    expect(useSelectionStore.getState().selectedIds.has(1)).toBe(true);

    useSelectionStore.getState().toggleItem(1);
    expect(useSelectionStore.getState().selectedIds.has(1)).toBe(false);
  });

  it('shouldSelectAllInCategory: selectCategory(newsIds)로 카테고리 전체 선택', () => {
    useSelectionStore.getState().selectCategory([1, 2, 3]);
    const ids = useSelectionStore.getState().selectedIds;
    expect(ids.has(1)).toBe(true);
    expect(ids.has(2)).toBe(true);
    expect(ids.has(3)).toBe(true);
  });

  it('shouldDeselectAllInCategory: deselectCategory(newsIds)로 카테고리 전체 해제', () => {
    useSelectionStore.getState().selectCategory([1, 2, 3, 4]);
    useSelectionStore.getState().deselectCategory([2, 3]);
    const ids = useSelectionStore.getState().selectedIds;
    expect(ids.has(1)).toBe(true);
    expect(ids.has(2)).toBe(false);
    expect(ids.has(3)).toBe(false);
    expect(ids.has(4)).toBe(true);
  });

  it('shouldRemoveItem: removeItem(id)로 사이드바에서 개별 제거', () => {
    useSelectionStore.getState().selectCategory([1, 2]);
    useSelectionStore.getState().removeItem(1);
    expect(useSelectionStore.getState().selectedIds.has(1)).toBe(false);
    expect(useSelectionStore.getState().selectedIds.has(2)).toBe(true);
  });

  it('shouldClearAll: clearAll()로 전체 선택 초기화', () => {
    useSelectionStore.getState().selectCategory([1, 2, 3]);
    useSelectionStore.getState().clearAll();
    expect(useSelectionStore.getState().selectedIds.size).toBe(0);
  });

  it('shouldSetTitle: setTitle(title)로 이메일 제목 설정', () => {
    useSelectionStore.getState().setTitle('새 제목');
    expect(useSelectionStore.getState().title).toBe('새 제목');
  });

  it('shouldReturnSelectedCount: 선택된 아이템 수 반환', () => {
    useSelectionStore.getState().selectCategory([1, 2, 3]);
    expect(useSelectionStore.getState().selectedIds.size).toBe(3);
  });

  it('shouldInitForRun_keepOnSameRunId: 같은 runId로 재진입 시 선택 유지', () => {
    useSelectionStore.getState().initForRun(1);
    useSelectionStore.getState().selectCategory([10, 20]);

    useSelectionStore.getState().initForRun(1);
    expect(useSelectionStore.getState().selectedIds.size).toBe(2);
  });

  it('shouldInitForRun_defaultOnNewRunId: 새 runId 진입 시 빈 선택으로 시작', () => {
    useSelectionStore.getState().initForRun(1);
    useSelectionStore.getState().selectCategory([10, 20]);

    useSelectionStore.getState().initForRun(2);
    expect(useSelectionStore.getState().selectedIds.size).toBe(0);
    expect(useSelectionStore.getState().currentRunId).toBe(2);
  });

  it('shouldInitForRun_restorePreviousRun: 이전 run으로 돌아가면 선택 복원', () => {
    useSelectionStore.getState().initForRun(1);
    useSelectionStore.getState().selectCategory([10, 20]);
    useSelectionStore.getState().setTitle('Run 1 제목');

    useSelectionStore.getState().initForRun(2);
    useSelectionStore.getState().selectCategory([30]);
    useSelectionStore.getState().setTitle('Run 2 제목');

    // run 1로 복귀
    useSelectionStore.getState().initForRun(1);
    expect(useSelectionStore.getState().selectedIds.size).toBe(2);
    expect(useSelectionStore.getState().selectedIds.has(10)).toBe(true);
    expect(useSelectionStore.getState().selectedIds.has(20)).toBe(true);
    expect(useSelectionStore.getState().title).toBe('Run 1 제목');

    // run 2로 복귀
    useSelectionStore.getState().initForRun(2);
    expect(useSelectionStore.getState().selectedIds.size).toBe(1);
    expect(useSelectionStore.getState().selectedIds.has(30)).toBe(true);
    expect(useSelectionStore.getState().title).toBe('Run 2 제목');
  });
});

describe('getDefaultTitle', () => {
  it('shouldFormatMonthAndWeek: 날짜에서 월과 주차를 추출하여 제목 생성', () => {
    expect(getDefaultTitle(new Date('2026-03-20'))).toBe('서비스기획센터 주간동향(3월 3주차)');
    expect(getDefaultTitle(new Date('2026-01-01'))).toBe('서비스기획센터 주간동향(1월 1주차)');
    expect(getDefaultTitle(new Date('2026-12-31'))).toBe('서비스기획센터 주간동향(12월 5주차)');
  });
});
