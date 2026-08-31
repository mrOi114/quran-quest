import type { MessageKey } from '@/i18n';

export type QuranRangeId =
  | 'juz_30'
  | 'first_5'
  | 'first_10'
  | 'first_15'
  | 'first_20'
  | 'first_25'
  | 'all_30';

export const DEFAULT_QURAN_RANGE: QuranRangeId = 'juz_30';

export const QURAN_RANGE_OPTIONS: Array<{
  id: QuranRangeId;
  labelKey: MessageKey;
  playable: boolean;
}> = [
  { id: 'juz_30', labelKey: 'competition.rangeJuz30', playable: true },
  { id: 'first_5', labelKey: 'competition.rangeFirst5', playable: true },
  { id: 'first_10', labelKey: 'competition.rangeFirst10', playable: true },
  { id: 'first_15', labelKey: 'competition.rangeFirst15', playable: true },
  { id: 'first_20', labelKey: 'competition.rangeFirst20', playable: true },
  { id: 'first_25', labelKey: 'competition.rangeFirst25', playable: true },
  { id: 'all_30', labelKey: 'competition.rangeAll', playable: true },
];

export function isQuranRangeId(value: unknown): value is QuranRangeId {
  return QURAN_RANGE_OPTIONS.some((option) => option.id === value);
}

export function isQuranRangePlayable(range: QuranRangeId): boolean {
  return QURAN_RANGE_OPTIONS.some((option) => option.id === range && option.playable);
}

export function rangeLabelKey(range: string | null | undefined): MessageKey {
  const option = QURAN_RANGE_OPTIONS.find((item) => item.id === range);
  return option?.labelKey ?? 'competition.rangeJuz30';
}
