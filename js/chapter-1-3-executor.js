// ===== CAPÍTULO 1.3 - EXECUÇÃO DOS DIÁLOGOS =====
// Sequência completa da call do Discord

class Chapter13DiscordCall {
  constructor() {
    this.dialogueIndex = 0;
    this.dialogueSequence = [
      // Cena inicial
      { action: "addDialog", speaker: "Narrador", text: "[Estava rolando uma Call no server do Discord entre Seven e Pudding]" },
      
      // Abbyl entra
      { action: "addUser", userId: "abbyl" },
      { delay: 800 },
      { action: "addDialog", speaker: "Abbyl", text: "Então, qual a boa, pessoal?", userId: "abbyl" },
      
      // Seven responde
      { delay: 800 },
      { action: "addDialog", speaker: "Seven", text: "Nada demais, tava aqui mandando uns Reels pro pessoal, o Pudding tá desenhando, eu acho", userId: "seven" },
      
      // Diálogo
      { delay: 800 },
      { action: "addDialog", speaker: "Abbyl", text: "Deixa eu ver se entendi, vocês estão em Call pra nada?", userId: "abbyl" },
      
      { delay: 800 },
      { action: "addDialog", speaker: "Seven", text: "Não é bem 'pra nada' se ele precisar, vai me chamar, e se eu precisar, eu irei chamar", userId: "seven" },
      
      { delay: 800 },
      { action: "addDialog", speaker: "Abbyl", text: "Não é mais fácil só ligar pelo WhatsApp?", userId: "abbyl" },
      
      { delay: 800 },
      { action: "addDialog", speaker: "Seven", text: "Não tá constando, muito trampo", userId: "seven" },
      
      { delay: 800 },
      { action: "addDialog", speaker: "Abbyl", text: "Relação estranha essa aí de vocês.", userId: "abbyl" },
      
      // Volkenburt entra
      { delay: 1200 },
      { action: "addUser", userId: "volkenburt" },
      { delay: 800 },
      { action: "addDialog", speaker: "Volkenburt", text: "E aí pessoal", userId: "volkenburt" },
      
      // Reação
      { delay: 800 },
      { action: "addDialog", speaker: "Abbyl", text: "Opa, Volken, tudo bom?", userId: "abbyl" },
      { action: "addDialog", speaker: "Seven", text: "Opa, Volken, tudo bom?", userId: "seven" },
      
      // Volkenburt vai compartilhar
      { delay: 1000 },
      { action: "addDialog", speaker: "Volkenburt", text: "Olha o tanque que eu fiz", userId: "volkenburt" },
      
      // Screen share ativa
      { delay: 800 },
      { action: "startScreenShare" },
      { delay: 3500 }, // 3 segundos do vídeo + transição
      
      // Reações
      { action: "addDialog", speaker: "Abbyl", text: "Você é realmente bom nisso.", userId: "abbyl" },
      { delay: 600 },
      { action: "addDialog", speaker: "Seven", text: "Você é realmente bom nisso.", userId: "seven" },
      
      // Transição temporal
      { delay: 2000 },
      { action: "addDialog", speaker: "Narrador", text: "[Um tempo se passa...]" },
      
      // Abbyl questiona
      { delay: 1200 },
      { action: "addDialog", speaker: "Abbyl", text: "Vocês não estão achando essa Call um pouco chata, não?", userId: "abbyl" },
      
      { delay: 800 },
      { action: "addDialog", speaker: "Seven", text: "Mais ou menos.", userId: "seven" },
      { action: "addDialog", speaker: "Volkenburt", text: "Mais ou menos.", userId: "volkenburt" },
      
      // Abbyl tenta contar algo
      { delay: 1000 },
      { action: "addDialog", speaker: "Abbyl", text: "Bem, é que eu...", userId: "abbyl" },
      
      { delay: 800 },
      { action: "addDialog", speaker: "Abbyl", text: "Olha, dá pra por favor voltar com o meu nick normal?", userId: "abbyl" },
      
      // Nick change
      { delay: 1000 },
      { action: "addDialog", speaker: "Narrador", text: "[Bybyl volta a ser Abbyl]" },
      { delay: 800 },
      { action: "addDialog", speaker: "Abbyl", text: "Melhor, enfim", userId: "abbyl" },
      
      // Revista a grande invenção
      { delay: 1000 },
      { action: "addDialog", speaker: "Abbyl", text: "Eu fiz um aparelho que acessa o universo paralelo", userId: "abbyl" },
      
      // Reações céticas
      { delay: 1000 },
      { action: "addDialog", speaker: "Volkenburt", text: "Cara, você deve tá é doido da cabeça", userId: "volkenburt" },
      
      { delay: 800 },
      { action: "addDialog", speaker: "Seven", text: "Você fez sim, Abbyl, toma aqui o seu remédio.", userId: "seven" },
      
      // Abbyl frustrado
      { delay: 1200 },
      { action: "addDialog", speaker: "Abbyl", text: "Ninguém me leva a sério aqui...", userId: "abbyl" },
      
      // Momento dramático
      { delay: 1500 },
      { action: "dramaticMoment" },
      { action: "addDialog", speaker: "Narrador", text: "[Som de click dramático, fundo fica escuro]" },
      
      { delay: 1000 },
      { action: "addDialog", speaker: "Abbyl", text: "Será que ninguém aqui liga para o que eu faço?", userId: "abbyl" },
      
      // Voz misteriosa aparece!
      { delay: 1200 },
      { action: "addDialog", speaker: "Voz misteriosa", text: "Eu ligo." },
      
      // Fim do capítulo
      { delay: 2000 },
      { action: "complete" }
    ];
  }

