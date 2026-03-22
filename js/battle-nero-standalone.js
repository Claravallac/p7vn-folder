// ==================== SISTEMA DE BATALHA NERO STANDALONE ====================
// Completamente independente de Arabel
// Constantes
const NB_MAX_HP = 92;
const NB_NERO_MAX_HP = 100;
let NB_ARENA_W = 480;
let NB_ARENA_H = 240;
const NB_HEART_W = 22;
const NB_HEART_H = 22;
const NB_SPEED = 2.8;
const NB_MARGIN = 2;

// Estado da batalha NERO
let nbActive = false;
let nbPhase = 'none'; // 'none', 'player', 'dodge', 'cutscene'
let nbHp = NB_MAX_HP;
let nbNeroHp = NB_NERO_MAX_HP;
let nbX = NB_ARENA_W / 2 - NB_HEART_W / 2;
let nbY = NB_ARENA_H / 2 - NB_HEART_H / 2;
let nbKeyState = {};
let nbBullets = [];
let nbMoveLoop = null;
let nbDodgeTimer = null;
let nbInvincible = false;
let nbAttackIndex = 0;
let nbDead = false;
let nbTransitioning = false;
let nbUsedItemThisTurn = false;
let nbPhase2 = false;
let nbMercyUnlocked = false;
let nbMercyCount = 0;

// Elementos DOM (compartilhados com Arabel, mas usados diferente)
const neroRealBattleScreen = document.getElementById('real-battle-screen');
const neroRbArena = document.getElementById('rb-arena');
const neroRbHeart = document.getElementById('rb-heart');
const neroRbMessageEl = document.getElementById('rb-message');
const neroRbMessage = {
    get innerText() { return neroRbMessageEl.innerText; },
    set innerText(v) { neroRbMessageEl.innerText = v; }
};
const neroRbHpFill = document.getElementById('rb-hp-fill');
const neroRbHpNum = document.getElementById('rb-hp-num');
const neroRbNeroHpFill = document.getElementById('rb-nero-hp-fill');
const neroRbNeroHpNum = document.getElementById('rb-nero-hp-num');
const neroRbNeroHud = document.getElementById('rb-nero-hud');
const neroRbArabelHud = document.getElementById('rb-arabel-hud');
const neroRbActionPanel = document.getElementById('rb-action-panel');
const neroRbTimingWrap = document.getElementById('rb-timing-wrap');
const neroRbTimingZone = document.getElementById('rb-timing-zone');
const neroRbTimingCursor = document.getElementById('rb-timing-cursor');
const neroRbTimingResult = document.getElementById('rb-timing-result');
const neroRbEnemyImg = document.getElementById('rb-enemy-img');

// ==================== BALÃO DE FALA NERO ====================
function showNeroBalloon(text, duration) {
    duration = duration || 3000;
    const balloon = document.getElementById('rb-nero-balloon');
    if (!balloon) return;
    balloon.innerText = text;
    balloon.style.display = 'block';
    balloon.style.opacity = '1';
    clearTimeout(showNeroBalloon._timer);
    showNeroBalloon._timer = setTimeout(() => {
        balloon.style.opacity = '0';
        setTimeout(() => { balloon.style.display = 'none'; }, 400);
    }, duration);
}
showNeroBalloon._timer = null;

// ==================== SISTEMA DE ROUNDS NERO ====================

function nbStartPlayerPhase() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-nero-standalone.js → nbStartPlayerPhase()');
    if (nbTransitioning) return;
    if (!nbActive) return;
    nbPhase = 'player';
    nbTransitioning = false;
    nbUsedItemThisTurn = false;
    clearInterval(nbMoveLoop);
    clearTimeout(nbDodgeTimer);
    nbClearBullets();

    // Esconde arena - colapsa para altura 0
    neroRbArena.classList.add('hiding');
    neroRbArena.style.height = '0px';
    neroRbArena.style.marginBottom = '0px';
    setTimeout(() => {
        neroRbArena.style.opacity = '0';
        neroRbArena.style.pointerEvents = 'none';
        neroRbArena.classList.remove('hiding');
    }, 400);
    
    // Mostra painel de ações
    neroRbTimingWrap.classList.remove('showing');
    setTimeout(() => { neroRbTimingWrap.style.display = 'none'; }, 300);
    neroRbActionPanel.style.display = 'flex';
    requestAnimationFrame(() => { neroRbActionPanel.classList.add('showing'); });
    neroRbTimingResult.innerText = '';

    neroRbMessage.innerText = '* Sua vez!';
    showNeroBalloon('Sua escolha.');
}

