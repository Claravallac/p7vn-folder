// ============================================================
//  NERO SURPRISE SYSTEM  v1
//
//  Um número secreto entre 1 e 100 é gerado uma única vez
//  na primeira vez que o jogador salva (automático ou manual).
//  Esse número — o "NeroSurprise" — determina quais eventos
//  especiais e surpresas estarão ativos naquela "run" do jogo.
//
//  O valor é persistido no GameStorage e nunca muda depois
//  que foi gerado. É como se o universo do jogo "rolasse
//  os dados" uma vez só e mantivesse esse resultado para sempre.
//
//  ── TABELA DE EFEITOS ──────────────────────────────────────
//
//   1 – 10  │ NERO_GENEROUS
//            │ A Nero tem chance de dar 1000 moedas ao player
//            │ durante um diálogo aleatório na Loja da Nero.
//            │ Acontece uma vez por sessão, em momento surpresa.
//
//  11 – 15  │ ABBYL_UMAMUSUME
//            │ Em algum momento durante um capítulo, o Abbyl
//            │ pode interromper tudo porque precisa ver uma
//            │ corrida de Uma Musume. O capítulo encerra à
//            │ força e o game volta ao menu. Se o player tentar
//            │ iniciar qualquer capítulo depois disso, uma
//            │ mensagem avisa que o Abbyl está ocupado e bloqueia
//            │ por alguns minutos (tempo real).
//
//  16 – 17  │ NERO_FORGOT_LINE
//            │ No prólogo, a Nero esquece sua fala do roteiro
//            │ e a Arabel tenta ajudá-la a lembrar, gerando
//            │ uma cena de improviso entre as duas antes de
//            │ o prólogo seguir normalmente.
//
//  ──────────────────────────────────────────────────────────
//  PARA ADICIONAR NOVOS EFEITOS:
//    1. Defina o range na tabela acima (ex: 18–25 │ NOVO_EFEITO)
//    2. Crie uma função init_NOVO_EFEITO() neste arquivo
//    3. Registre no objeto EFFECTS abaixo com o range e a função
//    4. O sistema chama automaticamente no boot
// ============================================================

