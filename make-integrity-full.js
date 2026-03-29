// make-integrity-full.js — gera integrity-full.json com SHA256 de TODOS os arquivos,
// incluindo assets (imagens, áudio, vídeo, fontes).
// Uso: node make-integrity-full.js
// Deve ser rodado antes de fazer o commit/push pro GitHub.

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

// Pastas a NUNCA incluir
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'backup', 'dlc']);

// Arquivos a NUNCA incluir
const IGNORE_FILES = new Set([
  'make-delta.js', 'make-checkpoint.js', 'detect-removed.js',
  'update-changelog.js', 'get-release-url.js', 'make-integrity.js',
  'make-integrity-full.js', 'r2-upload.js', 'build.bat', 'secrets.json',
  'integrity.json', 'integrity-full.json',
  '_tmp.json', 'package.json', 'package-lock.json',
  'test-chapter-1-3.html',
  'changelog.json', 'version.json',
  'MAPA_MENTAL.md', 'nulnpm',
]);

// Extensões a NUNCA incluir no manifesto completo
const IGNORE_EXTS = new Set(['.bat', '.md', '.log', '.bak', '.tmp']);

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
      if (IGNORE_EXTS.has(ext)) continue;
      results.push({ fullPath, relPath });
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

const outPath = 'integrity-full.json';
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');
const sizeMb = (fs.statSync(outPath).size / 1048576).toFixed(2);
console.log(`\n  integrity-full.json gerado com ${files.length} arquivo(s). (${sizeMb} MB)`);
