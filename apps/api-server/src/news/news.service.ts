import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SearchResult } from './google-search.service';

@Injectable()
export class NewsService {
  private readonly publisherBlacklist: string[];

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    const blacklist = configService.get<string>('PUBLISHER_BLACKLIST') ?? '';
    this.publisherBlacklist = blacklist
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  filterNews(
    results: SearchResult[],
    filterKeywords: string[],
  ): SearchResult[] {
    const lowerKeywords = filterKeywords.map((k) => k.toLowerCase());
    const lowerBlacklist = this.publisherBlacklist;

    return results.filter((item) => {
      const titleLower = item.title.toLowerCase();
      const snippetLower = (item.snippet ?? '').toLowerCase();

      const hasFilterKeyword = lowerKeywords.some(
        (kw) => titleLower.includes(kw) || snippetLower.includes(kw),
      );
      if (hasFilterKeyword) return false;

      const publisherLower = (item.publisher ?? '').toLowerCase();
      if (lowerBlacklist.some((bp) => publisherLower.includes(bp))) {
        return false;
      }

      return true;
    });
  }

  async saveNews(
    results: SearchResult[],
    keyword: string,
    categoryId: number,
    pipelineRunId: number,
  ): Promise<number> {
    const data = results.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      publisher: item.publisher,
      publishedDate: item.publishedDate ? new Date(item.publishedDate) : null,
      thumbnailUrl: item.thumbnailUrl,
      keyword,
      categoryId,
      collectionType: 'google_cse',
      pipelineRunId,
    }));

    const result = await this.prisma.news.createMany({
      data,
      skipDuplicates: true,
    });

    return result.count;
  }

  async findNewsPaginated(query: {
    page?: string;
    limit?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Math.max(parseInt(query.page ?? '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(query.limit ?? '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const where: {
      categoryId?: number;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (query.categoryId) {
      where.categoryId = parseInt(query.categoryId, 10);
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.news.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async deleteNews(id: number) {
    // Summary has onDelete: Cascade from News, so deleting news cascades to summary
    await this.prisma.news.delete({ where: { id } });
    return { deleted: true };
  }

  async findNewsById(id: number) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: { summary: { include: { meta: true } } },
    });
    if (!news) {
      throw new NotFoundException(`뉴스(id=${id})를 찾을 수 없습니다.`);
    }
    return news;
  }
}
