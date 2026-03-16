# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

weekly-trend — pnpm 모노레포로 NestJS 백엔드와 React 프론트엔드로 구성되어 있다.

## Commands

### Root (monorepo)

```bash
pnpm install          # Install all dependencies
pnpm dev              # Run all apps in development mode
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm test             # Test all apps
```

### API Server (apps/api-server)

```bash
pnpm -F @weekly-trend/api-server dev          # Start dev server with watch (port 3002)
pnpm -F @weekly-trend/api-server build        # Build for production
pnpm -F @weekly-trend/api-server test         # Run tests
pnpm -F @weekly-trend/api-server test:watch   # Run tests in watch mode
pnpm -F @weekly-trend/api-server test:cov     # Run tests with coverage
pnpm -F @weekly-trend/api-server lint         # Lint and fix

# Database (Prisma)
cd apps/api-server && npx prisma generate       # Generate Prisma client
cd apps/api-server && npx prisma migrate dev     # Run migrations
cd apps/api-server && npx prisma db push         # Push schema to database
```

### User Client (apps/user-client)

```bash
pnpm -F @weekly-trend/user-client dev         # Start Vite dev server (port 5175)
pnpm -F @weekly-trend/user-client build       # Build for production
pnpm -F @weekly-trend/user-client lint        # Lint
pnpm -F @weekly-trend/user-client preview     # Preview production build
pnpm -F @weekly-trend/user-client test        # Run tests
pnpm -F @weekly-trend/user-client test:watch  # Run tests in watch mode
```

### Docker

```bash
docker-compose up --build       # Build and run all services
docker-compose up -d --build    # Background mode
docker-compose down             # Stop all services
```

## Architecture

### Monorepo Structure

```
apps/
  api-server/      # NestJS backend (port 3002)
  user-client/     # React frontend (port 5175)
```

### Backend (api-server)

NestJS 11 application with modular architecture:

- **auth/**: JWT 인증 (register/login, bcrypt 해싱, Passport)
- **prisma/**: PrismaService (PostgreSQL 연결, User 모델)
- **app.controller.ts**: Health check endpoint (`GET /health`)

Database: PostgreSQL with Prisma ORM.

### Frontend (user-client)

React 19 + Vite 7 with feature-based organization:

- **features/auth/**: 로그인/회원가입, JWT 상태 관리, Axios 인터셉터
- **components/**: Layout (인증 가드 + Outlet), Navbar (프로필 드롭다운)
- **pages/**: HomePage

Key libraries: Axios, Zustand, Tailwind CSS, React Router v7.

## Tech Stack

- **Runtime**: Node.js >= 20
- **Package Manager**: pnpm 10.x
- **Backend**: NestJS 11, Express 5, Prisma 7, PostgreSQL, Passport, JWT
- **Frontend**: React 19, Vite 7, Zustand 5, Axios, Tailwind CSS 3
- **Infra**: Docker, Docker Compose, Nginx
- **Testing**: Jest (backend), Vitest (frontend)
- **Linting**: ESLint 9 with TypeScript-ESLint

## Environment Variables

### API Server (`apps/api-server/.env`)

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing key (optional, defaults to dev secret)
- `CORS_ORIGIN`: CORS allowed origin (default: `http://localhost:5175`)
- `PORT`: Server port (default: 3002)

## Last Work Position

- **Feature**: 통합 설정 페이지 + 대시보드 개선 + 뉴스레터 템플릿 (Feature 11+12)
- **Status**: 구현 완료, 요약 병렬 처리 미커밋 1건 남음
- **Handoff**: 상세 인수인계 문서는 `HANDOFF.md` 참고. 새 세션 시작 시 반드시 읽을 것.

## TDD Workflow

This project follows Kent Beck's TDD and Tidy First principles.

### Skills

| Skill | Purpose |
|-------|---------|
| `/prd` | 경량 PRD 작성 (Problem, FR+AC, Affected Code, Out of Scope) |
| `/plan` | PRD에서 경량 TDD Plan 생성 (Phase 방향 + 위험 요소) |
| `/go-phase` | Phase의 TDD 사이클 실행 (테스트 발견 → Red → Green → Refactor) |
| `/check-tests` | 전체 테스트 실행 및 결과 보고 |
| `/commit-tdd` | `[BEHAVIORAL]` / `[STRUCTURAL]` 접두사 커밋 |

### Workflow

```
/prd → /plan → /go-phase → /check-tests → /commit-tdd
                   ↑              |
                   └──────────────┘ (repeat)
```
