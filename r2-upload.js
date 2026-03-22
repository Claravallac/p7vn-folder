// r2-upload.js — delta upload com detecção por hash
// Só sobe os arquivos que mudaram desde o último build

const crypto = require('crypto');
const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const zlib   = require('zlib');

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY;
const SECRET_KEY = process.env.R2_SECRET_KEY;
const BUCKET     = process.env.R2_BUCKET;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;
const VERSION    = process.env.VERSION;
const NOTES      = process.env.NOTES;
const DIST_DIR   = process.env.DIST_DIR || 'dist';

const HOST         = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const MANIFEST_URL = `${PUBLIC_URL}/manifest.json`;

// ── AWS4 signing ──────────────────────────────────────────────────────────────
function sha256hex(data) { return crypto.createHash('sha256').update(data).digest('hex'); }
function hmac(key, data) { return crypto.createHmac('sha256', key).update(data).digest(); }
function hmachex(key, data) { return crypto.createHmac('sha256', key).update(data).digest('hex'); }
function signingKey(ds) { return hmac(hmac(hmac(hmac(`AWS4${SECRET_KEY}`, ds), 'auto'), 's3'), 'aws4_request'); }

function putObject(key, body, contentType) {
  return new Promise((resolve, reject) => {
    const now       = new Date();
    const amzDate   = now.toISOString().replace(/[-:.]/g,'').slice(0,15) + 'Z';
    const dateStamp = amzDate.slice(0, 8);
    const bodyHash  = sha256hex(body);
    const httpPath  = `/${BUCKET}/${key}`;
    const canonH    = `content-type:${contentType}\nhost:${HOST}\nx-amz-content-sha256:${bodyHash}\nx-amz-date:${amzDate}\n`;
    const signedH   = 'content-type;host;x-amz-content-sha256;x-amz-date';
    const cr        = ['PUT', httpPath, '', canonH, signedH, bodyHash].join('\n');
    const scope     = `${dateStamp}/auto/s3/aws4_request`;
    const sts       = ['AWS4-HMAC-SHA256', amzDate, scope, sha256hex(cr)].join('\n');
    const sig       = hmachex(signingKey(dateStamp), sts);
    const auth      = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${scope}, SignedHeaders=${signedH}, Signature=${sig}`;

    const req = https.request({
      hostname: HOST, path: httpPath, method: 'PUT',
      headers: { 'content-type': contentType, 'content-length': body.length, 'host': HOST, 'x-amz-content-sha256': bodyHash, 'x-amz-date': amzDate, 'authorization': auth }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { if (res.statusCode >= 200 && res.statusCode < 300) resolve(); else reject(new Error(`HTTP ${res.statusCode}: ${data}`)); });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function fetchManifest() {
  return new Promise(resolve => {
    https.get(MANIFEST_URL, { headers: { 'User-Agent': 'HimariGames-Builder' } }, res => {
      if (res.statusCode !== 200) { res.resume(); return resolve({}); }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({}); } });
    }).on('error', () => resolve({}));
  });
}

// ── Coleta arquivos ───────────────────────────────────────────────────────────
const GAME_EXTS = new Set([
  '.js', '.css', '.html', '.json',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
  '.mp3', '.ogg', '.wav', '.flac', '.m4a',
  '.ttf', '.otf', '.woff', '.woff2',
]);
const EXCLUDE = new Set(['node_modules', 'dist', '.git']);

function collectFiles(dir, base) {
  const result = [];
  for (const entry of fs.readdirSync(dir)) {
    if (EXCLUDE.has(entry)) continue;
    const full = path.join(dir, entry);
    const rel  = path.join(base, entry).replace(/\\/g, '/');
    try {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) result.push(...collectFiles(full, rel));
      else if (GAME_EXTS.has(path.extname(entry).toLowerCase())) result.push({ name: rel, full });
    } catch(e) {}
  }
  return result;
}

// ── Constrói ZIP ─────────────────────────────────────────────────────────────
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) { crc ^= b; for (let j=0; j<8; j++) crc = (crc>>>1)^(crc&1?0xEDB88320:0); }
  return (crc^0xFFFFFFFF)>>>0;
}

function buildZip(files) {
  const now     = new Date();
  const dosDate = ((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
  const dosTime = (now.getHours()<<11)|(now.getMinutes()<<5)|Math.floor(now.getSeconds()/2);
  const locals  = [], cds = [];
  let offset    = 0;

  for (const { name, data } of files) {
    const compressed = zlib.deflateRawSync(data, { level: 6 });
    const nameBuf    = Buffer.from(name, 'utf8');
    const crc        = crc32(data);

    const lfh = Buffer.alloc(30 + nameBuf.length);
    lfh.writeUInt32LE(0x04034b50,0); lfh.writeUInt16LE(20,4); lfh.writeUInt16LE(0,6); lfh.writeUInt16LE(8,8);
    lfh.writeUInt16LE(dosTime,10); lfh.writeUInt16LE(dosDate,12); lfh.writeUInt32LE(crc,14);
    lfh.writeUInt32LE(compressed.length,18); lfh.writeUInt32LE(data.length,22);
    lfh.writeUInt16LE(nameBuf.length,26); lfh.writeUInt16LE(0,28); nameBuf.copy(lfh,30);

    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50,0); cd.writeUInt16LE(20,4); cd.writeUInt16LE(20,6);
    cd.writeUInt16LE(0,8); cd.writeUInt16LE(8,10); cd.writeUInt16LE(dosTime,12);
    cd.writeUInt16LE(dosDate,14); cd.writeUInt32LE(crc,16); cd.writeUInt32LE(compressed.length,20);
    cd.writeUInt32LE(data.length,24); cd.writeUInt16LE(nameBuf.length,28);
    cd.writeUInt16LE(0,30); cd.writeUInt16LE(0,32); cd.writeUInt16LE(0,34);
    cd.writeUInt16LE(0,36); cd.writeUInt32LE(0,38); cd.writeUInt32LE(offset,42);
    nameBuf.copy(cd,46);

    locals.push(Buffer.concat([lfh, compressed]));
    cds.push(cd);
    offset += lfh.length + compressed.length;
  }

  const cdBuf = Buffer.concat(cds);
  const eocd  = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50,0); eocd.writeUInt16LE(0,4); eocd.writeUInt16LE(0,6);
  eocd.writeUInt16LE(files.length,8); eocd.writeUInt16LE(files.length,10);
  eocd.writeUInt32LE(cdBuf.length,12); eocd.writeUInt32LE(offset,16); eocd.writeUInt16LE(0,20);
  return Buffer.concat([...locals, cdBuf, eocd]);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  // Encontra resources/app no dist
  let appDir = null;
  for (const entry of fs.readdirSync(DIST_DIR)) {
    const candidate = path.join(DIST_DIR, entry, 'resources', 'app');
    if (fs.existsSync(candidate)) { appDir = candidate; break; }
  }
  if (!appDir) {
    const fallback = path.join(DIST_DIR, 'win-unpacked', 'resources', 'app');
    if (fs.existsSync(fallback)) appDir = fallback;
  }
  if (!appDir) throw new Error('Pasta resources/app não encontrada. Certifique-se que asar=false no package.json.');

  console.log(`  App dir: ${appDir}`);

  console.log('  Baixando manifest anterior do R2...');
  const oldManifest = await fetchManifest();
  const oldHashes   = oldManifest.files || {};
  const isFirst     = Object.keys(oldHashes).length === 0;

  if (isFirst) console.log('  Primeiro build — todos os arquivos serao incluidos.');
  else console.log(`  Manifest anterior: ${Object.keys(oldHashes).length} arquivos.`);

  const allFiles  = collectFiles(appDir, '');
  const newHashes = {};
  const changed   = [];

  for (const f of allFiles) {
    const data = fs.readFileSync(f.full);
    const hash = sha256hex(data);
    newHashes[f.name] = hash;
    if (oldHashes[f.name] !== hash) changed.push({ name: f.name, data });
  }

  if (changed.length === 0) {
    console.log('  Nenhum arquivo mudou! Apenas atualizando version.json...');
  } else {
    console.log(`  Arquivos mudados: ${changed.length} de ${allFiles.length}`);
    changed.forEach(f => console.log(`    ~ ${f.name}`));
  }

  const zipKey = `releases/delta-${VERSION}.zip`;
  const pubUrl = `${PUBLIC_URL}/${zipKey}`;

  if (changed.length > 0) {
    const zipBuf = buildZip(changed);
    console.log(`  ZIP: ${(zipBuf.length/1024).toFixed(1)} KB`);
    await putObject(zipKey, zipBuf, 'application/zip');
    console.log('  ZIP enviado!');
  }

  const newManifest = { version: VERSION, files: newHashes };
  await putObject('manifest.json', Buffer.from(JSON.stringify(newManifest, null, 2)), 'application/json');
  console.log('  Manifest atualizado!');

  const versionJson = JSON.stringify({ version: VERSION, url: pubUrl, notes: NOTES }, null, 2);
  fs.writeFileSync('version.json', versionJson, 'utf8');
  await putObject('version.json', Buffer.from(versionJson), 'application/json');
  console.log('  version.json enviado!');
  console.log(`  URL: ${pubUrl}`);
}

run().catch(e => { console.error('[ERRO] ' + e.message); process.exit(1); });
