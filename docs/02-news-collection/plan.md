# TDD Plan: 뉴스 수집 파이프라인

**PRD**: `docs/02-news-collection/prd.md`
**Created**: 2026-03-14
**Status**: Complete

---

## Phase 0: Setup

### Setup Tasks:
- [x] Prisma 스키마에 News, PipelineRun 모델 추가
- [x] `prisma generate` 실행
- [x] PrismaService에 news, pipelineRun 접근자 추가
- [x] NewsModule, NewsController, NewsService 스캐폴드 생성
- [x] PipelineModule, PipelineController, PipelineService 스캐폴드 생성
- [x] GoogleSearchService 스캐폴드 생성 (외부 API 호출 분리)
- [x] DTO 파일 생성 (news-query.dto)
- [x] AppModule에 NewsModule, PipelineModule import
- [x] 환경변수 추가: GOOGLE_CSE_API_KEY, GOOGLE_CSE_ID, PUBLISHER_BLACKLIST
- [x] 테스트 파일 생성 및 빈 describe 블록 확인

---

# Backend (TDD)

## Phase 1: GoogleSearchService — API 호출 및 데이터 추출

**Test File**: `apps/api-server/src/news/google-search.service.spec.ts`
**Impl File**: `apps/api-server/src/news/google-search.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- google-search.service.spec.ts`

### Tests:
- [x] shouldCallGoogleCSEApiWithCorrectParams: 키워드, API key, CSE ID, dateRestrict=w1 파라미터로 API를 호출한다
- [x] shouldExtractTitleLinkSnippetFromResults: 검색 결과에서 title, link, snippet을 추출한다
- [x] shouldExtractPublishedDateFromMetatags: metatags에서 publishedDate를 추출한다
- [x] shouldExtractThumbnailFromCseImage: pagemap.cse_image에서 thumbnail URL을 추출한다
- [x] shouldFallbackToOgImageForThumbnail: cse_image 없을 때 og:image에서 thumbnail을 추출한다
- [x] shouldExtractPublisherFromOgSiteName: og:site_name에서 publisher를 추출한다
- [x] shouldFallbackToDisplayLinkForPublisher: og:site_name 없을 때 displayLink를 publisher로 사용한다
- [x] shouldReturnEmptyArrayWhenNoResults: 검색 결과가 없으면 빈 배열을 반환한다
- [x] shouldSetNullForMissingOptionalFields: thumbnail, publisher, publishedDate 없으면 null로 설정한다

---

## Phase 2: NewsService — 필터링 로직

**Test File**: `apps/api-server/src/news/news.service.spec.ts`
**Impl File**: `apps/api-server/src/news/news.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- news.service.spec.ts`

### Tests:
- [x] shouldFilterByFilterKeywordsInTitle: 제외 키워드가 제목에 포함된 결과를 필터링한다
- [x] shouldFilterByFilterKeywordsInSnippet: 제외 키워드가 snippet에 포함된 결과를 필터링한다
- [x] shouldFilterByPublisherBlacklist: 출판사 블랙리스트에 해당하는 결과를 필터링한다
- [x] shouldReturnUnfilteredWhenNoFilterKeywords: 제외 키워드가 없으면 전체 결과를 반환한다
- [x] shouldReturnUnfilteredWhenNoBlacklist: 블랙리스트가 비어있으면 전체 결과를 반환한다
- [x] shouldFilterCaseInsensitive: 대소문자 구분 없이 필터링한다

---

## Phase 3: NewsService — 뉴스 저장 및 중복 방지

**Test File**: `apps/api-server/src/news/news.service.spec.ts`
**Impl File**: `apps/api-server/src/news/news.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- news.service.spec.ts`

### Tests:
- [x] shouldSaveNewsWithCorrectFields: keyword, categoryId, collectionType, pipelineRunId를 포함하여 저장한다
- [x] shouldSkipDuplicateNews: title+link 중복 기사는 건너뛰고 신규만 저장한다 (skipDuplicates)
- [x] shouldReturnSavedNewsCount: 저장된 신규 기사 수를 반환한다

---

## Phase 4: NewsService — 뉴스 조회 API

**Test File**: `apps/api-server/src/news/news.service.spec.ts`
**Impl File**: `apps/api-server/src/news/news.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- news.service.spec.ts`

### Tests:
- [x] shouldFindNewsPaginated: page, limit으로 뉴스 목록을 페이지네이션하여 반환한다
- [x] shouldFilterNewsByCategoryId: categoryId로 필터링된 뉴스 목록을 반환한다
- [x] shouldFilterNewsByDateRange: 날짜 범위로 필터링된 뉴스 목록을 반환한다
- [x] shouldFindNewsById: id로 뉴스 상세를 반환한다
- [x] shouldThrowNotFoundWhenNewsNotExists: 존재하지 않는 뉴스 조회 시 404를 던진다

---

## Phase 5: PipelineService — 파이프라인 실행 오케스트레이션

