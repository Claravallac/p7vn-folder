/**
 * discord-presence.js
 * Módulo de Discord Rich Presence para Himari Games - VRChat Story
 * 
 * Como usar: require('./discord-presence') no main.js do Electron
 */

let rpc = null;
let startTimestamp = null;
let updateTimer = null;

// ── Configuração ──────────────────────────────────────────────────────────────
// Substitua pelo Client ID da sua aplicação no Discord Developer Portal
// https://discord.com/developers/applications
const CLIENT_ID = '1482203196880584814';

// Estados possíveis do jogo
const STATES = {
  MENU:      { details: 'No Menu Principal',         state: 'Himari Games',           smallImageKey: 'menu_icon',    smallImageText: 'Menu' },
  PROLOGUE:  { details: 'Lendo o Prólogo',            state: 'A história começa…',     smallImageKey: 'book_icon',    smallImageText: 'Visual Novel' },
  CHAPTER:   { details: null,                         state: null,                     smallImageKey: 'book_icon',    smallImageText: 'Visual Novel' },
  BATTLE:    { details: 'Em batalha!',                state: 'Minigame de combate',    smallImageKey: 'battle_icon',  smallImageText: 'Batalha' },
  MINIGAME:  { details: 'Chamando o Aldrich...',      state: 'Minigame da Ligação',    smallImageKey: 'menu_icon',    smallImageText: 'Minigame' },
  SLOTS:     { details: 'Girando os rolos…',         state: 'Mestre do Giro',         smallImageKey: 'slots_icon',   smallImageText: 'Caça-Níqueis' },
  POKEMON:   { details: 'Batalha Pokémon!',           state: 'Minigame Pokémon',       smallImageKey: 'battle_icon',  smallImageText: 'Batalha Pokémon' },
  STORE:     { details: 'Na Loja da Nero',            state: 'Comprando algo... talvez', smallImageKey: 'menu_icon',  smallImageText: 'Loja da Nero' },
  ENDING:    { details: 'Chegou ao fim…',            state: 'Uma jornada completa',   smallImageKey: 'ending_icon',  smallImageText: 'Fim' },
};

// Imagem grande padrão (faça upload no Discord Developer Portal)
const LARGE_IMAGE_KEY  = 'game_logo';
const LARGE_IMAGE_TEXT = 'Himari Games — VRChat Story';

// ── Inicialização ─────────────────────────────────────────────────────────────
function init() {
  try {
    rpc = require('discord-rpc');
    rpc.register(CLIENT_ID);

    const client = new rpc.Client({ transport: 'ipc' });
    startTimestamp = new Date();

    client.on('ready', () => {
      const appName = client.application?.name ?? 'Himari Games';
      console.log('[Discord RPC] Conectado como', appName);
      setPresence(STATES.MENU);
    });

    client.on('disconnected', () => {
      console.log('[Discord RPC] Desconectado. Tentando reconectar em 15s…');
      clearInterval(updateTimer);
      setTimeout(() => init(), 15_000);
    });

    client.login({ clientId: CLIENT_ID }).catch((err) => {
      console.warn('[Discord RPC] Falha ao conectar, tentando novamente em 10s…');
      setTimeout(() => init(), 10_000);
    });

    // Guarda o client para uso posterior
    global._discordRpcClient = client;

  } catch (err) {
    // discord-rpc não instalado ou Discord fechado — falha silenciosa
    console.warn('[Discord RPC] Módulo não disponível:', err.message);
  }
}

// ── Atualizar presença ────────────────────────────────────────────────────────
function setPresence(preset, overrides = {}) {
  const client = global._discordRpcClient;
  if (!client) return;

  const activity = {
    largeImageKey:  LARGE_IMAGE_KEY,
    largeImageText: LARGE_IMAGE_TEXT,
    startTimestamp,
    ...preset,
    ...overrides,
  };

  client.setActivity(activity).catch(() => {/* silencioso */});
}

// ── API pública (chamada via ipcMain) ─────────────────────────────────────────
function updateFromRenderer(event, payload) {
  if (!payload || typeof payload !== 'object') return;

  const { scene, chapterTitle, chapterNum } = payload;

  switch (scene) {
    case 'menu':
      return setPresence(STATES.MENU);

    case 'prologue':
      return setPresence(STATES.PROLOGUE);

    case 'chapter':
      return setPresence(STATES.CHAPTER, {
        details: chapterTitle ? `📖 ${chapterTitle}` : 'Lendo um capítulo',
        state:   chapterNum !== undefined ? `Capítulo ${chapterNum}` : 'Visual Novel',
      });

    case 'battle':
      return setPresence(STATES.BATTLE);

    case 'minigame':
      return setPresence(STATES.MINIGAME);

    case 'slots':
      return setPresence(STATES.SLOTS);

    case 'pokemon':
      return setPresence(STATES.POKEMON);

    case 'store':
      return setPresence(STATES.STORE);

    case 'ending':
      return setPresence(STATES.ENDING);

    default:
      break;
  }
}

module.exports = { init, setPresence, updateFromRenderer, STATES };