(function () {
'use strict';

// ── STORAGE KEY ───────────────────────────────────────────
var NS_KEY = 'neroSurprise_v1';

// ── LÊ / GERA O NÚMERO ────────────────────────────────────
function getNeroSurprise() {
    try {
        var raw = GameStorage.getItem(NS_KEY);
        if (raw !== null) {
            var val = parseInt(raw, 10);
            if (!isNaN(val) && val >= 1 && val <= 100) return val;
        }
    } catch (_) {}
    return null; // ainda não gerado
}

function generateAndStore() {
    var n = Math.floor(Math.random() * 100) + 1; // 1..100
    try { GameStorage.setItem(NS_KEY, String(n)); } catch (_) {}
    console.log('[NeroSurprise] Número gerado:', n);
    return n;
}

// Retorna o valor atual (ou null se ainda não foi salvo)
window._getNeroSurprise = getNeroSurprise;

// Reseta para forçar nova geração (debug)
window._resetNeroSurprise = function () {
    try { GameStorage.removeItem(NS_KEY); } catch (_) {}
    console.log('[NeroSurprise] Reset. Será gerado no próximo save.');
};

// ── HOOK NOS SAVES ────────────────────────────────────────
// Intercepta o primeiro save (auto ou manual) para gerar o número.
// Usa MutationObserver + monkey-patch do GameStorage para pegar
// o momento exato sem depender de nenhuma função interna.

var _generated = false;

function tryGenerate() {
    if (_generated) return;
    if (getNeroSurprise() !== null) { _generated = true; onSurpriseReady(getNeroSurprise()); return; }
    _generated = true;
    var n = generateAndStore();
    onSurpriseReady(n);
}

// Aguarda o GameStorage estar disponível e então hooks nos setItem
function hookSaveSystem() {
    if (typeof GameStorage === 'undefined') {
        setTimeout(hookSaveSystem, 200);
        return;
    }

    // Se já existe um número salvo de sessão anterior, usa ele imediatamente
    if (getNeroSurprise() !== null) {
        _generated = true;
        onSurpriseReady(getNeroSurprise());
        return;
    }

    // Monkey-patch: gera o número na primeira gravação (auto ou manual)
    var _origSet = GameStorage.setItem.bind(GameStorage);
    GameStorage.setItem = function (key, value) {
        _origSet(key, value);
        // Qualquer save de progresso dispara a geração
        if (!_generated && (key === 'vnSave_v1' || key === 'vnAutoSave_v1' || key === 'vnAutosave_v1')) {
            tryGenerate();
        }
    };

    console.log('[NeroSurprise] Aguardando primeiro save...');
}

// ── DISPATCHER ────────────────────────────────────────────
// Mapa de ranges para efeitos. Formato:
//   { min, max, id, init }
// Adicione novas entradas aqui para novos efeitos.

var EFFECTS = [
    { min:  1, max: 10, id: 'NERO_GENEROUS',   init: init_NERO_GENEROUS   },
    { min: 11, max: 15, id: 'ABBYL_UMAMUSUME', init: init_ABBYL_UMAMUSUME },
    { min: 16, max: 17, id: 'NERO_FORGOT_LINE',init: init_NERO_FORGOT_LINE },
    // ── INSIRA NOVOS EFEITOS ABAIXO ──
    // { min: 18, max: 25, id: 'NOME_DO_EFEITO', init: init_NOME_DO_EFEITO },
];

function onSurpriseReady(n) {
    console.log('[NeroSurprise] Ativo com número:', n);
    window._activeSurpriseId = null;
    for (var i = 0; i < EFFECTS.length; i++) {
        var e = EFFECTS[i];
        if (n >= e.min && n <= e.max) {
            window._activeSurpriseId = e.id;
            console.log('[NeroSurprise] Efeito ativo:', e.id);
            try { e.init(n); } catch (err) {
                console.error('[NeroSurprise] Erro ao iniciar efeito', e.id, err);
            }
            break;
        }
    }
    if (!window._activeSurpriseId) {
        console.log('[NeroSurprise] Número sem efeito especial (' + n + '). Universo normal.');
    }
}


// ════════════════════════════════════════════════════════════
//  EFEITO 1 – NERO_GENEROUS (1–10)
//
//  A Nero tem chance de dar 1000 moedas ao player durante
//  um diálogo aleatório na Loja da Nero. Acontece apenas
//  uma vez por sessão, num momento surpresa.
// ════════════════════════════════════════════════════════════

function init_NERO_GENEROUS() {
    // Escolhe um número aleatório de falas da loja antes de disparar (3 a 8)
    var _triggerAfter  = 3 + Math.floor(Math.random() * 6); // 3..8 falas
    var _lineCount     = 0;
    var _fired         = false;

    var GENEROUS_LINES = [
        'Toma. Não pergunta o porquê.',
        '...Eu estava de bom humor hoje. Aproveita.',
        'Isso não significa nada. Só pega.',
        'Considere um investimento. No seu silêncio.',
        'Não conta pra ninguém. Sério.',
        'Eu não sei porque estou fazendo isso. Pega antes que eu mude de ideia.',
        'Ugh. Guarda isso e não fala mais comigo por uns cinco minutos.',
    ];

    // Intercepta o setStoreLine para contar falas e disparar no momento certo
    var _originalSetStoreLine = null;

    function patchStoreLine() {
        if (typeof setStoreLine !== 'function') {
            setTimeout(patchStoreLine, 500);
            return;
        }
        _originalSetStoreLine = setStoreLine;

        // Sobrescreve globalmente
        window.setStoreLine = setStoreLine = function (text) {
            _originalSetStoreLine(text);

            if (_fired) return;
            _lineCount++;

            if (_lineCount >= _triggerAfter) {
                _fired = true;
                // Aguarda a fala atual terminar de digitar (~2s) depois dispara
                setTimeout(function () {
                    giveGenerousCoins();
                }, 2200 + Math.random() * 1000);
            }
        };
    }

    function giveGenerousCoins() {
        // Só dispara se a loja estiver aberta
        var storeEl = document.getElementById('nero-store-screen');
        if (!storeEl || storeEl.style.display !== 'flex') {
            // Loja fechou antes de disparar — cancela silenciosamente
            return;
        }

        var line = GENEROUS_LINES[Math.floor(Math.random() * GENEROUS_LINES.length)];

        // Dá as moedas
        if (typeof achievementsState !== 'undefined') {
            achievementsState.coins = (typeof getCoins === 'function' ? getCoins() : 0) + 1000;
        }

        // Atualiza a HUD da loja
        if (typeof refreshShopUi === 'function') refreshShopUi();

        // Fala da Nero
        if (typeof setStoreLine === 'function') setStoreLine(line);

        // Mostra popup de moedas se existir
        var coinsPopup = document.getElementById('achievement-popup-coins');
        var coinsAmount = document.getElementById('achievement-coin-amount');
        if (coinsPopup && coinsAmount) {
            coinsAmount.textContent = '+1000';
            coinsPopup.classList.add('visible');
            setTimeout(function () { coinsPopup.classList.remove('visible'); }, 3000);
        }

        console.log('[NeroSurprise] NERO_GENEROUS disparou! +1000 moedas.');
    }

    // Aguarda o DOM e as funções da loja estarem prontas
    setTimeout(patchStoreLine, 1500);
}


// ════════════════════════════════════════════════════════════
//  EFEITO 2 – ABBYL_UMAMUSUME (11–15)
//
//  Durante um capítulo (após alguns diálogos), o Abbyl
//  interrompe tudo porque PRECISA ver uma corrida de
//  Uma Musume. O capítulo encerra à força e o game volta
//  ao menu. Se o player tentar iniciar qualquer capítulo
//  depois disso, uma mensagem bloqueia por alguns minutos.
// ════════════════════════════════════════════════════════════

var _umamusumeBlocked   = false;
var _umamusumeBlockedUntil = 0;
var UMAMUSUME_BLOCK_MS  = 5 * 60 * 1000; // 5 minutos de bloqueio (tempo real)

// Chave para persistir o bloqueio entre sessões
var UMA_BLOCK_KEY = 'neroSurprise_umaBlock_v1';

function init_ABBYL_UMAMUSUME() {
    // Restaura bloqueio persistido (caso o player reiniciou o jogo)
    try {
        var stored = JSON.parse(GameStorage.getItem(UMA_BLOCK_KEY) || 'null');
        if (stored && stored.until > Date.now()) {
            _umamusumeBlocked    = true;
            _umamusumeBlockedUntil = stored.until;
        }
    } catch (_) {}

    // Escolhe um capítulo aleatório (1, 2 ou 1.4) e um índice de linha
    // onde o Abbyl vai interromper. Dispara após pelo menos 4 linhas.
    var _targetChapter  = [1, 2, '1.4'][Math.floor(Math.random() * 3)];
    var _triggerAtLine  = 4 + Math.floor(Math.random() * 5); // linha 4..8
    var _fired          = false;

    // Expõe para ser chamado pelo engine quando uma linha é exibida
    window._umamusumeCheckLine = function (chapterId, lineIndex) {
        if (_fired) return;
        if (_umamusumeBlocked) return;
        if (String(chapterId) !== String(_targetChapter)) return;
        if (lineIndex < _triggerAtLine) return;

        _fired = true;
        setTimeout(triggerUmamusumeInterrupt, 800);
    };
}

function triggerUmamusumeInterrupt() {
    if (window.gamePaused) return;

    // Pausa o jogo
    window.gamePaused = true;
    if (typeof canInteract !== 'undefined') {
        try { canInteract = false; } catch (_) {}
    }

    // Cria overlay de interrupção
    var overlay = document.createElement('div');
    overlay.id  = 'uma-interrupt-overlay';
    overlay.style.cssText = [
        'position:fixed','inset:0','z-index:98000',
        'background:rgba(0,0,0,0.92)',
        'display:flex','flex-direction:column',
        'align-items:center','justify-content:center',
        'font-family:inherit','gap:24px',
        'animation:umaFadeIn 0.6s ease forwards'
    ].join(';');

    overlay.innerHTML = [
        '<style>',
        '@keyframes umaFadeIn{from{opacity:0}to{opacity:1}}',
        '#uma-interrupt-overlay .uma-title{',
        '  font-size:clamp(13px,1.5vw,18px);letter-spacing:6px;color:rgba(255,200,80,0.5);',
        '  text-transform:uppercase;',
        '}',
        '#uma-interrupt-overlay .uma-speaker{',
        '  font-size:clamp(11px,1.2vw,14px);letter-spacing:4px;color:rgba(255,255,255,0.3);',
        '  text-transform:uppercase;',
        '}',
        '#uma-interrupt-overlay .uma-text{',
        '  font-size:clamp(18px,2.5vw,30px);color:#fff;text-align:center;',
        '  max-width:70vw;line-height:1.6;',
        '}',
        '#uma-interrupt-overlay .uma-sub{',
        '  font-size:clamp(11px,1.2vw,14px);color:rgba(255,255,255,0.35);',
        '  letter-spacing:3px;text-align:center;',
        '}',
        '#uma-interrupt-overlay .uma-btn{',
        '  margin-top:16px;background:none;border:1px solid rgba(255,255,255,0.2);',
        '  color:rgba(255,255,255,0.5);font-family:inherit;font-size:11px;',
        '  letter-spacing:4px;text-transform:uppercase;padding:10px 32px;cursor:pointer;',
        '  transition:all 0.2s;',
        '}',
        '#uma-interrupt-overlay .uma-btn:hover{border-color:rgba(255,255,255,0.5);color:#fff;}',
        '</style>',
        '<div class="uma-title">— Interrupção inesperada —</div>',
        '<div class="uma-speaker">Abbyl</div>',
        '<div class="uma-text">',
        'Espera, espera, espera.<br>',
        'A corrida do Special Week tá acontecendo AGORA.<br>',
        'Eu preciso ver isso.<br>',
        '<span style="font-size:0.7em;color:rgba(255,255,255,0.4);">...É sério. Isso não pode esperar.</span>',
        '</div>',
        '<button class="uma-btn" id="uma-ok-btn">OK</button>',
    ].join('');

    document.body.appendChild(overlay);

    // Botão OK aplica bloqueio e volta ao menu via esconderTudo + menuScreen
    var btn = document.getElementById('uma-ok-btn');
    if (btn) {
        btn.addEventListener('click', function () {
            // Aplica bloqueio temporário ANTES de fechar o overlay
            _umamusumeBlocked      = true;
            _umamusumeBlockedUntil = Date.now() + UMAMUSUME_BLOCK_MS;
            try {
                GameStorage.setItem(UMA_BLOCK_KEY, JSON.stringify({ until: _umamusumeBlockedUntil }));
            } catch (_) {}

            // Fade out do overlay
            overlay.style.opacity    = '0';
            overlay.style.transition = 'opacity 0.4s';

            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);

                // Despausa
                window.gamePaused = false;
                if (typeof canInteract !== 'undefined') {
                    try { canInteract = true; } catch (_) {}
                }

                // Volta ao menu via helper global exposto pelo index.html
                if (typeof window._returnToMenu === 'function') {
                    window._returnToMenu();
                } else {
                    // Fallback: esconde telas manualmente e mostra o menu
                    var ids = ['game-screen','prologue-screen','minigame-screen',
                               'ut-battle-screen','quiz-screen','password-screen',
                               'ending-3-screen','end-screen','real-battle-screen'];
                    ids.forEach(function(id) {
                        var el = document.getElementById(id);
                        if (el) el.style.display = 'none';
                    });
                    var fo = document.getElementById('fade-overlay');
                    if (fo) fo.style.opacity = '0';

                    // Para todas as músicas de capítulo
                    var musicIds = ['ost-p','seven-lab','battle-music','discord-chat-music',
                                    'prologue-music','nero-tense-music'];
                    musicIds.forEach(function(id) {
                        var el = document.getElementById(id);
                        if (el && !el.paused) { el.pause(); el.currentTime = 0; }
                    });

                    // Exibe o menu principal
                    var menuEl = document.getElementById('menu-screen');
                    if (menuEl) {
                        menuEl.style.display = 'flex';
                        var menuMusic = document.getElementById('menu-music');
                        if (menuMusic && menuMusic.paused) menuMusic.play().catch(function(){});
                    }

                    if (typeof DiscordPresence !== 'undefined') DiscordPresence.menu();
                }
            }, 450);
        });
    }
}

