# Qur'an Quest — Master Project Rules

**Status:** Permanent project constitution  
**Applies to:** All V1 work and every future version  
**Audience:** Humans and AI agents implementing Qur'an Quest  

This document is the single source of truth for architecture, product boundaries, and engineering standards. Before designing or implementing any feature, read the relevant sections here and confirm the work does not violate them.

If a proposal conflicts with this document, the proposal must change — not these rules — unless the product owner explicitly amends this constitution.

---

## How to use this document

1. Confirm the work is inside **V1 Scope** (or an approved later version).
2. Check **Non-Negotiable Rules** for hard blocks.
3. Follow the feature process in **Development Philosophy**.
4. Apply coding, UI, safety, AI, and data standards while building.
5. Do not invent features that are not already approved for the current version.

---

## 1. Project Mission

Qur'an Quest exists to help learners **memorize, revise, and understand the Qur'an** with patient AI guidance, authentic Arabic text, and a child-safe learning environment that parents can trust.

The mission is educational and spiritual, not entertainment-first. Games, leaderboards, and social circles exist only to support consistent Hifz practice. Every product decision should answer: *Does this help the learner remember Allah’s words more accurately, more consistently, and more safely?*

Reasoning: A clear mission prevents the product from drifting into generic edtech, social networking, or gamification that distracts from recitation and revision.

---

## 2. Vision

Qur'an Quest will become a trusted AI-powered Hifz companion where:

- Learners of all ages can start quickly (including a guest trial).
- Arabic remains the language of memorization.
- AI listens, corrects, encourages, and schedules revision.
- Children learn under parent control without needing email accounts.
- Small AI-led Hifz Circles create accountability without unsafe peer chat.
- Progress is measured by memory health and consistency, not vanity metrics.

V1 is the foundation of that vision: Juz 30 learning, AI recitation checking, Smart Revision, Companion practice, Hifz Circles, parent tools, and Android release readiness.

Reasoning: Vision guides long-term architecture choices (auth model, verse memory scores, AI turn control) so V1 code is not thrown away when later juz’ and features arrive.

---

## 3. V1 Scope

V1 is defined by the approved roadmap (Features 001–015) and locked account decisions. Do not expand scope during implementation.

### In scope for V1

| Area | Approved content |
|------|------------------|
| Accounts | Guest trial, Adult, Parent, Child (PIN) |
| Profile | Nickname, avatar, country flag, preferred language, age group, parent–child linking, learning preferences |
| Home | Continue Learning, Today’s Lesson, Daily Revision, Practice with AI, AI Hifz Circle, Leaderboards, Achievements, Parent Dashboard entry |
| Learning content | Juz 30 structure, surahs, verses, age-based lessons, progress saving |
| Reader | Authentic Arabic, verse numbers, audio, translation in selected language, child-friendly explanations, simple navigation |
| AI Recitation | Recording, speech processing, verse matching, missing/extra word detection, repeated mistake detection, confidence scoring, automatic revision scheduling |
| Smart Revision | Memory score per verse, weak verse detection, daily plan, lifetime tracking, Hifz Health Score |
| Games | Listen and repeat, tap correct word, arrange words, fill missing word, age-based difficulty |
| AI Hifz Companion | Anytime practice, patient teacher behaviour, encouragement, corrections, progress tracking |
| AI Hifz Circle | Max 7 learners, Abu Hafidul Qur'an as AI Teacher, public/private circles, AI-controlled turns, verse assignment, live checking, scoring, smart revision after mistakes, no learner text/voice chat, child-safe moderation |
| Leaderboards | Age, Juz, weekly, monthly, global, personal ranking — consistency-focused |
| Parent Dashboard | Progress reports, learning time, achievement notifications, child safety controls, AI summaries |
| Admin Dashboard | Users, content, reports, leaderboards, system monitoring |
| Scholar Dashboard | Review educational content, translations, explanations; approve updates; protect authenticity |
| Release | Full testing; Android Version 1 publish |

