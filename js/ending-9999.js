// Final 9999 - Abbyl caminhando
function startEnding9999() {
    battleMusic.pause();
    battleMusic.currentTime = 0;
    
    // Garantir que creeppy parou
    const creeppyEl = document.getElementById('creeppy-music');
    if (creeppyEl) { creeppyEl.pause(); creeppyEl.currentTime = 0; }
    // Remover overlay se ainda existir
    const voiceOvl = document.getElementById('biscoito-voice-overlay');
    if (voiceOvl) voiceOvl.remove();
    
    const windSound = document.getElementById('wind-sound');
    windSound.volume = 0.2;
    windSound.play().catch(() => {});
    
    const walkSound = document.getElementById('walking-sound');
    walkSound.volume = 0.3;
    
    realBattleScreen.style.display = 'none';
    rbMessage.innerText = '';
    
    const screen = document.getElementById('ending-9999');
    screen.style.display = 'flex';

    const sp = document.getElementById('abbyl-sprite');
    const th = document.getElementById('abbyl-thought');
    const wr = document.getElementById('abbyl-world');

    // Resetar sprite caso venha de uma transição anterior
    sp.style.cssText = '';
    sp.style.position = 'absolute';
    sp.style.bottom   = '60px';
    sp.style.top      = 'auto';
    if (sp.parentElement !== wr) wr.appendChild(sp);

    // Limpar glitch-bg de execução anterior
    const oldGlitch = document.getElementById('abbyl-glitch-bg');
    if (oldGlitch) oldGlitch.remove();

    // Criar pixels corrompidos piscando
    const glitchBg = document.createElement('div');
    glitchBg.id = 'abbyl-glitch-bg';
    glitchBg.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;';
    wr.appendChild(glitchBg);

    for (let i = 0; i < 150; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'glitch-pixel';
        pixel.style.left = Math.random() * 100 + '%';
        pixel.style.top = Math.random() * 100 + '%';
        pixel.style.animationDelay = Math.random() * 2 + 's';
        pixel.style.animationDuration = (0.1 + Math.random() * 0.3) + 's';
        glitchBg.appendChild(pixel);
    }

    const TOTAL_FRAMES = 16;
    let frameIndex = 0;
    const frameW = 130;
    const frameH = 263;

    sp.style.width = frameW + 'px';
    sp.style.height = frameH + 'px';
    sp.style.display = 'block';

    let ax = (wr.offsetWidth || window.innerWidth) / 2 - frameW / 2;
    let facing = 1, walkDir = 0, walkF = 0, walkT = 0;
    const WSPD = 2.5, ARATE = 8;
    let parallaxOffset = 0;
    let blurAmount = 0;
    sp.style.left = ax + 'px';

    const thoughts = [
        { text: 'Onde eu estou?', sprite: 'abbyl-assustado.png' },
        { text: 'Isso não parece real.', sprite: 'abbyl pensativo.png' },
        { text: 'Por que tudo ficou tão escuro?', sprite: 'abbyl-triste.png' },
        { text: 'Eu só queria entender.', sprite: 'abbyl pensativo.png' },
        { text: 'Tem alguém aqui?', sprite: 'abbyl-assustado.png' },
        { text: 'Que lugar é esse?', sprite: 'abbyl-neutro.png' },
        { text: 'Eu não devia estar aqui.', sprite: 'abbyl-triste.png' },
        { text: 'Voltar... mas como?', sprite: 'abbyl pensativo.png' },
        { text: 'O que aconteceu comigo?', sprite: 'abbyl-assustado.png' },
        { text: 'Sinto que alguém me observa.', sprite: 'abbyl-assustado.png' },
        { text: 'Tem algum caminho daqui?', sprite: 'abbyl-neutro.png' },
        { text: 'Nero... por que fez isso?', sprite: 'abbyl-bravo.png' },
        { text: 'Eu confiei nela...', sprite: 'abbyl-triste.png' },
        { text: 'Será que alguém vai me encontrar?', sprite: 'abbyl pensativo.png' },
        { text: 'Preciso sair daqui.', sprite: 'abbyl-bravo.png' }
    ];
    let ti = 0, ton = false, ttick = 0;
    const abbylTextAudio = document.getElementById('abbyl-text');
    let typingInterval = null;

    function showT() {
        const current = thoughts[ti % thoughts.length];
        const fullText = current.text;
        
        th.innerHTML = `<img src="./assets/images/characters/head/${current.sprite}"><span id="abbyl-thought-text"></span>`;
        th.style.opacity = '1';
        
        const textSpan = document.getElementById('abbyl-thought-text');
        let charIndex = 0;
        
        clearInterval(typingInterval);
        typingInterval = setInterval(() => {
            if (charIndex < fullText.length) {
                textSpan.textContent += fullText[charIndex];
                abbylTextAudio.currentTime = 0;
                abbylTextAudio.play().catch(() => {});
                charIndex++;
            } else {
                clearInterval(typingInterval);
            }
        }, 50);
        
        ti++;
        ton = true;
        ttick = 220;
    }
    setTimeout(showT, 2000);

    function setFrame(idx) {
        frameIndex = idx % TOTAL_FRAMES;
        const frameNum = String(frameIndex).padStart(3, '0');
        sp.src = './assets/images/characters/sprite-frames/frame_' + frameNum + '.png';
    }

    const keys = {};
    function kd(e) { keys[e.key] = true; }
    function ku(e) { keys[e.key] = false; }
    document.addEventListener('keydown', kd);
    document.addEventListener('keyup', ku);

    const loop = setInterval(function() {
        if (!document.getElementById('ending-9999') || document.getElementById('ending-9999').style.display === 'none') {
            clearInterval(loop);
            document.removeEventListener('keydown', kd);
            document.removeEventListener('keyup', ku);
            windSound.pause();
            windSound.currentTime = 0;
            walkSound.pause();
            walkSound.currentTime = 0;
            return;
        }

        const ww = wr.offsetWidth || window.innerWidth;
        const gL = keys['ArrowLeft'] || keys['a'] || keys['A'];
        const gR = keys['ArrowRight'] || keys['d'] || keys['D'];

        walkDir = 0;
        if (gL) { ax = Math.max(0, ax - WSPD); walkDir = -1; facing = -1; parallaxOffset += WSPD * 0.3; }
        if (gR) { ax = Math.min(ww - frameW, ax + WSPD); walkDir = 1; facing = 1; parallaxOffset -= WSPD * 0.3; }

        sp.style.left = ax + 'px';
        sp.style.transform = 'scaleX(' + facing + ')';
        document.getElementById('ending-9999-header').style.transform = 'translateX(' + parallaxOffset + 'px)';

        if (walkDir !== 0) {
            blurAmount = Math.min(blurAmount + 0.2, 3);
            sp.style.filter = 'blur(' + blurAmount + 'px) brightness(0.7)';
            if (walkSound.paused) walkSound.play().catch(() => {});
            walkT++;
            if (walkT >= ARATE) {
                walkT = 0;
                walkF++;
                setFrame(walkF);
            }
        } else {
            blurAmount = Math.max(blurAmount - 0.3, 0);
            sp.style.filter = 'blur(' + blurAmount + 'px) brightness(' + (0.7 + blurAmount * 0.1) + ')';
            walkSound.pause();
            walkF = 0;
            walkT = 0;
            setFrame(0);
        }

        if (ttick > 0) {
            ttick--;
            if (ttick === 0) {
                if (ton) { th.style.opacity = '0'; ton = false; ttick = 160; }
                else { showT(); }
            }
        }
    }, 16);

    // Após 1 minuto, voz misteriosa aparece
    const voiceTrigger = () => {
        clearInterval(loop);
        document.removeEventListener('keydown', kd);
        document.removeEventListener('keyup', ku);
        windSound.pause();
        walkSound.pause();

        th.style.opacity = '0';
        sp.style.filter = 'blur(0px) brightness(0.7)';

        // --- Painel da voz misteriosa ---
        const voiceDiv = document.createElement('div');
        voiceDiv.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:9500;background:rgba(0,0,0,0.92);';
        const voiceText = document.createElement('div');
        voiceText.style.cssText = 'font-family:VT323,monospace;font-size:42px;color:#fff;text-align:center;line-height:1.8;max-width:800px;opacity:0;transition:opacity 1s;white-space:pre-line;';
        voiceText.innerText = '???\n\nAinda sobrou um pouquinho, vamos, coma também';
        voiceDiv.appendChild(voiceText);
        document.body.appendChild(voiceDiv);

        setTimeout(() => { voiceText.style.opacity = '1'; }, 100);

        // Após 4s a voz some, transição começa
        setTimeout(() => {
            voiceText.style.opacity = '0';
            setTimeout(() => {
                voiceDiv.remove();
                _iniciarTransicaoBatalha();
            }, 1000);
        }, 4000);
    };

    function _iniciarTransicaoBatalha() {
        const fadeOverlay = document.getElementById('fade-overlay');
        const battleIntro = document.getElementById('battle-intro');
        const introHeart  = document.getElementById('intro-heart');
        const realBS      = document.getElementById('real-battle-screen');

        // 1) Capturar posição atual do sprite na tela ANTES de qualquer mudança
        const spRect = sp.getBoundingClientRect();
        const spStartX = spRect.left;
        const spStartY = spRect.top;

        // 2) Promover sprite para fixed no mesmo lugar visual (acima do fade)
        setFrame(0);
        sp.style.cssText = [
            'display:block',
            'position:fixed',
            'width:'  + frameW + 'px',
            'height:' + frameH + 'px',
            'left:'   + spStartX + 'px',
            'top:'    + spStartY + 'px',
            'transform:scaleX(' + facing + ')',
            'filter:brightness(1)',
            'z-index:10000',
            'transition:none',
            'image-rendering:pixelated',
        ].join(';');
        document.body.appendChild(sp);
        screen.style.display = 'none';

        // 3) Click + fade para preto — sprite permanece visível por cima
        try { var clk = new Audio('./assets/audio/click.mp3'); clk.play().catch(()=>{}); } catch(e){}
        fadeOverlay.style.transition = 'opacity 0.6s ease';
        fadeOverlay.style.opacity    = '1';
        fadeOverlay.style.zIndex     = '9998';

        // 4) Quando fade terminar: mostrar battle screen por trás, posicionar cursor
        setTimeout(() => {
            realBS.style.opacity = '0';
            realBS.style.display = 'flex';

            // Cursor aparece sobre o sprite na posição original
            battleIntro.style.display = 'block';
            introHeart.style.cssText = [
                'opacity:0',
                'transition:none',
                'z-index:10001',
                'left:' + (spStartX + frameW / 2) + 'px',
                'top:'  + (spStartY + frameH / 2) + 'px',
            ].join(';');

            setTimeout(() => {
                // 5) Som + cursor pisca sobre o sprite
                try {
                    const sfx = document.getElementById('sfx-initbattle');
                    sfx.currentTime = 0;
                    sfx.play().catch(() => {});
                } catch(e) {}

                let blinkCount = 0;
                const blinkInterval = setInterval(() => {
                    introHeart.style.opacity = introHeart.style.opacity === '1' ? '0' : '1';
                    blinkCount++;
                    if (blinkCount >= 6) {
                        clearInterval(blinkInterval);
                        introHeart.style.opacity = '1';

                        // 6) Cursor arrasta sprite da posição original até o topo (área do inimigo)
                        const targetX = window.innerWidth  / 2 - frameW / 2;
                        const targetY = window.innerHeight * 0.08;

                        sp.style.transition         = 'left 0.6s cubic-bezier(.4,0,.2,1), top 0.6s cubic-bezier(.4,0,.2,1)';
                        introHeart.style.transition = 'left 0.6s cubic-bezier(.4,0,.2,1), top 0.6s cubic-bezier(.4,0,.2,1), opacity 0.3s';

                        requestAnimationFrame(() => {
                            sp.style.left         = targetX + 'px';
                            sp.style.top          = targetY + 'px';
                            introHeart.style.left = (targetX + frameW / 2) + 'px';
                            introHeart.style.top  = (targetY + frameH / 2) + 'px';
                        });

                        // 7) Revelar tela de batalha
                        setTimeout(() => {
                            realBS.style.transition      = 'opacity 0.5s ease';
                            realBS.style.opacity         = '1';
                            fadeOverlay.style.transition = 'opacity 0.5s ease';
                            fadeOverlay.style.opacity    = '0';

                            // intro-heart some (não precisamos mais dele)
                            introHeart.style.opacity  = '0';
                            battleIntro.style.display = 'none';

                            const rbHudEl   = document.getElementById('rb-hud');
                            const rbArenaEl = document.getElementById('rb-arena');
                            const rbMsgEl   = document.getElementById('rb-message');
                            const rbHeartEl = document.getElementById('rb-heart');

                            // Arena pequena e quadrada
                            rbArenaEl.style.width    = '150px';
                            rbArenaEl.style.height   = '150px';
                            rbArenaEl.style.position = 'relative';

                            // Centralizar rb-heart (e esconder de inicio)
                            rbHeartEl.style.left    = '64px';  // (150-22)/2
                            rbHeartEl.style.top     = '64px';
                            rbHeartEl.style.opacity = '0';

                            rbHudEl.style.display = 'flex';
                            rbHudEl.classList.add('showing');
                            rbArenaEl.style.display = 'flex';
                            rbArenaEl.classList.add('showing');
                            rbMsgEl.style.opacity = '1';
                            rbMsgEl.innerText = '* Você não pode atacar a si mesmo.';

                            // 8) Cursor aparece na arena
                            setTimeout(() => {
                                rbHeartEl.style.transition = 'opacity 0.3s';
                                rbHeartEl.style.opacity    = '1';

                                // 9) Bolas surgem nas bordas e rodeiam o cursor
                                const NUM_BALLS = 12;
                                const cx = 75, cy = 75; // centro da arena
                                const balls = [];
                                for (let bi = 0; bi < NUM_BALLS; bi++) {
                                    const angle  = (bi / NUM_BALLS) * Math.PI * 2;
                                    const orbitR = 55; // raio de espera
                                    const bx = cx + Math.cos(angle) * orbitR - 5;
                                    const by = cy + Math.sin(angle) * orbitR - 5;
                                    const ball = document.createElement('div');
                                    ball.className = 'rb-bullet';
                                    ball.style.cssText = [
                                        'width:10px', 'height:10px',
                                        'background:white',
                                        'left:' + bx + 'px',
                                        'top:'  + by + 'px',
                                        'opacity:0',
                                        'position:absolute',
                                        'transition:opacity 0.2s, left 0.35s ease-in, top 0.35s ease-in',
                                    ].join(';');
                                    rbArenaEl.appendChild(ball);
                                    balls.push({ el: ball, angle });
                                    // Aparecer em cascata
                                    setTimeout(() => { ball.style.opacity = '1'; }, bi * 60);
                                }

                                // 10) Depois de aparecerem todas → convergem no cursor
                                setTimeout(() => {
                                    balls.forEach(b => {
                                        b.el.style.left = (cx - 5) + 'px';
                                        b.el.style.top  = (cy - 5) + 'px';
                                    });

                                    // 11) Impacto: flash + shake + dano + cleanup
                                    setTimeout(() => {
                                        try { var dmgSfx=new Audio('./assets/audio/fail.mp3'); dmgSfx.volume=0.8; dmgSfx.play().catch(()=>{}); } catch(e){}

                                        balls.forEach(b => { b.el.style.opacity='0'; setTimeout(()=>b.el.remove(),400); });

                                        const flash = document.createElement('div');
                                        flash.style.cssText = 'position:fixed;inset:0;background:#ff2020;opacity:0;z-index:10002;pointer-events:none;transition:opacity 0.05s;';
                                        document.body.appendChild(flash);
                                        requestAnimationFrame(() => { flash.style.opacity = '0.5'; });

                                        // Sprite treme
                                        var origL = parseFloat(sp.style.left);
                                        sp.style.transition = 'none';
                                        [[-10],[10],[-7],[7],[0]].forEach(function(arr,i){
                                            setTimeout(function(){ sp.style.left=(origL+arr[0])+'px'; }, i*70);
                                        });

                                        // rb-heart pisca vermelho
                                        rbHeartEl.style.filter = 'hue-rotate(0deg) brightness(3)';
                                        setTimeout(()=>{ rbHeartEl.style.filter=''; }, 500);

                                        // HP cai para 1
                                        setTimeout(function(){
                                            var hpFill = document.getElementById('rb-hp-fill');
                                            var hpNum  = document.getElementById('rb-hp-num');
                                            if(hpFill) hpFill.style.width = (1/92*100).toFixed(2) + '%';
                                            if(hpNum)  hpNum.textContent = '1';
                                        }, 80);

                                        // Flash some
                                        setTimeout(function(){
                                            flash.style.transition = 'opacity 0.3s';
                                            flash.style.opacity    = '0';
                                            setTimeout(function(){ flash.remove(); }, 400);
                                        }, 300);

                                        // Arena some, iniciar batalha
                                        setTimeout(function(){
                                            rbArenaEl.classList.remove('showing');
                                            rbArenaEl.style.display = 'none';
                                            // Resetar arena para tamanho original
                                            rbArenaEl.style.width  = '';
                                            rbArenaEl.style.height = '';
                                            rbHeartEl.style.opacity = '0';
                                            setTimeout(function(){ startAbbylBattle(); }, 400);
                                        }, 1200);
                                    }, 400);
                                }, NUM_BALLS * 60 + 400);
                            }, 600);
                        }, 700);
                    }
                }, 130);
            }, 150);
        }, 700);
    }
    
    window._abbylVoiceTrigger = voiceTrigger;
    setTimeout(voiceTrigger, 60000);

    window._abbylLoop = loop;
    window._abbylKD = kd;
    window._abbylKU = ku;
}

