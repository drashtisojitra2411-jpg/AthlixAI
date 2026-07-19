<div align="center">

# ⚡ ATHLIX

**The AI copilot for intelligent stadium & tournament operations.**

Real-time crowd intelligence, predictive operations, emergency response, and a full visitor experience — unified in one command center.

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Gemini-AI-8e75ff?logo=googlegemini&logoColor=white)](https://ai.google.dev)

</div>

---

## What is ATHLIX?

ATHLIX turns raw stadium data — crowd density, parking occupancy, ticketing, revenue, weather, and live incidents — into real-time operational decisions. It ships as two connected experiences on one platform:

- **Command Center** — an operator/admin console for running the event: live crowd heatmaps, an AI copilot, predictive "what-if" simulations, an emergency response desk, and full business reporting (revenue, ticketing, parking).
- **Visitor Experience** — a companion portal for attendees: browse events, manage tickets, check the stadium map and parking, order food, get help from an AI assistant, and report emergencies.

Everything is backed by a single source of truth (`Event`, `CrowdPrediction`, `ParkingPrediction`, `Tournament`, `SeatRecommendation`, `EmergencyReport`, `Booking`) — no page shows fabricated numbers; every card, chart, and AI recommendation reads from real database state.

---

## Highlights

### Command Center (Admin / Organizer)

| Module | What it does |
|---|---|
| **Overview** | Live business metrics — attendance, occupancy, revenue, safety score — plus crowd, parking, tournament, and emergency widgets in one glance. |
| **AI Copilot** | A Gemini-powered operations assistant. Ask it anything about the live event and get a structured response: recommendation, prediction, reasoning, confidence score, and suggested actions. |
| **Stadium Heatmap** | Interactive, zone-by-zone live occupancy map with drill-down region details. |
| **Predictive Operations** | Simulate hypothetical conditions (weather, gates open, staffing, attendance shift) and preview the AI-projected crowd and risk impact before it happens. |
| **Emergency Command Center** | Live incident feed, SLA tracking, AI-generated response plans, and a region-highlighted map tied to each report. |
| **Presentation Mode** | A scripted, ~75-second guided walkthrough of the platform for demos — crowd congestion → prediction → emergency response → AI recommendation. |
| **Parking** | Occupancy, per-lot utilization, and AI-recommended routing. |
| **Revenue** | Ticket, food, and merchandise revenue with a live breakdown. |
| **Ticketing** | Seat inventory, occupancy %, and ticket category performance. |
| **Settings** | Profile, notifications, AI preferences, and security. |

### Visitor Experience

Browse events → book tickets → check the live stadium map, parking, and food options → ask the AI assistant for help → report an emergency in one tap — all from a role-scoped visitor account.

### Under the hood

- **Role-based access** (`Admin` / `Organizer` / `Visitor`) with route-level guarding — each role lands on its own home and can't cross into the other's console.
- **Real AI, not mocks** — Gemini generates copilot responses, predictive simulations, and emergency plans grounded in the event's actual live data.
- **Demo-ready out of the box** — seed scripts populate a fully realistic flagship event (crowd zones, parking lots, tournament bracket, seat recommendations, resolved incidents, AI chat history) so every screen has meaningful data from the first run.

---

## Tech Stack

**Frontend** — React 19 · TypeScript · Vite · Tailwind CSS 4 · Framer Motion · Radix UI primitives · React Router · React Hook Form + Zod · TanStack Query

**Backend** — Node.js · Express · TypeScript · MongoDB + Mongoose · JWT auth · bcrypt · Zod validation · Google Gemini API

---

## Project Structure

```
Athlix/
├── src/                      # Frontend (React + Vite)
│   ├── pages/                 # Route-level pages (Command Center + Visitor)
│   ├── components/            # UI primitives, dashboard/heatmap/emergency/demo widgets
│   ├── hooks/                  # Data-fetching & derived-state hooks
│   ├── contexts/               # Auth context/provider
│   └── lib/
│       ├── api/                 # Typed API client per resource
│       └── copilot/, heatmap/, demo/, predictive/   # Domain logic
│
└── backend/                  # Backend (Express + MongoDB)
    ├── src/
    │   ├── models/              # Mongoose schemas (User, Event, CrowdPrediction, ...)
    │   ├── routes/               # REST route definitions
    │   ├── controllers/          # Request handlers
    │   ├── services/             # Business logic (incl. Gemini integration)
    │   ├── middlewares/          # Auth guard, validation, error handling
    │   └── validations/          # Zod request schemas
    └── scripts/                 # Data migration & demo-seed scripts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas or local)
- A [Google Gemini API key](https://ai.google.dev) (powers the AI copilot, predictions, and emergency plans)

### 1. Clone & install

```bash
git clone <repo-url>
cd Athlix

# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Configure environment variables

**Frontend** — copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run it

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
npm run dev
```

### 4. (Optional) Seed realistic demo data

```bash
cd backend
npm run seed:ipl-final-demo
```

Populates a flagship "IPL 2026 Final" event with realistic crowd zones, parking lots, a tournament bracket, seat recommendations, resolved incidents, and AI chat history — so the Command Center and Visitor Experience are fully populated on first login.

---

## Scripts

**Frontend** (`/`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |
| `npm run test` | Run the Vitest suite |

**Backend** (`/backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start the API server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production server |
| `npm test` | Run backend service tests |
| `npm run seed:ipl-final-demo` | Seed a fully realistic demo event |
| `npm run migrate:event-fields` / `migrate:event-business-metrics` | Data migration utilities |

---

## Authentication & Roles

ATHLIX uses JWT-based authentication with three roles:

- **Admin / Organizer** — full access to the Command Center (`/dashboard/*`).
- **Visitor** — access to the attendee experience (`/visitor/*`).

Routes are guarded client-side by role, and every protected API route validates the JWT and role server-side — a Visitor account can never reach Organizer data, and vice versa.

---

<div align="center">

Built for the future of stadium and tournament operations.

</div>