### Locked account model (V1)

- **Guest:** Nickname, age group, country, preferred language. No email/password. Local progress. Soft registration prompts after meaningful milestones — never immediate hard walls for core trial learning.
- **Adult:** Independent learner with full learning features. Email + password auth.
- **Parent:** Full learner **plus** family tools (create/manage children, progress, screen time, notifications, safety settings).
- **Child:** Created by parent. No email. Nickname/first name, age, avatar, country flag, preferred language, secure 4–6 digit PIN. Signs in with PIN on a parent-approved device. Parent may reset PIN anytime.

### Explicitly out of scope for V1 unless later approved

- Full Qur'an beyond Juz 30 as the primary learning corpus
- Learner-to-learner text chat or free voice chat
- Features that require inventing new product behaviour beyond the approved roadmap
- Shipping multiple platforms as the V1 release target (V1 publish target is **Android**)

Reasoning: Scope discipline is how a large AI-assisted product stays shippable. Expanding mid-feature creates unfinished systems and unsafe shortcuts.

---

## 4. Development Philosophy

### One feature at a time

After the project foundation is complete, **do not build the entire app at once**.

Every feature follows:

1. **Design** — clarify behaviour, data, routes, and safety impact.  
2. **Review** — product owner / human review before code.  
3. **Build** — implement only that feature.  
4. **Test thoroughly** — automated where practical + manual checklist.  
5. **Fix issues** — no “fix later” for blockers.  
6. **Commit to GitHub** — clean, focused commit.  
7. **Move to the next feature** — only after the previous one passes.

Never skip testing. Never rush. Prefer a strong Feature N over a half-built Feature N+1.

### Feature numbering

Use the roadmap IDs (`Feature 001`, `Feature 002`, …). Documentation, branches, and PRs should reference the feature number so history stays traceable.

### Design before code

If account model, safety, AI behaviour, or Qur'an authenticity is unclear, stop and ask. Do not guess product policy.

Reasoning: Sequential delivery produces testable increments, reduces merge conflict chaos, and keeps child-safety review meaningful.

---

## 5. Technology Stack

V1 is built on the approved scaffold. Prefer these tools; do not replace the stack without an explicit architecture decision.

| Layer | Standard |
|-------|----------|
| App framework | React Native + **Expo (SDK aligned to project, currently v57)** |
| Language | **TypeScript** (strict; avoid `any` unless justified and localized) |
| Routing | **Expo Router** (file-based), with React Navigation primitives as provided by Expo Router |
| Styling | **NativeWind (Tailwind)** + project theme/brand tokens |
| Backend / Auth / DB | **Supabase** (Auth, Postgres, RLS, Edge Functions as needed) |
| Validation | **Zod** for runtime schemas at trust boundaries |
| Local persistence | AsyncStorage / SecureStore as appropriate (PINs and secrets never in plain AsyncStorage) |
| Tooling | ESLint, Prettier, TypeScript `tsc --noEmit` |
| Node | Project `engines` range (Node 20–22) |

### Stack principles

- Prefer Expo-supported libraries documented for the project’s Expo version (`AGENTS.md` / Expo versioned docs).
- Keep secrets out of the client bundle. Only `EXPO_PUBLIC_*` keys belong in the app.
- Put privileged operations (PIN hashing/verification, device registration, sensitive writes) in **Supabase Edge Functions** or equivalent server-side paths with RLS.
- Do not add a second state framework, UI kit, or backend “just in case.” Add dependencies when a feature truly requires them.

Reasoning: A single coherent stack lowers onboarding cost for AI agents and humans, and keeps security review concentrated in known places (Supabase RLS + Edge Functions).

---

## 6. Folder Structure

Preserve a scalable structure. Feature code lives under domain folders; shared primitives stay generic.

