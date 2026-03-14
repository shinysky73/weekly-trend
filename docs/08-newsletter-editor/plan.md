# TDD Plan: 뉴스레터 편집 UI

**PRD**: `docs/08-newsletter-editor/prd.md`
**Created**: 2026-03-14
**Status**: Complete

---

## Phase 0: Test Setup & TanStack Query 도입

### Setup Tasks:
- [x] `@tanstack/react-query` v5 설치 (`pnpm -F @weekly-trend/user-client add @tanstack/react-query`)
- [x] `apps/user-client/src/lib/queryClient.ts` 생성 (QueryClient 인스턴스)
- [x] `App.tsx`에 `QueryClientProvider` 래핑
- [x] 테스트 유틸리티 생성: `apps/user-client/src/test/queryWrapper.tsx` (테스트용 QueryClientProvider)
- [x] 빈 테스트 실행 확인

---

# Backend (TDD)

## Phase 1: findRunById 확장 (summary + category include)

**Test File**: `apps/api-server/src/pipeline/pipeline.service.spec.ts`
**Impl File**: `apps/api-server/src/pipeline/pipeline.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- pipeline.service.spec.ts`

### Tests:
- [x] shouldFindRunByIdWithNewsSummaryAndCategory: findRunById가 news에 summary와 category를 include하여 반환한다

---

# Frontend Logic (TDD)

## Phase 2: Newsletter API Service

**Test File**: `apps/user-client/src/features/newsletter/services/newsletterApi.test.ts`
**Impl File**: `apps/user-client/src/features/newsletter/services/newsletterApi.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- newsletterApi.test.ts`

### Tests:
- [x] shouldFetchRunDetail: `fetchRunDetail(id)` 호출 시 `GET /pipeline/runs/:id` 요청하여 run + news(summary, category 포함) 반환
- [x] shouldExportCsv: `exportCsv(items)` 호출 시 선택된 뉴스를 UTF-8 BOM CSV Blob으로 생성

---

## Phase 3: TanStack Query Hooks

**Test File**: `apps/user-client/src/features/newsletter/hooks/useRunDetail.test.ts`
**Impl File**: `apps/user-client/src/features/newsletter/hooks/useRunDetail.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- useRunDetail.test.ts`

### Tests:
- [x] shouldFetchRunDetailOnMount: useRunDetail(runId) 마운트 시 API 호출하여 data 반환
- [x] shouldReturnLoadingState: 초기 로딩 시 isLoading=true 반환
- [x] shouldReturnErrorOnFailure: API 실패 시 isError=true, error 객체 반환
- [x] shouldGroupNewsByCategory: data.news를 categoryId별로 그룹화한 groupedNews 반환

---

## Phase 4: Selection Store

**Test File**: `apps/user-client/src/features/newsletter/stores/selectionStore.test.ts`
**Impl File**: `apps/user-client/src/features/newsletter/stores/selectionStore.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- selectionStore.test.ts`

### Tests:
- [x] shouldHaveInitialState: 초기 상태 검증 (selectedIds=Set(), title="주간동향", subtitle="")
- [x] shouldToggleNewsItem: toggleItem(id)으로 뉴스 선택/해제 토글
- [x] shouldSelectAllInCategory: selectCategory(newsIds)로 카테고리 전체 선택
- [x] shouldDeselectAllInCategory: deselectCategory(newsIds)로 카테고리 전체 해제
- [x] shouldRemoveItem: removeItem(id)로 사이드바에서 개별 제거
- [x] shouldClearAll: clearAll()로 전체 선택 초기화
- [x] shouldSetTitle: setTitle(title)로 뉴스레터 제목 설정
- [x] shouldSetSubtitle: setSubtitle(subtitle)로 뉴스레터 부제목 설정
- [x] shouldReturnSelectedCount: 선택된 아이템 수 반환

---

## Phase 5: Newsletter HTML 생성

**Test File**: `apps/user-client/src/features/newsletter/services/newsletterHtml.test.ts`
**Impl File**: `apps/user-client/src/features/newsletter/services/newsletterHtml.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- newsletterHtml.test.ts`

