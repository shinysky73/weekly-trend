# PRD: Phase 3 — LLM 뉴스 요약 (Gemini API)

**Parent PRD**: `docs/01-weekly-trend-core/prd.md`
**Author**: weekly-trend team
**Created**: 2026-03-13
**Updated**: 2026-03-13
**Status**: Draft
**Depends on**: Phase 2 (뉴스 수집 파이프라인)

---

## 1. Problem Statement

수집된 뉴스 기사(snippet)를 Google Gemini API로 요약하여, 관리자가 핵심 내용을 빠르게 파악할 수 있도록 한다. 요약은 Phase 2에서 구축한 파이프라인의 두 번째 단계로 통합된다.

### Prerequisites

- Phase 2 완료 (News, PipelineRun 모델 및 수집 파이프라인)
- Google AI Studio에서 Gemini API 키 발급
- 환경변수: `GEMINI_API_KEY`

---

## 2. Functional Requirements

### FR-1: Gemini API 요약

**Description**: 수집된 뉴스를 Gemini API로 한국어 요약한다.

**Acceptance Criteria**:
- [ ] `@google/genai` SDK를 사용하여 Gemini API를 호출한다
- [ ] 모델: `gemini-2.0-flash` 사용
- [ ] 뉴스 제목 + snippet(또는 content)을 입력으로 250자 이내 한국어 요약을 생성한다
- [ ] 요약 결과를 `Summary` 테이블에 저장한다
- [ ] 이미 요약된 뉴스(`Summary` 존재)는 재요약하지 않는다

### FR-2: 사용량 메타데이터 기록

**Description**: API 사용량을 추적하여 비용/할당량을 모니터링한다.

**Acceptance Criteria**:
- [ ] 요약 완료 시 `SummaryMeta`에 메타데이터를 저장한다
  - `inputTokens`: 입력 토큰 수
  - `outputTokens`: 출력 토큰 수
  - `model`: 사용된 모델명
  - `processingMs`: 처리 소요 시간 (ms)
- [ ] 메타데이터는 Summary와 1:1 관계

### FR-3: 에러 핸들링 및 Rate Limit

**Description**: API 실패나 rate limit 시 안정적으로 처리한다.

**Acceptance Criteria**:
- [ ] 개별 기사 요약 실패 시 해당 기사를 건너뛰고 계속 진행한다
- [ ] Rate limit (429) 발생 시 지수 백오프 재시도 (최대 3회, 초기 1초)
- [ ] snippet이 빈 문자열인 기사: 건너뛰기
- [ ] 모든 에러를 로깅한다 (newsId, 에러 메시지)

### FR-4: 파이프라인 통합

**Description**: 요약을 기존 파이프라인의 수집 단계 이후에 자동 실행되도록 통합한다.

**Acceptance Criteria**:
- [ ] `POST /pipeline/run` 실행 시 수집 → 요약 순차 실행
- [ ] 파이프라인 완료 시 `totalSummaries`를 기록한다
- [ ] 수집 성공 + 요약 실패 시: status "failed", 수집 데이터는 유지
- [ ] `GET /news/:id` 응답에 summary, summaryMeta 포함

---

## 3. DB Schema Changes

기존 `schema.prisma`에 추가:

```prisma
model Summary {
  id        Int          @id @default(autoincrement())
  newsId    Int          @unique
  news      News         @relation(fields: [newsId], references: [id], onDelete: Cascade)
  text      String
  createdAt DateTime     @default(now())
  meta      SummaryMeta?
}

model SummaryMeta {
  id           Int      @id @default(autoincrement())
  summaryId    Int      @unique
  summary      Summary  @relation(fields: [summaryId], references: [id], onDelete: Cascade)
  inputTokens  Int
  outputTokens Int
  model        String
  processingMs Int
  createdAt    DateTime @default(now())
}
```

`News` 모델에 관계 추가:
```prisma
model News {
  // ... 기존 필드
  summary   Summary?
}
```

---

## 4. API Endpoints

기존 파이프라인/뉴스 엔드포인트 변경 없음. 동작만 확장:

```
POST   /pipeline/run                    → 수집 + 요약 순차 실행 (기존 엔드포인트에 요약 단계 추가)
GET    /news/:id                        → 뉴스 상세 (summary, summaryMeta 포함으로 확장)
```

---

## 5. Environment Variables (추가)

```
GEMINI_API_KEY=            # Google Gemini API key (Google AI Studio 발급)
```

---

## 6. Affected Code

### New Files (예상)
```
apps/api-server/src/summary/
  summary.module.ts
  summary.service.ts           — Gemini API 호출 + 요약 로직 포함
  summary.service.spec.ts
```

### Existing Files
```
apps/api-server/prisma/schema.prisma        — Summary, SummaryMeta 모델 추가, News에 관계 추가
apps/api-server/src/app.module.ts           — SummaryModule import
apps/api-server/src/pipeline/pipeline.service.ts — 요약 단계 추가
apps/api-server/src/news/news.service.ts    — 뉴스 상세 조회에 summary include
```

### New Dependencies
```
@google/genai                               — Gemini API SDK
```

---

## 7. Edge Cases

- snippet이 비어있는 기사: 요약 건너뛰기
- 토큰 제한 초과 입력: 앞부분 8000자로 truncate 후 요약
- Gemini API 무료 tier: 15 RPM, 100만 TPM, 1500 RPD — 주간 배치(~100건)에 충분
- Rate limit 지수 백오프: 1초 → 2초 → 4초 (3회 실패 시 해당 기사 건너뛰기)

---

## 8. Out of Scope

- LLM 모델 선택 UI (P2) — gemini-2.0-flash 고정
- 별도 요약 실행 엔드포인트 (`POST /summaries/run`) — 파이프라인 통합으로 불필요
- 요약 품질 평가 메트릭
- 프롬프트 템플릿 관리 UI
- 본문 기반 요약 — snippet 기반 품질 평가 후 별도 결정
