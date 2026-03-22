// ═══════════════════════════════════════════════
// CAPÍTULO 1.3 — A CALL (Completo)
// ═══════════════════════════════════════════════

// Cópia imutável do STORY original — usada para resetar entre runs
const _STORY_ORIGINAL = [
    {t:"join", id:"bybyl"},
    {t:"dlg", who:"bybyl", text:"Então, qual a boa, pessoal?"},
    {t:"dlg", who:"seven", text:"Nada demais, tava aqui mandando uns Reels pro pessoal. O Pudding tá desenhando, eu acho."},
    {t:"dlg", who:"bybyl", text:"Deixa eu ver se entendi... vocês estão em Call pra nada?"},
    {t:"dlg", who:"seven", text:'Não é bem "pra nada"... se ele precisar, vai me chamar. E se eu precisar, eu irei chamar.'},
    {t:"dlg", who:"bybyl", text:"Não é mais fácil só ligar pelo WhatsApp?"},
    {t:"dlg", who:"seven", text:"Não tá constando. Muito trampo."},
    {t:"dlg", who:"bybyl", text:"Relação estranha essa aí de vocês."},
    {t:"join", id:"volkenburt"},
    {t:"dlg", who:"volkenburt", text:"E aí pessoal"},
    {t:"dlg", who:"multi", who2:["bybyl","seven"], text:"Opa, Volken, tudo bom?"},
    {t:"dlg", who:"volkenburt", text:"Olha o tanque que eu fiz"},
    {t:"screenshare"},
    {t:"dlg", who:"multi", who2:["bybyl","seven"], text:"Você é realmente bom nisso."},
    {t:"ss_end"},
    {t:"transition", text:"— Algum tempo depois —"},
    {t:"dlg", who:"bybyl", text:"Vocês não estão achando essa Call um pouco chata, não?"},
    {t:"dlg", who:"multi", who2:["seven","volkenburt"], text:"Mais ou menos."},
    {t:"dlg", who:"bybyl", text:"Bem, é que eu..."},
    {t:"dlg", who:"bybyl", text:"Olha, dá pra por favor voltar com o meu nick normal?"},
    {t:"namechange", from:"bybyl", to:"abbyl"},
    {t:"dlg", who:"abbyl", text:"Melhor, enfim."},
    {t:"dlg", who:"abbyl", text:"Eu fiz um aparelho que acessa o universo paralelo."},
    {t:"dlg", who:"volkenburt", text:"Cara, você deve tá é doido da cabeça."},
    {t:"dlg", who:"seven", text:"Você fez sim, Abbyl, toma aqui o seu remédio."},
    {t:"dlg", who:"abbyl", text:"Ninguém me leva a sério aqui..."},
    {t:"dramatic"},
    {t:"dlg", who:"abbyl", text:"Será que ninguém aqui liga para o que eu faço?", dr:true},
    {t:"dlg", who:"mysterious", text:"Eu ligo.", dr:true},
    {t:"end"}
];

