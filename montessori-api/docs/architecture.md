# Architecture — montessori-api

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     montessori-web (Next.js)                │
│  Role-based layouts · Redux authSlice · Dexie.js offline    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / NEXT_PUBLIC_API_URL
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   montessori-api (Express)                  │
│                                                             │
│  /api/v1/*  ──►  authenticate  ──►  requirePermission       │
│                  scopeTenant         (JWT claims)           │
│                      │                                      │
│          ┌───────────┼───────────┐                          │
│          ▼           ▼           ▼                          │
│       modules     BullMQ       Socket.IO                    │
│    (service layer) workers     (realtime)                   │
│          │                                                  │
│          ▼                                                  │
│       Prisma ORM ──► PostgreSQL                            │
│       Redis (cache + queue backing)                         │
│       Cloudinary (file uploads)                             │
│       xAI Grok (AI — backend only)                         │
└─────────────────────────────────────────────────────────────┘
```

## Request Lifecycle

1. Request hits Express
2. `helmet` sets security headers
3. `cors` validates origin against allow-list
4. `globalRateLimiter` checks rate limit
5. `authenticate` verifies JWT → populates `req.user`
6. `scopeTenant` extracts `organizationId` from JWT → `req.organizationId`
7. `requirePermission('key')` checks `req.user.permissions[]`
8. Route handler calls service layer
9. Service layer uses Prisma (always scoped to `organizationId`)
10. Response → `errorHandler` on failure

## Multi-Tenancy

Every tenant-scoped model carries `organizationId`. The service layer always filters by `req.organizationId` (from JWT). The Prisma middleware in `tenantScope.js` adds a safety net.

**Critical**: `organizationId` is NEVER accepted from client request body/params. It comes from the verified JWT only.

## RBAC

```
User → UserRole → Role → RolePermission → Permission
```

- Roles live in the DB per organization
- Permission keys follow `module:action` convention (e.g. `attendance:mark`)
- `requirePermission('attendance:mark')` checks `req.user.permissions[]` (resolved at login, embedded in JWT)
- Admins can add/remove permissions from roles without a code deploy

## Job Queues (BullMQ)

| Queue | Worker | Schedule |
|---|---|---|
| `ai-insights` | `aiInsightsWorker.js` | Nightly 02:00 UTC |
| `notifications` | `notificationsWorker.js` | On-demand (attendance, messages) |
| `reports` | (future) | On-demand |
| `sync-reconcile` | (future) | On-demand |