function nbStartDodgePhase() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-nero-standalone.js → nbStartDodgePhase()');
    if (nbTransitioning) return;
    if (!nbActive) return;
    nbPhase = 'dodge';
    nbTransitioning = false;
    
    // Esconde painel de ações
    neroRbActionPanel.classList.remove('showing');
    neroRbTimingWrap.classList.remove('showing');
    setTimeout(() => {
        neroRbActionPanel.style.display = 'none';
        neroRbTimingWrap.style.display = 'none';
    }, 300);
    
    // Restaura altura da arena (foi colapsada em nbStartPlayerPhase)
    neroRbArena.style.height = NB_ARENA_H + 'px';
    neroRbArena.style.marginBottom = '8px';
    
    // Mostra arena
    neroRbArena.classList.remove('hiding');
    neroRbArena.style.opacity = '1';
    neroRbArena.style.pointerEvents = 'auto';
    neroRbArena.classList.add('showing');
    setTimeout(() => neroRbArena.classList.remove('showing'), 500);
    neroRbHeart.style.opacity = '1';

    // Reseta posição do coração EXATAMENTE no centro
    nbX = NB_ARENA_W / 2 - NB_HEART_W / 2;
    nbY = NB_ARENA_H / 2 - NB_HEART_H / 2;
    neroRbHeart.style.left = nbX + 'px';
    neroRbHeart.style.top = nbY + 'px';
    nbClearBullets();

    neroRbMessage.innerText = '* Nero ataca!';

    // Spawna balas - APÓS garantir que o cursor está centralizado
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            if (nbPhase === 'dodge') nbSpawnBullet(Math.random()*(NB_ARENA_W-10), -10, (Math.random()-0.5)*1.5, 4, 10, 10);
        }, 400 + i*200);
    }

    // Loop de movimento
    clearInterval(nbMoveLoop);
    nbMoveLoop = setInterval(nbMoveTick, 16);

    // Após 3.5s volta para fase do jogador
    clearTimeout(nbDodgeTimer);
    nbDodgeTimer = setTimeout(() => {
        if (!nbActive || nbPhase !== 'dodge') return;
        nbStartPlayerPhase();
    }, 3500);
}

// ==================== SISTEMA DE HP NERO ====================

function nbTakeDamage(amount) {
    if (nbDead || nbInvincible) return;

    nbHp = Math.max(0, nbHp - amount);
    neroRbHpFill.style.width = (nbHp / NB_MAX_HP * 100) + '%';
    neroRbHpNum.innerText = nbHp;

    sfxFail.currentTime = 0; 
    sfxFail.play().catch(() => {});

    nbInvincible = true;
    neroRbHeart.style.opacity = '0.25';
    setTimeout(() => {
        if (!nbDead) { 
            neroRbHeart.style.opacity = '1'; 
            nbInvincible = false; 
        }
    }, 700);

    if (nbHp <= 0) {
        nbDead = true;
        neroRbMessage.innerText = '* Fim de linha.';
        // UT: heartsplosion ao morrer
        try { const hx = document.getElementById('sfx-ut-heartsplosion'); if (hx) { hx.currentTime = 0; hx.play().catch(() => {}); } } catch(e) {}
        nbStopAll();
        // Reutiliza rbPlayDeathAnimation do battle-core.js (usa neroRbHeart como referência)
        if (typeof rbPlayDeathAnimation === 'function') {
            rbPlayDeathAnimation(() => {
                neroRealBattleScreen.style.display = 'none';
                triggerGameOver();
            }, neroRbHeart);
        } else {
            setTimeout(() => {
                neroRealBattleScreen.style.display = 'none';
                triggerGameOver();
            }, 1200);
        }
    }
}

