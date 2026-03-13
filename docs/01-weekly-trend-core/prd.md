# PRD: 주간동향 뉴스 수집 및 요약 시스템

**Author**: weekly-trend team
**Created**: 2026-03-13
**Status**: Draft

---

## 1. Problem Statement

### Background

기존 주간동향 서비스(Weekly-Newsletter-Summary)는 Python + Selenium 기반으로 Google News RSS와 Naver News를 크롤링하여 GPT-4o-mini로 요약 후 이메일로 발송하는 시스템이다. 현재 이를 NestJS + React 기반 TypeScript 모노레포로 마이그레이션하며, LLM은 Google Gemini API로 전환하는 프로젝트가 진행 중이다.

### Problem

기존 시스템의 핵심 문제:

1. **Selenium 의존성**: Chrome + ChromeDriver가 필수이며, Docker 환경에서 설정이 복잡하고 DOM 변경 시 크롤러가 깨짐
2. **불안정한 크롤링**: 네이버 뉴스 Selenium 스크롤 방식은 느리고(기사당 수 초), 타임아웃과 실패가 빈발
3. **이중 크롤링 로직**: Google News RSS + Naver News 각각 별도 구현으로 유지보수 비용 증가
4. **본문 추출 병목**: 모든 기사에 대해 Selenium으로 페이지를 로드하여 본문을 추출하므로 전체 파이프라인이 수십 분 소요
5. **테스트 부재**: 단위/통합 테스트가 전혀 없어 변경 시 안정성 보장 불가
6. **보안 취약점**: SMTP 자격증명 하드코딩, 내부 IP 하드코딩

### Impact

이 문제를 해결하지 않으면:
- Docker 컨테이너 환경에서 안정적 배포 불가
- 크롤링 실패 시 전체 파이프라인 중단
- 새로운 뉴스 소스 추가 시 별도 크롤러 구현 필요
- 운영 안정성 및 유지보수성 지속 저하

---

## 2. Goals & Success Metrics

### Primary Goal

Google Custom Search API 기반의 안정적이고 확장 가능한 뉴스 수집·요약·배포 시스템을 NestJS + React 기술스택으로 구축한다.

### Success Metrics

| Metric | Current (기존 Python) | Target |
|--------|----------------------|--------|
| 뉴스 수집 소요 시간 | ~30분 (Selenium 기반) | < 2분 (API 기반) |
| 외부 의존성 | Chrome, ChromeDriver, newspaper3k | Google Custom Search API + Gemini API만 |
| 테스트 커버리지 | 0% | >= 80% (핵심 서비스) |
| 크롤링 실패율 | 높음 (DOM 변경, 타임아웃) | < 1% (API 안정성) |
| Docker 배포 복잡도 | Chrome 설치 필요 | HTTP 요청만으로 동작 |

---

## 3. User Stories

### Must Have (P0)

- [ ] 관리자로서, 카테고리와 키워드를 등록/수정/삭제할 수 있어야 한다 — 뉴스 검색 범위를 관리하기 위해
- [ ] 시스템으로서, 등록된 키워드로 Google Custom Search API를 호출하여 뉴스를 수집할 수 있어야 한다 — 주간 동향 데이터를 확보하기 위해
- [ ] 시스템으로서, 수집된 뉴스를 LLM(Gemini API)으로 요약할 수 있어야 한다 — 핵심 내용을 빠르게 파악하기 위해
- [ ] 관리자로서, 수집된 뉴스 목록과 요약 결과를 웹 UI에서 조회할 수 있어야 한다 — 결과를 검토하기 위해
- [ ] 시스템으로서, 주간 단위로 자동 실행될 수 있어야 한다 — 수동 개입 없이 정기 보고서를 생성하기 위해

### Should Have (P1)

- [ ] 관리자로서, 제외 키워드를 설정할 수 있어야 한다 — 불필요한 뉴스를 필터링하기 위해
- [ ] 관리자로서, 요약 결과를 이메일로 발송할 수 있어야 한다 — 팀에 주간 동향을 공유하기 위해
- [ ] 관리자로서, 수집 결과를 CSV로 내보낼 수 있어야 한다 — 외부 보고서 작성에 활용하기 위해

### Could Have (P2)

- [ ] 관리자로서, LLM 모델을 선택할 수 있어야 한다 — 비용/품질 트레이드오프를 조절하기 위해
- [ ] 시스템으로서, 유사 기사를 클러스터링할 수 있어야 한다 — 중복 기사를 그룹화하기 위해
- [ ] 관리자로서, Slack 등 추가 알림 채널을 설정할 수 있어야 한다 — 다양한 방식으로 결과를 배포하기 위해

---

