import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePipelineStore } from '../stores/pipelineStore';
import { fetchPipelineRuns } from '../services/pipelineApi';
import { formatDateTime } from '../../../lib/format';

const statusLabels: Record<string, { text: string; className: string }> = {
  completed: { text: '완료', className: 'text-green-600 dark:text-green-400' },
  running: { text: '실행 중', className: 'text-blue-600 dark:text-blue-400' },
  failed: { text: '실패', className: 'text-red-600 dark:text-red-400' },
};

export function PipelineHistory() {
  const { runs, setRuns } = usePipelineStore();
  const navigate = useNavigate();

  const loadRuns = useCallback(async () => {
    try {
      const data = await fetchPipelineRuns();
      setRuns(data);
    } catch {
      // silent
    }
  }, [setRuns]);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">실행 이력</h2>
      </div>
      {runs.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-gray-400">아직 실행 이력이 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">카테고리와 키워드를 설정한 후 파이프라인을 실행하세요</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">상태</th>
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">뉴스</th>
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">요약</th>
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">시작 시간</th>
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">완료 시간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {runs.map((run) => {
                const status = statusLabels[run.status] ?? { text: run.status, className: 'text-gray-600 dark:text-gray-400' };
                const isClickable = run.status === 'completed';
                return (
                  <tr
                    key={run.id}
                    onClick={isClickable ? () => navigate(`/runs/${run.id}`) : undefined}
                    className={isClickable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors' : 'opacity-60'}
                    title={run.status === 'failed' && run.errorLog ? run.errorLog : undefined}
                  >
                    <td className={`px-4 py-2 font-medium ${status.className}`}>
                      {status.text}
                      {run.status === 'failed' && run.errorLog && (
                        <span className="block text-xs font-normal text-red-400 mt-0.5 truncate max-w-48">
                          {run.errorLog}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{run.totalNews}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{run.totalSummaries}</td>
                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{formatDateTime(run.startedAt)}</td>
                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{run.completedAt ? formatDateTime(run.completedAt) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
