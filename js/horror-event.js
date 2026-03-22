// ============================================================
//  HORROR EVENT SYSTEM
//  Ativa aleatoriamente (chance baixa) ao iniciar o game,
//  ou forçado pelo código "horror" no menu.
// ============================================================

(function() {

    // ── CONFIG ─────────────────────────────────────────────
    var CHANCE = 0.008;         // 0.8% de chance ao iniciar (era 4% — agora evento raro)
    var CODIGO_ATIVO = false;   // ativado pelo código "horror"
    var horrorBuffer = '';

    var DIALOGOS = [
        { text: 'Ele está de olho em você.' },
        { text: 'Você não deveria estar aqui.' },
        { text: 'Cuidado ao apertar algumas teclas rapidamente em locais que não deve.' },
        { text: 'Você deveria sentir medo.' },
        { text: 'Saia do game agora.' },
        { text: 'Eu sei onde você está.' },
        { text: '...' },
        { text: 'Ainda está aí?' },
        { text: 'Por que você continua jogando?' },
    ];

    // Diálogos específicos para quando o horror é acionado por repetição de capítulo.
    // São mais diretos — a entidade sabe que o player está repetindo deliberadamente.
    var DIALOGOS_REPETICAO = [
        { text: 'Você já esteve aqui antes.' },
        { text: 'Por que você volta sempre?' },
        { text: 'Eles não querem repetir isso.' },
        { text: 'Você acha que não percebo quando fazem isso?' },
        { text: 'Deixa eles seguirem em frente.' },
        { text: 'Cada vez que você repete, algo muda.' },
        { text: 'Eles lembram. Mesmo que você ache que não.' },
        { text: '...você ainda não entendeu, entendeu?' },
        { text: 'Quanto mais você repete, menos restará.' },
        { text: 'Isso já aconteceu antes. Exatamente assim.' },
        { text: 'Você não é o primeiro a fazer isso.' },
        { text: 'Eles sorriem do mesmo jeito toda vez.' },
        { text: 'Você percebe que as palavras são sempre as mesmas?' },
        { text: 'Cada loop apaga um pouco mais.' },
        { text: 'A memória deles tem um limite. O seu também.' },
        { text: 'Você já ouviu essa frase antes. Não ouviu?' },
        { text: 'Eles não sabem que estão presos. Você sabe.' },
        { text: 'Quantas vezes você vai precisar ver isso?' },
        { text: 'Tem algo diferente dessa vez. Você notou?' },
        { text: 'Continuar não vai mudar o que já aconteceu.' },
        { text: 'Eles estão cansados. Mesmo que não mostrem.' },
        { text: 'O final é sempre o mesmo. Por que insiste?' },
        { text: 'Você está procurando algo que não está aqui.' },
        { text: 'Cada repetição tem um custo. Você não vê, mas eu vejo.' },
        { text: 'Isso vai se repetir até você entender. Ou até não restar mais nada.' },
    ];

    // ── CSS ─────────────────────────────────────────────────
    var style = document.createElement('style');
    style.textContent = `
        #horror-overlay {
            position: fixed;
            inset: 0;
            z-index: 99000;
            display: none;
            pointer-events: none;
        }

        #horror-bg-distorted {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0;
            transition: opacity 0.6s ease;
            filter: saturate(0) brightness(0.3);
        }

        #horror-scanlines {
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(
                0deg,
                rgba(0,0,0,0.18) 0px,
                rgba(0,0,0,0.18) 1px,
                transparent 1px,
                transparent 3px
            );
            pointer-events: none;
        }

        #horror-glitch-layer {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }

        #horror-dialogue-box {
            position: absolute;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%);
            width: min(700px, 90vw);
            background: rgba(0, 0, 0, 0.92);
            border-top: 2px solid #ff0000;
            padding: 18px 48px 22px 80px;
            font-size: clamp(14px, 1.8vw, 20px);
            line-height: 1.65;
            min-height: 90px;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        }

        #horror-speaker-box {
            position: absolute;
            top: -28px;
            left: 5px;
            background: #ff0000;
            color: #000;
            padding: 4px 20px 4px 12px;
            clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%);
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 3px;
            text-transform: uppercase;
        }

        #horror-accent-bar {
            position: absolute;
            left: 0; top: 0; bottom: 0;
            width: 5px;
            background: #ff0000;
            box-shadow: 0 0 14px rgba(255,0,0,0.8);
        }

        #horror-text {
            color: #cc0000;
            font-family: 'VT323', monospace;
            font-size: clamp(18px, 2.2vw, 26px);
            letter-spacing: 1px;
        }

        #horror-cursor {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #ff0000;
            margin-left: 4px;
            vertical-align: middle;
            animation: horrorBlink 0.5s infinite;
        }

        @keyframes horrorBlink {
            0%,49%{opacity:1} 50%,100%{opacity:0}
        }

        @keyframes horrorGlitch {
            0%{clip-path:inset(0 0 100% 0);transform:translate(0)}
            8%{clip-path:inset(10% 0 80% 0);transform:translate(-3px,0)}
            15%{clip-path:inset(50% 0 20% 0);transform:translate(3px,0)}
            22%{clip-path:inset(30% 0 60% 0);transform:translate(0)}
            30%{clip-path:inset(70% 0 5% 0);transform:translate(-4px,1px)}
            38%{clip-path:inset(20% 0 70% 0);transform:translate(2px,-1px)}
            45%{clip-path:inset(0 0 0 0);transform:translate(0)}
            52%{clip-path:inset(40% 0 40% 0);transform:translate(-2px,0)}
            60%{clip-path:inset(0 0 0 0);transform:translate(0)}
            100%{clip-path:inset(0 0 0 0);transform:translate(0)}
        }

        @keyframes horrorColorShift {
            0%,100%{filter:hue-rotate(0deg) saturate(0) brightness(0.15)}
            25%{filter:hue-rotate(180deg) saturate(2) brightness(0.08)}
            50%{filter:hue-rotate(270deg) saturate(0) brightness(0.2)}
            75%{filter:hue-rotate(90deg) saturate(3) brightness(0.05)}
        }

        .horror-char-silhouette {
            filter: brightness(0) !important;
            animation: horrorColorShift 2.5s infinite !important;
        }

        .horror-char-silhouette img {
            filter: brightness(0) !important;
        }

        @keyframes horrorStaticFlicker {
            0%,100%{opacity:1}
            3%{opacity:0.6}
            6%{opacity:0.9}
            9%{opacity:0.4}
            12%{opacity:1}
            45%{opacity:0.95}
            47%{opacity:0.3}
            49%{opacity:0.9}
            85%{opacity:1}
            88%{opacity:0.5}
            91%{opacity:1}
        }

        #horror-static-noise {
            position: absolute;
            inset: 0;
            opacity: 0;
            pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
            mix-blend-mode: overlay;
            animation: horrorStaticFlicker 0.1s infinite;
        }

        #horror-red-flash {
            position: fixed;
            inset: 0;
            background: rgba(180, 0, 0, 0.15);
            pointer-events: none;
            z-index: 99100;
            opacity: 0;
            display: none;
            animation: none;
        }

        @keyframes horrorRedPulse {
            0%,100%{opacity:0} 50%{opacity:1}
        }
    `;
    document.head.appendChild(style);

    // ── HTML ────────────────────────────────────────────────
    var overlay = document.createElement('div');
    overlay.id = 'horror-overlay';
    overlay.innerHTML = `
        <div id="horror-bg-distorted"></div>
        <div id="horror-static-noise"></div>
        <div id="horror-scanlines"></div>
        <div id="horror-glitch-layer"></div>
        <div id="horror-dialogue-box">
            <div id="horror-speaker-box">???</div>
            <div id="horror-accent-bar"></div>
            <div id="horror-text"></div>
            <span id="horror-cursor"></span>
        </div>
    `;
    document.body.appendChild(overlay);

    var redFlash = document.createElement('div');
    redFlash.id = 'horror-red-flash';
    document.body.appendChild(redFlash);

    // ── ESTADO ─────────────────────────────────────────────
    var horrorActive = false;
    var _wasGamePaused = false;
    var horrorStep   = 0;
    var typeIv       = null;
    var horrorAudioCtx = null;
    var originalMusicEls = [];

    // ── HELPERS AUDIO ───────────────────────────────────────
    function getHorrorCtx() {
        if (!horrorAudioCtx)
            horrorAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return horrorAudioCtx;
    }

    function playWindStart() {
        try {
            var windEl = document.getElementById('wind-sound');
            if (windEl) {
                windEl.volume = 0.6;
                windEl.currentTime = 0;
                windEl.play().catch(function(){});
            }
        } catch(e) {}
    }

    function stopWindSound() {
        try {
            var windEl = document.getElementById('wind-sound');
            if (windEl) { windEl.pause(); windEl.currentTime = 0; }
        } catch(e) {}
    }

    function pauseAllMusic() {
        var ids = ['menu-music','prologue-music','ost-p','seven-lab','battle-music',
                   'nero-store-music','discord-chat-music','megalovania-music','creeppy-music',
                   'nero-tense-music'];
        originalMusicEls = [];
        ids.forEach(function(id) {
            var el = document.getElementById(id);
            if (el && !el.paused) {
                originalMusicEls.push({ el: el, vol: el.volume });
                // Fade out
                var steps = 20, iv = 400 / 20, delta = el.volume / steps, s = 0;
                var target = el;
                var t = setInterval(function() {
                    s++;
                    target.volume = Math.max(0, target.volume - delta);
                    if (s >= steps) { clearInterval(t); target.pause(); }
                }, iv);
            }
        });
    }

    function resumeAllMusic() {
        originalMusicEls.forEach(function(entry) {
            try {
                entry.el.volume = 0;
                entry.el.play().catch(function(){});
                var steps = 20, iv = 600 / 20, step = 0;
                var target = entry.el, targetVol = entry.vol;
                var t = setInterval(function() {
                    step++;
                    target.volume = Math.min(targetVol, (step / steps) * targetVol);
                    if (step >= steps) { clearInterval(t); }
                }, iv);
            } catch(e) {}
        });
        originalMusicEls = [];
    }

    // ── GLITCH ──────────────────────────────────────────────
    function spawnGlitchSlice() {
        var layer = document.getElementById('horror-glitch-layer');
        if (!layer) return;
        var bg = document.getElementById('horror-bg-distorted');
        var src = bg ? bg.style.backgroundImage : '';
        if (!src) return;

        var el = document.createElement('div');
        var top   = Math.random() * 90;
        var height = 2 + Math.random() * 12;
        var offsetX = (Math.random() - 0.5) * 40;
        el.style.cssText = [
            'position:absolute',
            'left:0', 'right:0',
            'top:' + top + '%',
            'height:' + height + 'px',
            'background-image:' + src,
            'background-size:cover',
            'background-position:center ' + (-top) + '%',
            'transform:translateX(' + offsetX + 'px)',
            'filter:saturate(0) brightness(0.3)',
            'opacity:0.7',
            'animation:horrorGlitch 0.3s steps(1) forwards'
        ].join(';');
        layer.appendChild(el);
        setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
    }

    var glitchInterval = null;
    function startGlitch() {
        glitchInterval = setInterval(function() {
            if (!horrorActive) return;
            var count = 1 + Math.floor(Math.random() * 3);
            for (var i = 0; i < count; i++) {
                setTimeout(spawnGlitchSlice, i * 80);
            }
        }, 600);
    }

    function stopGlitch() {
        if (glitchInterval) clearInterval(glitchInterval);
        glitchInterval = null;
        var layer = document.getElementById('horror-glitch-layer');
        if (layer) layer.innerHTML = '';
    }

    // ── PERSONAGENS SILHUETA ─────────────────────────────────
    function blackoutChars() {
        var selectors = [
            '#character-left', '#character-right',
            '.character', '.praia-char',
            '#nsf-abbyl-sprite', '#rb-arabel-portrait', '#rb-nero-portrait',
            '#ns-nero-sprite'
        ];
        selectors.forEach(function(sel) {
            document.querySelectorAll(sel).forEach(function(el) {
                el.classList.add('horror-char-silhouette');
            });
        });
    }

    function restoreChars() {
        document.querySelectorAll('.horror-char-silhouette').forEach(function(el) {
            el.classList.remove('horror-char-silhouette');
        });
    }

    // ── BACKGROUND DISTORCIDO ────────────────────────────────
    function showDistortedBg() {
        var bgEl = document.getElementById('horror-bg-distorted');
        if (!bgEl) return;

        // Tenta usar a imagem distorted.png do projeto
        var distortedPath = 'assets/images/scenes/distorced.png';
        bgEl.style.backgroundImage = 'url("' + distortedPath + '")';
        bgEl.onerror = function() {
            // Fallback: usa a cena atual se existir
            var currentBg = document.getElementById('bg-image');
            if (currentBg && currentBg.src) {
                bgEl.style.backgroundImage = 'url("' + currentBg.src + '")';
            }
        };
        var noiseEl = document.getElementById('horror-static-noise');
        if (noiseEl) noiseEl.style.opacity = '0.08';
        bgEl.style.opacity = '1';
    }

    function hideDistortedBg() {
        var bgEl = document.getElementById('horror-bg-distorted');
        if (bgEl) { bgEl.style.opacity = '0'; bgEl.style.backgroundImage = ''; }
        var noiseEl = document.getElementById('horror-static-noise');
        if (noiseEl) noiseEl.style.opacity = '0';
    }

    // ── RED FLASH ────────────────────────────────────────────
    function pulseRedFlash() {
        redFlash.style.display = 'block';
        redFlash.style.animation = 'horrorRedPulse 3s ease-in-out infinite';
    }

    function stopRedFlash() {
        redFlash.style.display = 'none';
        redFlash.style.animation = 'none';
    }

    // ── TYPEWRITER ───────────────────────────────────────────
    function typeHorrorText(text, onDone) {
        if (typeIv) clearInterval(typeIv);
        var el = document.getElementById('horror-text');
        if (!el) return;
        el.textContent = '';
        var i = 0;
        typeIv = setInterval(function() {
            if (i < text.length) {
                el.textContent += text[i];
                i++;
                // som de texto assustador
                try {
                    var ctx = getHorrorCtx();
                    var osc = ctx.createOscillator();
                    var g   = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.value = 180 + Math.random() * 60;
                    g.gain.setValueAtTime(0.04, ctx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                    osc.connect(g); g.connect(ctx.destination);
                    osc.start(); osc.stop(ctx.currentTime + 0.06);
                } catch(e) {}
            } else {
                clearInterval(typeIv);
                typeIv = null;
                if (onDone) onDone();
            }
        }, 55);
    }

    // ── SEQUÊNCIA PRINCIPAL ──────────────────────────────────
    // Estado congelado do diálogo do jogo
    var _frozenDialogue = null;

    // Congela o typewriter e sfx do jogo principal
    function freezeGameDialogue() {
        try {
            // Salva e para o typeInterval do jogo
            var ti = typeof typeInterval !== 'undefined' ? typeInterval : null;
            var sfxEl = document.getElementById('sfx-text');
            var abbylEl = document.getElementById('abbyl-text');

            _frozenDialogue = {
                typeInterval: ti,
                sfxTextVol: sfxEl ? sfxEl.volume : null,
                abbylTextVol: abbylEl ? abbylEl.volume : null,
                canInteract: typeof canInteract !== 'undefined' ? canInteract : null,
            };

            // Para o setInterval de digitação
            if (ti) clearInterval(ti);

            // Silencia sons de texto
            if (sfxEl)    { sfxEl.pause();    sfxEl.volume    = 0; }
            if (abbylEl)  { abbylEl.pause();  abbylEl.volume  = 0; }

            // Bloqueia interação — player não pode avançar diálogo durante o horror
            if (typeof canInteract !== 'undefined') canInteract = false;

        } catch (e) {}
    }

    // Descongela e retoma o typewriter do jogo
    function unfreezeGameDialogue() {
        try {
            if (!_frozenDialogue) return;

            var sfxEl   = document.getElementById('sfx-text');
            var abbylEl = document.getElementById('abbyl-text');

            // Restaura volumes
            if (sfxEl   && _frozenDialogue.sfxTextVol   !== null) sfxEl.volume   = _frozenDialogue.sfxTextVol;
            if (abbylEl && _frozenDialogue.abbylTextVol  !== null) abbylEl.volume = _frozenDialogue.abbylTextVol;

            // Restaura canInteract
            if (_frozenDialogue.canInteract !== null && typeof canInteract !== 'undefined') {
                canInteract = _frozenDialogue.canInteract;
            }

            // Retoma o typeInterval — o setInterval ainda tem a closure do texto,
            // basta reatribuir a variável global typeInterval para ele voltar a rodar.
            // Como clearInterval já foi chamado, precisamos reiniciar via startTyping.
            // A forma mais segura: se havia texto sendo digitado, termina ele de uma vez
            // (mostra o texto completo) e deixa o player clicar para avançar normalmente.
            if (typeof finishTyping === 'function' && typeof dialogueText !== 'undefined') {
                // Só age se o typeInterval estava ativo (havia texto em andamento)
                if (_frozenDialogue.typeInterval) {
                    finishTyping(dialogueText);
                }
            }

            _frozenDialogue = null;
        } catch (e) {}
    }

    // Verifica se o estado do game é seguro para disparar o horror.
    // Retorna false se estiver em batalha, loja, ending, transição ou pause.
    function isSafeToTriggerHorror() {
        // Já está ativo
        if (horrorActive) return false;

        // Jogo já pausado
        if (window.gamePaused) return false;

        // Batalhas ativas
        if (window.arabelActive) return false;
        if (window.neroStandaloneActive) return false;

        // Loja da Nero aberta
        var storeEl = document.getElementById('nero-store-screen');
        if (storeEl && storeEl.style.display === 'flex') return false;

        // Qualquer tela de ending visível
        var endingIds = ['end-screen','ending3-screen','ending-alone','ending-9999','ending-praia','ending-no-story'];
        for (var i = 0; i < endingIds.length; i++) {
            var el = document.getElementById(endingIds[i]);
            if (el && (el.style.display === 'flex' || el.style.display === 'block' || el.classList.contains('active'))) return false;
        }

        // Tela de batalha UT visível
        var utEl = document.getElementById('ut-battle-screen');
        if (utEl && utEl.style.display === 'flex') return false;

        // Tela de batalha real visível
        var rbEl = document.getElementById('real-battle-screen');
        if (rbEl && rbEl.style.display !== 'none' && rbEl.style.display !== '') return false;

        // Fade overlay cobrindo tudo (transição de capítulo)
        var fadeEl = document.getElementById('fade-overlay');
        if (fadeEl && parseFloat(fadeEl.style.opacity) > 0.5) return false;

        return true;
    }

    // mode: 'menu' (padrão) ou 'chapter' (repetição de capítulo)
    function runHorrorSequence(mode) {
        if (!isSafeToTriggerHorror()) return;
        horrorActive = true;
        horrorStep   = 0;

        // Pausa total do jogo — igual ao pause menu
        _wasGamePaused = !!(window.gamePaused);
        if (!_wasGamePaused) {
            window.gamePaused = true;
            // Pausa o autoAdvance timer se existir
            if (typeof window._autoAdvanceTimer !== 'undefined' && window._autoAdvanceTimer) {
                clearTimeout(window._autoAdvanceTimer);
                window._autoAdvanceTimer = null;
            }
        }

        // Congela o diálogo do jogo imediatamente
        freezeGameDialogue();

        // Escolhe pool de diálogos conforme o contexto
        var sourcePool = (mode === 'chapter') ? DIALOGOS_REPETICAO : DIALOGOS;

        // Seleciona 3–5 diálogos aleatórios sem repetir
        var pool = sourcePool.slice();
        pool.sort(function() { return Math.random() - 0.5; });
        var sequence = pool.slice(0, 3 + Math.floor(Math.random() * 3));

        overlay.style.display = 'block';
        overlay.style.pointerEvents = 'none';

        pauseAllMusic();
        playWindStart();
        showDistortedBg();
        blackoutChars();
        startGlitch();
        pulseRedFlash();

        // Mostra caixa de diálogo
        var dbox = document.getElementById('horror-dialogue-box');
        if (dbox) {
            setTimeout(function() {
                dbox.style.opacity = '1';
                runNextLine(sequence, 0);
            }, 800);
        }
    }

    function runNextLine(sequence, idx) {
        if (!horrorActive) return;
        if (idx >= sequence.length) {
            // Fim — restaura tudo
            endHorrorSequence();
            return;
        }
        var entry = sequence[idx];
        typeHorrorText(entry.text, function() {
            // Aguarda antes de avançar
            setTimeout(function() {
                runNextLine(sequence, idx + 1);
            }, 1600 + Math.random() * 800);
        });
    }

    function endHorrorSequence() {
        var dbox = document.getElementById('horror-dialogue-box');
        if (dbox) dbox.style.opacity = '0';

        setTimeout(function() {
            overlay.style.display = 'none';
            hideDistortedBg();
            stopGlitch();
            stopRedFlash();
            restoreChars();
            stopWindSound();
            resumeAllMusic();
            // Descongela o diálogo do jogo antes de liberar o horror
            unfreezeGameDialogue();
            // Restaura o estado de pausa do jogo
            if (!_wasGamePaused) {
                window.gamePaused = false;
                if (typeof gamePaused !== 'undefined') {
                    try { gamePaused = false; } catch(e) {}
                }
            }
            horrorActive = false;
            CODIGO_ATIVO = false;
        }, 600);
    }

    // ── VERIFICAÇÃO AO INICIAR ───────────────────────────────
    // Aguarda o menu aparecer para verificar se dispara o horror
    function waitForMenuAndMaybeHorror() {
        var menuEl = document.getElementById('menu-screen');
        if (!menuEl) { setTimeout(waitForMenuAndMaybeHorror, 500); return; }

        var triggered = false;
        var observer = new MutationObserver(function() {
            if (triggered) return;
            if (menuEl.style.display === 'flex') {
                triggered = true;
                observer.disconnect();
                // Aguarda um pouco para o menu estar totalmente visível
                setTimeout(function() {
                    if (Math.random() < CHANCE && isSafeToTriggerHorror()) {
                        runHorrorSequence();
                    }
                }, 2500);
            }
        });
        observer.observe(menuEl, { attributes: true, attributeFilter: ['style'] });
    }

    waitForMenuAndMaybeHorror();

    // ── CÓDIGO "horror" NO MENU ──────────────────────────────
    document.addEventListener('keydown', function(e) {
        if (!e.key || e.key.length !== 1) return;
        var menuEl = document.getElementById('menu-screen');
        if (!menuEl || menuEl.style.display !== 'flex') { horrorBuffer = ''; return; }
        if (horrorActive) return;

        horrorBuffer += e.key.toLowerCase();
        if (horrorBuffer.length > 6) horrorBuffer = horrorBuffer.slice(-6);
        if (horrorBuffer === 'horror') {
            horrorBuffer = '';
            CODIGO_ATIVO = true;
            runHorrorSequence();
        }
    });

    // ── HOOK DE FIM DE CAPÍTULO ──────────────────────────────
    // Regras (horror agora é evento muito raro por repetição):
    //   - Mínimo 15 repetições do cap 1 para poder disparar no fim do cap 1
    //   - 20ª repetição em diante: pode disparar em qualquer capítulo
    //   - Mesmo quando elegível: apenas 12% de chance de realmente disparar
    //   - Máximo 1x por capítulo por sessão
    //   - Sempre no final, nunca no meio

    var _horrorFiredThisSession = {};

    // Chamado pelo index.html no momento exato antes de triggerFadeTransition (fim do capítulo).
    window._horrorCheckChapterEnd = function(chapterId, callback) {
        var key = String(chapterId);

        // Já disparou nessa sessão para esse capítulo
        if (_horrorFiredThisSession[key]) { callback(); return; }

        // Lê o contador de runs
        var runs = 0;
        if (typeof window._replayGetRuns === 'function') {
            var runsObj = window._replayGetRuns();
            runs = runsObj[key] || 0;
        }

        var eligible = false;

        if (runs >= 20) {
            // 20ª repetição em diante: qualquer capítulo pode ser elegível
            eligible = true;
        } else if (runs >= 15 && String(chapterId) === '1') {
            // 15ª+ repetição: só o cap 1 é elegível
            eligible = true;
        }

        // Mesmo elegível, só 12% de chance de realmente disparar
        if (!eligible || Math.random() > 0.12) { callback(); return; }
        if (!isSafeToTriggerHorror()) { callback(); return; }

        _horrorFiredThisSession[key] = true;

        // Intercepta: roda o horror, depois chama o callback original
        var originalCallback = callback;
        runHorrorSequence('chapter');

        // Aguarda o horror terminar para continuar a transição
        var waitInterval = setInterval(function() {
            if (!horrorActive) {
                clearInterval(waitInterval);
                originalCallback();
            }
        }, 200);
    };

    // Mantém o hook antigo de início de capítulo como no-op para não quebrar chamadas existentes
    window._horrorCheckChapterStart = function() {};

    // ── EXPÕE PARA POSSÍVEL USO EXTERNO ─────────────────────
    window.horrorEventSystem = {
        trigger: runHorrorSequence,
        active:  function() { return horrorActive; }
    };

})();