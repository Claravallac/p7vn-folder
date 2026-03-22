// ════════════════════════════════════════════════════════════════
// musume-store.js — Código do tema Musume Girl para a loja da Nero
// Ativo quando window._abbylCheatPersist === true
// Depende de: neroStoreScreen, neroStoreMusic, musicMuted, _globalVolume,
//             _TRACK_BASE_VOL, openNeroStoreMusic, setStoreLine, randomFrom
// ════════════════════════════════════════════════════════════════

// ── Frases da Musume Girl ────────────────────────────────────────
const MUSUME_BROWSE_LINES = Object.freeze([
    'Hoje eu treinei tanto que minhas pernas ainda estão formigando~ ♡',
    'Correr com o vento no rosto é a melhor sensação do mundo! Mas primeiro, escolhe algo ♪',
    'Uma umamusume que não se prepara direitinho não chega ao pódio! Vê o que te interessa~ ♡'
]);

const MUSUME_EXIT_LINES = Object.freeze([
    'Até a próxima! Vou treinar mais um pouco antes de dormir~ ♡',
    'Vai com tudo! Me vê na reta final ♪',
    'Cuida bem de você! Eu vou estar na pista correndo com toda minha alma ♡'
]);

const MUSUME_BUY_LINES = Object.freeze([
    'Boa escolha! Você tem o instinto de uma umamusume campeã~ ♪',
    'Isso! Com esse apoio eu corro ainda mais forte na próxima corrida!',
    'Obrigada de verdade! Cada apoio me faz querer voar mais rápido na pista ♡'
]);

const MUSUME_IDLE_LINES = Object.freeze([
    'Hmm... você está me distraindo do treino, sabia? ♪',
    'A determinação de uma umamusume na pista é algo que não tem como descrever~',
    'Eu quase saí correndo por aí de tanta energia hoje! ♡',
    'Você tem o olhar de quem não desiste nunca. Gosto muito disso ♪',
    'Na última corrida eu passei todas na reta final com tudo que eu tinha! ♡',
    'Confia em mim, o apoio certo faz toda diferença na hora de correr~',
    'Sabe o que uma umamusume precisa pra dar o melhor? Alguém que acredite nela ♡',
    'Minhas orelhas ficam bem em pé quando eu tô animada pra correr... como agora ♪',
    'A vitória ama quem treina com o coração cheio de vontade!',
    'Olha bem... seu coração já escolheu, né? ♡',
    'Quando eu corro, parece que o mundo inteiro fica pra trás~ ♪',
    'Eu acredito em você! Assim como acredito em mim quando estou na largada ♡',
]);

const MUSUME_ITEM_HOVER_LINES = Object.freeze({
    autoAdvance:  'O texto avança sozinho... assim você curte cada parte da história com calma ♡',
    hideDialogue: 'Esconde a caixinha pra apreciar cada cena sem nada na frente~ ♪',
    debugMenu:    'Um menu secretinho! Só pra quem tem o instinto afiado de uma umamusume ♡',
    dlcMestre:    'Uma história especial cheia de emoção! Prometo que vale cada moedinha~ ♪',
    dlcVolken:    'A história do Volkenburt! Ele tem uma determinação que admiro muito ♡',
    themeBlood:   'Vermelho intenso e cheio de garra! Parece a energia antes de uma largada ♪',
    themeTerminal:'Verde misterioso e brilhante! Me lembra a pista iluminada à noite~ ♡',
    themeSynthwave:'Roxo e rosa lindos! Igual ao céu quando corro no entardecer ♪',
    themeEditorial:'Elegante e delicado, como uma umamusume que corre com graça e força ♡',
    themeDeepSea: 'Azul profundo e sereno... a calma perfeita antes de explodir na largada~ ♪',
    diffLegendary: 'Dificuldade Legendary! Só pra quem tem a garra e o coração de uma umamusume ♡',
});

// ── Helper: escolhe array de frases baseado no cheat ────────────
function _storeLines(defaultLines, musumeLines) {
    return window._abbylCheatPersist ? musumeLines : defaultLines;
}

// ── Animação de boca (frames 01/02/03) ─────────────────────────
var _abbylMouthIv    = null;
var _abbylMouthFrame = false;

