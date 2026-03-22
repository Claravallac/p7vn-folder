// get-release-url.js — le _tmp_assets.json e imprime a URL do primeiro asset
try {
  const data = require('fs').readFileSync('_tmp_assets.json', 'utf8');
  const assets = JSON.parse(data).assets;
  console.log(assets && assets[0] ? assets[0].url : '');
} catch(e) {
  console.log('');
}
