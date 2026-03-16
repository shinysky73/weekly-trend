import { useSelectionStore } from '../stores/selectionStore';

export function NewsletterHeader() {
  const { title, setTitle } = useSelectionStore();

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">이메일 제목</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-900 dark:text-white"
      />
    </div>
  );
}
