// ════════════════════════════════════════════════════════════
//  ONBOARDING — Questionário antes do primeiro prólogo
// ════════════════════════════════════════════════════════════
(function () {

    var ONBOARDING_KEY = 'himari_onboarding_done';

    var QUESTIONS = [
        {
            text: 'Você é rápido com leitura?',
            sub: 'Isso ajusta a velocidade do texto no jogo.',
            options: [
                { label: 'Sim', value: 'fast',  key: 'textSpeed' },
                { label: 'Não', value: 'slow',  key: 'textSpeed' },
            ]
        },
        {
            text: 'Você prefere cores vibrantes ou mais apagadas?',
            sub: 'Ajusta o filtro de cor das cenas.',
            options: [
                { label: 'Vibrantes', value: 'vivid', key: 'colorMode' },
                { label: 'Apagadas',  value: 'muted', key: 'colorMode' },
            ]
        },
        {
            text: 'Você é bom em minigames?',
            sub: 'Escolha a dificuldade do Game Time!',
            options: [
                { label: 'Fácil',   value: 'easy',   key: 'minigameDifficulty' },
                { label: 'Normal',  value: 'normal', key: 'minigameDifficulty' },
                { label: 'Difícil', value: 'hard',   key: 'minigameDifficulty' },
            ]
        }
    ];

    var _qIndex  = 0;
    var _answers = {};
    var _onDone  = null;
    var _overlay = null;

    // ── CSS ──────────────────────────────────────────────────
    var style = document.createElement('style');
    style.textContent = [
        '#onb-overlay{position:fixed;inset:0;z-index:99999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 0.5s ease;font-family:inherit}',
        '#onb-overlay.visible{opacity:1}',
        '#onb-card{display:flex;flex-direction:column;align-items:center;gap:0;max-width:480px;width:90%;text-align:center}',
        '#onb-counter{font-size:10px;letter-spacing:5px;color:rgba(255,255,255,0.25);text-transform:uppercase;margin-bottom:22px}',
        '#onb-bar-wrap{width:160px;height:2px;background:rgba(255,255,255,0.1);border-radius:2px;margin-bottom:32px}',
        '#onb-bar{height:100%;background:var(--menu-accent,#cc00ff);border-radius:2px;transition:width 0.4s ease}',
        '#onb-question{font-size:clamp(18px,3vw,26px);font-weight:900;color:#fff;letter-spacing:1px;line-height:1.3;margin-bottom:10px}',
        '#onb-sub{font-size:11px;letter-spacing:2px;color:rgba(255,255,255,0.35);text-transform:uppercase;margin-bottom:36px}',
        '#onb-options{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}',
        '.onb-opt{padding:12px 28px;background:transparent;border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.6);font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-family:inherit;border-radius:4px;transition:all 0.18s;min-width:120px}',
        '.onb-opt:hover{border-color:var(--menu-accent,#cc00ff);color:#fff;background:rgba(204,0,255,0.1)}',
        '.onb-opt.selected{border-color:var(--menu-accent,#cc00ff);color:#fff;background:rgba(204,0,255,0.15)}',
        '#onb-hint{margin-top:40px;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.15);text-transform:uppercase}'
    ].join('\n');
    document.head.appendChild(style);

    function _build() {
        if (_overlay) return;
        _overlay = document.createElement('div');
        _overlay.id = 'onb-overlay';
        _overlay.innerHTML =
            '<div id="onb-card">' +
                '<div id="onb-counter"></div>' +
                '<div id="onb-bar-wrap"><div id="onb-bar"></div></div>' +
                '<div id="onb-question"></div>' +
                '<div id="onb-sub"></div>' +
                '<div id="onb-options"></div>' +
                '<div id="onb-hint">Clique para escolher</div>' +
            '</div>';
        document.body.appendChild(_overlay);
    }

    function _showQuestion(idx) {
        var q = QUESTIONS[idx];
        if (!q) { _finish(); return; }

        var counter  = document.getElementById('onb-counter');
        var bar      = document.getElementById('onb-bar');
        var question = document.getElementById('onb-question');
        var sub      = document.getElementById('onb-sub');
        var opts     = document.getElementById('onb-options');
        var card     = document.getElementById('onb-card');

        if (counter) counter.textContent = 'Pergunta ' + (idx + 1) + ' / ' + QUESTIONS.length;
        if (bar)     bar.style.width = ((idx / QUESTIONS.length) * 100) + '%';

        if (card) { card.style.opacity = '0'; card.style.transform = 'translateY(10px)'; }

        setTimeout(function () {
            if (question) question.textContent = q.text;
            if (sub)      sub.textContent = q.sub;
            if (opts) {
                opts.innerHTML = '';
                q.options.forEach(function (opt) {
                    var btn = document.createElement('button');
                    btn.className = 'onb-opt';
                    btn.textContent = opt.label;
                    btn.addEventListener('click', function () {
                        opts.querySelectorAll('.onb-opt').forEach(function (b) { b.classList.remove('selected'); });
                        btn.classList.add('selected');
                        _answers[opt.key] = opt.value;
                        setTimeout(function () { _qIndex++; _showQuestion(_qIndex); }, 320);
                    });
                    opts.appendChild(btn);
                });
            }
            if (card) {
                card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        }, idx === 0 ? 50 : 300);
    }

    function _applyAnswers() {
        if (typeof getSettings !== 'function' || typeof saveSettings !== 'function') return;
        var cfg = getSettings();
        if (_answers.textSpeed)          { cfg.textSpeed = _answers.textSpeed; window._textSpeedMode = _answers.textSpeed; }
        if (_answers.colorMode)          { cfg.colorMode = _answers.colorMode; window._colorMode = _answers.colorMode; _applyColorMode(_answers.colorMode); }
        if (_answers.minigameDifficulty) { cfg.minigameDifficulty = _answers.minigameDifficulty; window._mgDifficulty = _answers.minigameDifficulty; if (typeof refreshDifficultyUI === 'function') refreshDifficultyUI(); }
        saveSettings(cfg);
    }

    function _applyColorMode(mode) {
        var gs = document.getElementById('game-screen');
        var hs = document.getElementById('history-screen');
        var filter = mode === 'muted' ? 'saturate(0.55) brightness(0.92)' : '';
        [gs, hs].forEach(function (el) { if (el) el.style.filter = filter; });
        window._colorModeFilter = filter;
    }

    function _finish() {
        var bar = document.getElementById('onb-bar');
        if (bar) bar.style.width = '100%';
        _applyAnswers();
        // Marca como feito no localStorage diretamente
        try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch(e) {}
        // Também nas settings para compatibilidade
        try { if (typeof getSettings === 'function') { var c = getSettings(); c.onboardingDone = true; saveSettings(c); } } catch(e) {}

        setTimeout(function () {
            if (_overlay) { _overlay.style.opacity = '0'; }
            setTimeout(function () {
                if (_overlay) { _overlay.remove(); _overlay = null; }
                if (_onDone) _onDone();
            }, 500);
        }, 400);
    }

    function showOnboarding(onDone) {
        _qIndex  = 0;
        _answers = {};
        _onDone  = onDone;
        _build();
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                _overlay.classList.add('visible');
                _showQuestion(0);
            });
        });
    }

    function isOnboardingDone() {
        // Checa localStorage diretamente — independente das settings
        try { if (localStorage.getItem(ONBOARDING_KEY) === '1') return true; } catch(e) {}
        // Fallback: settings
        try { if (typeof getSettings === 'function' && getSettings().onboardingDone) return true; } catch(e) {}
        return false;
    }

    function resetOnboarding() {
        try { localStorage.removeItem(ONBOARDING_KEY); } catch(e) {}
        try { if (typeof getSettings === 'function') { var c = getSettings(); c.onboardingDone = false; saveSettings(c); } } catch(e) {}
    }

    function initColorModeFromSettings() {
        try {
            var cfg = typeof getSettings === 'function' ? getSettings() : {};
            if (cfg.colorMode) { window._colorMode = cfg.colorMode; _applyColorMode(cfg.colorMode); }
            if (cfg.textSpeed) { window._textSpeedMode = cfg.textSpeed; }
        } catch (e) {}
    }

    window.showOnboarding            = showOnboarding;
    window.isOnboardingDone          = isOnboardingDone;
    window.resetOnboarding           = resetOnboarding;
    window.initColorModeFromSettings = initColorModeFromSettings;

})();