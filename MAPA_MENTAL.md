# MAPA MENTAL - VR CHAT STORY

## FLUXO PRINCIPAL DO JOGO

```
INTRO (Himari Games)
    ↓
MENU PRINCIPAL
    ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  PRÓLOGO (Capítulo 0)                                    │
│  - Introdução da história                                │
│  - Apresentação dos personagens                          │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  CAPÍTULO 1                                              │
│  - Desenvolvimento da narrativa                          │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  CAPÍTULO 1.2                                            │
│  - Continuação                                           │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  CAPÍTULO 1.3 - CALL DO DISCORD                          │
│  - Layout de Call Discord (avatares redondos)            │
│  - Background: discord.png com blur                       │
│  - Usuários entram/saem dinamicamente (som entrar.mp3)   │
│  - Screen share de Volkenburt (transmissão.mp3)          │
│  - Diálogos casuais entre Seven, Pudding e Volkenburt   │
│  - Abbyl revela sua invenção (aparelho paralelo)         │
│  - Clímax: Voz misteriosa aparece                        │
│  - Bordas verdes nas fotos dos personagens ativos        │
│                                                           │
│  Personagens presentes:                                   │
│  • Seven (já estava) - Mandando Reels                    │
│  • Pudding/Aldrich (já estava) - Desenhando              │
│  • Abbyl - Entra na call                                 │
│  • Volkenburt - Entra depois, compartilha vídeo          │
│  • Voz Misteriosa - Aparece no final                     │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  CAPÍTULO 3 - CHAMAR ALDRICH (Minigame)                 │
│  - Minigame de chamada telefônica                        │
│  - 10 tentativas para Aldrich atender                    │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  BOSS ARABEL - INTRODUÇÃO                                │
│  - Dev aparece perguntando sobre quiz                    │
│  - Escolha: SIM ou NÃO                                   │
│                                                           │
│  ┌─────────────────┐         ┌─────────────────┐        │
│  │   ESCOLHA SIM   │         │  ESCOLHA NÃO    │        │
│  │   (Quiz)        │         │  (Pula quiz)    │        │
│  └────────┬────────┘         └────────┬────────┘        │
│           │                           │                  │
│           └───────────┬───────────────┘                  │
│                       ↓                                  │
└───────────────────────┬───────────────────────────────────┘
                        ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  BATALHA ARABEL (Estilo Undertale)                       │
│  - Sistema de combate por turnos                         │
│  - Dodge de projéteis                                    │
│  - Sistema de timing para ataques                        │
│  - HP: Variável                                          │
│                                                           │
│  Ações disponíveis:                                      │
│  • FIGHT - Atacar com timing                             │
│  • ACT - Ações especiais                                 │
│  • ITEM - Usar itens do inventário                       │
│  • MERCY - Poupar (não disponível)                       │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
              [ARABEL DERROTADA]
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  TRANSIÇÃO ARABEL → NERO                                 │
│  - Tela pisca (efeito dramático)                         │
│  - Sprite da Arabel desaparece                           │
│  - Sprite da Nero aparece                                │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  BATALHA NERO (Estilo Undertale)                         │
│  - HP Inicial: 10000                                     │
│  - Sistema de combate similar à Arabel                   │
│  - Fase 1: Batalha normal                                │
│                                                           │
│  Ações disponíveis:                                      │
│  • FIGHT - Atacar com timing                             │
│  • ACT - Ações especiais                                 │
│  • ITEM - Usar itens do inventário                       │
│  • MERCY - Poupar (bloqueado inicialmente)               │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
              [NERO HP ≤ 10]
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  FASE 2 - NERO SE CURA                                   │
│  - Nero: "Não vai ser tão fácil assim..."               │
│  - HP restaurado: 10 → 10000                             │
│  - MERCY desbloqueado                                    │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  SISTEMA DE MERCY (4 vezes)                              │
│                                                           │
│  1ª Mercy: "Você quer me poupar agora, é? Que engraçado" │
│  2ª Mercy: "Você acha que eu vou esquecer de tudo?"      │
│  3ª Mercy: "Não tem mais volta, Abbyl."                  │
│  4ª Mercy: VOZ MISTERIOSA APARECE                        │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  CUTSCENE - VOZ MISTERIOSA                               │
│  - Tela escurece                                         │
│  - Som de vento                                          │
│  - Música de batalha diminui                             │
│  - Voz: "Você realmente quer salvar ela?"                │
│  - Voz: "Então... use isso."                             │
│  - ITEM RECEBIDO: Biscoito com Goiabada 🍪               │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
        [BATALHA NERO CONTINUA]
        [Player pode usar o biscoito]
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  USAR BISCOITO NA NERO                                   │
│  - Nero come o biscoito                                  │
│  - Biscoito está ENVENENADO                              │
│  - Nero é derrotada pelo veneno                          │
│  - NERO MORRE                                            │
│  - Batalha termina                                       │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
              [NERO DERROTADA]
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ENDING 9999 - ABBYL CAMINHANDO                          │
│  - Mundo escuro e nebuloso                               │
│  - Abbyl caminha sozinho (WASD/Setas)                    │
│  - Pensamentos aparecem periodicamente                   │
│  - Efeitos de glitch e pixels corrompidos                │
│  - Som de vento constante                                │
│  - Duração: 1 minuto                                     │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
        [APÓS 1 MINUTO DE CAMINHADA]
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  VOZ MISTERIOSA RETORNA                                  │
│  - Voz: "Ainda sobrou um pouquinho, vamos, coma também"  │
│  - Tela escurece                                         │
│  - Som de click                                          │
│  - Cursor pisca no Abbyl                                 │
│  - Abbyl é arrastado para posição de inimigo             │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  BATALHA ABBYL (Especial)                                │
│  - Abbyl aparece como "inimigo"                          │
│  - Sprite em grayscale                                   │
│  - Apenas botão ITEM disponível                          │
│  - Inventário mostra apenas: Biscoito com Goiabada       │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
        [USAR BISCOITO NO ABBYL]
                      ↓
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  FINAL VERDADEIRO (Em desenvolvimento)                   │
│  - "Você comeu o Biscoito com Goiabada."                 │
│  - "..."                                                 │
│  - "Você sente algo estranho..."                         │
│  - Fade to black                                         │
│  - [TODO: Implementar final verdadeiro]                  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## SISTEMAS DO JOGO

### Sistema de Batalha (Undertale-style)
- **Arquivos**: `battle-core.js`, `battle-arabel.js`, `battle-nero.js`
- **Mecânicas**:
  - Turnos: Player → Enemy → Player
  - Dodge de projéteis (WASD/Setas)
  - Sistema de timing para ataques
  - HP, inventário, ações

### Sistema de Inventário
- **Arquivo**: `inventory.js`
- **Itens especiais**:
  - Biscoito com Goiabada (item chave)
  - Itens de cura (debug)

### Sistema de Diálogos
- **Arquivo**: `dialogue.js`
- **Recursos**:
  - Texto digitado letra por letra
  - Sprites de personagens
  - Backgrounds dinâmicos
  - Sistema de escolhas

### Endings
- **Arquivo**: `ending-9999.js`
- **Ending 9999**: Abbyl caminhando no vazio
- **Final Verdadeiro**: Em desenvolvimento

## DEBUG SHORTCUTS

### Atalhos de Teclado (durante gameplay)
- `debug` - Adiciona item de cura debug
- `biscoito` - Adiciona biscoito ao inventário
- `kill` - Mata o inimigo atual instantaneamente
- `neroask` - Seta HP da Nero para 10 (trigger fase 2)
- `nerophase2` - Pula direto para fase 2 da Nero
- `voiceabbyl` - Trigger voz misteriosa no Ending 9999

### Debug Menu
- Ativação: Clicar 5x no título "VR CHAT STORY"
- Desbloqueia todos os capítulos
- Acesso ao menu de debug

## ARQUIVOS PRINCIPAIS

### HTML
- `index.html` - Arquivo principal do jogo

### JavaScript
- `js/battle-core.js` - Sistema de batalha base
- `js/battle-arabel.js` - Lógica da batalha Arabel
- `js/battle-nero.js` - Lógica da batalha Nero
- `js/ending-9999.js` - Ending especial Abbyl
- `js/inventory.js` - Sistema de inventário
- `js/dialogue.js` - Sistema de diálogos
- `js/chapters.js` - Gerenciamento de capítulos
- `js/game.js` - Lógica geral do jogo

### Assets
- `assets/images/` - Sprites, backgrounds, UI
- `assets/audio/` - Música, SFX
- `assets/fonts/` - Fontes customizadas

## VARIÁVEIS GLOBAIS IMPORTANTES

### Batalha Arabel
- `arabelActive` - Se está lutando contra Arabel
- `rbArabelHp` - HP da Arabel

### Batalha Nero
- `window.rbFightingNero` - Se está lutando contra Nero
- `window.rbNeroHp` - HP da Nero
- `window.rbNeroPhase2` - Se está na fase 2
- `window.rbMercyUnlocked` - Se mercy está disponível
- `window.rbMercyCount` - Contador de mercy (0-4)

### Sistema
- `debugMode` - Modo debug ativado
- `inventory` - Objeto do inventário
- `rbActive` - Se batalha está ativa
- `rbPhase` - Fase atual da batalha (player/dodge/transitioning)

## FLUXO DE DADOS ENTRE BATALHAS

```
ARABEL DERROTADA
    ↓
arabelActive = false
    ↓
startNeroBattle()
    ↓
window.rbFightingNero = true
window.rbNeroHp = 10000
window.rbNeroPhase2 = false
window.rbMercyUnlocked = false
window.rbMercyCount = 0
```

**IMPORTANTE**: As batalhas são independentes. Apenas a transição (Arabel → Nero) é compartilhada.
