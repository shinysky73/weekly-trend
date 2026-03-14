import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePipelineStore } from '../stores/pipelineStore';
import { fetchPipelineRuns, deletePipelineRun } from '../services/pipelineApi';
import { formatDateTime } from '../../../lib/format';

const statusLabels: Record<string, { text: string; className: string }> = {
  completed: { text: '완료', className: 'text-green-600 dark:text-green-400' },
  running: { text: '실행 중', className: 'text-blue-600 dark:text-blue-400' },
  failed: { text: '실패', className: 'text-red-600 dark:text-red-400' },
};

const PAGE_SIZE = 10;

export function PipelineHistory() {
  const { runs, setRuns } = usePipelineStore();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRuns = useCallback(async (p: number) => {
    try {
      const res = await fetchPipelineRuns(p, PAGE_SIZE);
      setRuns(res.data);
      setTotal(res.total);
    } catch {
      // silent
    }
  }, [setRuns]);

  useEffect(() => {
    loadRuns(page);
  }, [loadRuns, page]);

  const handleDelete = useCallback(async () => {
    if (deleteTarget === null) return;
    setDeleting(true);
    try {
      await deletePipelineRun(deleteTarget);
      await loadRuns(page);
      setDeleteTarget(null);
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, loadRuns, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          실행 이력
          {total > 0 && <span className="text-gray-400 font-normal ml-1">({total})</span>}
        </h2>
      </div>

      {deleteTarget !== null && (
        <div className="mx-4 mt-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400">
            Run #{deleteTarget}을 삭제하시겠습니까? 수집된 뉴스와 요약도 함께 삭제됩니다.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {runs.length === 0 && total === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-gray-400">아직 실행 이력이 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">카테고리와 키워드를 설정한 후 파이프라인을 실행하세요</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">상태</th>
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">뉴스</th>
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">요약</th>
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">시작 시간</th>
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">완료 시간</th>
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-16"></th>
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
                      className={isClickable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors' : ''}
                      title={run.status === 'failed' && run.errorLog ? run.errorLog : undefined}
                    >
                      <td className={`px-4 py-2.5 font-medium ${status.className}`}>
                        {status.text}
                        {run.status === 'failed' && run.errorLog && (
                          <span className="block text-xs font-normal text-red-400 mt-0.5 truncate max-w-48">
                            {run.errorLog}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{run.totalNews}</td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{run.totalSummaries}</td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs">{formatDateTime(run.startedAt)}</td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs">{run.completedAt ? formatDateTime(run.completedAt) : '-'}</td>
                      <td className="px-4 py-2.5 text-right">
                        {run.status !== 'running' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(run.id); }}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="삭제"
                          >
                            삭제
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-400">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total}건
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2.5 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2.5 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
