import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { usePipelineStore } from '../stores/pipelineStore';
import { startPipeline, fetchPipelineRuns } from '../services/pipelineApi';

export function PipelinePanel() {
  const { isRunning, setRunning, setRuns } = usePipelineStore();
  const [result, setResult] = useState<{ totalNews: number; totalSummaries: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for completion while running
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(async () => {
      try {
        const runs = await fetchPipelineRuns();
        setRuns(runs);
        const latest = runs[0];
        if (latest && latest.status !== 'running') {
          setRunning(false);
          if (latest.status === 'completed') {
            setResult({ totalNews: latest.totalNews, totalSummaries: latest.totalSummaries });
          } else if (latest.status === 'failed') {
            setError(latest.errorLog ?? '파이프라인 실행에 실패했습니다.');
          }
        }
      } catch {
        // silent — will retry next interval
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isRunning, setRunning, setRuns]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      await startPipeline();
    } catch (err: unknown) {
      setRunning(false);
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError('파이프라인이 이미 실행 중입니다.');
      } else {
        setError('파이프라인 실행에 실패했습니다.');
      }
    }
  }, [setRunning]);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">파이프라인</h2>
          {isRunning && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-blue-600 dark:text-blue-400">실행 중...</span>
            </div>
          )}
        </div>
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-1.5 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? '실행 중...' : '파이프라인 실행'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {result && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          수집 {result.totalNews}건 · 요약 {result.totalSummaries}건 완료
        </p>
      )}
    </div>
  );
}
