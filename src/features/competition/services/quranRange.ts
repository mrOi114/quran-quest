import type { MessageKey } from '@/i18n';

export type QuranRangeId =
  | 'juz_1'
  | 'juz_2'
  | 'juz_3'
  | 'juz_4'
  | 'juz_5'
  | 'juz_6'
  | 'juz_7'
  | 'juz_8'
  | 'juz_9'
  | 'juz_10'
  | 'juz_11'
  | 'juz_12'
  | 'juz_13'
  | 'juz_14'
  | 'juz_15'
  | 'juz_16'
  | 'juz_17'
  | 'juz_18'
  | 'juz_19'
  | 'juz_20'
  | 'juz_21'
  | 'juz_22'
  | 'juz_23'
  | 'juz_24'
  | 'juz_25'
  | 'juz_26'
  | 'juz_27'
  | 'juz_28'
  | 'juz_29'
  | 'juz_30';

export const DEFAULT_QURAN_RANGE: QuranRangeId = 'juz_30';

const LEGACY_RANGE_MAP: Record<string, QuranRangeId> = {
  juz_30: 'juz_30',
  first_5: 'juz_1',
  first_10: 'juz_1',
  first_15: 'juz_1',
  first_20: 'juz_1',
  first_25: 'juz_1',
  all_30: 'juz_30',
};

export const QURAN_RANGE_IDS: QuranRangeId[] = Array.from(
  { length: 30 },
  (_, index) => `juz_${index + 1}` as QuranRangeId,
);

export const QURAN_RANGE_OPTIONS: Array<{
  id: QuranRangeId;
  labelKey: MessageKey;
  playable: boolean;
}> = QURAN_RANGE_IDS.map((id) => ({
  id,
  labelKey: 'competition.juzLabel',
  playable: true,
}));

export function juzNumberFromRange(range: string | null | undefined): number {
  const normalized = normalizeQuranRange(range);
  const match = /^juz_(\d{1,2})$/.exec(normalized);
  const value = match ? Number(match[1]) : 30;
  return value >= 1 && value <= 30 ? value : 30;
}

export function rangeFromJuzNumber(juz: number): QuranRangeId {
  if (juz >= 1 && juz <= 30) {
    return `juz_${juz}` as QuranRangeId;
  }
  return DEFAULT_QURAN_RANGE;
}

export function normalizeQuranRange(value: unknown): QuranRangeId {
  if (typeof value === 'string' && (QURAN_RANGE_IDS as string[]).includes(value)) {
    return value as QuranRangeId;
  }
  if (typeof value === 'string' && LEGACY_RANGE_MAP[value]) {
    return LEGACY_RANGE_MAP[value];
  }
  return DEFAULT_QURAN_RANGE;
}

export function isQuranRangeId(value: unknown): value is QuranRangeId {
  if (typeof value !== 'string') {
    return false;
  }
  return (QURAN_RANGE_IDS as string[]).includes(value) || Boolean(LEGACY_RANGE_MAP[value]);
}

export function isQuranRangePlayable(range: QuranRangeId): boolean {
  const juz = juzNumberFromRange(range);
  return juz >= 1 && juz <= 30;
}

export function rangeLabelKey(_range?: string | null): MessageKey {
  return 'competition.juzLabel';
}
