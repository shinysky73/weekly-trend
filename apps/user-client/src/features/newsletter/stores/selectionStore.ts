import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export function getDefaultTitle(date = new Date()): string {
  const month = date.getMonth() + 1;
  const weekOfMonth = Math.ceil(date.getDate() / 7);
  return `서비스기획센터 주간동향(${month}월 ${weekOfMonth}주차)`;
}

interface RunSelection {
  selectedIds: Set<number>;
  title: string;
}

interface SelectionState {
  selectedIds: Set<number>;
  title: string;
  currentRunId: number | null;
  runSelections: Record<number, RunSelection>;
  toggleItem: (id: number) => void;
  selectCategory: (ids: number[]) => void;
  deselectCategory: (ids: number[]) => void;
  removeItem: (id: number) => void;
  clearAll: () => void;
  setTitle: (title: string) => void;
  initForRun: (runId: number) => void;
}

function defaultRunSelection(): RunSelection {
  return { selectedIds: new Set(), title: getDefaultTitle() };
}

/** Save current selectedIds/title into runSelections under currentRunId */
function saveCurrentToMap(state: SelectionState): Record<number, RunSelection> {
  if (state.currentRunId === null) return state.runSelections;
  return {
    ...state.runSelections,
    [state.currentRunId]: { selectedIds: new Set(state.selectedIds), title: state.title },
  };
}

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set) => ({
      selectedIds: new Set(),
      title: getDefaultTitle(),
      currentRunId: null,
      runSelections: {},

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
      initForRun: (runId) =>
        set((state) => {
          if (state.currentRunId === runId) return {};
          const updatedMap = saveCurrentToMap(state);
          const restored = updatedMap[runId] ?? defaultRunSelection();
          return {
            runSelections: updatedMap,
            currentRunId: runId,
            selectedIds: new Set(restored.selectedIds),
            title: restored.title,
          };
        }),
    }),
    {
      name: 'newsletter-selection',
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          const s = parsed?.state;
          if (s?.selectedIds) {
            s.selectedIds = new Set(s.selectedIds);
          }
          if (s?.runSelections) {
            for (const key of Object.keys(s.runSelections)) {
              const entry = s.runSelections[key];
              if (entry?.selectedIds) {
                entry.selectedIds = new Set(entry.selectedIds);
              }
            }
          }
          return parsed;
        },
        setItem: (name, value) => {
          const s = value.state;
          const serializedRunSelections: Record<string, { selectedIds: number[]; title: string }> = {};
          for (const [key, entry] of Object.entries(s.runSelections as Record<string, RunSelection>)) {
            serializedRunSelections[key] = {
              selectedIds: [...entry.selectedIds],
              title: entry.title,
            };
          }
          const serializable = {
            ...value,
            state: {
              ...s,
              selectedIds: [...s.selectedIds],
              runSelections: serializedRunSelections,
            },
          };
          localStorage.setItem(name, JSON.stringify(serializable));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state) => ({
        selectedIds: state.selectedIds,
        title: state.title,
        currentRunId: state.currentRunId,
        runSelections: state.runSelections,
      }) as unknown as SelectionState,
    },
  ),
);
