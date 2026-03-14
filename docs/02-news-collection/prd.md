# PRD: Phase 2 — 뉴스 수집 파이프라인 (Google Custom Search API)

**Parent PRD**: `docs/01-weekly-trend-core/prd.md`
**Author**: weekly-trend team
**Created**: 2026-03-13
**Updated**: 2026-03-13
**Status**: Draft
**Depends on**: Phase 1 (카테고리/키워드 CRUD)

---

## 1. Problem Statement

등록된 카테고리/키워드를 기반으로 Google Custom Search API를 호출하여 뉴스 기사를 수집하고 DB에 저장해야 한다. 기존 Selenium 기반 크롤링을 API 호출로 대체하여 안정성과 속도를 확보한다.

수집은 파이프라인 단위로 실행되며, 실행 이력을 추적한다. 이후 Phase 3에서 요약 단계가 파이프라인에 추가된다.

### Prerequisites

- Phase 1 완료 (Category, Keyword, FilterKeyword 모델 및 CRUD)
- Google Cloud Console에서 Custom Search Engine(CSE) 생성 및 API 키 발급
- 환경변수: `GOOGLE_CSE_API_KEY`, `GOOGLE_CSE_ID`

---

## 2. Functional Requirements

### FR-1: Google Custom Search API 호출

**Description**: 키워드별로 Google Custom Search JSON API를 호출하여 뉴스 검색 결과를 가져온다.

**Acceptance Criteria**:
- [ ] 각 키워드에 대해 Google Custom Search API를 호출한다
- [ ] `dateRestrict=w1` 파라미터로 최근 7일 이내 결과만 수집한다
- [ ] 검색 결과에서 title, link, snippet, publishedDate를 추출한다
- [ ] `pagemap.cse_image` 또는 `pagemap.metatags[0].og:image`에서 thumbnail URL을 추출한다
- [ ] `pagemap.metatags[0].og:site_name` 또는 `displayLink`에서 publisher를 추출한다

### FR-2: 뉴스 필터링

**Description**: 제외 키워드 및 출판사 블랙리스트로 저품질 결과를 필터링한다.

**Acceptance Criteria**:
- [ ] 제외 키워드(`FilterKeyword`)가 제목이나 snippet에 포함된 결과를 필터링한다
- [ ] 출판사 블랙리스트(`PUBLISHER_BLACKLIST` 환경변수)에 해당하는 결과를 필터링한다
- [ ] 필터링된 기사 수를 로깅한다

### FR-3: 뉴스 저장 및 중복 방지

**Description**: 수집된 뉴스를 DB에 저장하되, 중복을 방지한다.

**Acceptance Criteria**:
- [ ] 수집된 뉴스를 `News` 테이블에 저장한다
- [ ] `title + link` 기준 unique 제약으로 중복 수집을 방지한다
- [ ] 중복 기사는 건너뛰고 신규 기사만 저장한다 (skipDuplicates)
- [ ] 저장 시 `keyword`, `categoryId`, `collectionType="google_cse"`, `pipelineRunId`를 기록한다

### FR-4: 파이프라인 실행 및 이력 관리

**Description**: 수집을 파이프라인 단위로 실행하고 상태를 추적한다.

**Acceptance Criteria**:
- [ ] `POST /pipeline/run` — 파이프라인 실행 (이 Phase에서는 수집만 수행)
- [ ] 실행 시작 시 `PipelineRun` 레코드 생성 (status: "running")
- [ ] 완료 시 status를 "completed"로 업데이트, `completedAt` 기록
- [ ] 실패 시 status를 "failed"로 업데이트, `errorLog`에 에러 메시지 기록
- [ ] 수집된 뉴스 수(`totalNews`)를 기록한다
- [ ] `GET /pipeline/runs` — 실행 이력 목록 (최근순)
- [ ] `GET /pipeline/runs/:id` — 실행 상세 (수집된 뉴스 목록 포함)
- [ ] 동시에 2개 이상의 파이프라인이 실행되지 않는다 (running 상태 체크, 409 Conflict)

### FR-5: 에러 핸들링 및 할당량 관리

**Description**: API 호출 실패나 할당량 초과 시 graceful하게 처리한다.

**Acceptance Criteria**:
- [ ] 개별 키워드 API 호출 실패 시 해당 키워드를 건너뛰고 다음으로 진행한다
- [ ] API 할당량 초과(HTTP 429) 시 수집을 중단하고 이미 수집된 데이터는 유지한다
- [ ] 모든 에러를 NestJS Logger로 로깅한다 (키워드, 에러 메시지, HTTP 상태코드)

