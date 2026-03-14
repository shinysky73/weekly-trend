# TDD Plan: 파이프라인 실시간 진행 상태

**PRD**: `docs/10-pipeline-progress/prd.md`
**Created**: 2026-03-14
**Status**: Complete

---

## Phase 0: Schema 변경

### Setup Tasks:
- [x] Prisma schema에 PipelineRun 필드 추가 (processedKeywords, totalKeywords, currentKeyword, quotaExceeded)
- [x] `prisma generate` + `prisma db push`
- [x] PipelineRun 프론트엔드 타입에 필드 추가

---

# Backend (TDD)

## Phase 1: 진행 상태 기록 — executePipeline 확장

**Test File**: `apps/api-server/src/pipeline/pipeline.service.spec.ts`
**Impl File**: `apps/api-server/src/pipeline/pipeline.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- pipeline.service.spec.ts`

### Tests:
- [x] shouldSetTotalKeywordsOnStart: 파이프라인 시작 시 totalKeywords를 전체 키워드 수로 설정한다
- [x] shouldUpdateProgressPerKeyword: 키워드 처리 완료 시 processedKeywords 증가 + currentKeyword 업데이트
- [x] shouldSetQuotaExceededFlag: API 할당량 초과 시 quotaExceeded=true로 기록한다
- [x] shouldCompleteImmediatelyWhenNoKeywords: 키워드가 0개면 파이프라인을 즉시 완료한다

---

## Phase 2: 진행 상태 조회 — findAllRuns 응답 확장

Prisma returns all fields by default — no code change needed.

- [x] shouldReturnProgressFieldsInRunsList: findAllRuns 응답에 진행 필드 자동 포함

---

# Frontend Logic (TDD)

## Phase 3: PipelineRun 타입 확장 + Store 테스트

**Test File**: `apps/user-client/src/features/pipeline/stores/pipelineStore.test.ts`
**Impl File**: `apps/user-client/src/features/pipeline/stores/pipelineStore.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- pipelineStore.test.ts`

### Tests:
- [x] shouldStoreProgressFields: PipelineRun에 processedKeywords, totalKeywords, currentKeyword, quotaExceeded 포함 확인

---

# UI/UX (Non-TDD)

## Phase 4: PipelinePanel 진행 상태 UI

**Files**:
- `apps/user-client/src/features/pipeline/components/PipelinePanel.tsx`

### Tasks:
- [x] 실행 중 progress bar 표시 (processedKeywords / totalKeywords)
- [x] 현재 처리 키워드 표시: "Cloud/AWS" + "(3/10) 42%"
- [x] 할당량 초과 시 경고: "API 할당량 초과로 수집이 중단되었습니다"
- [x] 키워드 0개 결과 시 안내: "등록된 키워드가 없어..." + 카테고리 관리 링크
- [x] 요약 단계 표시: currentKeyword = "요약 생성 중..."

---

## Progress Summary

| Section | Phase | Total | Done | Status |
|---------|-------|-------|------|--------|
| Setup | 0 | 3 | 3 | Complete |
| Backend (TDD) | 1-2 | 5 | 5 | Complete |
| Frontend Logic (TDD) | 3 | 1 | 1 | Complete |
| UI/UX | 4 | 5 | 5 | Complete |
| **Total** | - | **14** | **14** | **100%** |

---

## Notes

- Polling 방식 (3초 간격) — 기존 PipelinePanel 패턴 유지
- executePipeline에서 키워드 처리 시마다 DB update (processedKeywords, currentKeyword)
- 요약 단계: currentKeyword = "요약 생성 중..."
- 완료 시: currentKeyword = null
- 테스트 커맨드의 패키지명: `@weekly-trend/user-client`, `@weekly-trend/api-server` (CLAUDE.md 기준)
