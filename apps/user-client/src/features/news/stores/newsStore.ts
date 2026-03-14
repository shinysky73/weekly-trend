import { create } from 'zustand';
import type { NewsItem } from '../services/newsApi';

interface NewsFilters {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

interface NewsState {
  news: NewsItem[];
  total: number;
  page: number;
  loading: boolean;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  setFilters: (filters: NewsFilters) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setNewsData: (news: NewsItem[], total: number) => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  news: [],
  total: 0,
  page: 1,
  loading: false,

  setFilters: (filters) => set({ ...filters, page: 1 }),
  resetFilters: () => set({ categoryId: undefined, startDate: undefined, endDate: undefined, page: 1 }),
  setPage: (page) => set({ page }),
  setLoading: (loading) => set({ loading }),
  setNewsData: (news, total) => set({ news, total }),
}));
