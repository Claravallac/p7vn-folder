// Batalha Arabel

window.arabelActive = false;

const arabelPhrases = [
    'A gente vai dominar tudo.',
    'Você pode continuar tentando lutar até cair de cansaço.',
    'Eu e a Nero vamos acabar com você, cavalo estúpido.',
    'Você quer saber sobre bios modificada? Hahaha',
    'Você é realmente inteligente?',
    'Abbyl, você pode ir embora se quiser.'
];
let arabelPhraseIndex = 0;

function showArabelPhrase() {
    // Não mostrar frases se a batalha terminou
    if (!window.arabelActive) return;
    
    const bubble = document.getElementById('rb-arabel-bubble');
    const text = document.getElementById('rb-arabel-bubble-text');
    
    if (bubble && text) {
        text.innerText = arabelPhrases[arabelPhraseIndex % arabelPhrases.length];
        bubble.style.opacity = '1';
        
        setTimeout(() => {
            bubble.style.opacity = '0';
        }, 4000);
        
        arabelPhraseIndex++;
    }
}

function showArabelBubble(text) {
    if (!window.arabelActive) return;
    const bubble = document.getElementById('rb-arabel-bubble');
    const textEl = document.getElementById('rb-arabel-bubble-text');
    if (bubble && textEl) {
        textEl.innerText = text;
        bubble.style.opacity = '1';
        setTimeout(() => { bubble.style.opacity = '0'; }, 3500);
    }
}

function startArabelBattle() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-arabel.js → startArabelBattle()');
    
    rbArabelHp = 100;
    window.arabelActive = true;
    rbActive = true;
    rbFightingNero = false;
    rbAttackIndex = 0;
    
    // Registrar callback para mostrar frases
    rbOnDodgePhaseStart = () => {
        if (!rbFightingNero && Math.random() < 0.4) {
            setTimeout(() => showArabelPhrase(), 500);
        }
    };
    
    fadeOverlay.style.opacity = '1';
    setTimeout(() => {
        utBattleScreen.style.display = 'none';
        realBattleScreen.style.display = 'flex';
        
        battleMusic.volume = 0.3;
        battleMusic.play().catch(() => {});
        
        document.getElementById('rb-hud').style.opacity = '1';
        document.getElementById('rb-hud').style.display = 'flex';
        document.getElementById('rb-arabel-hud').style.opacity = '1';
        document.getElementById('rb-arabel-hud').style.display = 'flex';
        document.getElementById('rb-message').style.opacity = '1';
        rbArena.style.opacity = '1';
        rbArena.style.display = 'block';
        rbHeart.style.opacity = '1';
        
        rbX = RB_ARENA_W / 2 - RB_HEART_W / 2;
        rbY = RB_ARENA_H / 2 - RB_HEART_H / 2;
        rbHeart.style.left = rbX + 'px';
        rbHeart.style.top = rbY + 'px';
        
        updateArabelUI();
        rbMessage.innerText = '* Arabel: Vamos ver do que você é capaz!';
        
        // Mostrar portrait da Arabel, esconder sprite pixel
        const arabelChar = document.getElementById('rb-arabel-char');
        if (arabelChar) {
            arabelChar.style.opacity = '1';
            arabelChar.style.display = 'block';
        }
        const arabelPortrait = document.getElementById('rb-arabel-portrait');
        if (arabelPortrait) arabelPortrait.style.opacity = '1';
        // Esconder rb-enemy-img (sprite pixel legado) como Nero faz
        if (rbEnemyImg) {
            rbEnemyImg.style.opacity = '0';
            rbEnemyImg.style.pointerEvents = 'none';
        }
        
        // Diálogos de intro antes da batalha
        const introLines = [
            '* Arabel: Ah, a famosa Abbyl.',
            '* Arabel: Você realmente achou que chegaria até aqui?',
            '* Arabel: Não importa. Isso acaba agora.'
        ];
        let li = 0;
        function showIntroLine() {
            if (li >= introLines.length) {
                fadeOverlay.style.opacity = '0';
                setTimeout(() => arabelDodgePhase(), 600);
                return;
            }
            rbMessage.innerText = introLines[li++];
            setTimeout(showIntroLine, 2200);
        }
        setTimeout(() => {
            fadeOverlay.style.opacity = '0';
            setTimeout(showIntroLine, 400);
        }, 500);
    }, 800);
}

// Expor função globalmente IMEDIATAMENTE
window.startArabelBattleExternal = startArabelBattle;

function updateArabelUI() {
    document.getElementById('rb-hp-fill').style.width = (rbArabelHp / 100 * 100) + '%';
    document.getElementById('rb-hp-num').innerText = rbArabelHp;
    document.getElementById('rb-arabel-hp-fill').style.width = (rbArabelHp / 100 * 100) + '%';
    document.getElementById('rb-arabel-hp-num').innerText = rbArabelHp;
}