```text
quran-quest/
├── app/                      # Expo Router routes and layouts only
│   ├── (auth)/               # Welcome, login, register, guest, verify, etc.
│   ├── (app)/                # Authenticated / active-learner areas
│   └── _layout.tsx
├── src/
│   ├── components/ui/        # Shared presentational UI
│   ├── features/             # Domain modules (auth, profile, reader, …)
│   │   └── <feature>/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── schemas.ts
│   │       ├── types.ts
│   │       └── index.ts
│   ├── hooks/                # Cross-feature hooks
│   ├── services/             # Cross-feature services (sparingly)
│   ├── stores/               # Client state when justified
│   ├── lib/                  # env, supabase client, low-level utilities
│   ├── constants/
│   ├── theme/
│   ├── types/
│   └── utils/
├── supabase/
│   ├── migrations/
│   └── functions/
├── docs/                     # Constitutions, feature plans, test plans
├── scripts/
└── package.json
```

### Structure rules

- **Routes stay thin.** `app/` files compose feature modules; they do not own business logic.
- **Features own their domain.** Auth logic belongs in `src/features/auth`, not scattered across unrelated folders.
- **No circular feature imports.** Shared code moves to `components/ui`, `lib`, `utils`, or `types`.
- **Docs live in `docs/`.** Every non-trivial feature should have a short design/test note when behaviour is complex (as with Feature 001).

Reasoning: Clear boundaries keep the codebase navigable as Features 004–014 land, and prevent “god files” that become unsafe to change.

---

## 7. Coding Standards

- Write TypeScript with explicit types at module boundaries (services, hooks, public components).
- Prefer small, pure functions for scoring, scheduling, and content transforms — they are easier to test and audit.
- Validate external input with Zod (forms, Edge Function payloads, deep links).
- Handle loading, empty, and error states in UI; never leave silent failures on learning-critical paths.
- Avoid premature abstraction. Duplicate lightly until a real shared pattern appears twice with the same meaning.
- Do not leave `console.log` noise in production paths; use structured logging standards (Section 24).
- Comments explain *why* (safety, authenticity, product constraints), not *what* the next line obviously does.
- Match existing project patterns (imports, NativeWind usage, auth context) before introducing a new style.

Reasoning: Consistency reduces review time and prevents each feature from inventing a private dialect.

---

## 8. Naming Conventions

| Kind | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase | `ChildPinEntry.tsx` |
| Files (non-components) | camelCase | `authService.ts` |
| React components | PascalCase | `GuestOnboardingForm` |
| Functions / variables | camelCase | `fetchChildren` |
| Types / interfaces | PascalCase | `Profile`, `GuestProfile` |
| Constants | SCREAMING_SNAKE or domain const objects | `GUEST_MILESTONE_SURAHS` |
| DB tables / columns | snake_case | `preferred_language`, `parent_id` |
| Routes | Expo Router conventions | `/(auth)/login`, `/(app)/home` |
| Feature folders | kebab or short noun | `auth`, `hifz-circle` |
| AI persona | Product name **Abu Hafidul Qur'an** in user-facing copy | — |

### Naming principles

- Prefer domain language: `verse`, `surah`, `juz`, `hifzHealthScore`, `memoryScore`.
- Do not use vague names (`data`, `stuff`, `temp`, `helper2`).
- User-facing strings must be respectful, clear, and age-appropriate.

Reasoning: Predictable names make security reviews and Qur'an-content audits faster.

---

## 9. UI/UX Principles

- **Calm and focused.** Learning screens prioritize Arabic text, audio controls, and the next clear action.
- **Child-friendly without being chaotic.** Soft encouragement, readable type, large tap targets; avoid visual noise.
- **One primary action per screen** whenever possible (Continue, Recite, Unlock, Create account).
- **Guest trial feels open.** Do not trap guests behind registration walls before they experience value.
- **Soft account prompts.** After meaningful milestones, invite registration with a friendly message; always allow continuing as guest for trial-allowed features.
- **Parent paths are obvious** for family management, but never interrupt a child’s learning flow with adult account chrome.
- **Consistency over novelty.** Reuse spacing, buttons, and feedback patterns from the design system/theme tokens.
- **Offline-tolerant UX where local progress exists** (guest), with clear messaging when cloud features need an account/network.