function nbDamageEnemy(amount) {
    nbNeroHp = Math.max(0, nbNeroHp - amount);
    neroRbNeroHpFill.style.width = (nbNeroHp / NB_NERO_MAX_HP * 100) + '%';
    neroRbNeroHpNum.innerText = nbNeroHp;
    
    if (neroRbEnemyImg) {
        neroRbEnemyImg.style.filter = 'brightness(8)';
        setTimeout(() => { neroRbEnemyImg.style.filter = 'grayscale(100%) brightness(200%)'; }, 100);
    }
}

// ==================== SISTEMA DE MOVIMENTO E COLISÃO NERO ====================

function nbMinX() { return NB_MARGIN; }
function nbMaxX() { return NB_ARENA_W - NB_HEART_W - NB_MARGIN; }
function nbMinY() { return NB_MARGIN; }
function nbMaxY() { return NB_ARENA_H - NB_HEART_H - NB_MARGIN; }

function nbMoveTick() {
    if (!nbActive || nbPhase !== 'dodge') return;

    // Movimento do coração
    if (nbKeyState[37] || nbKeyState[65]) nbX = Math.max(nbMinX(), nbX - NB_SPEED);
    if (nbKeyState[39] || nbKeyState[68]) nbX = Math.min(nbMaxX(), nbX + NB_SPEED);
    if (nbKeyState[38] || nbKeyState[87]) nbY = Math.max(nbMinY(), nbY - NB_SPEED);
    if (nbKeyState[40] || nbKeyState[83]) nbY = Math.min(nbMaxY(), nbY + NB_SPEED);
    neroRbHeart.style.left = nbX + 'px';
    neroRbHeart.style.top = nbY + 'px';

    // Movimento e colisão das balas
    nbBullets = nbBullets.filter(b => {
        b.x += b.vx; 
        b.y += b.vy;
        b.el.style.left = b.x + 'px';
        b.el.style.top = b.y + 'px';
        
        // Remove se sair da arena
        if (b.x < -20 || b.x > NB_ARENA_W+20 || b.y < -20 || b.y > NB_ARENA_H+20) {
            b.el.remove(); 
            return false;
        }
        
        // Colisão com coração
        if (!nbInvincible) {
            const m = 5;
            if (b.x < nbX+NB_HEART_W-m && b.x+b.w > nbX+m && b.y < nbY+NB_HEART_H-m && b.y+b.h > nbY+m) {
                nbTakeDamage(18);
                b.el.remove(); 
                return false;
            }
        }
        return true;
    });
}

function nbSpawnBullet(x, y, vx, vy, w, h) {
    const el = document.createElement('div');
    el.className = 'rb-bullet';
    el.style.cssText = `width:${w}px;height:${h}px;left:${x}px;top:${y}px`;
    neroRbArena.appendChild(el);
    nbBullets.push({ el, x, y, vx, vy, w, h });
}

function nbClearBullets() {
    nbBullets.forEach(b => b.el.remove());
    nbBullets = [];
}

// ==================== SISTEMA DE TIMING NERO ====================

let nbTimingActive = false;
let nbTimingPos = 0;
let nbTimingDir = 1;
let nbTimingSpeed = 0.012;
let nbTimingLoop = null;
let nbTimingZoneStart = 0;
let nbTimingZoneSize = 0;

function nbStartTiming() {
    nbTimingActive = true;
    nbTimingPos = 0;
    nbTimingDir = 1;
    
    const difficulty = nbNeroHp / NB_NERO_MAX_HP;
    nbTimingZoneSize = 0.12 + difficulty * 0.18;
    nbTimingZoneStart = 0.5 - nbTimingZoneSize / 2;
    nbTimingSpeed = 0.010 + (1 - difficulty) * 0.008;

    neroRbTimingZone.style.left = (nbTimingZoneStart * 100) + '%';
    neroRbTimingZone.style.width = (nbTimingZoneSize * 100) + '%';

    clearInterval(nbTimingLoop);
    nbTimingLoop = setInterval(() => {
        if (!nbTimingActive) return;
        nbTimingPos += nbTimingDir * nbTimingSpeed;
        if (nbTimingPos >= 1) { nbTimingPos = 1; nbTimingDir = -1; }
        if (nbTimingPos <= 0) { nbTimingPos = 0; nbTimingDir = 1; }
        neroRbTimingCursor.style.left = (nbTimingPos * 100) + '%';
    }, 16);
}

function nbStopTiming() {
    nbTimingActive = false;
    clearInterval(nbTimingLoop);
}

