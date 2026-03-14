import type { CategoryGroup } from '../hooks/useRunDetail';
import { useSelectionStore } from '../stores/selectionStore';
import { RunNewsCard } from './RunNewsCard';
import { CATEGORY_BADGE_COLOR } from '../../../lib/constants';

interface RunNewsListProps {
  groups: CategoryGroup[];
  onDeleteNews?: (id: number) => void;
}

export function RunNewsList({ groups, onDeleteNews }: RunNewsListProps) {
  const { selectedIds, toggleItem, selectCategory, deselectCategory } = useSelectionStore();

  if (groups.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        수집된 뉴스가 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const newsIds = group.news.map((n) => n.id);
        const selectedCount = newsIds.filter((id) => selectedIds.has(id)).length;
        const allSelected = selectedCount === newsIds.length;

        return (
          <div key={group.categoryId}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: CATEGORY_BADGE_COLOR }}>
                  {group.categoryName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({selectedCount}/{newsIds.length})
                </span>
              </div>
              <button
                onClick={() => allSelected ? deselectCategory(newsIds) : selectCategory(newsIds)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {allSelected ? '전체 해제' : '전체 선택'}
              </button>
            </div>
            <div className="space-y-2">
              {group.news.map((news) => (
                <RunNewsCard
                  key={news.id}
                  news={news}
                  selected={selectedIds.has(news.id)}
                  onToggle={toggleItem}
                  onDelete={onDeleteNews}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