function arabelDodgePhase() {
    if (!window.arabelActive) return;
    rbPhase = 'dodge';
    rbArena.style.opacity = '1';
    rbHeart.style.opacity = '1';

    // Resetar posição do coração ao centro da arena
    rbX = RB_ARENA_W / 2 - RB_HEART_W / 2;
    rbY = RB_ARENA_H / 2 - RB_HEART_H / 2;
    rbHeart.style.left = rbX + 'px';
    rbHeart.style.top  = rbY + 'px';
    rbInvincible = false;
    
    // Mensagem de ataque: status na barra, diálogo no balão
    const rbDodgeMessages = ['* Arabel: Você não vai passar.', '* Arabel: Isso é tudo que você tem?', '* Arabel: Patético.', '* Arabel: Não me decepcione.', '* Arabel: Sinta o peso disso.'];
    rbMessage.innerText = '* Arabel ataca!';
    setTimeout(() => showArabelBubble(rbDodgeMessages[rbAttackIndex % rbDodgeMessages.length]), 300);
    
    // Mostrar frase da Arabel aleatoriamente (adicional)
    if (Math.random() < 0.3) {
        setTimeout(() => showArabelPhrase(), 2000);
    }
    
    rbClearBullets();
    document.removeEventListener('keydown', rbKeyDown);
    document.removeEventListener('keyup', rbKeyUp);
    document.addEventListener('keydown', rbKeyDown);
    document.addEventListener('keyup', rbKeyUp);
    
    // Usar padrão de ataque baseado no índice
    const rbAttackPatterns = [
        (W, H) => { 
            for (let i = 0; i < 18; i++) {
                setTimeout(() => { if (rbPhase==='dodge' && window.arabelActive) spawnBullet(Math.random()*(W-10), -10, (Math.random()-0.5)*1.5, 4.5, 10, 10); }, i*150); 
            }
        },
        (W, H) => { 
            for (let i = 0; i < 8; i++) { 
                setTimeout(() => { 
                    if (rbPhase!=='dodge' || !window.arabelActive) return; 
                    spawnBullet(-10,  i*(H/8)+10, 5, 0, 12, 12); 
                    spawnBullet(W+10, i*(H/8)+10, -5, 0, 12, 12); 
                }, i*150); 
            } 
        },
        (W, H) => { 
            for (let i = 0; i < 15; i++) {
                setTimeout(() => { 
                    if (rbPhase!=='dodge' || !window.arabelActive) return; 
                    const cx = W/2; 
                    const bx = cx + (i-7)*35; 
                    spawnBullet(bx, -10, (bx-cx)/120, 5.5, 8, 8); 
                }, i*80); 
            }
        },
        (W, H) => { 
            for (let i = 0; i < 12; i++) { 
                setTimeout(() => { 
                    if (rbPhase!=='dodge' || !window.arabelActive) return; 
                    if (i%2===0) spawnBullet(-10, Math.random()*H, 5.5, (Math.random()-0.5)*2, 11, 11); 
                    else spawnBullet(W+10, Math.random()*H, -5.5, (Math.random()-0.5)*2, 11, 11); 
                }, i*180); 
            }
        }
    ];

    rbAttackPatterns[rbAttackIndex % rbAttackPatterns.length](RB_ARENA_W, RB_ARENA_H);
    rbAttackIndex++;
    
    clearInterval(rbMoveLoop);
    rbMoveLoop = setInterval(() => {
        if (!window.arabelActive || rbPhase !== 'dodge') return;
        if (rbKeyState[37] || rbKeyState[65]) rbX = Math.max(rbMinX(), rbX - RB_SPEED);
        if (rbKeyState[39] || rbKeyState[68]) rbX = Math.min(rbMaxX(), rbX + RB_SPEED);
        if (rbKeyState[38] || rbKeyState[87]) rbY = Math.max(rbMinY(), rbY - RB_SPEED);
        if (rbKeyState[40] || rbKeyState[83]) rbY = Math.min(rbMaxY(), rbY + RB_SPEED);
        rbHeart.style.left = rbX + 'px';
        rbHeart.style.top = rbY + 'px';
        
        rbBullets = rbBullets.filter(b => {
            b.x += b.vx; b.y += b.vy;
            b.el.style.left = b.x + 'px';
            b.el.style.top = b.y + 'px';
            if (b.x < -20 || b.x > RB_ARENA_W+20 || b.y < -20 || b.y > RB_ARENA_H+20) {
                b.el.remove(); return false;
            }
            if (!rbInvincible && window.arabelActive) {
                const m = 5;
                if (b.x < rbX+RB_HEART_W-m && b.x+b.w > rbX+m && b.y < rbY+RB_HEART_H-m && b.y+b.h > rbY+m) {
                    arabelTakeDamage(18);
                    b.el.remove(); return false;
                }
            }
            return true;
        });
    }, 16);
    
    const attackDurations = [2700, 1800, 2600, 2700];
    const duration = attackDurations[(rbAttackIndex - 1) % attackDurations.length];
    
    setTimeout(() => {
        if (window.arabelActive && rbPhase === 'dodge') arabelPlayerPhase();
    }, duration);
}

