# PRD: 통합 설정 페이지

**Author**: weekly-trend team
**Created**: 2026-03-14
**Status**: Draft
**Depends on**: Phase 11 (뉴스레터 템플릿 커스터마이즈)

---

## 1. Problem Statement

### Background

현재 뉴스 수집 파이프라인의 핵심 파라미터들이 코드에 하드코딩되어 있다. 키워드당 수집 건수(20건), 검색 기간(1주일), 뉴스 사이트 목록(8개), 요약 길이(250자), LLM 모델(gemini-2.0-flash) 등을 변경하려면 코드 수정 및 재배포가 필요하다.

또한 Phase 11에서 구현한 뉴스레터 템플릿 설정이 미리보기 사이드패널에만 존재하여 접근성이 낮다.

### Problem

- 키워드 20~30개 사용 시 키워드당 20건 수집은 과다 (400~600건 + LLM 요약 비용)
- Google CSE 무료 할당량(일 100쿼리) 대비 30키워드 × 2페이지 = 60쿼리 소모
- 검색 기간, 사이트 목록, 요약 길이 등을 상황에 따라 조절할 수 없음
- 설정 변경마다 개발자의 코드 수정이 필요

### Impact

비개발자가 수집 규모와 품질을 상황에 맞게 조절할 수 없어, API 할당량 낭비와 불필요한 뉴스 과다 수집이 반복된다.

---

## 2. Goals & Success Metrics

### Primary Goal

코드 수정 없이 뉴스 수집 파이프라인과 뉴스레터 템플릿의 주요 설정을 UI에서 관리할 수 있게 한다.

### Success Metrics

| Metric | Target |
|--------|--------|
| UI에서 설정 가능한 항목 수 | 10개 이상 |
| 설정 변경 → 파이프라인 반영 | 즉시 (다음 실행부터) |

---

## 3. Functional Requirements

### FR-1: 설정 데이터 모델

**Description**: 앱 설정을 DB에 저장/조회하는 싱글톤 모델을 만든다.

**Acceptance Criteria**:
- [ ] `AppSettings` 모델에 뉴스 수집 관련 설정 저장
- [ ] 기존 `NewsletterTemplate` 모델은 유지하고 API/UI만 통합
- [ ] 설정 없이도 기존 기본값으로 동작 (하위 호환)

### FR-2: 설정 API

**Description**: 설정을 조회/저장하는 REST API를 제공한다.

**Acceptance Criteria**:
- [ ] `GET /settings` — 전체 설정 조회 (수집 + 뉴스레터 통합)
- [ ] `PUT /settings` — 설정 저장 (부분 업데이트 지원)
- [ ] 인증 필요 (JWT)
- [ ] 기본값이 존재하여 설정 없이도 동작
- [ ] 기존 `GET/PUT /newsletter/template` 엔드포인트 제거, `/settings`로 통합

### FR-3: 뉴스 수집 설정

**Description**: 파이프라인 실행 시 사용하는 수집 파라미터를 설정할 수 있다.

**Acceptance Criteria**:
- [ ] 키워드당 수집 건수: 5 / 10 / 20 중 선택 (기본값: 10)
- [ ] 검색 기간: 3일(`d3`) / 1주일(`w1`) / 2주일(`d14`) 중 선택 (기본값: `w1`)
- [ ] 뉴스 사이트 목록: 사이트 추가/삭제 가능 (기본값: 현재 8개 사이트)
- [ ] 요약 길이: 100~500자 범위 입력 (기본값: 250)
- [ ] LLM 모델: 드롭다운 선택 (기본값: `gemini-2.0-flash`)
- [ ] 파이프라인 실행 시 DB에서 설정을 읽어 적용

### FR-4: 설정 페이지 UI

**Description**: `/settings` 경로에 탭 기반 설정 페이지를 제공한다.

**Acceptance Criteria**:
- [ ] 탭 2개: "뉴스 수집" | "뉴스레터"
- [ ] 뉴스 수집 탭: FR-3의 모든 설정 항목 UI
- [ ] 뉴스레터 탭: 기존 TemplateSettings 내용 (로고URL, 헤더배경색, 배지색상, 푸터텍스트, 폰트)
- [ ] 각 탭별 "저장" 버튼
- [ ] 각 탭별 "기본값 복원" 버튼
- [ ] 저장 성공/실패 피드백
- [ ] Navbar에 "설정" 링크 추가

