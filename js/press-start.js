// ============================================================
//  PRESS START SCREEN  v2
//
//  Exibida uma vez por sessão antes do menu principal.
//  Ao apertar qualquer tecla ou clicar:
//    1. Toca sfx-start-game
//    2. Começa a música do menu imediatamente (fade-in junto)
//    3. Glitch na logo + slash roxo varre da esquerda
//    4. Menu aparece com animação dos botões já rodando
// ============================================================

(function () {
'use strict';

var _screen    = null;
var _onDone    = null;
var _triggered = false;

function init() {
    _screen = document.getElementById('press-start-screen');
    if (!_screen) return;

    _screen.style.display = 'flex';
    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            _screen.classList.add('active');
        });
    });

    document.addEventListener('keydown', _onInput, { once: true });
    _screen.addEventListener('click',    _onInput, { once: true });
}

function _onInput() {
    if (_triggered) return;
    _triggered = true;

    document.removeEventListener('keydown', _onInput);
    _screen.removeEventListener('click',    _onInput);

    // 1. Som de início
    var sfx = document.getElementById('sfx-start-game');
    if (sfx) {
        try { sfx.currentTime = 0; sfx.volume = 0.85; sfx.play().catch(function(){}); } catch(e) {}
    }

    // 2. Música do menu começa JÁ durante a transição
    // playMenuMusic tem fade-in de 800ms — inicia aqui pra já estar audível
    // quando o menu aparecer
    if (typeof window._playMenuMusic === 'function') {
        window._playMenuMusic();
    } else {
        var mm = document.getElementById('menu-music');
        if (mm && mm.paused) {
            try { mm.currentTime = 0; mm.volume = 0; mm.play().catch(function(){}); } catch(e) {}
            var step = 0, steps = 25, target = 0.5;
            var iv = setInterval(function() {
                step++;
                mm.volume = Math.min(target, (step / steps) * target);
                if (step >= steps) clearInterval(iv);
            }, 32);
        }
    }

    // 3. Para o blink do prompt
    var prompt = document.getElementById('ps-prompt');
    if (prompt) { prompt.style.animation = 'none'; prompt.style.opacity = '0'; }

    // 4. Woosh junto com o início da transição
    if (typeof window._playWoosh === 'function') {
        window._playWoosh('in');
    } else {
        try { var w = new Audio('./assets/audio/woosh.mp3'); w.volume = 0.7; w.play().catch(function(){}); } catch(e) {}
    }

    // 4. Transição visual: glitch + slash
    _screen.classList.add('ps-leaving');

    // 5. No pico da transição (~420ms) mostra o menu COM animação dos botões
    setTimeout(function() {
        window._menuAnimateOnNextShow = true;
        if (typeof _onDone === 'function') _onDone();
    }, 420);

    // 6. Remove a tela após a transição completa
    setTimeout(function() {
        _screen.style.display = 'none';
        _screen.classList.remove('active', 'ps-leaving');
    }, 700);
}

window._showPressStart = function(callback) {
    _onDone    = callback;
    _triggered = false;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
};

console.log('[PressStart] v2 carregado.');

})();
