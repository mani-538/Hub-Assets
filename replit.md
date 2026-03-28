# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Auth**: Express sessions (express-session + bcryptjs)
- **Routing**: Wouter

## Project: Project Hub

Centralized Student Project Management System.

### Features
- Role-based authentication (Student / Admin)
- OTP email verification (prints to console)
- Personal details collection on signup
- Student Dashboard with project stats
- Project management (create, view, daily updates)
- Admin Dashboard with user and project oversight
- Admin can update project status (Pending/Approved/Rejected/Completed)
- Admin can delete users

### Auth Flow
1. Role Selection → `/role-select`
2. Signup → `/signup?role=student|admin`
3. OTP Verification → `/verify-otp?email=...`
4. Personal Details → `/personal-details?email=...`
5. Login → `/login`

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (auth, student, admin routes)
│   └── project-hub/        # React + Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- **users**: id, email, username, password, role, name, mobile, dob, college, department, year, is_verified, otp, otp_expires_at, created_at
- **projects**: id, title, description, status, student_id (FK), created_at
- **project_updates**: id, project_id (FK), update_text, date

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes: auth.ts, student.ts, admin.ts, health.ts. Uses express-session + bcryptjs for auth.

### `artifacts/project-hub` (`@workspace/project-hub`)

React + Vite frontend. Pages: auth/*, student/*, admin/*. Uses @workspace/api-client-react for API calls.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.
