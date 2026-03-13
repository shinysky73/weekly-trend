# TDD Plan: 카테고리/키워드 CRUD

**PRD**: `docs/01-category-keyword-crud/prd.md`
**Created**: 2026-03-13
**Status**: Complete

---

## Phase 0: Setup

### Setup Tasks:
- [x] Prisma 스키마에 Category, Keyword, FilterKeyword 모델 추가
- [x] `prisma generate` 실행
- [x] PrismaService에 category, keyword, filterKeyword 접근자 추가
- [x] CategoryModule, CategoryController, CategoryService 스캐폴드 생성
- [x] DTO 파일 생성 (create-category, update-category, create-keyword, create-filter-keyword)
- [x] AppModule에 CategoryModule import
- [x] 테스트 파일 생성 및 빈 describe 블록 확인

---

# Backend (TDD)

## Phase 1: Category CRUD 핵심 기능

**Test File**: `apps/api-server/src/category/category.service.spec.ts`
**Impl File**: `apps/api-server/src/category/category.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- category.service.spec.ts`

### Tests:
- [x] shouldCreateCategory: name을 받아 카테고리를 생성하고 id, name, createdAt을 반환한다
- [x] shouldFindAllCategories: 전체 카테고리 목록을 keywords, filterKeywords 포함하여 반환한다
- [x] shouldReturnEmptyArrayWhenNoCategories: 카테고리가 없으면 빈 배열을 반환한다
- [x] shouldUpdateCategoryName: id와 name을 받아 카테고리명을 수정한다
- [x] shouldDeleteCategory: id를 받아 카테고리를 삭제한다

---

## Phase 2: Category 유효성 검사 및 에러 처리

**Test File**: `apps/api-server/src/category/category.service.spec.ts`
**Impl File**: `apps/api-server/src/category/category.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- category.service.spec.ts`

### Tests:
- [x] shouldThrowConflictWhenDuplicateCategoryName: 중복 카테고리명 생성 시 409 ConflictException을 던진다
- [x] shouldThrowNotFoundWhenCategoryNotExists: 존재하지 않는 카테고리 수정 시 404 NotFoundException을 던진다
- [x] shouldThrowNotFoundWhenDeletingNonExistentCategory: 존재하지 않는 카테고리 삭제 시 404 NotFoundException을 던진다

---

## Phase 3: Keyword CRUD + 에러 처리

**Test File**: `apps/api-server/src/category/category.service.spec.ts`
**Impl File**: `apps/api-server/src/category/category.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- category.service.spec.ts`

### Tests:
- [x] shouldCreateKeyword: categoryId와 text를 받아 키워드를 생성한다
- [x] shouldFindKeywordsByCategory: 카테고리별 키워드 목록을 반환한다
- [x] shouldDeleteKeyword: id를 받아 키워드를 삭제한다
- [x] shouldThrowNotFoundWhenCategoryNotExistsOnKeywordCreate: 존재하지 않는 카테고리에 키워드 생성 시 404를 던진다
- [x] shouldThrowConflictWhenDuplicateKeyword: 동일 카테고리 내 중복 키워드 생성 시 409를 던진다

---

## Phase 4: FilterKeyword CRUD + 에러 처리

**Test File**: `apps/api-server/src/category/category.service.spec.ts`
**Impl File**: `apps/api-server/src/category/category.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- category.service.spec.ts`

### Tests:
- [x] shouldCreateFilterKeyword: categoryId와 text를 받아 제외 키워드를 생성한다
- [x] shouldFindFilterKeywordsByCategory: 카테고리별 제외 키워드 목록을 반환한다
- [x] shouldDeleteFilterKeyword: id를 받아 제외 키워드를 삭제한다
- [x] shouldThrowConflictWhenDuplicateFilterKeyword: 동일 카테고리 내 중복 제외 키워드 생성 시 409를 던진다

---

## Phase 5: Controller HTTP 계층

**Test File**: `apps/api-server/src/category/category.controller.spec.ts`
**Impl File**: `apps/api-server/src/category/category.controller.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- category.controller.spec.ts`

### Tests:
- [x] shouldCallCreateCategoryWithDto: POST /categories 요청 시 service.createCategory를 올바른 인자로 호출한다
- [x] shouldCallFindAllCategories: GET /categories 요청 시 service.findAllCategories를 호출한다
- [x] shouldCallUpdateCategoryWithIdAndDto: PATCH /categories/:id 요청 시 service.updateCategory를 호출한다
- [x] shouldCallDeleteCategoryWithId: DELETE /categories/:id 요청 시 service.deleteCategory를 호출한다
- [x] shouldCallCreateKeywordWithCategoryIdAndDto: POST /categories/:id/keywords 요청 시 service.createKeyword를 호출한다
- [x] shouldCallFindKeywordsByCategoryId: GET /categories/:id/keywords 요청 시 service.findKeywordsByCategory를 호출한다
- [x] shouldCallDeleteKeywordWithId: DELETE /keywords/:id 요청 시 service.deleteKeyword를 호출한다
- [x] shouldCallCreateFilterKeyword: POST /categories/:id/filter-keywords 요청 시 service.createFilterKeyword를 호출한다
- [x] shouldCallFindFilterKeywordsByCategoryId: GET /categories/:id/filter-keywords 요청 시 service.findFilterKeywordsByCategory를 호출한다
- [x] shouldCallDeleteFilterKeywordWithId: DELETE /filter-keywords/:id 요청 시 service.deleteFilterKeyword를 호출한다

---

## Progress Summary

| Section | Phase | Total | Done | Status |
|---------|-------|-------|------|--------|
| Setup | 0 | 7 | 7 | Complete |
| Backend (TDD) | 1-5 | 27 | 27 | Complete |
| **Total** | - | **34** | **34** | **100%** |

---

## Notes

- 이 Phase는 백엔드 API만 포함 (프론트엔드 UI는 Phase 05-management-ui)
- Category, Keyword, FilterKeyword를 하나의 `CategoryService`에서 관리 (별도 모듈 불필요)
- PrismaService에 `category`, `keyword`, `filterKeyword` 접근자 추가 필요
- Controller 테스트는 service를 mock하여 HTTP 계층만 검증
- Prisma `onDelete: Cascade`로 카테고리 삭제 시 하위 키워드 자동 삭제