function _startAbbylMouthAnim() {
    if (_abbylMouthIv) return;
    var spr = document.getElementById('nero-store-sprite');
    if (!spr) return;
    _abbylMouthFrame = false;
    _abbylMouthIv = setInterval(function() {
        var spr2 = document.getElementById('nero-store-sprite');
        if (!spr2) { _stopAbbylMouthAnim(); return; }
        _abbylMouthFrame = !_abbylMouthFrame;
        spr2.src = _abbylMouthFrame
            ? 'assets/images/ui/musume/musume-char-store/03.png'
            : 'assets/images/ui/musume/musume-char-store/02.png';
    }, 120);
}

function _stopAbbylMouthAnim() {
    if (_abbylMouthIv) { clearInterval(_abbylMouthIv); _abbylMouthIv = null; }
    if (!window._abbylCheatPersist) return;
    var spr = document.getElementById('nero-store-sprite');
    if (spr) spr.src = 'assets/images/ui/musume/musume-char-store/01.png';
}

// ── Aplica/remove tema Musume na loja ───────────────────────────
window._applyStoreTheme = function _applyStoreTheme() {
    var screen = document.getElementById('nero-store-screen');
    var spr    = document.getElementById('nero-store-sprite');
    if (!screen) return;
    var musume = !!window._abbylCheatPersist;

    if (musume) {
        // Sprite
        if (spr) spr.src = 'assets/images/ui/musume/musume-char-store/01.png';
        _startAbbylMouthAnim();
        // Fundo via div dedicado (evita problemas com ::before e pseudo-elementos)
        var _bg = document.getElementById('store-bg-layer');
        if (_bg) {
            _bg.style.backgroundImage = 'linear-gradient(115deg, rgba(30,0,20,0.55) 0%, rgba(80,10,50,0.28) 45%, rgba(20,0,15,0.18) 100%), url("assets/images/ui/musume/scenary-abbyl-store.png")';
            _bg.style.opacity = '0.98';
        }
        // Tema CSS rosa
        screen.classList.add('musume-theme');
        // Nomes
        var sn = screen.querySelector('.nero-store-name');
        if (sn) sn.textContent = 'Musume Girl';
        var st = screen.querySelector('.nst-text');
        if (st) st.textContent = 'Loja Musume';
        // Esconde itens incompatíveis
        var bf = document.getElementById('store-item-fight');
        var bs = document.getElementById('store-item-secret');
        if (bf) bf.style.display = 'none';
        if (bs) bs.style.display = 'none';
        // Música
        var abbylMusic = document.getElementById('abbyl-store-music');
        if (abbylMusic) {
            var neroStoreMusic = document.getElementById('nero-store-music');
            if (neroStoreMusic) neroStoreMusic.pause();
            abbylMusic.currentTime = 0;
            abbylMusic.volume = (window._TRACK_BASE_VOL && window._TRACK_BASE_VOL.neroStoreMusic || 0.55) * (window._globalVolume || 1);
            abbylMusic.muted = !!window.musicMuted;
            abbylMusic.play().catch(function(){});
        }
    } else {
        // Sprite
        _stopAbbylMouthAnim();
        if (spr) spr.src = 'assets/images/ui/call/nero-store.gif';
        // Remove fundo musume
        var _bg2 = document.getElementById('store-bg-layer');
        if (_bg2) { _bg2.style.backgroundImage = ''; _bg2.style.opacity = '0'; }
        // Remove tema CSS
        screen.classList.remove('musume-theme');
        // Nomes originais
        var sn2 = screen.querySelector('.nero-store-name');
        if (sn2) sn2.textContent = 'Nero';
        var st2 = screen.querySelector('.nst-text');
        if (st2) st2.textContent = 'Loja da Nero';
        // Restaura itens
        var bf2 = document.getElementById('store-item-fight');
        var bs2 = document.getElementById('store-item-secret');
        if (bf2) bf2.style.display = '';
        if (bs2) bs2.style.display = '';
        // Música original
        if (typeof openNeroStoreMusic === 'function') openNeroStoreMusic();
    }
    // Atualiza botão do menu
    _updateStoreMenuBtn();
};

// ── Atualiza nome do botão do menu principal ─────────────────────
window._updateStoreMenuBtn = function _updateStoreMenuBtn() {
    var el = document.getElementById('store-menu-name');
    if (el) el.textContent = window._abbylCheatPersist ? 'Loja Musume' : 'Loja da Nero';
};

function _updateStoreMenuBtn() { window._updateStoreMenuBtn(); }
