import type { CategoryGroup } from '../hooks/useRunDetail';
import { useSelectionStore } from '../stores/selectionStore';

interface SelectionSidebarProps {
  groups: CategoryGroup[];
  onPreview: () => void;
  onExportCsv: () => void;
}

export function SelectionSidebar({ groups, onPreview, onExportCsv }: SelectionSidebarProps) {
  const { selectedIds, removeItem, clearAll } = useSelectionStore();

  const selectedNews = groups.flatMap((g) =>
    g.news.filter((n) => selectedIds.has(n.id)).map((n) => ({
      ...n,
      categoryName: g.categoryName,
    })),
  );

  const groupedSelected = new Map<string, typeof selectedNews>();
  for (const item of selectedNews) {
    const list = groupedSelected.get(item.categoryName) ?? [];
    list.push(item);
    groupedSelected.set(item.categoryName, list);
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          선택된 기사 ({selectedIds.size})
        </h3>
        {selectedIds.size > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            전체 해제
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {selectedIds.size === 0 ? (
          <p className="text-center text-xs text-gray-400 py-8">뉴스를 선택해주세요</p>
        ) : (
          Array.from(groupedSelected.entries()).map(([categoryName, items]) => (
            <div key={categoryName}>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{categoryName}</p>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-1 text-xs text-gray-700 dark:text-gray-300">
                    <span className="line-clamp-1 flex-1">{item.title}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 shrink-0"
                      aria-label="제거"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <button
          onClick={onPreview}
          disabled={selectedIds.size === 0}
          className="w-full rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          미리보기
        </button>
        <button
          onClick={onExportCsv}
          disabled={selectedIds.size === 0}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          CSV 내보내기
        </button>
      </div>
    </div>
  );
}
