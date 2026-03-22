// Batalha Nero - variáveis globais
// rbNeroHp, rbFightingNero, etc. são declarados com let em battle-core.js
// Nota: rbFightingNero, rbNeroPhase2, etc. são declarados com let em battle-core.js
// Usar atribuição direta (sem window.) para modificar as variáveis corretas

// Expor funções ao escopo global
window.startNeroBattle = function() {
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-nero.js → startNeroBattle()');
    window.arabelActive = false;
    rbArabelHp = 0;
    
    // Restaurar elementos de batalha
    rbArena.style.display = 'block';
    rbActionPanel.style.display = 'none';
    rbTimingWrap.style.display = 'none';
    
    // Configurar HUD e variáveis da Nero
    rbNeroHud.style.display = 'flex';
    rbNeroHpFill.style.width = '100%';
    rbNeroHpFill.style.background = '#aa00ff';
    rbNeroHpNum.innerText = RB_NERO_MAX_HP;
    rbNeroHp = RB_NERO_MAX_HP;
    rbNeroPhase2 = false;
    rbFightingNero = true;
    rbShowNeroPortrait(true);
    rbNeroChar.style.opacity = '1';
    // Esconder completamente tudo da Arabel
    rbEnemyImg.style.opacity = '0';
    rbEnemyImg.style.pointerEvents = 'none';
    document.getElementById('rb-arabel-char').style.opacity = '0';
    document.getElementById('rb-arabel-char').style.pointerEvents = 'none';
    document.getElementById('nero-aura').style.display = 'block';
    rbNeroTurns = 0;
    rbEnemyImg.classList.remove('nero-enter');
    
    // Resetar estado do jogador
    rbActive = true;
    rbAttackIndex = 0;
    rbHp = RB_MAX_HP;
    rbHpFill.style.width = '100%';
    rbHpNum.innerText = RB_MAX_HP;
    rbInvincible = false;
    rbKeyState = {};
    rbMercyCount = 0;
    rbMercyUnlocked = false;
    document.removeEventListener('keydown', rbKeyDown);
    document.removeEventListener('keyup', rbKeyUp);
    document.addEventListener('keydown', rbKeyDown);
    document.addEventListener('keyup', rbKeyUp);
    rbTimingResult.innerText = '';
    
    setTimeout(() => {
        rbNeroHud.classList.add('showing');
        rbMessage.innerText = '* Nero: Vamos começar.';
        setTimeout(() => {
            rbStartPlayerPhase();
        }, 2000);
    }, 600);
};

window.handleNeroMercy = function() {
    
    if (typeof updateDebugJS === 'function') updateDebugJS('battle-nero.js → handleNeroMercy()');
    if (!rbFightingNero) return false;
    if (!rbMercyUnlocked) {
        rbPhase = 'transitioning';
        rbTransitioning = true;
        sfxConfirmation.currentTime = 0; 
        sfxConfirmation.play().catch(() => {});
        rbMessage.innerText = '* Nero: Misericórdia? Você ainda não me derrotou.';
        rbActionPanel.style.display = 'none';
        setTimeout(() => { 
            rbTransitioning = false; 
            if (rbActive) rbStartDodgePhase(); 
        }, 1200);
        return true;
    }
    
    rbMercyCount++;
    rbPhase = 'transitioning';
    rbTransitioning = true;
    sfxConfirmation.currentTime = 0; sfxConfirmation.play().catch(() => {});
    rbActionPanel.style.display = 'none';
    
    const mercyMessages = [
        '* Nero: Você quer me poupar agora, é? Que engraçado.',
        '* Nero: Você acha que eu realmente vou esquecer de tudo o que aconteceu?',
        '* Nero: Não tem mais volta, Abbyl.'
    ];
    
    if (rbMercyCount <= 3) {
        rbMessage.innerText = mercyMessages[rbMercyCount - 1];
        setTimeout(() => { 
            rbTransitioning = false; 
            rbPhase = 'player';
            if (rbActive) rbStartPlayerPhase(); 
        }, 3000);
    } else if (rbMercyCount === 4) {
        rbMessage.innerText = '* Nero: ...';
        rbActive = false;
        rbPhase = 'cutscene';
        
        setTimeout(() => {
            rbEnemyImg.style.opacity = '0';
            rbNeroChar.style.opacity = '0';
            document.getElementById('nero-aura').style.opacity = '0';
            rbHud.style.opacity = '0';
            rbNeroHud.style.opacity = '0';
            rbMessageEl.style.opacity = '0';
            
            const windSound = document.getElementById('wind-sound');
            battleMusic.volume = 0;
            setTimeout(() => { battleMusic.pause(); }, 500);
            windSound.volume = 0.4;
            windSound.play().catch(() => {});
            
            realBattleScreen.style.background = '#000';
            
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
                        windSound.pause();
                        windSound.currentTime = 0;
                        
                        inventory.add(ITEMS.BISCOITO);
                        
                        rbEnemyImg.style.opacity = '1';
                        rbNeroChar.style.opacity = '1';
                        document.getElementById('nero-aura').style.opacity = '1';
                        rbHud.style.opacity = '1';
                        rbNeroHud.style.opacity = '1';
                        rbMessageEl.style.opacity = '1';
                        realBattleScreen.style.background = '#000';
                        
                        battleMusic.volume = 0.3;
                        battleMusic.play().catch(() => {});
                        
                        rbMessage.innerText = '* Você recebeu: Biscoito com Goiabada';
                        rbActive = true;
                        rbPhase = 'player';
                        rbTransitioning = false;
                        
                        setTimeout(() => {
                            rbStartPlayerPhase();
                        }, 1500);
                    }, 1000);
                }, 4000);
            }, 1000);
        }, 1000);
    }
    
    return true;
};
