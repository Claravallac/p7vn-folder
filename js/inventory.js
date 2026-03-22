// Sistema de Inventário
const inventory = {
    items: [],
    
    add(item) {
        this.items.push(item);
    },
    
    remove(itemId) {
        const index = this.items.findIndex(i => i.id === itemId);
        if (index !== -1) this.items.splice(index, 1);
    },
    
    has(itemId) {
        return this.items.some(i => i.id === itemId);
    },
    
    get(itemId) {
        return this.items.find(i => i.id === itemId);
    },
    
    clear() {
        this.items = [];
    }
};

// Itens disponíveis
const ITEMS = {
    DEBUG_HEAL: {
        id: 'debug_heal',
        name: '💊 ITEM',
        color: '#00ff88',
        infinite: true,
        use: () => {
            rbHp = RB_MAX_HP;
            rbHpFill.style.width = '100%';
            rbHpNum.innerText = RB_MAX_HP;
            rbMessage.innerText = '* [DEBUG] HP restaurado completamente.';
            rbHpFill.style.background = '#00ff88';
            setTimeout(() => { rbHpFill.style.background = 'yellow'; }, 400);
        }
    },
    BISCOITO: {
        id: 'biscoito',
        name: '🍪 BISCOITO C/ GOIABADA',
        color: '#00ff88',
        use: () => {
            rbActive = false;
            rbPhase = 'cutscene';
            rbActionPanel.style.display = 'none';
            rbArena.style.display = 'none';
            rbHeart.style.opacity = '0';
            document.removeEventListener('keydown', rbKeyDown);
            document.removeEventListener('keyup', rbKeyUp);
            
            const distortedSound = document.getElementById('distorted-sound');
            distortedSound.volume = 0.5;
            distortedSound.play().catch(() => {});
            
            rbMessage.innerText = '* Você ofereceu o Biscoito Cream Cracker com goiabada para Nero.';
            setTimeout(() => {
                rbMessage.innerText = '* Nero: Meu favorito! Como você sabia?';
                setTimeout(() => {
                    rbMessage.innerText = '* Nero comeu o biscoito com goiabada.';
                    setTimeout(() => {
                        rbMessage.innerText = '* Nero: Estava delicioso... mas... eu... o que...?';
                        setTimeout(() => {
                            rbMessage.innerText = '* Nero: Não... você... me envenenou...?';
                            rbNeroHp = 0;
                            rbNeroHpFill.style.width = '0%';
                            rbNeroHpNum.innerText = '0';
                            setTimeout(() => {
                                // === CENA DA VOZ MISTERIOSA ===
                                // Escurecer tudo
                                realBattleScreen.style.transition = 'opacity 1.5s ease';
                                realBattleScreen.style.opacity = '0';
                                
                                // Iniciar creeppy.mp3 abafada com reverb via Web Audio API
                                const creeppyAudio = document.getElementById('creeppy-music');
                                creeppyAudio.volume = 0;
                                creeppyAudio.currentTime = 0;
                                creeppyAudio.play().catch(() => {});
                                
                                let creeppyCtx, creeppySource, creeppyGain, creeppyConvolver;
                                try {
                                    creeppyCtx = new (window.AudioContext || window.webkitAudioContext)();
                                    creeppySource = creeppyCtx.createMediaElementSource(creeppyAudio);
                                    creeppyGain = creeppyCtx.createGain();
                                    creeppyConvolver = creeppyCtx.createConvolver();
                                    
                                    // Criar impulse response falso para reverb abafado
                                    const sampleRate = creeppyCtx.sampleRate;
                                    const length = sampleRate * 3; // 3 segundos de reverb
                                    const impulse = creeppyCtx.createBuffer(2, length, sampleRate);
                                    for (let ch = 0; ch < 2; ch++) {
                                        const data = impulse.getChannelData(ch);
                                        for (let i = 0; i < length; i++) {
                                            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
                                        }
                                    }
                                    creeppyConvolver.buffer = impulse;
                                    
                                    // Filtro low-pass para efeito abafado
                                    const lpFilter = creeppyCtx.createBiquadFilter();
                                    lpFilter.type = 'lowpass';
                                    lpFilter.frequency.value = 800;
                                    lpFilter.Q.value = 0.5;
                                    
                                    // Cadeia: source → lowpass → convolver → gain → output
                                    creeppySource.connect(lpFilter);
                                    lpFilter.connect(creeppyConvolver);
                                    creeppyConvolver.connect(creeppyGain);
                                    // Também sinal direto (dry) abafado
                                    const dryGain = creeppyCtx.createGain();
                                    dryGain.gain.value = 0.4;
                                    lpFilter.connect(dryGain);
                                    dryGain.connect(creeppyGain);
                                    creeppyGain.connect(creeppyCtx.destination);
                                    creeppyGain.gain.value = 0;
                                    creeppyGain.gain.linearRampToValueAtTime(0.35, creeppyCtx.currentTime + 2);
                                } catch(e) {
                                    // Fallback sem Web Audio
                                    creeppyAudio.volume = 0.15;
                                }
                                
                                // Parar música de batalha
                                battleMusic.pause();
                                battleMusic.currentTime = 0;
                                if (distortedSound) { distortedSound.pause(); distortedSound.currentTime = 0; }
                                
                                setTimeout(() => {
                                    realBattleScreen.style.display = 'none';
                                    realBattleScreen.style.opacity = '1';
                                    realBattleScreen.style.transition = '';
                                    
                                    // Tela preta com texto da voz misteriosa
                                    const voiceOverlay = document.createElement('div');
                                    voiceOverlay.id = 'biscoito-voice-overlay';
                                    voiceOverlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;display:flex;align-items:center;justify-content:center;';
                                    const voiceTextEl = document.createElement('div');
                                    voiceTextEl.style.cssText = 'font-family:VT323,monospace;font-size:36px;color:#ff0055;text-shadow:0 0 20px rgba(255,0,85,0.6);text-align:center;line-height:1.8;max-width:700px;opacity:0;transition:opacity 1.5s ease;';
                                    voiceOverlay.appendChild(voiceTextEl);
                                    document.body.appendChild(voiceOverlay);
                                    
                                    // Frase 1
                                    setTimeout(() => {
                                        voiceTextEl.innerText = 'Viu como é simples?';
                                        voiceTextEl.style.opacity = '1';
                                        
                                        setTimeout(() => {
                                            voiceTextEl.style.opacity = '0';
                                            
                                            // Frase 2
                                            setTimeout(() => {
                                                voiceTextEl.innerText = 'Basta envenenar e tudo se resolve.';
                                                voiceTextEl.style.opacity = '1';
                                                
                                                setTimeout(() => {
                                                    voiceTextEl.style.opacity = '0';
                                                    
                                                    setTimeout(() => {
                                                        // Parar creeppy e limpar
                                                        creeppyAudio.pause();
                                                        creeppyAudio.currentTime = 0;
                                                        if (creeppyCtx && creeppyCtx.state !== 'closed') {
                                                            try { creeppyCtx.close(); } catch(e) {}
                                                        }
                                                        voiceOverlay.remove();
                                                        
                                                        // Iniciar ending 9999
                                                        startEnding9999();
                                                    }, 1500);
                                                }, 3500);
                                            }, 1000);
                                        }, 3500);
                                    }, 500);
                                }, 2000);
                            }, 3000);
                        }, 3000);
                    }, 3000);
                }, 3000);
            }, 3000);
        }
    }
};

