# TDD Plan: 뉴스레터 템플릿 커스터마이즈

**PRD**: `docs/11-template-customize/prd.md`
**Created**: 2026-03-14
**Status**: Completed

---

## Phase 0: Test Setup

### Backend Setup
- [x] Prisma 스키마에 `NewsletterTemplate` 모델 추가
- [x] `prisma generate` 및 `prisma db push` 실행
- [x] Newsletter module에 template 관련 테스트 파일 생성

### Frontend Setup
- [x] `newsletterTemplateApi.ts` 서비스 파일 생성
- [x] `templateStore.ts` Zustand 스토어 파일 생성

---

# Backend (TDD)

## Phase 1: Template CRUD - Service

**Test File**: `apps/api-server/src/newsletter/newsletter-template.service.spec.ts`
**Impl File**: `apps/api-server/src/newsletter/newsletter-template.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- newsletter-template.service.spec.ts`

### Tests:
- [x] shouldReturnDefaultTemplateWhenNoneExists: DB에 템플릿이 없을 때 기본값 반환
- [x] shouldReturnExistingTemplate: DB에 저장된 템플릿 설정 조회
- [x] shouldCreateTemplateWhenNoneExists: 첫 저장 시 새 레코드 생성
- [x] shouldUpdateExistingTemplate: 기존 템플릿 설정 업데이트
- [x] shouldMergePartialUpdate: 일부 필드만 전달 시 나머지는 기존값 유지

---

## Phase 2: Template CRUD - Controller

**Test File**: `apps/api-server/src/newsletter/newsletter-template.controller.spec.ts`
**Impl File**: `apps/api-server/src/newsletter/newsletter.controller.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- newsletter-template.controller.spec.ts`

### Tests:
- [x] shouldReturnTemplateOnGet: `GET /newsletter/template` 정상 응답
- [x] shouldSaveTemplateOnPut: `PUT /newsletter/template` 설정 저장
- [x] shouldRequireAuth: 인증 없이 접근 시 401 (controller-level @UseGuards)

---

## Phase 3: Template Validation & Edge Cases

**Test File**: `apps/api-server/src/newsletter/newsletter-template.service.spec.ts`
**Impl File**: `apps/api-server/src/newsletter/newsletter-template.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- newsletter-template.service.spec.ts`

### Tests:
- [x] shouldRejectInvalidHexColor: DTO @Matches 데코레이터로 유효하지 않은 색상코드 거부
- [x] shouldAcceptNullLogoUrl: 로고 URL null 허용
- [x] shouldFallbackToDefaultsOnMissingFields: 설정 누락 필드에 기본값 적용

---

# Frontend Logic (TDD)

## Phase 4: Template API Service

**Test File**: `apps/user-client/src/features/newsletter/services/newsletterTemplateApi.test.ts`
**Impl File**: `apps/user-client/src/features/newsletter/services/newsletterTemplateApi.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- newsletterTemplateApi.test.ts`

### Tests:
- [x] shouldFetchTemplate: `GET /newsletter/template` 호출 및 응답 반환
- [x] shouldSaveTemplate: `PUT /newsletter/template` 호출 및 응답 반환

---

## Phase 5: Template Store (Zustand)

**Test File**: `apps/user-client/src/features/newsletter/stores/templateStore.test.ts`
**Impl File**: `apps/user-client/src/features/newsletter/stores/templateStore.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- templateStore.test.ts`

### Tests:
- [x] shouldHaveDefaultValues: 초기 상태가 기본 템플릿 값과 일치
- [x] shouldUpdateHeaderBgColor: 헤더 배경색 변경
- [x] shouldUpdateBadgeColor: 카테고리 배지 색상 변경
- [x] shouldUpdateFooterText: 푸터 텍스트 변경
- [x] shouldUpdateLogoUrl: 로고 URL 변경
- [x] shouldUpdateFontFamily: 폰트 패밀리 변경
- [x] shouldResetToDefaults: 기본값 복원 동작
- [x] shouldLoadFromServer: 서버 데이터로 스토어 초기화

---

## Phase 6: HTML 생성 - 템플릿 설정 반영

**Test File**: `apps/user-client/src/features/newsletter/services/newsletterHtml.test.ts`
**Impl File**: `apps/user-client/src/features/newsletter/services/newsletterHtml.ts`
**Command**: `pnpm -F @weekly-trend/user-client test -- newsletterHtml.test.ts`

### Tests:
- [x] shouldApplyCustomHeaderBgColor: 커스텀 헤더 배경색이 HTML에 반영
- [x] shouldApplyCustomBadgeColor: 커스텀 배지 색상이 HTML에 반영
- [x] shouldApplyCustomFooterText: 커스텀 푸터 텍스트가 HTML에 반영
- [x] shouldApplyCustomFontFamily: 커스텀 폰트가 HTML에 반영
- [x] shouldUseDefaultsWhenNoTemplateProvided: 템플릿 설정 없으면 기존 기본값 사용
- [x] shouldApplyLogoUrl: 로고 URL이 헤더에 이미지로 표시

---

# UI/UX (Non-TDD)

## Phase 7: TemplateSettings 컴포넌트 구현

**Files**:
- `apps/user-client/src/features/newsletter/components/TemplateSettings.tsx`
- `apps/user-client/src/features/newsletter/components/NewsletterPreview.tsx` (수정)

### Tasks:
- [x] TemplateSettings 사이드 패널 컴포넌트 구현
- [x] 컬러 피커 UI (헤더 배경색, 카테고리 배지 색상)
- [x] 텍스트 입력 필드 (로고 URL, 푸터 문구, 폰트 패밀리)
- [x] "저장" 버튼 — 서버에 영구 저장
- [x] "기본값 복원" 버튼
- [x] NewsletterPreview에 설정 패널 토글 버튼 추가
- [x] 설정 변경 시 미리보기 실시간 반영 (templateStore → generateNewsletterHtml)

---

## Phase 8: Styling & Polish

**Files**:
- `apps/user-client/src/features/newsletter/components/TemplateSettings.tsx`
- `apps/user-client/src/features/newsletter/components/NewsletterPreview.tsx`

### Tasks:
- [x] 반응형 레이아웃 (사이드 패널 ↔ 미리보기 영역)
- [x] 다크모드 지원
- [x] 저장 중 로딩 상태 UI
- [x] 저장 성공/실패 피드백 (인라인 메시지)
- [x] 컬러 피커 UI 스타일링
- [x] 설정 패널 슬라이드 애니메이션

---

## Progress Summary

| Section | Phase | Total | Done | Status |
|---------|-------|-------|------|--------|
| Setup | 0 | 5 | 5 | Complete |
| Backend (TDD) | 1-3 | 11 | 11 | Complete |
| Frontend Logic (TDD) | 4-6 | 16 | 16 | Complete |
| UI/UX | 7-8 | 13 | 13 | Complete |
| **Total** | - | **45** | **45** | **100%** |

---

## Notes

- Backend: 기존 `newsletter.controller.ts`에 template 엔드포인트 추가
- `newsletterHtml.ts`의 `NewsletterOptions` 인터페이스에 `template?` 필드 추가 → 기존 테스트 호환성 유지
- 하드코딩된 상수 (`CATEGORY_BADGE_COLOR`, `APP_NAME`)는 templateSettings가 없을 때의 fallback으로 유지
- `NewsletterTemplate` 모델은 싱글톤 패턴 (항상 1개 레코드만 존재)
- `UpdateTemplateDto`에 `@Matches` 데코레이터로 hex color 검증 추가
