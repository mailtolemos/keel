# Keel

**The backbone of high-performing teams.**

Keel is an adaptive people operating system for small and mid-sized companies — a calm, premium alternative to traditional HR software. It helps founders, operators, HR teams, managers, and employees manage people, performance reviews, feedback, leave, goals, and company structure in one place.

This is a real, full-stack web application (not a prototype): server-rendered Next.js with a real database, secure password authentication, role-based access control, and seeded demo data.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 14** (App Router, React Server Components, Server Actions) |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS** — custom Linear-style design system (navy / graphite / off-white + indigo accent) |
| Database | **SQLite via Prisma ORM** — zero external setup, real relational schema & migrations |
| Auth | **NextAuth (Auth.js)** — email/password (bcrypt, JWT sessions) + optional Google OAuth |
| Validation | **Zod** on all server actions |

SQLite is used so the app runs locally with no accounts or cloud setup. The Prisma schema is standard SQL and ports to PostgreSQL/Supabase by changing the `datasource` provider and `DATABASE_URL`.

---

## Deploying to Vercel

The app now uses **Postgres** (Neon) so it runs on Vercel's serverless platform.
See **`DEPLOY.md`** for the full step-by-step (create Neon DB → seed → push to GitHub → import to Vercel → set env vars).

## Quick start

```bash
cp .env.example .env  # then paste your Neon Postgres URLs
npm install        # installs deps and generates the Prisma client
npm run setup      # syncs the database schema (prisma db push) and seeds demo data
npm run dev        # start the dev server
```

Then open **http://localhost:3000**.

> Production build: `npm run build && npm start`

### Demo logins

| Role | Email | Password | Lands on |
|---|---|---|---|
| Operator (platform owner) | `alex@lumen.co` | `password` | `/admin` (operator console) |
| Company admin (Lumen) | `marcus@lumen.co` | `password` | `/lumen` |
| Employee (Lumen) | `tomas@lumen.co` | `password` | `/lumen` |

Two companies are seeded: **Lumen** at `mykeel.org/lumen` (14 people, full demo data) and **Douro Labs** at `mykeel.org/dourolabs`. Sign in as the operator to create more.

Or create a brand-new workspace from the landing page -> **Start building your team** (sign up -> onboarding wizard -> your own `/{slug}` workspace).

### Optional: Google login
Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`. The "Continue with Google" button activates automatically when those are present.

---

## Multi-tenant & the operator console

Keel is a platform: one deployment hosts many companies, each living at its own URL.

- **Workspaces** live at `mykeel.org/{slug}` — e.g. `mykeel.org/dourolabs`. All product modules (people, reviews, goals, etc.) are nested under the slug.
- **Operator console** at `/admin` (platform admins only): create new entities as you close business, set each company's name/slug/status, see headcount, and jump into any workspace. The operator is lazily added as an admin in every company they open.
- **Per-company isolation**: each company has its own admins, managers, and employees who only ever see their own workspace.
- **Homepage changelog**: the public landing page shows a live "What's new" feed (date, category, summary, and what changed). Entries are managed from `/admin/changelog` and stored in the database.

The active workspace is resolved from the URL slug via middleware (`src/middleware.ts`), so server actions always act on the right company. Access control lives in `requireCompanyAccess()` / `requirePlatformAdmin()` in `src/lib/session.ts`.

## What's built (the 10 core MVP flows)

1. **Create company** — sign up, then a 6-step onboarding wizard (name, country, work week, default holidays, first team, invite teammates).
2. **Invite employees** — from onboarding or the People directory; creates an Invitation + an `invited` employee record.
3. **Add teams** — create teams, assign leads, move people between teams.
4. **People directory** — searchable/filterable table, employee profile pages, and an **org chart** built from reporting lines.
5. **Request & approve leave** — employees request time off and see balances; managers/admins approve or decline; company holidays & "who's away".
6. **Create review cycle** — admins launch cycles (participants, period, due date, self/manager/peer/upward toggles, custom questions, rating scales).
7. **Submit self review** — participants complete self reviews; managers review direct reports; progress tracked; results can be released.
8. **Give feedback** — continuous feedback to anyone with tags (Strength, Improvement, Collaboration, Leadership, Execution, Culture) and Public / Manager-only / Private visibility; plus feedback requests.
9. **Create goals** — company, team, and individual goals with owner, due date, status, progress, and updates.
10. **Dashboard** — people count, pending leave, upcoming holidays, active cycle & completion rate, upcoming 1:1s, recent feedback, goal progress, and team snapshot.

Plus: **1:1s** (recurring agendas, shared & private notes, action items), a company **Calendar** (holidays, time off, 1:1s), and **Settings** (company profile, roles & permissions, leave policies, holiday calendar, plus review/feedback/goal/billing/integration sections).

A polished **public marketing site** lives at `/` (hero, problem, solution, differentiator, dashboard preview, use cases, closing CTA).

---

## Roles & permissions

- **Admin** — full access: settings, all people, billing, every module. Only admins create review cycles.
- **Manager** — manage their team, approve their reports' leave, write manager reviews, see manager-only feedback and admin notes.
- **Employee** — manage their own profile, requests, goals, feedback, and reviews.

Access is enforced server-side in every Server Action and page (`requireEmployee()` + `can(role)`), never just hidden in the UI. Admin notes on profiles and private/manager-only feedback are filtered in the data layer.

---

## Data model

18 Prisma models (incl. `Changelog`): User, Company, Employee, Team, Membership, LeavePolicy, LeaveRequest, Holiday, ReviewCycle, ReviewQuestion, CycleParticipant, ReviewResponse, Feedback, Goal, GoalUpdate, OneOnOne, OneOnOneNote, Invitation. (Roles and other enumerations are modelled as typed string fields — see `src/lib/enums.ts` — because SQLite doesn't support native enums; they become real Postgres enums if you switch providers.)

```
src/
  app/
    page.tsx                 # marketing landing page
    login, signup, onboarding
    api/auth/[...nextauth]   # NextAuth route
    actions/                 # server actions (auth, onboarding, people, teams,
                             #   leave, reviews, feedback, goals, oneonones, settings)
    app/                     # authenticated product (dashboard + all modules)
  components/                # design system + per-module UI
  lib/                       # db, auth, session/RBAC, enums, formatting
prisma/
  schema.prisma             # data model
  migrations/               # SQL migration
  seed.ts                   # realistic demo data
```

---

## Switching to PostgreSQL / Supabase

1. In `prisma/schema.prisma`, set `provider = "postgresql"`.
2. Convert the typed string fields back to native `enum` blocks if desired.
3. Set `DATABASE_URL` to your Postgres/Supabase connection string.
4. `npx prisma db push` then `npm run setup`.

---

## Notes

- Built and verified with a full production build (`next build`) — all 18 routes type-check and compile.
- The seed wipes and recreates demo data each run (`npm run db:reset` to fully reset).
- `NEXTAUTH_SECRET` in `.env` is a development value — replace it for any real deployment.
