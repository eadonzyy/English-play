import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsDir = path.join(root, 'assets/js');

function walk(dir, list = []) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, list);
    else if (full.endsWith('.js')) list.push(full);
  }
  return list;
}

const files = walk(jsDir);
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error(`Syntax check failed: ${path.relative(root, file)}`);
  }
}

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const imports = [...src.matchAll(/from ['"](\.\.?\/[^'"]+)['"]/g)].map(m => m[1]);
  for (const rel of imports) {
    const resolved = path.resolve(path.dirname(file), rel);
    if (!fs.existsSync(resolved)) throw new Error(`Missing import ${rel} in ${path.relative(root, file)}`);
  }
}

const { SEED } = await import(pathToFileURL(path.join(jsDir, 'data/seed.js')));
if (SEED.version !== 2) throw new Error('Expected seed version 2.');
if (SEED.radicals.length < 4) throw new Error('Expected at least 4 radicals.');
if (SEED.characters.filter(c => c.radicalId === 'wood').length < 8) throw new Error('Expected wood radical characters.');
for (const required of ['competitions', 'readingPassages', 'writingPrompts', 'subscriptions', 'schools', 'integrations', 'partnerMaterials']) {
  if (!Array.isArray(SEED[required])) throw new Error(`Expected ${required} array in seed.`);
}

const { Pronunciation } = await import(pathToFileURL(path.join(jsDir, 'utils/pronunciation.js')));
if (!Pronunciation.getZhuyin('木')) throw new Error('Zhuyin lookup failed.');

const { AITutor } = await import(pathToFileURL(path.join(jsDir, 'utils/ai.js')));
const sentence = AITutor.generateSentence(SEED.characters[0], '小明');
if (!sentence.includes('木')) throw new Error('AI sentence generation failed.');
const writing = AITutor.scoreWriting('學校旁邊有一棵大樹。', '請用「樹」寫一句話。');
if (writing.score <= 0 || !Array.isArray(writing.advice)) throw new Error('Writing score failed.');

const { Worksheet } = await import(pathToFileURL(path.join(jsDir, 'utils/worksheet.js')));
const html = Worksheet.html({ title: '測試練習紙', radical: SEED.radicals[0], characters: SEED.characters.filter(c => c.radicalId === 'wood') });
if (!html.includes('測試練習紙') || !html.includes('列印 / 另存 PDF')) throw new Error('Worksheet generator failed.');

const appSrc = fs.readFileSync(path.join(jsDir, 'app.js'), 'utf8');
for (const route of ['student-trace', 'teacher-worksheets', 'teacher-parent-reports', 'teacher-ocr', 'admin-schools', 'admin-subscriptions', 'admin-integrations', 'parent-dashboard']) {
  if (!appSrc.includes(route)) throw new Error(`Route missing: ${route}`);
}

console.log(`Static smoke test passed: ${files.length} JS files checked, seed v${SEED.version} verified.`);
