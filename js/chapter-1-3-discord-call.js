// ===== CAPÍTULO 1.3 - CALL DO DISCORD =====
// Sistema de chamada com avatares SVG em estilo Discord

const discordCall = (() => {
  const CHARS = {
    seven: {
      name: 'Seven',
      color: '#5865F2',
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="gs" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#1a1838"/><stop offset="100%" stop-color="#0d0d20"/></radialGradient></defs>
      <circle cx="50" cy="50" r="50" fill="url(#gs)"/>
      <ellipse cx="50" cy="32" rx="26" ry="24" fill="#2a1f50"/>
      <path d="M24 32 Q22 10 36 12 Q42 22 44 30" fill="#3a2a60"/>
      <path d="M76 32 Q78 10 64 12 Q58 22 56 30" fill="#3a2a60"/>
      <ellipse cx="50" cy="52" rx="19" ry="21" fill="#f0c8a8"/>
      <rect x="28" y="46" width="17" height="12" rx="4" fill="none" stroke="#5865F2" stroke-width="2"/>
      <rect x="55" y="46" width="17" height="12" rx="4" fill="none" stroke="#5865F2" stroke-width="2"/>
      <line x1="45" y1="52" x2="55" y2="52" stroke="#5865F2" stroke-width="2"/>
      <ellipse cx="36" cy="52" rx="4" ry="4" fill="#3040b0"/>
      <ellipse cx="63" cy="52" rx="4" ry="4" fill="#3040b0"/>
      <circle cx="37" cy="51" r="1.5" fill="#fff"/>
      <circle cx="64" cy="51" r="1.5" fill="#fff"/>
      <path d="M42 64 Q50 70 58 64" stroke="#b07060" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="90" rx="26" ry="16" fill="#5865F2"/></svg>`
    },
    pudding: {
      name: 'Pudding',
      color: '#eb459e',
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="gp" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#281228"/><stop offset="100%" stop-color="#160818"/></radialGradient></defs>
      <circle cx="50" cy="50" r="50" fill="url(#gp)"/>
      <ellipse cx="50" cy="28" rx="28" ry="26" fill="#e8c860"/>
      <rect x="20" y="28" width="11" height="38" rx="5" fill="#e8c860"/>
      <rect x="69" y="28" width="11" height="38" rx="5" fill="#e8c860"/>
      <ellipse cx="50" cy="52" rx="18" ry="20" fill="#f8e0d0"/>
      <path d="M37 50 Q41 46 45 50" stroke="#1a0a18" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M55 50 Q59 46 63 50" stroke="#1a0a18" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="38" cy="57" rx="5" ry="3" fill="rgba(240,100,140,.35)"/>
      <ellipse cx="62" cy="57" rx="5" ry="3" fill="rgba(240,100,140,.35)"/>
      <path d="M43 64 Q50 68 57 64" stroke="#c08090" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M30 20 Q40 14 50 20 Q40 26 30 20" fill="#eb459e"/>
      <path d="M70 20 Q60 14 50 20 Q60 26 70 20" fill="#eb459e"/>
      <circle cx="50" cy="20" r="4" fill="#b0206a"/>
      <ellipse cx="50" cy="90" rx="26" ry="16" fill="#eb459e"/></svg>`
    },
    abbyl: {
      name: 'Abbyl',
      color: '#f0a050',
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="ga" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#281408"/><stop offset="100%" stop-color="#180a04"/></radialGradient></defs>
      <circle cx="50" cy="50" r="50" fill="url(#ga)"/>
      <polygon points="50,2 57,16 66,6 63,21 74,13 69,27 80,21 71,33" fill="#e07820"/>
      <polygon points="50,2 43,16 34,6 37,21 26,13 31,27 20,21 29,33" fill="#e07820"/>
      <ellipse cx="50" cy="36" rx="25" ry="22" fill="#e07820"/>
      <ellipse cx="50" cy="52" rx="18" ry="21" fill="#f0c090"/>
      <ellipse cx="38" cy="50" rx="5" ry="5" fill="#1a1000"/>
      <ellipse cx="62" cy="50" rx="5" ry="5" fill="#1a1000"/>
      <circle cx="39" cy="49" r="2" fill="#fff"/>
      <circle cx="63" cy="49" r="2" fill="#fff"/>
      <path d="M37 63 Q50 74 63 63" stroke="#7a4020" stroke-width="2" fill="none" stroke-linecap="round"/>
      <line x1="41" y1="64" x2="41" y2="69" stroke="#7a4020" stroke-width="1.5"/>
      <line x1="59" y1="64" x2="59" y2="69" stroke="#7a4020" stroke-width="1.5"/>
      <ellipse cx="50" cy="90" rx="26" ry="16" fill="#f0a050"/></svg>`
    },
    volkenburt: {
      name: 'Volkenburt',
      color: '#57F287',
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="gv" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#08180a"/><stop offset="100%" stop-color="#040e06"/></radialGradient></defs>
      <circle cx="50" cy="50" r="50" fill="url(#gv)"/>
      <rect x="24" y="18" width="52" height="20" rx="6" fill="#344a24"/>
      <ellipse cx="50" cy="28" rx="27" ry="15" fill="#3a5228"/>
      <ellipse cx="50" cy="52" rx="20" ry="22" fill="#c8c0a0"/>
      <path d="M30 44 Q38 40 46 43" stroke="#3a3020" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M54 43 Q62 40 70 44" stroke="#3a3020" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="38" cy="50" rx="5" ry="4" fill="#2a2818"/>
      <ellipse cx="62" cy="50" rx="5" ry="4" fill="#2a2818"/>
      <circle cx="39" cy="49" r="2" fill="#fff"/>
      <circle cx="63" cy="49" r="2" fill="#fff"/>
      <line x1="41" y1="63" x2="59" y2="63" stroke="#8a7850" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="50" cy="90" rx="26" ry="16" fill="#3a5828"/>
      <text x="50" y="94" text-anchor="middle" fill="#2a4818" font-size="14">⚙</text></svg>`
    },
    mysterious: {
      name: '???',
      color: '#8B0000',
      svg: null
    }
  };

  const ABBYL_CALL_SPRITES = Object.freeze({
    seven: 'assets/images/ui/call/seven.gif',
    pudding: 'assets/images/ui/call/aldrich pudding.gif',
    volkenburt: 'assets/images/ui/call/volken.gif'
  });

  function applyAbbylMusumeSprites() {
    if (!window._abbylCheatPersist) return;
    Object.keys(CHARS).forEach((id) => {
      const c = CHARS[id];
      if (!c) return;
      if (ABBYL_CALL_SPRITES[id]) {
        c.img = ABBYL_CALL_SPRITES[id];
      }
    });
  }

  applyAbbylMusumeSprites();

  const rings = {};
  const nametags = {};

  function addAvatar(id, extraBadge = '') {
    if (document.getElementById('av-' + id)) return;
    const c = CHARS[id];
    if (!c) return;

    const card = document.createElement('div');
    card.className = 'avatar-card';
    card.id = 'av-' + id;
    const avatarContent = c.img
      ? `<img src="${c.img}" style="width:100%;height:100%;object-fit:cover;object-position:center 22%;display:block;border-radius:50%;">`
      : (c.svg || '');
    card.innerHTML = `
      <div class="avatar-ring" id="ring-${id}">
        <div class="avatar-inner">${avatarContent}</div>
        ${extraBadge}
      </div>
      <div class="nametag" id="ntag-${id}" style="color:${c.color}">${c.name}</div>`;

    const callArea = document.getElementById('call-area');
    if (callArea) {
      callArea.appendChild(card);
      rings[id] = document.getElementById('ring-' + id);
      nametags[id] = document.getElementById('ntag-' + id);
    }
  }

  function removeAvatar(id) {
    const el = document.getElementById('av-' + id);
    if (!el) return;
    el.style.animation = 'popOut .4s forwards';
    setTimeout(() => {
      el.remove();
      delete rings[id];
      delete nametags[id];
    }, 400);
  }

  function setSpeaking(ids) {
    Object.values(rings).forEach(r => r.classList.remove('speaking'));
    ids.forEach(id => {
      if (rings[id]) rings[id].classList.add('speaking');
    });
  }

  function clearSpeak() {
    Object.values(rings).forEach(r => r.classList.remove('speaking'));
  }

  return {
    CHARS,
    addAvatar,
    removeAvatar,
    setSpeaking,
    clearSpeak,
    rings,
    nametags
  };
})();

