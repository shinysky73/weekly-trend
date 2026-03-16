import { create } from 'zustand';
import type { PipelineRun } from '../services/pipelineApi';

interface PipelineState {
  runs: PipelineRun[];
  isRunning: boolean;
  startError: string | null;
  justCompleted: boolean;
  setRunning: (isRunning: boolean) => void;
  setStartError: (error: string | null) => void;
  setJustCompleted: (v: boolean) => void;
  setRuns: (runs: PipelineRun[]) => void;
  addRun: (run: PipelineRun) => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  runs: [],
  isRunning: false,
  startError: null,
  justCompleted: false,

  setRunning: (isRunning) => set({ isRunning }),
  setStartError: (startError) => set({ startError }),
  setJustCompleted: (justCompleted) => set({ justCompleted }),
  setRuns: (runs) => set({ runs }),
  addRun: (run) => set((state) => ({ runs: [run, ...state.runs] })),
}));