### Tests:
- [x] shouldGenerateEmptyHtmlWhenNoItems: 빈 배열 입력 시 헤더/푸터만 있는 HTML 반환
- [x] shouldGroupByCategoryInHtml: 뉴스를 카테고리별로 그룹화하여 카테고리 배지(#0047FF) 포함 HTML 생성
- [x] shouldRenderThumbnailLayout: thumbnailUrl이 있는 뉴스에 140x140 이미지 포함 레이아웃 적용
- [x] shouldRenderNoThumbnailLayout: thumbnailUrl이 없는 뉴스에 텍스트만 레이아웃 적용
- [x] shouldUseSummaryWithSnippetFallback: summary.text가 있으면 사용, 없으면 snippet을 fallback
- [x] shouldIncludeTitleAndSubtitle: title과 subtitle을 HTML 헤더에 포함

---

# UI/UX (Non-TDD)

## Phase 6: RunDetailPage 컴포넌트 구현

**Files**:
- `apps/user-client/src/features/newsletter/RunDetailPage.tsx`
- `apps/user-client/src/features/newsletter/components/RunNewsList.tsx`
- `apps/user-client/src/features/newsletter/components/RunNewsCard.tsx`
- `apps/user-client/src/features/newsletter/components/SelectionSidebar.tsx`
- `apps/user-client/src/features/newsletter/index.ts`

### Tasks:
- [x] RunDetailPage 레이아웃: 좌측 뉴스 목록(70%) + 우측 사이드바(30%)
- [x] RunNewsList: 카테고리별 그룹 헤더 + 전체선택 토글 + 선택건수 표시
- [x] RunNewsCard: 체크박스 + 썸네일 + 제목 + 출처/날짜 + 요약 미리보기
- [x] SelectionSidebar: 선택된 기사 카테고리별 목록 + 개별 제거 버튼
- [x] "미리보기" 버튼 (선택 0건 시 비활성화)
- [x] "CSV 내보내기" 버튼
- [x] 로딩 상태 UI (스켈레톤)
- [x] 에러 상태 UI + 재시도 버튼
- [x] 빈 상태 UI: "수집된 뉴스가 없습니다"
- [x] 파이프라인 running 상태 시 "실행 중..." + 자동 리프레시

---

## Phase 7: NewsletterPreview 컴포넌트 구현

**Files**:
- `apps/user-client/src/features/newsletter/components/NewsletterPreview.tsx`
- `apps/user-client/src/features/newsletter/components/NewsletterHeader.tsx`
- `apps/user-client/src/features/newsletter/templates/` (HTML 템플릿 문자열)

### Tasks:
- [x] NewsletterPreview: iframe srcdoc으로 뉴스레터 HTML 렌더링
- [x] NewsletterHeader: 제목/부제목 인라인 편집 input
- [x] 미리보기 ↔ 선택 모드 전환 (탭 또는 토글)
- [x] 수집 통계 부제목 자동 생성 (날짜 범위, 카테고리별 건수)

---

## Phase 8: 라우팅 통합 및 PipelineHistory 연결

**Files**:
- `apps/user-client/src/App.tsx`
- `apps/user-client/src/features/pipeline/components/PipelineHistory.tsx`

### Tasks:
- [x] App.tsx에 `/runs/:id` 라우트 추가 (RunDetailPage)
- [x] PipelineHistory 테이블 row에 클릭 이벤트 → `navigate(/runs/${run.id})` 추가
- [x] completed 상태인 run만 클릭 가능 (running/failed는 비활성)
- [x] RunDetailPage에서 "뒤로가기" → 홈 페이지로 이동

---

## Progress Summary

| Section | Phase | Total | Done | Status |
|---------|-------|-------|------|--------|
| Setup | 0 | 5 | 5 | Complete |
| Backend (TDD) | 1 | 1 | 1 | Complete |
| Frontend Logic (TDD) | 2-5 | 17 | 17 | Complete |
| UI/UX | 6-8 | 18 | 18 | Complete |
| **Total** | - | **41** | **41** | **100%** |

---

## Notes

- 백엔드는 `findRunById`의 include 확장만 필요 (1건). 나머지는 기존 API 활용
- TanStack Query 도입 시 기존 newsStore/pipelineStore의 서버 상태 페칭은 이번 scope에서 마이그레이션하지 않음 (newsletter feature에만 적용)
- HTML 템플릿은 old_source의 `report_layout.html`, `category_layout.html`, `contents_*_layout.html` 구조를 TypeScript 템플릿 리터럴로 변환
- CSV 내보내기는 프론트엔드에서 Blob 생성 + download (백엔드 API 불필요)
- 이메일 발송(FR-4)은 P1 — 이번 plan scope 밖. 백엔드에 nodemailer + `POST /newsletter/send` 필요
- 테스트 커맨드의 패키지명: `@weekly-trend/user-client`, `@weekly-trend/api-server` (CLAUDE.md 기준)
