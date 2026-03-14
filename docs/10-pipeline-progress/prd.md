# PRD: 파이프라인 실시간 진행 상태

**Author**: weekly-trend team
**Created**: 2026-03-14
**Status**: Draft
**Depends on**: Phase 2 (뉴스 수집), Phase 8 (뉴스레터 편집 UI)

---

## 1. Problem Statement

### Background

파이프라인은 비동기로 실행되며 카테고리/키워드를 순회하면서 뉴스를 수집하고 요약한다. 현재는 실행 시작과 완료만 알 수 있고, 중간 진행 상태가 없다.

### Problem

- 파이프라인 실행 중 어떤 카테고리/키워드가 처리되고 있는지 알 수 없다
- API 할당량 초과로 중단되어도 사용자에게 즉시 알리지 않는다
- 키워드 없이 실행하면 0건으로 조용히 완료되어 원인 파악이 어렵다

### Impact

사용자가 파이프라인 상태를 파악하지 못해 불필요하게 대기하거나, 실패 원인을 알지 못한다.

---

## 2. Goals & Success Metrics

### Primary Goal

파이프라인 실행 중 실시간 진행 상태를 UI에 표시한다.

### Success Metrics

| Metric | Target |
|--------|--------|
| 진행률 업데이트 간격 | 키워드 처리 완료 시마다 (실시간) |
| 사용자가 현재 처리 중인 키워드를 알 수 있는가 | Yes |

---

## 3. Functional Requirements

### FR-1: 진행 상태 기록

**Description**: 파이프라인 실행 중 키워드별 처리 상태를 DB에 기록한다.

**Acceptance Criteria**:
- [ ] PipelineRun에 진행 상태 필드 추가 (processedKeywords, totalKeywords, currentKeyword)
- [ ] 키워드 처리 완료 시마다 DB 업데이트
- [ ] 할당량 초과 시 상태에 기록 (quotaExceeded: true)

### FR-2: 진행 상태 조회 API

**Description**: 실행 중인 파이프라인의 진행 상태를 조회하는 API.

**Acceptance Criteria**:
- [ ] `GET /pipeline/runs/:id` 응답에 진행 상태 필드 포함
- [ ] 또는 별도 `GET /pipeline/runs/:id/progress` 엔드포인트
- [ ] 응답: `{ processedKeywords, totalKeywords, currentKeyword, quotaExceeded }`

### FR-3: 진행 상태 UI

**Description**: HomePage와 RunDetailPage에서 파이프라인 진행 상태를 시각적으로 표시한다.

**Acceptance Criteria**:
- [ ] PipelinePanel: 실행 중 progress bar + 현재 키워드 표시
- [ ] "AI/10 키워드 처리 중 (7/10)" 형태
- [ ] 할당량 초과 시 경고 메시지
- [ ] 키워드가 0개일 때 실행 전 경고: "등록된 키워드가 없습니다"

### FR-4: 실행 전 검증

**Description**: 파이프라인 실행 전 키워드 존재 여부를 확인한다.

**Acceptance Criteria**:
- [ ] 키워드 0개 시 파이프라인 실행 거부 + 안내 메시지
- [ ] 또는 확인 다이얼로그: "등록된 키워드가 없습니다. 카테고리 관리 페이지로 이동하시겠습니까?"

---

## 4. Technical Considerations

### 방식 선택: Polling vs WebSocket

| | Polling | WebSocket (SSE) |
|---|---------|-----------------|
| 구현 복잡도 | 낮음 | 높음 |
| 실시간성 | 3-5초 간격 | 즉시 |
| 서버 부하 | 낮음 (주간 1회) | 낮음 |

**권장**: Polling 방식. 주간 1회 실행이므로 WebSocket은 과도한 복잡성.

### Schema 변경

```prisma
model PipelineRun {
  // 기존 필드...
  processedKeywords Int       @default(0)
  totalKeywords     Int       @default(0)
  currentKeyword    String?
  quotaExceeded     Boolean   @default(false)
}
```

---

## 5. Out of Scope

- WebSocket / Server-Sent Events
- 개별 뉴스 수집 진행 상태 (키워드 단위까지만)
- 파이프라인 취소 기능
- 파이프라인 재시도 기능
