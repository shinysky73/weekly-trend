# PRD: Phase 1 — 카테고리/키워드 CRUD

**Parent PRD**: `docs/01-weekly-trend-core/prd.md`
**Author**: weekly-trend team
**Created**: 2026-03-13
**Status**: Draft

---

## 1. Problem Statement

주간동향 시스템의 뉴스 수집 대상을 관리하기 위한 카테고리와 키워드 CRUD API가 필요하다. 이후 Phase(뉴스 수집, 요약, UI)의 기반 데이터 구조를 확립하는 단계이다.

### Prerequisites

- PostgreSQL + Prisma 설정 완료 (기존 User 모델 존재)
- NestJS 모듈 아키텍처 패턴 확립 (auth 모듈 참조)

---

## 2. Functional Requirements

### FR-1: 카테고리 CRUD

**Description**: 뉴스 수집 대상 카테고리를 생성/조회/수정/삭제한다.

**Acceptance Criteria**:
- [ ] `POST /categories` — 카테고리 생성 (name 필수, unique)
- [ ] `GET /categories` — 전체 카테고리 목록 조회 (keywords 포함)
- [ ] `PATCH /categories/:id` — 카테고리명 수정
- [ ] `DELETE /categories/:id` — 카테고리 삭제 (하위 키워드, 제외 키워드 cascade 삭제)
- [ ] 중복 카테고리명 생성 시 409 Conflict 반환
- [ ] 존재하지 않는 카테고리 접근 시 404 Not Found 반환

### FR-2: 키워드 CRUD

**Description**: 카테고리에 종속된 검색 키워드를 관리한다.

**Acceptance Criteria**:
- [ ] `POST /categories/:id/keywords` — 키워드 생성 (text 필수, 카테고리 내 unique)
- [ ] `GET /categories/:id/keywords` — 카테고리별 키워드 목록 조회
- [ ] `DELETE /keywords/:id` — 키워드 삭제
- [ ] 동일 카테고리 내 중복 키워드 생성 시 409 Conflict 반환
- [ ] 존재하지 않는 카테고리에 키워드 생성 시 404 Not Found 반환

### FR-3: 제외 키워드 CRUD

**Description**: 카테고리별 뉴스 필터링용 제외 키워드를 관리한다.

**Acceptance Criteria**:
- [ ] `POST /categories/:id/filter-keywords` — 제외 키워드 생성
- [ ] `GET /categories/:id/filter-keywords` — 카테고리별 제외 키워드 목록 조회
- [ ] `DELETE /filter-keywords/:id` — 제외 키워드 삭제
- [ ] 동일 카테고리 내 중복 제외 키워드 생성 시 409 Conflict 반환

---

## 3. DB Schema Changes

기존 `schema.prisma`에 아래 모델 추가:

```prisma
model Category {
  id             Int             @id @default(autoincrement())
  name           String          @unique
  keywords       Keyword[]
  filterKeywords FilterKeyword[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
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
```

---

## 4. API Endpoints

```
POST   /categories                      → { id, name, createdAt }
GET    /categories                      → [{ id, name, keywords, filterKeywords, createdAt }]
PATCH  /categories/:id                  → { id, name, updatedAt }
DELETE /categories/:id                  → 204 No Content

POST   /categories/:id/keywords         → { id, text, categoryId, createdAt }
GET    /categories/:id/keywords          → [{ id, text, createdAt }]
DELETE /keywords/:id                     → 204 No Content

POST   /categories/:id/filter-keywords   → { id, text, categoryId, createdAt }
GET    /categories/:id/filter-keywords    → [{ id, text, createdAt }]
DELETE /filter-keywords/:id              → 204 No Content
```

---

## 5. Affected Code

### New Files (예상)
```
apps/api-server/prisma/schema.prisma          — 모델 추가
apps/api-server/src/category/
  category.module.ts
  category.controller.ts
  category.service.ts
  category.controller.spec.ts
  category.service.spec.ts
  dto/
    create-category.dto.ts
    update-category.dto.ts
    create-keyword.dto.ts
    create-filter-keyword.dto.ts
```

### Existing Files
```
apps/api-server/src/app.module.ts             — CategoryModule import 추가
```

---

## 6. Edge Cases

- 키워드가 0개인 카테고리: 정상 — 이후 수집 시 건너뛰기 (Phase 2에서 처리)
- 카테고리가 0개일 때: 빈 배열 반환 (에러 아님)
- 카테고리 삭제 시: Prisma `onDelete: Cascade`로 하위 키워드 자동 삭제
- 긴 카테고리명/키워드: 별도 길이 제한 없음 (DB 기본 제한 따름)

---

## 7. Out of Scope

- 인증/권한 (현재 단일 관리자 전제)
- 카테고리/키워드 순서 지정
- 카테고리/키워드 벌크 생성
- 프론트엔드 UI (Phase 4)
