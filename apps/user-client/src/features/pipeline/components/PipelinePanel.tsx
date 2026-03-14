import { useCallback, useState } from 'react';
import axios from 'axios';
import { usePipelineStore } from '../stores/pipelineStore';
import { startPipeline, fetchPipelineRuns } from '../services/pipelineApi';

interface PipelinePanelProps {
  onComplete?: () => void;
}

export function PipelinePanel({ onComplete }: PipelinePanelProps) {
  const { isRunning, setRunning, setRuns } = usePipelineStore();
  const [result, setResult] = useState<{ totalNews: number; totalSummaries: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      await startPipeline();
      const runs = await fetchPipelineRuns();
      setRuns(runs);
      if (runs.length > 0) {
        const latest = runs[0];
        setResult({ totalNews: latest.totalNews, totalSummaries: latest.totalSummaries });
      }
      onComplete?.();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError('파이프라인이 이미 실행 중입니다.');
      } else {
        setError('파이프라인 실행에 실패했습니다.');
      }
    } finally {
      setRunning(false);
    }
  }, [setRunning, setRuns, onComplete]);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
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
