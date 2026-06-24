# Going live — email, billing & security

The app **runs without** these configured: invites and password resets show a
copyable link instead of emailing, and billing shows "not configured." To turn
Keel into something you can actually charge for, set the following.

## 1 · Transactional email (Resend)
1. Sign up at https://resend.com and **verify your sending domain** (e.g. mykeel.org).
2. Create an API key.
3. Add to Vercel → Settings → Environment Variables (all environments):
   - `RESEND_API_KEY` = `re_...`
   - `EMAIL_FROM` = `Keel <noreply@yourdomain.com>` (address on your verified domain)
4. Redeploy. Invites and password-reset links are now emailed automatically.

## 2 · Billing (Stripe)
1. Create a Stripe account.
2. **Products → add a product** with a recurring **Price** (e.g. €12/seat/month or a flat monthly). Copy the **Price ID** (`price_...`).
3. Copy your **Secret key** (`sk_live_...` or `sk_test_...` while testing).
4. **Developers → Webhooks → Add endpoint:**
   - URL: `https://www.mykeel.org/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Signing secret** (`whsec_...`).
5. Add to Vercel env (all environments):
   - `STRIPE_SECRET_KEY` = `sk_...`
   - `STRIPE_PRICE_ID` = `price_...`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...`
   - `NEXT_PUBLIC_APP_URL` = `https://www.mykeel.org`
6. Redeploy. **Settings → Billing** now shows Subscribe / Manage. New companies get a
   14-day trial; after it ends, the workspace shows a paywall until they subscribe.

## 3 · Database
The billing fields and `PasswordResetToken` table were already applied to your Neon DB.
If you ever recreate the database, run `npx prisma db push` (or `npm run setup`).

## 4 · Security before you sell
- **Rotate the Neon DB password** (it was shared in plaintext during setup): Neon → Roles → reset password. Vercel picks up the new value.
- Confirm `NEXTAUTH_SECRET` is a strong unique value.
- Next.js was upgraded to **14.2.35** (patched release) to clear the security advisory.
- Replace or remove the demo accounts (`alex@lumen.co` etc.) before real customers — or keep Lumen as a public demo workspace.

## What this added (the "sellable" layer)
- **Invite → join:** "Add person" emails an invite; the recipient sets their password at `/join?token=…` and is dropped into the workspace.
- **Password reset:** "Forgot password?" on login → `/forgot` → emailed link → `/reset`.
- **Stripe billing:** Settings → Billing (subscribe / manage via Stripe Checkout + Customer Portal), 14-day trials on new companies, and a paywall when a trial ends or a subscription lapses.
- All three **degrade gracefully** if their keys aren't set, so the app always builds and runs.