  // Executar a sequência de diálogos
  async execute() {
    console.log("🎬 Iniciando Capítulo 1.3 - Discord Call");
    
    // Inicializar sistema de call Discord
    discordCallSystem.init();
    console.log("✅ Sistema Discord inicializado");
    console.log("🔄 Começando sequência com", this.dialogueSequence.length, "passos");
    
    // Wait primeiro por fade in da cena
    await this.sleep(500);
    
    // Executar sequência
    for (let i = 0; i < this.dialogueSequence.length; i++) {
      const step = this.dialogueSequence[i];
      console.log(`📍 Passo ${i + 1}/${this.dialogueSequence.length}:`, step.action || step.delay);
      
      // Handle delays
      if (step.delay) {
        await this.sleep(step.delay);
        continue;
      }
      
      // Handle actions
      switch (step.action) {
        case "addDialog":
          let dialogText = step.text;
          if (window._abbylCheatPersist) {
            if (step.speaker === "Volkenburt" && step.text === "Olha o tanque que eu fiz") {
              dialogText = "Olha que fofinha ela toda animadinha";
            }
            if ((step.speaker === "Abbyl" || step.speaker === "Seven") && step.text === "Você é realmente bom nisso.") {
              dialogText = "Kojima o que você fez?";
            }
          }
          discordCallSystem.addDialog(step.speaker, dialogText, step.userId);
          break;
          
        case "addUser":
          discordCallSystem.addUser(step.userId, true);
          break;
          
        case "removeUser":
          discordCallSystem.removeUser(step.userId, true);
          break;
          
        case "startScreenShare":
          discordCallSystem.startScreenShare();
          break;
          
        case "stopScreenShare":
          discordCallSystem.stopScreenShare();
          break;
          
        case "dramaticMoment":
          discordCallSystem.dramaticMoment();
          break;
          
        case "complete":
          await this.onChapterComplete();
          break;
      }
    }
  }

  // Esperar X milissegundos
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Quando o capítulo termina
  async onChapterComplete() {
    console.log("✅ Capítulo 1.3 concluído!");
    
    // Limpar
    discordCallSystem.cleanup();
    
    // Transição para próximo capítulo (ou menu)
    await this.sleep(2000);
    
    // TODO: Implementar transição para Capítulo 3 ou próxima cena
    if (window.chapters && window.chapters[3]) {
      // Carregar Capítulo 3
      console.log("Próximo capítulo: Capítulo 3 - Chamar Aldrich");
    }
  }
}

// Função para iniciar o capítulo 1.3
function startChapter13() {
  console.log("▶️ startChapter13() chamada");
  
  if (!window.discordCallSystem) {
    console.error("❌ Discord Call System não foi carregado!");
    return;
  }
  
  console.log("✅ Discord Call System existe");
  const chapter = new Chapter13DiscordCall();
  console.log("✅ Executor criado");
  
  chapter.execute().then(() => {
    console.log("✅ Capítulo 1.3 completado!");
  }).catch(err => {
    console.error("❌ Erro ao executar Capítulo 1.3:", err);
  });
}

// Export para uso global
window.Chapter13DiscordCall = Chapter13DiscordCall;
window.startChapter13 = startChapter13;
