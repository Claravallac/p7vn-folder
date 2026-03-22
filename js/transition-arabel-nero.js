// Cutscene de transição: Arabel → Nero
function startArabelToNeroTransition() {
    if (typeof updateDebugJS === 'function') updateDebugJS('transition-arabel-nero.js → startArabelToNeroTransition()');    
    // Desativar completamente a batalha da Arabel
    window.arabelActive = false;
    window.rbArabelHp = 0;
    rbActive = false;
    
    // Limpar tudo da Arabel
    clearInterval(rbMoveLoop);
    clearTimeout(rbDodgeTimer);
    if (typeof rbStopTiming === 'function') rbStopTiming();
    if (typeof rbClearBullets === 'function') rbClearBullets();
    document.removeEventListener('keydown', rbKeyDown);
    document.removeEventListener('keyup', rbKeyUp);
    
    // Esconder UI da Arabel
    rbArabelHud.style.display = 'none';
    rbArena.style.display = 'none';
    rbActionPanel.style.display = 'none';
    rbTimingWrap.style.display = 'none';
    rbMessageEl.style.opacity = '0';
    rbEnemyImg.style.opacity = '0';
    document.getElementById('rb-arabel-char').style.opacity = '0';
    document.getElementById('rb-arabel-char').style.pointerEvents = 'none';
    
    // Mensagem grande: Arabel derrotada
    const msg1 = document.createElement('div');
    msg1.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:9500;background:rgba(0,0,0,0.95);';
    const text1 = document.createElement('div');
    text1.style.cssText = 'font-family:VT323,monospace;font-size:48px;color:#fff;text-align:center;opacity:0;transition:opacity 1s;';
    text1.innerText = 'Arabel foi derrotada!';
    msg1.appendChild(text1);
    document.body.appendChild(msg1);
    
    setTimeout(() => { text1.style.opacity = '1'; }, 100);
    
    setTimeout(() => {
        text1.style.opacity = '0';
        
        setTimeout(() => {
            text1.innerText = 'Uma presença sinistra se aproxima...';
            text1.style.opacity = '1';
            
            setTimeout(() => {
                text1.style.opacity = '0';
                
                setTimeout(() => {
                    msg1.remove();
                    
                    // Efeito de flash
                    let flashes = 0;
                    const flashInt = setInterval(() => {
                        realBattleScreen.style.background = flashes % 2 === 0 ? '#1a0020' : '#000';
                        flashes++;
                        if (flashes >= 6) {
                            clearInterval(flashInt);
                            realBattleScreen.style.background = '#000';
                        }
                    }, 120);
                    
                    setTimeout(() => {
                        // Trocar sprite para Nero
                        rbEnemyImg.src = './assets/images/characters/nero_pixel.png';
                        rbEnemyImg.onerror = () => { rbEnemyImg.src = 'https://via.placeholder.com/300x300/000000/FF00FF?text=NERO'; };
                        rbEnemyImg.style.filter = 'grayscale(100%) brightness(200%)';
                        rbEnemyImg.style.opacity = '1';
                        rbEnemyImg.classList.add('nero-enter');
                        rbMessageEl.style.opacity = '1';
                        
                        sfxInitBattle.currentTime = 0;
                        sfxInitBattle.play().catch(() => {});
                        
                        setTimeout(() => {
                            rbMessage.innerText = '* Nero: Interessante.';
                            rbEnemyImg.classList.add('nero-shake');
                            setTimeout(() => rbEnemyImg.classList.remove('nero-shake'), 400);
                            
                            setTimeout(() => {
                                rbMessage.innerText = '* Nero: Você derrotou a Arabel... mas eu sou diferente.';
                                
                                setTimeout(() => {
                                    // Iniciar batalha da Nero (standalone)
                                    realBattleScreen.style.display = 'flex';
                                    if (window.startNeroBattleSequence) {
                                        window.startNeroBattleSequence();
                                    } else {
                                        window.startNeroBattle();
                                    }
                                }, 2000);
                            }, 2000);
                        }, 300);
                    }, 800);
                }, 1000);
            }, 3000);
        }, 1000);
    }, 3000);
}

// Expor função globalmente
window.startArabelToNeroTransition = startArabelToNeroTransition;
