import { useMemo } from 'react';
import { generateNewsletterHtml } from '../services/newsletterHtml';
import type { NewsletterItem } from '../services/newsletterHtml';
import { useSelectionStore } from '../stores/selectionStore';
import type { CategoryGroup } from '../hooks/useRunDetail';
import { NewsletterHeader } from './NewsletterHeader';

interface NewsletterPreviewProps {
  groups: CategoryGroup[];
  onBack: () => void;
}

export function NewsletterPreview({ groups, onBack }: NewsletterPreviewProps) {
  const { selectedIds, title, subtitle } = useSelectionStore();

  const items = useMemo<NewsletterItem[]>(() => {
    const result: NewsletterItem[] = [];
    for (const group of groups) {
      for (const news of group.news) {
        if (!selectedIds.has(news.id)) continue;
        result.push({
          title: news.title,
          link: news.link,
          summaryText: news.summary?.text ?? news.snippet ?? '',
          publisher: news.publisher ?? '',
          publishedDate: news.publishedDate
            ? new Date(news.publishedDate).toLocaleDateString('ko-KR')
            : '',
          thumbnailUrl: news.thumbnailUrl,
          categoryName: group.categoryName,
        });
      }
    }
    return result;
  }, [groups, selectedIds]);

  const html = useMemo(
    () => generateNewsletterHtml(items, { title, subtitle }),
    [items, title, subtitle],
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