function nbHitTiming() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-nero-standalone.js → nbHitTiming()');
    if (!nbTimingActive || nbPhase !== 'player') return;
    nbStopTiming();

    const inZone = nbTimingPos >= nbTimingZoneStart && nbTimingPos <= nbTimingZoneStart + nbTimingZoneSize;
    const center = nbTimingZoneStart + nbTimingZoneSize / 2;
    const distRel = Math.abs(nbTimingPos - center) / (nbTimingZoneSize / 2);
    const perfect = inZone && distRel < 0.3;

    let damage = 0;
    if (perfect) {
        damage = 30;
        neroRbTimingResult.style.color = '#ffff00';
        neroRbTimingResult.innerText = '✦ PERFEITO!';
    } else if (inZone) {
        damage = 18;
        neroRbTimingResult.style.color = '#ff4444';
        neroRbTimingResult.innerText = '✔ ACERTOU!';
    } else {
        damage = 0;
        neroRbTimingResult.style.color = '#aaaaaa';
        neroRbTimingResult.innerText = '✘ Errou...';
    }

    if (damage > 0) {
        sfxAttack.currentTime = 0; 
        sfxAttack.play().catch(() => {});
        nbDamageEnemy(damage);
        neroRbMessage.innerText = perfect ? '* !!!' : '* Hng...';
    } else {
        neroRbMessage.innerText = '* Errou!';
        showNeroBalloon('Hah.');
    }

    // Verifica Phase 2 de Nero (HP <= 10 e ainda não entrou na Phase 2)
    if (nbNeroHp <= 10 && !nbPhase2) {
        nbPhase2 = true;
        nbActive = false;
        nbPhase = 'cutscene';
        clearInterval(nbMoveLoop);
        clearTimeout(nbDodgeTimer);
        nbStopTiming();
        nbClearBullets();
        document.removeEventListener('keydown', nbKeyDown);
        document.removeEventListener('keyup', nbKeyUp);
        
        neroRbTimingWrap.classList.remove('showing');
        setTimeout(() => { neroRbTimingWrap.style.display = 'none'; }, 300);
        
        neroRbMessage.innerText = '* Nero: ...';
        showNeroBalloon('Heh... nada mal.', 3000);
        
        setTimeout(() => {
            neroRbMessage.innerText = '* Nero: Deixa eu te mostrar uma coisa.';
            showNeroBalloon('Deixa eu te mostrar uma coisa.', 3000);
            setTimeout(() => {
                // Animar HP bar para o centro da tela
                const neroHpBar = neroRbNeroHud.querySelector('.rb-hp-bg');
                neroHpBar.style.transition = 'all 1s ease';
                neroHpBar.style.position = 'fixed';
                neroHpBar.style.left = '50%';
                neroHpBar.style.top = '50%';
                neroHpBar.style.transform = 'translate(-50%, -50%) scale(2)';
                neroHpBar.style.zIndex = '9000';
                
                setTimeout(() => {
                    // Som de cura
                    const healSound = document.getElementById('heal-sound');
                    if (healSound) {
                        healSound.currentTime = 0;
                        healSound.volume = 1.0;
                        healSound.play().catch(() => {});
                    }
                    
                    // Heal para 10000
                    nbNeroHp = 10000;
                    neroRbNeroHpFill.style.width = '100%';
                    neroRbNeroHpFill.style.background = '#ff00ff';
                    neroRbNeroHpNum.innerText = '10000';
                    
                    // Texto flutuante +10000
                    const healText = document.createElement('div');
                    healText.style.cssText = 'position:fixed;left:50%;top:calc(50% - 40px);transform:translateX(-50%);font-family:VT323,monospace;font-size:48px;color:#00ff88;text-shadow:0 0 20px #00ff88;z-index:9001;pointer-events:none;animation:nbHealFloat 2s ease-out forwards';
                    healText.innerText = '+10000';
                    document.body.appendChild(healText);
                    const healStyle = document.createElement('style');
                    healStyle.textContent = '@keyframes nbHealFloat { 0% { opacity:1; transform:translateX(-50%) translateY(0); } 100% { opacity:0; transform:translateX(-50%) translateY(-50px); } }';
                    document.head.appendChild(healStyle);
                    setTimeout(() => { healText.remove(); healStyle.remove(); }, 2000);
                    
                    setTimeout(() => {
                        // Restaurar HP bar
                        neroHpBar.style.position = '';
                        neroHpBar.style.left = '';
                        neroHpBar.style.top = '';
                        neroHpBar.style.transform = '';
                        neroHpBar.style.zIndex = '';
                        
                        setTimeout(() => {
                            neroHpBar.style.transition = '';
                            neroRbMessage.innerText = '* Nero: Gostou? Legal né?';
                            showNeroBalloon('Gostou? Legal né?', 3000);
                            setTimeout(() => {
                                // Desbloquear Mercy e retomar batalha
                                nbMercyUnlocked = true;
                                nbActive = true;
                                nbPhase = 'player';
                                nbTransitioning = false;
                                document.addEventListener('keydown', nbKeyDown);
                                document.addEventListener('keyup', nbKeyUp);
                                neroRbActionPanel.style.display = 'flex';
                                requestAnimationFrame(() => {
                                    neroRbActionPanel.classList.add('showing');
                                });
                                neroRbMessage.innerText = '* Sua vez!';
                            }, 2000);
                        }, 1000);
                    }, 2000);
                }, 1000);
            }, 2000);
        }, 800);
        return;
    }

    // Verifica derrota de Nero (só na Phase 2, HP tem 10000)
    if (nbNeroHp <= 0) {
        neroRbTimingResult.innerText = '★ Nero derrotado!';
        nbStopAll();
        setTimeout(() => {
            neroRealBattleScreen.style.display = 'none';
        }, 1200);
        return;
    }

    nbTransitioning = true;
    setTimeout(() => { 
        nbTransitioning = false; 
        if (nbActive) nbStartDodgePhase(); 
    }, 1400);
}

