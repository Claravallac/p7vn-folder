// ===== DIÁLOGOS =====
const chapters = {
  0: {
    title: "PRÓLOGO",
    bg: null,
    timeCard: {
      time:     "02:14",
      period:   "MADRUGADA",
      date:     "SEG  ·  12 DE JANEIRO",
      location: "???"
    },
    next: 1,
    lines: [
      { speaker: "Nero", text: "Finalmente!" },
      { speaker: "Nero", text: "Eu sabia que era real, agora finalmente poderemos tomar conta de tudo!" },
      { speaker: "Arabel", text: "Isso é mesmo incrível, mal vejo a hora de governar esse mundo ao seu lado, sem ninguém sequer pensar em nos impedir!" },
      { speaker: "Nero", text: "Impedir? É impossível até pensar sobre isso, afinal, quem descobria sobre isso?" }
    ]
  },
  1: {
    title: "Capítulo 1 - A Descoberta",
    bg: "bg_cap1.jpg",
    timeCard: {
      time:     "14:15",
      period:   "TARDE",
      date:     "SEG  ·  13 DE JANEIRO",
      location: "Laboratório da Abbyl"
    },
    next: 2,
    lines: [
      { speaker: "Aldrich Pudding", text: "Abbyl!", left: "aldrich", right: null },
      { speaker: "Aldrich Pudding", text: "Eu já falei para você não atrapalhar meus desenhos para me mostrar essas invenções estranhas", left: "aldrich", right: null },
      { speaker: "Abbyl", text: "Dessa vez é algo realmente incrível, veja, você só precisa fechar os olhos enquanto eu coloco esse equipamento nada estranho na sua testa", left: "abbyl", right: "aldrich" },
      { speaker: "Aldrich Pudding", text: "Eu não sou bobo, Abbyl.", left: "aldrich", right: "abbyl" },
      { speaker: "Abbyl", text: "Qual é, Pudding, me ajuda com isso, eu só tenho você.", left: "abbyl", right: "aldrich" },
      { speaker: "Aldrich Pudding", text: "Tá bom, mas só essa vez, eu realmente preciso desenhar", left: "aldrich", right: "abbyl" },
      { speaker: "Abbyl", text: "Maravilha! Eu prometo que não vai demorar nadinha!", left: "abbyl", right: null },
      { speaker: "Narrador", text: "[Brilho na tela]", left: null, right: null, trigger: "screenFlash", bg: "scenes/vrchat.jpg" },
      { speaker: "Narrador", text: "[Aldrich Pudding aparece dentro do VR chat com o seu corpo físico]", left: null, right: null },
      { speaker: "Abbyl", text: "Então, o que achou?", left: "abbyl", right: null },
      { speaker: "Aldrich Pudding", text: "Eu nunca pensei que você iria tão longe assim na falta do que fazer", left: "aldrich", right: "abbyl" },
      { speaker: "Abbyl", text: "Isso não te impressionou?", left: "abbyl", right: "aldrich" },
      { speaker: "Aldrich Pudding", text: "Sinceramente, o que me impressiona é quando não me pedem para desenhar uma grávida em plena 3 da manhã", left: "aldrich", right: "abbyl" },
      { speaker: "Abbyl", text: "Não sabia que você tinha uma opinião tão forte sobre isso...", left: "abbyl", right: "aldrich" },
      { speaker: "Voz ao longe", text: "Aldrich??? Abbyl???", left: null, right: null },
      { speaker: "Abbyl", text: "quem será?", left: "abbyl", right: null },
      { speaker: "Aldrich Pudding", text: "sei lá.", left: "aldrich", right: null },
      { speaker: "Voz ao longe", text: "Cocada é paia, Celeste é ruim, Quero mulher que não seja doida da cabeça", left: null, right: null },
      { speaker: "Abbyl e Aldrich", text: "É o Seven -_-", left: "abbyl", right: "aldrich" },
      { speaker: "Seven", text: "Onde cês tão? Eu vou acabar com cês, vey, hahaha", left: "seven", right: null, bg: "scenes/abbyl-laboratorio.jpeg" },
      { speaker: "Abbyl", text: "Eu não posso deixar esse doido sozinho no meu laboratório, vamos voltar", left: "abbyl", right: "aldrich", bg: "scenes/vrchat.jpg" },
      { speaker: "Aldrich Pudding", text: "Você tem um laboratório agora é? O roteirista me deixou tão ocupado com desenho quanto na vida real, vejo padrões aqui sobre favoritismo.", left: "aldrich", right: "abbyl" }
    ]
  },
  2: {
    title: "Capítulo 1.2 - O Retorno",
    bg: "bg_cap1.jpg",
    timeCard: {
      time:     "14:43",
      period:   "TARDE",
      date:     "SEG  ·  13 DE JANEIRO",
      location: "Laboratório da Abbyl"
    },
    next: null,
    lines: [
      { speaker: "Abbyl", text: "Não toque em nada, seu doido!", left: "abbyl", right: null },
      { speaker: "Seven", text: "Eu só ia chamar vocês pra um Vavazinho, mas voc... Hey, Pudding, o que é isso na sua testa?", left: "seven", right: null },
      { speaker: "Aldrich Pudding", text: "Mais uma invenção doida do Abbyl, agora sai da frente, preciso ir desenhar.", left: "aldrich", right: "seven" },
      { speaker: "Seven", text: "Oh, que legal, o que isso faz, Abbyl?", left: "seven", right: "abbyl" },
      { speaker: "Abbyl", text: "Bem, isso aí...", left: "abbyl", right: "seven" },
      { speaker: "Seven", text: "Você mesmo fez isso?", left: "seven", right: "abbyl" },
      { speaker: "Abbyl", text: "Si-", left: "abbyl", right: "seven" },
      { speaker: "Seven", text: "Você colocou uma bios nele?", left: "seven", right: "abbyl" },
      { speaker: "Abbyl", text: "Bem, não sei se...", left: "abbyl", right: "seven" },
      { speaker: "Seven", text: "Será que existe uma forma de fazer uma bios modificada?", left: "seven", right: "abbyl" },
      { speaker: "Narrador", text: "Seven sai de repente antes que Abbyl possa responder após pegar um ar", left: null, right: null },
      { speaker: "Narrador", text: "Seven começa a mandar Reels para o celular de Abbyl", left: null, right: null },
      { speaker: "Abbyl", text: "Esse cara não muda...", left: "abbyl", right: null },
      { speaker: "Nina", text: "Não acha que vai escapar, não, bybyl", left: "nina", right: "abbyl" },
      { speaker: "Narrador", text: "A partir de agora, Abbyl será referido até ao fim do game como Bybyl", left: null, right: null },
      { speaker: "Bybyl", text: "Sabe, às vezes eu não entendo o porquê me sabotaram tanto assim", left: "abbyl", right: null }
    ]
  }
};