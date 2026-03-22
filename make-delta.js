// make-delta.js — gera ZIP delta com arquivos alterados desde o commit anterior
// Uso: node make-delta.js <versao>
// Saida: delta-v{versao}.zip

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const VERSION = process.argv[2];
if (!VERSION) { console.error('[ERRO] Versao nao informada. Uso: node make-delta.js 1.0.1'); process.exit(1); }

const OUT = `delta-v${VERSION}.zip`;

// Pega arquivos alterados/adicionados desde o commit anterior
let changed = [];
try {
  const out = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
  changed = out.split('\n').map(f => f.trim()).filter(f => f.length > 0);
} catch(e) {
  // Primeiro commit — pega tudo
  try {
    const out = execSync('git ls-files', { encoding: 'utf8' });
    changed = out.split('\n').map(f => f.trim()).filter(f => f.length > 0);
  } catch(e2) {}
}

// Filtra só arquivos que existem (ignora deletados)
const files = changed.filter(f => fs.existsSync(f));

// Sempre inclui version.json, changelog.json e removed.json no delta
for (const always of ['version.json', 'changelog.json', 'removed.json']) {
  if (fs.existsSync(always) && !files.includes(always)) files.push(always);
}

if (files.length === 0) {
  console.log('[AVISO] Nenhum arquivo alterado para incluir no delta.');
  process.exit(0);
}

console.log(`  Arquivos no delta (${files.length}):`);
files.forEach(f => console.log(`    + ${f}`));

// Gera ZIP manualmente (sem dependencias externas)
function writeZip(entries, outPath) {
  const parts   = [];
  const central = [];
  let   offset  = 0;

  for (const { name, data } of entries) {
    const nameBuf    = Buffer.from(name, 'utf8');
    const compressed = zlib.deflateRawSync(data, { level: 9 });

    // CRC-32
    let crc = 0xFFFFFFFF;
    for (const byte of data) {
      crc ^= byte;
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
    crc = (crc ^ 0xFFFFFFFF) >>> 0;

    // Local file header
    const lh = Buffer.alloc(30 + nameBuf.length);
    lh.writeUInt32LE(0x04034b50, 0);  // signature
    lh.writeUInt16LE(20, 4);          // version needed
    lh.writeUInt16LE(0, 6);           // flags
    lh.writeUInt16LE(8, 8);           // compression: deflate
    lh.writeUInt16LE(0, 10);          // mod time
    lh.writeUInt16LE(0, 12);          // mod date
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(compressed.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    nameBuf.copy(lh, 30);

    parts.push(lh, compressed);

    // Central directory entry
    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);  // signature
    cd.writeUInt16LE(20, 4);          // version made by
    cd.writeUInt16LE(20, 6);          // version needed
    cd.writeUInt16LE(0, 8);           // flags
    cd.writeUInt16LE(8, 10);          // compression
    cd.writeUInt16LE(0, 12);          // mod time
    cd.writeUInt16LE(0, 14);          // mod date
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(compressed.length, 20);
    cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);          // extra length
    cd.writeUInt16LE(0, 32);          // comment length
    cd.writeUInt16LE(0, 34);          // disk start
    cd.writeUInt16LE(0, 36);          // internal attr
    cd.writeUInt32LE(0, 38);          // external attr
    cd.writeUInt32LE(offset, 42);     // local header offset
    nameBuf.copy(cd, 46);

    central.push(cd);
    offset += lh.length + compressed.length;
  }

  const cdBuf   = Buffer.concat(central);
  const eocd    = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  fs.writeFileSync(outPath, Buffer.concat([...parts, cdBuf, eocd]));
}

// Monta entries
const entries = files.map(f => ({
  name: f.replace(/\\/g, '/'),
  data: fs.readFileSync(f)
}));

writeZip(entries, OUT);
console.log(`  Delta gerado: ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);