### FR-6: 뉴스 조회 API

**Description**: 수집된 뉴스를 조회하는 API를 제공한다.

**Acceptance Criteria**:
- [ ] `GET /news` — 뉴스 목록 (페이지네이션, categoryId/날짜 필터링)
- [ ] `GET /news/:id` — 뉴스 상세 조회

---

## 3. Non-Functional Requirements: 로깅

- NestJS 내장 Logger를 사용한다
- 파이프라인 실행 시작/완료/실패를 로깅한다
- 키워드별 수집 결과(성공 건수, 필터링 건수, 에러)를 로깅한다
- 파이프라인 에러 로그는 `PipelineRun.errorLog`에도 저장한다

---

## 4. DB Schema Changes

기존 `schema.prisma`에 `News`, `PipelineRun` 모델 추가:

```prisma
model News {
  id              Int          @id @default(autoincrement())
  title           String
  link            String
  snippet         String?
  content         String?
  publisher       String?
  publishedDate   DateTime?
  thumbnailUrl    String?
  keyword         String
  categoryId      Int
  collectionType  String       @default("google_cse")
  pipelineRun     PipelineRun? @relation(fields: [pipelineRunId], references: [id])
  pipelineRunId   Int?
  createdAt       DateTime     @default(now())

  @@unique([title, link])
}

model PipelineRun {
  id             Int       @id @default(autoincrement())
  status         String    @default("running")  // running | completed | failed
  totalNews      Int       @default(0)
  totalSummaries Int       @default(0)
  errorLog       String?
  startedAt      DateTime  @default(now())
  completedAt    DateTime?
  news           News[]
}
```

> Note: `News.summary` 관계는 Phase 3에서 추가. `totalSummaries`는 Phase 3에서 활용.

---

## 5. API Endpoints

```
POST   /pipeline/run                    → 파이프라인 실행 (수집)
GET    /pipeline/runs                   → 실행 이력 목록
GET    /pipeline/runs/:id               → 실행 상세

GET    /news                            → 수집된 뉴스 목록 (페이지네이션, 필터링)
GET    /news/:id                        → 뉴스 상세 조회
```

---

## 6. Environment Variables (추가)

```
GOOGLE_CSE_API_KEY=        # Google Custom Search API key
GOOGLE_CSE_ID=             # Programmable Search Engine ID
PUBLISHER_BLACKLIST=       # 쉼표 구분 출판사 블랙리스트 (예: "이코노타임즈,코리아타임스")
```

---

## 7. Affected Code

### New Files (예상)
```
apps/api-server/src/news/
  news.module.ts
  news.controller.ts
  news.service.ts              — Google CSE 호출 + 필터링 + 저장 포함
  news.controller.spec.ts
  news.service.spec.ts
  dto/
    news-query.dto.ts
apps/api-server/src/pipeline/
  pipeline.module.ts
  pipeline.controller.ts
  pipeline.service.ts          — 파이프라인 실행 오케스트레이션
  pipeline.controller.spec.ts
  pipeline.service.spec.ts
```

### Existing Files
```
apps/api-server/prisma/schema.prisma    — News, PipelineRun 모델 추가
apps/api-server/src/app.module.ts       — NewsModule, PipelineModule import
```

---

## 8. Edge Cases

- 키워드가 0개인 카테고리: 건너뛰기 (수집하지 않음)
- 전체 카테고리가 0개일 때 수집 실행: 파이프라인 "completed" (totalNews=0)
- 검색 결과 0건인 키워드: 정상 처리
- `pagemap`에 thumbnail이 없는 결과: `thumbnailUrl = null`
- API 무료 할당량: 일 100쿼리 (주 1회 실행, 키워드 10개 기준 ~20쿼리로 충분)
- 동시 실행 요청: 409 Conflict 반환

---

## 9. Out of Scope

- LLM 요약 (Phase 3에서 파이프라인에 요약 단계 추가)
- 본문 추출 (snippet 기반 요약 품질 평가 후 별도 결정)
- cron 스케줄링 (Phase 5)
- 프론트엔드 UI (Phase 4)
- `site:news.naver.com` 등 사이트 제한 검색 — 키워드 자체에 포함하여 처리 (별도 설정 불필요)
