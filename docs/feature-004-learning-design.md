# Feature 004 – Juz 30 Learning Engine design

**Status:** Implemented for V1 foundation  
**Scope:** Juz 30 content model, age-based lessons, progress tracking, simple lesson UI  
**Out of scope:** Full Qur'an Reader (005), AI recitation (006), Smart Revision logic (007), Qari picker / player / offline download

---

## Goals

- Ship authentic Juz 30 Arabic (Uthmani) with content version + hash.
- Separate English translation (Sahih International) from Arabic.
- Store audio **references** only; no offline download in Feature 004.
- Age-based lesson sizes with linear unlock from Surah An-Naba (78).
- Guest local progress + cloud progress for accounts; merge on register.
- Prepare schema hooks for Tajweed, memory scores, and learning events.

---

## Beginner memorization audio (default Qari)

**Default V1 beginner Qari:** Mahmoud Khalil Al-Husary (`husary_128`)

Reason:

- Clear pronunciation
- Slow and measured recitation
- Suitable for children and beginners
- Helps learners focus on correct memorization and Tajweed

**Audio refs:** EveryAyah `https://everyayah.com/data/Husary_128kbps/{SSSAAA}.mp3`

### Multi-Qari architecture rule

Do **not** hard-code one reciter into app logic.

| Layer | Role |
|-------|------|
| `reciters` | Catalog of approved Qaris; `is_default_beginner` marks exactly one default |
| `audio_assets` | Per-verse URLs keyed by `{reciter_key}/{SSSAAA}` |
| `verses.audio_asset_key` | Convenience pointer to the **default beginner** asset only |
| App helpers | `resolveVerseAudio(verseId, reciterKey?)` with fallback to `DEFAULT_BEGINNER_RECITER_KEY` |

Future features may add more approved Qaris and a settings picker without changing Arabic or progress tables.

### Explicit non-goals (Feature 004)

- Qari selection screen / learner preferences
- In-lesson audio player improvements
- Offline audio download or caching

Arabic text remains the primary memorization source; audio is supportive.

---

## Content authenticity

| Item | Choice |
|------|--------|
| Arabic source | Quran.com API v4 `text_uthmani` |
| Translation | Quran.com resource 20 (Sahih International), English only for V1 |
| Integrity | Per-verse SHA-256 `content_hash` + juz `corpus_hash` in `content_manifest` |
| Client writes | Revoked / no RLS insert policies on content tables |
| Regeneration | `npm run content:juz30` → JSON bundle + SQL seed |

---

## Lesson rules

- Path: surahs 78 → 114, lesson N before N+1.
- Completed lessons/verses may be reviewed anytime.
- Skipping ahead is blocked in V1.
- Verses/lesson: 3–6→1, 7–10→2, 11–14→3, 15–17→4, 18+→5.

---

## Module layout

```text
src/features/learning/
  content/juz30.json     # Bundled authentic corpus for guests/offline-tolerant reads
  services/              # planner, guest/cloud progress, migration merge
  components/LessonScreen.tsx
supabase/migrations/
  20260716220000_feature_004_learning_schema.sql
  20260716220100_feature_004_juz30_seed.sql
  20260716220200_feature_004_beginner_qari.sql
```

---

## Progress ownership

- Guest: AsyncStorage `learningPayload` v1 inside `qq.guest.progress`.
- Adult/Parent/Child: Supabase progress tables under `learner_id` (profile id).
- Parent session may write child progress via `can_manage_learner` RLS helper.
- Staged guest blob `qq.migrated_progress.<userId>` is merged after register/login.
