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
| `finance@sunrise.edu` | FINANCE_STAFF | /finance/dashboard |
| `hr@sunrise.edu` | HR_STAFF | /hr/dashboard |
| `frontdesk@sunrise.edu` | FRONT_DESK | /frontdesk/dashboard |
| `parent1@example.com` | PARENT (Robert, Alex's father) | /parent/dashboard |
| `parent2@example.com` | PARENT (Emily, Alex's mother — 2nd guardian) | /parent/dashboard |
| `parent3@example.com` | PARENT (Carlos, Sofia's father) | /parent/dashboard |
| `superadmin@platform.com` | SUPER_ADMIN | /admin/dashboard |

---

## Optional — AI + File uploads

**Groq AI** (for AI assistant + nightly insights + photo observation tagging):
```
GROK_API_KEY=your_key_from_console.groq.com
GROK_MODEL=qwen/qwen3.8-27b
```
Without this, AI endpoints return a graceful fallback message — the rest of the app works fine.

**Cloudinary** (for student photos, observation media, receipts):
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```
Without this, file upload endpoints will return an error but everything else works.

---

## Stripe Payment Gateway Setup

To enable online parent fee payments via Stripe Checkout and Webhooks:

### 1. Environment Variables (`montessori-api/.env`)
Add the following to your backend `.env` file:
```env
STRIPE_SECRET_KEY=sk_test_...         # Your Stripe Secret Key from Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...      # Secret generated when creating Webhook endpoint
FRONTEND_URL=http://localhost:3000   # URL where parents are redirected after checkout
```

### 2. Testing Webhooks Locally (Stripe CLI)
To test webhook events locally during development:
1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Login to Stripe:
   ```bash
   stripe login
   ```
3. Forward events to your local API:
   ```bash
   stripe listen --forward-to localhost:4000/api/finance/stripe/webhook
   ```
4. Copy the webhook signing secret printed by CLI (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in `montessori-api/.env`.

### 3. Production Webhook Configuration
In your [Stripe Dashboard](https://dashboard.stripe.com/webhooks):
- Endpoint URL: `https://your-api-domain.com/api/finance/stripe/webhook`
- Event to listen for: `checkout.session.completed`

### 4. Test Card Numbers (Stripe Test Mode)
Use standard Stripe test credit cards:
- **Card Number**: `4242 4242 4242 4242`
- **Expiration**: Any future date (e.g., `12/28`)
- **CVC**: Any 3 digits (e.g., `123`)
- **Zip**: Any 5 digits (e.g., `90210`)


**Email** (for invite links, password reset, attendance notifications):
Use [Mailtrap](https://mailtrap.io) for local dev — free tier works.
```
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
```

---

## Migrating Local Data to Production (Optional)

If you have been testing locally and want to push your *exact* local database data to your production database (e.g., Supabase) instead of just the mock seed data, use PostgreSQL's built-in dump tools:

1. **Dump your local database:**
   ```bash
   pg_dump -U postgres -h localhost -p 5432 -d montessori_db -F c -f local_data.dump
   ```
2. **Restore to production database:**
   ```bash
   pg_restore -U postgres -h [YOUR_PRODUCTION_DB_HOST] -p 5432 -d postgres -1 local_data.dump
   ```
*(You will be prompted for your passwords during both commands. Ensure you have the PostgreSQL command-line tools installed).*

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