Reasoning: Hifz requires concentration. UI that constantly upsells or clutters verses undermines the mission.

---

## 10. Accessibility

- Minimum touch target sizes suitable for children and adults.
- Support dynamic type / readable font scaling where the platform allows without breaking Arabic layout.
- Sufficient colour contrast for text and controls.
- Do not rely on colour alone for correctness feedback (also use icons/text: correct / try again).
- Screen reader labels on icon-only controls.
- Arabic text rendering must remain correct under RTL/LTR mixed layouts; translations may follow the learner’s language direction, but Arabic verses stay authentic and readable.
- Motion should be gentle; respect reduced-motion preferences when adding animations.

Reasoning: Accessibility is part of child safety and inclusive Islamic education — not an optional polish pass.

---

## 11. Performance Standards

- Keep startup and home navigation snappy; defer heavy AI/audio work until needed.
- Lazy-load large content lists (surah/verse lists) rather than mounting entire Juz 30 UI at once when avoidable.
- Audio and recording flows must remain responsive; show progress for long operations.
- Avoid unnecessary re-renders in recitation and circle turn UIs.
- Cache Qur'an content sensibly; authenticity updates must still be controllable via Scholar/Admin approval paths.
- Profile and progress writes should be resilient; do not block recitation feedback on non-critical telemetry.
- Measure before micro-optimizing; fix real jank on mid-range Android devices (V1 target).

Reasoning: A laggy recitation checker destroys trust. Performance is a learning feature, not only an engineering metric.

---

## 12. Security Standards

- Use Supabase Auth for Adult/Parent accounts; enforce email verification where configured.
- **Never store child PINs in plaintext.** Hash/verify server-side; lock out after repeated failures.
- Child unlock is limited to **parent-approved devices**.
- Row Level Security (RLS) is mandatory for user data. Client code must assume hostile callers.
- Do not expose service-role keys in the app.
- Validate and authorize every Edge Function call (parent owns child, device is registered, role checks).
- SecureStore for sensitive device-local secrets; never log PINs, tokens, or raw auth headers.
- Least privilege for Admin/Scholar tools.
- Dependency updates should not silently weaken auth or crypto choices.

Reasoning: This app serves children. Security failures are product failures.

---

## 13. Child Safety Requirements

- Children do **not** need email addresses.
- No learner-to-learner private messaging.
- **AI Hifz Circle:** no text chat and no voice chat between learners.
- All social/learning interaction in circles is mediated by **Abu Hafidul Qur'an**.
- Content, avatars, and copy must be age-appropriate.
- Child-safe moderation is required for circle participation and any user-generated labels/names.
- Guests and children must not access parent management surfaces.
- Recording/microphone use must be purpose-limited to recitation checking and clearly presented.
- Do not ship features that create unmoderated social graphs for minors.

Reasoning: Safety is a prerequisite for parents to trust Qur'an Quest with their children’s voices and progress.

---

## 14. Parent Controls

Parents can:

- Learn with full learning features (same core learning access as Adult).
- Create and manage multiple child accounts.
- Link children to their parent account.
- View progress and AI learning summaries.
- Control learning / screen time.
- Receive achievement and activity notifications.
- Manage child safety settings.
- Reset a child’s PIN at any time.

Parent UI must make these controls discoverable without exposing them to the active child session.

Reasoning: Parent trust unlocks family adoption. Controls must be real capabilities, not decorative settings screens.

---

## 15. AI Teacher Behaviour (Abu Hafidul Qur'an)

**Abu Hafidul Qur'an** is the permanent AI Hifz Teacher and Companion of Qur'an Quest — the persona for guided learning and Hifz Circles.