## 4. Functional Requirements

### FR-1: 카테고리/키워드 관리 (CRUD)

**Description**: 관리자가 뉴스 수집 대상 카테고리와 키워드를 관리할 수 있다.

**Acceptance Criteria**:
- [ ] 카테고리 생성/조회/수정/삭제 API가 동작한다
- [ ] 키워드 생성/조회/수정/삭제 API가 동작한다 (카테고리에 종속)
- [ ] 제외 키워드 생성/조회/삭제 API가 동작한다
- [ ] 카테고리 삭제 시 하위 키워드도 함께 삭제된다
- [ ] 중복 카테고리명, 중복 키워드 생성 시 적절한 에러를 반환한다

**Edge Cases**:
- 키워드가 0개인 카테고리로 수집 실행 시: 해당 카테고리 건너뛰기
- 카테고리가 0개일 때 수집 실행 시: 빈 결과 반환 (에러 아님)

### FR-2: 뉴스 수집 (Google Custom Search API)

**Description**: 등록된 키워드별로 Google Custom Search API를 호출하여 뉴스 기사를 수집한다.

**Acceptance Criteria**:
- [ ] 키워드별로 Google Custom Search API를 호출하여 검색 결과를 가져온다
- [ ] `dateRestrict` 파라미터로 최근 7일 이내 기사만 수집한다
- [ ] 검색 결과에서 title, link, snippet, publishedDate, thumbnail(og:image)을 추출한다
- [ ] `site:news.naver.com` 등 사이트 제한 검색을 지원한다
- [ ] 동일 기사 중복 수집을 방지한다 (title + link 기준 unique)
- [ ] API 호출 실패 시 해당 키워드를 건너뛰고 다음 키워드로 계속 진행한다
- [ ] 수집된 뉴스를 DB에 저장한다

**Edge Cases**:
- API 할당량 초과 시: 에러 로깅 후 수집 중단, 이미 수집된 데이터는 유지
- 검색 결과 0건인 키워드: 정상 처리 (빈 결과)
- `pagemap`에 `og:image`가 없는 결과: thumbnail을 null로 저장

### FR-3: 뉴스 본문 추출 (선택적)

**Description**: 수집된 뉴스 URL에서 본문 텍스트를 추출한다. snippet만으로 요약이 충분하면 본문 추출을 건너뛸 수 있다.

**Acceptance Criteria**:
- [ ] HTTP GET + HTML 파싱(cheerio)으로 본문을 추출한다 (Selenium 불필요)
- [ ] 본문 추출 실패 시 snippet을 fallback으로 사용한다
- [ ] 본문 추출 여부를 설정으로 on/off 할 수 있다
- [ ] 추출된 본문은 DB의 news.content 필드에 저장한다

**Edge Cases**:
- robots.txt로 차단된 사이트: snippet fallback 사용
- 페이지 로드 타임아웃 (5초): snippet fallback 사용
- HTML에 본문이 없는 경우 (SPA 등): snippet fallback 사용

### FR-4: LLM 뉴스 요약

**Description**: 수집된 뉴스(snippet 또는 본문)를 Gemini API로 요약한다.

**Acceptance Criteria**:
- [ ] Google Gemini API(gemini-2.0-flash)를 호출하여 뉴스를 한국어로 요약한다
- [ ] `@google/genai` SDK를 사용하여 API를 호출한다
- [ ] 요약 결과(250자 이내)를 DB에 저장한다
- [ ] API 사용량 메타데이터(토큰 수, 모델명, 처리시간)를 기록한다
- [ ] 개별 기사 요약 실패 시 해당 기사를 건너뛰고 계속 진행한다
- [ ] 이미 요약된 기사는 재요약하지 않는다

**Edge Cases**:
- Gemini API rate limit (무료: 15 RPM, 100만 TPM): 지수 백오프 재시도 (최대 3회)
- 본문/snippet이 빈 문자열인 기사: 건너뛰기
- 토큰 제한 초과 본문: 앞부분 truncate 후 요약

### FR-5: 스케줄링

**Description**: 뉴스 수집 + 요약 파이프라인을 주기적으로 자동 실행한다.

**Acceptance Criteria**:
- [ ] NestJS cron 데코레이터로 주간 스케줄을 설정할 수 있다
- [ ] 수동 실행 API(`POST /pipeline/run`)도 제공한다
- [ ] 파이프라인 실행 상태(진행중/완료/실패)를 조회할 수 있다
- [ ] 동시에 2개 이상의 파이프라인이 실행되지 않는다

**Edge Cases**:
- 스케줄 실행 중 서버 재시작: 실행 상태를 "failed"로 마킹
- 이전 실행이 아직 진행 중일 때 스케줄 트리거: 건너뛰기

