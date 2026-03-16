import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardStats {
  totalNews: number;
  totalSummaries: number;
  categoryCount: number;
  keywordCount: number;
  newsletterSendCount: number;
  lastSendDate: string | null;
  recentNewsThisWeek: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStats> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      totalNews,
      totalSummaries,
      categoryCount,
      keywordCount,
      newsletterSendCount,
      lastSend,
      recentNewsThisWeek,
    ] = await Promise.all([
      this.prisma.news.count(),
      this.prisma.summary.count(),
      this.prisma.category.count(),
      this.prisma.keyword.count(),
      this.prisma.newsletterSend.count(),
      this.prisma.newsletterSend.findFirst({ orderBy: { sentAt: 'desc' } }),
      this.prisma.news.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    ]);

    return {
      totalNews,
      totalSummaries,
      categoryCount,
      keywordCount,
      newsletterSendCount,
      lastSendDate: lastSend?.sentAt?.toISOString() ?? null,
      recentNewsThisWeek,
    };
  }
}
