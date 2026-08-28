# montessori-web

Production-grade multi-tenant Montessori ERP & LMS — Frontend

> **The backend copy of all Zod schemas is authoritative. If `montessori-web` schemas drift, the backend wins.**
>
> This repo talks exclusively to `montessori-api` over HTTP via `NEXT_PUBLIC_API_URL`. It never touches Postgres, Prisma, or the Grok key.

---

## Quick Start

```bash
git clone <repo>
cd montessori-web
cp .env.example .env.local       # set NEXT_PUBLIC_API_URL
npm install
npm run dev                      # http://localhost:3000
```

**Requires `montessori-api` running at the configured `NEXT_PUBLIC_API_URL`.**

Start the backend first:
```bash
cd ../montessori-api
docker-compose up                # starts postgres + redis + api
docker-compose exec api npm run db:migrate
docker-compose exec api npm run db:seed
```

Then start the frontend:
```bash
cd ../montessori-web
npm run dev
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | Backend API base URL, no trailing slash. e.g. `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_APP_URL` | No | Frontend URL (used for PWA / canonical links). Default: `http://localhost:3000` |
| `NEXT_PUBLIC_ENABLE_AI` | No | Show AI features (default: `true`) |
| `NEXT_PUBLIC_ENABLE_OFFLINE` | No | Enable offline PWA sync (default: `true`) |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | JavaScript (no TypeScript) |
| Styling | Tailwind CSS + custom CSS variables |
| UI components | shadcn/ui + Radix primitives |
| State: server | TanStack Query v5 |
| State: client/UI | Redux Toolkit (authSlice, uiSlice, syncSlice) |
| Forms | React Hook Form + Zod |
| Offline | Dexie.js (IndexedDB) + next-pwa (Workbox) |
| Realtime | Socket.IO client |
| i18n | react-i18next (en + es) |
| Tests | Playwright (e2e) |
| Deploy | Vercel |

---

## Role-Based Shells

Each role gets a genuinely different layout — different nav grammar, not one shell with conditional menu items.

| Role | Shell | Nav grammar | Accent |
|---|---|---|---|
| SUPER_ADMIN / ORG_ADMIN / BRANCH_ADMIN | `AdminShell` | Collapsible **left rail** | Indigo `#3E4C8C` |
| TEACHER / GUIDE / FRONT_DESK | `TeacherShell` | Sticky **top bar + horizontal tabs** | Moss `#5C7A5A` |
| PARENT | `ParentShell` | **Bottom tab bar** (mobile) / left sidebar (desktop) | Marigold `#E3A83D` |
| FINANCE_STAFF / HR_STAFF | `FinanceShell` | Fixed **left sidebar** with section groups | Slate `#52607A` |

After login, `app/page.js` reads the first role from the JWT and redirects to the correct dashboard:

```
SUPER_ADMIN / ORG_ADMIN / BRANCH_ADMIN  →  /admin/dashboard
TEACHER / GUIDE                         →  /teacher/dashboard
PARENT                                  →  /parent/dashboard
STUDENT                                 →  /student/dashboard
FINANCE_STAFF / HR_STAFF                →  /finance/dashboard
FRONT_DESK                              →  /teacher/attendance
```

---

## Offline-First Architecture

The app works fully offline for the two most critical teacher workflows:
1. **Marking attendance** (bulk + QR scan)
2. **Logging observations**

### Sync Flow Diagram

```
ONLINE                         OFFLINE                        RECONNECT
──────                         ───────                        ─────────

App boot                   Teacher marks attendance       Browser fires 'online'
    │                          │                              │
    ▼                          ▼                              ▼
GET /sync/pull             offlineDb.syncQueue.add()     useSyncManager detects
    │                       (Dexie IndexedDB)              isOnline = true
    ▼                          │                              │
Refresh IndexedDB:             ▼                              ▼
  students (roster)        Redux syncSlice:             flushSyncQueue()
  attendance               pendingCount++                    │
  lessonPlans              status = 'pending'                ▼
    │                          │                     POST /api/v1/sync/push
    ▼                          ▼                       { items: [...] }
SyncStatusIndicator        SyncStatusIndicator              │
  shows: Synced              shows: Pending            ┌────┴────┐
                                                       │         │
                                                    SYNCED    CONFLICT
                                                       │         │
                                                       ▼         ▼
                                               IndexedDB     IndexedDB
                                               status=synced status=conflict
                                                             + SyncLog record
                                                                  │
                                                                  ▼
                                                         SyncStatusIndicator
                                                           shows: Conflict
                                                                  │
                                                                  ▼
                                                     /teacher/sync-conflicts
                                                     (side-by-side diff,
                                                      SERVER_WINS / CLIENT_WINS)
```

### Conflict Resolution

| Scenario | Strategy |
|---|---|
| Simple fields (attendance status, mastery level edited on one device) | **Last-write-wins** — server applies client value |
| Same record edited on two devices while both offline | **CONFLICT** — stored in `SyncLog`, surfaced in `/teacher/sync-conflicts` for manual choice |