// Criar HTML do Discord
function initDiscordUI() {
  const gameScreen = document.getElementById('game-screen');
  if (!gameScreen) return;

  gameScreen.innerHTML = `
    <div id="bg" style="position:fixed;inset:0;background:linear-gradient(135deg,#36393f 0%,#2f3136 100%);z-index:0"></div>
    <div id="discord-ui" style="position:fixed;inset:0;display:flex;flex-direction:column;z-index:1;background:rgba(54,57,63,0.97)">
      <div id="topbar" style="height:44px;background:rgba(30,31,34,.96);border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;padding:0 16px;gap:10px;backdrop-filter:blur(12px);flex-shrink:0">
        <span style="font-size:14px;font-weight:800;color:#dbdee1"># geral</span>
        <div style="margin-left:auto;display:flex;align-items:center;gap:6px;background:rgba(35,165,90,.14);border:1px solid rgba(35,165,90,.3);border-radius:4px;padding:3px 10px;font-size:11px;font-weight:700;color:#23a55a">
          <span style="width:6px;height:6px;background:#23a55a;border-radius:50%;animation:blink 2s infinite"></span>
          Em chamada · <span id="timer">00:00</span>
        </div>
      </div>
      <div id="call-area" style="flex:1;display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap;padding:24px"></div>
      <div id="controls" style="height:60px;background:rgba(22,23,26,.98);border-top:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;gap:10px;flex-shrink:0"></div>
    </div>
    <div id="dialog" style="position:fixed;bottom:0;left:0;right:0;z-index:60;display:flex;justify-content:center;padding:0 20px 20px;transform:translateY(110%);transition:transform .4s cubic-bezier(.34,1.45,.64,1)">
      <div class="dialog-inner" style="width:100%;max-width:780px;background:rgba(20,21,24,.96);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px 20px 14px;backdrop-filter:blur(24px);box-shadow:0 -6px 50px rgba(0,0,0,.5)">
        <div id="d-name" style="font-size:13px;font-weight:900;margin-bottom:6px;letter-spacing:.3px"></div>
        <div id="d-text" style="font-size:15px;font-weight:500;color:#e0e3e7;line-height:1.6;min-height:22px"></div>
        <div style="position:absolute;bottom:14px;right:16px;font-size:10px;color:#80848e;letter-spacing:.5px;animation:hint 1.6s infinite">▼ clique</div>
      </div>
    </div>
    <div id="dark-veil" style="position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity 1.5s;z-index:40"></div>
  `;

  // CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }
    @keyframes hint { 0%,100%{opacity:.3} 50%{opacity:.9} }
    @keyframes popIn { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
    @keyframes popOut { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(.5)} }
    
    .avatar-card {
      display:flex;flex-direction:column;align-items:center;gap:10px;
      animation:popIn .4s cubic-bezier(.34,1.56,.64,1) forwards;
    }
    
    .avatar-ring {
      width:114px;height:114px;border-radius:50%;
      border:3px solid rgba(255,255,255,.1);padding:3px;
      transition:border-color .25s,box-shadow .25s;position:relative;
    }
    
    .avatar-ring.speaking {
      border-color:#23a55a;
      box-shadow:0 0 0 3px rgba(35,165,90,.22),0 0 24px rgba(35,165,90,.15);
    }
    
    .avatar-inner {
      width:100%;height:100%;border-radius:50%;overflow:hidden
    }
    
    .nametag {
      font-size:12px;font-weight:800;letter-spacing:.3px;
      background:rgba(0,0,0,.55);padding:3px 10px;border-radius:4px;
      backdrop-filter:blur(6px);transition:all .3s;text-align:center;
      max-width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
  `;
  document.head.appendChild(style);
}

// Timer
let secs = 0;
function startTimer() {
  if (window.timerInterval) clearInterval(window.timerInterval);
  secs = 0;
  window.timerInterval = setInterval(() => {
    secs++;
    const timerEl = document.getElementById('timer');
    if (timerEl) {
      timerEl.textContent = String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');
    }
  }, 1000);
}

// Export
window.discordCall = discordCall;
window.initDiscordUI = initDiscordUI;
window.startTimer = startTimer;
