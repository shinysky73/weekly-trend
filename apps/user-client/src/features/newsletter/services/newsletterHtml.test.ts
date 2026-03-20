import { describe, it, expect } from 'vitest';
import { generateNewsletterHtml, computeWeekPeriod } from './newsletterHtml';
import type { NewsletterItem } from './newsletterHtml';

const makeItem = (overrides: Partial<NewsletterItem> = {}): NewsletterItem => ({
  title: 'Test Title',
  link: 'https://example.com',
  summaryText: 'Test summary text',
  publisher: 'TechNews',
  publishedDate: '2026-03-14',
  thumbnailUrl: 'https://example.com/img.jpg',
  categoryName: 'AI',
  ...overrides,
});

describe('computeWeekPeriod', () => {
  it('shouldComputeLast7Days: 실행일 기준 최근 7일 기간 반환', () => {
    // 2026-03-18 → start: 03-12, end: 03-18
    const result = computeWeekPeriod('2026-03-18');
    expect(result).not.toBeNull();
    expect(result!.start).toBe('2026.03.12');
    expect(result!.end).toBe('03.18');
  });

  it('shouldHandleMonthBoundary: 월 경계를 넘는 경우 이전 달 날짜 반환', () => {
    // 2026-03-03 → start: 02-25, end: 03-03
    const result = computeWeekPeriod('2026-03-03');
    expect(result!.start).toBe('2026.02.25');
    expect(result!.end).toBe('03.03');
  });

  it('shouldComputeMonthWeek: N월 N주차 형식 반환', () => {
    const result = computeWeekPeriod('2026-03-18');
    expect(result!.monthWeek).toBe('3월 3주차');
  });

  it('shouldReturnNullForInvalidDate: 잘못된 날짜는 null 반환', () => {
    expect(computeWeekPeriod('invalid')).toBeNull();
  });
});

describe('newsletterHtml', () => {
  it('shouldGenerateEmptyHtmlWhenNoItems: 빈 배열 입력 시 헤더/푸터만 있는 HTML 반환', () => {
    const html = generateNewsletterHtml([], {});

    expect(html).toContain('서비스기획센터');
    expect(html).toContain('주간동향');
    expect(html).toContain('VNTG');
    expect(html).toContain('</html>');
  });

  it('shouldHaveFixedHeaderText: 헤더에 서비스기획센터/주간동향 고정 표시', () => {
    const html = generateNewsletterHtml([], {});

    expect(html).toContain('서비스기획센터');
    expect(html).toContain('<span style="font-weight:700">주간동향</span>');
    expect(html).toContain('Weekly Trends');
  });

  it('shouldGroupByCategoryInHtml: 뉴스를 카테고리별로 그룹화하여 카테고리 배지 포함 HTML 생성', () => {
    const items = [
      makeItem({ categoryName: 'AI', title: 'AI News' }),
      makeItem({ categoryName: 'MES', title: 'MES News' }),
    ];
    const html = generateNewsletterHtml(items, {});

    expect(html).toContain('AI');
    expect(html).toContain('MES');
    expect(html).toContain('AI News');
    expect(html).toContain('MES News');
    expect(html).toContain('#dbeafe');
    expect(html).toContain('#1d4ed8');
  });

  it('shouldRenderThumbnailLayout: thumbnailUrl이 있는 뉴스에 180x180 이미지 포함 레이아웃 적용', () => {
    const items = [makeItem({ thumbnailUrl: 'https://example.com/img.jpg' })];
    const html = generateNewsletterHtml(items, {});

    expect(html).toContain('180px');
    expect(html).toContain('https://example.com/img.jpg');
  });

  it('shouldRenderNoThumbnailLayout: thumbnailUrl이 없는 뉴스에 텍스트만 레이아웃 적용', () => {
    const items = [makeItem({ thumbnailUrl: null })];
    const html = generateNewsletterHtml(items, {});

    expect(html).toContain('Test Title');
    expect(html).not.toContain('180px');
  });

  it('shouldRenderReadMoreLink: 각 기사에 READ MORE 링크 포함', () => {
    const items = [makeItem({ link: 'https://example.com/article' })];
    const html = generateNewsletterHtml(items, {});

    expect(html).toContain('READ MORE');
    expect(html).toContain('https://example.com/article');
  });

  it('shouldRenderGradientHeader: 그라디언트 헤더 배경 적용', () => {
    const html = generateNewsletterHtml([], {});

    expect(html).toContain('linear-gradient(135deg,#1e40af');
    expect(html).toContain('#3b82f6');
  });

  it('shouldRenderDarkFooter: 다크 푸터에 VNTG 브랜딩 포함', () => {
    const html = generateNewsletterHtml([], {});

    expect(html).toContain('#0f172a');
    expect(html).toContain('VNTG');
  });

  it('shouldRenderPeriodFromRunDate: runDate 기준 최근 7일 기간 표시', () => {
    const html = generateNewsletterHtml([], { runDate: '2026-03-18' });

    expect(html).toContain('3월');
    expect(html).toContain('3주차');
    expect(html).toContain('2026.03.12');
    expect(html).toContain('03.18');
  });

  it('shouldNotRenderPeriodWithoutRunDate: runDate 없으면 기간 미표시', () => {
    const html = generateNewsletterHtml([], {});

    expect(html).not.toContain('주차');
  });
});

