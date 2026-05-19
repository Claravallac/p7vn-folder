const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
let failed = false;

function toPosix(value) {
  return value.replace(/\\/g, '/');
}

function existsRelative(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function report(kind, message) {
  const prefix = kind === 'error' ? '[ERRO]' : '[OK]';
  console.log(`${prefix} ${message}`);
  if (kind === 'error') failed = true;
}

function readText(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function localUrlToPath(url) {
  if (/^(https?:)?\/\//i.test(url)) return null;
  if (/^(data|mailto):/i.test(url)) return null;
  return decodeURIComponent(url.split('#')[0].split('?')[0]).replace(/^\.\//, '');
}

function checkIndexReferences() {
  const html = readText('index.html');
  const refs = [];
  const scriptRe = /<script\s+[^>]*src=["']([^"']+)["']/gi;
  const linkRe = /<link\s+[^>]*href=["']([^"']+)["']/gi;

  for (const match of html.matchAll(scriptRe)) refs.push({ type: 'script', url: match[1] });
  for (const match of html.matchAll(linkRe)) refs.push({ type: 'link', url: match[1] });

  const missing = refs
    .map(ref => ({ ...ref, relPath: localUrlToPath(ref.url) }))
    .filter(ref => ref.relPath && !existsRelative(ref.relPath));

  if (missing.length === 0) {
    report('ok', 'Referencias locais do index.html existem.');
    return;
  }

  for (const ref of missing) {
    report('error', `${ref.type} ausente em index.html: ${ref.url}`);
  }
}

function checkPackageFiles() {
  const pkg = JSON.parse(readText('package.json'));
  if (pkg.main && !existsRelative(pkg.main)) {
    report('error', `Entrada principal nao encontrada: ${pkg.main}`);
  } else if (pkg.main) {
    report('ok', `Entrada principal encontrada: ${pkg.main}`);
  }

  const files = pkg.build && Array.isArray(pkg.build.files) ? pkg.build.files : [];
  for (const entry of files) {
    if (!entry || entry.startsWith('!')) continue;
    const normalized = toPosix(entry);
    if (normalized.endsWith('/**/*')) {
      const dir = normalized.slice(0, -5);
      if (!existsRelative(dir)) report('error', `Pasta do build nao encontrada: ${entry}`);
      continue;
    }
    if (normalized.includes('*')) continue;
    if (!existsRelative(normalized)) report('error', `Arquivo do build nao encontrado: ${entry}`);
  }
}

function checkJson(relPath) {
  try {
    JSON.parse(readText(relPath));
    report('ok', `${relPath} e JSON valido.`);
  } catch (error) {
    report('error', `${relPath} tem JSON invalido: ${error.message}`);
  }
}

checkIndexReferences();
checkPackageFiles();
for (const file of ['package.json', 'version.json', 'changelog.json', 'integrity.json', 'integrity-full.json']) {
  checkJson(file);
}

if (failed) process.exit(1);