// ==================== BOTÕES DE AÇÃO NERO ====================

function setupNeroButtonListeners() {
    document.getElementById('rb-btn-fight').addEventListener('click', neroFightClick);
    document.getElementById('rb-btn-act').addEventListener('click', neroActClick);
    document.getElementById('rb-btn-item').addEventListener('click', neroItemClick);
    document.getElementById('rb-btn-mercy').addEventListener('click', neroMercyClick);
    document.getElementById('rb-timing-track').addEventListener('click', nbHitTiming);
}

function neroFightClick() {
    if (nbPhase !== 'player') return;
    sfxConfirmation.currentTime = 0; 
    sfxConfirmation.play().catch(() => {});
    
    neroRbActionPanel.classList.remove('showing');
    setTimeout(() => {
        neroRbActionPanel.style.display = 'none';
        neroRbTimingWrap.style.display = 'flex';
        requestAnimationFrame(() => { neroRbTimingWrap.classList.add('showing'); });
    }, 300);
    neroRbTimingResult.innerText = '';
    nbStartTiming();
}

function neroActClick() {
    if (nbPhase !== 'player') return;
    nbPhase = 'transitioning';
    nbTransitioning = true;
    sfxConfirmation.currentTime = 0; 
    sfxConfirmation.play().catch(() => {});
    neroRbMessage.innerText = '* Você tenta provocar. Sem efeito.';
    neroRbActionPanel.style.display = 'none';
    setTimeout(() => { 
        nbTransitioning = false; 
        if (nbActive) nbStartDodgePhase(); 
    }, 1200);
}

function neroItemClick() {
    if (nbPhase !== 'player') return;
    sfxConfirmation.currentTime = 0;
    sfxConfirmation.play().catch(() => {});
    showInventoryMenu();
}

