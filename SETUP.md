# Montessori ERP & LMS — Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16
- Redis 7
- (Optional) Docker + Docker Compose — easiest path

---

## Option A — Docker Compose (recommended, one command)

```bash
# 1. Clone / open the repo
cd montessori-api

# 2. The .env file is already pre-configured for Docker
#    Edit GROK_API_KEY and Cloudinary vars if you have them (optional)

# 3. Start everything (Postgres + Redis + API)
docker-compose up --build

# 4. In a second terminal — run migrations + seed
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npm run db:seed

# 5. Start the frontend
cd ../montessori-web
npm install
npm run dev
```

Open:
- Frontend: http://localhost:3000
- API:      http://localhost:4000/api/v1
- Swagger:  http://localhost:4000/api/docs

---

## Option B — Without Docker

### Backend

```bash
cd montessori-api
npm install
# .env is already created — edit DATABASE_URL + REDIS_URL if needed
npm run db:migrate:dev   # creates the database + runs all migrations
npm run db:seed          # seeds demo data
npm run dev              # starts on http://localhost:4000
```

### Frontend

```bash
cd montessori-web
npm install
# .env.local is already created
npm run dev              # starts on http://localhost:3000
```

---

## Demo Login Credentials

All passwords: `Demo@1234`

| Email | Role | Dashboard |
|---|---|---|
| `principal@sunrise.edu` | ORG_ADMIN | /admin/dashboard |
| `teacher@sunrise.edu` | TEACHER | /teacher/dashboard |
| `guide@sunrise.edu` | GUIDE | /teacher/dashboard |
| `finance@sunrise.edu` | FINANCE_STAFF | /finance/dashboard |
| `hr@sunrise.edu` | HR_STAFF | /finance/dashboard |
| `frontdesk@sunrise.edu` | FRONT_DESK | /teacher/attendance |
| `parent1@example.com` | PARENT (Robert, Alex's father) | /parent/dashboard |
| `parent2@example.com` | PARENT (Emily, Alex's mother — 2nd guardian) | /parent/dashboard |
| `parent3@example.com` | PARENT (Carlos, Sofia's father) | /parent/dashboard |
| `student@sunrise.edu` | STUDENT (Alex Johnson) | /student/dashboard |
| `superadmin@platform.com` | SUPER_ADMIN | /admin/dashboard |

---

## Optional — AI + File uploads

**Grok AI** (for AI assistant + nightly insights + photo observation tagging):
```
GROK_API_KEY=your_key_from_console.x.ai
GROK_MODEL=grok-4
```
Without this, AI endpoints return a graceful fallback message — the rest of the app works fine.

**Cloudinary** (for student photos, observation media, receipts):
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```
Without this, file upload endpoints will return an error but everything else works.

**Email** (for invite links, password reset, attendance notifications):
Use [Mailtrap](https://mailtrap.io) for local dev — free tier works.
```
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
```

---

## Running Tests

```bash
# Backend integration tests
cd montessori-api
npm test

# Frontend e2e tests (requires both servers running)
cd montessori-web
npm test

# Contract drift check
cd montessori-web
npm run check-contract
```
