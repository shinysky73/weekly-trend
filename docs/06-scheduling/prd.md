# PRD: Phase 5 — 주간 스케줄링

**Parent PRD**: `docs/01-weekly-trend-core/prd.md`
**Author**: weekly-trend team
**Created**: 2026-03-13
**Updated**: 2026-03-13
**Status**: Draft
**Depends on**: Phase 3 (파이프라인에 수집+요약 통합 완료)

---

## 1. Problem Statement

뉴스 수집+요약 파이프라인을 주간 단위로 자동 실행해야 한다. Phase 2~3에서 구축한 `POST /pipeline/run` 파이프라인에 cron 스케줄링을 추가한다.

### Prerequisites

- Phase 2~3 완료 (파이프라인 실행 + 동시 실행 방지 이미 구현됨)
- `@nestjs/schedule` 패키지

---

## 2. Functional Requirements

### FR-1: 주간 스케줄링

**Description**: NestJS cron 데코레이터로 주간 자동 실행을 설정한다.

**Acceptance Criteria**:
- [ ] `@nestjs/schedule`의 `@Cron()` 데코레이터로 주간 스케줄 설정
- [ ] 기본 스케줄: 매주 월요일 09:00 KST
- [ ] 스케줄 실행 시 이전 실행이 아직 진행 중이면 건너뛰기 (Phase 2의 동시 실행 방지 활용)
- [ ] 스케줄 실행 시작/완료를 로깅한다

### FR-2: Orphan 실행 처리

**Description**: 서버 재시작 시 미완료 파이프라인을 정리한다.

**Acceptance Criteria**:
- [ ] 서버 부팅 시(`onApplicationBootstrap`) "running" 상태인 PipelineRun을 "failed"로 마킹
- [ ] orphan 처리 시 로그를 남긴다

---

## 3. Affected Code

### Existing Files (수정)
```
apps/api-server/src/pipeline/pipeline.module.ts   — ScheduleModule import
apps/api-server/src/pipeline/pipeline.service.ts  — @Cron 데코레이터 + orphan 처리
```

### New Dependencies
```
@nestjs/schedule                                  — cron 스케줄링
```

---

## 4. Edge Cases

- 스케줄 실행 중 서버 재시작: 부팅 시 orphan 처리
- 스케줄 트리거 시 파이프라인 진행 중: 건너뛰기 (로그만 남김)
- 수집 대상이 0개: 파이프라인 "completed" (totalNews=0)

---

## 5. Out of Scope

- 스케줄 cron 표현식 UI 설정 (코드 수준 설정)
- 파이프라인 실행 취소 기능
- 실시간 진행 상태 WebSocket 알림
