import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrisma = {
    news: { count: jest.fn() },
    summary: { count: jest.fn() },
    category: { count: jest.fn() },
    keyword: { count: jest.fn() },
    newsletterSend: { count: jest.fn(), findFirst: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(DashboardService);
    jest.clearAllMocks();
  });

  it('shouldReturnAllStats: 대시보드 통계를 한 번에 조회한다', async () => {
    mockPrisma.news.count.mockResolvedValueOnce(100).mockResolvedValueOnce(38);
    mockPrisma.summary.count.mockResolvedValue(95);
    mockPrisma.category.count.mockResolvedValue(5);
    mockPrisma.keyword.count.mockResolvedValue(23);
    mockPrisma.newsletterSend.count.mockResolvedValue(12);
    mockPrisma.newsletterSend.findFirst.mockResolvedValue({ sentAt: new Date('2026-03-14') });

    const result = await service.getStats();

    expect(result.totalNews).toBe(100);
    expect(result.totalSummaries).toBe(95);
    expect(result.categoryCount).toBe(5);
    expect(result.keywordCount).toBe(23);
    expect(result.newsletterSendCount).toBe(12);
    expect(result.lastSendDate).toBeDefined();
    expect(result.recentNewsThisWeek).toBe(38);
  });

  it('shouldHandleNoSendHistory: 발송 이력 없을 때 lastSendDate가 null', async () => {
    mockPrisma.news.count.mockResolvedValue(0);
    mockPrisma.summary.count.mockResolvedValue(0);
    mockPrisma.category.count.mockResolvedValue(0);
    mockPrisma.keyword.count.mockResolvedValue(0);
    mockPrisma.newsletterSend.count.mockResolvedValue(0);
    mockPrisma.newsletterSend.findFirst.mockResolvedValue(null);

    const result = await service.getStats();

    expect(result.lastSendDate).toBeNull();
    expect(result.newsletterSendCount).toBe(0);
  });
});