### FR-6: 결과 조회 UI

**Description**: 수집된 뉴스와 요약 결과를 웹 UI에서 조회한다.

**Acceptance Criteria**:
- [ ] 카테고리별 뉴스 목록을 조회할 수 있다
- [ ] 뉴스 제목, 출처, 발행일, 요약, 썸네일을 표시한다
- [ ] 날짜 범위로 필터링할 수 있다
- [ ] 키워드로 검색할 수 있다

**Edge Cases**:
- 데이터가 없는 경우: "수집된 뉴스가 없습니다" 빈 상태 표시
- 썸네일이 없는 기사: 기본 플레이스홀더 이미지 표시

### FR-7: 이메일 발송 (P1)

**Description**: 요약 결과를 HTML 이메일로 발송한다.

**Acceptance Criteria**:
- [ ] 카테고리별로 그룹핑된 HTML 이메일 템플릿을 생성한다
- [ ] SMTP(nodemailer)로 지정된 수신자 목록에 발송한다
- [ ] 발송 이력(일시, 수신자, 성공/실패)을 기록한다
- [ ] SMTP 자격증명은 환경변수로만 관리한다

**Edge Cases**:
- SMTP 서버 연결 실패: 재시도 1회 후 실패 로깅
- 수신자 목록이 비어있을 때: 발송하지 않고 경고 로그

### FR-8: CSV 내보내기 (P1)

**Description**: 수집/요약 결과를 CSV 파일로 내보낸다.

**Acceptance Criteria**:
- [ ] 날짜 범위 지정하여 CSV 다운로드 API를 제공한다
- [ ] 컬럼: category, keyword, title, link, summary, published_date, publisher, thumbnail
- [ ] UTF-8 BOM 인코딩 (Excel 호환)
- [ ] 프론트엔드에서 다운로드 버튼으로 호출한다

---

## 5. Non-Functional Requirements

### Performance
- 전체 수집 파이프라인(키워드 10개 기준): < 2분
- API 응답 시간 (목록 조회): < 500ms
- Google Custom Search API 호출: 쿼리당 < 1초

### Security
- 모든 API 키 및 자격증명은 환경변수로만 관리
- SMTP 비밀번호, Gemini API 키, Google CSE API 키를 코드에 하드코딩하지 않음
- `.env` 파일은 `.gitignore`에 포함

### Reliability
- 개별 기사 수집/요약 실패가 전체 파이프라인을 중단시키지 않음
- 파이프라인 실행 로그를 DB에 기록하여 장애 추적 가능
- API 할당량 소진 시 graceful degradation (이미 수집된 데이터 보존)

---

## 6. Technical Considerations

### Existing Patterns
- NestJS 11 모듈 아키텍처 (Module → Controller → Service)
- Prisma 7.4 ORM (PostgreSQL)
- React 19 + Vite 7 + Zustand 5 + Tailwind CSS 4
- Docker Compose 기반 개발/배포
- TDD 워크플로우 (Jest/Vitest)

### Dependencies
- **Google Custom Search JSON API**: 뉴스 검색 (일 100쿼리 무료, $5/1000쿼리)
- **Google Gemini API** (`@google/genai`): gemini-2.0-flash 요약 (무료 tier: 15 RPM, 100만 TPM)
- **nodemailer**: SMTP 이메일 발송
- **cheerio**: HTML 파싱 (선택적 본문 추출)
- **@nestjs/schedule**: cron 기반 스케줄링

### Constraints
- Google Custom Search API 무료 할당량: 일 100쿼리 (쿼리당 최대 10건 결과)
- 주 1회 실행 기준: 키워드 10개 × 1~2쿼리 = 약 20쿼리 (무료 범위 내)
- Programmable Search Engine(CSE) 설정 필요: Google Cloud Console에서 생성
- Gemini API 무료 tier: 15 RPM, 100만 TPM, 1500 RPD — 주간 배치(기사 ~100건)에 충분

### DB Schema (Prisma)

