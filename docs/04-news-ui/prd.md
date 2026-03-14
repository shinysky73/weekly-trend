# PRD: Phase 4a — 뉴스 조회 및 파이프라인 실행 UI

**Parent PRD**: `docs/01-weekly-trend-core/prd.md`
**Author**: weekly-trend team
**Created**: 2026-03-13
**Updated**: 2026-03-13
**Status**: Draft
**Depends on**: Phase 2 (뉴스 수집), Phase 3 (LLM 요약)

---

## 1. Problem Statement

수집된 뉴스와 요약 결과를 웹 UI에서 조회하고, 파이프라인을 수동 실행할 수 있어야 한다. 핵심 조회 기능을 우선 구현한다.

### Prerequisites

- Phase 1~3 완료 (카테고리/키워드 CRUD, 뉴스 수집, 요약)
- React 19 + Vite 7 + Zustand 5 + Tailwind CSS 프론트엔드 환경 구축 완료

---

## 2. Functional Requirements

### FR-1: 뉴스 목록 조회

**Description**: 수집된 뉴스를 카테고리별로 조회한다.

**Acceptance Criteria**:
- [ ] 카테고리별 뉴스 목록을 카드 형태로 표시한다
- [ ] 뉴스 카드에 제목, 출처(publisher), 발행일, 요약, 썸네일을 표시한다
- [ ] 날짜 범위로 필터링할 수 있다
- [ ] 키워드로 검색할 수 있다
- [ ] 페이지네이션을 지원한다
- [ ] 뉴스 제목 클릭 시 원문 링크로 이동한다 (새 탭)

### FR-2: 파이프라인 실행 UI

**Description**: 파이프라인을 UI에서 수동 실행하고 상태를 확인할 수 있다.

**Acceptance Criteria**:
- [ ] "파이프라인 실행" 버튼으로 `POST /pipeline/run` 호출
- [ ] 실행 중 로딩 상태 표시
- [ ] 완료 시 결과 갱신 (수집/요약 건수 표시)
- [ ] 최근 파이프라인 실행 이력 표시 (`GET /pipeline/runs`)

### FR-3: 빈 상태 처리

**Description**: 데이터가 없는 경우 적절한 빈 상태를 표시한다.

**Acceptance Criteria**:
- [ ] 수집된 뉴스가 없을 때: "수집된 뉴스가 없습니다" 빈 상태
- [ ] 검색/필터 결과가 없을 때: "조건에 맞는 뉴스가 없습니다"
- [ ] 썸네일이 없는 기사: 기본 플레이스홀더 이미지

---

## 3. Pages & Routes

```
/                          → 뉴스 목록 + 파이프라인 실행 (메인 페이지)
```

---

## 4. Affected Code

### New Files (예상)
```
apps/user-client/src/features/news/
  NewsPage.tsx
  NewsList.tsx
  NewsCard.tsx
  NewsFilter.tsx
  useNewsStore.ts
  newsApi.ts

apps/user-client/src/features/pipeline/
  PipelinePanel.tsx
  PipelineHistory.tsx
  pipelineApi.ts
```

### Existing Files
```
apps/user-client/src/App.tsx              — 라우트 추가
apps/user-client/src/components/Navbar.tsx — 네비게이션 메뉴 추가
```

---

## 5. Edge Cases

- API 서버 연결 실패: 에러 메시지 표시 + 재시도 버튼
- 썸네일 이미지 로드 실패: `onError`로 플레이스홀더 이미지 표시
- 긴 요약 텍스트: 카드에서 말줄임 처리
- 대량 뉴스 목록: 페이지네이션으로 성능 확보 (한 페이지 20건)
- 파이프라인 실행 중 중복 클릭: 버튼 비활성화

---

## 6. Out of Scope

- 모바일 반응형 UI (데스크톱 우선)
- 다크 모드
- 실시간 파이프라인 진행 상태 (WebSocket)
- 카테고리/키워드 관리 UI (Phase 4b)
