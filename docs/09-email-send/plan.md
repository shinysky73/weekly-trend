# TDD Plan: 뉴스레터 이메일 발송

**PRD**: `docs/09-email-send/prd.md`
**Created**: 2026-03-14
**Status**: Complete

---

## Phase 0: Setup

### Setup Tasks:
- [x] `nodemailer` 패키지 설치 (`pnpm -F @weekly-trend/api-server add nodemailer` + `@types/nodemailer`)
- [x] Prisma schema에 `NewsletterSend` 모델 추가 + `prisma generate`
- [x] `apps/api-server/src/newsletter/` 모듈 디렉토리 생성
- [x] NestJS 모듈 scaffolding (newsletter.module.ts, controller, service)
- [x] AppModule에 NewsletterModule import
- [x] 환경변수 확인: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- [x] vite proxy에 `/newsletter` 경로 추가

---

# Backend (TDD)

## Phase 1: Newsletter Service — 이메일 발송

**Test File**: `apps/api-server/src/newsletter/newsletter.service.spec.ts`
**Impl File**: `apps/api-server/src/newsletter/newsletter.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- newsletter.service.spec.ts`

### Tests:
- [x] shouldSendEmailWithHtmlBody: HTML 본문과 제목을 포함하여 이메일 발송한다
- [x] shouldSendToMultipleRecipients: 여러 수신자에게 동시 발송한다
- [x] shouldSaveNewsletterSendRecord: 발송 성공 시 DB에 이력을 저장한다 (subject, recipientCount, status='sent')
- [x] shouldSaveFailedRecord: 발송 실패 시 DB에 status='failed'로 이력을 저장한다
- [x] shouldThrowWhenSmtpFails: SMTP 연결 실패 시 적절한 에러를 던진다

---

## Phase 2: Newsletter Controller — DTO 검증 및 엔드포인트

**Test File**: `apps/api-server/src/newsletter/newsletter.controller.spec.ts`
**Impl File**: `apps/api-server/src/newsletter/newsletter.controller.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- newsletter.controller.spec.ts`

### Tests:
- [x] shouldSendNewsletter: POST /newsletter/send 호출 시 서비스의 send 메서드를 호출한다
- [x] shouldReturnSendHistory: GET /newsletter/sends 호출 시 발송 이력 목록을 반환한다
- [x] shouldRejectEmptyRecipients: recipients가 빈 배열이면 400을 반환한다
- [x] shouldRejectMissingHtml: html 필드 누락 시 400을 반환한다

---

# Frontend Logic (TDD)

## Phase 3: Newsletter Send API

**Test File**: `apps/user-client/src/features/newsletter/services/newsletterSendApi.test.ts`
**Impl File**: `apps/user-client/src/features/newsletter/services/newsletterSendApi.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- newsletterSendApi.test.ts`

### Tests:
- [x] shouldSendNewsletter: `sendNewsletter()` 호출 시 `POST /newsletter/send`에 html, subject, recipients 전달
- [x] shouldFetchSendHistory: `fetchSendHistory()` 호출 시 `GET /newsletter/sends` 요청하여 이력 반환

---

# UI/UX (Non-TDD)

## Phase 4: SendNewsletterForm 컴포넌트

**Files**:
- `apps/user-client/src/features/newsletter/components/SendNewsletterForm.tsx`
- `apps/user-client/src/features/newsletter/components/NewsletterPreview.tsx` (수정)

### Tasks:
- [x] SendNewsletterForm: 수신자 입력 필드 (다중 입력, 쉼표/엔터로 태그 추가)
- [x] 수신자 태그 UI (개별 제거 가능)
- [x] 잘못된 이메일 형식 입력 시 인라인 에러
- [x] "테스트 발송" 버튼 (로그인 사용자 이메일로 발송)
- [x] "전체 발송" 버튼
- [x] 발송 중 로딩 상태 + 버튼 비활성화
- [x] 발송 성공/실패 결과 메시지 (toast 또는 인라인)
- [x] NewsletterPreview에 SendNewsletterForm 통합 (미리보기 하단)

---

## Phase 5: 발송 이력 표시

Phase 5는 optional로 보류. 발송 이력은 DB에 저장되며 `GET /newsletter/sends` API로 조회 가능.

---

## Progress Summary

| Section | Phase | Total | Done | Status |
|---------|-------|-------|------|--------|
| Setup | 0 | 7 | 7 | Complete |
| Backend (TDD) | 1-2 | 9 | 9 | Complete |
| Frontend Logic (TDD) | 3 | 2 | 2 | Complete |
| UI/UX | 4 | 8 | 8 | Complete |
| UI/UX (optional) | 5 | 2 | 0 | Deferred |
| **Total** | - | **28** | **26** | **93%** |

---

## Notes

- Nodemailer는 `createTransport({ host, port, auth })` 패턴. 테스트에서는 transport를 mock
- Rate limiting은 NestJS `@nestjs/throttler` 또는 커스텀 guard로 구현 가능. 이번 scope에서는 간단한 구현 우선
- Gmail SMTP: 앱 비밀번호 필요. 환경변수가 없으면 서비스 시작 시 경고 로그
- vite proxy: `/newsletter` → backend 추가 필요
- 테스트 커맨드의 패키지명: `@weekly-trend/user-client`, `@weekly-trend/api-server` (CLAUDE.md 기준)
