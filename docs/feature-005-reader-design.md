# Feature 005 – Qur'an Reader design

**Status:** Implemented for V1  
**Scope:** Juz 30 Arabic-first Reader, verse audio, translation-for-understanding, lesson loop integration, calm browse for unlocked content  
**Out of scope:** AI recitation (006), Tajweed UI, Companion chat (009), offline audio packs, full mushaf beyond Juz 30, Qari marketplace picker

---

## Goals

- Display authentic Uthmani Arabic with verse numbers and child-friendly readability.
- Play verse audio via the Feature 004 approved Qari system (default beginner: Husary).
- Keep translation secondary and language-resolved with English fallback.
- Support the learning loop: Read → Listen → Repeat → Mark progress → Continue lesson.
- Prepare seams for AI Features 006 / 007 / 009 without building AI or requesting the microphone.

---

## Surfaces

| Surface | Route | Behaviour |
|---------|-------|-----------|
| Lesson Reader | `/(app)/lesson` | One-ayah focus inside age-based lessons; mark learned / complete |
| Browse Reader | `/(app)/reader` | Surah/ayah browse for unlocked Juz 30 content only |

---

## Module layout

```text
src/features/reader/
  components/     # ArabicVerseText, TranslationPanel, VerseAudioControls, ReaderVerseFocus, …
  hooks/          # useVerseAudio, useReaderPreferences, useBrowseReader
  services/       # audioPlayerService, translationResolver, readerPreferencesStore, browseAccess
supabase/migrations/
  20260716230000_feature_005_reader_schema.sql
```

---

## Arabic display

- Source: `verses.text_uthmani` / bundled `textUthmani`.
- RTL writing direction; age-scaled type with Amiri font.
- Eastern Arabic ayah markers when font supports them.
- Visual hierarchy: Arabic → marker → audio → meaning → CTA.

---

## Audio

- Resolve with `resolveVerseAudio(verseId, reciterKey?)`.
- Default Qari: `husary_128` (Mahmoud Khalil Al-Husary).
- Controls: play/pause, replay, repeat `1` | `3` | `loop`.
- Default repeat: `3` for ages ≤10, else `1`.
- Stream only (no offline download in 005).
- Single shared `Audio.Sound` instance.

---

## Translation

```text
preferred_language → approved translation by language_code
  → fallback en-sahih-international
  → preferred_language === 'ar' → hide meaning panel by default
```

Child-friendly explanations use `verse_explanations` (approved only); V1 may ship zero rows.

---

## Progress & unlock

- Mark learned / complete lesson remain Feature 004 ownership (`progressService`).
- Browse unlock follows linear lesson unlock; no skipping ahead.
- Browse resume stored in `learner_reader_state` (separate from lesson cursor).

---

## Database (Feature 005)

| Table | Role |
|-------|------|
| `learner_reader_preferences` | show translation, repeat count, preferred reciter/translation |
| `learner_reader_state` | last browse surah/ayah |
| `verse_explanations` | approved child-friendly meanings (content, read-only to clients) |

Reuses Feature 004 content + progress tables unchanged for verse identity and learning writes.

---

## Security

- Content tables remain client read-only.
- Prefs/state RLS via `can_manage_learner`.
- No microphone permission in Feature 005.
- Guest prefs local (`qq.reader.prefs` / reader state keys).
- On register, guest reader prefs/state stage to `qq.migrated_reader.<userId>` and merge into cloud **field-by-field** (empty/null cloud fields only; set cloud values never overwritten).
- After successful merge, local marker `qq.reader.migration_complete.<userId>` prevents re-migration on later sign-ins.
- Optional `font_scale` is display-only; null uses age-group default. Preference migration never mutates Arabic Uthmani or lesson progress.

---

## Future AI seams

- `mode: 'lesson' | 'browse' | 'practice'` on focus components.
- Do not render `verse_tajweed` yet.
- No fake recitation scores; `recitation_attempt` event type reserved for 006.
