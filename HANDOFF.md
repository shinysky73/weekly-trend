# 통합 설정 + 대시보드 개선 - Handoff Document

## Goal
뉴스 수집 파이프라인의 설정을 UI에서 관리하고, 대시보드를 개선하며, 뉴스레터 템플릿을 기존 소스와 동일하게 맞추는 작업.

## Current Progress

### What's Been Done

**Feature 11+12: 통합 설정 페이지**
- `AppSettings` 모델로 수집 설정 + 뉴스레터 템플릿 통합 (기존 `NewsletterTemplate` 삭제)
- `GET/PUT /api/settings` API (SettingsService 싱글톤 패턴)
- `/settings` 페이지 — 탭 2개 (뉴스 수집 | 뉴스레터)
- `GoogleSearchService.search(keyword, options?)` — resultsPerKeyword, dateRestrict, newsSites 주입
- `SummaryService.summarizeByPipelineRun(id, options?)` — summaryMaxLength, llmModel 주입
- `PipelineService`가 실행 시 설정 로드 → 각 서비스에 전달
- Navbar에 "설정" 링크 추가

**대시보드 개선**
- `GET /api/dashboard/stats` — 총 뉴스/요약/카테고리/키워드/발송 수 + 이번 주 수집 건수
- StatsCards 컴포넌트 (4개 통계 카드)
- PipelineRunButton + PipelineStatus 분리 (Zustand store로 상태 공유)
- PipelineHistory 테이블 개선 (소요시간 컬럼, dot 배지, 할당량 초과 태그)

**뉴스레터 템플릿**
- 기존 소스와 동일한 기본값 (헤더 로고, 푸터 로고, 푸터 텍스트)
- `footerLogoUrl` 필드 추가
- 기간 자동 계산 (뉴스 날짜 min~max → 헤더에 파란색 표시)
- 헤더 로고 우측 배치 (기존 레이아웃 재현)

**기타**
- 모든 API에 global `/api` prefix 적용 (`app.setGlobalPrefix('api')`)
- `axios.defaults.baseURL = '/api'` — Vite proxy `/api` 하나로 단순화
- 키워드 0개일 때 파이프라인 실행 차단 (400 BadRequest)
- News unique 제약조건 `@@unique([title, link])` → `@@unique([title, link, pipelineRunId])` (파이프라인 간 중복 허용)
- LLM 기본 모델 `gemini-2.0-flash` → `gemini-2.5-flash` 업데이트
- 실행 상세 페이지에 카테고리/키워드 필터 버튼 추가
- 요약 병렬 처리 (5개씩 배치, `Promise.allSettled`)

### What Worked
- Zustand store로 PipelineRunButton ↔ PipelineStatus 간 에러 상태 공유
- `app.setGlobalPrefix('api')`로 프론트 라우트(/settings)와 API 경로 충돌 해결
- `Promise.allSettled`로 병렬 요약 시 개별 실패 안전 처리

### What Didn't Work
- PipelinePanel을 두 컴포넌트로 분리할 때 `useState`로 에러 상태 관리 → 각 컴포넌트가 독립 hook 인스턴스를 가져 에러 메시지 미표시. Zustand store로 해결.
- `@@unique([title, link])` 전역 제약 → 파이프라인 간 동일 기사 수집 불가 문제. `pipelineRunId` 포함으로 해결.
- Vite proxy `/settings`가 프론트 라우트와 충돌 → global API prefix로 해결.

## Key Decisions
- `NewsletterTemplate` 모델을 `AppSettings`에 통합 (별도 모델 유지 대신) — 하나의 싱글톤으로 관리가 단순
- `newsSites`는 DB에 쉼표 구분 문자열, API 응답에서 배열로 변환 — JSON 컬럼 대비 단순
- 요약 병렬 동시성 5 (CONCURRENCY=5) — rate limit 고려한 보수적 값

## Files Changed

### Backend (api-server)
- `prisma/schema.prisma` — AppSettings 모델, News unique 제약 변경
- `src/main.ts` — `app.setGlobalPrefix('api')`
- `src/app.module.ts` — SettingsModule, DashboardModule 등록
- `src/settings/` — 신규 모듈 (service, controller, dto, specs)
- `src/dashboard/` — 신규 모듈 (service, controller, spec)
- `src/news/google-search.service.ts` — SearchOptions 파라미터 추가
- `src/summary/summary.service.ts` — SummaryOptions + 병렬 처리
- `src/pipeline/pipeline.service.ts` — 설정 로드 + 키워드 검증

### Frontend (user-client)
- `src/features/settings/` — 신규 (SettingsPage, CollectionSettings, NewsletterSettings, settingsApi, settingsStore)
- `src/features/pipeline/components/PipelinePanel.tsx` — RunButton + Status 분리
- `src/features/pipeline/components/PipelineHistory.tsx` — 테이블 개선
- `src/features/pipeline/components/StatsCards.tsx` — 신규
- `src/features/pipeline/hooks/useDashboardStats.ts` — 신규
- `src/features/pipeline/stores/pipelineStore.ts` — startError, justCompleted 추가
- `src/features/newsletter/services/newsletterHtml.ts` — 기간 자동 계산, 로고 배치, footerLogoUrl
- `src/features/newsletter/RunDetailPage.tsx` — 카테고리/키워드 필터
- `src/features/newsletter/components/NewsletterPreview.tsx` — settingsStore 연동
- `src/features/auth/services/apiClient.ts` — axios baseURL 설정
- `vite.config.ts` — proxy 단순화
- `src/pages/HomePage.tsx` — 대시보드 레이아웃 개편
- `src/App.tsx` — /settings 라우트
- `src/components/Navbar.tsx` — 설정 링크

## Test Status
- Backend: 136 tests passing (13 suites)
- Frontend: 73 tests passing (14 suites)

## Uncommitted Changes
- `apps/api-server/src/summary/summary.service.ts` — 요약 병렬 처리 (5개씩 배치)

## Next Steps
1. 미커밋 병렬 처리 변경 커밋
2. 요약 진행률을 UI에 표시 (현재 "요약 생성 중..."만 표시, 진행 건수 미반영)
3. 뉴스레터 발송 후 대시보드 stats 자동 갱신
4. 설정 변경 시 Gemini 모델 유효성 검증 (존재하지 않는 모델명 입력 방지)

## Resume Command
```
HANDOFF.md를 읽고 현재 작업 상태를 파악해줘. 미커밋 변경사항이 있으면 커밋하고, Next Steps를 검토해줘.
```
