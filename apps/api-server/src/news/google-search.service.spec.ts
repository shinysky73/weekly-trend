import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSearchService } from './google-search.service';
import { ConfigService } from '@nestjs/config';
import { QuotaExceededException } from './quota-exceeded.exception';

describe('GoogleSearchService', () => {
  let service: GoogleSearchService;
  let configService: ConfigService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleSearchService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, string> = {
                GOOGLE_CSE_API_KEY: 'test-api-key',
                GOOGLE_CSE_ID: 'test-cse-id',
              };
              return map[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GoogleSearchService>(GoogleSearchService);
    configService = module.get<ConfigService>(ConfigService);

    fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    } as Response);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('Phase 1: API 호출 및 데이터 추출', () => {
    it('shouldCallGoogleCSEApiWithCorrectParams: 키워드, API key, CSE ID, dateRestrict=w1 파라미터로 API를 호출한다', async () => {
      await service.search('인공지능');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('key=test-api-key');
      expect(url).toContain('cx=test-cse-id');
      expect(url).toContain('q=' + encodeURIComponent('인공지능'));
      expect(url).toContain('dateRestrict=w1');
    });

    it('shouldExtractTitleLinkSnippetFromResults: 검색 결과에서 title, link, snippet을 추출한다', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              title: 'AI 뉴스',
              link: 'https://example.com/ai',
              snippet: 'AI 관련 뉴스 요약',
            },
          ],
        }),
      } as Response);

      const results = await service.search('AI');

      expect(results[0].title).toBe('AI 뉴스');
      expect(results[0].link).toBe('https://example.com/ai');
      expect(results[0].snippet).toBe('AI 관련 뉴스 요약');
    });

    it('shouldExtractPublishedDateFromMetatags: metatags에서 publishedDate를 추출한다', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              title: 'AI 뉴스',
              link: 'https://example.com/ai',
              snippet: '요약',
              pagemap: {
                metatags: [
                  { 'article:published_time': '2026-03-10T09:00:00Z' },
                ],
              },
            },
          ],
        }),
      } as Response);

      const results = await service.search('AI');

      expect(results[0].publishedDate).toBe('2026-03-10T09:00:00Z');
    });

    it('shouldExtractThumbnailFromCseImage: pagemap.cse_image에서 thumbnail URL을 추출한다', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              title: 'AI 뉴스',
              link: 'https://example.com/ai',
              snippet: '요약',
              pagemap: {
                cse_image: [{ src: 'https://example.com/thumb.jpg' }],
              },
            },
          ],
        }),
      } as Response);

      const results = await service.search('AI');

      expect(results[0].thumbnailUrl).toBe('https://example.com/thumb.jpg');
    });

    it('shouldFallbackToOgImageForThumbnail: cse_image 없을 때 og:image에서 thumbnail을 추출한다', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              title: 'AI 뉴스',
              link: 'https://example.com/ai',
              snippet: '요약',
              pagemap: {
                metatags: [{ 'og:image': 'https://example.com/og.jpg' }],
              },
            },
          ],
        }),
      } as Response);

      const results = await service.search('AI');

      expect(results[0].thumbnailUrl).toBe('https://example.com/og.jpg');
    });

    it('shouldExtractPublisherFromOgSiteName: og:site_name에서 publisher를 추출한다', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              title: 'AI 뉴스',
              link: 'https://example.com/ai',
              snippet: '요약',
              pagemap: {
                metatags: [{ 'og:site_name': '테크뉴스' }],
              },
            },
          ],
        }),
      } as Response);

      const results = await service.search('AI');

      expect(results[0].publisher).toBe('테크뉴스');
    });

    it('shouldFallbackToDisplayLinkForPublisher: og:site_name 없을 때 displayLink를 publisher로 사용한다', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              title: 'AI 뉴스',
              link: 'https://example.com/ai',
              snippet: '요약',
              displayLink: 'example.com',
            },
          ],
        }),
      } as Response);

      const results = await service.search('AI');

      expect(results[0].publisher).toBe('example.com');
    });

    it('shouldReturnEmptyArrayWhenNoResults: 검색 결과가 없으면 빈 배열을 반환한다', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      const results = await service.search('없는키워드');

      expect(results).toEqual([]);
    });

    it('shouldSetNullForMissingOptionalFields: thumbnail, publisher, publishedDate 없으면 null로 설정한다', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              title: 'AI 뉴스',
              link: 'https://example.com/ai',
              snippet: '요약',
            },
          ],
        }),
      } as Response);

      const results = await service.search('AI');

      expect(results[0].thumbnailUrl).toBeNull();
      expect(results[0].publisher).toBeNull();
      expect(results[0].publishedDate).toBeNull();
    });
  });

  describe('Phase 7: 에러 핸들링', () => {
    it('shouldThrowQuotaExceededErrorOn429: HTTP 429 응답 시 QuotaExceededException을 던진다', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as Response);

      await expect(service.search('AI')).rejects.toThrow(QuotaExceededException);
    });

    it('shouldThrowOnApiError: 기타 API 에러(4xx, 5xx) 시 적절한 에러를 던진다', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(service.search('AI')).rejects.toThrow('Google CSE API error: 500');
    });

    it('shouldThrowOnNetworkError: 네트워크 에러 시 적절한 에러를 던진다', async () => {
      fetchSpy.mockRejectedValue(new TypeError('fetch failed'));

      await expect(service.search('AI')).rejects.toThrow('fetch failed');
    });
  });

  describe('Settings 연동', () => {
    it('shouldUseCustomResultsPerKeyword: options.resultsPerKeyword=5일 때 num=5, 1페이지만 호출', async () => {
      await service.search('AI', { resultsPerKeyword: 5 });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('num=5');
    });

    it('shouldUseCustomDateRestrict: options.dateRestrict가 API 호출에 반영', async () => {
      await service.search('AI', { dateRestrict: 'd3' });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('dateRestrict=d3');
    });

    it('shouldUseCustomNewsSites: options.newsSites 배열이 site: 쿼리에 반영', async () => {
      await service.search('AI', { newsSites: ['custom.com', 'news.kr'] });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain(encodeURIComponent('site:custom.com'));
      expect(url).toContain(encodeURIComponent('site:news.kr'));
    });

    it('shouldUseDefaultsWhenNoOptions: options 없으면 기존 기본값 사용', async () => {
      await service.search('AI');

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('dateRestrict=w1');
      expect(url).toContain('num=10');
    });

    it('shouldFetchTwoPagesWhenResultsPerKeyword20: resultsPerKeyword=20일 때 2페이지 호출', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: Array(10).fill({
            title: 'News', link: 'https://example.com', snippet: 'text',
          }),
        }),
      } as Response);

      await service.search('AI', { resultsPerKeyword: 20 });

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      const url1 = fetchSpy.mock.calls[0][0] as string;
      const url2 = fetchSpy.mock.calls[1][0] as string;
      expect(url1).toContain('start=1');
      expect(url2).toContain('start=11');
    });
  });
});
