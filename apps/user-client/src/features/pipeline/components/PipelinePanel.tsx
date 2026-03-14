import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { usePipelineStore } from '../stores/pipelineStore';
import { startPipeline, fetchPipelineRuns } from '../services/pipelineApi';

export function PipelinePanel() {
  const { isRunning, setRunning, setRuns, runs } = usePipelineStore();
  const [startError, setStartError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  // Derive all display state from runs[0]
  const latest = runs[0] ?? null;
  const isLatestRunning = latest?.status === 'running';
  const progressPercent = latest && latest.totalKeywords > 0
    ? Math.round((latest.processedKeywords / latest.totalKeywords) * 100)
    : 0;

  // Poll while running
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
  }, [isRunning, setRunning, setRuns]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setStartError(null);
    setJustCompleted(false);
    try {
      await startPipeline();
    } catch (err: unknown) {
      setRunning(false);
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setStartError('파이프라인이 이미 실행 중입니다.');
      } else {
        setStartError('파이프라인 실행에 실패했습니다.');
      }
    }
  }, [setRunning]);

  const showProgress = isRunning && isLatestRunning && latest.totalKeywords > 0;
  const showSpinner = isRunning && (!isLatestRunning || latest.totalKeywords === 0);
  const showResult = justCompleted && latest?.status === 'completed';
  const showError = startError || (justCompleted && latest?.status === 'failed');
  const showNoKeywords = !isRunning && !justCompleted && latest?.status === 'completed' && latest.totalKeywords === 0 && latest.totalNews === 0;

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

      {showProgress && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              {latest.currentKeyword ?? '준비 중...'}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {latest.processedKeywords}/{latest.totalKeywords} ({progressPercent}%)
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

      {showSpinner && (
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>파이프라인 시작 중...</span>
        </div>
      )}

      {showError && (
        <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-line">
          {startError ?? latest?.errorLog ?? '파이프라인 실행에 실패했습니다.'}
          {latest?.quotaExceeded && '\nAPI 할당량 초과로 수집이 중단되었습니다.'}
        </p>
      )}

      {showResult && (
        <p className="text-sm text-green-600 dark:text-green-400">
          수집 {latest.totalNews}건 · 요약 {latest.totalSummaries}건 완료
        </p>
      )}

      {showNoKeywords && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          등록된 키워드가 없어 뉴스가 수집되지 않았습니다.{' '}
          <Link to="/categories" className="underline">카테고리 관리</Link>에서 키워드를 추가하세요.
        </p>
      )}
    </div>
  );
}
