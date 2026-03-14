# PRD: 뉴스레터 편집 UI

**Author**: weekly-trend team
**Created**: 2026-03-14
**Status**: Draft
**Depends on**: Phase 2 (뉴스 수집), Phase 3 (LLM 요약), Phase 4 (뉴스 UI), Phase 5 (관리 UI)

---

## 1. Problem Statement

### Background

현재 뉴스 UI(Phase 4)는 모든 파이프라인 run의 뉴스를 flat하게 보여준다. 원래 시스템(old_source/Weekly-Newsletter-Summary)은 **run별로 수집된 뉴스를 카테고리별로 그룹화** → 사용자가 원하는 기사만 **pick** → 선택한 기사로 **뉴스레터 HTML 생성** → **이메일 발송**하는 워크플로우였다.

### Problem

- 파이프라인 run별로 수집 결과를 확인할 수 없다
- 뉴스레터에 포함할 기사를 선택하는 기능이 없다
- 선택한 기사로 뉴스레터를 미리보기/편집/발송할 수 없다

### Impact

뉴스레터 제작을 위해 수동으로 기사를 복사/편집해야 하므로 원래 시스템 대비 생산성이 크게 저하된다.

---

## 2. Goals & Success Metrics

### Primary Goal

파이프라인 run별 뉴스 조회 → 기사 선택 → 뉴스레터 미리보기/발송까지 원래 시스템의 핵심 워크플로우를 React UI로 재구현한다.

### Success Metrics

| Metric | Target |
|--------|--------|
| Run 선택 → 뉴스레터 발송까지 클릭 수 | 5회 이내 |
| 뉴스레터 HTML 미리보기 렌더링 시간 | < 1초 |

---

## 3. User Stories

### Must Have (P0)

- [ ] 사용자로서 파이프라인 실행 이력에서 특정 run을 클릭하면 해당 run에서 수집된 뉴스를 카테고리별로 그룹화해서 볼 수 있다
- [ ] 사용자로서 각 뉴스 기사를 체크박스로 선택/해제하여 뉴스레터에 포함할 기사를 고를 수 있다
- [ ] 사용자로서 선택한 기사 목록을 사이드바에서 확인하고 제거할 수 있다
- [ ] 사용자로서 선택한 기사로 뉴스레터 HTML을 미리볼 수 있다

### Should Have (P1)

- [ ] 사용자로서 뉴스레터 제목, 부제목을 편집할 수 있다
- [ ] 사용자로서 뉴스레터를 이메일로 발송할 수 있다
- [ ] 사용자로서 뉴스레터를 CSV로 내보낼 수 있다

### Could Have (P2)

- [ ] 사용자로서 개별 기사의 요약 텍스트를 뉴스레터 미리보기에서 인라인 편집할 수 있다
- [ ] 사용자로서 카테고리 내 기사 순서를 드래그로 변경할 수 있다

---

## 4. Functional Requirements

### FR-1: Run별 뉴스 조회 페이지

**Description**: 파이프라인 이력에서 run을 클릭하면 해당 run의 뉴스를 카테고리별로 그룹화하여 표시한다.

**Acceptance Criteria**:
- [ ] PipelineHistory 테이블의 row를 클릭하면 `/runs/:id` 페이지로 이동한다
- [ ] `GET /pipeline/runs/:id` API로 해당 run의 뉴스를 조회한다 (summary 포함)
- [ ] 뉴스를 categoryId별로 그룹화하여 카테고리명 헤더와 함께 표시한다
- [ ] 각 뉴스 카드에 제목, 출처, 발행일, 요약(summary.text), 썸네일을 표시한다
- [ ] 서버 상태 관리에 TanStack Query를 사용한다

**Edge Cases**:
- Run에 뉴스가 없을 때: "수집된 뉴스가 없습니다" 빈 상태 표시
- Run이 아직 running 상태일 때: "파이프라인 실행 중..." 표시 + 자동 리프레시
- 존재하지 않는 runId: 404 에러 → 이력 페이지로 리다이렉트

### FR-2: 뉴스 선택 (Pick)

**Description**: 각 뉴스에 체크박스를 제공하여 뉴스레터에 포함할 기사를 선택한다.

**Acceptance Criteria**:
- [ ] 각 뉴스 카드 좌측에 체크박스를 표시한다
- [ ] 카테고리별 "전체 선택/해제" 토글을 제공한다
- [ ] 선택된 기사 수를 카테고리 헤더에 표시한다 (예: "Cloud (3/7)")
- [ ] 선택 상태는 클라이언트 상태(Zustand)로 관리한다
- [ ] 우측 사이드바에 선택된 기사 목록을 카테고리별로 표시한다
- [ ] 사이드바에서 개별 기사 제거(선택 해제) 가능하다

**Edge Cases**:
- 아무것도 선택하지 않은 상태에서 "미리보기" 클릭: 비활성화 또는 안내 메시지
- 카테고리의 모든 기사를 해제하면 해당 카테고리가 사이드바에서 사라진다

### FR-3: 뉴스레터 미리보기

**Description**: 선택한 기사로 뉴스레터 HTML을 생성하여 미리보기를 제공한다.

