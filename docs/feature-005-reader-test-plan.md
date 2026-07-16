# Feature 005 – Qur'an Reader test plan

## Automated

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run verify:feature-005` (prefs defaults, translation fallback, browse unlock, guest merge)
- [ ] Apply migrations `20260716230000_feature_005_reader_schema.sql` and `20260716230100_feature_005_reader_font_scale.sql` without SQL errors
- [ ] Feature 004 verify still passes (`npm run verify:feature-004`)

## Manual – Display

- [ ] Uthmani renders RTL with verse numbers for short and long ayahs
- [ ] Arabic visually dominates translation / meaning panel
- [ ] Font scales larger for ages 3–6 and 7–10 without clipping
- [ ] Optional `fontScale` preference only changes display size, never Arabic wording
- [ ] Amiri (or loaded Arabic font) applies to ayah text

## Manual – Audio

- [ ] Play / pause / replay works on default Husary URL
- [ ] Repeat 1 / 3 / loop behave correctly
- [ ] Switching ayahs stops previous audio (no overlap)
- [ ] Offline / bad network shows calm error; progress is not marked from audio failure
- [ ] Beginner Qari label visible; no full Qari picker in 005

## Manual – Translation

- [ ] English preference shows Sahih International meaning
- [ ] Missing language falls back to English
- [ ] `preferred_language === 'ar'` hides meaning by default
- [ ] Show / hide meaning persists (guest local + account cloud)

## Manual – Learning loop

- [ ] Lesson: Read → Listen → Mark learned updates progress (guest + cloud)
- [ ] Complete lesson advances unlock
- [ ] Soft “Listen first” prompt appears once for ages ≤6 before first mark
- [ ] Review mode continue path still works
- [ ] Footer reminds: Arabic for memorization; translation for understanding

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

- [ ] Guest changes repeat mode / hide meaning / font scale / reciter → register → cloud prefs match guest when no prior cloud row (field-by-field)
- [ ] Existing cloud preference fields are not overwritten by guest values (empty-only merge)
- [ ] Guest browse position migrates only when cloud `learner_reader_state` is empty
- [ ] `mergeReaderPreferencesEmptyOnly` covered by `npm run verify:feature-005`
- [ ] Local guest reader preferences are marked as migrated after successful cloud merge (`qq.reader.migration_complete.<userId>`)
- [ ] Re-registering or signing in again does not duplicate or overwrite migrated preferences

## Qur'an Integrity

- [ ] Arabic Uthmani text is unchanged after preference migration
- [ ] Translation visibility changes never affect Arabic text
- [ ] Preferred reciter changes only affect audio playback, never lesson progress

## Regression

- [ ] Feature 004 lesson sizes and linear unlock unchanged
- [ ] Client cannot mutate `verses.text_uthmani`
- [ ] Home Continue Learning still opens lesson
- [ ] No microphone permission prompt appears in Feature 005 flows
