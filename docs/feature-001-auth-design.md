# Feature 001 – Authentication design

**Status:** Implemented for V1 foundation  
**Scope:** Guest trial, Adult/Parent email auth, Child PIN unlock, device approval, RLS  
**Related:** `docs/feature-001-auth-test-plan.md`, `docs/MASTER_PROJECT_RULES.md`

---

## Goals

Deliver the locked V1 account model so later features (profile, home, learning) can assume a clear learner identity without reinventing auth.

| Role | Identity | Progress | Notes |
|------|----------|----------|-------|
| Guest | Nickname, age group, country, language | Local (AsyncStorage) | Soft prompts after milestones; no email |
| Adult | Email + password (Supabase Auth) | Cloud (later features) | Full learner access |
| Parent | Email + password | Cloud + family tools | Learner **plus** child management |
| Child | Created by parent; PIN 4–6 digits | Cloud under parent | No email; unlock on parent-approved devices |

---

## Why this architecture

### Supabase Auth for Adult/Parent

Email verification, password reset, and session refresh are delegated to Supabase Auth. The app never stores passwords. Profiles are created by a `security definer` trigger on `auth.users` using signup metadata (`role`, `display_name`).

### Guest stays local

Guests must start with almost no friction. Local profile/progress avoids forcing network or email before tasting Hifz. On register/login, guest progress is staged under `qq.migrated_progress.<userId>` so Features 004+ can merge without data loss.

### Child PIN via Edge Functions

PINs are never hashed or verified in the client. `child-set-pin` / `child-verify-pin` use bcrypt and service-role RPCs. Lockout (5 failures / ~15 minutes) is server-side. Column privileges deny clients from selecting `pin_hash` and lockout columns.

### Parent-approved devices

`register-device` stores a SecureStore-backed `device_key` for the parent. Child unlock requires that device row. This matches “PIN on a parent-approved device” without giving children independent auth users.

### Active learner vs account session

The Supabase session is always the Adult/Parent. `activeLearner` (SecureStore id) selects who is learning. Child IDs are **not** restored across cold starts — PIN must be entered again. Parent management UI is hidden while a child is the active learner.

### Session storage choice

Auth session tokens remain in AsyncStorage (Supabase + Expo standard). SecureStore has historically rejected large values (~2KB) on some iOS versions; JWTs often exceed that. Device keys and active-learner ids (small secrets) use SecureStore.

---

## Data model (auth-relevant)

- `profiles` — adult / parent / child rows; children have `parent_id`, no email  
- `approved_devices` — `(parent_id, device_key)` uniqueness  
- RPCs: `set_child_pin_hash`, `record_pin_failure`, `clear_pin_failures` (service_role only)  
- Triggers: `handle_new_user`, `protect_pin_hash`, `protect_profile_identity`

---

## Routes

| Route | Purpose |
|-------|---------|
| `/(auth)/welcome` | Entry: guest / login / register |
| `/(auth)/guest-onboarding` | Guest fields |
| `/(auth)/register` | Adult or Parent signup |
| `/(auth)/login` | Email login |
| `/(auth)/verify-email` | Resend + refresh after confirm |
| `/(auth)/forgot-password` | Send reset email |
| `/(auth)/reset-password` | Set new password after recovery deep link |
| `/(auth)/callback` | Exchange auth code / tokens from deep link |
| `/(app)/family` | Who is learning? |
| `/(app)/child-pin` | PIN unlock |
| `/(app)/parent/children` | Create / edit / delete children, reset PIN |
| `/(app)/home` | Auth stub + guest trial demo (Feature 003 replaces) |

---

## Soft guest prompts

- Milestone: 19 Juz 30 surahs (`GUEST_MILESTONE_SURAHS`) → dismissible invite  
- Limit: 37 surahs (`GUEST_LIMIT_SURAHS`) → stronger message; trial learning still not hard-walled for core local practice  
- Account-required gates for social/family features (`ACCOUNT_REQUIRED_FEATURES`)

---

## Security checklist (Feature 001)

- [x] No plaintext PIN storage  
- [x] RLS on profiles and devices  
- [x] Clients cannot SELECT PIN secret columns  
- [x] Clients cannot escalate `role` / re-parent  
- [x] Child sessions cannot open parent management  
- [x] Only parents register devices / set / verify PINs  
- [x] Email verification required before `(app)` for accounts  
- [x] Secrets not committed (`.env` gitignored; only `EXPO_PUBLIC_*` in client)

---

## Out of scope (later features)

- Full parent dashboard (screen time, AI summaries) — Feature 012  
- Cloud learning progress tables — Features 004+  
- User profile editing beyond auth fields — Feature 002  
- Admin / Scholar roles — Features 013–014
