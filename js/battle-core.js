// ==================== SISTEMA DE BATALHA CORE ====================
// Constantes
const RB_MAX_HP = 92;
const RB_ARABEL_MAX_HP = 100;
const RB_NERO_MAX_HP = 100;
let RB_ARENA_W = 480;
let RB_ARENA_H = 240;
const RB_HEART_W = 22;
const RB_HEART_H = 22;
const RB_SPEED = 2.8;
const RB_MARGIN = 2;

// Estado da batalha
let rbActive = false;
let rbPhase = 'none'; // 'none', 'player', 'dodge', 'cutscene'
let rbHp = RB_MAX_HP;
let rbArabelHp = RB_ARABEL_MAX_HP;
let rbNeroHp = RB_NERO_MAX_HP;
let rbX = RB_ARENA_W / 2 - RB_HEART_W / 2;
let rbY = RB_ARENA_H / 2 - RB_HEART_H / 2;
let rbKeyState = {};
let rbBullets = [];
let rbMoveLoop = null;
let rbDodgeTimer = null;
let rbInvincible = false;
let rbAttackIndex = 0;
let rbDead = false;
let rbTransitioning = false;
let rbUsedItemThisTurn = false;
let rbFightingNero = false;
let rbNeroPhase2 = false;
let rbMercyUnlocked = false;
let rbMercyCount = 0;

// Callback para eventos de batalha
let rbOnDodgePhaseStart = null;

// Elementos DOM
const realBattleScreen = document.getElementById('real-battle-screen');
const rbArena = document.getElementById('rb-arena');
const rbHeart = document.getElementById('rb-heart');
const rbMessageEl = document.getElementById('rb-message');
const rbMessage = {
    get innerText() { return rbMessageEl.innerText; },
    set innerText(v) { rbMessageEl.innerText = v; }
};
const rbHpFill = document.getElementById('rb-hp-fill');
const rbHpNum = document.getElementById('rb-hp-num');
const rbArabelHpFill = document.getElementById('rb-arabel-hp-fill');
const rbArabelHpNum = document.getElementById('rb-arabel-hp-num');
const rbNeroHud = document.getElementById('rb-nero-hud');
const rbNeroHpFill = document.getElementById('rb-nero-hp-fill');
const rbNeroHpNum = document.getElementById('rb-nero-hp-num');
const rbArabelHud = document.getElementById('rb-arabel-hud');
const rbActionPanel = document.getElementById('rb-action-panel');
const rbTimingWrap = document.getElementById('rb-timing-wrap');
const rbTimingZone = document.getElementById('rb-timing-zone');
const rbTimingCursor = document.getElementById('rb-timing-cursor');
const rbTimingResult = document.getElementById('rb-timing-result');
const rbEnemyImg = document.getElementById('rb-enemy-img');

// ==================== SISTEMA DE ROUNDS ====================
// Alterna entre fase do jogador (escolher ação) e fase de esquiva (desviar de balas)

function rbStartPlayerPhase() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-core.js → rbStartPlayerPhase()');
    if (window.neroStandaloneActive) return;
    if (rbTransitioning) return;
    rbPhase = 'player';
    rbTransitioning = false;
    rbUsedItemThisTurn = false;
    clearInterval(rbMoveLoop);
    clearTimeout(rbDodgeTimer);
    rbClearBullets();

    // Inimigo volta ao estado padrão (ou spareable caso mercy desbloqueado)
    rbSetEnemyState(rbMercyUnlocked ? 'spareable' : 'default');

    // Esconde submenus
    const actSub = document.getElementById('rb-act-submenu');
    const mercySub = document.getElementById('rb-mercy-submenu');
    if (actSub) actSub.style.display = 'none';
    if (mercySub) mercySub.style.display = 'none';

    // Esconde arena (classe CSS cuida de opacity/pointer-events via transition)
    rbArena.classList.remove('rb-arena-active');
    rbArena.style.width  = '480px';
    rbArena.style.height = '0px';
    
    // Mostra painel de ações
    rbTimingWrap.classList.remove('showing');
    setTimeout(() => { rbTimingWrap.style.display = 'none'; }, 300);
    rbActionPanel.style.display = 'flex';
    requestAnimationFrame(() => { rbActionPanel.classList.add('showing'); });
    rbTimingResult.innerText = '';

    rbMessage.innerText = rbFightingNero 
        ? '* Nero: Sua escolha.' 
        : '* Arabel: O que você vai fazer?';
}

