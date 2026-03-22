// História do VRChat

const historyData = [
    {
        image: 'intro/universo.png',
        text: 'Há algum tempo, existiu um universo-espelho, as pessoas costumavam usar ele para descansar o corpo e a mente',
        music: 'history.mp3'
    },
    {
        image: 'intro/guerras.png',
        text: 'Porém, depois de um tempo, após várias guerras, e moggadas sinistras, esse universo foi esquecido pela humanidade... Até que...',
        music: 'history.mp3'
    },
    {
        image: 'intro/nerd.png',
        text: 'Um nerd random aleatório acabou descobrindo uma forma de acessar isso enquanto fazia coisas feias no seu VR (que ganhou dos pais)',
        music: 'creeppy.mp3'
    },
    {
        image: 'intro/vrchat.png',
        text: 'Após isso, ele criou o que as pessoas chamam de VRChat, um local que antes era de paz e descanso, virou um antro de esquisitos e furrys pelados...',
        music: 'creeppy.mp3'
    },
    {
        image: null,
        text: 'E o Seven.',
        music: null
    },
    {
        image: null,
        text: 'E assim, estamos nos dias atuais',
        music: null
    }
];

let historyIndex = 0;
let historyMusic = null;
let currentHistoryMusic = null;
let historyCanAdvance = false;
let historyTypeInterval = null;
let historyIsTyping = false;
let historyFullText = '';
let historyAutoTimer = null;

function historyTypeText(element, text, speed, onDone) {
    if (historyTypeInterval) clearInterval(historyTypeInterval);
    historyFullText = text;
    historyIsTyping = true;
    historyCanAdvance = false;
    element.textContent = '';
    let accumulated = '';
    let i = 0;
    historyTypeInterval = setInterval(() => {
        if (i < text.length) {
            accumulated += text.charAt(i);
            element.textContent = accumulated;
            i++;
        } else {
            clearInterval(historyTypeInterval);
            historyTypeInterval = null;
            historyIsTyping = false;
            // Avança automaticamente após 3s de leitura
            historyAutoTimer = setTimeout(() => {
                historyCanAdvance = true;
                nextHistorySlide();
            }, 3000);
            if (onDone) onDone();
        }
    }, speed);
}

function historyFinishTyping(element) {
    if (historyTypeInterval) clearInterval(historyTypeInterval);
    historyTypeInterval = null;
    historyIsTyping = false;
    element.textContent = historyFullText;
    setTimeout(() => { historyCanAdvance = true; }, 1500);
}

var _historyFadeIv = null;
function fadeOutMusic(audio, callback) {
    // Cancela fade anterior se existir
    if (_historyFadeIv) { clearInterval(_historyFadeIv); _historyFadeIv = null; }
    const fadeStep = 0.05;
    _historyFadeIv = setInterval(() => {
        if (audio.volume > fadeStep) {
            audio.volume -= fadeStep;
        } else {
            audio.volume = 0;
            audio.pause();
            clearInterval(_historyFadeIv);
            _historyFadeIv = null;
            if (callback) callback();
        }
    }, 50);
}

function _doStartHistory() {
    historyIndex = 0;
    // Reseta estado de música para garantir que a primeira slide toque sempre
    currentHistoryMusic = null;
    historyMusic = null;

    // Aug cheat: injeta slide especial no início da história
    if (window._augCheatActive && !(historyData[0] && historyData[0]._augInjected)) {
        historyData.unshift({ _augInjected: true, image: null, text: 'Desculpe, Aug, nessa demo não terá você, mas você ao menos terá um cheat para chamar de seu', music: null });
    } else if (!window._augCheatActive && historyData[0] && historyData[0]._augInjected) {
        historyData.shift();
    }

    const historyScreen = document.getElementById('history-screen');
    const historyImage = document.getElementById('history-image');
    const historyText = document.getElementById('history-text');

    historyScreen.style.display = 'flex';
    historyImage.style.opacity = '0';
    historyText.style.opacity = '0';

    showHistorySlide();
}

function startHistory() {
    if (typeof window._pendingFadeRelease === 'function') {
        window._pendingFadeRelease();
    }
    _doStartHistory();
}

