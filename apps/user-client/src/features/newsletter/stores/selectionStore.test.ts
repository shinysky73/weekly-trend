import { describe, it, expect, beforeEach } from 'vitest';
import { useSelectionStore } from './selectionStore';

describe('selectionStore', () => {
  beforeEach(() => {
    useSelectionStore.setState(useSelectionStore.getInitialState());
  });

  it('shouldHaveInitialState: 초기 상태 검증', () => {
    const state = useSelectionStore.getState();
    expect(state.selectedIds.size).toBe(0);
    expect(state.title).toBe('주간동향');
    expect(state.subtitle).toBe('');
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

  it('shouldSetTitle: setTitle(title)로 뉴스레터 제목 설정', () => {
    useSelectionStore.getState().setTitle('새 제목');
    expect(useSelectionStore.getState().title).toBe('새 제목');
  });

  it('shouldSetSubtitle: setSubtitle(subtitle)로 뉴스레터 부제목 설정', () => {
    useSelectionStore.getState().setSubtitle('부제목 테스트');
    expect(useSelectionStore.getState().subtitle).toBe('부제목 테스트');
  });

  it('shouldReturnSelectedCount: 선택된 아이템 수 반환', () => {
    useSelectionStore.getState().selectCategory([1, 2, 3]);
    expect(useSelectionStore.getState().selectedIds.size).toBe(3);
  });
});
