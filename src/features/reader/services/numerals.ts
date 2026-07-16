import { EASTERN_DIGITS } from '../constants';

/** Convert a positive integer to Eastern Arabic numerals (٠١٢…). */
export function toEasternNumerals(value: number): string {
  return String(value).replace(/\d/g, (digit) => EASTERN_DIGITS[Number(digit)] ?? digit);
}
