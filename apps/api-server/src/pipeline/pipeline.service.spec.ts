import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';
import { NewsService } from '../news/news.service';
import { GoogleSearchService } from '../news/google-search.service';
import { SummaryService } from '../summary/summary.service';
import { SettingsService, SETTINGS_DEFAULTS } from '../settings/settings.service';
import { QuotaExceededException } from '../news/quota-exceeded.exception';

describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: PrismaService;
  let newsService: NewsService;
  let googleSearchService: GoogleSearchService;
  let summaryService: SummaryService;
  let settingsService: SettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        {
          provide: PrismaService,
          useValue: {
            pipelineRun: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
              delete: jest.fn(),
            },
            category: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: NewsService,
          useValue: {
            filterNews: jest.fn(),
            saveNews: jest.fn(),
          },
        },
        {
          provide: GoogleSearchService,
          useValue: {
            search: jest.fn(),
          },
        },
        {
          provide: SummaryService,
          useValue: {
            summarizeByPipelineRun: jest.fn(),
          },
        },
        {
          provide: SettingsService,
          useValue: {
            getSettings: jest.fn().mockResolvedValue({ ...SETTINGS_DEFAULTS, updatedAt: new Date() }),
          },
        },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
    prisma = module.get<PrismaService>(PrismaService);
    newsService = module.get<NewsService>(NewsService);
    googleSearchService = module.get<GoogleSearchService>(GoogleSearchService);
    summaryService = module.get<SummaryService>(SummaryService);
    settingsService = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Phase 5: 파이프라인 실행 오케스트레이션', () => {
    beforeEach(() => {
      (prisma.pipelineRun.findFirst as jest.Mock).mockResolvedValue(null);
      (summaryService.summarizeByPipelineRun as jest.Mock).mockResolvedValue(0);
    });

    it('shouldCreatePipelineRunWithRunningStatus: 실행 시작 시 status="running" PipelineRun 레코드를 생성한다', async () => {
      const mockRun = { id: 1, status: 'running' };
      (prisma.pipelineRun.create as jest.Mock).mockResolvedValue(mockRun);
      (prisma.category.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.startPipeline();

      expect(prisma.pipelineRun.create).toHaveBeenCalledWith({
        data: { status: 'running' },
      });
    });

    it('shouldReturnRunningStatusImmediately: startPipeline은 즉시 running 상태를 반환한다', async () => {
      const mockRun = { id: 1, status: 'running' };
      (prisma.pipelineRun.create as jest.Mock).mockResolvedValue(mockRun);
      (prisma.category.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      const result = await service.startPipeline();

      expect(result).toEqual({ id: 1, status: 'running' });
    });

    it('shouldCollectNewsForAllCategoriesAndKeywords: 모든 카테고리의 키워드에 대해 뉴스를 수집한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          name: 'AI',
          keywords: [{ text: 'GPT' }, { text: 'LLM' }],
          filterKeywords: [{ text: '광고' }],
        },
      ]);
      (googleSearchService.search as jest.Mock).mockResolvedValue([]);
      (newsService.filterNews as jest.Mock).mockReturnValue([]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(0);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(googleSearchService.search).toHaveBeenCalledWith('GPT', expect.any(Object));
      expect(googleSearchService.search).toHaveBeenCalledWith('LLM', expect.any(Object));
      expect(googleSearchService.search).toHaveBeenCalledTimes(2);
    });

    it('shouldCallFilterNewsWithFilterKeywords: filterNews를 제외 키워드와 함께 호출한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          name: 'AI',
          keywords: [{ text: 'GPT' }],
          filterKeywords: [{ text: '광고' }, { text: '스팸' }],
        },
      ]);
      const mockResults = [{ title: 'news' }];
      (googleSearchService.search as jest.Mock).mockResolvedValue(mockResults);
      (newsService.filterNews as jest.Mock).mockReturnValue([]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(0);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(newsService.filterNews).toHaveBeenCalledWith(mockResults, ['광고', '스팸']);
    });

    it('shouldSkipCategoriesWithNoKeywords: 키워드가 0개인 카테고리는 건너뛴다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'AI', keywords: [], filterKeywords: [] },
        { id: 2, name: 'Blockchain', keywords: [{ text: 'BTC' }], filterKeywords: [] },
      ]);
      (googleSearchService.search as jest.Mock).mockResolvedValue([]);
      (newsService.filterNews as jest.Mock).mockReturnValue([]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(0);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(googleSearchService.search).toHaveBeenCalledTimes(1);
      expect(googleSearchService.search).toHaveBeenCalledWith('BTC', expect.any(Object));
    });

    it('shouldUpdateStatusToCompletedOnSuccess: 수집 완료 시 status="completed", completedAt, totalNews를 기록한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'AI', keywords: [{ text: 'GPT' }], filterKeywords: [] },
      ]);
      (googleSearchService.search as jest.Mock).mockResolvedValue([{ title: 'news' }]);
      (newsService.filterNews as jest.Mock).mockReturnValue([{ title: 'news' }]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(5);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(prisma.pipelineRun.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'completed',
          totalNews: 5,
          completedAt: expect.any(Date),
        }),
      });
    });

    it('shouldUpdateStatusToFailedOnError: 수집 실패 시 status="failed", errorLog를 기록한다', async () => {
      (prisma.category.findMany as jest.Mock).mockRejectedValue(new Error('DB connection failed'));
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(prisma.pipelineRun.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'failed',
          errorLog: expect.stringContaining('DB connection failed'),
        }),
      });
    });

    it('shouldHandleUpdateFailureGracefully: 에러 경로에서 상태 업데이트 실패 시 예외를 던지지 않는다', async () => {
      (prisma.category.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
      (prisma.pipelineRun.update as jest.Mock).mockRejectedValue(new Error('Update also failed'));

      await expect(service.executePipeline(1)).resolves.not.toThrow();
    });

    it('shouldPreserveCollectedDataOnQuotaExceeded: API 429 에러 시 수집을 중단하되 이미 수집된 데이터는 유지한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'AI', keywords: [{ text: 'GPT' }, { text: 'LLM' }], filterKeywords: [] },
      ]);
      (googleSearchService.search as jest.Mock)
        .mockResolvedValueOnce([{ title: 'news1' }])
        .mockRejectedValueOnce(new QuotaExceededException());
      (newsService.filterNews as jest.Mock).mockReturnValue([{ title: 'news1' }]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(3);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(prisma.pipelineRun.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'completed',
          totalNews: 3,
        }),
      });
    });

    it('shouldSkipFailedKeywordAndContinue: 개별 키워드 API 호출 실패 시 해당 키워드만 건너뛰고 계속 진행한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'AI', keywords: [{ text: 'GPT' }, { text: 'LLM' }], filterKeywords: [] },
      ]);
      (googleSearchService.search as jest.Mock)
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValueOnce([{ title: 'news' }]);
      (newsService.filterNews as jest.Mock).mockReturnValue([{ title: 'news' }]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(2);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(googleSearchService.search).toHaveBeenCalledTimes(2);
      expect(prisma.pipelineRun.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'completed',
          totalNews: 2,
        }),
      });
    });

    it('shouldCompleteWithZeroNewsWhenNoCategories: 카테고리가 0개이면 totalNews=0으로 completed한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(prisma.pipelineRun.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'completed',
          totalNews: 0,
        }),
      });
    });
  });

  describe('Phase 7: LLM 요약 파이프라인 통합', () => {
    beforeEach(() => {
      (prisma.pipelineRun.findFirst as jest.Mock).mockResolvedValue(null);
    });

    it('shouldRunSummaryAfterCollection: 파이프라인 실행 시 수집 완료 후 요약을 순차 실행한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'AI', keywords: [{ text: 'GPT' }], filterKeywords: [] },
      ]);
      (googleSearchService.search as jest.Mock).mockResolvedValue([{ title: 'news' }]);
      (newsService.filterNews as jest.Mock).mockReturnValue([{ title: 'news' }]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(5);
      (summaryService.summarizeByPipelineRun as jest.Mock).mockResolvedValue(3);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(summaryService.summarizeByPipelineRun).toHaveBeenCalledWith(1, expect.any(Object));
      // Verify summary was called after collection (saveNews called before summarize)
      const saveOrder = (newsService.saveNews as jest.Mock).mock.invocationCallOrder[0];
      const summaryOrder = (summaryService.summarizeByPipelineRun as jest.Mock).mock.invocationCallOrder[0];
      expect(saveOrder).toBeLessThan(summaryOrder);
    });

    it('shouldRecordTotalSummaries: 파이프라인 완료 시 totalSummaries 수를 PipelineRun에 기록한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'AI', keywords: [{ text: 'GPT' }], filterKeywords: [] },
      ]);
      (googleSearchService.search as jest.Mock).mockResolvedValue([]);
      (newsService.filterNews as jest.Mock).mockReturnValue([]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(0);
      (summaryService.summarizeByPipelineRun as jest.Mock).mockResolvedValue(7);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(prisma.pipelineRun.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'completed',
          totalSummaries: 7,
        }),
      });
    });

    it('shouldFailPipelineOnSummaryError: 수집 성공 + 요약 단계 전체 실패 시 status를 "failed"로 설정하고 수집 데이터는 유지한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'AI', keywords: [{ text: 'GPT' }], filterKeywords: [] },
      ]);
      (googleSearchService.search as jest.Mock).mockResolvedValue([]);
      (newsService.filterNews as jest.Mock).mockReturnValue([]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(5);
      (summaryService.summarizeByPipelineRun as jest.Mock).mockRejectedValue(
        new Error('Summary service crashed'),
      );
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(prisma.pipelineRun.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'failed',
          totalNews: 5,
          errorLog: expect.stringContaining('Summary service crashed'),
        }),
      });
    });
  });

  describe('Phase 6: 동시 실행 방지 및 이력 관리', () => {
    it('shouldThrowConflictWhenPipelineAlreadyRunning: running 상태인 PipelineRun이 있으면 409를 던진다', async () => {
      (prisma.pipelineRun.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        status: 'running',
      });

      await expect(service.startPipeline()).rejects.toThrow('파이프라인이 이미 실행 중입니다.');
    });

    it('shouldFindAllPipelineRuns: 실행 이력 목록을 페이징하여 최근순으로 반환한다', async () => {
      const mockRuns = [
        { id: 2, status: 'completed', startedAt: new Date() },
        { id: 1, status: 'completed', startedAt: new Date() },
      ];
      (prisma.pipelineRun.findMany as jest.Mock).mockResolvedValue(mockRuns);
      (prisma.pipelineRun.count as jest.Mock).mockResolvedValue(2);

      const result = await service.findAllRuns({ page: '1', limit: '10' });

      expect(prisma.pipelineRun.findMany).toHaveBeenCalledWith({
        orderBy: { startedAt: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({ data: mockRuns, total: 2, page: 1, limit: 10 });
    });

    it('shouldFindRunByIdWithNewsSummaryAndCategory: findRunById가 news에 summary와 category를 include하여 반환한다', async () => {
      const mockRun = {
        id: 1,
        status: 'completed',
        news: [{ id: 1, title: 'news', summary: { text: 'summary' }, category: { id: 1, name: 'Cloud' } }],
      };
      (prisma.pipelineRun.findUnique as jest.Mock).mockResolvedValue(mockRun);

      const result = await service.findRunById(1);

      expect(prisma.pipelineRun.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { news: { include: { summary: true, category: true } } },
      });
      expect(result).toEqual(mockRun);
    });

    it('shouldThrowNotFoundWhenPipelineRunNotExists: 존재하지 않는 PipelineRun 조회 시 404를 던진다', async () => {
      (prisma.pipelineRun.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findRunById(999)).rejects.toThrow('PipelineRun(id=999)을 찾을 수 없습니다.');
    });
  });

  describe('Phase 10: 파이프라인 진행 상태 추적', () => {
    beforeEach(() => {
      (prisma.pipelineRun.findFirst as jest.Mock).mockResolvedValue(null);
      (summaryService.summarizeByPipelineRun as jest.Mock).mockResolvedValue(0);
    });

    it('shouldSetTotalKeywordsOnStart: 파이프라인 시작 시 totalKeywords를 전체 키워드 수로 설정한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'AI', keywords: [{ text: 'GPT' }, { text: 'LLM' }], filterKeywords: [] },
        { id: 2, name: 'Cloud', keywords: [{ text: 'AWS' }], filterKeywords: [] },
      ]);
      (googleSearchService.search as jest.Mock).mockResolvedValue([]);
      (newsService.filterNews as jest.Mock).mockReturnValue([]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(0);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      // First update should set totalKeywords
      const firstUpdate = (prisma.pipelineRun.update as jest.Mock).mock.calls[0];
      expect(firstUpdate[0].data).toEqual(expect.objectContaining({ totalKeywords: 3 }));
    });

    it('shouldUpdateProgressPerKeyword: 키워드 처리 완료 시 processedKeywords 증가 + currentKeyword 업데이트', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'AI', keywords: [{ text: 'GPT' }, { text: 'LLM' }], filterKeywords: [] },
      ]);
      (googleSearchService.search as jest.Mock).mockResolvedValue([]);
      (newsService.filterNews as jest.Mock).mockReturnValue([]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(0);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      const updateCalls = (prisma.pipelineRun.update as jest.Mock).mock.calls;
      // Should have updates for: totalKeywords, GPT progress, LLM progress, summary step, completed
      const progressUpdates = updateCalls.filter(
        (c: any) => c[0].data.currentKeyword !== undefined,
      );
      expect(progressUpdates.length).toBeGreaterThanOrEqual(2);
    });

    it('shouldSetQuotaExceededFlag: API 할당량 초과 시 quotaExceeded=true로 기록한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'AI', keywords: [{ text: 'GPT' }, { text: 'LLM' }], filterKeywords: [] },
      ]);
      (googleSearchService.search as jest.Mock)
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new QuotaExceededException());
      (newsService.filterNews as jest.Mock).mockReturnValue([]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(0);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      const updateCalls = (prisma.pipelineRun.update as jest.Mock).mock.calls;
      const quotaUpdate = updateCalls.find((c: any) => c[0].data.quotaExceeded === true);
      expect(quotaUpdate).toBeTruthy();
    });

    it('shouldCompleteImmediatelyWhenNoKeywords: 키워드가 0개면 파이프라인을 즉시 완료한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'AI', keywords: [], filterKeywords: [] },
      ]);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});

      await service.executePipeline(1);

      expect(googleSearchService.search).not.toHaveBeenCalled();
      const finalUpdate = (prisma.pipelineRun.update as jest.Mock).mock.calls.find(
        (c: any) => c[0].data.status === 'completed',
      );
      expect(finalUpdate).toBeTruthy();
      expect(finalUpdate[0].data.totalKeywords).toBe(0);
    });
  });

  describe('Settings 연동', () => {
    const setupPipelineWithCategory = () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          name: 'AI',
          keywords: [{ id: 1, text: 'AI', categoryId: 1 }],
          filterKeywords: [],
        },
      ]);
      (googleSearchService.search as jest.Mock).mockResolvedValue([]);
      (newsService.filterNews as jest.Mock).mockReturnValue([]);
      (newsService.saveNews as jest.Mock).mockResolvedValue(0);
      (summaryService.summarizeByPipelineRun as jest.Mock).mockResolvedValue(0);
      (prisma.pipelineRun.update as jest.Mock).mockResolvedValue({});
    };

    it('shouldLoadSettingsBeforePipelineExecution: executePipeline 시작 시 settingsService.getSettings() 호출', async () => {
      setupPipelineWithCategory();

      await service.executePipeline(1);

      expect(settingsService.getSettings).toHaveBeenCalled();
    });

    it('shouldPassSearchOptionsToGoogleSearch: search() 호출 시 설정의 수집 파라미터 전달', async () => {
      (settingsService.getSettings as jest.Mock).mockResolvedValue({
        ...SETTINGS_DEFAULTS,
        resultsPerKeyword: 5,
        dateRestrict: 'd3',
        newsSites: ['custom.com'],
      });
      setupPipelineWithCategory();

      await service.executePipeline(1);

      expect(googleSearchService.search).toHaveBeenCalledWith('AI', {
        resultsPerKeyword: 5,
        dateRestrict: 'd3',
        newsSites: ['custom.com'],
      });
    });

    it('shouldPassSummaryOptionsToSummaryService: summarizeByPipelineRun() 호출 시 요약 설정 전달', async () => {
      (settingsService.getSettings as jest.Mock).mockResolvedValue({
        ...SETTINGS_DEFAULTS,
        summaryMaxLength: 100,
        llmModel: 'gemini-2.0-pro',
      });
      setupPipelineWithCategory();

      await service.executePipeline(1);

      expect(summaryService.summarizeByPipelineRun).toHaveBeenCalledWith(1, {
        summaryMaxLength: 100,
        llmModel: 'gemini-2.0-pro',
      });
    });
  });
});
