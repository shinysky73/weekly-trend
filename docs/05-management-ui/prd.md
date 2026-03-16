# PRD: Phase 4b — 카테고리/키워드 관리 UI

**Parent PRD**: `docs/01-weekly-trend-core/prd.md`
**Author**: weekly-trend team
**Created**: 2026-03-13
**Updated**: 2026-03-13
**Status**: Draft
**Depends on**: Phase 4a (뉴스 조회 UI)

---

## 1. Problem Statement

카테고리, 키워드, 제외 키워드를 웹 UI에서 관리할 수 있어야 한다. Phase 4a에서 구축한 프론트엔드 위에 관리 페이지를 추가한다.

> Note: Phase 1 API가 이미 존재하므로, 이 UI 없이도 API(curl/Postman)로 관리 가능하다. 우선순위가 낮은 이유.

### Prerequisites

- Phase 1 완료 (카테고리/키워드 CRUD API)
- Phase 4a 완료 (프론트엔드 기반 구조)

---

## 2. Functional Requirements

### FR-1: 카테고리 관리

**Acceptance Criteria**:
- [ ] 카테고리 목록 조회/생성/수정/삭제 UI
- [ ] 중복/에러 시 사용자에게 적절한 피드백 표시

### FR-2: 키워드 관리

**Acceptance Criteria**:
- [ ] 카테고리별 키워드 목록 조회/생성/삭제 UI
- [ ] 카테고리별 제외 키워드 목록 조회/생성/삭제 UI
- [ ] 카테고리 선택 → 하위 키워드 표시 구조

---

## 3. Pages & Routes

```
/categories                → 카테고리/키워드 관리
```

---

## 4. Affected Code

### New Files (예상)
```
apps/user-client/src/features/category/
  CategoryPage.tsx
  CategoryList.tsx
  CategoryForm.tsx
  KeywordList.tsx
  FilterKeywordList.tsx
  useCategoryStore.ts
  categoryApi.ts
```

### Existing Files
```
apps/user-client/src/App.tsx              — 라우트 추가
apps/user-client/src/components/Navbar.tsx — 메뉴 추가
```

---

## 5. Edge Cases

- 카테고리 삭제 시 확인 다이얼로그 (하위 키워드 함께 삭제 안내)
- 빈 카테고리 목록: "카테고리를 추가해주세요" 안내

---

## 6. Out of Scope

- 카테고리/키워드 순서 지정
- 벌크 생성/삭제
- 카테고리/키워드 검색
