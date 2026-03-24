// make-checkpoint.js
// Gera um ZIP com todos os arquivos de codigo do projeto (JS, HTML, CSS, JSON)
// excluindo assets (audio, video, imagens, fontes) e arquivos internos de build.

const fs       = require('fs');
const path     = require('path');
const { execSync } = require('child_process');

const version  = process.argv[2];
if (!version) { console.error('Uso: node make-checkpoint.js <versao>'); process.exit(1); }

const OUTPUT   = `checkpoint-v${version}.zip`;

// Extensoes de codigo a incluir
const CODE_EXTS = new Set(['.js', '.html', '.css', '.json']);

// Pastas e arquivos a ignorar sempre
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'assets']);
const IGNORE_FILES = new Set([
  'make-delta.js', 'make-checkpoint.js', 'detect-removed.js',
  'update-changelog.js', 'get-release-url.js', 'build.bat',
  OUTPUT
]);

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
if (files.length === 0) { console.error('Nenhum arquivo de codigo encontrado.'); process.exit(1); }

console.log(`  Arquivos encontrados: ${files.length}`);
files.forEach(f => console.log('    +', f.relPath));

// Monta o ZIP usando PowerShell (sem dependencias externas)
const tmpDir = path.join(require('os').tmpdir(), `cp_${Date.now()}`);
fs.mkdirSync(tmpDir, { recursive: true });

for (const { fullPath, relPath } of files) {
  const dest = path.join(tmpDir, relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(fullPath, dest);
}

if (fs.existsSync(OUTPUT)) fs.unlinkSync(OUTPUT);

const absOutput = path.resolve(OUTPUT);
const psCmd = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${tmpDir.replace(/\\/g, '\\\\')}', '${absOutput.replace(/\\/g, '\\\\')}')`;
execSync(`powershell.exe -NoProfile -Command "${psCmd}"`, { stdio: 'pipe' });

fs.rmSync(tmpDir, { recursive: true, force: true });

const sizeMb = (fs.statSync(absOutput).size / 1048576).toFixed(2);
console.log(`  ZIP gerado: ${OUTPUT} (${sizeMb} MB)`);
