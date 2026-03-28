// make-integrity.js — gera integrity.json com SHA256 de todos os arquivos de código
// Uso: node make-integrity.js
// Deve ser rodado antes de fazer o commit/push pro GitHub.
//
// O integrity.json gerado é lido pelo updater.js do cliente para verificar
// se cada arquivo local bate com o hash do repo.

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

// Extensões a incluir no manifesto de integridade
const CODE_EXTS = new Set(['.js', '.html', '.css', '.json']);

// Pastas e arquivos a NUNCA incluir no manifesto
const IGNORE_DIRS  = new Set(['node_modules', '.git', 'dist', 'assets', 'backup', 'dlc']);
const IGNORE_FILES = new Set([
  'make-delta.js', 'make-checkpoint.js', 'detect-removed.js',
  'update-changelog.js', 'get-release-url.js', 'make-integrity.js',
  'r2-upload.js', 'build.bat', 'secrets.json',
  'integrity.json',       // não inclui a si mesmo
  '_tmp.json',
  'package.json',
  'package-lock.json',
  'test-chapter-1-3.html',
]);

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function collectFiles(dir, base) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (IGNORE_FILES.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    const relPath  = base ? base + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      results.push(...collectFiles(fullPath, relPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (CODE_EXTS.has(ext)) results.push({ fullPath, relPath });
    }
  }
  return results;
}

const files = collectFiles('.', '');
if (files.length === 0) {
  console.error('[ERRO] Nenhum arquivo encontrado.');
  process.exit(1);
}

const manifest = { files: {} };

for (const { fullPath, relPath } of files) {
  manifest.files[relPath] = sha256File(fullPath);
  console.log('  +', relPath);
}

const outPath = 'integrity.json';
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`\n  integrity.json gerado com ${files.length} arquivo(s).`);
