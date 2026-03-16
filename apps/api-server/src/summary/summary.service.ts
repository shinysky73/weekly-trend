import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';

const MAX_INPUT_LENGTH = 8000;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
const CONCURRENCY = 5;

interface GeminiResponse {
  text?: string;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}

export interface SummaryOptions {
  summaryMaxLength?: number;
  llmModel?: string;
}

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);
  private readonly genai: GoogleGenAI;
  private readonly defaultModel = 'gemini-2.5-flash';

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    const apiKey = configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set. Summary service will not function.');
    }
    this.genai = new GoogleGenAI({ apiKey: apiKey ?? '' });
  }

  async summarizeNews(
    news: { id: number; title: string; snippet?: string | null },
    options?: SummaryOptions,
  ): Promise<{ id: number; newsId: number; text: string } | null> {
    // Skip if already summarized
    const existing = await this.prisma.summary.findUnique({
      where: { newsId: news.id },
    });
    if (existing) return null;

    // Skip if snippet is empty
    if (!news.snippet) return null;

    const model = options?.llmModel ?? this.defaultModel;
    const maxLength = options?.summaryMaxLength ?? 250;

    try {
      const startTime = Date.now();
      const response = await this.callGeminiWithRetry(news.title, news.snippet, model, maxLength);
      const processingMs = Date.now() - startTime;

      const summaryText = response.text ?? '';
      const usage = response.usageMetadata;

      const summary = await this.prisma.summary.create({
        data: {
          newsId: news.id,
          text: summaryText,
        },
      });

      await this.prisma.summaryMeta.create({
        data: {
          summaryId: summary.id,
          inputTokens: usage?.promptTokenCount ?? 0,
          outputTokens: usage?.candidatesTokenCount ?? 0,
          model,
          processingMs,
        },
      });

      return summary;
    } catch (error) {
      this.logger.error(
        `뉴스 요약 실패 (newsId=${news.id}): ${(error as Error).message}`,
      );
      return null;
    }
  }

  async summarizeByPipelineRun(pipelineRunId: number, options?: SummaryOptions): Promise<number> {
    const newsList = await this.prisma.news.findMany({
      where: { pipelineRunId, summary: null },
    });

    const targets = newsList.filter((n) => n.snippet);
    let count = 0;

    // Process in batches of CONCURRENCY
    for (let i = 0; i < targets.length; i += CONCURRENCY) {
      const batch = targets.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map((news) => this.summarizeNews(news, options)),
      );
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) count++;
      }
    }

    return count;
  }

  private async callGeminiWithRetry(
    title: string,
    snippet: string,
    model: string,
    maxLength: number,
  ): Promise<GeminiResponse> {
    const input = `${title}\n${snippet}`;
    const truncated =
      input.length > MAX_INPUT_LENGTH
        ? input.substring(0, MAX_INPUT_LENGTH)
        : input;

    const prompt = `다음 뉴스 기사를 ${maxLength}자 이내의 한국어로 요약해주세요:\n\n${truncated}`;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.genai.models.generateContent({
          model,
          contents: prompt,
        }) as GeminiResponse;
      } catch (error: any) {
        const isRateLimit =
          error?.status === 429 ||
          error?.statusCode === 429 ||
          error?.code === 429;

        if (isRateLimit && attempt < MAX_RETRIES) {
          const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }

    // Unreachable, but satisfies TypeScript
    throw new Error('Max retries exceeded');
  }
}