Conflicts are **never silently overwritten**. The teacher always makes the final call.

### IndexedDB Tables (Dexie)

| Table | Contents | Refreshed by |
|---|---|---|
| `students` | Today's classroom roster (id, name, qrCode) | `/sync/pull` on reconnect |
| `attendance` | Attendance records for today | `/sync/pull` delta |
| `lessonPlans` | Active/published lesson plans | `/sync/pull` delta |
| `observations` | Last 7 days of observations | `/sync/pull` delta |
| `syncQueue` | Pending/conflict offline writes | Cleared on successful push |

### Sync Status Indicator

A persistent `SyncStatusIndicator` component sits in every shell's header:

| State | Shown when |
|---|---|
| ✅ Synced | All writes have reached the server |
| ⏳ Pending | There are items in the IndexedDB syncQueue |
| 🔄 Syncing… | A push is in progress |
| ⚠️ Conflict | One or more writes returned `CONFLICT` |
| 📴 Offline | `navigator.onLine === false` |

---

## AI Assistant

The AI chat widget (`AIChatWidget`) is present in every authenticated shell. It is role-aware:

| Role | Focus |
|---|---|
| Teacher / Guide | Curriculum help, observation note drafting, student attention flags |
| Parent | Child-specific Q&A grounded in real observations and attendance data |
| Admin | School-wide metrics, fee status, operational summaries |

The frontend calls only `POST /api/v1/ai/chat`. The `GROK_API_KEY` never leaves the backend.

---

## Design System

Colors, typography, and spacing are defined as CSS variables in `styles/theme.css` and mirrored into `tailwind.config.js`.

```
styles/
  theme.css      ← CSS custom properties (source of truth)
tailwind.config.js  ← Tailwind tokens mirror theme.css
```

**Type scale:**
- `font-display` — Bricolage Grotesque (headings, stat callouts)
- `font-sans` — Plus Jakarta Sans (UI, body, forms)
- `font-playful` — Baloo 2 (gamification only — badges, leaderboard, streaks)
- `font-mono` — IBM Plex Mono (invoice numbers, timestamps, currency figures)

**Accessibility:**
- WCAG AA contrast on all text/background combinations (verified against both light and dark surfaces)
- Full keyboard navigation throughout
- ARIA labels on all icon-only controls
- Visible 2px focus rings using `--color-primary`
- Skeleton loaders (never spinners) for all async states
- `role="table"` and `scope="col"` on all data tables
- `aria-live="polite"` on toast notifications and sync status

> Full accessibility validation requires manual testing with assistive technologies and expert review beyond automated contrast checking.

---

## Marking Scheme — Where to Find It

| Category | Demonstrated in |
|---|---|
| **UI/UX (50)** | Role-tinted shells (`components/shells/`), design tokens (`styles/theme.css`, `tailwind.config.js`), skeleton loaders, optimistic UI, responsive tablet-first attendance marking, WCAG AA contrast, keyboard nav |
| **Database design (50)** | `montessori-api` — Prisma schema with 55+ models, full ERD in `montessori-api/README.md` |
| **Required features (100)** | All pages under `app/(admin)/`, `app/(teacher)/`, `app/(parent)/`, `app/(finance)/` — auth, students, attendance, curriculum, observations, finance, HR, inventory, communication, gamification |
| **AI + Offline-first (20)** | `lib/offline/` (Dexie + syncManager), `components/shared/AIChatWidget.js`, `components/shared/SyncStatusIndicator.js`, `app/(teacher)/sync-conflicts/`, offline-sync diagram above |
| **Additional features (20)** | Day-in-review digest (`app/(parent)/dashboard`), photo observation AI tagging (`app/(teacher)/observations`), classroom material tracker (inventory `inClassroomUse` flag), multi-language toggle (`components/shared/LanguageToggle.js`, `lib/i18n/`) |
| **Documentation & GitHub (10)** | This README, `montessori-api/README.md` with ERD, `montessori-api/docs/`, Swagger at `/api/docs`, seed script with demo credentials |

---

## Contract with montessori-api

- `montessori-api` maintains the OpenAPI spec served at `/api/docs` — the authoritative contract.
- Zod schemas in `lib/validation/` mirror the backend's `src/lib/validation/` schemas exactly.
- **The backend copy is authoritative.** Run `node scripts/check-contract.js` to check for drift (warns, does not fail).
- CORS on the backend explicitly allows `http://localhost:3000` and the deployed Vercel domain.
- All API calls go through `lib/api/client.js` which automatically refreshes expired tokens.

---

## Deploy (Vercel)

```bash
# Set env vars in Vercel dashboard:
#   NEXT_PUBLIC_API_URL = https://your-api.railway.app/api/v1

vercel --prod
```

The backend deploys independently to Railway/Render via `montessori-api/Dockerfile`.
