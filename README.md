# IT Computer Solutions — Senior Safe Computing Platform

## Status: Phase 1 in progress

This is an incremental build. What's real right now:

- ✅ Public website (Home, Home Computer Care, Senior Safe Computing, Services, About, FAQ,
  Contact, Privacy, Terms) — two distinct membership products, per the approved brochure:
  **Home Computer Care** (general audience, 3 tiers: Basic $14.99 / Premium $24.99 / Complete
  Protection $39.99) and **Senior Safe Computing** (a separate, senior-specific membership at
  $29.99 with its own features)
- ✅ Database schema covering the full data model (household, users, devices, plans,
  subscriptions, leads, conversations, support tickets, notes, onboarding, notifications, audit log)
- ✅ Auth foundation (credentials login, role-based sessions for customer vs admin)
- ✅ Customer portal shell (dashboard reads real data from the DB)
- ✅ Admin dashboard framework (overview stats, customer list, customer detail)
- ✅ Demo seed data (10 households across plan/status combinations)
- ✅ Provider abstractions for AI, RMM, and notifications — written now so later phases plug
  in without rearchitecting, but **not wired into any UI yet**

What's intentionally **not** built yet (later phases, per the agreed plan):

- Phase 2 — Square sandbox integration (checkout, webhooks, real subscription activation)
- Phase 3 — Customer onboarding flow (the 7-step wizard)
- Phase 4 — Device/RMM integration (currently mock data only, not customer-facing)
- Phase 5 — AI concierge and AI-assisted support (provider code exists, no chat UI yet)

The "Choose Plan" and "Get Help" buttons on the site are visibly present but intentionally
disabled/inert — they're there so you can see the full page layout without half-built
flows pretending to work.

---

## Local setup

1. **Install Node.js 20+** if you don't have it. You can skip any "install additional
   native build tools" / Chocolatey / Visual Studio Build Tools prompt during that install —
   nothing in this project needs it (password hashing uses pure-JS `bcryptjs`, not `argon2`).
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Get a Postgres database.** Easiest for local dev: [Neon](https://neon.tech) — create a
   project in their web dashboard, then open **Connection Details** and copy the connection
   string (looks like `postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require`).
   You don't need Neon's CLI or its `npx neonctl init` wizard — that's for wiring an AI coding
   assistant into Neon via MCP, not needed here. A Docker Postgres also works fine:
   `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`.
4. **Copy `.env.example` to `.env`** and fill in `DATABASE_URL` (the string from step 3) and
   `AUTH_SECRET` (any long random string works for dev — on Mac/Linux: `openssl rand -base64 32`;
   on Windows PowerShell: `[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))`). You can
   leave the Square/AI/Email values as placeholders for now; nothing in Phase 1 calls them.
5. **Create the database tables:**
   ```
   npx prisma migrate dev --name init
   ```
6. **Seed demo data:**
   ```
   npm run db:seed
   ```
7. **Run the app:**
   ```
   npm run dev
   ```
   Visit `http://localhost:3000`.

**Demo logins** (from the seed script):
- Admin: `admin@itcomps.com` / `ChangeMe123!`
- Senior Safe Computing customer: `mary.thompson@example.com` / `Password123!`
- Home Computer Care customer: `robert.diaz@example.com` / `Password123!`

Change both passwords before this ever touches real customer data.

---

## Deployment (when you're ready)

- App: [Vercel](https://vercel.com) — connect this repo, set the same environment variables
  from `.env` in the Vercel project settings, deploy.
- Database: a managed Postgres (Neon or Supabase both work well with Vercel).
- Domain: point your existing **itcomps.com** at the Vercel project (add the domain in
  Vercel's project settings, then update DNS at your current registrar). No need for a new
  domain — this is a DNS change, not a rebuild.

---

## Project structure

```
app/                    Pages and API routes (Next.js App Router)
  (public pages)/       Home, services, about, faq, contact, privacy, terms
  senior-safe-computing/  Plan landing page
  portal/                Customer-facing portal (auth-gated)
  admin/                  Admin dashboard (auth-gated, admin role only)
  api/auth/               NextAuth route
components/             Shared UI (Header, Footer, WatchRibbon signature element)
lib/
  config/               Editable business facts and plan definitions — the single
                         source of truth for anything the site or AI says
  providers/            AIProvider, RMMProvider, NotificationProvider — vendor-neutral
                         interfaces; swap the implementation, not the call sites
  auth.ts               NextAuth configuration
  auth-guards.ts         requireCustomerSession() / requireAdminSession()
  db.ts                  Prisma client singleton
prisma/
  schema.prisma          Full data model
  seed.ts                 Demo data generator
```

## Design tokens

Palette: deep navy (`ink`, #1B2A41) for text/trust, warm amber (`amber`, #C1872E) for calls
to action, muted sage (`sage`, #3F7D58) reserved for "protected/healthy" status, muted clay
(`clay`, #B14A3D) reserved for "needs attention." Display type is Fraunces (serif, warmth
without looking like a template); body type is Public Sans (built for legibility — matches
the "could a 75-year-old read this comfortably" requirement). Base font size is 18px.

The recurring visual signature is the **watch ribbon** (`components/WatchRibbon.tsx`) — three
dots (Protected / Connected / Checked recently) that appear in the homepage hero and, later,
on the live customer dashboard with real device data. Same motif sells the promise and proves
it's being kept.