function showHistorySlide() {
    const slide = historyData[historyIndex];
    const historyImage = document.getElementById('history-image');
    const historyText = document.getElementById('history-text');
    
    // Fade out
    historyImage.style.opacity = '0';
    historyText.style.opacity = '0';
    
    setTimeout(() => {
        // Trocar música se necessário
        // Se a mesma música está tocando mas com volume baixo (fade interrompido), restaura
        if (historyMusic && slide.music && slide.music === currentHistoryMusic && historyMusic.volume < 0.35) {
            historyMusic.volume = 0.4 * (window._globalVolume !== undefined ? window._globalVolume : 1);
        }
        if (slide.music && slide.music !== currentHistoryMusic) {
            if (historyMusic) {
                fadeOutMusic(historyMusic, () => {
                    historyMusic = new Audio(`./assets/audio/${slide.music}`);
                    historyMusic.loop = true;
                    historyMusic.volume = 0.4 * (window._globalVolume !== undefined ? window._globalVolume : 1);
                    historyMusic.muted = !!window._musicMuted;
                    historyMusic.play().catch(() => {});
                    currentHistoryMusic = slide.music;
                });
            } else {
                historyMusic = new Audio(`./assets/audio/${slide.music}`);
                historyMusic.loop = true;
                historyMusic.volume = 0.4 * (window._globalVolume !== undefined ? window._globalVolume : 1);
                historyMusic.muted = !!window._musicMuted;
                historyMusic.play().catch(() => {});
                currentHistoryMusic = slide.music;
            }
        } else if (slide.music === null && historyMusic) {
            fadeOutMusic(historyMusic);
            historyMusic = null;
            currentHistoryMusic = null;
        }
        
        // Atualizar conteúdo
        if (slide.image) {
            historyImage.src = `./assets/images/${slide.image}`;
            historyImage.style.display = 'block';
            historyImage.style.animation = 'none';
            historyImage.offsetHeight; // Force reflow
            historyImage.style.animation = 'historyZoom 8s ease-out forwards';
        } else {
            historyImage.style.display = 'none';
        }
        
        historyText.textContent = '';
        
        // Fade in (imagem visível, texto começa vazio e será digitado)
        setTimeout(() => {
            historyImage.style.opacity = '1';
            historyText.style.opacity = '1';
        }, 100);
        
        // Iniciar digitação após o fade-in (60ms/char = lento e dramático)
        setTimeout(() => {
            var spd = 60;
            if (window._textSpeedMode === 'fast') spd = 28;
            else if (window._textSpeedMode === 'slow') spd = 90;
            historyTypeText(historyText, slide.text, spd, null);
        }, 200);
    }, 800);
}

function nextHistorySlide() {
    const historyText = document.getElementById('history-text');
    if (historyAutoTimer) { clearTimeout(historyAutoTimer); historyAutoTimer = null; }
    // Se ainda está digitando, mostra o texto completo em vez de avançar
    if (historyIsTyping) {
        historyFinishTyping(historyText);
        return;
    }
    // Digitação terminou: avança sempre, mesmo que historyCanAdvance ainda seja false
    // (evita travamento em slides sem imagem/música onde o autoTimer demora 3s)
    historyCanAdvance = false;
    historyIsTyping = true;
    historyIndex++;
    if (historyIndex >= historyData.length) {
        endHistory();
    } else {
        showHistorySlide();
    }
}

function endHistory(reason) {
    if ((reason === 'button-skip' || reason === 'y-hold') && typeof window.notifyPrologueSkipped === 'function') {
        window.notifyPrologueSkipped(reason);
    }
    const historyScreen = document.getElementById('history-screen');
    // Remove slide aug injetado para não duplicar na próxima vez
    if (historyData[0] && historyData[0]._augInjected) historyData.shift();
    // Para digitação caso esteja em andamento
    if (historyAutoTimer) { clearTimeout(historyAutoTimer); historyAutoTimer = null; }
    if (historyTypeInterval) { clearInterval(historyTypeInterval); historyTypeInterval = null; }
    historyIsTyping = false;
    historyCanAdvance = false;
    historyScreen.style.opacity = '0';
    
    if (historyMusic) {
        historyMusic.pause();
        historyMusic.currentTime = 0;
        historyMusic = null;
    }
    
    setTimeout(() => {
        historyScreen.style.display = 'none';
        historyScreen.style.opacity = '1';
        loadChapter(0); // Ir para o prólogo
    }, 1000);
}

window.startHistory = startHistory;
window.nextHistorySlide = nextHistorySlide;
window.endHistory = endHistory;