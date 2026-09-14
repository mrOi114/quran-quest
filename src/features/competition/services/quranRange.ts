import type { MessageKey } from '@/i18n';

export type QuranRangeId =
  | 'all_30'
  | 'first_10'
  | 'first_20'
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

export const BUNDLE_RANGE_IDS: QuranRangeId[] = ['all_30', 'first_10', 'first_20'];

const SINGLE_JUZ_RANGE_IDS: QuranRangeId[] = Array.from(
  { length: 30 },
  (_, index) => `juz_${index + 1}` as QuranRangeId,
);

const LEGACY_RANGE_MAP: Record<string, QuranRangeId> = {
  first_5: 'juz_1',
  first_15: 'juz_1',
  first_25: 'juz_1',
};

export const QURAN_RANGE_IDS: QuranRangeId[] = [...BUNDLE_RANGE_IDS, ...SINGLE_JUZ_RANGE_IDS];

function rangeList(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

export function juzNumbersForRange(range: string | null | undefined): number[] {
  const id = normalizeQuranRange(range);
  if (id === 'first_10') return rangeList(1, 10);
  if (id === 'first_20') return rangeList(1, 20);
  if (id === 'all_30') return rangeList(1, 30);
  return [juzNumberFromRange(id)];
}

export const QURAN_RANGE_OPTIONS: Array<{
  id: QuranRangeId;
  labelKey: MessageKey;
  playable: boolean;
  bundle: boolean;
}> = [
  ...BUNDLE_RANGE_IDS.map((id) => ({
    id,
    labelKey: rangeLabelKey(id),
    playable: true,
    bundle: true,
  })),
  ...SINGLE_JUZ_RANGE_IDS.map((id) => ({
    id,
    labelKey: 'competition.juzLabel' as MessageKey,
    playable: true,
    bundle: false,
  })),
];

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
  return (QURAN_RANGE_IDS as string[]).includes(range);
}

export function rangeLabelKey(range?: string | null): MessageKey {
  const id = normalizeQuranRange(range);
  if (id === 'all_30') return 'competition.rangeAll';
  if (id === 'first_10') return 'competition.rangeFirst10';
  if (id === 'first_20') return 'competition.rangeFirst20';
  return 'competition.juzLabel';
}

export function rangeLabelArgs(range?: string | null): {
  key: MessageKey;
  vars?: { n: number };
} {
  const id = normalizeQuranRange(range);
  const key = rangeLabelKey(id);
  if (key === 'competition.juzLabel') {
    return { key, vars: { n: juzNumberFromRange(id) } };
  }
  return { key };
}