const Chapter13Complete = (() => {
  const CHARS = {
    seven:      { name:"Seven",      color:"#5865F2", img:"assets/images/characters/seven.png", svg:`<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="gs" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#1a1838"/><stop offset="100%" stop-color="#0d0d20"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#gs)"/><ellipse cx="50" cy="32" rx="26" ry="24" fill="#2a1f50"/><ellipse cx="50" cy="52" rx="19" ry="21" fill="#f0c8a8"/><rect x="28" y="46" width="17" height="12" rx="4" fill="none" stroke="#5865F2" stroke-width="2"/><rect x="55" y="46" width="17" height="12" rx="4" fill="none" stroke="#5865F2" stroke-width="2"/><line x1="45" y1="52" x2="55" y2="52" stroke="#5865F2" stroke-width="2"/><ellipse cx="36" cy="52" rx="4" ry="4" fill="#3040b0"/><ellipse cx="63" cy="52" rx="4" ry="4" fill="#3040b0"/><circle cx="37" cy="51" r="1.5" fill="#fff"/><circle cx="64" cy="51" r="1.5" fill="#fff"/><path d="M42 64 Q50 70 58 64" stroke="#b07060" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="90" rx="26" ry="16" fill="#5865F2"/></svg>` },
    pudding:    { name:"Pudding",    color:"#eb459e", img:"assets/images/characters/aldrich.png", svg:`<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="gp" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#281228"/><stop offset="100%" stop-color="#160818"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#gp)"/><ellipse cx="50" cy="28" rx="28" ry="26" fill="#e8c860"/><rect x="20" y="28" width="11" height="38" rx="5" fill="#e8c860"/><rect x="69" y="28" width="11" height="38" rx="5" fill="#e8c860"/><ellipse cx="50" cy="52" rx="18" ry="20" fill="#f8e0d0"/><path d="M37 50 Q41 46 45 50" stroke="#1a0a18" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M55 50 Q59 46 63 50" stroke="#1a0a18" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M43 64 Q50 68 57 64" stroke="#c08090" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M30 20 Q40 14 50 20 Q40 26 30 20" fill="#eb459e"/><path d="M70 20 Q60 14 50 20 Q60 26 70 20" fill="#eb459e"/><circle cx="50" cy="20" r="4" fill="#b0206a"/><ellipse cx="50" cy="90" rx="26" ry="16" fill="#eb459e"/></svg>` },
    bybyl:      { name:"Bybyl",      color:"#f0a050", img:"assets/images/characters/abbyl-discord.gif", imgZoom:true, svg:`<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="gb" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#281408"/><stop offset="100%" stop-color="#180a04"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#gb)"/><polygon points="50,2 57,16 66,6 63,21 74,13 69,27 80,21 71,33" fill="#e07820"/><polygon points="50,2 43,16 34,6 37,21 26,13 31,27 20,21 29,33" fill="#e07820"/><ellipse cx="50" cy="36" rx="25" ry="22" fill="#e07820"/><ellipse cx="50" cy="52" rx="18" ry="21" fill="#f0c090"/><ellipse cx="38" cy="50" rx="5" ry="5" fill="#1a1000"/><ellipse cx="62" cy="50" rx="5" ry="5" fill="#1a1000"/><circle cx="39" cy="49" r="2" fill="#fff"/><circle cx="63" cy="49" r="2" fill="#fff"/><path d="M37 63 Q50 74 63 63" stroke="#7a4020" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="90" rx="26" ry="16" fill="#f0a050"/></svg>` },
    abbyl:      { name:"Abbyl",      color:"#f0a050", img:"assets/images/characters/abbyl-discord.gif", imgZoom:true, svg:`<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="ga" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#281408"/><stop offset="100%" stop-color="#180a04"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#ga)"/><polygon points="50,2 57,16 66,6 63,21 74,13 69,27 80,21 71,33" fill="#e07820"/><polygon points="50,2 43,16 34,6 37,21 26,13 31,27 20,21 29,33" fill="#e07820"/><ellipse cx="50" cy="36" rx="25" ry="22" fill="#e07820"/><ellipse cx="50" cy="52" rx="18" ry="21" fill="#f0c090"/><ellipse cx="38" cy="50" rx="5" ry="5" fill="#1a1000"/><ellipse cx="62" cy="50" rx="5" ry="5" fill="#1a1000"/><circle cx="39" cy="49" r="2" fill="#fff"/><circle cx="63" cy="49" r="2" fill="#fff"/><path d="M37 63 Q50 74 63 63" stroke="#7a4020" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="90" rx="26" ry="16" fill="#f0a050"/></svg>` },
    volkenburt: { name:"Volkenburt", color:"#57F287", img:"assets/images/characters/volken-discord.jpg", svg:`<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="gv" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#08180a"/><stop offset="100%" stop-color="#040e06"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#gv)"/><rect x="24" y="18" width="52" height="20" rx="6" fill="#344a24"/><ellipse cx="50" cy="28" rx="27" ry="15" fill="#3a5228"/><ellipse cx="50" cy="52" rx="20" ry="22" fill="#c8c0a0"/><path d="M30 44 Q38 40 46 43" stroke="#3a3020" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M54 43 Q62 40 70 44" stroke="#3a3020" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="50" rx="5" ry="4" fill="#2a2818"/><ellipse cx="62" cy="50" rx="5" ry="4" fill="#2a2818"/><circle cx="39" cy="49" r="2" fill="#fff"/><circle cx="63" cy="49" r="2" fill="#fff"/><line x1="41" y1="63" x2="59" y2="63" stroke="#8a7850" stroke-width="2" stroke-linecap="round"/><ellipse cx="50" cy="90" rx="26" ry="16" fill="#3a5828"/></svg>` },
    mysterious: { name:"???",        color:"#8B0000", svg: null }
  };

  const ABBYL_CALL_SPRITES = Object.freeze({
    seven: "assets/images/ui/call/seven.gif",
    pudding: "assets/images/ui/call/aldrich pudding.gif",
    volkenburt: "assets/images/ui/call/volken.gif"
  });

  const STREAM_MEDIA_DEFAULT = "assets/images/characters/t90-sprocket.gif";
  const STREAM_MEDIA_ABBYL_CHEAT = "assets/images/ui/call/transmition.gif";
  const VOLKEN_SHARE_LINE_DEFAULT = "Olha o tanque que eu fiz";
  const VOLKEN_SHARE_LINE_ABBYL_CHEAT = "Olha que fofinha ela toda animadinha";
  const REACTION_LINE_DEFAULT = "Você é realmente bom nisso.";
  const REACTION_LINE_ABBYL_CHEAT = "Kojima o que você fez?";
  const HANGUP_BRANCH_TRIGGER_LINE = "Ninguém me leva a sério aqui...";

  function applyAbbylMusumeSprites(){
    if(!window._abbylCheatPersist) return;
    Object.keys(CHARS).forEach(function(id){
      var c = CHARS[id];
      if(!c) return;
      if (ABBYL_CALL_SPRITES[id]) {
        c.img = ABBYL_CALL_SPRITES[id];
        c.imgZoom = false;
      }
    });
  }

  function applyAbbylCheatStoryOverrides(){
    if (!STORY[11] || !STORY[13]) return;

    if (window._abbylCheatPersist) {
      STORY[11].text = VOLKEN_SHARE_LINE_ABBYL_CHEAT;
      STORY[13].text = REACTION_LINE_ABBYL_CHEAT;
      return;
    }

    STORY[11].text = VOLKEN_SHARE_LINE_DEFAULT;
    STORY[13].text = REACTION_LINE_DEFAULT;
  }

  const STORY = [
    {t:"join", id:"bybyl"},
    {t:"dlg", who:"bybyl", text:"Então, qual a boa, pessoal?"},
    {t:"dlg", who:"seven", text:"Nada demais, tava aqui mandando uns Reels pro pessoal. O Pudding tá desenhando, eu acho."},
    {t:"dlg", who:"bybyl", text:"Deixa eu ver se entendi... vocês estão em Call pra nada?"},
    {t:"dlg", who:"seven", text:'Não é bem "pra nada"... se ele precisar, vai me chamar. E se eu precisar, eu irei chamar.'},
    {t:"dlg", who:"bybyl", text:"Não é mais fácil só ligar pelo WhatsApp?"},
    {t:"dlg", who:"seven", text:"Não tá constando. Muito trampo."},
    {t:"dlg", who:"bybyl", text:"Relação estranha essa aí de vocês."},
    {t:"join", id:"volkenburt"},
    {t:"dlg", who:"volkenburt", text:"E aí pessoal"},
    {t:"dlg", who:"multi", who2:["bybyl","seven"], text:"Opa, Volken, tudo bom?"},
    {t:"dlg", who:"volkenburt", text:"Olha o tanque que eu fiz"},
    {t:"screenshare"},
    {t:"dlg", who:"multi", who2:["bybyl","seven"], text:"Você é realmente bom nisso."},
    {t:"ss_end"},
    {t:"transition", text:"— Algum tempo depois —"},
    {t:"dlg", who:"bybyl", text:"Vocês não estão achando essa Call um pouco chata, não?"},
    {t:"dlg", who:"multi", who2:["seven","volkenburt"], text:"Mais ou menos."},
    {t:"dlg", who:"bybyl", text:"Bem, é que eu..."},
    {t:"dlg", who:"bybyl", text:"Olha, dá pra por favor voltar com o meu nick normal?"},
    {t:"namechange", from:"bybyl", to:"abbyl"},
    {t:"dlg", who:"abbyl", text:"Melhor, enfim."},
    {t:"dlg", who:"abbyl", text:"Eu fiz um aparelho que acessa o universo paralelo."},
    {t:"dlg", who:"volkenburt", text:"Cara, você deve tá é doido da cabeça."},
    {t:"dlg", who:"seven", text:"Você fez sim, Abbyl, toma aqui o seu remédio."},
    {t:"dlg", who:"abbyl", text:"Ninguém me leva a sério aqui..."},
    {t:"dramatic"},
    {t:"dlg", who:"abbyl", text:"Será que ninguém aqui liga para o que eu faço?", dr:true},
    {t:"dlg", who:"mysterious", text:"Eu ligo.", dr:true},
    {t:"end"}
  ];

  // ── Áudio ──────────────────────────────────────────────
  let audioCtx = null;
  const tickDiscordSfx = new Audio('assets/audio/tick-discord.mp3');
  tickDiscordSfx.volume = 0.35;

  // Música ambiente do capítulo
  let dcMusic = null;
  let dcMusicFadeInterval = null;
  let dcMuffledCtx = null, dcMuffledSource = null, dcMuffledFilter = null, dcMuffledGain = null;

  function dcPlayMusic() {
    dcStopMusic();
    dcMusic = new Audio('assets/audio/discord-chat.mp3');
    dcMusic.loop = true;
    dcMusic.volume = 0.45;
    dcMusic.play().catch(() => {});
  }

  function dcFadeMusic(targetVol, durationMs) {
    if (!dcMusic) return;
    if (dcMusicFadeInterval) clearInterval(dcMusicFadeInterval);
    const steps = 30;
    const interval = durationMs / steps;
    const start = dcMusic.volume;
    const delta = (targetVol - start) / steps;
    let step = 0;
    dcMusicFadeInterval = setInterval(() => {
      step++;
      dcMusic.volume = Math.max(0, Math.min(1, start + delta * step));
      if (step >= steps) { clearInterval(dcMusicFadeInterval); dcMusicFadeInterval = null; }
    }, interval);
  }

  function dcMuffleMusic() {
    if (!dcMusic) return;
    try {
      dcMuffledCtx = new (window.AudioContext || window.webkitAudioContext)();
      dcMuffledSource = dcMuffledCtx.createMediaElementSource(dcMusic);
      dcMuffledFilter = dcMuffledCtx.createBiquadFilter();
      dcMuffledFilter.type = 'lowpass';
      dcMuffledFilter.frequency.value = 600;
      dcMuffledGain = dcMuffledCtx.createGain();
      dcMuffledGain.gain.value = 0.3;
      dcMuffledSource.connect(dcMuffledFilter);
      dcMuffledFilter.connect(dcMuffledGain);
      dcMuffledGain.connect(dcMuffledCtx.destination);
    } catch(e) {
      // fallback: apenas baixa o volume
      dcFadeMusic(0.08, 1000);
    }
  }

  function dcStopMusic() {
    if (dcMusicFadeInterval) { clearInterval(dcMusicFadeInterval); dcMusicFadeInterval = null; }
    if (dcMuffledCtx) { try { dcMuffledCtx.close(); } catch(e) {} dcMuffledCtx = null; }
    if (dcMusic) { dcMusic.pause(); dcMusic.currentTime = 0; dcMusic = null; }
  }

  function getAudioCtx(){
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    return audioCtx;
  }
  function synthJoin(){
    try {
      var a=new Audio("assets/audio/entrar.mp3");
      a.volume=0.7;
      a.play();
    } catch(e){}
  }
  function synthShare(){
    try { var a=new Audio("assets/audio/stream-start.mp3"); a.volume=0.8; a.play(); } catch(e){}
  }
  function synthLeave(){
    try { var a=new Audio("assets/audio/sair.mp3"); a.volume=0.8; a.play(); } catch(e){}
  }

  // ── Estado (resetado a cada init) ──────────────────────
  let secs=0, timerInterval=null;
  let rings={}, nametags={};
  let isDramatic=false, waitClick=false, currentStep=null, inScreenshare=false;
  let stepIndex=0;
  let hangupBranchTriggered=false;
  let hangupBranchQueue=null;
  let abbylReturnedAfterCallBack=false;
  let twTimer=null, twDone=false, twTarget=null, twFull="";
  let toastTimer=null;
  let clickHandler=null, keyHandler=null;

  // ── Refs DOM (null até init ser chamado) ───────────────
  let callArea=null, toastEl=null, dialogEl=null, dName=null, dText=null;
  let dramDialogEl=null, ddName=null, ddText=null;

  // ── Timer ──────────────────────────────────────────────
  function initTimer(){
    secs=0;
    clearInterval(timerInterval);
    const el=document.getElementById("timer");
    if(!el) return;
    timerInterval=setInterval(()=>{
      secs++;
      el.textContent=String(Math.floor(secs/60)).padStart(2,"0")+":"+String(secs%60).padStart(2,"0");
    },1000);
  }

  // ── Avatares ───────────────────────────────────────────
  function addAvatar(id, extraBadge){
    extraBadge=extraBadge||"";
    if(!callArea || document.getElementById("av-"+id)) return;
    const c=CHARS[id]; if(!c) return;
    const card=document.createElement("div");
    card.className="avatar-card"; card.id="av-"+id;
    var svgContent;
    if(c.img && c.imgZoom){
      svgContent="<div style='width:100%;height:100%;border-radius:50%;overflow:hidden;'><img src='"+c.img+"' style='width:100%;height:100%;object-fit:cover;object-position:center 25%;transform:scale(1.4);transform-origin:center 30%;display:block;'></div>";
    } else if(c.img){
      svgContent="<img src='"+c.img+"' style='width:100%;height:100%;object-fit:cover;object-position:top;border-radius:50%;display:block;'>";
    } else {
      svgContent=c.svg||("<div style='width:100%;height:100%;background:"+c.color+";display:flex;align-items:center;justify-content:center;font-size:32px;color:#fff;border-radius:50%'>?</div>");
    }
    card.innerHTML="<div class=\"avatar-ring\" id=\"ring-"+id+"\"><div class=\"avatar-inner\">"+svgContent+"</div>"+extraBadge+"</div><div class=\"nametag\" id=\"ntag-"+id+"\" style=\"color:"+c.color+"\">"+c.name+"</div>";
    callArea.appendChild(card);
    rings[id]=document.getElementById("ring-"+id);
    nametags[id]=document.getElementById("ntag-"+id);
  }

  function setSpeaking(ids){
    Object.values(rings).forEach(function(r){ if(r) r.classList.remove("speaking"); });
    ids.forEach(function(id){ if(rings[id]) rings[id].classList.add("speaking"); });
  }
  function clearSpeak(){
    Object.values(rings).forEach(function(r){ if(r) r.classList.remove("speaking"); });
  }

  function normalizeLooseText(text){
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function canTriggerHangupBranch(){
    var targetLine = normalizeLooseText(HANGUP_BRANCH_TRIGGER_LINE);

    if(currentStep && currentStep.t === "dlg" && currentStep.who === "abbyl"){
      var currentLine = normalizeLooseText(currentStep.text);
      if(currentLine.indexOf(targetLine) !== -1) return true;
    }

    var uiName = normalizeLooseText(dName && dName.textContent);
    var uiText = normalizeLooseText(dText && dText.textContent);
    return uiName.indexOf("abbyl") !== -1 && uiText.indexOf(targetLine) !== -1;
  }

  function buildHangupBranchTail(){
    return [
      {t:"dlg", who:"pudding", text:"Seven, Volkenburt, vocês precisam levar ele a sério."},
      {t:"dlg", who:"pudding", text:"Eu vou chamá-lo de volta."},
      {t:"join", id:"abbyl"},
      {t:"dlg", who:"pudding", text:"Agora vocês dois: peçam desculpas para ele."},
      {t:"dlg", who:"seven", text:"Desculpa, Abbyl."},
      {t:"dlg", who:"volkenburt", text:"Desculpa, Abbyl."},
      {t:"dramatic"},
      {t:"dlg", who:"abbyl", text:"Eu fico feliz por ter um amigo igual ao Pudding, e eles, acho que eles ligam sim pra mim.", dr:true},
      {t:"dlg", who:"mysterious", text:"Eles ligam, e eu também.", dr:true},
      {t:"end"}
    ];
  }

  function removeAvatarLikeEndingAlone(){
    var av = document.getElementById("av-abbyl") || document.getElementById("av-bybyl");
    if(!av) return;
    av.style.animation = "popOut .5s forwards";
    setTimeout(function(){
      try { av.remove(); } catch(e) {}
    }, 500);
  }

  function triggerHangupBranch(){
    if(hangupBranchTriggered || !canTriggerHangupBranch()) return false;

    try {
      hangupBranchTriggered = true;
      hangupBranchQueue = buildHangupBranchTail();

      if(!twDone) skipTW();
      waitClick = false;
      clearSpeak();

      synthLeave();
      removeAvatarLikeEndingAlone();
      showToast("📤 Abbyl saiu da chamada (ramificação)");

      setTimeout(function(){
        nextStep();
      }, 900);

      return true;
    } catch (err) {
      hangupBranchTriggered = false;
      hangupBranchQueue = null;
      console.error("Erro ao acionar ramificação de saída da call:", err);
      return false;
    }
  }

  // ── Toast ──────────────────────────────────────────────
  function showToast(msg){
    if(!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.textContent=msg; toastEl.classList.add("show");
    toastTimer=setTimeout(function(){ toastEl.classList.remove("show"); },2800);
  }

  // ── Typewriter ─────────────────────────────────────────
  function typewrite(el, text, speed){
    speed=speed||26;
    clearTimeout(twTimer); twDone=false; twTarget=el; twFull=text;
    el.textContent=""; var i=0;
    function tick(){
      if(i>=text.length){
        twDone=true;
        // auto-advance: avança automaticamente após delay se ativado
        if(window.autoAdvance && !window.gamePaused && waitClick){
          if(window._autoAdvanceDiscordTimer) clearTimeout(window._autoAdvanceDiscordTimer);
          window._autoAdvanceDiscordTimer = setTimeout(function(){
            window._autoAdvanceDiscordTimer = null;
            if(window.autoAdvance && !window.gamePaused) handleInput(null);
          }, 2200);
        }
        return;
      }
      var ch=text[i++];
      el.textContent+=ch;
      if(ch.trim()!==''){
        tickDiscordSfx.currentTime=0;
        tickDiscordSfx.play().catch(()=>{});
      }
      twTimer=setTimeout(tick,speed);
    }
    tick();
  }
  function skipTW(){
    clearTimeout(twTimer);
    if(twTarget) twTarget.textContent=twFull;
    twDone=true;
  }

  // ── Diálogos ───────────────────────────────────────────
  function showNormalDialog(id, text, speakers){
    if(!dialogEl || !dName || !dText) return;
    dramDialogEl.classList.remove("active");
    dialogEl.classList.add("up");
    var c=CHARS[id];
    if(speakers){
      dName.textContent=speakers.map(function(s){ return CHARS[s]?CHARS[s].name:s; }).join(" & ");
      dName.style.color=CHARS[speakers[0]]?CHARS[speakers[0]].color:"#fff";
    } else {
      dName.textContent=c?c.name:id;
      dName.style.color=c?c.color:"#fff";
    }
    dText.textContent="";
    typewrite(dText,text);
  }

  function showDramaticDialog(id, text){
    if(!dramDialogEl || !ddName || !ddText) return;
    dialogEl.classList.remove("up");
    dramDialogEl.classList.add("active");
    var c=CHARS[id];
    ddName.textContent=c?c.name:id;
    ddName.style.color=c?c.color:"#fff";
    ddText.className=id==="mysterious"?"mystery-text":"";
    ddText.textContent="";
    typewrite(ddText,text,id==="mysterious"?60:30);
  }

  // ── Animação de calendário estilo Persona ───────────────
  function showCalendarAnimation(callback) {
    var COL_W = 110;
    var days = [
      { name:'SÁB', num:11 }, { name:'DOM', num:12 },
      { name:'SEG', num:13 }, { name:'TER', num:14 },
      { name:'QUA', num:15 }, { name:'QUI', num:16 }, { name:'SEX', num:17 }
    ];
    var FROM_IDX = 2;
    var TO_IDX   = 3;

    // ── Overlay ────────────────────────────────────────────
    var overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed;inset:0;background:#0a000f;z-index:10000',
      'opacity:0;transition:opacity 1.1s ease;overflow:hidden'
    ].join(';');
    document.body.appendChild(overlay);

    // ── "JAN" grande no fundo — começa invisível ───────────
    var bigMonth = document.createElement('div');
    bigMonth.textContent = 'JAN';
    bigMonth.style.cssText = [
      'position:absolute;right:8%;top:50%;transform:translateY(-50%)',
      'font-size:clamp(120px,22vw,260px);font-weight:900',
      'font-family:Arial Black,sans-serif;color:rgba(255,255,255,0)',
      'letter-spacing:-8px;user-select:none;line-height:1',
      'transition:color 1.8s ease'
    ].join(';');
    overlay.appendChild(bigMonth);

    // Ano
    var yearEl = document.createElement('div');
    yearEl.textContent = '2025';
    yearEl.style.cssText = [
      'position:absolute;right:calc(8% + 10px);top:calc(50% - clamp(60px,11vw,130px) - 28px)',
      'font-size:15px;color:rgba(255,255,255,0);font-family:monospace;letter-spacing:4px',
      'transition:color 1.8s ease'
    ].join(';');
    overlay.appendChild(yearEl);

    // ── Faixa do calendário — começa deslocada e invisível ─
    var strip = document.createElement('div');
    var totalW = COL_W * 7;
    strip.style.cssText = [
      'position:absolute;left:50%;bottom:22%',
      'transform:translateX(-50%) translateY(40px)',
      'width:'+totalW+'px;height:120px;display:flex;align-items:stretch',
      'opacity:0;transition:opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)'
    ].join(';');
    overlay.appendChild(strip);

    // Barra roxa deslizante
    var bar = document.createElement('div');
    bar.style.cssText = [
      'position:absolute;top:0;bottom:0',
      'width:'+COL_W+'px',
      'left:'+(FROM_IDX * COL_W)+'px',
      'background:#7c3aed',
      'box-shadow:0 0 32px 8px rgba(124,58,237,0.55)',
      'transition:left 0.85s cubic-bezier(0.65,0,0.05,1)'
    ].join(';');
    strip.appendChild(bar);

    // Colunas
    days.forEach(function(d, idx){
      var col = document.createElement('div');
      col.style.cssText = [
        'position:relative;width:'+COL_W+'px;flex-shrink:0',
        'display:flex;flex-direction:column;align-items:center;justify-content:center',
        'z-index:1'
      ].join(';');

      var nameEl = document.createElement('div');
      nameEl.textContent = d.name;
      nameEl.style.cssText = [
        'font-size:13px;letter-spacing:3px;font-family:monospace;font-weight:bold;margin-bottom:6px',
        'color:'+(idx===FROM_IDX?'#fff':'#444'),
        'transition:color 0.5s ease'
      ].join(';');

      var numEl = document.createElement('div');
      numEl.textContent = d.num;
      numEl.style.cssText = [
        'font-size:clamp(32px,4vw,48px);font-weight:900;font-family:Arial Black,sans-serif;line-height:1',
        'color:'+(idx===FROM_IDX?'#fff':'#333'),
        'transition:color 0.5s ease'
      ].join(';');

      col.appendChild(nameEl);
      col.appendChild(numEl);
      col.dataset.idx = idx;
      strip.appendChild(col);
    });

    // ── Label ──────────────────────────────────────────────
    var label = document.createElement('div');
    label.textContent = 'SEG  ·  13 DE JANEIRO';
    label.style.cssText = [
      'position:absolute;left:50%;bottom:calc(22% - 48px)',
      'transform:translateX(-50%) translateY(10px)',
      'color:rgba(255,255,255,0);font-size:13px;letter-spacing:5px',
      'font-family:monospace;white-space:nowrap',
      'transition:color 0.6s ease, transform 0.6s ease'
    ].join(';');
    overlay.appendChild(label);

    function setActiveCol(idx){
      Array.from(strip.children).forEach(function(el){
        if(!el.dataset || !el.dataset.idx) return;
        var isActive = parseInt(el.dataset.idx) === idx;
        el.children[0].style.color = isActive ? '#fff' : '#444';
        el.children[1].style.color = isActive ? '#fff' : '#333';
      });
    }

    // ── Sequência ──────────────────────────────────────────

    // 1) Fade in overlay
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      overlay.style.opacity = '1';
    }); });

    // 2) Faixa sobe + "JAN" aparece
    setTimeout(function(){
      strip.style.opacity = '1';
      strip.style.transform = 'translateX(-50%) translateY(0)';
      bigMonth.style.color = 'rgba(255,255,255,0.045)';
      yearEl.style.color   = 'rgba(255,255,255,0.18)';
    }, 500);

    // 3) Label aparece com slide
    setTimeout(function(){
      label.style.color = 'rgba(255,255,255,0.55)';
      label.style.transform = 'translateX(-50%) translateY(0)';
    }, 1100);

    // 4) Barra desliza + som
    setTimeout(function(){
      try{ var sfx=new Audio('assets/audio/confirmation.mp3'); sfx.volume=0.7; sfx.play(); }catch(e){}
      bar.style.left = (TO_IDX * COL_W) + 'px';

      // texto muda na metade da animação da barra (~430ms)
      setTimeout(function(){
        setActiveCol(TO_IDX);
        // label faz fade cruzado
        label.style.color = 'rgba(255,255,255,0)';
        label.style.transform = 'translateX(-50%) translateY(8px)';
        setTimeout(function(){
          label.textContent = 'TER  ·  14 DE JANEIRO';
          label.style.transform = 'translateX(-50%) translateY(0)';
          label.style.color = 'rgba(255,255,255,0.55)';
        }, 220);
      }, 430);
    }, 2600);

    // 5) Pausa → fade out suave → callback
    setTimeout(function(){
      overlay.style.transition = 'opacity 1.4s ease';
      overlay.style.opacity = '0';
      setTimeout(function(){ overlay.remove(); if(callback) callback(); }, 1450);
    }, 5000);
  }

  // ── Story machine ──────────────────────────────────────
  function nextStep(){
    var step = null;

    if(hangupBranchQueue && hangupBranchQueue.length){
      step = hangupBranchQueue.shift();
    } else {
      if(stepIndex>=STORY.length) return;
      step=STORY[stepIndex++];
    }

    currentStep=step;
    runStep(step);
  }

  function runStep(step){
    var t=step.t;

    if(t==="join"){
      var c=CHARS[step.id];
      synthJoin();
      addAvatar(step.id, step.id==="pudding"?"<div class=\"drawing-badge\">✏️</div>":"");
      if(step.id === "abbyl" && hangupBranchTriggered){
        // Marca que o Abbyl voltou na call após a intervenção do Pudding.
        abbylReturnedAfterCallBack = true;
      }
      showToast("📥 "+c.name+" entrou na chamada");
      setSpeaking([step.id]);
      waitClick=false;
      setTimeout(function(){ clearSpeak(); setTimeout(nextStep,300); },1000);
      return;
    }

    if(t==="dlg"){
      waitClick=true;
      var speakers=step.who==="multi"?step.who2:[step.who];
      setSpeaking(speakers);
      if(step.dr||isDramatic){
        showDramaticDialog(step.who==="multi"?step.who2[0]:step.who, step.text);
      } else {
        showNormalDialog(step.who==="multi"?step.who2[0]:step.who, step.text, step.who==="multi"?step.who2:null);
      }
      return;
    }

    if(t==="screenshare"){
      synthShare();
      dcFadeMusic(0.12, 2500); // fade gradual ao mostrar transmissão
      setSpeaking(["volkenburt"]);
      inScreenshare=true;
      showToast("🖥️ Volkenburt iniciou uma transmissão");

      var streamMediaEl = document.getElementById("ss-stream-media");
      if (streamMediaEl) {
        streamMediaEl.src = window._abbylCheatPersist ? STREAM_MEDIA_ABBYL_CHEAT : STREAM_MEDIA_DEFAULT;
      }

      var ss=document.getElementById("ss-overlay");
      if(ss) ss.classList.add("active");
      waitClick=true;
      return;
    }

    if(t==="ss_end"){
      try { var snd=new Audio("assets/audio/stream-stop.mp3"); snd.volume=0.8; snd.play(); } catch(e){}
      dcFadeMusic(0.45, 1500); // retoma volume normal
      var ss2=document.getElementById("ss-overlay");
      if(ss2) ss2.classList.remove("active");
      inScreenshare=false;
      clearSpeak();
      waitClick=false;
      setTimeout(nextStep,400);
      return;
    }

    if(t==="transition"){
      waitClick=false;
      clearSpeak();
      if(dialogEl) dialogEl.classList.remove("up");
      if(dramDialogEl) dramDialogEl.classList.remove("active");

      var stepData=step;
      var livePill=document.querySelector('.live-pill');
      var timerEl=document.getElementById('timer');

      // 1) Mostra o overlay "Algum tempo depois" imediatamente
      var trEl=document.getElementById("transition");
      var trTxt=document.getElementById("tr-text");
      if(trEl && trTxt){
        trTxt.textContent=stepData.text;
        trEl.classList.add("active");
      }

      if(livePill && timerEl){
        // pausa o timer real e guarda o tempo atual
        clearInterval(timerInterval);
        var startSecs=secs;

        // embaça a música do capítulo (dcMusic é privado, usa dcFadeMusic)
        dcFadeMusic(0.06, 800);

        // clona o pill exatamente na posição original
        var rect=livePill.getBoundingClientRect();
        var clone=livePill.cloneNode(true);
        clone.id='pill-anim-clone';
        // white-space:nowrap + width:auto permitem expandir para H:MM:SS sem quebrar
        clone.style.cssText='position:fixed;top:'+rect.top+'px;left:'+rect.left+'px;width:auto;white-space:nowrap;z-index:9999;margin:0;pointer-events:none;';
        livePill.style.visibility='hidden';
        document.body.appendChild(clone);
        var cloneSpans=clone.querySelectorAll('span');
        var cloneTimerEl=cloneSpans[cloneSpans.length-1];

        // posiciona no terço superior (acima do texto "Algum tempo depois" que fica no centro)
        var cx=window.innerWidth/2 - (rect.left + rect.width/2);
        var cy=window.innerHeight*0.28 - (rect.top + rect.height/2);
        var scale=2.4;

        // dois RAF para garantir que o estado inicial é renderizado antes da animação
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            clone.style.transition='transform .55s cubic-bezier(.34,1.45,.64,1)';
            clone.style.transformOrigin='center center';
            clone.style.transform='translate('+cx+'px,'+cy+'px) scale('+scale+')';
          });
        });

        // começa a contar após a animação de entrada
        setTimeout(function(){
          var stepN=0,totalSteps=60;
          var speedInt=setInterval(function(){
            stepN++;
            var dispSecs=startSecs+Math.round((stepN/totalSteps)*3600);
            var h=Math.floor(dispSecs/3600),m=Math.floor((dispSecs%3600)/60),s=dispSecs%60;
            var txt=(h>0?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
            timerEl.textContent=txt;
            if(cloneTimerEl) cloneTimerEl.textContent=txt;
            if(stepN>=totalSteps){
              clearInterval(speedInt);
              secs=startSecs+3600;
              // pausa um momento e volta para o lugar original
              setTimeout(function(){
                clone.style.transition='transform .5s cubic-bezier(.4,0,.2,1)';
                clone.style.transform='translate(0px,0px) scale(1)';
                setTimeout(function(){
                  clone.remove();
                  livePill.style.visibility='';
                  // restaura música
                  dcFadeMusic(0.45, 800);
                  // retoma timer com formato normal (mostra horas quando necessário)
                  clearInterval(timerInterval);
                  timerInterval=setInterval(function(){
                    secs++;
                    var h2=Math.floor(secs/3600),m2=Math.floor((secs%3600)/60),s2=secs%60;
                    timerEl.textContent=(h2>0?String(h2).padStart(2,'0')+':':'')+String(m2).padStart(2,'0')+':'+String(s2).padStart(2,'0');
                  },1000);
                  if(trEl) trEl.classList.remove("active");
                  setTimeout(nextStep,600);
                },550);
              },700);
            }
          },25);
        },650);

      } else {
        // sem pill: overlay simples
        if(trEl){
          setTimeout(function(){ trEl.classList.remove("active"); setTimeout(nextStep,600); },2200);
        } else { setTimeout(nextStep,600); }
      }
      return;
    }

    if(t==="namechange"){
      waitClick=false;
      var ntag=nametags[step.from];
      var ring=rings[step.from];
      if(ntag){
        ntag.classList.add("name-flash");
        setTimeout(function(){
          ntag.textContent=CHARS[step.to].name;
          ntag.id="ntag-"+step.to;
          ntag.style.color=CHARS[step.to].color;
          ntag.classList.remove("name-flash");
          nametags[step.to]=ntag; delete nametags[step.from];
        },250);
      }
      if(ring){
        ring.id="ring-"+step.to;
        rings[step.to]=ring; delete rings[step.from];
        var card=document.getElementById("av-"+step.from);
        if(card){ card.id="av-"+step.to; }
      }
      showToast("✏️ Bybyl agora é Abbyl");
      setTimeout(nextStep,1200);
      return;
    }

    if(t==="dramatic"){
      waitClick=false;
      isDramatic=true;
      clearSpeak();
      if(dialogEl) dialogEl.classList.remove("up");
      var veil=document.getElementById("dark-veil");
      var ui=document.getElementById("discord-ui");
      var bg=document.getElementById("bg");
      if(veil) veil.classList.add("active");
      if(ui)   ui.classList.add("fading");
      if(bg)   bg.classList.add("dramatic");
      dcMuffleMusic(); // tela preta = som abafado e baixo
      setTimeout(nextStep,1800);
      return;
    }

    if(t==="end"){
      waitClick=false;
      clearSpeak();
      if(dialogEl) dialogEl.classList.remove("up");
      if(dramDialogEl) dramDialogEl.classList.remove("active");
      clearInterval(timerInterval);
      dcFadeMusic(0, 2500);
      setTimeout(dcStopMusic, 3000);
      // calendário antes de avançar para o cap 1.4
      setTimeout(function(){
        showCalendarAnimation(function(){
          // Remove o container do cap 1.3
          var wrap=document.getElementById("ch13-wrapper");
          if(wrap) wrap.remove();
          var gs=document.getElementById("game-screen");
          if(gs){
            Array.from(gs.children).forEach(function(c){ c.style.display=""; });
            gs.style.display="none";
            gs.style.opacity="";
          }
          // Avança para o cap 1.4
          if(typeof loadChapter === "function") loadChapter("1.4");
        });
      }, 800);
      return;
    }
  }

  // ── Input ──────────────────────────────────────────────
  function handleInput(e){
    if(window.gamePaused) return; // jogo pausado — ignora input
    if(e && e.target && (e.target.classList.contains("start-btn") || e.target.classList.contains("menu-btn") || e.target.classList.contains("pause-btn"))) return;
    // ignora clicks originados dentro do pause-overlay
    if(e && e.target && document.getElementById('pause-overlay') && document.getElementById('pause-overlay').contains(e.target)) return;
    if(!waitClick) return;
    if(!twDone){ skipTW(); return; }
    nextStep();
  }

  // ── Público ────────────────────────────────────────────
  return {
    // Avança diálogo externamente (ex: botão A do controle)
    advance: function(){ handleInput(null); },
    // Chamado externamente quando o toggle de auto-advance é ligado enquanto já há texto exibido
    triggerAutoAdvance: function(){
      if(!waitClick || !twDone) return;
      if(window._autoAdvanceDiscordTimer) clearTimeout(window._autoAdvanceDiscordTimer);
      window._autoAdvanceDiscordTimer = setTimeout(function(){
        window._autoAdvanceDiscordTimer = null;
        if(window.autoAdvance && !window.gamePaused) handleInput(null);
      }, 2200);
    },
    requestHangup: function(){
      return triggerHangupBranch();
    },
    shouldUseBirraEnding: function(){
      return !!abbylReturnedAfterCallBack;
    },
    destroy: function(){
      // Restaura o STORY original para que a próxima run aplique
      // as variantes de replay sobre os valores corretos
      _STORY_ORIGINAL.forEach(function(step, i) {
        STORY[i] = Object.assign({}, step);
      });
      // Para música e timers
      dcStopMusic();
      clearInterval(timerInterval); timerInterval=null;
      clearTimeout(twTimer); twTimer=null;
      clearTimeout(toastTimer); toastTimer=null;
      if(window._autoAdvanceDiscordTimer){ clearTimeout(window._autoAdvanceDiscordTimer); window._autoAdvanceDiscordTimer=null; }
      // Remove listeners do documento
      if(clickHandler){ document.removeEventListener("click", clickHandler); clickHandler=null; }
      if(keyHandler){   document.removeEventListener("keydown", keyHandler);  keyHandler=null; }
      // Reseta estado
      stepIndex=0; waitClick=false; hangupBranchTriggered=false; hangupBranchQueue=null; abbylReturnedAfterCallBack=false;
    },
    init: function(){
      applyAbbylMusumeSprites();
      applyAbbylCheatStoryOverrides();

      // ── Replay Dialogue Hook — aplica variantes por run ──────────
      if (typeof window._replayGetRuns === 'function' && typeof window._ch13GetReplayOverrides === 'function') {
        var _runs = window._replayGetRuns();
        var _runCount = (_runs && _runs['1.3']) ? _runs['1.3'] : 0;
        var _overrides = window._ch13GetReplayOverrides(_runCount);
        if (_overrides) {
          Object.keys(_overrides).forEach(function(idx) {
            var i = parseInt(idx);
            if (i >= 0 && i < STORY.length) {
              // Preserva campos técnicos não sobrescritos (ex: dr, who2)
              STORY[i] = Object.assign({}, STORY[i], _overrides[i]);
            }
          });
        }
      }

      // Esconder tela de início
      var startEl=document.getElementById("start");
      if(startEl){
        startEl.style.opacity="0";
        startEl.style.pointerEvents="none";
        setTimeout(function(){ startEl.style.display="none"; },500);
      }

      // Capturar referências DOM (HTML já injetado pelo setupGameScreen)
      callArea     = document.getElementById("call-area");
      toastEl      = document.getElementById("toast");
      dialogEl     = document.getElementById("dialog");
      dName        = document.getElementById("d-name");
      dText        = document.getElementById("d-text");
      dramDialogEl = document.getElementById("dramatic-dialog");
      ddName       = document.getElementById("dd-name");
      ddText       = document.getElementById("dd-text");

      // Resetar estado
      rings={}; nametags={};
      isDramatic=false; waitClick=false; currentStep=null; inScreenshare=false;
      stepIndex=0; twDone=false; twTarget=null; hangupBranchTriggered=false; hangupBranchQueue=null; abbylReturnedAfterCallBack=false;

      // Remover listeners anteriores para evitar duplicatas
      if(clickHandler) document.removeEventListener("click", clickHandler);
      if(keyHandler)   document.removeEventListener("keydown", keyHandler);

      clickHandler = handleInput;
      keyHandler   = function(e){
        var isAdvance = (typeof kbIs === 'function') ? kbIs(e,'ADVANCE') : e.code==='Space';
        if(isAdvance||e.key==="Enter"||e.key==="ArrowRight") handleInput(e);
      };

      document.addEventListener("click", clickHandler);
      document.addEventListener("keydown", keyHandler);

      // Timer e avatares iniciais
      initTimer();
      addAvatar("seven");
      addAvatar("pudding","<div class=\"drawing-badge\">✏️</div>");

      // Iniciar música ambiente
      dcPlayMusic();

      // Começar
      setTimeout(nextStep, 600);
    }
  };
})();

window.Chapter13Complete = Chapter13Complete;