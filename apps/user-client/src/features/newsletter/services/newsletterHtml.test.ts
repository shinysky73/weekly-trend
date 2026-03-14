import { describe, it, expect } from 'vitest';
import { generateNewsletterHtml } from './newsletterHtml';
import type { NewsletterItem } from './newsletterHtml';

const makeItem = (overrides: Partial<NewsletterItem> = {}): NewsletterItem => ({
  title: 'Test Title',
  link: 'https://example.com',
  summaryText: 'Test summary text',
  publisher: 'TechNews',
  publishedDate: '2026-03-14',
  thumbnailUrl: 'https://example.com/img.jpg',
  categoryName: 'Cloud',
  ...overrides,
});

describe('newsletterHtml', () => {
  it('shouldGenerateEmptyHtmlWhenNoItems: 빈 배열 입력 시 헤더/푸터만 있는 HTML 반환', () => {
    const html = generateNewsletterHtml([], { title: '주간동향', subtitle: '' });

    expect(html).toContain('주간동향');
    expect(html).toContain('</html>');
    expect(html).not.toContain('#0047FF');
  });

  it('shouldGroupByCategoryInHtml: 뉴스를 카테고리별로 그룹화하여 카테고리 배지(#0047FF) 포함 HTML 생성', () => {
    const items = [
      makeItem({ categoryName: 'Cloud', title: 'Cloud News' }),
      makeItem({ categoryName: 'AI', title: 'AI News' }),
    ];
    const html = generateNewsletterHtml(items, { title: '주간동향', subtitle: '' });

    expect(html).toContain('#0047FF');
    expect(html).toContain('Cloud');
    expect(html).toContain('AI');
    expect(html).toContain('Cloud News');
    expect(html).toContain('AI News');
  });

  it('shouldRenderThumbnailLayout: thumbnailUrl이 있는 뉴스에 140x140 이미지 포함 레이아웃 적용', () => {
    const items = [makeItem({ thumbnailUrl: 'https://example.com/img.jpg' })];
    const html = generateNewsletterHtml(items, { title: '주간동향', subtitle: '' });

    expect(html).toContain('140px');
    expect(html).toContain('https://example.com/img.jpg');
  });

  it('shouldRenderNoThumbnailLayout: thumbnailUrl이 없는 뉴스에 텍스트만 레이아웃 적용', () => {
    const items = [makeItem({ thumbnailUrl: null })];
    const html = generateNewsletterHtml(items, { title: '주간동향', subtitle: '' });

    expect(html).toContain('Test Title');
    expect(html).not.toContain('140px');
  });

  it('shouldUseSummaryWithSnippetFallback: summary.text가 있으면 사용, 없으면 snippet을 fallback', () => {
    const items = [
      makeItem({ summaryText: 'Real summary' }),
      makeItem({ summaryText: '', title: 'No Summary' }),
    ];
    const html = generateNewsletterHtml(items, { title: '주간동향', subtitle: '' });

    expect(html).toContain('Real summary');
  });

  it('shouldIncludeTitleAndSubtitle: title과 subtitle을 HTML 헤더에 포함', () => {
    const html = generateNewsletterHtml([], {
      title: '커스텀 제목',
      subtitle: '2026년 3월 2주차 뉴스레터',
    });

    expect(html).toContain('커스텀 제목');
    expect(html).toContain('2026년 3월 2주차 뉴스레터');
  });
});
