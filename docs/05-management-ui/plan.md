# TDD Plan: 카테고리/키워드 관리 UI

**PRD**: `docs/05-management-ui/prd.md`
**Created**: 2026-03-14
**Status**: Planning

---

## Phase 0: Test Setup

**Test File**: `apps/user-client/src/features/category/services/categoryApi.test.ts`
**Impl File**: `apps/user-client/src/features/category/services/categoryApi.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- categoryApi.test.ts`

### Setup Tasks:
- [ ] Create `features/category/` directory structure
- [ ] Create test file with describe block
- [ ] Verify test infrastructure works (empty test passes)

---

# Frontend Logic (TDD)

## Phase 1: Category API Service

**Test File**: `apps/user-client/src/features/category/services/categoryApi.test.ts`
**Impl File**: `apps/user-client/src/features/category/services/categoryApi.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- categoryApi.test.ts`

### Tests:
- [ ] shouldFetchCategories: `fetchCategories()` 호출 시 `GET /categories` 요청하여 카테고리 목록 반환
- [ ] shouldCreateCategory: `createCategory(name)` 호출 시 `POST /categories` 요청
- [ ] shouldUpdateCategory: `updateCategory(id, name)` 호출 시 `PATCH /categories/:id` 요청
- [ ] shouldDeleteCategory: `deleteCategory(id)` 호출 시 `DELETE /categories/:id` 요청

---

## Phase 2: Keyword API Service

**Test File**: `apps/user-client/src/features/category/services/keywordApi.test.ts`
**Impl File**: `apps/user-client/src/features/category/services/keywordApi.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- keywordApi.test.ts`

### Tests:
- [ ] shouldFetchKeywords: `fetchKeywords(categoryId)` 호출 시 `GET /categories/:id/keywords` 요청
- [ ] shouldCreateKeyword: `createKeyword(categoryId, text)` 호출 시 `POST /categories/:id/keywords` 요청
- [ ] shouldDeleteKeyword: `deleteKeyword(id)` 호출 시 `DELETE /keywords/:id` 요청
- [ ] shouldFetchFilterKeywords: `fetchFilterKeywords(categoryId)` 호출 시 `GET /categories/:id/filter-keywords` 요청
- [ ] shouldCreateFilterKeyword: `createFilterKeyword(categoryId, text)` 호출 시 `POST /categories/:id/filter-keywords` 요청
- [ ] shouldDeleteFilterKeyword: `deleteFilterKeyword(id)` 호출 시 `DELETE /filter-keywords/:id` 요청

---

## Phase 3: Category Store

**Test File**: `apps/user-client/src/features/category/stores/categoryStore.test.ts`
**Impl File**: `apps/user-client/src/features/category/stores/categoryStore.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- categoryStore.test.ts`

### Tests:
- [ ] shouldHaveInitialState: 초기 상태 검증 (categories=[], selectedId=null, loading=false)
- [ ] shouldSetCategories: 카테고리 목록 설정
- [ ] shouldSelectCategory: 카테고리 선택 시 selectedId 업데이트
- [ ] shouldAddCategory: 새 카테고리를 목록에 추가
- [ ] shouldUpdateCategory: 목록 내 카테고리 이름 업데이트
- [ ] shouldRemoveCategory: 목록에서 카테고리 제거 + selectedId 초기화(선택된 항목 삭제 시)
- [ ] shouldSetKeywords: 선택된 카테고리의 키워드 목록 설정
- [ ] shouldSetFilterKeywords: 선택된 카테고리의 제외 키워드 목록 설정

---

# UI/UX (Non-TDD)

## Phase 4: Category 컴포넌트 구현

**Files**:
- `apps/user-client/src/features/category/CategoryPage.tsx`
- `apps/user-client/src/features/category/components/CategoryList.tsx`
- `apps/user-client/src/features/category/components/CategoryForm.tsx`
- `apps/user-client/src/features/category/index.ts`

### Tasks:
- [ ] CategoryList 컴포넌트 구현 (카테고리 목록 + 선택 UI)
- [ ] CategoryForm 컴포넌트 구현 (생성/수정 입력 폼)
- [ ] 카테고리 삭제 확인 다이얼로그 (하위 키워드 함께 삭제 안내)
- [ ] 중복/에러 시 피드백 메시지 표시
- [ ] 빈 상태: "카테고리를 추가해주세요" 안내

---

## Phase 5: Keyword 컴포넌트 구현

**Files**:
- `apps/user-client/src/features/category/components/KeywordList.tsx`
- `apps/user-client/src/features/category/components/FilterKeywordList.tsx`
- `apps/user-client/src/features/category/components/KeywordInput.tsx`

### Tasks:
- [ ] KeywordList 컴포넌트 구현 (키워드 목록 + 삭제 버튼)
- [ ] FilterKeywordList 컴포넌트 구현 (제외 키워드 목록 + 삭제 버튼)
- [ ] KeywordInput 컴포넌트 구현 (키워드 추가 입력 + Enter/버튼)
- [ ] 카테고리 선택 → 하위 키워드/제외 키워드 표시 연동

---

## Phase 6: 라우팅 통합 및 상태 처리

**Files**:
- `apps/user-client/src/App.tsx`
- `apps/user-client/src/components/Navbar.tsx`
- `apps/user-client/src/features/category/CategoryPage.tsx`

### Tasks:
- [ ] `/categories` 라우트 추가 (App.tsx)
- [ ] Navbar에 "카테고리 관리" 메뉴 링크 추가
- [ ] CategoryPage에 CategoryList + KeywordList + FilterKeywordList 통합 레이아웃
- [ ] 로딩 상태 UI (스피너)
- [ ] API 에러 상태 UI

---

## Progress Summary

| Section | Phase | Total | Done | Status |
|---------|-------|-------|------|--------|
| Setup | 0 | 3 | 0 | Pending |
| Frontend Logic (TDD) | 1-3 | 18 | 0 | Pending |
| UI/UX | 4-6 | 14 | 0 | Pending |
| **Total** | - | **35** | **0** | **0%** |

---

## Notes

- 백엔드 API는 이미 구현됨 (카테고리/키워드/제외키워드 CRUD) — 백엔드 TDD 생략
- Phase 4a(뉴스 조회 UI)에서 구축한 프론트엔드 패턴(feature-based 구조, barrel export, Zustand store) 따를 것
- `fetchCategories`는 04-news-ui의 newsApi에서도 사용 — 공통 모듈로 분리하거나 category 쪽에서 canonical 구현 후 news에서 import
- 카테고리/키워드 순서 지정, 벌크 생성/삭제, 검색은 Out of Scope
