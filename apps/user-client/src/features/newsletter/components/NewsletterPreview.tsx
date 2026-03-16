import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateNewsletterHtml } from '../services/newsletterHtml';
import { mapSelectedToNewsletterItems } from '../services/mapSelectedNews';
import { useSelectionStore } from '../stores/selectionStore';
import { useSettingsStore } from '../../settings/stores/settingsStore';
import type { CategoryGroup } from '../hooks/useRunDetail';
import { NewsletterHeader } from './NewsletterHeader';
import { SendNewsletterForm } from './SendNewsletterForm';

interface NewsletterPreviewProps {
  groups: CategoryGroup[];
  pipelineRunId?: number;
  onBack: () => void;
}

export function NewsletterPreview({ groups, pipelineRunId, onBack }: NewsletterPreviewProps) {
  const { selectedIds, title, subtitle } = useSelectionStore();
  const { logoUrl, footerLogoUrl, headerBgColor, badgeColor, footerText, fontFamily } = useSettingsStore();

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
    () => generateNewsletterHtml(items, {
      title: debouncedTitle,
      subtitle: debouncedSubtitle,
      template: { logoUrl, footerLogoUrl, headerBgColor, badgeColor, footerText, fontFamily },
    }),
    [items, debouncedTitle, debouncedSubtitle, logoUrl, footerLogoUrl, headerBgColor, badgeColor, footerText, fontFamily],
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{items.length}건 선택됨</span>
          <Link
            to="/settings"
            className="text-sm px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            템플릿 설정
          </Link>
        </div>
      </div>

      <NewsletterHeader />

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white overflow-hidden">
        <iframe
          srcDoc={html}
          title="뉴스레터 미리보기"
          className="w-full border-0"
          style={{ height: '70vh' }}
        />
      </div>

      <SendNewsletterForm html={html} subject={title} pipelineRunId={pipelineRunId} />
    </div>
  );
}
