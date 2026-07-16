# Feature 001 – Authentication test plan

Run these checks after applying the Supabase migration and deploying Edge Functions.

## Prerequisites

1. Copy `.env.example` → `.env` with real `EXPO_PUBLIC_SUPABASE_*` values.
2. Apply migrations:
   - `supabase/migrations/20260716120000_feature_001_auth.sql`
   - `supabase/migrations/20260716210000_feature_001_auth_hardening.sql`
3. Deploy functions: `register-device`, `child-set-pin`, `child-verify-pin`.
4. In Supabase Auth: Email provider ON, Confirm email ON, redirect URL `quranquest://auth/callback`.
5. Start the app with Node 20–22: `npm start`.

## Checklist

- [ ] **Guest**: Continue as Guest → nickname / age group / country flag / language → home stub (local only)
- [ ] Guest **Simulate +1 surah** advances local progress; at 19 surahs milestone prompt appears
- [ ] Milestone **Later** dismisses prompt; **Create Free Account** opens register
- [ ] Guest cannot open family / parent manage / AI Hifz Circle without account
- [ ] Register **Adult** → verify-email → confirm email (deep link) → family picker → select self → home stub
- [ ] Register **Parent** → verify email → family picker
- [ ] Parent creates **two children** with nickname, age, avatar, country flag, language, and PIN
- [ ] Parent can **edit** and **delete** a child
- [ ] Child unlock with **correct PIN** on the same device → home stub as that child
- [ ] During child session, **Manage children** / parent chrome is hidden; opening parent routes redirects
- [ ] App restart while child was active requires **PIN again** (no silent child restore)
- [ ] **Wrong PIN** rejected; after 5 failures, PIN locks (~15 minutes)
- [ ] Parent **resets child PIN** → old PIN fails, new PIN works
- [ ] **Adult** cannot open Manage children (redirects away)
- [ ] Unauthenticated open of `/(app)/home` redirects to welcome/login
- [ ] **Forgot password** deep link opens reset screen; new password saves and session continues
- [ ] **Log out** clears session and active learner; protected routes blocked
- [ ] Guest → register migrates local progress (staged under `qq.migrated_progress.<userId>`)
- [ ] Client cannot `select('pin_hash')` on profiles (column privilege / RLS hardening)

## Pass criteria

All items checked. Fix any failures before starting Feature 002.
