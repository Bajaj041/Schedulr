# 🚀 Schedulr — Production Deployment Guide

This guide provides an end-to-end blueprint to take **Schedulr** from local development to a fully fledged, highly available production deployment with custom domains, production PostgreSQL database, Google Calendar/Meet OAuth sync, and automated transactional emails.

---

## Architecture Overview in Production

```mermaid
flowchart TD
    subgraph Users ["End Users & Guests"]
        User[Browser / Mobile]
    end

    subgraph CDN ["Global Edge CDN (Vercel / Cloudflare)"]
        Frontend[Frontend Single Page App\nschedulr.app]
    end

    subgraph Cloud ["Backend Cloud (Render / Railway / Fly.io)"]
        Backend[Node.js Express API\napi.schedulr.app]
    end

    subgraph DB ["Managed Database (Supabase / Neon / RDS)"]
        Postgres[(Managed PostgreSQL Database)]
    end

    subgraph Integrations ["External Services"]
        Google[Google Cloud\nOAuth & Calendar API]
        Email[Transactional Email\nResend / SendGrid]
    end

    User -->|HTTPS| Frontend
    User -->|HTTPS API Requests| Backend
    Frontend -->|API Calls| Backend
    Backend -->|Prisma Connection Pool| Postgres
    Backend -->|OAuth2 / Events Insert| Google
    Backend -->|SMTP / API| Email
```

---

## Step 1: Managed PostgreSQL Database Provisioning

