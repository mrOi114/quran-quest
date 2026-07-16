# Feature 005 – Qur'an Reader test plan

## Automated

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run verify:feature-005` (prefs defaults, translation fallback, browse unlock, guest merge, future settings shape)
- [x] `npm run verify:feature-004`
- [ ] Apply migrations `20260716230000_*`, `20260716230100_*`, `20260716230200_feature_005_reader_future_settings.sql` without SQL errors (requires local Supabase/Docker)

## Manual – Display

- [ ] Uthmani renders RTL with verse numbers for short and long ayahs
- [ ] Arabic visually dominates translation / meaning panel
- [ ] Font size is age-derived (3–6 / 7–10 larger); optional `fontScale` not used in V1 UI
- [ ] Amiri (or loaded Arabic font) applies to ayah text
- [ ] RTL verified on Android

## Manual – Audio

- [ ] Play / pause / replay works on default Husary URL (Mahmoud Khalil Al-Husary / `husary_128`)
- [ ] Beginner Qari remains Mahmoud Khalil Al-Husary
- [ ] Repeat 1 / 3 / loop behave correctly
- [ ] Switching ayahs stops previous audio (no overlap)
- [ ] Audio stops correctly when leaving the screen
- [ ] Offline / bad network shows calm error; progress is not marked from audio failure
- [ ] Beginner Qari label visible; no full Qari picker in 005

## Manual – Translation

- [ ] English preference shows Sahih International meaning
- [ ] Missing language falls back to English
- [ ] `preferred_language === 'ar'` hides meaning by default
- [ ] Show / hide meaning persists (guest local + account cloud)
- [ ] Translation never replaces Arabic (Arabic always primary)

## Manual – Learning loop

- [ ] Lesson: Read → Listen → Repeat → Mark learned → Continue
- [ ] Complete lesson advances unlock
- [ ] Soft “Listen first” prompt appears once for ages ≤6 before first mark
- [ ] Review mode continue path still works
- [ ] Footer reminds: Arabic for memorization; translation for understanding
- [ ] No Record / microphone UI in Feature 005

## Manual – Browse

- [ ] Home “Read Juz 30” opens browse Reader
- [ ] Today’s Lesson card opens the lesson route
- [ ] Locked future surahs cannot be opened
- [ ] Browse does not auto-mark verses learned
- [ ] Last browse position resumes for accounts / guests

## Safety / roles

- [ ] Child session has no parent chrome inside Reader
- [ ] Guest can use Reader without hard account wall
- [ ] Unrelated account cannot write another learner’s prefs (RLS)

## Guest Preference Migration

- [x] Field-by-field empty-only merge covered by `npm run verify:feature-005`
- [ ] Guest changes repeat / meaning visibility / reciter → register → cloud matches when no prior cloud row
- [ ] Existing cloud preference fields are never overwritten
- [ ] Guest browse position migrates only when cloud `learner_reader_state` is empty
- [ ] Local guest reader preferences marked migrated (`qq.reader.migration_complete.<userId>`)
- [ ] Migration is idempotent — re-sign-in does not duplicate or overwrite
- [ ] Font size remains age-derived (not migrated / not overwriting)

## Qur'an Integrity

- [x] Prefs merge helpers never carry Arabic/translation content fields (`verify:feature-005`)
- [ ] Arabic Uthmani text is unchanged after preference migration
- [ ] Translation visibility changes never affect Arabic text
- [ ] Preferred reciter changes only affect audio playback, never lesson progress

## Future-ready architecture (no UI in 005)

- [x] `future_settings` JSON column + typed `ReaderFutureSettings` for auto-play, playback speed, mushaf style, night mode
- [x] Empty-only merge helper for future settings keys
- [ ] No premature UI for those options in Feature 005

## Regression

- [x] Feature 004 lesson sizes and linear unlock unchanged (`verify:feature-004`)
- [ ] Client cannot mutate `verses.text_uthmani`
- [ ] Home Continue Learning still opens lesson
- [ ] No microphone permission prompt appears in Feature 005 flows