describe('newsletterHtml - intro summary', () => {
  it('shouldIncludeDateRangeInIntro: 인트로에 날짜 범위 포함', () => {
    const items = [makeItem({ categoryName: 'AI' })];
    const html = generateNewsletterHtml(items, { runDate: '2026-03-18', totalCollected: 230 });

    expect(html).toContain('03/12 ~ 03/18까지의');
  });

  it('shouldIncludeCategoryListInIntro: 인트로에 카테고리 목록 포함', () => {
    const items = [
      makeItem({ categoryName: 'AI' }),
      makeItem({ categoryName: 'MES' }),
    ];
    const html = generateNewsletterHtml(items, { totalCollected: 100 });

    expect(html).toContain('AI, MES 사업 관련 주요 기사입니다');
  });

  it('shouldIncludeTotalCollectedCount: 인트로에 수집 총 건수 포함', () => {
    const items = [makeItem()];
    const html = generateNewsletterHtml(items, { totalCollected: 230 });

    expect(html).toContain('총 230개의 기사');
  });

  it('shouldIncludeModelName: 인트로에 사용 모델명 포함', () => {
    const items = [makeItem()];
    const html = generateNewsletterHtml(items, {
      totalCollected: 50,
      template: { llmModel: 'GPT-4o mini' },
    });

    expect(html).toContain('GPT-4o mini를 통해 작성되었습니다');
  });

  it('shouldUseDefaultModelWhenNotSpecified: 모델 미지정시 기본값 사용', () => {
    const items = [makeItem()];
    const html = generateNewsletterHtml(items, { totalCollected: 50 });

    expect(html).toContain('gemini-2.5-flash를 통해 작성되었습니다');
  });
});

describe('newsletterHtml - template customization', () => {
  it('shouldApplyCustomFooterText: 커스텀 푸터 텍스트가 HTML에 반영', () => {
    const html = generateNewsletterHtml([], {
      template: { footerText: 'My Custom Newsletter' },
    });

    expect(html).toContain('My Custom Newsletter');
  });

  it('shouldApplyCustomFontFamily: 커스텀 폰트가 HTML에 반영', () => {
    const html = generateNewsletterHtml([], {
      template: { fontFamily: 'Roboto, sans-serif' },
    });

    expect(html).toContain('Roboto, sans-serif');
    expect(html).toContain('Roboto');
  });

  it('shouldUseDefaultsWhenNoTemplateProvided: 템플릿 설정 없으면 기본값 사용', () => {
    const html = generateNewsletterHtml([], {});

    expect(html).toContain('Noto Sans KR');
    expect(html).toContain('VNTG');
  });

  it('shouldUseUnifiedColorForAllCategories: 모든 카테고리에 통일된 색상 적용', () => {
    const items = [makeItem({ categoryName: 'Custom Category' })];
    const html = generateNewsletterHtml(items, {});

    expect(html).toContain('Custom Category');
    expect(html).toContain('#dbeafe');
    expect(html).toContain('#1d4ed8');
  });
});
