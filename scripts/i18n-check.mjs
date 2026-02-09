import fs from 'node:fs';
import path from 'node:path';

const RU_FILE = path.join(process.cwd(), 'src', 'messages', 'ru.json');
const EN_FILE = path.join(process.cwd(), 'src', 'messages', 'en.json');
const SRC_DIR = path.join(process.cwd(), 'src');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function leafPaths(value, prefix = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  const out = [];
  for (const [key, child] of Object.entries(value)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    out.push(...leafPaths(child, nextPrefix));
  }
  return out;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(fullPath));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

function printList(title, items, max = 50) {
  if (!items.length) return;
  console.error(`\n${title} (${items.length}):`);
  for (const item of items.slice(0, max)) console.error(`- ${item}`);
  if (items.length > max) console.error(`... and ${items.length - max} more`);
}

function main() {
  const ru = readJson(RU_FILE);
  const en = readJson(EN_FILE);

  const ruLeaf = new Set(leafPaths(ru));
  const enLeaf = new Set(leafPaths(en));

  const onlyRu = [...ruLeaf].filter((k) => !enLeaf.has(k)).sort();
  const onlyEn = [...enLeaf].filter((k) => !ruLeaf.has(k)).sort();

  if (onlyRu.length || onlyEn.length) {
    console.error('[i18n] Message files are out of sync.');
    printList('Keys only in ru.json', onlyRu);
    printList('Keys only in en.json', onlyEn);
    process.exitCode = 1;
    return;
  }

  const files = walk(SRC_DIR);

  const bindings = [];
  const bindRe =
    /const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const filePath of files) {
    const src = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = bindRe.exec(src))) {
      bindings.push({filePath, varName: match[1], namespace: match[2]});
    }
  }

  const used = new Set();
  for (const {filePath, varName, namespace} of bindings) {
    const src = fs.readFileSync(filePath, 'utf8');
    const callRe = new RegExp(
      `\\b${escapeRegExp(varName)}\\(\\s*(['"])([^'"]+)\\1`,
      'g'
    );

    let match;
    while ((match = callRe.exec(src))) {
      used.add(`${namespace}.${match[2]}`);
    }
  }

  const missing = [...used].filter((key) => !ruLeaf.has(key)).sort();
  if (missing.length) {
    console.error('[i18n] Missing translation keys referenced in code.');
    printList('Missing keys', missing, 100);
    process.exitCode = 1;
    return;
  }

  console.log(`[i18n] OK: ${ruLeaf.size} message keys, ${used.size} keys referenced in code`);
}

main();