// Chamado pelo engine antes de carregar qualquer capítulo.
// Retorna true se o capítulo está bloqueado.
window._umamusumeIsBlocked = function () {
    if (!_umamusumeBlocked) return false;
    if (Date.now() > _umamusumeBlockedUntil) {
        // Bloqueio expirou
        _umamusumeBlocked = false;
        try { GameStorage.removeItem(UMA_BLOCK_KEY); } catch (_) {}
        return false;
    }
    return true;
};

// Retorna quantos minutos restam (arredondado para cima)
window._umamusumeBlockMinutesLeft = function () {
    var ms = _umamusumeBlockedUntil - Date.now();
    return Math.max(1, Math.ceil(ms / 60000));
};

// Mostra a mensagem de bloqueio (chamada pelo engine quando o player
// tenta iniciar um capítulo enquanto o Abbyl está "ocupado")
window._umamusumeShowBlockMessage = function () {
    // Não mostra duas vezes ao mesmo tempo
    if (document.getElementById('uma-block-overlay')) return;

    var mins = window._umamusumeBlockMinutesLeft();

    var overlay = document.createElement('div');
    overlay.id  = 'uma-block-overlay';
    overlay.style.cssText = [
        'position:fixed','inset:0','z-index:98000',
        'background:rgba(0,0,0,0.88)',
        'display:flex','flex-direction:column',
        'align-items:center','justify-content:center',
        'font-family:inherit','gap:20px',
        'animation:umaFadeIn 0.4s ease forwards'
    ].join(';');

    overlay.innerHTML = [
        '<style>@keyframes umaFadeIn{from{opacity:0}to{opacity:1}}</style>',
        '<div style="font-size:clamp(11px,1.2vw,14px);letter-spacing:5px;',
             'color:rgba(255,200,80,0.4);text-transform:uppercase;">',
             '— Abbyl está ocupado —',
        '</div>',
        '<div style="font-size:clamp(16px,2vw,24px);color:#fff;text-align:center;',
             'max-width:65vw;line-height:1.7;">',
             'O Abbyl ainda está assistindo Uma Musume.<br>',
             '<span style="font-size:0.75em;color:rgba(255,255,255,0.4);">',
             'Tente novamente em aproximadamente ' + mins + ' minuto' + (mins > 1 ? 's' : '') + '.',
             '</span>',
        '</div>',
        '<button id="uma-block-ok" style="',
             'background:none;border:1px solid rgba(255,255,255,0.2);',
             'color:rgba(255,255,255,0.4);font-family:inherit;font-size:11px;',
             'letter-spacing:4px;text-transform:uppercase;padding:10px 32px;cursor:pointer;">',
             'OK',
        '</button>',
    ].join('');

    document.body.appendChild(overlay);

    var btn = document.getElementById('uma-block-ok');
    if (btn) {
        btn.addEventListener('click', function () {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 350);
        });
    }
};