```prisma
model Category {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  keywords  Keyword[]
  filterKeywords FilterKeyword[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Keyword {
  id         Int      @id @default(autoincrement())
  text       String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId Int
  createdAt  DateTime @default(now())

  @@unique([categoryId, text])
}

model FilterKeyword {
  id         Int      @id @default(autoincrement())
  text       String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId Int
  createdAt  DateTime @default(now())

  @@unique([categoryId, text])
}

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
  clusterId       String?
  pipelineRun     PipelineRun? @relation(fields: [pipelineRunId], references: [id])
  pipelineRunId   Int?
  createdAt       DateTime     @default(now())
  summary         Summary?

  @@unique([title, link])
}

model Summary {
  id          Int      @id @default(autoincrement())
  newsId      Int      @unique
  news        News     @relation(fields: [newsId], references: [id], onDelete: Cascade)
  text        String
  createdAt   DateTime @default(now())
  meta        SummaryMeta?
}

model SummaryMeta {
  id             Int      @id @default(autoincrement())
  summaryId      Int      @unique
  summary        Summary  @relation(fields: [summaryId], references: [id], onDelete: Cascade)
  inputTokens    Int
  outputTokens   Int
  model          String
  processingMs   Int
  createdAt      DateTime @default(now())
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

### API Endpoints (예상)

```
# Category/Keyword Management
GET    /categories
POST   /categories
PATCH  /categories/:id
DELETE /categories/:id
GET    /categories/:id/keywords
POST   /categories/:id/keywords
DELETE /keywords/:id
POST   /categories/:id/filter-keywords
DELETE /filter-keywords/:id

# News & Summary
GET    /news                    # 목록 조회 (필터링, 페이지네이션)
GET    /news/:id                # 상세 조회 (요약 포함)
GET    /news/export/csv         # CSV 다운로드

# Pipeline
POST   /pipeline/run            # 수동 실행
GET    /pipeline/runs            # 실행 이력
GET    /pipeline/runs/:id        # 실행 상태 상세

# Email
POST   /email/send              # 이메일 발송
```

---

## 7. Out of Scope

이 PRD에서 명시적으로 제외하는 항목:

- **사용자 인증/권한 관리**: 현재는 단일 관리자 사용 전제
- **실시간 뉴스 모니터링**: 주간 배치 실행만 지원
- **뉴스 기사 클러스터링 (P2)**: 초기 버전에서는 제외, 추후 별도 PRD
- **Slack/Webhook 알림 (P2)**: 이메일 발송 구현 후 별도 PRD
- **LLM 모델 선택 UI (P2)**: 초기에는 gemini-2.0-flash 고정
- **다국어 지원**: 한국어 뉴스만 대상
- **뉴스 소스 플러그인 시스템**: Google Custom Search API 단일 소스로 시작
- **모바일 반응형 UI**: 데스크톱 우선

---

## 8. Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Google Cloud Console에서 CSE(Programmable Search Engine) 생성 및 API 키 발급 완료 여부? | 관리자 | 구현 전 | |
| snippet만으로 요약 품질이 충분한지, 본문 추출이 필수인지? | 팀 | Phase 2 전 | 초기에는 snippet 기반으로 시작, 품질 평가 후 결정 |
| 이메일 수신자 목록 관리를 DB로 할지, 환경변수로 할지? | 팀 | Phase 3 전 | |
| Gemini API 키 발급 완료 여부? (Google AI Studio에서 발급) | 관리자 | Phase 3 전 | |
| 기존 DB 데이터 마이그레이션 필요 여부? | 팀 | 구현 전 | |

---

## Appendix

### 기존 시스템 → 신규 시스템 매핑

| 기존 (Python) | 신규 (NestJS/React) |
|---------------|---------------------|
| `app/core/rss.py` (Selenium + RSS) | `SearchService` (Google Custom Search API) |
| `app/core/llm.py` (OpenAI 직접 호출) | `SummaryService` (Gemini API via `@google/genai`) |
| `app/core/crud.py` (SQLAlchemy) | Prisma ORM + NestJS Services |
| `app/core/smtp.py` (Gmail SMTP) | `EmailService` (nodemailer) |
| `app/core/schedule.py` (crontab) | `@nestjs/schedule` cron decorator |
| `app/core/clustering.py` (DBSCAN) | P2: 별도 구현 예정 |
| `app/core/driver.py` (Selenium) | **제거** — API 기반으로 대체 |
| `app/core/utils.py` (썸네일 다운로드) | **제거** — og:image URL 직접 사용 |
| `app/pages/` (Streamlit UI) | React SPA (user-client) |
| `cdn/main.py` (FastAPI 썸네일 서버) | **제거** — og:image URL 직접 사용 |
| `alembic/` (DB 마이그레이션) | Prisma Migrate |

### 구현 Phase 개요

```
Phase 1: 카테고리/키워드 CRUD (API + DB)
Phase 2: 뉴스 수집 (Google Custom Search API)
Phase 3: LLM 요약 (Gemini API)
Phase 4: 결과 조회 UI (React)
Phase 5: 스케줄링 + 파이프라인 관리
Phase 6: 이메일 발송 + CSV 내보내기
```

### Related Documents
- 기존 소스 분석: `old_source/Weekly-Newsletter-Summary/`
- 프로젝트 설정: `CLAUDE.md`