function startAbbylBattle() {
    const realBattleScreen = document.getElementById('real-battle-screen');
    const rbActionPanel = document.getElementById('rb-action-panel');
    const rbMessage = document.getElementById('rb-message');
    const rbEnemyImg = document.getElementById('rb-enemy-img');
    const rbArena = document.getElementById('rb-arena');
    const rbHud = document.getElementById('rb-hud');
    const sp = document.getElementById('abbyl-sprite');
    
    // Esconder tudo exceto HUD do jogador (HP já em 1)
    rbArena.style.display = 'none';
    rbHud.style.display = 'flex';
    rbHud.classList.add('showing');
    document.getElementById('rb-nero-hud').style.display = 'none';
    document.getElementById('rb-arabel-hud').style.display = 'none';
    document.getElementById('rb-timing-wrap').style.display = 'none';
    rbEnemyImg.style.display = 'none';
    rbEnemyImg.style.opacity = '0';
    rbEnemyImg.style.visibility = 'hidden';
    const enemyContainer = document.getElementById('rb-enemy-section');
    if (enemyContainer) {
        enemyContainer.style.opacity = '0';
        enemyContainer.style.visibility = 'hidden';
    }
    document.getElementById('rb-message').style.opacity = '1';
    
    // Manter sprite visível
    sp.style.display = 'block';
    sp.style.filter = 'grayscale(100%) brightness(200%)';
    
    // Mostrar UI
    rbMessage.innerText = '* ...';
    document.getElementById('rb-message').classList.add('showing');
    
    // Esconder todos os botões exceto ITEM
    document.getElementById('rb-btn-fight').style.display = 'none';
    document.getElementById('rb-btn-act').style.display = 'none';
    document.getElementById('rb-btn-mercy').style.display = 'none';
    document.getElementById('rb-btn-item').style.display = 'block';
    
    rbActionPanel.style.display = 'flex';
    rbActionPanel.classList.add('showing');
    
    // Ao clicar em ITEM, mostrar apenas biscoito
    document.getElementById('rb-btn-item').onclick = () => {
        const invPanel = document.getElementById('rb-inventory-panel');
        invPanel.innerHTML = '';
        
        const biscoitoBtn = document.createElement('button');
        biscoitoBtn.className = 'rb-action-btn';
        biscoitoBtn.innerText = '🍪 BISCOITO C/ GOIABADA';
        biscoitoBtn.style.borderColor = '#00ff88';
        biscoitoBtn.style.color = '#00ff88';
        
        biscoitoBtn.onclick = () => {
            rbActionPanel.style.display = 'none';
            invPanel.style.display = 'none';
            
            rbMessage.innerText = '* Você comeu o Biscoito com Goiabada.';
            
            setTimeout(() => {
                rbMessage.innerText = '* ...';
                setTimeout(() => {
                    rbMessage.innerText = '* Você sente algo estranho...';
                    setTimeout(() => {
                        // Fade to black
                        const fadeOverlay = document.getElementById('fade-overlay');
                        fadeOverlay.style.opacity = '1';
                        
                        setTimeout(() => {
                            realBattleScreen.style.display = 'none';
                            sp.style.display = 'none';

                            // Tela do Final Nulo
                            const endScreen = document.createElement('div');
                            endScreen.style.cssText = [
                                'position:fixed', 'inset:0', 'display:flex',
                                'flex-direction:column', 'align-items:center', 'justify-content:center',
                                'background:#000', 'z-index:10005',
                                'opacity:0', 'transition:opacity 1.2s ease',
                                'gap:24px',
                            ].join(';');

                            const title = document.createElement('div');
                            title.style.cssText = 'font-family:VT323,monospace;font-size:64px;color:#fff;letter-spacing:4px;opacity:0;transition:opacity 1s ease 0.4s;';
                            title.innerText = 'Final Nulo';

                            const subtitle = document.createElement('div');
                            subtitle.style.cssText = 'font-family:VT323,monospace;font-size:28px;color:#888;letter-spacing:2px;opacity:0;transition:opacity 1s ease 0.9s;';
                            subtitle.innerText = 'Envenene todos, é o caminho mais simples.';

                            endScreen.appendChild(title);
                            endScreen.appendChild(subtitle);
                            document.body.appendChild(endScreen);

                            fadeOverlay.style.opacity = '0';
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    endScreen.style.opacity = '1';
                                    title.style.opacity    = '1';
                                    subtitle.style.opacity = '1';
                                });
                            });
                        }, 2000);
                    }, 2000);
                }, 2000);
            }, 2000);
        };
        
        invPanel.appendChild(biscoitoBtn);
        rbActionPanel.style.display = 'none';
        invPanel.style.display = 'flex';
        invPanel.classList.add('showing');
    };
}