**Test File**: `apps/api-server/src/pipeline/pipeline.service.spec.ts`
**Impl File**: `apps/api-server/src/pipeline/pipeline.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- pipeline.service.spec.ts`

### Tests:
- [x] shouldCreatePipelineRunWithRunningStatus: 실행 시작 시 status="running" PipelineRun 레코드를 생성한다
- [x] shouldCollectNewsForAllCategoriesAndKeywords: 모든 카테고리의 키워드에 대해 뉴스를 수집한다
- [x] shouldSkipCategoriesWithNoKeywords: 키워드가 0개인 카테고리는 건너뛴다
- [x] shouldUpdateStatusToCompletedOnSuccess: 수집 완료 시 status="completed", completedAt, totalNews를 기록한다
- [x] shouldUpdateStatusToFailedOnError: 수집 실패 시 status="failed", errorLog를 기록한다
- [x] shouldPreserveCollectedDataOnQuotaExceeded: API 429 에러 시 수집을 중단하되 이미 수집된 데이터는 유지한다
- [x] shouldSkipFailedKeywordAndContinue: 개별 키워드 API 호출 실패 시 해당 키워드만 건너뛰고 계속 진행한다
- [x] shouldCompleteWithZeroNewsWhenNoCategories: 카테고리가 0개이면 totalNews=0으로 completed한다

---

## Phase 6: PipelineService — 동시 실행 방지 및 이력 관리

**Test File**: `apps/api-server/src/pipeline/pipeline.service.spec.ts`
**Impl File**: `apps/api-server/src/pipeline/pipeline.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- pipeline.service.spec.ts`

### Tests:
- [x] shouldThrowConflictWhenPipelineAlreadyRunning: running 상태인 PipelineRun이 있으면 409를 던진다
- [x] shouldFindAllPipelineRuns: 실행 이력 목록을 최근순으로 반환한다
- [x] shouldFindPipelineRunByIdWithNews: id로 실행 상세를 수집된 뉴스 포함하여 반환한다
- [x] shouldThrowNotFoundWhenPipelineRunNotExists: 존재하지 않는 PipelineRun 조회 시 404를 던진다

---

## Phase 7: GoogleSearchService — 에러 핸들링

**Test File**: `apps/api-server/src/news/google-search.service.spec.ts`
**Impl File**: `apps/api-server/src/news/google-search.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- google-search.service.spec.ts`

### Tests:
- [x] shouldThrowQuotaExceededErrorOn429: HTTP 429 응답 시 QuotaExceededException을 던진다
- [x] shouldThrowOnApiError: 기타 API 에러(4xx, 5xx) 시 적절한 에러를 던진다
- [x] shouldThrowOnNetworkError: 네트워크 에러 시 적절한 에러를 던진다

---

## Phase 8: Controller HTTP 계층 — News

**Test File**: `apps/api-server/src/news/news.controller.spec.ts`
**Impl File**: `apps/api-server/src/news/news.controller.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- news.controller.spec.ts`

### Tests:
- [x] shouldCallFindNewsPaginatedWithQuery: GET /news 요청 시 service.findNewsPaginated를 올바른 쿼리 파라미터로 호출한다
- [x] shouldCallFindNewsById: GET /news/:id 요청 시 service.findNewsById를 호출한다

---

## Phase 9: Controller HTTP 계층 — Pipeline

**Test File**: `apps/api-server/src/pipeline/pipeline.controller.spec.ts`
**Impl File**: `apps/api-server/src/pipeline/pipeline.controller.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- pipeline.controller.spec.ts`

### Tests:
- [x] shouldCallRunPipeline: POST /pipeline/run 요청 시 service.runPipeline을 호출한다
- [x] shouldCallFindAllPipelineRuns: GET /pipeline/runs 요청 시 service.findAllRuns를 호출한다
- [x] shouldCallFindPipelineRunById: GET /pipeline/runs/:id 요청 시 service.findRunById를 호출한다

---

## Progress Summary

| Section | Phase | Total | Done | Status |
|---------|-------|-------|------|--------|
| Setup | 0 | 10 | 10 | Complete |
| Backend (TDD) | 1-9 | 42 | 42 | Complete |
| **Total** | - | **52** | **52** | **100%** |

---

## Notes

- 이 Phase는 백엔드 API만 포함 (프론트엔드 UI는 Phase 04-news-ui)
- GoogleSearchService를 별도로 분리하여 외부 API 호출을 mock 가능하게 한다
- NestJS HttpModule(axios) 대신 Node.js 내장 fetch 사용 (의존성 최소화)
- `PUBLISHER_BLACKLIST` 환경변수는 쉼표 구분 문자열
- API 429 처리: QuotaExceededException 커스텀 에러로 구분, PipelineService에서 catch하여 graceful 종료
- Prisma `createMany({ skipDuplicates: true })`로 중복 방지
- PipelineRun.totalSummaries는 Phase 3에서 활용 (이 Phase에서는 0 유지)