function showInventoryMenu() {
    if (typeof updateDebugJS === 'function') updateDebugJS('inventory.js → showInventoryMenu()');
    if (inventory.items.length === 0) {
        rbMessage.innerText = '* Você não tem itens.';
        setTimeout(() => rbStartPlayerPhase(), 1200);
        return;
    }
    
    rbActionPanel.classList.remove('showing');
    setTimeout(() => {
        rbActionPanel.style.display = 'none';
        const panel = document.getElementById('rb-inventory-panel');
        panel.innerHTML = '';
        
        inventory.items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'rb-action-btn';
            btn.style.borderColor = item.color;
            btn.style.color = item.color;
            btn.textContent = item.name;
            btn.onclick = () => useItem(item.id);
            panel.appendChild(btn);
        });
        
        const backBtn = document.createElement('button');
        backBtn.className = 'rb-action-btn';
        backBtn.textContent = '← VOLTAR';
        backBtn.onclick = () => {
            panel.style.display = 'none';
            rbStartPlayerPhase();
        };
        panel.appendChild(backBtn);
        
        panel.style.display = 'flex';
        requestAnimationFrame(() => {
            panel.classList.add('showing');
        });
    }, 300);
}

function useItem(itemId) {
    if (typeof updateDebugJS === 'function') updateDebugJS('inventory.js → useItem()');
    const item = inventory.get(itemId);
    if (!item) return;
    
    rbUsedItemThisTurn = true;
    
    sfxConfirmation.currentTime = 0;
    sfxConfirmation.play().catch(() => {});
    
    const panel = document.getElementById('rb-inventory-panel');
    panel.classList.remove('showing');
    setTimeout(() => {
        panel.style.display = 'none';
    }, 300);
    
    rbTimingWrap.classList.remove('showing');
    setTimeout(() => {
        rbTimingWrap.style.display = 'none';
    }, 300);
    
    if (!item.infinite) {
        inventory.remove(itemId);
    }
    
    item.use();
    
    if (rbPhase !== 'cutscene') {
        setTimeout(() => {
            if (rbActive) rbStartPlayerPhase();
        }, 1200);
    }
}
