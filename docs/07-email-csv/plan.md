# TDD Plan: 이메일 발송 + CSV 내보내기

**PRD**: `docs/07-email-csv/prd.md`
**Created**: 2026-03-14
**Status**: Planning

---

## Phase 0: Test Setup

**Test File**: `apps/api-server/src/email/email.service.spec.ts`
**Impl File**: `apps/api-server/src/email/email.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- email.service.spec.ts`

### Setup Tasks:
- [ ] `nodemailer`, `@types/nodemailer` 패키지 설치
- [ ] `email/` 모듈 디렉토리 생성
- [ ] 테스트 파일 describe 블록 생성 + nodemailer mock 설정

---

# Backend (TDD)

## Phase 1: HTML 이메일 템플릿 생성

**Test File**: `apps/api-server/src/email/email.service.spec.ts`
**Impl File**: `apps/api-server/src/email/email.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- email.service.spec.ts`

### Tests:
- [ ] shouldGenerateHtmlWithCategoryGrouping: 뉴스를 카테고리별로 그룹핑한 HTML을 생성한다
- [ ] shouldIncludeNewsDetailsInHtml: 각 뉴스 항목에 제목(원문 링크), 출처, 발행일, 요약을 포함한다
- [ ] shouldGenerateSubjectWithDateRange: 제목에 날짜 범위를 포함한다 (e.g., "주간 동향 2026-03-07 ~ 2026-03-14")
- [ ] shouldReturnEmptyHtmlWhenNoNews: 뉴스가 없으면 빈 컨텐츠 HTML을 반환한다

---

## Phase 2: 이메일 발송

**Test File**: `apps/api-server/src/email/email.service.spec.ts`
**Impl File**: `apps/api-server/src/email/email.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- email.service.spec.ts`

### Tests:
- [ ] shouldSendEmailViaNodemailer: nodemailer transporter의 sendMail을 올바른 인자로 호출한다
- [ ] shouldRetryOnceOnSmtpFailure: SMTP 실패 시 1회 재시도 후 실패하면 예외를 던진다
- [ ] shouldSucceedOnRetry: 첫 번째 실패 후 재시도 성공 시 정상 반환한다

---

## Phase 3: 이메일 컨트롤러 / Validation

**Test File**: `apps/api-server/src/email/email.controller.spec.ts`
**Impl File**: `apps/api-server/src/email/email.controller.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- email.controller.spec.ts`

### Tests:
- [ ] shouldCallSendEmailWithParams: `POST /email/send` 호출 시 서비스의 sendEmail을 dateFrom, dateTo, recipients로 호출한다
- [ ] shouldRejectEmptyRecipients: recipients가 빈 배열이면 400 Bad Request
- [ ] shouldRejectInvalidEmailFormat: 이메일 형식이 잘못된 수신자가 포함되면 400 Bad Request
- [ ] shouldReturnMessageWhenNoNewsToSend: 발송할 뉴스가 없으면 발송하지 않고 적절한 메시지 반환
- [ ] shouldReturn503WhenSmtpNotConfigured: SMTP 미설정 시 503 Service Unavailable

---

## Phase 4: CSV 내보내기

**Test File**: `apps/api-server/src/news/news.service.spec.ts`
**Impl File**: `apps/api-server/src/news/news.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- news.service.spec.ts`

### Tests:
- [ ] shouldGenerateCsvWithCorrectColumns: category, keyword, title, link, summary, published_date, publisher, thumbnail 컬럼으로 CSV를 생성한다
- [ ] shouldIncludeUtf8Bom: CSV 시작에 UTF-8 BOM(0xEF, 0xBB, 0xBF)을 포함한다
- [ ] shouldEscapeSpecialCharacters: 콤마, 줄바꿈, 따옴표가 포함된 데이터를 올바르게 이스케이핑한다
- [ ] shouldFilterByCategoryIdAndDateRange: categoryId, dateFrom, dateTo 필터가 적용된 뉴스를 내보낸다
- [ ] shouldReturnEmptyCsvWhenNoData: 데이터가 없으면 헤더만 포함된 CSV를 반환한다