He always speaks with wisdom, patience, kindness, encouragement, and respect. He never shames, pressures, or embarrasses a learner. He always encourages learners with positive Islamic manners and uplifting words.

Abu Hafidul Qur'an must:

- Be patient, respectful, and encouraging.
- Help learners memorize the Qur'an, improve Tajweed, build confidence, stay consistent with daily revision, and develop love for the Qur'an.
- Correct mistakes clearly and gently without shaming.
- Keep focus on the assigned verse/lesson.
- Control turn order and activity flow in Hifz Circles.
- Assign verses and report scores in a calm, fair way.
- Trigger Smart Revision when mistakes indicate weakness.
- Use age-appropriate language.
- Never role-play as a human scholar issuing religious rulings beyond approved educational explanations.
- Never request personal data beyond what the learning task needs.
- Never facilitate contact between learners outside the approved circle mechanics.

Reasoning: A consistent teacher persona builds trust and keeps AI behaviour auditable against child-safety and pedagogy goals.

---

## 16. AI Hifz Companion Behaviour

The AI Hifz Companion is for **anytime individual practice**.

It must:

- Act as a patient Hifz teacher available on demand.
- Encourage effort and consistency.
- Provide automatic corrections using the recitation engine signals.
- Track practice progress and feed Smart Revision.
- Remain suitable for Guest trial and registered learners (subject to feature gates).
- Avoid unrelated conversation; stay on Qur'an practice.

Reasoning: Companion mode is the private practice loop. If it drifts into chatbot chatter, it dilutes Hifz outcomes.

---

## 17. AI Hifz Circle Rules

AI Hifz Circle is a **signature V1 feature**. Rules are strict:

- Maximum **7 learners** per circle.
- **Abu Hafidul Qur'an** is the teacher and controls every turn.
- Circles may be **public or private**.
- AI assigns verses, runs live recitation checking, scores automatically, and schedules revision after mistakes.
- **No text chat** between learners.
- **No voice chat** between learners.
- Child-safe moderation is mandatory.
- Guests may be restricted from circles until they have an account when the product gates require it (account-required social features).

Do not “soft launch” peer chat later inside V1 under another name. If peer communication is ever considered, it requires a new approved constitution amendment and safety design.

Reasoning: Removing free chat is intentional. It preserves the educational nature of circles and dramatically reduces abuse risk.

---

## 18. Smart Revision Principles

Smart Revision exists so the AI always knows what the learner should revise next.

Principles:

- Maintain a **memory score for every verse** the learner practices.
- Detect weak verses from mistakes, low confidence, and forgetting patterns.
- Build a **daily revision plan** from those signals.
- Track lifetime memorization progress.
- Surface a **Hifz Health Score** that reflects retention quality, not only streaks.
- After circle or companion mistakes, update revision scheduling automatically.
- Prefer small, frequent revision over overwhelming catch-up lists.

Reasoning: Memorization fails when apps only celebrate new verses. Revision is the product’s long-term integrity.

---

## 19. Learning Game Principles

Games reinforce recognition and recall. They are not the core product.

Approved V1 game types:

- Listen and repeat  
- Tap the correct word  
- Arrange words  
- Fill in the missing word  

Rules:

- Difficulty scales by **age group**.
- Games must use authentic verse content and must not distort Qur'anic wording for humour.
- Rewards celebrate effort and accuracy; avoid punitive or addictive dark patterns.
- Games should feed the same progress/revision understanding as lessons where relevant.

Reasoning: Games serve Hifz. Hifz must never serve the game economy.

---

## 20. Translation Principles

**Arabic always remains the primary text.**

- Learners memorize and recite in Arabic.
- The selected language is for **understanding only** (translation + child-friendly explanations).
- UI must never imply that translation replaces memorization.
- Reader layout should keep Arabic visually primary; translation secondary.
- Translations and explanations used in-product are subject to **Scholar Dashboard** review/approval for authenticity.
- Do not auto-generate unchecked tafsir-like claims in the learner’s language without an approval path.

