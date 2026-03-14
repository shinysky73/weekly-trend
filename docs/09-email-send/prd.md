# PRD: 뉴스레터 이메일 발송

**Author**: weekly-trend team
**Created**: 2026-03-14
**Status**: Draft
**Depends on**: Phase 8 (뉴스레터 편집 UI)

---

## 1. Problem Statement

### Background

뉴스레터 편집 UI(Phase 8)에서 기사를 선택하고 HTML 미리보기 + CSV 내보내기까지 구현되었다. 그러나 실제 이메일 발송 기능이 없어 뉴스레터를 수동으로 복사/발송해야 한다.

### Problem

뉴스레터 미리보기에서 바로 이메일을 발송할 수 없다. 기존 시스템(old_source)은 Gmail SMTP를 통해 직접 발송했다.

### Impact

뉴스레터 제작 → 발송까지 자동화가 불완전하여 매주 수동 작업이 필요하다.

---

## 2. Goals & Success Metrics

### Primary Goal

뉴스레터 미리보기 화면에서 수신자 목록을 입력하고 이메일을 발송한다.

### Success Metrics

| Metric | Target |
|--------|--------|
| 미리보기 → 발송까지 클릭 수 | 2회 (수신자 입력 + 발송 버튼) |
| 발송 성공률 | 95% 이상 |

---

## 3. Functional Requirements

### FR-1: 이메일 발송 API

**Description**: 뉴스레터 HTML과 수신자 목록을 받아 이메일을 발송하는 백엔드 API.

**Acceptance Criteria**:
- [ ] `POST /newsletter/send` 엔드포인트 구현
- [ ] Request body: `{ html: string, subject: string, recipients: string[] }`
- [ ] Nodemailer + Gmail SMTP로 발송
- [ ] 발송 결과(성공/실패) 응답
- [ ] Rate limiting: 분당 5회 제한
- [ ] JWT 인증 필수

**Edge Cases**:
- 수신자 목록 빈 배열: 400 Bad Request
- 잘못된 이메일 형식: 개별 건 검증 후 유효한 것만 발송
- SMTP 연결 실패: 503 Service Unavailable

### FR-2: 발송 UI

**Description**: 뉴스레터 미리보기 화면에 발송 기능 추가.

**Acceptance Criteria**:
- [ ] 수신자 이메일 입력 필드 (다중 입력, 쉼표/엔터 구분)
- [ ] "테스트 발송" 버튼 (자기 자신에게 발송)
- [ ] "전체 발송" 버튼
- [ ] 발송 중 로딩 상태 + 버튼 비활성화
- [ ] 발송 성공/실패 toast 알림

### FR-3: 발송 이력

**Description**: 발송한 뉴스레터 이력을 기록한다.

**Acceptance Criteria**:
- [ ] 발송 시 DB에 이력 저장 (발송일, 수신자 수, 제목, pipelineRunId)
- [ ] PipelineHistory 또는 별도 페이지에서 발송 이력 조회 가능

---

## 4. Technical Considerations

### Dependencies
- `nodemailer` 패키지 추가 (backend)
- Gmail SMTP 설정: 앱 비밀번호 또는 OAuth2
- 환경변수: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### New DB Model
```prisma
model NewsletterSend {
  id             Int       @id @default(autoincrement())
  pipelineRunId  Int?
  subject        String
  recipientCount Int
  status         String    // 'sent', 'failed'
  sentAt         DateTime  @default(now())
}
```

### Affected Code
```
apps/api-server/src/newsletter/          # 신규 모듈
  newsletter.controller.ts
  newsletter.service.ts
  dto/send-newsletter.dto.ts
apps/user-client/src/features/newsletter/
  components/SendNewsletterForm.tsx       # 신규
  services/newsletterApi.ts              # sendNewsletter() 추가
```

---

## 5. Out of Scope

- 수신자 목록 관리 (주소록)
- 발송 예약 (스케줄링)
- 발송 추적 (오픈율, 클릭률)
- HTML 템플릿 에디터

---

## 6. Environment Variables

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=solution.biz.center@vntgcorp.com
SMTP_PASS=<app-password>
```
