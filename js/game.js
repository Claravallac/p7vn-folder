console.log('Himari Games - Visual Novel iniciada');

// Capítulos
const chapters = {
  1: {
    title: "Capítulo 1 - A Descoberta",
    bg: "bg_cap1.jpg",
    lines: [
      { speaker: "Abbyl", text: "Consegui! Descobri como entrar no VR Chat com a mente!", left: "abbyl", right: null },
      { speaker: "Abbyl", text: "É como se eu estivesse realmente lá... incrível!", left: "abbyl", right: null },
      { speaker: "Nero", text: "Interessante... nós já sabíamos disso há tempos.", left: null, right: "nero" }
    ]
  },
  2: {
    title: "Capítulo 2 - A Sabotagem",
    bg: "bg_cap2.jpg",
    lines: [
      { speaker: "Arabel", text: "Com menos pessoas, teremos mais controle sobre o VR Chat.", left: "arabel", right: null },
      { speaker: "Nero", text: "Exato. Vamos dominar tudo.", left: null, right: "nero" }
    ]
  },
  3: {
    title: "Capítulo 3 - O Confronto",
    bg: "bg_cap3.jpg",
    lines: [
      { speaker: "Abbyl", text: "Não vou deixar isso acontecer!", left: "abbyl_irritado", right: null }
    ]
  },
  4: {
    title: "Capítulo 4 - O Fim?",
    bg: "bg_cap4.jpg",
    lines: [
      { speaker: "Abbyl", text: "Ainda há esperança...", left: "abbyl", right: null },
      { speaker: "Aldrich", text: "Não tão rápido...", left: "aldrich", right: "abbyl" }
    ]
  }
};

// Elementos DOM
const bgImage = document.getElementById('bg-image');
const charLeft = document.getElementById('char-left-img');
const charRight = document.getElementById('char-right-img');
const speakerName = document.getElementById('speaker-name');
const dialogueText = document.getElementById('dialogue-text');
const nextIndicator = document.getElementById('next-indicator');
const dialogueBox = document.getElementById('dialogue-box');

// Telas
const mainMenu = document.getElementById('main-menu');
const chapterSelector = document.getElementById('chapter-selector');
const optionsScreen = document.getElementById('options-screen');

// Estado do jogo
let currentChapter = null;
let currentLineIndex = 0;

// Função para esconder todas as telas
function hideAllScreens() {
  mainMenu.style.display = 'none';
  chapterSelector.style.display = 'none';
  optionsScreen.style.display = 'none';
}

// Função para mostrar o diálogo
function showDialogue() {
  dialogueBox.style.display = 'block';
}

// Função para esconder o diálogo
function hideDialogue() {
  dialogueBox.style.display = 'none';
  speakerName.innerText = '';
  dialogueText.innerText = '';
  charLeft.style.display = 'none';
  charRight.style.display = 'none';
}

// Função para carregar capítulo
function loadChapter(chapterId) {
  const chapter = chapters[chapterId];
  if (!chapter) return;
  
  currentChapter = chapter;
  currentLineIndex = 0;
  
  // Fundo
  bgImage.src = `./assets/images/${chapter.bg}`;
  bgImage.onerror = () => {
    bgImage.style.display = 'none';
    document.getElementById('background').style.backgroundColor = '#2a0f1a';
  };
  bgImage.onload = () => {
    bgImage.style.display = 'block';
  };

  hideAllScreens();
  showDialogue();
  showCurrentLine();
}

// Exibe linha atual
function showCurrentLine() {
  if (!currentChapter) return;
  
  const line = currentChapter.lines[currentLineIndex];
  if (!line) {
    endChapter();
    return;
  }

  speakerName.innerText = line.speaker || '';
  dialogueText.innerText = line.text;

  // Personagem esquerdo
  if (line.left) {
    charLeft.src = `./assets/images/characters/${line.left}.png`;
    charLeft.style.display = 'block';
    charLeft.onerror = () => { charLeft.style.display = 'none'; };
  } else {
    charLeft.style.display = 'none';
  }

  // Personagem direito
  if (line.right) {
    charRight.src = `./assets/images/characters/${line.right}.png`;
    charRight.style.display = 'block';
    charRight.onerror = () => { charRight.style.display = 'none'; };
  } else {
    charRight.style.display = 'none';
  }
}

// Próxima linha
function nextLine() {
  if (!currentChapter) return;
  
  if (currentLineIndex < currentChapter.lines.length - 1) {
    currentLineIndex++;
    showCurrentLine();
  } else {
    endChapter();
  }
}

// Fim do capítulo
function endChapter() {
  hideDialogue();
  mainMenu.style.display = 'flex';
}

// Eventos de clique
nextIndicator.addEventListener('click', nextLine);
document.getElementById('game-container').addEventListener('click', (e) => {
  if (e.target === nextIndicator) return;
  if (mainMenu.style.display !== 'none' || 
      chapterSelector.style.display !== 'none' || 
      optionsScreen.style.display !== 'none') return;
  nextLine();
});

// Menu principal
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    hideAllScreens();
    if (target === 'chapters') {
      chapterSelector.style.display = 'block';
    } else if (target === 'options') {
      optionsScreen.style.display = 'block';
    } else if (target === 'exit') {
      if (window.electronAPI && window.electronAPI.closeWindow) {
        window.electronAPI.closeWindow();
      } else {
        window.close();
      }
    }
  });
});

// Botões de capítulo
document.querySelectorAll('.chapter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const chapterId = parseInt(btn.dataset.chapter);
    loadChapter(chapterId);
  });
});

// Botões voltar
document.getElementById('back-to-menu').addEventListener('click', () => {
  hideAllScreens();
  mainMenu.style.display = 'flex';
});
document.getElementById('back-to-menu-options').addEventListener('click', () => {
  hideAllScreens();
  mainMenu.style.display = 'flex';
});

// Inicia com menu principal visível
hideAllScreens();
mainMenu.style.display = 'flex';
hideDialogue();