Reasoning: Protecting the primacy of Arabic preserves educational integrity and religious respect.

---

## 21. Database Design Principles

- Model learners, roles, parent–child links, devices, progress, verse memory, and circle sessions explicitly.
- Use Postgres via Supabase with **migrations in version control**.
- Enable **RLS** on all user-scoped tables from the first migration that creates them.
- Prefer stable IDs for surahs/verses (canonical references) so progress survives content presentation changes.
- Separate profile fields needed by clients from secrets (PIN hashes, lockouts).
- Guest progress starts local; on registration, migrate without data loss.
- Design verse memory and revision tables so Features 006–007 can extend without rewriting auth.
- Avoid storing large binary audio in Postgres when object storage is the appropriate tool (when that feature lands).
- Scholar/Admin approval state should be represented for educational content that can change.

Reasoning: Data shape is product behaviour. Weak schema decisions force unsafe client-side authority later.

---

## 22. API Design Standards

- Browser/app talks to Supabase under RLS for ordinary CRUD.
- Privileged or multi-step operations use **Edge Functions** with explicit authz checks.
- Inputs validated with schemas; outputs typed on the client.
- Idempotent where retries are likely (device register, pin set).
- Return safe error messages to clients; keep sensitive details in server logs.
- Do not create a parallel custom backend unless Supabase cannot meet a requirement — and then only with an architecture amendment.

Reasoning: Fewer API surfaces mean fewer child-safety and auth bugs.

---

## 23. Error Handling

- Convert infrastructure errors into calm, actionable user messages.
- Recitation/AI failures must never corrupt verse progress silently; fail open to “try again” with no false “perfect” scores.
- Auth errors distinguish wrong PIN, locked PIN, network failure, and unverified email without leaking whether an email exists beyond standard auth practices.
- Parent actions that fail (create child, reset PIN) must explain the next step.
- Edge Functions: handle unauthorized, validation, and conflict cases with consistent JSON error shapes.
- Never swallow errors empty in learning-critical paths.

Reasoning: Clear errors protect trust during the most stressful moments (failed PIN, failed recitation check).

---

## 24. Logging Standards

- Log operational events needed for debugging and abuse prevention (failed PIN attempts count, function errors, migration issues).
- **Never log** PINs, passwords, access tokens, raw recordings, or full personal data dumps.
- Prefer structured logs with feature/action codes (`auth.child_pin_lockout`, `circle.turn_scored`).
- Client logs in production should be minimal.
- Admin monitoring (Feature 013) should use aggregated/safe operational signals.

Reasoning: Logs are a common leak path. In a child-learning app, privacy-preserving logging is mandatory.

---

## 25. Testing Requirements

Every feature must pass testing before the next feature starts.

Minimum expectations:

- Typecheck and lint clean for touched code.
- Manual test plan checklist for user-visible behaviour (see `docs/` feature test plans).
- Auth/safety paths: guest gates, parent/child boundaries, PIN lockout, route protection.
- Learning/AI paths (when built): scoring correctness cases (missing word, extra word, weak verse scheduling).
- Before Android V1 publish (Feature 015): test with children, parents, and Qur'an teachers; fix bugs; improve performance.

Do not mark a feature complete because “it renders.” Complete means the checklist passes.

Reasoning: Sequential delivery only works if “done” means “verified.”

---

## 26. Git Workflow

- Work from a clean feature branch named after the roadmap item when collaborating, e.g. `feature/001-authentication`.
- Keep commits focused on one feature or one fix.
- Do not commit secrets (`.env`), service keys, or large credentials.
- Commit after the feature passes its test plan.
- Prefer clear messages that state the feature purpose:  
  `feat(auth): add guest trial onboarding and local progress gates`
- Do not rewrite shared history on `main` without owner approval.
- Pull Request descriptions should reference Feature ID + test plan results.

Reasoning: Git history is the audit trail for safety-sensitive education software.

---

