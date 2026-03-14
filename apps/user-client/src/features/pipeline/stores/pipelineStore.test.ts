import { describe, it, expect, beforeEach } from 'vitest';
import { usePipelineStore } from './pipelineStore';

describe('pipelineStore', () => {
  beforeEach(() => {
    usePipelineStore.setState(usePipelineStore.getInitialState());
  });

  it('shouldHaveInitialState: 초기 상태 검증', () => {
    const state = usePipelineStore.getState();

    expect(state.runs).toEqual([]);
    expect(state.isRunning).toBe(false);
  });

  it('shouldSetRunning: 파이프라인 실행 상태 설정', () => {
    usePipelineStore.getState().setRunning(true);
    expect(usePipelineStore.getState().isRunning).toBe(true);

    usePipelineStore.getState().setRunning(false);
    expect(usePipelineStore.getState().isRunning).toBe(false);
  });

  it('shouldSetRuns: 파이프라인 실행 이력 목록 설정', () => {
    const mockRuns = [
      { id: 1, status: 'completed', totalNews: 10, totalSummaries: 5, errorLog: null, startedAt: '2026-03-14', completedAt: '2026-03-14' },
    ];

    usePipelineStore.getState().setRuns(mockRuns);

    expect(usePipelineStore.getState().runs).toEqual(mockRuns);
  });

  it('shouldAddRun: 새 실행 결과를 목록 앞에 추가', () => {
    const existingRun = { id: 1, status: 'completed', totalNews: 10, totalSummaries: 5, errorLog: null, startedAt: '2026-03-13', completedAt: '2026-03-13' };
    const newRun = { id: 2, status: 'running', totalNews: 0, totalSummaries: 0, errorLog: null, startedAt: '2026-03-14', completedAt: null };

    usePipelineStore.getState().setRuns([existingRun]);
    usePipelineStore.getState().addRun(newRun);

    const runs = usePipelineStore.getState().runs;
    expect(runs).toHaveLength(2);
    expect(runs[0]).toEqual(newRun);
    expect(runs[1]).toEqual(existingRun);
  });
});
