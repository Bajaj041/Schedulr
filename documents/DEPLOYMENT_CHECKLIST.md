# 🚀 Schedulr — Quick Finalization & Deployment Checklist

Follow this 5-step checklist to finalize and deploy **Schedulr** to production in under 10 minutes.

---

## 📋 Pre-Flight Preparation (Already Configured)

- ✅ [`.gitignore`](file:///Users/adityabajaj/Documents/college%20projects/schedulr/.gitignore) configured to exclude `node_modules`, `dist/`, local `.env`, and SQLite database files.
- ✅ [`backend/.env.example`](file:///Users/adityabajaj/Documents/college%20projects/schedulr/backend/.env.example) and [`frontend/.env.example`](file:///Users/adityabajaj/Documents/college%20projects/schedulr/frontend/.env.example) templates created.
- ✅ [`vercel.json`](file:///Users/adityabajaj/Documents/college%20projects/schedulr/frontend/vercel.json) & [`_redirects`](file:///Users/adityabajaj/Documents/college%20projects/schedulr/frontend/public/_redirects) added for client-side SPA routing on custom routes like `/:username/:eventSlug`.
- ✅ TypeScript builds verified with **0 errors** on both backend and frontend.

---

## Step 1: Push Code to GitHub

Initialize your Git repository and push your project to GitHub:

```bash
cd "/Users/adityabajaj/Documents/college projects/schedulr"
git init
git add .
git commit -m "Initial commit: Schedulr full-stack scheduling platform"
git branch -M main
git remote add origin https://github.com/<your-username>/schedulr.git
git push -u origin main
```

---

## Step 2: Provision a Cloud PostgreSQL Database (2 minutes)

1. Go to **[Neon.tech](https://neon.tech)** (or **[Supabase](https://supabase.com)**) and create a free project.
2. Copy your **PostgreSQL Connection String**:
   ```text
   postgresql://user:password@ep-xyz.aws.neon.tech/schedulr?sslmode=require
   ```

---

## Step 3: Deploy the Backend (on Render.com or Railway.app)

1. On **[Render.com](https://render.com)**, click **New + > Web Service** and select your GitHub repo.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npx prisma db push && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run start
     ```
3. Add **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production environment |
   | `PORT` | `10000` | Port assigned by Render |
   | `DATABASE_URL` | `<your-neon-postgres-connection-string>` | Cloud PostgreSQL connection string |
   | `JWT_SECRET` | `<64-character-random-string>` | Secret key for signing host JWT tokens |
   | `FRONTEND_URL` | `https://schedulr.vercel.app` | Production frontend domain for CORS |

4. Click **Create Web Service**.
   - Your backend will be live at: `https://<your-service>.onrender.com`
   - Test it: `https://<your-service>.onrender.com/api/health`

---

## Step 4: Deploy the Frontend (on Vercel.com)

1. On **[Vercel.com](https://vercel.com)**, click **Add New > Project** and import your GitHub repo.
2. Set the project configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add **Environment Variable**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://<your-service>.onrender.com/api` | Live backend API URL |

4. Click **Deploy**.
   - Your frontend will be live at: `https://schedulr.vercel.app`

---

## Step 5: Seed the Production Database (Optional)

To load the initial host profile (`aditya@work.com` / `password123`) and sample event types onto your production database, run:

```bash
cd backend
DATABASE_URL="<your-neon-postgres-connection-string>" npx tsx prisma/seed.ts
```

---

## 📚 Related Documentation Files
- **[`PROJECT_DOCUMENTATION.md`](file:///Users/adityabajaj/Documents/college%20projects/schedulr/documents/PROJECT_DOCUMENTATION.md)**: Full Technical Architecture, Data Models & API Catalog.
- **[`DEPLOYMENT_GUIDE.md`](file:///Users/adityabajaj/Documents/college%20projects/schedulr/documents/DEPLOYMENT_GUIDE.md)**: In-Depth Production Guide (Docker, Caddy SSL, Google OAuth2, and Resend SMTP).
- **[`UI_GALLERY.md`](file:///Users/adityabajaj/Documents/college%20projects/schedulr/documents/UI_GALLERY.md)**: Visual Screenshot Showcase of all 15 Frontend Pages in 1080p Light Mode.
