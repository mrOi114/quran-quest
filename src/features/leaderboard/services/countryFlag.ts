import { COUNTRY_OPTIONS } from '@/features/auth';

/** Resolve a country flag emoji from an ISO-2 code using the app’s country list. */
export function flagForCountryCode(countryCode: string | null | undefined): string {
  const code = (countryCode ?? '').trim().toUpperCase();
  if (!code) {
    return '🌍';
  }
  const match = COUNTRY_OPTIONS.find((item) => item.code === code);
  if (match) {
    return match.flag;
  }

  // Fallback regional indicator pair for unknown ISO-2 codes.
  if (/^[A-Z]{2}$/.test(code)) {
    const a = 0x1f1e6 + code.charCodeAt(0) - 65;
    const b = 0x1f1e6 + code.charCodeAt(1) - 65;
    return String.fromCodePoint(a, b);
  }

  return '🌍';
}
