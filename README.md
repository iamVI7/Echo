# Project Echo

> "Send a message to the person you'll become."

A personal time-capsule app — write text or voice messages to your future self, seal them with a delivery date, and open them when that day arrives.

## Tech Stack

- **Frontend**: React + Vite + React Router + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Auth**: JWT
- **Voice**: Browser MediaRecorder API (stored server-side, no third-party services)

## Project Structure

```
project-echo/
├── backend/
│   ├── controllers/    # Request handlers
│   ├── routes/         # API route definitions
│   ├── models/         # Mongoose schemas (User, Echo, Reflection)
│   ├── middleware/      # Auth, upload, error handling
│   ├── utils/           # DB connection
│   ├── uploads/voice/   # Stored voice recordings
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # UI + layout components
        ├── pages/        # Route pages (Home, Create, Vault, Profile, etc.)
        ├── layouts/      # AppLayout with bottom nav
        ├── hooks/        # useAuth context
        ├── services/     # API + echo service wrappers
        └── utils/        # Date helpers, category colors
```

## Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env   # edit MONGODB_URI / JWT_SECRET as needed
npm install
npm run dev             # starts on http://localhost:5000
```

Requires a running MongoDB instance (local or Atlas).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to the backend on port 5000.

## Core Features

- **Auth** — Register / Login with JWT, name + email + password.
- **Create Echo** — Write a text message or record a voice memo (record / pause / stop / preview), pick a category, choose a delivery date (preset or custom).
- **Seal Echo** — Confirmation screen shows the exact arrival date. Content becomes immutable; only deletable before delivery.
- **Vault** — All Echoes grouped by status: Locked, Unlocked, Opened. Status is computed dynamically by comparing `now` to `deliveryDate` — no cron jobs needed.
- **Open Echo** — Unlocks with a gentle "unsealing" animation. Voice Echoes play via an `<audio>` element.
- **Reflection** — After opening, user answers "Did this message age well?" (Yes / Partially / No) plus an optional note. One reflection per Echo.
- **Profile** — Total / Locked / Opened counts, member-since date.

## Design Notes

- Mobile-first (360–412px), bottom tab navigation (Home, Create, Vault, Profile).
- Warm paper/ink palette, Playfair Display + DM Sans + DM Mono typography.
- Subtle 150–250ms fade/scale transitions; no heavy gradients or gamification.
