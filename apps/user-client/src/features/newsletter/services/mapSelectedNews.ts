import type { CategoryGroup } from '../hooks/useRunDetail';
import type { NewsletterItem } from './newsletterHtml';
import type { CsvItem } from './newsletterApi';
import { formatDate, getSummaryText } from '../../../lib/format';

export function mapSelectedToNewsletterItems(
  groups: CategoryGroup[],
  selectedIds: Set<number>,
): NewsletterItem[] {
  const result: NewsletterItem[] = [];
  for (const group of groups) {
    for (const news of group.news) {
      if (!selectedIds.has(news.id)) continue;
      result.push({
        title: news.title,
        link: news.link,
        summaryText: getSummaryText(news),
        publisher: news.publisher ?? '',
        publishedDate: formatDate(news.publishedDate),
        thumbnailUrl: news.thumbnailUrl,
        categoryName: group.categoryName,
      });
    }
  }
  return result;
}

export function mapSelectedToCsvItemsWithKeyword(
  groups: CategoryGroup[],
  selectedIds: Set<number>,
): CsvItem[] {
  const result: CsvItem[] = [];
  for (const group of groups) {
    for (const news of group.news) {
      if (!selectedIds.has(news.id)) continue;
      result.push({
        categoryName: group.categoryName,
        keyword: news.keyword,
        title: news.title,
        link: news.link,
        summaryText: getSummaryText(news),
        publisher: news.publisher ?? '',
        publishedDate: formatDate(news.publishedDate),
      });
    }
  }
  return result;
}