function neroMercyClick() {
    if (nbPhase !== 'player') return;
    
    if (nbMercyUnlocked) {
        nbMercyCount++;
        nbPhase = 'transitioning';
        nbTransitioning = true;
        sfxConfirmation.currentTime = 0; 
        sfxConfirmation.play().catch(() => {});
        neroRbActionPanel.style.display = 'none';
        
        const mercyMessages = [
            '* Nero: Você quer me poupar agora, é? Que engraçado.',
            '* Nero: Você acha que eu realmente vou esquecer de tudo o que aconteceu?',
            '* Nero: Não tem mais volta, Abbyl.'
        ];
        const mercyBalloons = [
            'Você quer me poupar? Que engraçado.',
            'Você acha que eu vou esquecer?',
            'Não tem mais volta.'
        ];
        
        if (nbMercyCount <= 3) {
            neroRbMessage.innerText = mercyMessages[nbMercyCount - 1];
            showNeroBalloon(mercyBalloons[nbMercyCount - 1], 3500);
            setTimeout(() => { 
                nbTransitioning = false; 
                nbPhase = 'player';
                if (nbActive) nbStartPlayerPhase(); 
            }, 3000);
        } else if (nbMercyCount === 4) {
            // Cutscene do biscoito
            neroRbMessage.innerText = '* Nero: ...';
            showNeroBalloon('...', 2000);
            nbActive = false;
            nbPhase = 'cutscene';
            
            setTimeout(() => {
                // Escurecer tudo
                neroRbEnemyImg.style.opacity = '0';
                const neroChar = document.getElementById('rb-nero-char');
                const neroAura = document.getElementById('nero-aura');
                if (neroChar) neroChar.style.opacity = '0';
                if (neroAura) neroAura.style.opacity = '0';
                neroRbNeroHud.style.opacity = '0';
                const rbHud = document.getElementById('rb-hud');
                if (rbHud) rbHud.style.opacity = '0';
                neroRbMessageEl.style.opacity = '0';
                
                const windSound = document.getElementById('wind-sound');
                battleMusic.volume = 0;
                setTimeout(() => { battleMusic.pause(); }, 500);
                if (windSound) {
                    windSound.volume = 0.4;
                    windSound.play().catch(() => {});
                }
                
                neroRealBattleScreen.style.background = '#000';
                
                setTimeout(() => {
                    const voiceDiv = document.createElement('div');
                    voiceDiv.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:9500;';
                    const voiceText = document.createElement('div');
                    voiceText.style.cssText = 'font-family:VT323,monospace;font-size:42px;color:#fff;text-align:center;line-height:1.6;max-width:800px;opacity:0;transition:opacity 1s;';
                    voiceText.innerText = '???\n\nVocê realmente quer salvar ela?\n\nEntão... use isso.';
                    voiceDiv.appendChild(voiceText);
                    document.body.appendChild(voiceDiv);
                    
                    setTimeout(() => { voiceText.style.opacity = '1'; }, 100);
                    
                    setTimeout(() => {
                        voiceText.style.opacity = '0';
                        setTimeout(() => {
                            voiceDiv.remove();
                            if (windSound) {
                                windSound.pause();
                                windSound.currentTime = 0;
                            }
                            
                            // Dar biscoito ao inventário
                            inventory.add(ITEMS.BISCOITO);
                            
                            // Restaurar visuais
                            neroRbEnemyImg.style.opacity = '1';
                            if (neroChar) neroChar.style.opacity = '1';
                            if (neroAura) neroAura.style.opacity = '1';
                            neroRbNeroHud.style.opacity = '1';
                            if (rbHud) rbHud.style.opacity = '1';
                            neroRbMessageEl.style.opacity = '1';
                            neroRealBattleScreen.style.background = '#000';
                            
                            battleMusic.volume = 0.3;
                            battleMusic.play().catch(() => {});
                            
                            neroRbMessage.innerText = '* Você recebeu: Biscoito com Goiabada';
                            nbActive = true;
                            nbPhase = 'player';
                            nbTransitioning = false;
                            
                            setTimeout(() => {
                                nbStartPlayerPhase();
                            }, 1500);
                        }, 1000);
                    }, 4000);
                }, 1000);
            }, 1000);
        }
        return;
    }
    
    // Mercy antes de desbloquear
    nbPhase = 'transitioning';
    nbTransitioning = true;
    sfxConfirmation.currentTime = 0; 
    sfxConfirmation.play().catch(() => {});
    neroRbMessage.innerText = '* Sem efeito.';
    neroRbActionPanel.style.display = 'none';
    setTimeout(() => { 
        nbTransitioning = false; 
        if (nbActive) nbStartDodgePhase(); 
    }, 1200);
}

// ==================== CONTROLES NERO ====================

function nbKeyDown(e) {
    nbKeyState[e.keyCode || e.which] = true;
    if ((e.keyCode === 32) && nbTimingActive) { 
        e.preventDefault(); 
        nbHitTiming(); 
    }
}

