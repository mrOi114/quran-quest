import { en, type MessageKey } from './en';
import { so } from './so';

export type UiLanguage = 'en' | 'so';

const catalogs: Record<UiLanguage, Record<MessageKey, string>> = {
  en,
  so,
};

const missingKeys = new Set<string>();

export function normalizeUiLanguage(code: string | null | undefined): UiLanguage {
  const value = (code ?? 'en').trim().toLowerCase();
  if (value === 'so' || value.startsWith('so-')) {
    return 'so';
  }
  return 'en';
}

export function isSomaliUi(code: string | null | undefined): boolean {
  return normalizeUiLanguage(code) === 'so';
}

export type TranslateVars = Record<string, string | number>;

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (full, key: string) => {
    const value = vars[key];
    return value == null ? full : String(value);
  });
}

export function t(
  key: MessageKey,
  language: string | null | undefined,
  vars?: TranslateVars,
): string {
  const lang = normalizeUiLanguage(language);
  const catalog = catalogs[lang];
  const text = catalog[key] ?? en[key];
  if (lang !== 'en' && !catalog[key]) {
    missingKeys.add(key);
  }
  return interpolate(text, vars);
}

export function getMissingTranslationKeys(): string[] {
  return [...missingKeys].sort();
}

export function translateLessonLabel(
  lessonIndex: number,
  language: string | null | undefined,
): string {
  return t('lesson.label', language, { n: lessonIndex });
}

export function translateAyahRange(
  startAyah: number,
  endAyah: number,
  language: string | null | undefined,
): string {
  if (endAyah !== startAyah) {
    return t('lesson.ayahRangeTo', language, { start: startAyah, end: endAyah });
  }
  return t('lesson.ayahRange', language, { start: startAyah });
}