function rbStartDodgePhase() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-core.js → rbStartDodgePhase()');
    if (window.neroStandaloneActive) return;
    if (rbTransitioning) return;
    rbPhase = 'dodge';
    rbTransitioning = false;
    
    // Esconde submenus + painel de ações
    const actSub = document.getElementById('rb-act-submenu');
    const mercySub = document.getElementById('rb-mercy-submenu');
    if (actSub) actSub.style.display = 'none';
    if (mercySub) mercySub.style.display = 'none';
    rbActionPanel.classList.remove('showing');
    rbTimingWrap.classList.remove('showing');
    setTimeout(() => {
        rbActionPanel.style.display = 'none';
        rbTimingWrap.style.display = 'none';
    }, 300);

    // Escolhe padrão de ataque (UBE: getRandA())
    const patternKey = RB_PATTERN_KEYS[Math.floor(Math.random() * RB_PATTERN_KEYS.length)];
    const pSize = RB_PATTERN_ARENA[patternKey];

    // Estado do inimigo: atacando (UBE: sprite muda para attackingSprite)
    rbSetEnemyState('attacking');

    // Resize da arena para o padrão escolhido (UBE: battleBox.transitionTo)
    RB_ARENA_W = pSize.w;
    RB_ARENA_H = pSize.h;
    rbArena.style.width  = pSize.w + 'px';
    rbArena.style.height = pSize.h + 'px';

    // Mostra arena via classe CSS (opacity/pointer-events via transition)
    rbArena.classList.add('rb-arena-active');
    rbHeart.style.opacity = '1';

    // Reseta posição do coração no centro da nova arena
    rbX = RB_ARENA_W / 2 - RB_HEART_W / 2;
    rbY = RB_ARENA_H / 2 - RB_HEART_H / 2;
    rbHeart.style.left = rbX + 'px';
    rbHeart.style.top = rbY + 'px';
    rbClearBullets();

    rbMessage.innerText = rbFightingNero ? '* Nero ataca!' : '* Arabel ataca!';

    // Callback para eventos customizados
    if (rbOnDodgePhaseStart) rbOnDodgePhaseStart();

    // Executa o padrão de ataque escolhido (UBE: bulletPattern.generateBullets)
    RB_PATTERNS[patternKey]();

    // Loop de movimento
    clearInterval(rbMoveLoop);
    rbMoveLoop = setInterval(rbMoveTick, 16);

    // Duração varia por padrão (UBE: attack.duration)
    const dur = PATTERN_DURATION[patternKey] || 4000;
    clearTimeout(rbDodgeTimer);
    rbDodgeTimer = setTimeout(() => {
        if (!rbActive || rbPhase !== 'dodge') return;
        rbStartPlayerPhase();
    }, dur);
}

// ==================== SISTEMA DE HP ====================

