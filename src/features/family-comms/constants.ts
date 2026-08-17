export const FAMILY_MESSAGE_MAX_LENGTH = 2000;

export const FAMILY_CHAT_TEMPLATES = {
  encouragement: [
    { label: 'MashaAllah', body: 'MashaAllah, keep going! Allah is with you.' },
    { label: 'Proud of you', body: 'I am proud of your Qur’an practice today.' },
    { label: 'Keep going', body: 'A little every day. You can do this, inshaAllah.' },
  ],
  dua: [
    { label: 'Ease', body: 'May Allah make the Qur’an easy for you and bless your memorization.' },
    { label: 'Barakah', body: 'Allahumma barik — may Allah put barakah in your learning.' },
    { label: 'Steadfast', body: 'May Allah keep you consistent and sincere in your Hifz.' },
  ],
  practice_update: [
    { label: 'Practiced today', body: 'I practiced my Qur’an lesson today, alhamdulillah.' },
    { label: 'Revision done', body: 'I finished my revision for today.' },
    { label: 'Need dua', body: 'I am working on a hard ayah. Please make dua for me.' },
  ],
} as const;

export const FAMILY_CALL_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
];

export const FAMILY_CALL_RING_TIMEOUT_MS = 45_000;