### FR-5: 기존 코드 연동

**Description**: 하드코딩된 값을 DB 설정으로 대체한다.

**Acceptance Criteria**:
- [ ] `GoogleSearchService.search()` — `num`, `dateRestrict`, `NEWS_SITES`를 설정에서 읽음
- [ ] `SummaryService` — 요약 길이, 모델명을 설정에서 읽음
- [ ] `PipelineService.executePipeline()` — 실행 시작 시 설정을 조회하여 각 서비스에 전달
- [ ] 설정 미존재 시 기존 하드코딩 값을 기본값으로 사용

---

## 4. Technical Considerations

### Schema

```prisma
model AppSettings {
  id                Int      @id @default(autoincrement())
  // 뉴스 수집
  resultsPerKeyword Int      @default(10)
  dateRestrict      String   @default("w1")
  newsSites         String   @default("zdnet.co.kr,www.etnews.com,www.bloter.net,www.mk.co.kr,www.chosun.com,www.hani.co.kr,www.donga.com,www.sedaily.com")
  summaryMaxLength  Int      @default(250)
  llmModel          String   @default("gemini-2.0-flash")
  // 뉴스레터 템플릿 (기존 NewsletterTemplate 통합)
  logoUrl           String?
  headerBgColor     String   @default("#e3edff")
  badgeColor        String   @default("#0047FF")
  footerText        String   @default("weekly-trend")
  fontFamily        String   @default("Noto Sans, Arial, sans-serif")
  updatedAt         DateTime @updatedAt
}
```

- `newsSites`는 쉼표 구분 문자열로 저장 (JSON 대비 단순)
- 기존 `NewsletterTemplate` 모델을 `AppSettings`에 통합하고, 기존 모델은 삭제
- Phase 11에서 만든 `newsletter-template.service.ts`, 관련 DTO, 테스트 파일 제거

### Affected Code

```
apps/api-server/src/
  settings/                          # 신규 모듈
    settings.controller.ts           # GET/PUT /settings
    settings.service.ts              # getSettings, upsertSettings
    dto/update-settings.dto.ts
  newsletter/
    newsletter-template.service.ts   # 삭제 (AppSettings로 통합)
    newsletter.controller.ts         # template 엔드포인트 제거
  news/google-search.service.ts      # 설정 파라미터 주입
  summary/summary.service.ts         # 요약 길이, 모델명 파라미터 주입
  pipeline/pipeline.service.ts       # 실행 시 설정 조회 → 서비스에 전달

apps/user-client/src/
  features/settings/                 # 신규
    SettingsPage.tsx
    components/CollectionSettings.tsx
    components/NewsletterSettings.tsx # 기존 TemplateSettings 리팩터링
    services/settingsApi.ts
    stores/settingsStore.ts
  features/newsletter/
    stores/templateStore.ts          # 삭제 (settingsStore로 통합)
    components/TemplateSettings.tsx   # 삭제 (NewsletterSettings로 대체)
    services/newsletterTemplateApi.ts # 삭제 (settingsApi로 통합)
    components/NewsletterPreview.tsx  # settingsStore 사용으로 변경
    services/newsletterHtml.ts       # settingsStore에서 defaults 임포트
  components/Navbar.tsx              # "설정" 링크 추가
  App.tsx                            # /settings 라우트 추가
```

### 설정 전달 방식

```
PipelineService.executePipeline(runId)
  → SettingsService.getSettings()
  → GoogleSearchService.search(keyword, { resultsPerKeyword, dateRestrict, newsSites })
  → SummaryService.summarizeByPipelineRun(runId, { summaryMaxLength, llmModel })
```

기존 서비스의 메서드 시그니처에 옵션 객체를 추가하여 설정을 전달한다.

---

## 5. Out of Scope

- 사용자별 개별 설정 (앱 전체 공유 설정 1개)
- 설정 이력/버전 관리
- 설정 import/export
- Google CSE API 키, SMTP 등 시크릿 관리 (env로 유지)
- 뉴스레터 미리보기 사이드패널의 TemplateSettings 제거 (설정 페이지와 병존 가능)