// Animação de morte clássica do Undertale
// heartEl: elemento DOM do coração (default: rbHeart)
function rbPlayDeathAnimation(callback, heartEl) {
    heartEl = heartEl || rbHeart;
    const heartRect = heartEl.getBoundingClientRect();
    const cx = heartRect.left + heartRect.width / 2;
    const cy = heartRect.top + heartRect.height / 2;
    heartEl.style.opacity = '0';

    // Overlay container
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
    document.body.appendChild(overlay);

    // 1) Flash branco na tela
    const flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;inset:0;background:white;opacity:0.9;transition:opacity 0.18s ease;';
    overlay.appendChild(flash);
    requestAnimationFrame(() => requestAnimationFrame(() => { flash.style.opacity = '0'; }));

    // 2) ube_soul_split.png: frame exato de quando o coração racha (sequência da UBE: clip 10 = soul_split.wav)
    try { const ss = document.getElementById('sfx-soul-split'); if (ss) { ss.currentTime = 0; ss.play().catch(() => {}); } } catch(e) {}
    const bh = document.createElement('div');
    bh.style.cssText = `
        position:fixed;
        left:${cx - 11}px; top:${cy - 11}px;
        width:22px; height:22px;
        background:url('assets/images/ui/ube_soul_split.png') no-repeat center/contain;
        image-rendering:pixelated;
    `;
    overlay.appendChild(bh);
    bh.animate(
        [
            { filter: 'brightness(12) saturate(0)', offset: 0 },
            { filter: 'brightness(12) saturate(0)', offset: 0.35 },
            { filter: 'brightness(1)  saturate(1)', offset: 1 }
        ],
        { duration: 350, easing: 'ease-out', fill: 'forwards' }
    );

    // 3) spr_heartshards_0~3: 4 pedaços reais voando (UBE: clip 12 ~ soul_shatter)
    setTimeout(() => {
        bh.style.display = 'none';
        // soul_shatter.wav quando os pedaços voam
        try { const sh = document.getElementById('sfx-soul-shatter'); if (sh) { sh.currentTime = 0; sh.play().catch(() => {}); } } catch(e) {}

        // Cada shard voa numa direção cardinal/diagonal
        // index do sprite → [dx, dy, rotação final]
        const shardDefs = [
            { spr: 0, dx: -50, dy: -50, rot:  -120 },
            { spr: 1, dx:  50, dy: -50, rot:   120 },
            { spr: 2, dx: -50, dy:  50, rot:   120 },
            { spr: 3, dx:  50, dy:  50, rot:  -120 },
            // repete espelhados para preencher laterais
            { spr: 0, dx:   0, dy: -65, rot:  -180 },
            { spr: 1, dx:   0, dy:  65, rot:   180 },
            { spr: 2, dx: -65, dy:   0, rot:    90 },
            { spr: 3, dx:  65, dy:   0, rot:   -90 },
        ];

        shardDefs.forEach(({ spr, dx, dy, rot }) => {
            const s = document.createElement('div');
            s.style.cssText = `
                position:fixed;
                left:${cx - 8}px;
                top:${cy - 8}px;
                width:16px; height:16px;
                background:url('assets/images/ui/spr_heartshards_${spr}.png') no-repeat center/contain;
                image-rendering:pixelated;
            `;
            overlay.appendChild(s);
            s.animate(
                [
                    { opacity: 1, transform: `translate(0,0) rotate(0deg) scale(1)` },
                    { opacity: 0, transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(0.3)` }
                ],
                { duration: 700, easing: 'ease-out', fill: 'forwards' }
            );
        });

        // 4) Fade para preto e chama callback
        const fadeBlack = document.createElement('div');
        fadeBlack.style.cssText = 'position:absolute;inset:0;background:black;opacity:0;';
        overlay.appendChild(fadeBlack);
        fadeBlack.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 700, delay: 400, easing: 'ease-in', fill: 'forwards' }
        );

        setTimeout(() => {
            overlay.remove();
            callback();
        }, 1200);
    }, 350);
}

function rbTakeDamage(amount) {
    if (rbDead || rbInvincible) return;

    rbHp = Math.max(0, rbHp - amount);
    rbHpFill.style.width = (rbHp / RB_MAX_HP * 100) + '%';
    rbHpNum.innerText = rbHp;

    sfxFail.currentTime = 0; 
    sfxFail.play().catch(() => {});

    rbInvincible = true;
    rbHeart.style.opacity = '0.25';
    setTimeout(() => {
        if (!rbDead) { 
            rbHeart.style.opacity = '1'; 
            rbInvincible = false; 
        }
    }, 700);

    if (rbHp <= 0) {
        rbDead = true;
        rbMessage.innerText = '* Fim de linha.';
        // UT: heartsplosion ao morrer
        try { const hx = document.getElementById('sfx-ut-heartsplosion'); if (hx) { hx.currentTime = 0; hx.play().catch(() => {}); } } catch(e) {}
        rbStopAll();
        rbPlayDeathAnimation(() => {
            realBattleScreen.style.display = 'none';
            triggerGameOver();
        });
    }
}

function rbDamageEnemy(amount) {
    if (rbFightingNero) {
        rbNeroHp = Math.max(0, rbNeroHp - amount);
        rbNeroHpFill.style.width = (rbNeroHp / RB_NERO_MAX_HP * 100) + '%';
        rbNeroHpNum.innerText = rbNeroHp;
    } else {
        rbArabelHp = Math.max(0, rbArabelHp - amount);
        rbArabelHpFill.style.width = (rbArabelHp / RB_ARABEL_MAX_HP * 100) + '%';
        rbArabelHpNum.innerText = rbArabelHp;
    }
    
    if (rbEnemyImg) {
        rbEnemyImg.style.filter = 'brightness(8)';
        setTimeout(() => { rbEnemyImg.style.filter = 'grayscale(100%) brightness(200%)'; }, 100);
    }
}

// ==================== SISTEMA DE MOVIMENTO E COLISÃO ====================

function rbMinX() { return RB_MARGIN; }
function rbMaxX() { return RB_ARENA_W - RB_HEART_W - RB_MARGIN; }
function rbMinY() { return RB_MARGIN; }
function rbMaxY() { return RB_ARENA_H - RB_HEART_H - RB_MARGIN; }

function rbMoveTick() {
    if (!rbActive || rbPhase !== 'dodge') return;

    // Movimento do coração
    if (rbKeyState[37] || rbKeyState[65]) rbX = Math.max(rbMinX(), rbX - RB_SPEED);
    if (rbKeyState[39] || rbKeyState[68]) rbX = Math.min(rbMaxX(), rbX + RB_SPEED);
    if (rbKeyState[38] || rbKeyState[87]) rbY = Math.max(rbMinY(), rbY - RB_SPEED);
    if (rbKeyState[40] || rbKeyState[83]) rbY = Math.min(rbMaxY(), rbY + RB_SPEED);
    rbHeart.style.left = rbX + 'px';
    rbHeart.style.top = rbY + 'px';

    // Movimento e colisão das balas
    rbBullets = rbBullets.filter(b => {
        b.x += b.vx; 
        b.y += b.vy;
        b.el.style.left = b.x + 'px';
        b.el.style.top = b.y + 'px';
        
        // Remove se sair da arena
        if (b.x < -20 || b.x > RB_ARENA_W+20 || b.y < -20 || b.y > RB_ARENA_H+20) {
            b.el.remove(); 
            return false;
        }
        
        // Colisão com coração
        if (!rbInvincible) {
            const m = 5;
            if (b.x < rbX+RB_HEART_W-m && b.x+b.w > rbX+m && b.y < rbY+RB_HEART_H-m && b.y+b.h > rbY+m) {
                rbTakeDamage(18);
                b.el.remove(); 
                return false;
            }
        }
        return true;
    });
}

function spawnBullet(x, y, vx, vy, w, h) {
    const el = document.createElement('div');
    el.className = 'rb-bullet';
    el.style.cssText = `width:${w}px;height:${h}px;left:${x}px;top:${y}px`;
    rbArena.appendChild(el);
    rbBullets.push({ el, x, y, vx, vy, w, h });
}

function rbClearBullets() {
    rbBullets.forEach(b => b.el.remove());
    rbBullets = [];
}

// ==================== ESTADOS DO INIMIGO (UBE: sprite states) ====================
// UBE usa sprites separados por estado (default/attacking/hit/spareable/killed/talking)
// Aqui usamos filtros CSS já que o projeto não tem sprites multi-estado
function rbSetEnemyState(state) {
    if (!rbEnemyImg) return;
    rbEnemyImg.classList.remove('state-attacking', 'state-hit', 'state-spareable');
    if (state !== 'default') rbEnemyImg.classList.add('state-' + state);
}

// ==================== ANIMAÇÃO DE SLASH (UBE FightBox) ====================
// UBE: slashFrames[ticks/5] a 60fps = ~83ms por frame
// Exibe os 6 frames de slash sobre o sprite do inimigo quando o jogador acerta
function rbPlaySlashAnimation() {
    if (!rbEnemyImg) return;
    const rect = rbEnemyImg.getBoundingClientRect();
    if (!rect.width) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const img = document.createElement('img');
    img.style.cssText = `
        position:fixed; z-index:9998; pointer-events:none;
        image-rendering:pixelated;
        left:${cx - 64}px; top:${cy - 80}px;
        width:128px; height:128px;
    `;
    document.body.appendChild(img);
    let frame = 1;
    img.src = `assets/images/ui/slash/slash_${frame}.png`;
    const timer = setInterval(() => {
        frame++;
        if (frame <= 6) {
            img.src = `assets/images/ui/slash/slash_${frame}.png`;
        } else {
            clearInterval(timer);
            img.remove();
        }
    }, 80);
    // Flash de hit no inimigo (UBE: sprite muda para hitSprite)
    rbSetEnemyState('hit');
    setTimeout(() => {
        const spareable = rbMercyUnlocked;
        rbSetEnemyState(spareable ? 'spareable' : 'default');
    }, 160);
}

// ==================== PADRÕES DE BALA (UBE BulletPattern) ====================
// Portados de Java para JS mantendo a lógica de geração original
// UBE patterns: BulletRain, WallsOBullet, ClosingWalls, LadderDrill, Crusher
const RB_PATTERN_ARENA = {
    bulletRain:   { w: 480, h: 240 },
    wallsOBullet: { w: 380, h: 200 },
    closingWalls: { w: 300, h: 180 },
    ladderDrill:  { w: 360, h: 240 },
    crusher:      { w: 480, h: 160 },
};

const PATTERN_DURATION = {
    bulletRain:   4200,
    wallsOBullet: 4500,
    closingWalls: 3800,
    ladderDrill:  5200,
    crusher:      5500,
};

const RB_PATTERNS = {
    // BulletRain: chuva de balas de uma direção (UBE BulletRain.java)
    bulletRain: function() {
        const dir = Math.floor(Math.random() * 4);
        const speed = 3.5 + Math.random() * 1.5;
        const W = 10, H = 10;
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                if (rbPhase !== 'dodge') return;
                const spread = (Math.random() - 0.5) * 1.2;
                let x, y, vx = 0, vy = 0;
                switch (dir) {
                    case 0: x = Math.random()*(RB_ARENA_W-W); y = RB_ARENA_H+10; vy = -(speed + Math.random()); vx = spread; break;
                    case 1: x = Math.random()*(RB_ARENA_W-W); y = -H-10; vy = (speed + Math.random()); vx = spread; break;
                    case 2: x = RB_ARENA_W+10; y = Math.random()*(RB_ARENA_H-H); vx = -(speed + Math.random()); vy = spread; break;
                    case 3: x = -W-10; y = Math.random()*(RB_ARENA_H-H); vx = (speed + Math.random()); vy = spread; break;
                }
                spawnBullet(x, y, vx, vy, W, H);
            }, i * 200 + Math.random() * 80);
        }
    },

    // WallsOBullet: parede de balas com 1 buraco (UBE WallsOBullet.java)
    wallsOBullet: function() {
        const dir = Math.floor(Math.random() * 4);
        const speed = 4.5;
        const W = 13, H = 13;
        for (let wave = 0; wave < 3; wave++) {
            setTimeout(() => {
                if (rbPhase !== 'dodge') return;
                const isHoriz = (dir === 0 || dir === 1);
                const count = Math.floor((isHoriz ? RB_ARENA_W : RB_ARENA_H) / (isHoriz ? W : H));
                const gapI = Math.floor(Math.random() * count);
                for (let i = 0; i < count; i++) {
                    if (i === gapI) continue;
                    let x, y, vx = 0, vy = 0;
                    switch (dir) {
                        case 0: x = i*W; y = RB_ARENA_H+10; vy = -speed; break;
                        case 1: x = i*W; y = -H-10; vy = speed; break;
                        case 2: x = RB_ARENA_W+10; y = i*H; vx = -speed; break;
                        case 3: x = -W-10; y = i*H; vx = speed; break;
                    }
                    spawnBullet(x, y, vx, vy, W, H);
                }
            }, wave * 1350);
        }
    },

    // ClosingWalls: duas paredes fechando (UBE ClosingWalls.java)
    closingWalls: function() {
        const axis = Math.random() < 0.5 ? 'h' : 'v';
        const speed = 1.8;
        const THICK = 15;
        const wallA = document.createElement('div');
        const wallB = document.createElement('div');
        const base = 'position:absolute;background:white;pointer-events:none;z-index:6;';
        wallA.style.cssText = base;
        wallB.style.cssText = base;
        rbArena.appendChild(wallA);
        rbArena.appendChild(wallB);
        let posA = 0, posB = 0;
        const totalSize = axis === 'h' ? RB_ARENA_W : RB_ARENA_H;
        const ticker = setInterval(() => {
            if (rbPhase !== 'dodge') { wallA.remove(); wallB.remove(); clearInterval(ticker); return; }
            posA += speed; posB += speed;
            if (posA >= totalSize / 2 - 28) { wallA.remove(); wallB.remove(); clearInterval(ticker); return; }
            if (axis === 'h') {
                wallA.style.cssText = `${base}top:0;left:0;width:${THICK}px;height:${RB_ARENA_H}px;transform:translateX(${posA}px);`;
                wallB.style.cssText = `${base}top:0;right:0;width:${THICK}px;height:${RB_ARENA_H}px;transform:translateX(${-posB}px);`;
            } else {
                wallA.style.cssText = `${base}left:0;top:0;height:${THICK}px;width:${RB_ARENA_W}px;transform:translateY(${posA}px);`;
                wallB.style.cssText = `${base}left:0;bottom:0;height:${THICK}px;width:${RB_ARENA_W}px;transform:translateY(${-posB}px);`;
            }
        }, 16);
    },

    // LadderDrill: balas alternando em zigue-zague (UBE LadderDrill.java)
    ladderDrill: function() {
        const dir = Math.floor(Math.random() * 4);
        const speed = 4.5;
        const W = 44, H = 10;
        for (let i = 0; i < 14; i++) {
            setTimeout(() => {
                if (rbPhase !== 'dodge') return;
                const posRatio = (i % 2 === 0) ? 0.28 : 0.62;
                let x, y, vx = 0, vy = 0;
                switch (dir) {
                    case 0: x = RB_ARENA_W * posRatio - W/2; y = RB_ARENA_H+10; vy = -speed; break;
                    case 1: x = RB_ARENA_W * posRatio - W/2; y = -H-10; vy = speed; break;
                    case 2: x = RB_ARENA_W+10; y = RB_ARENA_H * posRatio - H/2; vx = -speed; break;
                    case 3: x = -W-10; y = RB_ARENA_H * posRatio - H/2; vx = speed; break;
                }
                spawnBullet(x, y, vx, vy, W, H);
            }, i * 350);
        }
    },

    // Crusher: parede com gap que atravessa a arena (UBE Crusher.java)
    crusher: function() {
        const dir = Math.floor(Math.random() * 4);
        const speed = 5.5;
        const SEG = 8, THICK = 14, GAP = 54;
        for (let wave = 0; wave < 3; wave++) {
            setTimeout(() => {
                if (rbPhase !== 'dodge') return;
                const isHoriz = (dir === 0 || dir === 1);
                const total = Math.floor((isHoriz ? RB_ARENA_W : RB_ARENA_H) / SEG);
                const gapStart = Math.floor(Math.random() * (total - Math.ceil(GAP / SEG) - 1));
                const gapEnd = gapStart + Math.ceil(GAP / SEG);
                for (let i = 0; i < total; i++) {
                    if (i >= gapStart && i < gapEnd) continue;
                    let x, y, vx = 0, vy = 0;
                    switch (dir) {
                        case 0: x=i*SEG; y=RB_ARENA_H+10; vy=-(speed+wave*0.4); break;
                        case 1: x=i*SEG; y=-THICK-10; vy=(speed+wave*0.4); break;
                        case 2: x=RB_ARENA_W+10; y=i*SEG; vx=-(speed+wave*0.4); break;
                        case 3: x=-THICK-10; y=i*SEG; vx=(speed+wave*0.4); break;
                    }
                    spawnBullet(x, y, vx, vy, isHoriz ? SEG : THICK, isHoriz ? THICK : SEG);
                }
            }, wave * 1600);
        }
    },
};

const RB_PATTERN_KEYS = Object.keys(RB_PATTERNS);

// ==================== SISTEMA DE TIMING (ATAQUE) ====================

let rbTimingActive = false;
let rbTimingPos = 0;
let rbTimingDir = 1;
let rbTimingSpeed = 0.012;
let rbTimingLoop = null;
let rbTimingZoneStart = 0;
let rbTimingZoneSize = 0;

function rbStartTiming() {
    rbTimingActive = true;
    rbTimingPos = 0;
    rbTimingDir = 1;
    
    const difficulty = rbFightingNero ? (rbNeroHp / RB_NERO_MAX_HP) : (rbArabelHp / RB_ARABEL_MAX_HP);
    rbTimingZoneSize = 0.12 + difficulty * 0.18;
    rbTimingZoneStart = 0.5 - rbTimingZoneSize / 2;
    rbTimingSpeed = 0.010 + (1 - difficulty) * 0.008;

    rbTimingZone.style.left = (rbTimingZoneStart * 100) + '%';
    rbTimingZone.style.width = (rbTimingZoneSize * 100) + '%';

    clearInterval(rbTimingLoop);
    rbTimingLoop = setInterval(() => {
        if (!rbTimingActive) return;
        rbTimingPos += rbTimingDir * rbTimingSpeed;
        if (rbTimingPos >= 1) { rbTimingPos = 1; rbTimingDir = -1; }
        if (rbTimingPos <= 0) { rbTimingPos = 0; rbTimingDir = 1; }
        rbTimingCursor.style.left = (rbTimingPos * 100) + '%';
    }, 16);
}

function rbStopTiming() {
    rbTimingActive = false;
    clearInterval(rbTimingLoop);
}

function rbHitTiming() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-core.js → rbHitTiming()');
    if (!rbTimingActive || rbPhase !== 'player') return;
    rbStopTiming();

    const inZone = rbTimingPos >= rbTimingZoneStart && rbTimingPos <= rbTimingZoneStart + rbTimingZoneSize;
    const center = rbTimingZoneStart + rbTimingZoneSize / 2;
    const distRel = Math.abs(rbTimingPos - center) / (rbTimingZoneSize / 2);
    const perfect = inZone && distRel < 0.3;

    let damage = 0;
    if (perfect) {
        damage = 30;
        rbTimingResult.style.color = '#ffff00';
        rbTimingResult.innerText = '✦ PERFEITO!';
    } else if (inZone) {
        damage = 18;
        rbTimingResult.style.color = '#ff4444';
        rbTimingResult.innerText = '✔ ACERTOU!';
    } else {
        damage = 0;
        rbTimingResult.style.color = '#aaaaaa';
        rbTimingResult.innerText = '✘ Errou...';
    }

    if (damage > 0) {
        sfxAttack.currentTime = 0; 
        sfxAttack.play().catch(() => {});
        // UT: hitsound secundário ao acertar
        try { const hs = document.getElementById('sfx-ut-hitsound'); if (hs) { hs.currentTime = 0; hs.play().catch(() => {}); } } catch(e) {}
        // Animação de slash (UBE FightBox: slashFrames[ticks/5])
        rbPlaySlashAnimation();
        rbDamageEnemy(damage);
        rbMessage.innerText = perfect ? '* !!!' : '* Hng...';
    } else {
        rbMessage.innerText = '* Errou!';
        // Diálogo de reação no balão
        if (!rbFightingNero && typeof showArabelBubble === 'function') {
            showArabelBubble('* Patético.');
        }
    }

    // Verifica vitória
    if (!rbFightingNero && rbArabelHp <= 0) {
        rbTimingResult.innerText = '★ Arabel derrotada!';
        window.arabelActive = false;
        // UT: enemydust ao derrotar o inimigo
        try { const ed = document.getElementById('sfx-ut-enemydust'); if (ed) { ed.currentTime = 0; ed.play().catch(() => {}); } } catch(e) {}
        rbStopAll();
        setTimeout(() => {
            rbArabelHud.style.display = 'none';
            rbArena.style.display = 'none';
            rbActionPanel.style.display = 'none';
            rbTimingWrap.style.display = 'none';
            if (typeof startArabelToNeroTransition === 'function') {
                startArabelToNeroTransition();
            } else {
                window.startNeroBattleSequence && window.startNeroBattleSequence();
            }
        }, 1200);
        return;
    }

    rbTransitioning = true;
    setTimeout(() => { 
        rbTransitioning = false; 
        if (window.arabelActive) {
            arabelDodgePhase();
        } else if (rbActive) {
            rbStartDodgePhase();
        }
    }, 1400);
}

// ==================== CONTROLES ====================

function rbKeyDown(e) {
    rbKeyState[e.keyCode || e.which] = true;
    if ((e.keyCode === 32) && rbTimingActive) { 
        e.preventDefault(); 
        rbHitTiming(); 
    }
}

function rbKeyUp(e) {
    rbKeyState[e.keyCode || e.which] = false;
}

// ==================== CONTROLE GERAL ====================

function rbStopAll() {
    rbActive = false;
    rbPhase = 'none';
    if (rbMoveLoop) clearInterval(rbMoveLoop);
    if (rbDodgeTimer) clearTimeout(rbDodgeTimer);
    rbStopTiming();
    rbClearBullets();
    battleMusic.pause();
    battleMusic.currentTime = 0;
    document.removeEventListener('keydown', rbKeyDown);
    document.removeEventListener('keyup', rbKeyUp);
}
