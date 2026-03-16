import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewsService } from '../news/news.service';
import { GoogleSearchService } from '../news/google-search.service';
import { SummaryService } from '../summary/summary.service';
import { SettingsService } from '../settings/settings.service';
import { QuotaExceededException } from '../news/quota-exceeded.exception';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly newsService: NewsService,
    private readonly googleSearchService: GoogleSearchService,
    private readonly summaryService: SummaryService,
    private readonly settingsService: SettingsService,
  ) {}

  async startPipeline() {
    const existing = await this.prisma.pipelineRun.findFirst({
      where: { status: 'running' },
    });
    if (existing) {
      throw new ConflictException('파이프라인이 이미 실행 중입니다.');
    }

    const keywordCount = await this.prisma.keyword.count();
    if (keywordCount === 0) {
      throw new BadRequestException('등록된 키워드가 없습니다. 카테고리 관리에서 키워드를 추가하세요.');
    }

    const run = await this.prisma.pipelineRun.create({
      data: { status: 'running' },
    });

    this.executePipeline(run.id).catch((error) => {
      this.logger.error(`파이프라인 실행 중 예기치 않은 에러: ${error.message}`);
    });

    return { id: run.id, status: 'running' };
  }

  private updateRun(runId: number, data: Record<string, any>) {
    return this.prisma.pipelineRun.update({ where: { id: runId }, data });
  }

  async executePipeline(runId: number) {
    let totalNews = 0;

    try {
      // Load settings at pipeline start
      const settings = await this.settingsService.getSettings();
      const searchOptions = {
        resultsPerKeyword: settings.resultsPerKeyword,
        dateRestrict: settings.dateRestrict,
        newsSites: settings.newsSites,
      };
      const summaryOptions = {
        summaryMaxLength: settings.summaryMaxLength,
        llmModel: settings.llmModel,
      };

      const categories = await this.prisma.category.findMany({
        include: { keywords: true, filterKeywords: true },
      });

      const totalKeywords = categories.flatMap((c) => c.keywords).length;
      await this.updateRun(runId, { totalKeywords });

      let quotaExceeded = false;
      let processedKeywords = 0;

      for (const category of categories) {
        if (category.keywords.length === 0) continue;
        if (quotaExceeded) break;

        const filterKeywords = category.filterKeywords.map((fk: any) => fk.text);

        for (const kw of category.keywords) {
          if (quotaExceeded) break;

          try {
            const results = await this.googleSearchService.search(kw.text, searchOptions);
            const filtered = this.newsService.filterNews(results, filterKeywords);
            const saved = await this.newsService.saveNews(
              filtered,
              kw.text,
              category.id,
              runId,
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

          processedKeywords++;
          await this.updateRun(runId, {
            processedKeywords,
            currentKeyword: `${category.name}/${kw.text}`,
            ...(quotaExceeded ? { quotaExceeded: true } : {}),
          });
        }
      }

      // Summary step
      await this.updateRun(runId, { currentKeyword: '요약 생성 중...' });
      const totalSummaries = await this.summaryService.summarizeByPipelineRun(runId, summaryOptions);

      await this.updateRun(runId, {
        status: 'completed',
        totalNews,
        totalSummaries,
        totalKeywords,
        currentKeyword: null,
        completedAt: new Date(),
      });
    } catch (error) {
      try {
        await this.updateRun(runId, {
          status: 'failed',
          totalNews,
          errorLog: (error as Error).message,
        });
      } catch (updateError) {
        this.logger.error(
          `파이프라인 상태 업데이트 실패 (runId=${runId}): ${(updateError as Error).message}`,
        );
      }
    }
  }

  async findAllRuns(query: { page?: string; limit?: string } = {}) {
    const page = Math.max(parseInt(query.page ?? '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(query.limit ?? '10', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.pipelineRun.findMany({
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pipelineRun.count(),
    ]);

    return { data, total, page, limit };
  }

  async deleteRun(id: number) {
    const run = await this.prisma.pipelineRun.findUnique({ where: { id } });
    if (!run) {
      throw new NotFoundException(`PipelineRun(id=${id})을 찾을 수 없습니다.`);
    }

    // News → Summary has onDelete: Cascade, so deleting news cascades to summaries
    await this.prisma.news.deleteMany({ where: { pipelineRunId: id } });

    await this.prisma.pipelineRun.delete({ where: { id } });
    return { deleted: true };
  }

  async findRunById(id: number) {
    const run = await this.prisma.pipelineRun.findUnique({
      where: { id },
      include: { news: { include: { summary: true, category: true } } },
    });
    if (!run) {
      throw new NotFoundException(`PipelineRun(id=${id})을 찾을 수 없습니다.`);
    }
    return run;
  }
}
