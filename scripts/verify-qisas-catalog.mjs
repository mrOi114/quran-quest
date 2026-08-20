/**
 * Qisas catalog checks: 25 prophet stories, EN+SO, quizzes, empty audio slots.
 * Run: npm run verify:qisas
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'src/features/qisas/content');
const FACTORY_PATH = join(CONTENT_DIR, 'storyFactory.ts');
const INDEX_PATH = join(CONTENT_DIR, 'index.ts');

const EXPECTED_STORY_COUNT = 25;
const EXPECTED_KEYS = [
  'adam',
  'idris',
  'nuh',
  'hud',
  'salih',
  'ibrahim',
  'lut',
  'ismail',
  'ishaq',
  'yaqub',
  'yusuf',
  'shuayb',
  'ayyub',
  'dhul-kifl',
  'musa',
  'harun',
  'dawud',
  'sulayman',
  'ilyas',
  'al-yasa',
  'yunus',
  'zakariyya',
  'yahya',
  'isa',
  'muhammad',
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path) {
  return readFileSync(path, 'utf8');
}

const factory = read(FACTORY_PATH);
assert(
  factory.includes("permissionStatus: 'PERMISSION_REQUIRED'"),
  'storyFactory must keep audio PERMISSION_REQUIRED',
);
assert(!/audioUrl:\s*'https?:\/\//.test(factory), 'storyFactory must not hard-code audio URLs');

const indexSource = read(INDEX_PATH);
for (const moduleName of [
  'EGYPT_PATIENCE_STORIES',
  'MUSA_DAWUD_STORIES',
  'LATER_PROPHET_STORIES',
  'MUHAMMAD_STORY',
]) {
  assert(indexSource.includes(moduleName), `content/index.ts must register ${moduleName}`);
}

const contentFiles = readdirSync(CONTENT_DIR)
  .filter((name) => name.endsWith('.ts'))
  .filter((name) => !['index.ts', 'narrators.ts', 'storyFactory.ts'].includes(name));

const allContent = contentFiles.map((name) => read(join(CONTENT_DIR, name))).join('\n\n');

assert(
  !/audioUrl:\s*'https?:\/\//.test(allContent),
  'Qisas stories must not import licensed audio URLs',
);

const storyIds = [...allContent.matchAll(/id: 'qisas-story-(\d{3})'/g)].map((match) => match[1]);
assert(
  storyIds.length === EXPECTED_STORY_COUNT,
  `Expected ${EXPECTED_STORY_COUNT} story ids, got ${storyIds.length}: ${storyIds.join(', ')}`,
);
assert(new Set(storyIds).size === EXPECTED_STORY_COUNT, 'Story ids must be unique');
for (let i = 1; i <= EXPECTED_STORY_COUNT; i += 1) {
  const id = String(i).padStart(3, '0');
  assert(storyIds.includes(id), `Missing qisas-story-${id}`);
}

const prophetKeys = [...allContent.matchAll(/prophetKey: '([^']+)'/g)].map((match) => match[1]);
assert(
  JSON.stringify([...prophetKeys].sort()) === JSON.stringify([...EXPECTED_KEYS].sort()),
  `Prophet keys mismatch.\nExpected: ${EXPECTED_KEYS.join(', ')}\nGot: ${prophetKeys.join(', ')}`,
);

const storyBlocks = allContent.split(/export const \w+_STORY/).slice(1);
assert(
  storyBlocks.length === EXPECTED_STORY_COUNT,
  `Expected ${EXPECTED_STORY_COUNT} exported stories, got ${storyBlocks.length}`,
);

for (const [index, block] of storyBlocks.entries()) {
  const idMatch = block.match(/id: '(qisas-story-\d{3})'/);
  const storyId = idMatch?.[1] ?? `block-${index + 1}`;
  const learnCount = (block.match(/id: '[^']+-learn-\d+'/g) ?? []).length;
  const gameIdCount = (block.match(/id: '[^']+-game-[^']+'/g) ?? []).length;
  const rememberCount = (block.match(/rememberProphetQuestion\(/g) ?? []).length;
  const gameCount = gameIdCount + rememberCount;
  assert(learnCount === 5, `${storyId} must have 5 learn questions, got ${learnCount}`);
  assert(gameCount === 5, `${storyId} must have 5 game questions, got ${gameCount}`);

  const chapters = [...block.matchAll(/body:\s*\{\s*en:\s*'((?:\\'|[^'])*)',\s*so:\s*'((?:\\'|[^'])*)'/g)];
  const titlePairs = [...block.matchAll(/title:\s*\{\s*en:\s*'((?:\\'|[^'])*)',\s*so:\s*'((?:\\'|[^'])*)'/g)];
  assert(chapters.length >= 3, `${storyId} must have at least 3 chapter bodies with EN+SO`);
  assert(titlePairs.length >= 1, `${storyId} must have EN+SO titles`);
}

console.log(
  `Qisas catalog OK: ${EXPECTED_STORY_COUNT} stories, 5 learn + 5 game each, audio PERMISSION_REQUIRED.`,
);