In production, replace SQLite with a managed PostgreSQL database (such as **[Neon](https://neon.tech)**, **[Supabase](https://supabase.com)**, or **[Railway PostgreSQL](https://railway.app)**).

1. Create a free PostgreSQL database on Neon or Supabase.
2. Copy your PostgreSQL Connection String (e.g. `postgresql://user:password@ep-xyz.aws.neon.tech/schedulr?sslmode=require`).
3. Update `backend/prisma/schema.prisma` datasource provider for PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Generate the PostgreSQL migration:
   ```bash
   cd backend
   npx prisma migrate dev --name init_postgres
   ```

---

## Step 2: Google Cloud Console & OAuth 2.0 Setup

To enable real host Google Calendar sync and auto-generate real Google Meet links:

1. Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create a new project (e.g., `Schedulr-App`).
3. Enable **Google Calendar API** in **APIs & Services > Library**.
4. Configure the **OAuth Consent Screen**:
   - User Type: **External**
   - App Name: `Schedulr`
   - Scopes to add:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `.../auth/calendar.events`
     - `.../auth/calendar.readonly`
5. Create **OAuth 2.0 Client Credentials**:
   - Application Type: **Web application**
   - **Authorized JavaScript origins**:
     - `https://schedulr.app` (your frontend domain)
     - `http://localhost:5173` (for local development)
   - **Authorized redirect URIs**:
     - `https://api.schedulr.app/api/auth/google/callback`
     - `http://localhost:5001/api/auth/google/callback`
6. Save the generated `Client ID` and `Client Secret`.

---

## Step 3: Transactional Email Setup (Resend / SendGrid)

To dispatch confirmation emails with attached `.ics` calendar files:

1. Sign up on **[Resend](https://resend.com)** or **[SendGrid](https://sendgrid.com)**.
2. Add and verify your custom sending domain (e.g. `schedulr.app`) with DKIM and SPF DNS records.
3. Grab your SMTP credentials or API key:
   - `SMTP_HOST`: `smtp.resend.com` (or SendGrid `smtp.sendgrid.net`)
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: `resend` (or `apikey`)
   - `SMTP_PASS`: `re_xxxxxxxxxxxxxxxx`
   - `EMAIL_FROM`: `Schedulr <notifications@schedulr.app>`

---

## Step 4: Recommended Deployment: Vercel + Render / Railway

### A. Deploy Backend (on [Render.com](https://render.com) or [Railway.app](https://railway.app))

1. Connect your GitHub repository.
2. Create a new **Web Service** pointing to the `backend/` directory.
3. Set the build and start commands:
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command**: `npm run start`
4. Add the following **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Node environment |
   | `PORT` | `10000` (Render default) | Application port |
   | `DATABASE_URL` | `postgresql://...` | Managed Postgres connection URL |
   | `JWT_SECRET` | `[64-char-random-string]` | Secure secret for JWT signing |
   | `FRONTEND_URL` | `https://schedulr.app` | Production frontend domain for CORS |
   | `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google OAuth Client ID |
   | `GOOGLE_CLIENT_SECRET`| `GOCSPX-xxx` | Google OAuth Client Secret |
   | `GOOGLE_REDIRECT_URI` | `https://api.schedulr.app/api/auth/google/callback` | OAuth redirect endpoint |
   | `SMTP_HOST` | `smtp.resend.com` | SMTP host |
   | `SMTP_PORT` | `587` | SMTP port |
   | `SMTP_USER` | `resend` | SMTP username |
   | `SMTP_PASS` | `re_xxx` | SMTP password |
   | `EMAIL_FROM` | `Schedulr <notifications@schedulr.app>` | Sender address |

---

### B. Deploy Frontend (on [Vercel.com](https://vercel.com) or [Netlify.com](https://netlify.com))

1. Connect your GitHub repository to Vercel.
2. Configure Project Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://api.schedulr.app/api` (URL of your deployed backend)
4. Configure SPA routing fallback in `frontend/vercel.json` (to support direct URLs like `/:username/:eventSlug`):
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
5. Click **Deploy**.

---

## Step 5: Alternative Deployment — Docker & VPS (Self-Hosted)

If you prefer self-hosting on a Single VPS (DigitalOcean Droplet, AWS EC2, or Hetzner):

### 1. `backend/Dockerfile`
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 5001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

### 2. `docker-compose.yml` (Root)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: schedulr
      POSTGRES_USER: schedulr_user
      POSTGRES_PASSWORD: secure_postgres_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - schedulr_net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      PORT: 5001
      DATABASE_URL: postgresql://schedulr_user:secure_postgres_password@postgres:5432/schedulr
      JWT_SECRET: ${JWT_SECRET}
      FRONTEND_URL: https://schedulr.app
    depends_on:
      - postgres
    networks:
      - schedulr_net

  caddy:
    image: caddy:2-alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - backend
    networks:
      - schedulr_net

volumes:
  postgres_data:
  caddy_data:
  caddy_config:

networks:
  schedulr_net:
    driver: bridge
```

### 3. `Caddyfile` (Automatic HTTPS SSL Reverse Proxy)
```caddy
schedulr.app {
    root * /var/www/frontend/dist
    file_server
    try_files {path} /index.html
}

api.schedulr.app {
    reverse_proxy backend:5001
}
```

---

## Step 6: Security & Production Hardening Checklist

- [ ] **Rate Limiting**: Add `express-rate-limit` on public booking and auth endpoints to prevent spam attacks.
- [ ] **Security Headers**: Enable `helmet` on the Express application.
- [ ] **CORS Strictness**: Restrict `cors({ origin: process.env.FRONTEND_URL })` exclusively to your production frontend domain.
- [ ] **Database Connection Pooling**: Ensure Prisma client uses connection pooling (`?pgbouncer=true` if using Supabase or PgBouncer).
- [ ] **Automated Backups**: Turn on automated daily database snapshots in your cloud provider.
- [ ] **Uptime & Error Monitoring**: Connect Sentry (`@sentry/node` & `@sentry/react`) for real-time frontend/backend exception alerts, and set up a free uptime monitor on [Better Uptime](https://betteruptime.com).

---

## Step 7: Launch & Verification Sequence

1. **Verify Health Endpoint**:
   ```bash
   curl -I https://api.schedulr.app/api/health
   # Expected: HTTP/2 200 OK
   ```
2. **Execute Initial Database Seed (Optional)**:
   ```bash
   npx tsx prisma/seed.ts
   ```
3. **Perform Live Test Booking**:
   - Open your production URL `https://schedulr.app/aditya/30min`.
   - Select a date and slot.
   - Complete the intake form and verify confirmation screen.
   - Check that the confirmation email and calendar `.ics` invite are delivered.
