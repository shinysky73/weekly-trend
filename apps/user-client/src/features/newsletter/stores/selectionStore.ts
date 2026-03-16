import { create } from 'zustand';

interface SelectionState {
  selectedIds: Set<number>;
  title: string;
  toggleItem: (id: number) => void;
  selectCategory: (ids: number[]) => void;
  deselectCategory: (ids: number[]) => void;
  removeItem: (id: number) => void;
  clearAll: () => void;
  setTitle: (title: string) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedIds: new Set(),
  title: '서비스기획센터 주간동향',

  toggleItem: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),

  selectCategory: (ids) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      ids.forEach((id) => next.add(id));
      return { selectedIds: next };
    }),

  deselectCategory: (ids) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      ids.forEach((id) => next.delete(id));
      return { selectedIds: next };
    }),

  removeItem: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      next.delete(id);
      return { selectedIds: next };
    }),

  clearAll: () => set({ selectedIds: new Set() }),
  setTitle: (title) => set({ title }),
}));
