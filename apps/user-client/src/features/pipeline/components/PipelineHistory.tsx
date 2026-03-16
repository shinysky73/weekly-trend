import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePipelineStore } from '../stores/pipelineStore';
import { fetchPipelineRuns, deletePipelineRun } from '../services/pipelineApi';
import { formatDateTime } from '../../../lib/format';

const statusConfig: Record<string, { text: string; dotColor: string; bgColor: string; textColor: string }> = {
  completed: { text: '완료', dotColor: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  running: { text: '실행 중', dotColor: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  failed: { text: '실패', dotColor: 'bg-red-500', bgColor: 'bg-red-700', textColor: 'text-red-700' },
};

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return '-';
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainSec = seconds % 60;
  return minutes > 0 ? `${minutes}분 ${remainSec}초` : `${remainSec}초`;
}

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
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">실행 이력</h2>
        {total > 0 && <span className="text-xs text-gray-400">총 {total}건</span>}
      </div>

      {deleteTarget !== null && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            Run #{deleteTarget}을 삭제하시겠습니까? 수집된 뉴스와 요약도 함께 삭제됩니다.
          </p>
          <div className="flex gap-2 mt-2">
            <button onClick={handleDelete} disabled={deleting} className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
              {deleting ? '삭제 중...' : '삭제'}
            </button>
            <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              취소
            </button>
          </div>
        </div>
      )}

      {runs.length === 0 && total === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center">
          <p className="text-sm text-gray-400">아직 실행 이력이 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">카테고리와 키워드를 설정한 후 파이프라인을 실행하세요</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500">
                  <th className="text-left font-medium px-4 py-3">실행</th>
                  <th className="text-left font-medium px-4 py-3">상태</th>
                  <th className="text-right font-medium px-4 py-3">뉴스</th>
                  <th className="text-right font-medium px-4 py-3">요약</th>
                  <th className="text-left font-medium px-4 py-3">시작</th>
                  <th className="text-left font-medium px-4 py-3">소요</th>
                  <th className="text-right font-medium px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {runs.map((run) => {
                  const status = statusConfig[run.status] ?? { text: run.status, dotColor: 'bg-gray-400', bgColor: 'bg-gray-50', textColor: 'text-gray-600' };
                  const isQuotaExceeded = run.quotaExceeded && run.status === 'completed';
                  const isClickable = run.status === 'completed';

                  return (
                    <tr
                      key={run.id}
                      onClick={isClickable ? () => navigate(`/runs/${run.id}`) : undefined}
                      className={isClickable ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">#{run.id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                          {status.text}
                        </span>
                        {isQuotaExceeded && (
                          <span className="ml-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            할당량 초과
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{run.totalNews}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{run.totalSummaries}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(run.startedAt)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDuration(run.startedAt, run.completedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {isClickable && (
                            <span className="text-xs text-blue-600 hover:underline">상세 →</span>
                          )}
                          {run.status !== 'running' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(run.id); }}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total}건
              </span>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  이전
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