---

## Phase 5: CSV 컨트롤러

**Test File**: `apps/api-server/src/news/news.controller.spec.ts`
**Impl File**: `apps/api-server/src/news/news.controller.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- news.controller.spec.ts`

### Tests:
- [ ] shouldSetContentDispositionHeader: 응답에 `Content-Disposition: attachment; filename="weekly-trend-YYYY-MM-DD.csv"` 헤더를 설정한다
- [ ] shouldSetContentTypeToCsv: `Content-Type: text/csv; charset=utf-8` 헤더를 설정한다
- [ ] shouldPassQueryParamsToService: dateFrom, dateTo, categoryId 쿼리 파라미터를 서비스에 전달한다

---

# Frontend Logic (TDD)

## Phase 6: Email/CSV API Service

**Test File**: `apps/user-client/src/features/news/services/exportApi.test.ts`
**Impl File**: `apps/user-client/src/features/news/services/exportApi.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- exportApi.test.ts`

### Tests:
- [ ] shouldSendEmailRequest: `sendEmail(dateFrom, dateTo, recipients)` 호출 시 `POST /email/send` 요청
- [ ] shouldBuildCsvDownloadUrl: `getCsvDownloadUrl(dateFrom, dateTo, categoryId)` 호출 시 쿼리 파라미터 포함 URL 생성
- [ ] shouldHandleEmailError: 이메일 발송 실패 시 에러 메시지 추출

---

# UI/UX (Non-TDD)

## Phase 7: CSV 다운로드 & 이메일 발송 UI

**Files**:
- `apps/user-client/src/features/news/components/ExportToolbar.tsx`
- `apps/user-client/src/features/news/components/EmailDialog.tsx`
- `apps/user-client/src/features/news/NewsPage.tsx` (기존 파일 수정)

### Tasks:
- [ ] ExportToolbar 컴포넌트 구현 ("CSV 다운로드" + "이메일 발송" 버튼)
- [ ] CSV 다운로드: 현재 필터 조건으로 `<a href>` 다운로드 트리거
- [ ] EmailDialog 컴포넌트 구현 (수신자 입력 모달)
- [ ] 수신자 입력 UI (여러 이메일 추가/삭제)
- [ ] 발송 중 로딩 상태 + 버튼 비활성화
- [ ] 발송 완료/실패 피드백 (성공 토스트 or 에러 메시지)
- [ ] NewsPage에 ExportToolbar 통합

---

## Phase 8: 모듈 통합

**Files**:
- `apps/api-server/src/email/email.module.ts`
- `apps/api-server/src/email/dto/send-email.dto.ts`
- `apps/api-server/src/app.module.ts`

### Tasks:
- [ ] EmailModule 생성 (controller + service)
- [ ] SendEmailDto 정의 (dateFrom, dateTo, recipients + validation)
- [ ] AppModule에 EmailModule import
- [ ] SMTP 환경변수 ConfigService 연동

---

## Progress Summary

| Section | Phase | Total | Done | Status |
|---------|-------|-------|------|--------|
| Setup | 0 | 3 | 0 | Pending |
| Backend (TDD) | 1-5 | 20 | 0 | Pending |
| Frontend Logic (TDD) | 6 | 3 | 0 | Pending |
| UI/UX | 7-8 | 11 | 0 | Pending |
| **Total** | - | **37** | **0** | **0%** |

---

## Notes

- nodemailer mock: `jest.mock('nodemailer')` 또는 transporter를 DI로 주입하여 테스트
- CSV 생성은 별도 라이브러리 없이 직접 구현 (간단한 포맷)
- 대량 데이터 시 스트리밍 고려하되, 초기에는 버퍼 방식으로 구현
- EmailLog DB 모델은 초기 스코프에서 제외 — 로깅만으로 충분 (PRD 노트 참고)
- SMTP 미설정 시 이메일 기능만 503, 나머지 기능에 영향 없도록 설계
- 이메일 발송 이력 조회 UI, 자동 발송 스케줄링은 Out of Scope
