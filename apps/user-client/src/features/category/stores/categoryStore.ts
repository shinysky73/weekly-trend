import { create } from 'zustand';
import type { Category } from '../services/categoryApi';
import type { Keyword, FilterKeyword } from '../services/keywordApi';

interface CategoryState {
  categories: Category[];
  selectedId: number | null;
  loading: boolean;
  keywords: Keyword[];
  filterKeywords: FilterKeyword[];
  setCategories: (categories: Category[]) => void;
  selectCategory: (id: number | null) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  removeCategory: (id: number) => void;
  setKeywords: (keywords: Keyword[]) => void;
  setFilterKeywords: (filterKeywords: FilterKeyword[]) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  selectedId: null,
  loading: false,
  keywords: [],
  filterKeywords: [],

  setCategories: (categories) => set({ categories }),
  selectCategory: (id) => set({ selectedId: id }),
  addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (category) =>
    set((state) => ({
      categories: state.categories.map((c) => (c.id === category.id ? category : c)),
    })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),
  setKeywords: (keywords) => set({ keywords }),
  setFilterKeywords: (filterKeywords) => set({ filterKeywords }),
}));
