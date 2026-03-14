# TDD Plan: 뉴스 조회 및 파이프라인 실행 UI

**PRD**: `docs/04-news-ui/prd.md`
**Created**: 2026-03-14
**Status**: Complete

---

## Phase 0: Test Setup

**Test File**: `apps/user-client/src/features/news/services/newsApi.test.ts`
**Impl File**: `apps/user-client/src/features/news/services/newsApi.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- newsApi.test.ts`

### Setup Tasks:
- [x] Create `features/news/` directory structure
- [x] Create test file with describe block
- [x] Verify test infrastructure works (empty test passes)

---

# Frontend Logic (TDD)

## Phase 1: News API Service

**Test File**: `apps/user-client/src/features/news/services/newsApi.test.ts`
**Impl File**: `apps/user-client/src/features/news/services/newsApi.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- newsApi.test.ts`

### Tests:
- [x] shouldFetchNewsPaginated: `fetchNews()` 호출 시 `GET /news`에 page, limit, categoryId, startDate, endDate 쿼리 전달
- [x] shouldFetchNewsWithDefaultParams: 파라미터 없이 호출 시 기본값(page=1, limit=20)으로 요청
- [x] shouldFetchCategories: `fetchCategories()` 호출 시 `GET /categories` 요청하여 카테고리 목록 반환

---

## Phase 2: Pipeline API Service

**Test File**: `apps/user-client/src/features/pipeline/services/pipelineApi.test.ts`
**Impl File**: `apps/user-client/src/features/pipeline/services/pipelineApi.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- pipelineApi.test.ts`

### Tests:
- [x] shouldStartPipeline: `startPipeline()` 호출 시 `POST /pipeline/run` 요청
- [x] shouldFetchPipelineRuns: `fetchPipelineRuns()` 호출 시 `GET /pipeline/runs` 요청
- [x] shouldHandleConflictError: 파이프라인 이미 실행 중(409)일 때 에러 전파

---

## Phase 3: News Store

**Test File**: `apps/user-client/src/features/news/stores/newsStore.test.ts`
**Impl File**: `apps/user-client/src/features/news/stores/newsStore.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- newsStore.test.ts`

### Tests:
- [x] shouldHaveInitialState: 초기 상태 검증 (news=[], total=0, page=1, loading=false)
- [x] shouldSetFilters: categoryId, startDate, endDate 필터 설정
- [x] shouldResetPageWhenFiltersChange: 필터 변경 시 page를 1로 리셋
- [x] shouldResetFilters: 필터 초기화 시 모든 필터와 page를 리셋
- [x] shouldSetPage: 페이지 변경 시 상태 업데이트
- [x] shouldSetLoading: 로딩 상태 토글
- [x] shouldSetNewsData: 뉴스 데이터 및 total 설정

---

## Phase 4: Pipeline Store

**Test File**: `apps/user-client/src/features/pipeline/stores/pipelineStore.test.ts`
**Impl File**: `apps/user-client/src/features/pipeline/stores/pipelineStore.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- pipelineStore.test.ts`

### Tests:
- [x] shouldHaveInitialState: 초기 상태 검증 (runs=[], isRunning=false)
- [x] shouldSetRunning: 파이프라인 실행 상태 설정
- [x] shouldSetRuns: 파이프라인 실행 이력 목록 설정
- [x] shouldAddRun: 새 실행 결과를 목록 앞에 추가

---

# UI/UX (Non-TDD)

## Phase 5: News 컴포넌트 구현

**Files**:
- `apps/user-client/src/features/news/NewsPage.tsx`
- `apps/user-client/src/features/news/components/NewsList.tsx`
- `apps/user-client/src/features/news/components/NewsCard.tsx`
- `apps/user-client/src/features/news/components/NewsFilter.tsx`
- `apps/user-client/src/features/news/components/Pagination.tsx`
- `apps/user-client/src/features/news/index.ts`

### Tasks:
- [x] NewsCard 컴포넌트 구현 (제목, 출처, 발행일, 요약, 썸네일)
- [x] 뉴스 제목 클릭 시 원문 링크 새 탭으로 열기
- [x] 썸네일 이미지 로드 실패 시 플레이스홀더 표시 (`onError`)
- [x] 긴 요약 텍스트 말줄임 처리
- [x] NewsList 컴포넌트 구현 (카드 그리드 레이아웃)
- [x] NewsFilter 컴포넌트 구현 (카테고리 선택, 날짜 범위, 키워드 검색)
- [x] Pagination 컴포넌트 구현
- [x] NewsPage 조합 (필터 + 목록 + 페이지네이션)

---

## Phase 6: Pipeline 컴포넌트 구현

**Files**:
- `apps/user-client/src/features/pipeline/components/PipelinePanel.tsx`
- `apps/user-client/src/features/pipeline/components/PipelineHistory.tsx`
- `apps/user-client/src/features/pipeline/index.ts`

### Tasks:
- [x] PipelinePanel 컴포넌트 구현 ("파이프라인 실행" 버튼)
- [x] 실행 중 로딩 상태 표시 + 버튼 비활성화 (중복 클릭 방지)
- [x] 완료 시 수집/요약 건수 표시
- [x] PipelineHistory 컴포넌트 구현 (최근 실행 이력 테이블)

---

## Phase 7: 라우팅 통합 및 상태 처리

**Files**:
- `apps/user-client/src/App.tsx`
- `apps/user-client/src/components/Navbar.tsx`
- `apps/user-client/src/pages/HomePage.tsx`

### Tasks:
- [x] HomePage에 NewsPage + PipelinePanel 통합
- [x] 빈 상태 UI: "수집된 뉴스가 없습니다"
- [x] 검색/필터 빈 결과: "조건에 맞는 뉴스가 없습니다"
- [x] 로딩 상태 UI (스켈레톤/스피너)
- [x] API 에러 상태 UI + 재시도 버튼
- [x] Navbar에 네비게이션 메뉴 필요 시 추가

---

## Progress Summary

| Section | Phase | Total | Done | Status |
|---------|-------|-------|------|--------|
| Setup | 0 | 3 | 3 | Complete |
| Frontend Logic (TDD) | 1-4 | 17 | 17 | Complete |
| UI/UX | 5-7 | 16 | 16 | Complete |
| **Total** | - | **36** | **36** | **100%** |

---

## Notes

- 백엔드 API는 이미 구현됨 (`GET /news`, `POST /pipeline/run`, `GET /pipeline/runs`) — 백엔드 TDD 생략
- Vite proxy 설정으로 `/api/*` → `localhost:3002` 연결 완료
- Axios 인터셉터(JWT 토큰 자동 첨가)는 auth 모듈에서 이미 구성됨
- 기존 패턴 따를 것: feature-based 디렉토리 + barrel export + Zustand store
- 모바일 반응형, 다크모드는 Out of Scope (PRD 명시)
- 테스트 커맨드의 패키지명: `@weekly-trend/user-client` (CLAUDE.md 기준)
