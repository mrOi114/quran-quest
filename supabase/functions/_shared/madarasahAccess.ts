export const MADARASAH_ROOM_SLUG = 'madarasah_1';
export const MADARASAH_ROOM_NAME = 'Madarasah 1';

/**
 * SHA-256 of the Madarasah 1 access code.
 * The raw code is not stored in client code or database fields.
 */
export const MADARASAH_ACCESS_CODE_SHA256 =
  '53fd8e7a39afcd3dd71535d68c131269c92fd692a5225307f381c269af348c17';

export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function madarasahAccessGranted(code: string): Promise<boolean> {
  const digest = await sha256Hex(code.trim());
  const expected = MADARASAH_ACCESS_CODE_SHA256;
  if (digest.length !== expected.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < digest.length; i += 1) {
    diff |= digest.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
