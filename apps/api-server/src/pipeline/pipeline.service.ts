import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewsService } from '../news/news.service';
import { GoogleSearchService } from '../news/google-search.service';
import { QuotaExceededException } from '../news/quota-exceeded.exception';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly newsService: NewsService,
    private readonly googleSearchService: GoogleSearchService,
  ) {}

  async runPipeline() {
    const existing = await this.prisma.pipelineRun.findFirst({
      where: { status: 'running' },
    });
    if (existing) {
      throw new ConflictException('파이프라인이 이미 실행 중입니다.');
    }

    const run = await this.prisma.pipelineRun.create({
      data: { status: 'running' },
    });

    try {
      const categories = await this.prisma.category.findMany({
        include: { keywords: true, filterKeywords: true },
      });

      let totalNews = 0;
      let quotaExceeded = false;

      for (const category of categories) {
        if (category.keywords.length === 0) continue;
        if (quotaExceeded) break;

        const filterKeywords = category.filterKeywords.map((fk: any) => fk.text);

        for (const kw of category.keywords) {
          if (quotaExceeded) break;

          try {
            const results = await this.googleSearchService.search(kw.text);
            const filtered = this.newsService.filterNews(
              results,
              filterKeywords,
              this.newsService.publisherBlacklist,
            );
            const saved = await this.newsService.saveNews(
              filtered,
              kw.text,
              category.id,
              run.id,
            );
            totalNews += saved;
            this.logger.log(
              `[${category.name}/${kw.text}] 수집: ${results.length}, 필터링 후: ${filtered.length}, 저장: ${saved}`,
            );
          } catch (error) {
            if (error instanceof QuotaExceededException) {
              this.logger.warn(`API 할당량 초과 — 수집 중단`);
              quotaExceeded = true;
            } else {
              this.logger.error(
                `[${category.name}/${kw.text}] 실패: ${(error as Error).message}`,
              );
            }
          }
        }
      }

      await this.prisma.pipelineRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          totalNews,
          completedAt: new Date(),
        },
      });

      return { id: run.id, status: 'completed', totalNews };
    } catch (error) {
      await this.prisma.pipelineRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          errorLog: (error as Error).message,
        },
      });

      return { id: run.id, status: 'failed', error: (error as Error).message };
    }
  }

  async findAllRuns() {
    return this.prisma.pipelineRun.findMany({
      orderBy: { startedAt: 'desc' },
    });
  }

  async findRunById(id: number) {
    const run = await this.prisma.pipelineRun.findUnique({
      where: { id },
      include: { news: true },
    });
    if (!run) {
      throw new NotFoundException(`PipelineRun(id=${id})을 찾을 수 없습니다.`);
    }
    return run;
  }
}