function arabelTakeDamage(amount) {
    if (!window.arabelActive) {
        return;
    }
    
    // Reduzir HP PRIMEIRO mesmo que esteja invencível
    rbArabelHp = Math.max(0, rbArabelHp - amount);
    
    // Atualizar UI
    const hpFill = document.getElementById('rb-arabel-hp-fill');
    const hpNum = document.getElementById('rb-arabel-hp-num');
    if (hpFill) hpFill.style.width = (rbArabelHp / 100 * 100) + '%';
    if (hpNum) hpNum.innerText = rbArabelHp;
    
    
    // Verificar morte ANTES da invencibilidade
    if (rbArabelHp <= 0) {
        window.arabelActive = false;
        rbPhase = 'none';
        clearInterval(rbMoveLoop);
        rbClearBullets();
        document.removeEventListener('keydown', rbKeyDown);
        document.removeEventListener('keyup', rbKeyUp);

        rbArena.style.display = 'none';
        const actionPanel = document.getElementById('rb-action-panel');
        if (actionPanel) actionPanel.style.display = 'none';
        const timingWrap = document.getElementById('rb-timing-wrap');
        if (timingWrap) timingWrap.style.display = 'none';

        rbMessage.innerText = '★ Arabel foi derrotada!';

        setTimeout(() => {
            if (typeof startArabelToNeroTransition === 'function') {
                startArabelToNeroTransition();
            } else if (window.startNeroBattleSequence) {
                realBattleScreen.style.display = 'flex';
                window.startNeroBattleSequence();
            }
        }, 1500);
        return;
    }
    
    // Agora sim aplicar invencibilidade se não morreu
    if (rbInvincible) {
        return;
    }
    
    sfxFail.currentTime = 0; sfxFail.play().catch(() => {});
    rbInvincible = true;
    rbHeart.style.opacity = '0.25';
    setTimeout(() => {
        rbHeart.style.opacity = '1';
        rbInvincible = false;
    }, 700);
}

function arabelPlayerPhase() {
    if (!window.arabelActive) return;
    clearInterval(rbMoveLoop);
    rbClearBullets();
    rbArena.style.opacity = '0';
    rbHeart.style.opacity = '0';
    rbMessage.innerText = '* Sua vez!';
    rbPhase = 'player';
    
    document.getElementById('rb-action-panel').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('rb-action-panel').classList.add('showing');
    }, 50);
}

function handleArabelFight() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-arabel.js → handleArabelFight()');
    if (!window.arabelActive || rbPhase !== 'player') return;
    sfxConfirmation.currentTime = 0;
    sfxConfirmation.play().catch(() => {});
    
    document.getElementById('rb-action-panel').classList.remove('showing');
    setTimeout(() => {
        document.getElementById('rb-action-panel').style.display = 'none';
        document.getElementById('rb-timing-wrap').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('rb-timing-wrap').classList.add('showing');
        }, 50);
    }, 300);
    
    rbTimingResult.innerText = '';
    rbStartTiming();
}

function handleArabelAct() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-arabel.js → handleArabelAct()');
    if (!window.arabelActive) return;
    sfxConfirmation.currentTime = 0;
    sfxConfirmation.play().catch(() => {});
    
    document.getElementById('rb-action-panel').classList.remove('showing');
    setTimeout(() => {
        document.getElementById('rb-action-panel').style.display = 'none';
    }, 300);
    
    rbMessage.innerText = '* Você provocou Arabel. Ela ficou irritada!';
    
    setTimeout(() => {
        arabelDodgePhase();
    }, 1500);
}

function handleArabelMercy() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-arabel.js → handleArabelMercy()');
    if (!window.arabelActive) return;
    sfxConfirmation.currentTime = 0;
    sfxConfirmation.play().catch(() => {});
    
    document.getElementById('rb-action-panel').classList.remove('showing');
    setTimeout(() => {
        document.getElementById('rb-action-panel').style.display = 'none';
    }, 300);
    
    rbMessage.innerText = '* Arabel não aceita sua misericórdia!';
    
    setTimeout(() => {
        arabelDodgePhase();
    }, 1500);
}
