import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SummaryService } from './summary.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SummaryService', () => {
  let service: SummaryService;
  let prisma: PrismaService;

  const mockGenai = {
    models: {
      generateContent: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        {
          provide: PrismaService,
          useValue: {
            news: {
              findMany: jest.fn(),
            },
            summary: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            summaryMeta: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return 'test-api-key';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
    prisma = module.get<PrismaService>(PrismaService);

    // Replace the internal genai instance with mock
    (service as any).genai = mockGenai;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Phase 1: Gemini API 요약 핵심 로직', () => {
    it('shouldCallGeminiWithTitleAndSnippet: 뉴스 제목+snippet을 Gemini API에 전달하여 요약을 요청한다', async () => {
      const news = { id: 1, title: 'AI 기술 동향', snippet: 'AI가 빠르게 발전하고 있다' };
      (prisma.summary.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.summary.create as jest.Mock).mockResolvedValue({ id: 1, newsId: 1, text: '요약' });
      (prisma.summaryMeta.create as jest.Mock).mockResolvedValue({});
      mockGenai.models.generateContent.mockResolvedValue({
        text: '요약 결과',
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50 },
      });

      await service.summarizeNews(news);

      expect(mockGenai.models.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.0-flash',
          contents: expect.stringContaining('AI 기술 동향'),
        }),
      );
      expect(mockGenai.models.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: expect.stringContaining('AI가 빠르게 발전하고 있다'),
        }),
      );
    });

    it('shouldSaveSummaryToDatabase: 요약 결과를 Summary 테이블에 저장한다', async () => {
      const news = { id: 1, title: '뉴스 제목', snippet: '뉴스 내용' };
      (prisma.summary.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.summary.create as jest.Mock).mockResolvedValue({ id: 1, newsId: 1, text: 'LLM 요약 결과' });
      (prisma.summaryMeta.create as jest.Mock).mockResolvedValue({});
      mockGenai.models.generateContent.mockResolvedValue({
        text: 'LLM 요약 결과',
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50 },
      });

      await service.summarizeNews(news);

      expect(prisma.summary.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          newsId: 1,
          text: 'LLM 요약 결과',
        }),
      });
    });

    it('shouldSaveSummaryMetaWithTokenUsage: 요약 완료 시 SummaryMeta에 메타데이터를 저장한다', async () => {
      const news = { id: 1, title: '제목', snippet: '내용' };
      (prisma.summary.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.summary.create as jest.Mock).mockResolvedValue({ id: 10, newsId: 1, text: '요약' });
      (prisma.summaryMeta.create as jest.Mock).mockResolvedValue({});
      mockGenai.models.generateContent.mockResolvedValue({
        text: '요약',
        usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 60 },
      });

      await service.summarizeNews(news);

      expect(prisma.summaryMeta.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          summaryId: 10,
          inputTokens: 120,
          outputTokens: 60,
          model: 'gemini-2.0-flash',
          processingMs: expect.any(Number),
        }),
      });
    });

    it('shouldSkipAlreadySummarizedNews: 이미 Summary가 존재하는 뉴스는 재요약하지 않는다', async () => {
      const news = { id: 1, title: '제목', snippet: '내용' };
      (prisma.summary.findUnique as jest.Mock).mockResolvedValue({ id: 1, newsId: 1, text: '기존 요약' });

      const result = await service.summarizeNews(news);

      expect(mockGenai.models.generateContent).not.toHaveBeenCalled();
      expect(prisma.summary.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('shouldSummarizeAllUnsummarizedNews: pipelineRunId로 미요약 뉴스를 조회하여 순차 요약한다', async () => {
      const newsList = [
        { id: 1, title: '뉴스1', snippet: '내용1' },
        { id: 2, title: '뉴스2', snippet: '내용2' },
        { id: 3, title: '뉴스3', snippet: '내용3' },
      ];
      (prisma.news.findMany as jest.Mock).mockResolvedValue(newsList);
      (prisma.summary.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.summary.create as jest.Mock).mockImplementation(({ data }) =>
        Promise.resolve({ id: data.newsId, ...data }),
      );
      (prisma.summaryMeta.create as jest.Mock).mockResolvedValue({});
      mockGenai.models.generateContent.mockResolvedValue({
        text: '요약',
        usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 30 },
      });

      const count = await service.summarizeByPipelineRun(1);

      expect(prisma.news.findMany).toHaveBeenCalledWith({
        where: { pipelineRunId: 1, summary: null },
      });
      expect(mockGenai.models.generateContent).toHaveBeenCalledTimes(3);
      expect(count).toBe(3);
    });
  });

  describe('Phase 2: 에러 핸들링 및 Edge Cases', () => {
    it('shouldSkipNewsWithEmptySnippet: snippet이 빈 문자열인 기사는 건너뛴다', async () => {
      const newsList = [
        { id: 1, title: '뉴스1', snippet: '' },
        { id: 2, title: '뉴스2', snippet: null },
        { id: 3, title: '뉴스3', snippet: '유효한 내용' },
      ];
      (prisma.news.findMany as jest.Mock).mockResolvedValue(newsList);
      (prisma.summary.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.summary.create as jest.Mock).mockImplementation(({ data }) =>
        Promise.resolve({ id: data.newsId, ...data }),
      );
      (prisma.summaryMeta.create as jest.Mock).mockResolvedValue({});
      mockGenai.models.generateContent.mockResolvedValue({
        text: '요약',
        usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 30 },
      });

      const count = await service.summarizeByPipelineRun(1);

      expect(mockGenai.models.generateContent).toHaveBeenCalledTimes(1);
      expect(count).toBe(1);
    });

    it('shouldTruncateInputTo8000Chars: 입력이 8000자를 초과하면 앞부분 8000자로 truncate한다', async () => {
      const longSnippet = 'A'.repeat(10000);
      const news = { id: 1, title: '제목', snippet: longSnippet };
      (prisma.summary.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.summary.create as jest.Mock).mockResolvedValue({ id: 1, newsId: 1, text: '요약' });
      (prisma.summaryMeta.create as jest.Mock).mockResolvedValue({});
      mockGenai.models.generateContent.mockResolvedValue({
        text: '요약',
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50 },
      });

      await service.summarizeNews(news);

      const callArgs = mockGenai.models.generateContent.mock.calls[0][0];
      // prompt template = "다음 뉴스 기사를 250자 이내의 한국어로 요약해주세요:\n\n" (~27 chars)
      // + truncated input (8000 max) = ~8027 max
      expect(callArgs.contents.length).toBeLessThanOrEqual(8050);
      expect(callArgs.contents.length).toBeGreaterThan(8000);
    });

    it('shouldContinueOnIndividualFailure: 개별 기사 요약 실패 시 해당 기사를 건너뛰고 나머지를 계속 처리한다', async () => {
      const newsList = [
        { id: 1, title: '뉴스1', snippet: '내용1' },
        { id: 2, title: '뉴스2', snippet: '내용2' },
        { id: 3, title: '뉴스3', snippet: '내용3' },
      ];
      (prisma.news.findMany as jest.Mock).mockResolvedValue(newsList);
      (prisma.summary.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.summary.create as jest.Mock).mockImplementation(({ data }) =>
        Promise.resolve({ id: data.newsId, ...data }),
      );
      (prisma.summaryMeta.create as jest.Mock).mockResolvedValue({});
      mockGenai.models.generateContent
        .mockResolvedValueOnce({
          text: '요약1',
          usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 30 },
        })
        .mockRejectedValueOnce(new Error('Gemini API error'))
        .mockResolvedValueOnce({
          text: '요약3',
          usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 30 },
        });

      const count = await service.summarizeByPipelineRun(1);

      expect(mockGenai.models.generateContent).toHaveBeenCalledTimes(3);
      expect(count).toBe(2);
    });

    it('shouldRetryOnRateLimitWithExponentialBackoff: 429 에러 시 지수 백오프로 재시도한다', async () => {
      const news = { id: 1, title: '제목', snippet: '내용' };
      (prisma.summary.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.summary.create as jest.Mock).mockResolvedValue({ id: 1, newsId: 1, text: '요약' });
      (prisma.summaryMeta.create as jest.Mock).mockResolvedValue({});

      const rateLimitError = new Error('Resource exhausted');
      (rateLimitError as any).status = 429;

      mockGenai.models.generateContent
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({
          text: '요약',
          usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 30 },
        });

      // Use fake timers to avoid actual delays
      jest.useFakeTimers();
      const promise = service.summarizeNews(news);
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);
      jest.useRealTimers();

      const result = await promise;

      expect(mockGenai.models.generateContent).toHaveBeenCalledTimes(3);
      expect(result).not.toBeNull();
    });

    it('shouldSkipAfterMaxRetries: 3회 재시도 후에도 실패하면 해당 기사를 건너뛴다', async () => {
      const news = { id: 1, title: '제목', snippet: '내용' };
      (prisma.summary.findUnique as jest.Mock).mockResolvedValue(null);

      const rateLimitError = new Error('Resource exhausted');
      (rateLimitError as any).status = 429;

      mockGenai.models.generateContent.mockRejectedValue(rateLimitError);

      jest.useFakeTimers();
      const promise = service.summarizeNews(news);
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);
      await jest.advanceTimersByTimeAsync(4000);
      jest.useRealTimers();

      const result = await promise;

      expect(mockGenai.models.generateContent).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
      expect(result).toBeNull();
      expect(prisma.summary.create).not.toHaveBeenCalled();
    });

    it('shouldLogErrorsWithNewsId: 모든 에러를 newsId와 함께 로깅한다', async () => {
      const news = { id: 42, title: '제목', snippet: '내용' };
      (prisma.summary.findUnique as jest.Mock).mockResolvedValue(null);
      mockGenai.models.generateContent.mockRejectedValue(new Error('API error'));

      const logSpy = jest.spyOn((service as any).logger, 'error');

      const result = await service.summarizeNews(news);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('42'),
      );
      expect(result).toBeNull();
    });
  });
});