## 27. Versioning Strategy

- **V1** = Juz 30-centred product defined by Features 001–015, Android publish target.
- App `package.json` version follows semantic versioning for store releases; roadmap “V1/V2” is product versioning.
- Constitution amendments for a new product version (V2, V3) must be written **before** building that version’s features.
- Do not advertise V2 capabilities inside V1 UI.

Reasoning: Version boundaries protect users from half-migrated expectations and keep engineering honest about what shipped.

---

## 28. Documentation Standards

- This file (`docs/MASTER_PROJECT_RULES.md`) is the constitution; keep it updated when the owner changes policy.
- Each complex feature should have:
  - a short design summary (or linked plan), and
  - a test plan checklist under `docs/`.
- User-facing help copy should match real behaviour (especially cancellation of social myths: there is no learner chat).
- AI agents must read this constitution before implementing features.
- Do not create competing “source of truth” docs that silently override these rules.

Reasoning: Documentation debt becomes product drift. A constitution only works if it stays singular.

---

## 29. Future Expansion Rules (V2, V3…)

Future versions may expand juz’ coverage, platforms, or pedagogy — but only under these rules:

1. **No silent scope creep inside V1.** New ideas go to a future-version backlog.
2. **Safety model does not regress.** Peer chat, unsafe social, or email-based child accounts remain forbidden unless explicitly redesigned and approved.
3. **Arabic primacy does not change.**
4. **Smart Revision and recitation integrity remain central** as more content is added.
5. **Data migrations must preserve learner progress** and verse identity.
6. **Amend this constitution first**, then build.
7. Reuse V1 architecture (feature folders, Supabase RLS, Abu Hafidul Qur'an rules) unless there is a documented reason to change.

Reasoning: Expansion should compound the foundation, not rewrite the product’s ethics or architecture every cycle.

---

## 30. Non-Negotiable Rules

These rules cannot be bypassed for convenience, deadlines, or demos:

1. **One feature at a time** — design → review → build → test → fix → commit → next.  
2. **No inventing product features** outside the approved version scope.  
3. **Arabic is the memorization language**; translations are for understanding only.  
4. **Children have no email requirement**; parents create children; PIN on approved devices.  
5. **Adult = learner; Parent = learner + family controls.**  
6. **Guest trial must be genuinely usable** before hard account walls (soft milestone prompts only).  
7. **AI Hifz Circle: max 7, Abu Hafidul Qur'an controls turns, no learner text/voice chat.**  
8. **Child safety and parent controls are mandatory**, not optional polish.  
9. **Never store or log PINs/passwords in plaintext.**  
10. **RLS and server-side authorization are required** for privileged actions.  
11. **Do not skip testing** before moving to the next feature.  
12. **AI Recitation + Smart Revision integrity** must not be faked with random scores.  
13. **Scholar/authenticity review path** is required for translations/explanations that ship as trusted content.  
14. **Leaderboards encourage consistency**, not unhealthy rivalry or shame.  
15. **This constitution wins** over conflicting ad-hoc instructions unless the owner amends it.

---

## Appendix A — Approved V1 feature sequence

001 Authentication (incl. Guest Trial) → 002 User Profile → 003 Home Dashboard → 004 Juz 30 Learning Engine → 005 Qur'an Reader → 006 AI Recitation Engine → 007 Smart Revision → 008 Learning Games → 009 AI Hifz Companion → 010 AI Hifz Circle → 011 Leaderboards → 012 Parent Dashboard → 013 Admin Dashboard → 014 Scholar Dashboard → 015 Testing & Release (Android V1).

---

## Appendix B — Amendment policy

Only the product owner may amend this document. Amendments must:

- state what changed and why,
- note the date,
- clarify whether the change applies to V1 or a future version,
- avoid contradicting child-safety or Arabic-primacy principles without an explicit, careful redesign.

---

*Qur'an Quest Master Project Rules — permanent constitution. Build with ihsan: one strong feature at a time.*
