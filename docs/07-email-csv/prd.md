# PRD: Phase 6 — 이메일 발송 + CSV 내보내기

**Parent PRD**: `docs/01-weekly-trend-core/prd.md`
**Author**: weekly-trend team
**Created**: 2026-03-13
**Updated**: 2026-03-13
**Status**: Draft
**Priority**: P1
**Depends on**: Phase 3 (LLM 요약), Phase 4a (뉴스 조회 UI)

---

## 1. Problem Statement

요약된 주간 동향 결과를 이메일로 팀에 공유하고, CSV로 내보내어 외부 보고서 작성에 활용할 수 있어야 한다.

### Prerequisites

- Phase 3 완료 (뉴스 요약 데이터 존재)
- Phase 4a 완료 (UI에서 버튼 연동)
- SMTP 서버 접근 가능 (환경변수로 설정)

---

## 2. Functional Requirements

### FR-1: HTML 이메일 발송

**Description**: 카테고리별로 그룹핑된 요약 결과를 HTML 이메일로 발송한다.

**Acceptance Criteria**:
- [ ] `POST /email/send` — 이메일 발송 API
  - Request body: `{ dateFrom, dateTo, recipients: string[] }`
- [ ] 카테고리별로 그룹핑된 HTML 이메일 템플릿을 생성한다
- [ ] 각 뉴스 항목: 제목(원문 링크), 출처, 발행일, 요약
- [ ] nodemailer로 SMTP 발송
- [ ] SMTP 자격증명은 환경변수로만 관리

### FR-2: 이메일 에러 핸들링

**Description**: 발송 실패 시 안정적으로 처리한다.

**Acceptance Criteria**:
- [ ] SMTP 서버 연결 실패: 1회 재시도 후 실패 로깅
- [ ] 수신자 목록이 비어있을 때: 발송하지 않고 400 Bad Request
- [ ] 발송할 뉴스/요약이 없을 때: 발송하지 않고 적절한 메시지 반환

### FR-3: CSV 내보내기

**Description**: 수집/요약 결과를 CSV 파일로 다운로드한다.

**Acceptance Criteria**:
- [ ] `GET /news/export/csv` — CSV 다운로드 API
  - Query params: `dateFrom`, `dateTo`, `categoryId` (선택)
- [ ] 컬럼: category, keyword, title, link, summary, published_date, publisher, thumbnail
- [ ] UTF-8 BOM 인코딩 (Excel 호환)
- [ ] Content-Disposition 헤더로 파일명 지정 (`weekly-trend-YYYY-MM-DD.csv`)

### FR-4: 프론트엔드 연동

**Description**: UI에서 이메일 발송과 CSV 다운로드를 실행할 수 있다.

**Acceptance Criteria**:
- [ ] 뉴스 목록 페이지에 "CSV 다운로드" 버튼
- [ ] "이메일 발송" 버튼 (수신자 입력 다이얼로그)
- [ ] 발송 완료/실패 시 사용자 피드백

---

## 3. DB Schema Changes (선택)

이메일 발송 이력 저장이 필요한 경우:

```prisma
model EmailLog {
  id         Int      @id @default(autoincrement())
  recipients String[]
  subject    String
  status     String   // success | failed
  errorLog   String?
  sentAt     DateTime @default(now())
}
```

> Note: 초기에는 로깅만으로 충분하면 DB 없이 구현 가능. 발송 이력 조회 UI가 필요해지면 추가.

---

## 4. API Endpoints

```
POST   /email/send                      → 이메일 발송
GET    /news/export/csv                  → CSV 다운로드
```

---

## 5. Environment Variables (추가)

```
SMTP_HOST=                 # SMTP 서버 호스트
SMTP_PORT=                 # SMTP 포트 (default: 587)
SMTP_USER=                 # SMTP 사용자
SMTP_PASS=                 # SMTP 비밀번호
SMTP_FROM=                 # 발신자 이메일 주소
```

---

## 6. Affected Code

### New Files (예상)
```
apps/api-server/src/email/
  email.module.ts
  email.controller.ts
  email.service.ts             — nodemailer + HTML 템플릿 포함
  email.controller.spec.ts
  email.service.spec.ts
```

### Existing Files
```
apps/api-server/src/app.module.ts               — EmailModule import
apps/api-server/src/news/news.controller.ts     — CSV 엔드포인트 추가
apps/user-client/src/features/news/NewsPage.tsx  — CSV 다운로드, 이메일 발송 버튼
```

### New Dependencies
```
nodemailer                                      — SMTP 이메일 발송
@types/nodemailer                               — TypeScript 타입
```

---

## 7. Edge Cases

- SMTP 서버 미설정 시: 이메일 관련 API가 503 반환, 다른 기능에 영향 없음
- 대량 뉴스 CSV 내보내기: 스트리밍 응답으로 메모리 절약
- CSV 내 특수문자(콤마, 줄바꿈): 적절한 이스케이핑
- 수신자 이메일 형식 검증: 기본적인 이메일 형식 validation

---

## 8. Out of Scope

- 이메일 템플릿 커스터마이징 UI
- 이메일 발송 스케줄링 (파이프라인 완료 후 자동 발송은 추후)
- Slack/Webhook 알림 (P2 — 별도 PRD)
- 수신자 목록 DB 관리 (API 호출 시 직접 지정)
- 이메일 발송 이력 조회 UI
