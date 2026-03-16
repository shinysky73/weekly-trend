import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { SearchResult } from './google-search.service';

describe('NewsService', () => {
  let service: NewsService;
  let prisma: PrismaService;

  const createModule = (publisherBlacklist = '') =>
    Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: PrismaService,
          useValue: {
            news: {
              createMany: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'PUBLISHER_BLACKLIST') return publisherBlacklist;
              return undefined;
            }),
          },
        },
      ],
    }).compile();

  beforeEach(async () => {
    const module: TestingModule = await createModule();
    service = module.get<NewsService>(NewsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  const makeResult = (overrides: Partial<SearchResult> = {}): SearchResult => ({
    title: '테스트 뉴스',
    link: 'https://example.com/news',
    snippet: '테스트 요약',
    publishedDate: null,
    thumbnailUrl: null,
    publisher: null,
    ...overrides,
  });

  describe('Phase 2: 필터링 로직', () => {
    it('shouldFilterByFilterKeywordsInTitle: 제외 키워드가 제목에 포함된 결과를 필터링한다', () => {
      const results = [
        makeResult({ title: 'AI 광고 뉴스', link: 'https://a.com' }),
        makeResult({ title: 'AI 기술 뉴스', link: 'https://b.com' }),
      ];

      const filtered = service.filterNews(results, ['광고']);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('AI 기술 뉴스');
    });

    it('shouldFilterByFilterKeywordsInSnippet: 제외 키워드가 snippet에 포함된 결과를 필터링한다', () => {
      const results = [
        makeResult({ snippet: '이것은 광고입니다', link: 'https://a.com' }),
        makeResult({ snippet: '기술 동향 분석', link: 'https://b.com' }),
      ];

      const filtered = service.filterNews(results, ['광고']);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].snippet).toBe('기술 동향 분석');
    });

    it('shouldFilterByPublisherBlacklist: 출판사 블랙리스트에 해당하는 결과를 필터링한다', async () => {
      const module = await createModule('이코노타임즈');
      const svcWithBlacklist = module.get<NewsService>(NewsService);

      const results = [
        makeResult({ publisher: '이코노타임즈', link: 'https://a.com' }),
        makeResult({ publisher: '한국경제', link: 'https://b.com' }),
      ];

      const filtered = svcWithBlacklist.filterNews(results, []);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].publisher).toBe('한국경제');
    });

    it('shouldReturnUnfilteredWhenNoFilterKeywords: 제외 키워드가 없으면 전체 결과를 반환한다', () => {
      const results = [
        makeResult({ title: 'AI 뉴스 1', link: 'https://a.com' }),
        makeResult({ title: 'AI 뉴스 2', link: 'https://b.com' }),
      ];

      const filtered = service.filterNews(results, []);

      expect(filtered).toHaveLength(2);
    });

    it('shouldReturnUnfilteredWhenNoBlacklist: 블랙리스트가 비어있으면 전체 결과를 반환한다', () => {
      const results = [
        makeResult({ publisher: '한국경제', link: 'https://a.com' }),
        makeResult({ publisher: '조선일보', link: 'https://b.com' }),
      ];

      const filtered = service.filterNews(results, []);

      expect(filtered).toHaveLength(2);
    });

    it('shouldFilterCaseInsensitive: 대소문자 구분 없이 필터링한다', () => {
      const results = [
        makeResult({ title: 'AI News about GPT', link: 'https://a.com' }),
        makeResult({ title: 'ai news about blockchain', link: 'https://b.com' }),
      ];

      const filtered = service.filterNews(results, ['gpt']);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('ai news about blockchain');
    });
  });

  describe('Phase 3: 뉴스 저장 및 중복 방지', () => {
    it('shouldSaveNewsWithCorrectFields: keyword, categoryId, collectionType, pipelineRunId를 포함하여 저장한다', async () => {
      const results = [makeResult({ title: 'AI 뉴스', link: 'https://a.com' })];
      (prisma.news.createMany as jest.Mock).mockResolvedValue({ count: 1 });

      await service.saveNews(results, 'AI', 1, 10);

      expect(prisma.news.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            title: 'AI 뉴스',
            link: 'https://a.com',
            keyword: 'AI',
            categoryId: 1,
            collectionType: 'google_cse',
            pipelineRunId: 10,
          }),
        ],
        skipDuplicates: true,
      });
    });

    it('shouldSkipDuplicateNews: title+link 중복 기사는 건너뛰고 신규만 저장한다', async () => {
      const results = [
        makeResult({ title: '뉴스 1', link: 'https://a.com' }),
        makeResult({ title: '뉴스 2', link: 'https://b.com' }),
      ];
      (prisma.news.createMany as jest.Mock).mockResolvedValue({ count: 1 });

      const count = await service.saveNews(results, 'AI', 1, 10);

      expect(prisma.news.createMany).toHaveBeenCalledWith(
        expect.objectContaining({ skipDuplicates: true }),
      );
      expect(count).toBe(1);
    });

    it('shouldReturnSavedNewsCount: 저장된 신규 기사 수를 반환한다', async () => {
      const results = [
        makeResult({ title: '뉴스 1', link: 'https://a.com' }),
        makeResult({ title: '뉴스 2', link: 'https://b.com' }),
        makeResult({ title: '뉴스 3', link: 'https://c.com' }),
      ];
      (prisma.news.createMany as jest.Mock).mockResolvedValue({ count: 3 });

      const count = await service.saveNews(results, 'AI', 1, 10);

      expect(count).toBe(3);
    });
  });

  describe('Phase 4: 뉴스 조회 API', () => {
    it('shouldFindNewsPaginated: page, limit으로 뉴스 목록을 페이지네이션하여 반환한다', async () => {
      const mockNews = [{ id: 1, title: '뉴스 1' }];
      (prisma.news.findMany as jest.Mock).mockResolvedValue(mockNews);
      (prisma.news.count as jest.Mock).mockResolvedValue(10);

      const result = await service.findNewsPaginated({ page: '2', limit: '5' });

      expect(prisma.news.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result).toEqual({ data: mockNews, total: 10, page: 2, limit: 5 });
    });

    it('shouldClampPaginationBounds: 음수 page는 1로, limit은 1~100으로 제한한다', async () => {
      (prisma.news.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.news.count as jest.Mock).mockResolvedValue(0);

      const result = await service.findNewsPaginated({ page: '-1', limit: '999' });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(100);
      expect(prisma.news.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 100 }),
      );
    });

    it('shouldFilterNewsByCategoryId: categoryId로 필터링된 뉴스 목록을 반환한다', async () => {
      (prisma.news.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.news.count as jest.Mock).mockResolvedValue(0);

      await service.findNewsPaginated({ categoryId: '1' });

      expect(prisma.news.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 1 }),
        }),
      );
    });

    it('shouldFilterNewsByDateRange: 날짜 범위로 필터링된 뉴스 목록을 반환한다', async () => {
      (prisma.news.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.news.count as jest.Mock).mockResolvedValue(0);

      await service.findNewsPaginated({
        startDate: '2026-03-01',
        endDate: '2026-03-14',
      });

      expect(prisma.news.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date('2026-03-01'),
              lte: new Date('2026-03-14'),
            },
          }),
        }),
      );
    });

    it('shouldFindNewsById: id로 뉴스 상세를 반환한다', async () => {
      const mockNews = { id: 1, title: '뉴스' };
      (prisma.news.findUnique as jest.Mock).mockResolvedValue(mockNews);

      const result = await service.findNewsById(1);

      expect(prisma.news.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { summary: { include: { meta: true } } },
      });
      expect(result).toEqual(mockNews);
    });

    it('shouldThrowNotFoundWhenNewsNotExists: 존재하지 않는 뉴스 조회 시 404를 던진다', async () => {
      (prisma.news.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findNewsById(999)).rejects.toThrow(NotFoundException);
    });

    it('shouldIncludeSummaryInNewsDetail: 뉴스 상세 조회에 summary를 포함한다', async () => {
      const mockNews = {
        id: 1,
        title: '뉴스',
        summary: { id: 1, newsId: 1, text: '요약 텍스트' },
      };
      (prisma.news.findUnique as jest.Mock).mockResolvedValue(mockNews);

      const result = await service.findNewsById(1);

      expect(prisma.news.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { summary: { include: { meta: true } } },
      });
      expect((result as any).summary).toBeDefined();
      expect((result as any).summary.text).toBe('요약 텍스트');
    });

    it('shouldIncludeSummaryMetaInNewsDetail: 뉴스 상세 조회에 summaryMeta를 포함한다', async () => {
      const mockNews = {
        id: 1,
        title: '뉴스',
        summary: {
          id: 1,
          newsId: 1,
          text: '요약',
          meta: { inputTokens: 100, outputTokens: 50, model: 'gemini-2.5-flash', processingMs: 500 },
        },
      };
      (prisma.news.findUnique as jest.Mock).mockResolvedValue(mockNews);

      const result = await service.findNewsById(1);

      expect((result as any).summary.meta).toBeDefined();
      expect((result as any).summary.meta.model).toBe('gemini-2.5-flash');
    });
  });
});