// ════════════════════════════════════════════════════════════
//  EFEITO 3 – NERO_FORGOT_LINE (16–17)
//
//  No prólogo, a Nero "esquece" sua primeira fala do roteiro.
//  A Arabel tenta ajudá-la a lembrar. Depois de um momento
//  de improviso, o prólogo segue normalmente.
// ════════════════════════════════════════════════════════════

function init_NERO_FORGOT_LINE() {
    // Expõe flag para o engine verificar antes de mostrar a linha 0 do prólogo
    window._neroForgotLine = true;

    // As linhas extras que serão injetadas ANTES da linha 0 original do prólogo
    // O engine deve chamar window._getNeroForgotLines() para obtê-las
    window._getNeroForgotLines = function () {
        return [
            { speaker: 'Nero',   text: '...' },
            { speaker: 'Nero',   text: 'Espera.' },
            { speaker: 'Arabel', text: 'Nero? A sua fala é "Finalmente!". Como sempre.' },
            { speaker: 'Nero',   text: 'Eu sei.' },
            { speaker: 'Arabel', text: 'Então... diz.' },
            { speaker: 'Nero',   text: '...' },
            { speaker: 'Nero',   text: 'Eu esqueci como a gente faz isso soar convincente depois de tantas vezes.' },
            { speaker: 'Arabel', text: 'É só uma palavra, Nero.' },
            { speaker: 'Nero',   text: 'É uma palavra muito importante.' },
            { speaker: 'Arabel', text: '...Quer que eu fale primeiro dessa vez?' },
            { speaker: 'Nero',   text: 'Não. Não, eu faço isso.' },
            { speaker: 'Nero',   text: '...' },
            // Volta ao script original — linha 0 do prólogo vem depois
        ];
    };
}


