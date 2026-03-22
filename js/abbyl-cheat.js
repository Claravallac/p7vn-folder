// ════════════════════════════════════════════════════════════════
// abbyl-cheat.js — Sistema completo do cheat "Abbyl"
//
// O cheat é ativado digitando "abbyl" no menu principal.
// Quando ativo (window._abbylCheatPersist === true), afeta:
//   - Visual do menu (vídeo de fundo, logo)
//   - Loja da Nero  → musume-store.js cuida do visual da loja
//   - GIF de save   → aparece ao lado do toast de salvamento
//   - Sprites dos personagens no jogo → musume skins
//   - GIF dançando na transição de relógio
//   - Capítulos (chapter-1-3, chapter-1-4) → lidos via window._abbylCheatPersist
//
// Depende de: menuScreen, menuMusic, unlockAchievement,
//             ACHIEVEMENT_IDS, isTextInputTarget, window._applyStoreTheme,
//             window._updateStoreMenuBtn
// ════════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // ── Aguarda o DOM estar pronto ───────────────────────────────
    function _ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    // ── Ativar cheat ─────────────────────────────────────────────
    function _activateAbbylCheat() {
        var vid     = document.getElementById('menu-cheat-video');
        var logoImg = document.getElementById('menu-logo-img');
        var menuMusic = window.menuMusic || null;

        window._abbylCheatPersist      = true;
        window._abbylCheatActive       = true;
        window._abbylCheatGlitchBlocked = true;

        // Vídeo de fundo
        if (vid) {
            vid.style.display = '';
            vid.currentTime   = 0;
            vid.play().catch(function () {});
            requestAnimationFrame(function () { vid.classList.add('active'); });
        }

        // Logo
        if (logoImg) {
            logoImg._origSrc = logoImg._origSrc || logoImg.src;
            logoImg.src = 'assets/images/logo/abbyl.png';
            logoImg.classList.remove('glitching');
        }

        // Para música do menu completamente (o vídeo tem som próprio)
        if (menuMusic) { menuMusic.pause(); menuMusic.currentTime = 0; }

        // Atualiza loja se já estiver visível
        if (typeof window._applyStoreTheme === 'function') {
            var store = document.getElementById('nero-store-screen');
            if (store && store.style.display === 'flex') window._applyStoreTheme();
        }

        // Atualiza botão do menu
        if (typeof window._updateStoreMenuBtn === 'function') window._updateStoreMenuBtn();

        if (typeof unlockAchievement === 'function') {
            unlockAchievement(ACHIEVEMENT_IDS.ABBYL_CHEAT);
        }
    }

    // ── Desativar cheat ──────────────────────────────────────────
    function _deactivateAbbylCheat(keepPersist) {
        var vid       = document.getElementById('menu-cheat-video');
        var logoImg   = document.getElementById('menu-logo-img');
        var menuMusic = window.menuMusic || null;
        var menuScreen = document.getElementById('menu-screen');

        window._abbylCheatActive        = false;
        window._abbylCheatGlitchBlocked = false;
        if (!keepPersist) window._abbylCheatPersist = false;

        // Para vídeo (cancela timeout anterior se houver)
        if (window._abbylVidHideTimer) { clearTimeout(window._abbylVidHideTimer); window._abbylVidHideTimer = null; }
        if (vid) {
            vid.classList.remove('active');
            window._abbylVidHideTimer = setTimeout(function () {
                window._abbylVidHideTimer = null;
                vid.pause();
                vid.style.display = 'none';
            }, 1000);
        }

        // Restaura logo
        if (logoImg && logoImg._origSrc) logoImg.src = logoImg._origSrc;

        // Retoma música do menu se ele estiver visível
        var menuScreen2 = document.getElementById('menu-screen');
        if (menuScreen2 && menuScreen2.style.display === 'flex') {
            if (typeof playMenuMusic === 'function') {
                playMenuMusic();
            } else if (menuMusic && menuMusic.paused) {
                menuMusic.play().catch(function () {});
            }
        }

        // Atualiza loja
        if (!keepPersist) {
            if (typeof window._applyStoreTheme === 'function') {
                var store = document.getElementById('nero-store-screen');
                if (store && store.style.display === 'flex') window._applyStoreTheme();
            }
            if (typeof window._updateStoreMenuBtn === 'function') window._updateStoreMenuBtn();
        }
    }

    // ── Cheat code: digitar "abbyl" no menu ─────────────────────
    _ready(function () {
        var menuScreen = document.getElementById('menu-screen');
        if (!menuScreen) return;

        var CHEAT_WORD  = 'abbyl';
        var cheatBuffer = '';
        var cheatActive = false;

        document.addEventListener('keydown', function (e) {
            if (typeof isTextInputTarget === 'function' && isTextInputTarget(e)) return;
            if (menuScreen.style.display === 'none') { cheatBuffer = ''; return; }
            if (e.key.length !== 1) return;

            cheatBuffer += e.key.toLowerCase();
            if (cheatBuffer.length > CHEAT_WORD.length) {
                cheatBuffer = cheatBuffer.slice(-CHEAT_WORD.length);
            }

            if (cheatBuffer === CHEAT_WORD) {
                cheatBuffer = '';
                cheatActive = !cheatActive;

                if (cheatActive) {
                    _activateAbbylCheat();
                } else {
                    _deactivateAbbylCheat(false);
                }
            }
        });

        // Observer: sincroniza o estado do vídeo com a visibilidade do menu
        var _cheatMenuObs = new MutationObserver(function () {
            if (menuScreen.style.display === 'flex') {
                // Menu voltou a aparecer
                if (window._abbylCheatPersist && !cheatActive) {
                    // Cheat estava ativo durante o jogo — restaura o vídeo
                    cheatActive = true;
                    var vid2     = document.getElementById('menu-cheat-video');
                    var logoImg2 = document.getElementById('menu-logo-img');
                    if (vid2) {
                        // Cancela qualquer hide pendente antes de mostrar
                        if (window._abbylVidHideTimer) { clearTimeout(window._abbylVidHideTimer); window._abbylVidHideTimer = null; }
                        vid2.muted = false; // desmuta ao voltar pro menu
                        vid2.style.display = '';
                        vid2.currentTime   = 0;
                        vid2.play().catch(function () {});
                        requestAnimationFrame(function () { vid2.classList.add('active'); });
                    }
                    if (logoImg2) {
                        logoImg2._origSrc = logoImg2._origSrc || logoImg2.src;
                        logoImg2.src = 'assets/images/logo/abbyl.png';
                        logoImg2.classList.remove('glitching');
                    }
                    window._abbylCheatGlitchBlocked = true;
                    // Garante que música do menu não toca por cima
                    var mm = window.menuMusic;
                    if (mm && !mm.paused) { mm.pause(); mm.currentTime = 0; }
                }
            } else {
                // Menu saiu de cena — desativa animação mas mantém persist
                if (cheatActive) {
                    cheatActive = false;
                    _deactivateAbbylCheat(true); // keepPersist=true
                }
            }
        });
        _cheatMenuObs.observe(menuScreen, { attributes: true, attributeFilter: ['style'] });
    });

    // ── GIF de save: aparece ao lado do toast quando cheat ativo ─
    // Esta função é exposta globalmente e chamada pelo sistema de save do index.html
    window._abbylShowSaveGif = function (toast) {
        if (!window._abbylCheatPersist) return;
        var gif = document.getElementById('abbyl-save-gif');
        if (!gif || !toast) return;

        requestAnimationFrame(function () {
            var toastH = toast.offsetHeight || 60;
            var toastW = toast.offsetWidth  || 270;
            gif.style.top     = (28 + toastH / 2 - 45) + 'px';
            gif.style.left    = (toastW + 4) + 'px';
            gif.style.display = 'block';
            gif.getAnimations && gif.getAnimations().forEach(function (a) { a.cancel(); });
            gif.animate([
                { transform: 'translateX(60px)', opacity: '0' },
                { transform: 'translateX(0)',    opacity: '1' }
            ], { duration: 400, easing: 'cubic-bezier(0.22,0.61,0.36,1)', fill: 'forwards' });
        });
    };

    window._abbylHideSaveGif = function () {
        var gif = document.getElementById('abbyl-save-gif');
        if (gif) gif.style.display = 'none';
    };

    // ── Sprites musume: troca personagens do jogo quando ativo ───
    var ABBYL_MUSUME_SPRITES = Object.freeze({
        abbyl:      './assets/images/ui/musume/Stay_Gold_Casual.png',
        bybyl:      './assets/images/ui/musume/Stay_Gold_Casual.png',
        aldrich:    './assets/images/ui/musume/aldrich.png',
        arabel:     './assets/images/ui/musume/arabel.png',
        nero:       './assets/images/ui/musume/nero.png',
        nina:       './assets/images/ui/musume/nina.png',
        seven:      './assets/images/ui/musume/seven.png',
        volkenburt: './assets/images/ui/musume/Eishin_Flash_(Main).png',
        furry1:     './assets/images/ui/musume/furry1.png',
        furry2:     './assets/images/ui/musume/furry2.png',
        default:    './assets/images/ui/musume/Fenomeno_(Main).png'
    });

    window._abbylResolveSprite = function (charName) {
        if (!window._abbylCheatPersist) {
            return './assets/images/characters/' + charName + '.png';
        }
        var key = String(charName || '').toLowerCase();
        if (key.startsWith('abbyl') || key === 'bybyl') {
            return './assets/images/characters/' + charName + '.png';
        }
        return ABBYL_MUSUME_SPRITES[key] || ABBYL_MUSUME_SPRITES.default;
    };

    // ── GIF dançando na transição de relógio ─────────────────────
    window._abbylCreateClockGif = function (overlay) {
        if (!window._abbylCheatPersist || !overlay) return null;
        var gif = document.createElement('img');
        gif.src = 'assets/images/ui/abbyl.gif';
        gif.style.cssText = [
            'position:absolute;z-index:2;pointer-events:none',
            'height:clamp(180px,28vh,320px);width:auto',
            'left:50%;top:50%;transform:translate(-50%,-50%) scale(0)',
            'transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            'filter:drop-shadow(0 0 18px rgba(204,0,255,0.7))'
        ].join(';');
        overlay.appendChild(gif);
        return gif;
    };

    // ── Toggle via debug menu ─────────────────────────────────────
    // O index.html chama window._abbylDebugToggle() no handler do botão debug
    window._abbylDebugToggle = function () {
        window._abbylCheatPersist = !window._abbylCheatPersist;
        window._abbylCheatActive  = window._abbylCheatPersist;

        if (window._abbylCheatPersist) {
            _activateAbbylCheat();
        } else {
            _deactivateAbbylCheat(false);
        }
    };

})();
