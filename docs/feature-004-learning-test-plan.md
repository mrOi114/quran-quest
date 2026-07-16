# Feature 004 – Juz 30 Learning Engine test plan

## Automated

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run verify:feature-004` (corpus hash + lesson sizing)
- [ ] Apply migrations (`supabase db reset` or `supabase migration up`) without SQL errors
- [ ] Seed contains 37 surahs / 564 verses / English translations / audio URLs
- [ ] Default beginner Qari is Mahmoud Khalil Al-Husary (`husary_128` / `Husary_128kbps`)
- [ ] Seed/bundle do not hard-require Alafasy; multi-reciter catalog structure is present

## Manual – Guest

- [ ] Start guest with age 3–6 → first lesson is An-Naba ayah 1 only
- [ ] Mark ayah learned → progress persists after app restart
- [ ] Cannot open a future lesson key by deep link (redirects to current)
- [ ] Complete lesson → next lesson unlocks
- [ ] Review completed lesson anytime
- [ ] Register account → learning progress merges (verses/lessons preserved)

## Manual – Adult / Parent / Child

- [ ] Adult continue learning writes cloud `learner_learning_state` + `verse_progress`
- [ ] Parent unlocks child → child progress attributed to child profile id
- [ ] Parent can still read child surah/lesson progress (RLS)
- [ ] Unrelated account cannot read/write another learner’s progress

## Content authenticity

- [ ] Arabic shown is Uthmani; translation is secondary English
- [ ] Client cannot update `verses.text_uthmani` (RLS / grants)
- [ ] Audio refs present (Husary EveryAyah URLs); playback/download not required in 004
- [ ] No Qari selection UI or offline download shipped in 004

## Regression

- [ ] Home Continue Learning opens real lesson (not placeholder)
- [ ] Guest milestone counters still track completed Juz 30 surahs
- [ ] Feature 005 Reader may extend lesson UI; Feature 004 unlock rules stay unchanged
