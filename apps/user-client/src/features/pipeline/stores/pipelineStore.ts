import { create } from 'zustand';
import type { PipelineRun } from '../services/pipelineApi';

interface PipelineState {
  runs: PipelineRun[];
  isRunning: boolean;
  setRunning: (isRunning: boolean) => void;
  setRuns: (runs: PipelineRun[]) => void;
  addRun: (run: PipelineRun) => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  runs: [],
  isRunning: false,

  setRunning: (isRunning) => set({ isRunning }),
  setRuns: (runs) => set({ runs }),
  addRun: (run) => set((state) => ({ runs: [run, ...state.runs] })),
}));