function nbKeyUp(e) {
    nbKeyState[e.keyCode || e.which] = false;
}

// ==================== CONTROLE GERAL NERO ====================

function nbStopAll() {
    nbActive = false;
    nbPhase = 'none';
    window.neroStandaloneActive = false;
    if (nbMoveLoop) clearInterval(nbMoveLoop);
    if (nbDodgeTimer) clearTimeout(nbDodgeTimer);
    nbStopTiming();
    nbClearBullets();
    battleMusic.pause();
    battleMusic.currentTime = 0;
    document.removeEventListener('keydown', nbKeyDown);
    document.removeEventListener('keyup', nbKeyUp);
}

// ==================== INICIAR BATALHA NERO ====================

window.startNeroBattleSequence = function() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-nero-standalone.js → startNeroBattleSequence()');
    window.neroStandaloneActive = true;
    window.arabelActive = false;
    // Matar qualquer estado pendente do battle-core (Arabel)
    rbActive = false;
    rbPhase = 'none';
    clearInterval(rbMoveLoop);
    clearTimeout(rbDodgeTimer);
    // Limpar callback de frases da Arabel
    if (typeof rbOnDodgePhaseStart !== 'undefined') rbOnDodgePhaseStart = null;
    
    // Resetar COMPLETAMENTE a arena e estado
    neroRbArena.style.display = 'block';
    neroRbArena.style.height = NB_ARENA_H + 'px';
    neroRbArena.style.marginBottom = '8px';
    neroRbArena.style.opacity = '0';
    neroRbArena.style.pointerEvents = 'none';
    neroRbActionPanel.style.display = 'none';
    neroRbTimingWrap.style.display = 'none';
    
    // Configurar HUD de Nero
    neroRbNeroHud.style.display = 'flex';
    neroRbNeroHpFill.style.width = '100%';
    neroRbNeroHpFill.style.background = '#aa00ff';
    neroRbNeroHpNum.innerText = NB_NERO_MAX_HP;
    
    // Ocultar HUD de Arabel
    neroRbArabelHud.style.display = 'none';
    
    // Resetar variáveis
    nbActive = true;
    nbPhase = 'none';
    nbHp = NB_MAX_HP;
    nbNeroHp = NB_NERO_MAX_HP;
    nbX = NB_ARENA_W / 2 - NB_HEART_W / 2;
    nbY = NB_ARENA_H / 2 - NB_HEART_H / 2;
    nbKeyState = {};
    nbBullets = [];
    nbMoveLoop = null;
    nbDodgeTimer = null;
    nbInvincible = false;
    nbAttackIndex = 0;
    nbDead = false;
    nbTransitioning = false;
    nbUsedItemThisTurn = false;
    nbPhase2 = false;
    nbMercyUnlocked = false;
    nbMercyCount = 0;
    
    neroRbHpFill.style.width = '100%';
    neroRbHpNum.innerText = NB_MAX_HP;
    neroRbTimingResult.innerText = '';
    
    // Mostrar Nero Character
    if (document.getElementById('rb-nero-char')) {
        document.getElementById('rb-nero-char').style.opacity = '1';
    }
    if (document.getElementById('nero-aura')) {
        document.getElementById('nero-aura').style.display = 'block';
    }
    
    // Esconder Arabel Character completamente
    neroRbEnemyImg.style.opacity = '0';
    neroRbEnemyImg.style.pointerEvents = 'none';
    if (document.getElementById('rb-arabel-char')) {
        document.getElementById('rb-arabel-char').style.opacity = '0';
        document.getElementById('rb-arabel-char').style.pointerEvents = 'none';
    }
    
    // Setup listeners
    setupNeroButtonListeners();
    document.removeEventListener('keydown', nbKeyDown);
    document.removeEventListener('keyup', nbKeyUp);
    document.addEventListener('keydown', nbKeyDown);
    document.addEventListener('keyup', nbKeyUp);
    
    // Mostrar HUD com animação
    setTimeout(() => {
        neroRbNeroHud.classList.add('showing');
        neroRbMessage.innerText = '* Batalha começa!';
        showNeroBalloon('Vamos começar.', 2000);
        setTimeout(() => {
            nbStartPlayerPhase();
        }, 2000);
    }, 600);
};
