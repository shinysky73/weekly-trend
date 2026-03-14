# TDD Plan: LLM 뉴스 요약 (Gemini API)

**PRD**: `docs/03-llm-summary/prd.md`
**Created**: 2026-03-14
**Status**: Completed

---

## Phase 0: Test Setup & DB Schema

**Test File**: `apps/api-server/src/summary/summary.service.spec.ts`
**Impl File**: `apps/api-server/src/summary/summary.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- summary.service.spec.ts`

### Setup Tasks:
- [x] Prisma schema에 Summary, SummaryMeta 모델 추가 및 News 관계 추가
- [x] `npx prisma generate` 실행
- [x] `@google/genai` 패키지 설치
- [x] SummaryModule, SummaryService 빈 파일 생성
- [x] 테스트 파일에 describe block + mock 설정

---

# Backend (TDD)

## Phase 1: Gemini API 요약 핵심 로직

**Test File**: `apps/api-server/src/summary/summary.service.spec.ts`
**Impl File**: `apps/api-server/src/summary/summary.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- summary.service.spec.ts`

### Tests:
- [x] shouldCallGeminiWithTitleAndSnippet: 뉴스 제목+snippet을 Gemini API에 전달하여 요약을 요청한다
- [x] shouldSaveSummaryToDatabase: 요약 결과를 Summary 테이블에 저장한다
- [x] shouldSaveSummaryMetaWithTokenUsage: 요약 완료 시 SummaryMeta에 inputTokens, outputTokens, model, processingMs를 저장한다
- [x] shouldSkipAlreadySummarizedNews: 이미 Summary가 존재하는 뉴스는 재요약하지 않는다
- [x] shouldSummarizeAllUnsummarizedNews: pipelineRunId로 미요약 뉴스 목록을 조회하여 순차 요약한다

---

## Phase 2: 에러 핸들링 및 Edge Cases

**Test File**: `apps/api-server/src/summary/summary.service.spec.ts`
**Impl File**: `apps/api-server/src/summary/summary.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- summary.service.spec.ts`

### Tests:
- [x] shouldSkipNewsWithEmptySnippet: snippet이 빈 문자열인 기사는 건너뛴다
- [x] shouldTruncateInputTo8000Chars: 입력이 8000자를 초과하면 앞부분 8000자로 truncate한다
- [x] shouldContinueOnIndividualFailure: 개별 기사 요약 실패 시 해당 기사를 건너뛰고 나머지를 계속 처리한다
- [x] shouldRetryOnRateLimitWithExponentialBackoff: 429 에러 시 지수 백오프로 재시도한다 (1초→2초→4초)
- [x] shouldSkipAfterMaxRetries: 3회 재시도 후에도 실패하면 해당 기사를 건너뛴다
- [x] shouldLogErrorsWithNewsId: 모든 에러를 newsId와 함께 로깅한다

---

## Phase 3: 파이프라인 통합

**Test File**: `apps/api-server/src/pipeline/pipeline.service.spec.ts`
**Impl File**: `apps/api-server/src/pipeline/pipeline.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- pipeline.service.spec.ts`

### Tests:
- [x] shouldRunSummaryAfterCollection: 파이프라인 실행 시 수집 완료 후 요약을 순차 실행한다
- [x] shouldRecordTotalSummaries: 파이프라인 완료 시 totalSummaries 수를 PipelineRun에 기록한다
- [x] shouldFailPipelineOnSummaryError: 수집 성공 + 요약 단계 전체 실패 시 status를 "failed"로 설정하고 수집 데이터는 유지한다

---

## Phase 4: 뉴스 상세 API 확장

**Test File**: `apps/api-server/src/news/news.service.spec.ts`
**Impl File**: `apps/api-server/src/news/news.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- news.service.spec.ts`

### Tests:
- [x] shouldIncludeSummaryInNewsDetail: `GET /news/:id` 응답에 summary 텍스트를 포함한다
- [x] shouldIncludeSummaryMetaInNewsDetail: `GET /news/:id` 응답에 summaryMeta를 포함한다

---

## Progress Summary

| Section | Phase | Total | Done | Status |
|---------|-------|-------|------|--------|
| Setup | 0 | 5 | 5 | ✓ Complete |
| Backend (TDD) | 1 | 5 | 5 | ✓ Complete |
| Backend (TDD) | 2 | 6 | 6 | ✓ Complete |
| Backend (TDD) | 3 | 3 | 3 | ✓ Complete |
| Backend (TDD) | 4 | 2 | 2 | ✓ Complete |
| **Total** | - | **21** | **21** | **100%** |

---

## Notes

- 이 feature는 백엔드 전용 — 프론트엔드/UI 작업 없음 (뉴스 UI는 Phase 4에서 별도 처리)
- `@google/genai` SDK의 `GoogleGenAI` 클래스를 사용하여 Gemini 호출
- 테스트에서 Gemini API는 mock 처리 (실제 API 호출하지 않음)
- Rate limit 재시도 로직은 `setTimeout` 기반 — 테스트에서 `jest.useFakeTimers()` 활용
- Phase 3에서 기존 pipeline.service.spec.ts에 테스트 추가 (Phase 7 describe block)
- Phase 4에서 기존 news.service.spec.ts에 테스트 추가
- DB 마이그레이션은 `npx prisma migrate dev` 별도 실행 필요
