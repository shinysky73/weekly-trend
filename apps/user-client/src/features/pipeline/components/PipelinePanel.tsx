import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { usePipelineStore } from '../stores/pipelineStore';
import { startPipeline, fetchPipelineRuns } from '../services/pipelineApi';
import type { PipelineRun } from '../services/pipelineApi';

export function PipelinePanel() {
  const { isRunning, setRunning, setRuns, runs } = usePipelineStore();
  const [result, setResult] = useState<{ totalNews: number; totalSummaries: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<PipelineRun | null>(null);

  // Poll for progress while running
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(async () => {
      try {
        const latestRuns = await fetchPipelineRuns();
        setRuns(latestRuns);
        const latest = latestRuns[0];
        if (!latest) return;

        if (latest.status === 'running') {
          setProgress(latest);
        } else {
          setRunning(false);
          setProgress(null);
          if (latest.status === 'completed') {
            setResult({ totalNews: latest.totalNews, totalSummaries: latest.totalSummaries });
          } else if (latest.status === 'failed') {
            setError(latest.errorLog ?? '파이프라인 실행에 실패했습니다.');
            if (latest.quotaExceeded) {
              setError((prev) => (prev ?? '') + '\nAPI 할당량 초과로 수집이 중단되었습니다.');
            }
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
    setProgress(null);
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

  // Check if any keywords exist (from last completed run or current)
  const hasNoKeywordsWarning = !isRunning && runs.length > 0 && runs[0].status === 'completed' && runs[0].totalKeywords === 0 && runs[0].totalNews === 0;

  const progressPercent = progress && progress.totalKeywords > 0
    ? Math.round((progress.processedKeywords / progress.totalKeywords) * 100)
    : 0;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">파이프라인</h2>
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-1.5 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? '실행 중...' : '파이프라인 실행'}
        </button>
      </div>

      {/* Progress bar */}
      {isRunning && progress && progress.totalKeywords > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              {progress.currentKeyword ?? '준비 중...'}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {progress.processedKeywords}/{progress.totalKeywords} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {isRunning && (!progress || progress.totalKeywords === 0) && (
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>파이프라인 시작 중...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-line">{error}</p>
      )}

      {result && (
        <p className="text-sm text-green-600 dark:text-green-400">
          수집 {result.totalNews}건 · 요약 {result.totalSummaries}건 완료
        </p>
      )}

      {hasNoKeywordsWarning && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          등록된 키워드가 없어 뉴스가 수집되지 않았습니다.{' '}
          <Link to="/categories" className="underline">카테고리 관리</Link>에서 키워드를 추가하세요.
        </p>
      )}
    </div>
  );
}
