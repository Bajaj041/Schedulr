# 📅 Schedulr — Full-Stack Scheduling Platform

Schedulr is a modern, high-performance appointment and calendar scheduling platform with Google Calendar/Meet synchronization, real-time availability computation, race-condition-safe slot booking, and an intuitive host dashboard.

---

## 🚀 Quick Start

### 1. Start the Backend API
```bash
cd backend
npm install
npm run dev
```
*Backend runs at **`http://localhost:5001`** (API health check: `http://localhost:5001/api/health`)*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at **`http://localhost:5173`***

---

## 🔑 Default Host Credentials (Pre-seeded)
- **Email**: `aditya@work.com`
- **Password**: `password123`
- **Public Profile URL**: `http://localhost:5173/aditya`
- **Public Booking Page**: `http://localhost:5173/aditya/30min`

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS, Lucide Icons, Date-fns, React Router 7, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM 6, SQLite (`dev.db`), JSONWebToken, BcryptJS.
- **Integrations**: Google Calendar v3 API, Google Meet conference link generator, Nodemailer & VCALENDAR `.ics` email invites.
- **Concurrency**: Transactional slot locking (`prisma.$transaction`) to prevent double-booking collisions.

---

## 📂 Project Structure

```text
schedulr/
├── backend/                  # Express + TypeScript + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Demo data seed script
│   └── src/
│       ├── middleware/       # JWT Auth guard
│       ├── routes/           # Auth, Events, Availability, Bookings, Public, Team
│       ├── services/         # SlotEngine, GoogleCalendar, EmailService
│       ├── app.ts
│       └── server.ts
│
└── frontend/                 # React 19 + Tailwind CSS Frontend
    └── src/
        ├── components/       # Booking calendar, slots, modals
        ├── context/          # Auth, Theme, Toast
        ├── pages/            # Host workspace & public guest flows
        ├── services/         # API client & decoupled service layer
        └── types/            # TypeScript interfaces
```

---

## 📖 Comprehensive Documentation
For the complete technical breakdown, database ER diagram, slot calculation logic, and full REST API endpoint catalog, see [project_documentation.md](file:///Users/adityabajaj/.gemini/antigravity-ide/brain/110fbd63-4265-4012-b025-a2ef99b61a5e/project_documentation.md).
