import { useSelectionStore } from '../stores/selectionStore';

export function NewsletterHeader() {
  const { title, subtitle, setTitle, setSubtitle } = useSelectionStore();

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">부제목</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="예: 2026년 3월 2주차 주간동향"
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
        />
      </div>
    </div>
  );
}
