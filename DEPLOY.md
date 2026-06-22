# Deploying Keel — GitHub → Vercel → Neon

Keel uses **Postgres** in production (SQLite can't run on Vercel's serverless
filesystem). The easiest path is to provision **Neon from inside Vercel**, which
auto-injects the `DATABASE_URL`. Order: GitHub first, then Vercel, then the database.

## 1 · Push to GitHub
Create an **empty** repo at https://github.com/new (no README, no .gitignore). Then:
```bash
cd ~/Downloads/keel
git init
git add -A
git commit -m "Keel — multi-tenant people OS"
git branch -M main
git remote add origin https://github.com/<your-username>/keel.git
git push -u origin main
```

## 2 · Import into Vercel
1. https://vercel.com → **Add New → Project** → import your `keel` repo.
2. Framework preset **Next.js** is auto-detected. Leave build settings default
   (the `build` script runs `prisma generate`).
3. Don't deploy yet — add the database and env vars first (next steps). If it
   auto-deploys and fails because there's no database, that's expected; you'll
   redeploy after step 4.

## 3 · Add the database (Neon, from inside Vercel)
1. In your new Vercel project → **Storage** tab → **Create Database** → **Neon**
   (Postgres). Follow the prompts.
2. Vercel connects it to the project and **injects `DATABASE_URL`** (plus some
   `POSTGRES_*` / unpooled variants) into the project's environment automatically.

## 4 · Add the remaining environment variables
Project → **Settings → Environment Variables** (Production + Preview + Development):

| Name | Value |
|---|---|
| `NEXTAUTH_SECRET` | output of `openssl rand -base64 32` |
| `NEXTAUTH_URL` | your Vercel URL, e.g. `https://keel-xxxx.vercel.app` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | *(optional — Google login)* |

`DATABASE_URL` is already there from step 3.

## 5 · Create the tables & seed demo data (one time)
The database starts empty. Run the schema push + seed once, against the Neon DB.
Easiest with the Vercel CLI so you reuse the same connection string:
```bash
cd ~/Downloads/keel
npm i -g vercel        # if you don't have it
vercel link            # link this folder to your Vercel project
vercel env pull .env   # pulls DATABASE_URL (+ others) into .env
npm install            # regenerates the Prisma client for Postgres
npm run setup          # prisma db push (creates tables) + seeds demo data
```
> Tip: if `prisma db push` complains about a pooled connection, paste Neon's
> **unpooled/direct** connection string into `.env` as `DATABASE_URL` just for
> this step (Neon dashboard → Connection → "direct"), then run `npm run setup`.

## 6 · Deploy & finish
1. Back in Vercel → **Deployments** → **Redeploy** (so it picks up the env vars).
2. After it's live, set `NEXTAUTH_URL` to the real production URL (if it wasn't
   already) and redeploy once more so sign-in works.

## 7 · Use it
- Visit your URL → sign in as **`alex@lumen.co` / `password`** (operator console).
- Companies live at `/{slug}` — e.g. `your-url.vercel.app/lumen`, `/dourolabs`.

## Notes
- Reset & reseed any time: `npm run db:reset`.
- Every env-var change needs a redeploy to take effect.
- `.env` is git-ignored — your secrets never get committed.
