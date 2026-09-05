# Deployment Guide: Vercel & Render

This guide outlines the deployment steps for your **Frontend (Vercel)** and **Backend (Render)**, taking advantage of their native monorepo support. You do **not** need to set up GitHub Actions for CI/CD, as both platforms handle automated deployments securely via direct GitHub connection.

---

## 1. Backend Deployment (Render)

Render is perfect for Node.js backends. We will deploy the `montessori-api` folder as a **Web Service** on Render.

### Steps to Deploy:
1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. When configuring the Web Service, use the following settings:
   - **Name**: `montessori-api` (or any name you prefer)
   - **Language**: `Node`
   - **Root Directory**: `montessori-api`
   - **Build Command**: `npm install` (or `npm ci`)
   - **Start Command**: `npm run start` (make sure you have a start script in your `package.json` that runs your production server, e.g., `node src/server.js`)
5. **Database Setup**: You'll also need a PostgreSQL database (and optionally Redis). You can create a **PostgreSQL Database** and a **Redis instance** directly in Render and copy their internal connection URLs.

### Render Environment Variables
Under the **Environment** tab, add the following variables:

| Variable | Description |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `4000` (Render will automatically expose this) |
| `DATABASE_URL` | The Internal or External Database URL (e.g., from Render PostgreSQL) |
| `REDIS_URL` | The Internal or External Redis URL (e.g., from Render Redis) |
| `JWT_ACCESS_SECRET` | A long random string (min 64 chars) |
| `JWT_REFRESH_SECRET` | A long random string (min 64 chars) |
| `JWT_ACCESS_EXPIRY` | `15m` |
| `JWT_REFRESH_EXPIRY` | `7d` |
| `SMTP_HOST` | Your email provider's SMTP host (e.g., SendGrid, Mailgun) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your SMTP username |
| `SMTP_PASS` | Your SMTP password |
| `EMAIL_FROM` | `Montessori Platform <no-reply@yourdomain.com>` |
| `CLOUDINARY_CLOUD_NAME`| Your Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key |
| `CLOUDINARY_API_SECRET`| Your Cloudinary API Secret |
| `GROK_API_KEY` | Your xAI Grok API Key |
| `GROK_MODEL` | `grok-4` (or your preferred model) |
| `CORS_ORIGINS` | The URL of your Vercel frontend (e.g., `https://your-frontend.vercel.app`) |
| `APP_URL` | The URL Render gives you (e.g., `https://montessori-api-xyz.onrender.com`) |
| `FRONTEND_URL` | The URL of your Vercel frontend |

> [!IMPORTANT]  
> After Render finishes deploying for the first time, copy the live backend URL (e.g., `https://montessori-api-abc.onrender.com`). You will need it for the frontend.

---

## 2. Frontend Deployment (Vercel)

Vercel is optimized for Next.js and frontend applications. We will deploy the `montessori-web` folder.

### Steps to Deploy:
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New... > Project**.
3. Import your GitHub repository.
4. Before clicking Deploy, update the following configurations:
   - **Framework Preset**: Vercel should auto-detect Next.js.
   - **Root Directory**: Click "Edit" and select `montessori-web`.
5. Expand the **Environment Variables** section and add the required variables.

### Vercel Environment Variables

| Variable | Value / Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | The URL from your Render backend + `/api/v1` (e.g., `https://montessori-api-abc.onrender.com/api/v1`) |
| `NEXT_PUBLIC_APP_URL` | The production URL Vercel gives you (e.g., `https://your-frontend.vercel.app`) |
| `NEXT_PUBLIC_ENABLE_AI`| `true` |
| `NEXT_PUBLIC_ENABLE_OFFLINE`| `true` |

Once the environment variables are set, click **Deploy**.

---

## 3. Post-Deployment Checklist
- [ ] **Run Database Migrations**: If your database is empty, ensure you run your Prisma migrations on Render. You can do this by opening the **Shell** tab on Render and running `npx prisma db push` or `npx prisma migrate deploy`, followed by `node prisma/seed.js` if you want to seed initial data.
- [ ] **Update CORS**: Double-check that your `CORS_ORIGINS` on Render precisely matches your live Vercel URL (with no trailing slash).
- [ ] **Verify Authentication**: Try logging into the Vercel frontend to verify it can talk to the Render backend and the database correctly.
