import { CONTACT_SAFETY_MESSAGE } from '@/constants/groupLimits';

const EMAIL_RE = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i;
const OBFUSCATED_EMAIL_RE = /\b(at)\b.{0,16}\b(gmail|yahoo|hotmail|outlook|icloud|proton)\b/i;
const US_PHONE_RE = /[0-9]{3}[-.\s][0-9]{3}[-.\s][0-9]{4}/;
const INTL_PHONE_RE = /\+[0-9]{8,15}/;
const LONG_DIGIT_RE = /[0-9]{10,}/;
const CONTACT_PHRASE_RE =
  /(whatsapp|telegram|signal app|my number|phone number|call me|text me|email me|dm me)/i;

export function containsContactInfo(body: string): boolean {
  const normalized = body.toLowerCase();
  return (
    EMAIL_RE.test(normalized) ||
    OBFUSCATED_EMAIL_RE.test(normalized) ||
    US_PHONE_RE.test(normalized) ||
    INTL_PHONE_RE.test(normalized) ||
    LONG_DIGIT_RE.test(normalized) ||
    CONTACT_PHRASE_RE.test(normalized)
  );
}

export function assertNoContactInfo(body: string): void {
  if (containsContactInfo(body)) {
    throw new Error(CONTACT_SAFETY_MESSAGE);
  }
}