**Acceptance Criteria**:
- [ ] "미리보기" 버튼 클릭 시 선택한 기사로 뉴스레터 HTML을 렌더링한다
- [ ] HTML 템플릿은 기존 old_source의 report_layout/category_layout/contents_layout 구조를 따른다
- [ ] 카테고리별 섹션으로 구분되고, 카테고리 배지(#0047FF)와 함께 표시된다
- [ ] 각 기사: 썸네일(140x140), 제목(링크), 요약 텍스트, 출처 | 발행일
- [ ] 썸네일 없는 기사는 텍스트만 표시하는 레이아웃 적용
- [ ] 뉴스레터 제목(기본값: "주간동향"), 부제목(수집 통계) 편집 가능
- [ ] 미리보기는 iframe 또는 별도 패널에서 실제 이메일과 동일한 형태로 렌더링

**Edge Cases**:
- 선택 기사가 0건: 미리보기 버튼 비활성화
- 요약이 없는 기사: snippet을 fallback으로 사용

### FR-4: 뉴스레터 발송 (P1)

**Description**: 미리보기 화면에서 뉴스레터를 이메일로 발송한다.

**Acceptance Criteria**:
- [ ] 수신자 이메일 입력 필드 (다중 입력 가능)
- [ ] "발송" 버튼으로 백엔드 API 호출 (`POST /newsletter/send`)
- [ ] 발송 중 로딩 상태 표시
- [ ] 발송 성공/실패 결과 표시

### FR-5: CSV 내보내기 (P1)

**Description**: 선택한 기사를 CSV 파일로 다운로드한다.

**Acceptance Criteria**:
- [ ] "CSV 내보내기" 버튼으로 선택된 기사를 CSV 다운로드
- [ ] 컬럼: 카테고리, 키워드, 제목, 링크, 요약, 출처, 발행일
- [ ] UTF-8 BOM 인코딩 (Excel 한글 호환)

---

## 5. Non-Functional Requirements

### Performance
- Run별 뉴스 조회 응답 시간 < 500ms
- TanStack Query 캐싱으로 동일 run 재조회 시 네트워크 요청 없음

### Security
- 모든 API 호출에 JWT 인증 필수
- 이메일 발송 API는 rate limiting 적용 (분당 5회)

---

## 6. Technical Considerations

### 신규 도입: TanStack Query

- `@tanstack/react-query` v5를 프론트엔드에 추가
- `QueryClientProvider`를 App 루트에 설정
- 기존 Zustand store(newsStore, pipelineStore)는 유지하되, **서버 상태(API 데이터 페칭/캐싱)는 TanStack Query**로, **클라이언트 상태(선택 목록, UI 토글)는 Zustand**로 역할 분리
- custom hooks 패턴: `useRunNews(runId)`, `usePipelineRuns()` 등

### 백엔드 확장 필요

- `GET /pipeline/runs/:id` — 이미 존재. news와 함께 summary도 include 필요 (`include: { news: { include: { summary: true, category: true } } }`)
- `POST /newsletter/send` — 신규. HTML 본문 + 수신자 목록을 받아 이메일 발송 (P1, 별도 phase)

### 기존 패턴

- feature-based 디렉토리 구조: `features/newsletter/`
- 라우팅: `/runs/:id` 추가
- 컴포넌트 패턴: CategoryPage 참조 (페이지 → 하위 컴포넌트 분리)

### 뉴스레터 HTML 생성

- 프론트엔드에서 템플릿 문자열 조합으로 HTML 생성 (old_source 방식)
- 템플릿은 `features/newsletter/templates/` 에 저장
- iframe `srcdoc`로 미리보기 렌더링

### Dependencies

- `@tanstack/react-query` v5
- 이메일 발송: 백엔드에 nodemailer 추가 (P1)

---

## 7. Pages & Routes

```
/                          → 뉴스 목록 + 파이프라인 실행 (기존)
/runs/:id                  → Run별 뉴스 조회 + 기사 선택 + 뉴스레터 미리보기
/categories                → 카테고리 관리 (기존)
```

---

## 8. Affected Code

### New Files (예상)
```
apps/user-client/src/features/newsletter/
  RunDetailPage.tsx                     # Run별 뉴스 조회 + 선택 페이지
  components/RunNewsList.tsx            # 카테고리별 그룹화된 뉴스 목록
  components/RunNewsCard.tsx            # 선택 가능한 뉴스 카드
  components/SelectionSidebar.tsx       # 선택된 기사 사이드바
  components/NewsletterPreview.tsx      # 뉴스레터 HTML 미리보기
  components/NewsletterHeader.tsx       # 제목/부제목 편집
  hooks/useRunNews.ts                   # TanStack Query: run별 뉴스 조회
  hooks/usePipelineRuns.ts             # TanStack Query: 파이프라인 이력
  stores/selectionStore.ts              # Zustand: 선택 상태 관리
  services/newsletterApi.ts             # API 호출 (발송, CSV)
  templates/                            # HTML 템플릿 문자열
  index.ts                              # barrel export

apps/user-client/src/lib/
  queryClient.ts                        # TanStack Query 설정
```

### Existing Files (수정)
```
apps/user-client/src/App.tsx                    # /runs/:id 라우트 추가
apps/user-client/src/features/pipeline/
  components/PipelineHistory.tsx                 # row 클릭 → navigate 추가
apps/api-server/src/pipeline/pipeline.service.ts # findRunById에 summary include 추가
```

---

## 9. Out of Scope

- 실시간 파이프라인 진행 상태 (WebSocket)
- 뉴스 기사 본문(content) 전문 크롤링
- DBSCAN 클러스터링 (old_source의 중복 기사 그룹화)
- 기사 순서 드래그앤드롭 (P2)
- 인라인 요약 편집 (P2)
- 발송 이력 관리
- 다크 모드

---

## 10. Open Questions

| Question | Resolution |
|----------|------------|
| 이메일 발송 SMTP 설정은 기존 Gmail 사용? | P1 구현 시 결정 |
| 뉴스레터 HTML 템플릿 커스터마이즈 UI 필요? | Out of scope — 코드 레벨 수정 |
| 기존 04-news-ui의 메인 뉴스 목록 페이지는 유지? | 유지 (홈페이지 역할) |
