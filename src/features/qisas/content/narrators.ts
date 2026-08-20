import type { QisasNarrator } from '../types';

/**
 * Target narrators for Qisas audio. Recordings stay empty until written
 * permission is confirmed. Catalog URLs are references only — not licences.
 */
export const QISAS_NARRATORS: Record<QisasNarrator['id'], QisasNarrator> = {
  'mufti-ismail-menk': {
    id: 'mufti-ismail-menk',
    name: 'Mufti Ismail Menk',
    language: 'en',
    targetSeries: 'Qisas / Stories of the Prophets',
    officialWebsite: 'https://muftimenk.com/',
    contactUrl: 'https://muftimenk.com/contact/',
    catalogUrl: 'https://muslimcentral.com/audio/mufti-menk/',
    permissionStatus: 'PERMISSION_REQUIRED',
    license: 'pending',
    rightsHolderNote:
      'Not confirmed. Use Mufti Menk’s official contact form first. Public lecture hosts are not a sublicense.',
    attribution: 'English Qisas narration — Mufti Ismail Menk',
    audioSourceLabel: 'Official Mufti Menk channels (pending authorised source)',
    offlineCacheAllowed: null,
  },
  'sh-cabdulkadir-sh-maxamed': {
    id: 'sh-cabdulkadir-sh-maxamed',
    name: 'Sh. Cabdulkadir Sh. Maxamed',
    language: 'so',
    targetSeries: 'Qisasul Anbiyaa / Stories of the Prophets',
    officialWebsite: '',
    contactUrl: 'https://www.daarusalaam.com/p/about.html',
    catalogUrl: 'https://www.daarusalaam.com/p/blog-page_6.html',
    permissionStatus: 'PERMISSION_REQUIRED',
    license: 'pending',
    rightsHolderNote:
      'Not confirmed. The spoken series is attributed to Sh. Cabdulkadir Sh. Maxamed. Daarusalaam is a public catalog host (Ibrahim Hashi Ahmed), not a confirmed copyright owner.',
    attribution: 'Somali Qisasul Anbiyaa — Sh. Cabdulkadir Sh. Maxamed',
    audioSourceLabel: 'Daarusalaam catalog reference only (pending authorised source)',
    offlineCacheAllowed: null,
  },
};

export function getNarrator(id: QisasNarrator['id']): QisasNarrator {
  return QISAS_NARRATORS[id];
}
