import { useCategoryStore } from '../stores/categoryStore';
import type { Category } from '../services/categoryApi';

interface CategoryListProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryList({ onEdit, onDelete }: CategoryListProps) {
  const { categories, selectedId, selectCategory } = useCategoryStore();

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">카테고리를 추가해주세요</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {categories.map((cat) => (
        <li
          key={cat.id}
          className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors ${
            selectedId === cat.id
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
          onClick={() => selectCategory(cat.id)}
        >
          <span className="text-sm text-gray-900 dark:text-gray-100">{cat.name}</span>
          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(cat); }}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              수정
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(cat); }}
              className="px-2 py-1 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              삭제
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
