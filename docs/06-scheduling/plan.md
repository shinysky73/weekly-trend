# TDD Plan: 주간 스케줄링

**PRD**: `docs/06-scheduling/prd.md`
**Created**: 2026-03-14
**Status**: Planning

---

## Phase 0: Test Setup

**Test File**: `apps/api-server/src/pipeline/pipeline.service.spec.ts`
**Impl File**: `apps/api-server/src/pipeline/pipeline.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- pipeline.service.spec.ts`

### Setup Tasks:
- [ ] `@nestjs/schedule` 패키지 설치
- [ ] 기존 테스트 파일에 새 describe 블록 추가 준비
- [ ] PrismaService mock에 `updateMany` 추가 (orphan 처리용)

---

# Backend (TDD)

## Phase 1: Cron 스케줄링 핵심 기능

**Test File**: `apps/api-server/src/pipeline/pipeline.service.spec.ts`
**Impl File**: `apps/api-server/src/pipeline/pipeline.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- pipeline.service.spec.ts`

### Tests:
- [ ] shouldCallStartPipelineOnScheduledRun: `handleScheduledRun()` 호출 시 `startPipeline()`을 실행한다
- [ ] shouldSkipWhenPipelineAlreadyRunning: 이미 실행 중(ConflictException)이면 건너뛰고 로그만 남긴다
- [ ] shouldLogScheduledRunStart: 스케줄 실행 시작 시 로그를 기록한다
- [ ] shouldLogScheduledRunCompletion: 스케줄 실행 완료(또는 스킵) 시 로그를 기록한다

---

## Phase 2: Orphan 실행 처리

**Test File**: `apps/api-server/src/pipeline/pipeline.service.spec.ts`
**Impl File**: `apps/api-server/src/pipeline/pipeline.service.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- pipeline.service.spec.ts`

### Tests:
- [ ] shouldMarkOrphanRunsAsFailedOnBootstrap: 서버 부팅 시 status="running"인 PipelineRun을 모두 "failed"로 업데이트한다
- [ ] shouldSetErrorLogForOrphanRuns: orphan 처리 시 errorLog에 "서버 재시작으로 인한 중단" 메시지를 기록한다
- [ ] shouldLogOrphanCount: orphan이 존재할 때 처리 건수를 로깅한다
- [ ] shouldDoNothingWhenNoOrphanRuns: running 상태 PipelineRun이 없으면 아무 작업도 하지 않는다

---

## Phase 3: 모듈 통합

**Test File**: `apps/api-server/src/pipeline/pipeline.module.spec.ts`
**Impl File**: `apps/api-server/src/pipeline/pipeline.module.ts`
**Command**: `pnpm -F @weekly-trend/api-server test -- pipeline.module.spec.ts`

### Tests:
- [ ] shouldImportScheduleModule: PipelineModule이 ScheduleModule을 import한다
- [ ] shouldHaveCronDecorator: `handleScheduledRun` 메서드에 `@Cron()` 데코레이터가 매주 월요일 09:00 KST로 설정되어 있다

---

## Progress Summary

| Section | Phase | Total | Done | Status |
|---------|-------|-------|------|--------|
| Setup | 0 | 3 | 0 | Pending |
| Backend (TDD) | 1-3 | 10 | 0 | Pending |
| **Total** | - | **13** | **0** | **0%** |

---

## Notes

- 프론트엔드 작업 없음 — 백엔드 전용 기능
- 기존 `pipeline.service.spec.ts`에 새 describe 블록을 추가하는 방식으로 진행
- `startPipeline()`의 동시 실행 방지(ConflictException)는 이미 구현됨 — 스케줄러에서 이를 catch하여 건너뛰기만 하면 됨
- `@Cron('0 0 9 * * 1', { timeZone: 'Asia/Seoul' })` 형태로 매주 월요일 09:00 KST 설정
- `OnApplicationBootstrap` 인터페이스 구현으로 orphan 처리
- `updateMany`로 status="running"인 모든 레코드를 한 번에 "failed" 처리
