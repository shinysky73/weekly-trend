import { useMemo, useState, useEffect } from 'react';
import { generateNewsletterHtml } from '../services/newsletterHtml';
import { mapSelectedToNewsletterItems } from '../services/mapSelectedNews';
import { useSelectionStore } from '../stores/selectionStore';
import type { CategoryGroup } from '../hooks/useRunDetail';
import { NewsletterHeader } from './NewsletterHeader';

interface NewsletterPreviewProps {
  groups: CategoryGroup[];
  onBack: () => void;
}

export function NewsletterPreview({ groups, onBack }: NewsletterPreviewProps) {
  const { selectedIds, title, subtitle } = useSelectionStore();

  const items = useMemo(
    () => mapSelectedToNewsletterItems(groups, selectedIds),
    [groups, selectedIds],
  );

  // Debounce title/subtitle for iframe re-rendering
  const [debouncedTitle, setDebouncedTitle] = useState(title);
  const [debouncedSubtitle, setDebouncedSubtitle] = useState(subtitle);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(title);
      setDebouncedSubtitle(subtitle);
    }, 300);
    return () => clearTimeout(timer);
  }, [title, subtitle]);

  const html = useMemo(
    () => generateNewsletterHtml(items, { title: debouncedTitle, subtitle: debouncedSubtitle }),
    [items, debouncedTitle, debouncedSubtitle],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← 선택으로 돌아가기
        </button>
        <span className="text-xs text-gray-400">{items.length}건 선택됨</span>
      </div>

      <NewsletterHeader />

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white overflow-hidden">
        <iframe
          srcDoc={html}
          title="뉴스레터 미리보기"
          className="w-full border-0"
          style={{ height: '80vh' }}
        />
      </div>
    </div>
  );
}
