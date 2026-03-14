import { describe, it, expect, beforeEach } from 'vitest';
import { usePipelineStore } from './pipelineStore';
import type { PipelineRun } from '../services/pipelineApi';

const makeRun = (overrides: Partial<PipelineRun> = {}): PipelineRun => ({
  id: 1,
  status: 'completed',
  totalNews: 10,
  totalSummaries: 5,
  processedKeywords: 2,
  totalKeywords: 2,
  currentKeyword: null,
  quotaExceeded: false,
  errorLog: null,
  startedAt: '2026-03-14',
  completedAt: '2026-03-14',
  ...overrides,
});

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
    const mockRuns = [makeRun()];

    usePipelineStore.getState().setRuns(mockRuns);

    expect(usePipelineStore.getState().runs).toEqual(mockRuns);
  });

  it('shouldAddRun: 새 실행 결과를 목록 앞에 추가', () => {
    const existingRun = makeRun({ id: 1, startedAt: '2026-03-13', completedAt: '2026-03-13' });
    const newRun = makeRun({ id: 2, status: 'running', totalNews: 0, totalSummaries: 0, completedAt: null });

    usePipelineStore.getState().setRuns([existingRun]);
    usePipelineStore.getState().addRun(newRun);

    const runs = usePipelineStore.getState().runs;
    expect(runs).toHaveLength(2);
    expect(runs[0]).toEqual(newRun);
    expect(runs[1]).toEqual(existingRun);
  });

  it('shouldStoreProgressFields: PipelineRun에 processedKeywords, totalKeywords, currentKeyword, quotaExceeded 포함', () => {
    const runWithProgress = makeRun({
      status: 'running',
      processedKeywords: 3,
      totalKeywords: 10,
      currentKeyword: 'AI/GPT',
      quotaExceeded: false,
    });

    usePipelineStore.getState().setRuns([runWithProgress]);

    const stored = usePipelineStore.getState().runs[0];
    expect(stored.processedKeywords).toBe(3);
    expect(stored.totalKeywords).toBe(10);
    expect(stored.currentKeyword).toBe('AI/GPT');
    expect(stored.quotaExceeded).toBe(false);
  });
});
