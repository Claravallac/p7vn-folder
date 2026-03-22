const { execSync } = require('child_process');
const fs = require('fs');

let removed = [];
try {
  const output = execSync('git diff --name-only --diff-filter=D HEAD', { encoding: 'utf8' });
  removed = output.split('\n').map(f => f.trim()).filter(f => f.length > 0);
} catch(e) {
  // Sem commits ainda ou sem mudancas — ok
}

fs.writeFileSync('removed.json', JSON.stringify(removed, null, 2), 'utf8');

if (removed.length > 0) {
  console.log('  Arquivos removidos: ' + removed.length);
  removed.forEach(f => console.log('    - ' + f));
} else {
  console.log('  Nenhum arquivo removido.');
}
