# Deploying Keel to Vercel (with Neon Postgres)

Keel was built on SQLite for instant local dev. Vercel runs serverless functions
with an ephemeral filesystem, so SQLite can't be used in production — we use
**Neon Postgres** instead. The Prisma schema has already been switched to
`postgresql`; you just need to provide connection strings.

## 1 · Create the database (Neon — free)
1. Go to https://neon.tech and create a project.
2. In the project: **Connect** → framework **Prisma**.
3. Copy the two connection strings it shows:
   - `DATABASE_URL` — the **pooled** url (host contains `-pooler`)
   - `DIRECT_URL` — the **direct** (unpooled) url

## 2 · Configure locally and seed the database
```bash
cd ~/Downloads/keel
cp .env.example .env          # then paste your Neon URLs into .env
# set a real auth secret:
#   openssl rand -base64 32   → paste into NEXTAUTH_SECRET in .env
npm install
npm run setup                 # prisma db push (creates tables) + seeds demo data
npm run dev                   # optional: test at http://localhost:3000
```
The demo data (Lumen, Douro Labs, the operator account) now lives in your Neon DB.

## 3 · Push to GitHub
Create an **empty** repo at https://github.com/new (no README/.gitignore), then:
```bash
cd ~/Downloads/keel
git init
git add -A
git commit -m "Keel — multi-tenant people OS"
git branch -M main
git remote add origin https://github.com/<your-username>/keel.git
git push -u origin main
```

## 4 · Import into Vercel
1. https://vercel.com → **Add New → Project** → import your `keel` repo.
2. Framework preset: **Next.js** (auto-detected). Leave build settings default —
   the `build` script runs `prisma generate` automatically.
3. Add **Environment Variables** (apply to Production, Preview, Development):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled url |
   | `DIRECT_URL` | Neon direct url |
   | `NEXTAUTH_SECRET` | output of `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | your Vercel URL, e.g. `https://keel-xxxx.vercel.app` |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | *(optional, for Google login)* |

4. Click **Deploy**.
5. After the first deploy, copy the real production URL into `NEXTAUTH_URL`
   (Settings → Environment Variables) and **redeploy** so sign-in works.

## 5 · Use it
- Visit your URL → sign in as **`alex@lumen.co` / `password`** (operator console).
- Companies live at `/{slug}` — e.g. `your-url.vercel.app/lumen`, `/dourolabs`.

## Notes
- Reset & reseed the database any time: `npm run db:reset`.
- Every Vercel env change requires a redeploy to take effect.
- Keep `.env` out of git (already in `.gitignore`).