// ════════════════════════════════════════════════════════════
//  EFEITO 4 – DEV_TOUR (18–19)
//
//  A dev aparece no menu com comentários sobre o jogo.
//  Ativa o tour imediatamente ao abrir o menu, ignorando
//  a contagem de visitas ao neroblock.
// ════════════════════════════════════════════════════════════

function init_DEV_TOUR() {
    // Sinaliza para o sistema de dev tour que deve ativar
    // independente do número de visitas ao neroblock.
    window._neroSurpriseDevTour = true;
    console.log('[NeroSurprise] DEV_TOUR: tour da dev será ativado ao abrir o menu.');
}

// ── HELPERS DE DEBUG ──────────────────────────────────────

// Permite que o painel de debug force um efeito específico pelo número,
// mesmo que o sistema já tenha inicializado com outro valor.
window._dbgFireSurprise = function (n) {
    n = parseInt(n, 10);
    if (isNaN(n) || n < 1 || n > 100) return;
    try { GameStorage.setItem(NS_KEY, String(n)); } catch (_) {}
    // Reseta flags de estado para permitir re-disparo limpo
    window._neroForgotLine     = false;
    window._neroForgotLineDone = false;
    _generated = true;
    onSurpriseReady(n);
    console.log('[NeroSurprise] Debug: efeito forçado para número', n);
};

// Expõe triggerUmamusumeInterrupt para o botão "Forçar Interrupção" do debug
window._dbgTriggerUmamusume = function () {
    triggerUmamusumeInterrupt();
};

// ── BOOT ──────────────────────────────────────────────────
// Aguarda o DOM estar pronto antes de hookear o save system
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookSaveSystem);
} else {
    setTimeout(hookSaveSystem, 100);
}

console.log('[NeroSurprise] v1 carregado.');

})();
