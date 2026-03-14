import { describe, it, expect, beforeEach } from 'vitest';
import { useCategoryStore } from './categoryStore';

describe('categoryStore', () => {
  beforeEach(() => {
    useCategoryStore.setState(useCategoryStore.getInitialState());
  });

  it('shouldHaveInitialState: 초기 상태 검증', () => {
    const state = useCategoryStore.getState();

    expect(state.categories).toEqual([]);
    expect(state.selectedId).toBeNull();
    expect(state.keywords).toEqual([]);
    expect(state.filterKeywords).toEqual([]);
  });

  it('shouldSetCategories: 카테고리 목록 설정', () => {
    const categories = [
      { id: 1, name: 'AI', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      { id: 2, name: 'Blockchain', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    ];

    useCategoryStore.getState().setCategories(categories);

    expect(useCategoryStore.getState().categories).toEqual(categories);
  });

  it('shouldSelectCategory: 카테고리 선택 시 selectedId 업데이트', () => {
    useCategoryStore.getState().selectCategory(3);

    expect(useCategoryStore.getState().selectedId).toBe(3);
  });

  it('shouldAddCategory: 새 카테고리를 목록에 추가', () => {
    const existing = { id: 1, name: 'AI', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    const newCat = { id: 2, name: 'Blockchain', createdAt: '2026-03-14', updatedAt: '2026-03-14' };

    useCategoryStore.getState().setCategories([existing]);
    useCategoryStore.getState().addCategory(newCat);

    expect(useCategoryStore.getState().categories).toEqual([existing, newCat]);
  });

  it('shouldUpdateCategory: 목록 내 카테고리 이름 업데이트', () => {
    const original = { id: 1, name: 'AI', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    const updated = { id: 1, name: 'AI Updated', createdAt: '2026-01-01', updatedAt: '2026-03-14' };

    useCategoryStore.getState().setCategories([original]);
    useCategoryStore.getState().updateCategory(updated);

    expect(useCategoryStore.getState().categories[0].name).toBe('AI Updated');
  });

  it('shouldRemoveCategory: 목록에서 카테고리 제거 + selectedId 초기화', () => {
    const cat1 = { id: 1, name: 'AI', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    const cat2 = { id: 2, name: 'Blockchain', createdAt: '2026-01-01', updatedAt: '2026-01-01' };

    useCategoryStore.getState().setCategories([cat1, cat2]);
    useCategoryStore.getState().selectCategory(1);
    useCategoryStore.getState().removeCategory(1);

    const state = useCategoryStore.getState();
    expect(state.categories).toEqual([cat2]);
    expect(state.selectedId).toBeNull();
  });

  it('shouldNotResetSelectedIdWhenRemovingUnselected: 선택되지 않은 카테고리 삭제 시 selectedId 유지', () => {
    const cat1 = { id: 1, name: 'AI', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    const cat2 = { id: 2, name: 'Blockchain', createdAt: '2026-01-01', updatedAt: '2026-01-01' };

    useCategoryStore.getState().setCategories([cat1, cat2]);
    useCategoryStore.getState().selectCategory(2);
    useCategoryStore.getState().removeCategory(1);

    const state = useCategoryStore.getState();
    expect(state.categories).toEqual([cat2]);
    expect(state.selectedId).toBe(2);
  });

  it('shouldSetKeywords: 키워드 목록 설정', () => {
    const keywords = [{ id: 1, text: 'GPT', categoryId: 3, createdAt: '2026-03-14' }];

    useCategoryStore.getState().setKeywords(keywords);

    expect(useCategoryStore.getState().keywords).toEqual(keywords);
  });

  it('shouldSetFilterKeywords: 제외 키워드 목록 설정', () => {
    const filterKeywords = [{ id: 1, text: '광고', categoryId: 3, createdAt: '2026-03-14' }];

    useCategoryStore.getState().setFilterKeywords(filterKeywords);

    expect(useCategoryStore.getState().filterKeywords).toEqual(filterKeywords);
  });
});
