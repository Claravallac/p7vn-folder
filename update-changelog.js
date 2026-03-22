// update-changelog.js — adiciona nova entrada ao changelog.json
const fs      = require('fs');
const VERSION = process.env.VERSION;
const NOTES   = process.env.NOTES;

if (!VERSION) { console.error('VERSION nao definida'); process.exit(1); }

const file = 'changelog.json';
let changelog = [];

try {
  if (fs.existsSync(file)) {
    changelog = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
} catch(e) {}

// Evita duplicatas
const exists = changelog.find(e => e.version === VERSION);
if (!exists) {
  const now   = new Date();
  const date  = now.toLocaleDateString('pt-BR');
  changelog.unshift({ version: VERSION, date, notes: NOTES || 'Nova atualização.' });
  fs.writeFileSync(file, JSON.stringify(changelog, null, 2), 'utf8');
  console.log('  Changelog atualizado: v' + VERSION);
} else {
  console.log('  Versao ja existe no changelog.');
}
