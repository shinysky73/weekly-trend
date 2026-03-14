# PRD: 뉴스레터 템플릿 커스터마이즈

**Author**: weekly-trend team
**Created**: 2026-03-14
**Status**: Draft
**Depends on**: Phase 8 (뉴스레터 편집 UI), Phase 9 (이메일 발송)

---

## 1. Problem Statement

### Background

현재 뉴스레터 HTML은 코드에 하드코딩된 템플릿으로 생성된다 (old_source의 report_layout 기반). 제목과 부제목만 편집 가능하고, 레이아웃/색상/로고 등은 코드 수정이 필요하다.

### Problem

- 팀/부서마다 다른 뉴스레터 디자인이 필요할 수 있다
- 로고, 색상, 푸터 문구 등을 변경하려면 개발자가 코드를 수정해야 한다
- 카테고리 배지 색상, 폰트 등 세부 스타일 조정 불가

### Impact

비개발자가 뉴스레터 디자인을 자율적으로 변경할 수 없어 매번 개발자 지원이 필요하다.

---

## 2. Goals & Success Metrics

### Primary Goal

코드 수정 없이 뉴스레터 템플릿의 주요 요소를 UI에서 커스터마이즈할 수 있게 한다.

### Success Metrics

| Metric | Target |
|--------|--------|
| 커스터마이즈 가능 항목 수 | 5개 이상 |
| 설정 변경 → 미리보기 반영 시간 | < 1초 |

---

## 3. Functional Requirements

### FR-1: 템플릿 설정 관리

**Description**: 뉴스레터 템플릿의 커스터마이즈 가능한 설정을 DB에 저장/조회한다.

**Acceptance Criteria**:
- [ ] 설정 항목: 로고 URL, 헤더 배경색, 카테고리 배지 색상, 푸터 텍스트, 폰트
- [ ] `GET /newsletter/template` — 현재 템플릿 설정 조회
- [ ] `PUT /newsletter/template` — 템플릿 설정 저장
- [ ] 기본값이 존재하여 설정 없이도 동작

### FR-2: 템플릿 설정 UI

**Description**: 뉴스레터 미리보기 화면에 템플릿 설정 패널을 추가한다.

**Acceptance Criteria**:
- [ ] 사이드 패널 또는 모달로 설정 UI 제공
- [ ] 색상 선택: 컬러 피커 (헤더 배경, 카테고리 배지)
- [ ] 텍스트 입력: 로고 URL, 푸터 문구
- [ ] 변경 시 미리보기 실시간 반영
- [ ] "저장" 버튼으로 서버에 영구 저장
- [ ] "기본값 복원" 버튼

### FR-3: 템플릿 엔진 확장

**Description**: HTML 생성 로직이 커스텀 설정을 반영하도록 확장한다.

**Acceptance Criteria**:
- [ ] `generateNewsletterHtml()`가 템플릿 설정을 파라미터로 받음
- [ ] 하드코딩된 값(#0047FF, #e3edff, 로고 URL 등)을 설정값으로 대체
- [ ] 설정 누락 시 기본값 fallback

---

## 4. Technical Considerations

### Schema

```prisma
model NewsletterTemplate {
  id              Int      @id @default(autoincrement())
  logoUrl         String?
  headerBgColor   String   @default("#e3edff")
  badgeColor      String   @default("#0047FF")
  footerText      String   @default("weekly-trend")
  fontFamily      String   @default("Noto Sans, Arial, sans-serif")
  updatedAt       DateTime @updatedAt
}
```

### Affected Code

```
apps/api-server/src/newsletter/          # 신규 또는 확장
  newsletter.controller.ts               # template CRUD
  newsletter.service.ts
apps/user-client/src/features/newsletter/
  components/TemplateSettings.tsx         # 신규
  services/newsletterHtml.ts             # 설정 파라미터 추가
  services/newsletterApi.ts              # fetchTemplate, saveTemplate 추가
```

---

## 5. Out of Scope

- 드래그앤드롭 비주얼 에디터
- 다중 템플릿 관리 (템플릿 목록)
- 카테고리별 다른 스타일
- 커스텀 HTML 직접 편집
- 이미지 업로드 (로고는 URL 입력만)
