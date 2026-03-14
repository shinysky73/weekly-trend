import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';
import { NewsService } from '../news/news.service';
import { GoogleSearchService } from '../news/google-search.service';
import { QuotaExceededException } from '../news/quota-exceeded.exception';

describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: PrismaService;
  let newsService: NewsService;
  let googleSearchService: GoogleSearchService;

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
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
    prisma = module.get<PrismaService>(PrismaService);
    newsService = module.get<NewsService>(NewsService);
    googleSearchService = module.get<GoogleSearchService>(GoogleSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Phase 5: 파이프라인 실행 오케스트레이션', () => {
    beforeEach(() => {
      (prisma.pipelineRun.findFirst as jest.Mock).mockResolvedValue(null);
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

      expect(googleSearchService.search).toHaveBeenCalledWith('GPT');
      expect(googleSearchService.search).toHaveBeenCalledWith('LLM');
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
      expect(googleSearchService.search).toHaveBeenCalledWith('BTC');
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

  describe('Phase 6: 동시 실행 방지 및 이력 관리', () => {
    it('shouldThrowConflictWhenPipelineAlreadyRunning: running 상태인 PipelineRun이 있으면 409를 던진다', async () => {
      (prisma.pipelineRun.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        status: 'running',
      });

      await expect(service.startPipeline()).rejects.toThrow('파이프라인이 이미 실행 중입니다.');
    });

    it('shouldFindAllPipelineRuns: 실행 이력 목록을 최근순으로 반환한다', async () => {
      const mockRuns = [
        { id: 2, status: 'completed', startedAt: new Date() },
        { id: 1, status: 'completed', startedAt: new Date() },
      ];
      (prisma.pipelineRun.findMany as jest.Mock).mockResolvedValue(mockRuns);

      const result = await service.findAllRuns();

      expect(prisma.pipelineRun.findMany).toHaveBeenCalledWith({
        orderBy: { startedAt: 'desc' },
      });
      expect(result).toEqual(mockRuns);
    });

    it('shouldFindPipelineRunByIdWithNews: id로 실행 상세를 수집된 뉴스 포함하여 반환한다', async () => {
      const mockRun = { id: 1, status: 'completed', news: [{ id: 1, title: 'news' }] };
      (prisma.pipelineRun.findUnique as jest.Mock).mockResolvedValue(mockRun);

      const result = await service.findRunById(1);

      expect(prisma.pipelineRun.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { news: true },
      });
      expect(result).toEqual(mockRun);
    });

    it('shouldThrowNotFoundWhenPipelineRunNotExists: 존재하지 않는 PipelineRun 조회 시 404를 던진다', async () => {
      (prisma.pipelineRun.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findRunById(999)).rejects.toThrow('PipelineRun(id=999)을 찾을 수 없습니다.');
    });
  });
});
