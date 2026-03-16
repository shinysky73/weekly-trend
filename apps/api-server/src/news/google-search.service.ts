import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuotaExceededException } from './quota-exceeded.exception';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string | null;
  publishedDate: string | null;
  thumbnailUrl: string | null;
  publisher: string | null;
}

export interface SearchOptions {
  resultsPerKeyword?: number;
  dateRestrict?: string;
  newsSites?: string[];
}

const DEFAULT_NEWS_SITES = [
  'zdnet.co.kr',
  'www.etnews.com',
  'www.bloter.net',
  'www.mk.co.kr',
  'www.chosun.com',
  'www.hani.co.kr',
  'www.donga.com',
  'www.sedaily.com',
];

@Injectable()
export class GoogleSearchService {
  private readonly logger = new Logger(GoogleSearchService.name);
  private readonly apiKey: string;
  private readonly cseId: string;

  constructor(configService: ConfigService) {
    this.apiKey = configService.get<string>('GOOGLE_CSE_API_KEY') ?? '';
    this.cseId = configService.get<string>('GOOGLE_CSE_ID') ?? '';

    if (!this.apiKey || !this.cseId) {
      this.logger.warn(
        'GOOGLE_CSE_API_KEY 또는 GOOGLE_CSE_ID가 설정되지 않았습니다. 검색 기능이 동작하지 않습니다.',
      );
    }
  }

  async search(keyword: string, options?: SearchOptions): Promise<SearchResult[]> {
    const resultsPerKeyword = options?.resultsPerKeyword ?? 20;
    const dateRestrict = options?.dateRestrict ?? 'w1';
    const sites = options?.newsSites ?? DEFAULT_NEWS_SITES;
    const siteQuery = sites.map((s) => `site:${s}`).join(' OR ');

    const results: SearchResult[] = [];

    // Calculate pagination: num per page (max 10), number of pages needed
    const numPerPage = Math.min(resultsPerKeyword, 10);
    const pages = Math.ceil(resultsPerKeyword / 10);
    const startOffsets = Array.from({ length: pages }, (_, i) => i * 10 + 1);

    for (const start of startOffsets) {
      const params = new URLSearchParams({
        key: this.apiKey,
        cx: this.cseId,
        q: `${keyword} ${siteQuery}`,
        dateRestrict,
        lr: 'lang_ko',
        gl: 'kr',
        num: String(numPerPage),
        start: String(start),
      });

      const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 429) {
          throw new QuotaExceededException();
        }
        throw new Error(`Google CSE API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items) break;

      results.push(...data.items.map((item: any) => this.extractResult(item)));

      if (data.items.length < numPerPage) break;
    }

    return results;
  }

  private extractResult(item: any): SearchResult {
    const metatags = item.pagemap?.metatags?.[0];
    const cseImage = item.pagemap?.cse_image?.[0];

    const thumbnailUrl =
      cseImage?.src ?? metatags?.['og:image'] ?? null;

    const publisher =
      metatags?.['og:site_name'] ?? item.displayLink ?? null;

    const publishedDate =
      metatags?.['article:published_time'] ?? null;

    return {
      title: item.title,
      link: item.link,
      snippet: item.snippet ?? null,
      publishedDate,
      thumbnailUrl,
      publisher,
    };
  }
}
