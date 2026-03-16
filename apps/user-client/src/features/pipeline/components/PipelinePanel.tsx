import { useCallback, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { usePipelineStore } from '../stores/pipelineStore';
import { startPipeline, fetchPipelineRuns } from '../services/pipelineApi';

/** Polling hook — shared via Zustand store so Button and Status see the same state */
function usePipelinePolling() {
  const { isRunning, setRunning, setRuns, setStartError, setJustCompleted } = usePipelineStore();

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetchPipelineRuns(1, 1);
        setRuns(res.data);
        const top = res.data[0];
        if (top && top.status !== 'running') {
          setRunning(false);
          setJustCompleted(true);
        }
      } catch {
        // silent
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isRunning, setRunning, setRuns, setJustCompleted]);
}

export function PipelineRunButton() {
  const { isRunning, setRunning, setStartError, setJustCompleted } = usePipelineStore();

  usePipelinePolling();

  const handleRun = useCallback(async () => {
    setRunning(true);
    setStartError(null);
    setJustCompleted(false);
    try {
      await startPipeline();
    } catch (err: unknown) {
      setRunning(false);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setStartError(err.response.data.message);
      } else {
        setStartError('파이프라인 실행에 실패했습니다.');
      }
    }
  }, [setRunning, setStartError, setJustCompleted]);

  return (
    <button
      onClick={handleRun}
      disabled={isRunning}
      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 shrink-0"
    >
      {isRunning ? (
        <>
          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          실행 중...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          파이프라인 실행
        </>
      )}
    </button>
  );
}

export function PipelineStatus() {
  const { runs, isRunning, startError, justCompleted } = usePipelineStore();

  const latest = runs[0] ?? null;
  const isLatestRunning = latest?.status === 'running';
  const progressPercent = latest && latest.totalKeywords > 0
    ? Math.round((latest.processedKeywords / latest.totalKeywords) * 100)
    : 0;

  const showProgress = isRunning && isLatestRunning && latest!.totalKeywords > 0;
  const showSpinner = isRunning && (!isLatestRunning || latest?.totalKeywords === 0);
  const showResult = justCompleted && latest?.status === 'completed';
  const showError = !!(startError || (justCompleted && latest?.status === 'failed'));

  if (!showProgress && !showSpinner && !showResult && !showError) {
    return null;
  }

  return (
    <>
      {(showProgress || showSpinner) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <h2 className="text-sm font-semibold text-gray-900">파이프라인 실행 중</h2>
            </div>
            <span className="text-xs text-gray-400">Run #{latest?.id}</span>
          </div>
          {showProgress && latest ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{latest.currentKeyword ?? '준비 중...'}</span>
                <span>{latest.processedKeywords}/{latest.totalKeywords} ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-xs text-gray-400">수집: {latest.totalNews}건</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>파이프라인 시작 중...</span>
            </div>
          )}
        </div>
      )}

      {showResult && latest && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          <p className="text-sm text-green-600">수집 {latest.totalNews}건 · 요약 {latest.totalSummaries}건 완료</p>
        </div>
      )}

      {showError && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full" />
          <p className="text-sm text-red-600">
            {startError ?? latest?.errorLog ?? '파이프라인 실행에 실패했습니다.'}
            {latest?.quotaExceeded && ' · API 할당량 초과'}
          </p>
        </div>
      )}
    </>
  );
}

// Keep backward compat export
export const PipelinePanel = PipelineRunButton;
