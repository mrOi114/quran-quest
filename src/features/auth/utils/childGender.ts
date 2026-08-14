/** Map Girl/Boy to avatar_key without a DB gender column. */
export type ChildGender = 'girl' | 'boy';

export function avatarKeyFromGender(gender: ChildGender): string {
  return gender === 'girl' ? 'girl-1' : 'boy-1';
}

export function genderFromAvatarKey(avatarKey: string): ChildGender | null {
  if (avatarKey.startsWith('girl')) {
    return 'girl';
  }
  if (avatarKey.startsWith('boy')) {
    return 'boy';
  }
  return null;
}

export function genderLabel(avatarKey: string): string | null {
  const gender = genderFromAvatarKey(avatarKey);
  if (!gender) {
    return null;
  }
  return gender === 'girl' ? 'Girl' : 'Boy';
}
