/* ═══════════════════════════════════════════════════════════════
   Capítulo 1.4 — Pós Call do Discord
   Usa os elementos do game-screen existentes (dialogue-wrapper,
   bg-image, character-left/right, speaker-box, etc.) igual aos
   outros capítulos.
═══════════════════════════════════════════════════════════════ */
'use strict';

// Cópia imutável do STORY original — usada para resetar entre runs
var _CH14_STORY_ORIGINAL = null;

window.Chapter14 = (function () {

    var _active=false, _stepIndex=0, _waitClick=false, _destroyed=false;
    var _spawnBlocked=false;
    var _curBg=null, _sevenSkin=false, _clones=[], _pendingSkip=null, _twGen=0, _twInterval=null;
    var _mgActive=false, _mgInterval=null, _mgTimeout=null, _mgSprites=[];

    // ── Roteiro ───────────────────────────────────────────────
    var STORY = [
        { t:'bg',    src:'scenes/abbyl-laboratorio.jpeg' },
        { t:'music', id:'discord-chat' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Eu queria estudar mais sobre esse universo... Mas acredito ser bem perigoso fazer isso sozinho.' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Eu preciso achar algum idiot... Digo... Algum nobre auxiliar para testar o transportador.' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Olha isso, Abbyl, olha isso, eu consigo me multiplicar sem o mínimo esforço, também consigo mudar a cor da minha janela de diálogo. Dahora né?', sevenFlex:true },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Deixa de dar trabalho pra desenvolvedora, Seven... Aliás', clearFlex:true },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Ei Seven, você acredita em universo paralelo?' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Mó papo de esquisito isso aí hahaha, o que você quer, hein?' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Nada, só que você coloque essa parada aqui na testa' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Cadê a parada?' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Tá aqui na minha mão.' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Eu não tô vendo nada.' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Qual é Seven, tu sabe que esse game aqui é limitado, tenta se esforçar.' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Tá bom, tá bom.' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Eu só preciso colocar isso que eu não tô vendo na minha testa?' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'É' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Tá bom, aliás, isso é seguro né?' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Claro que não' },
        { t:'dlg', who:'',       left:null,  right:null,     text:'[Abbyl liga o aparelho]' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Pera aí... O quê você disse?' },
        { t:'flash' },
        { t:'bg',    src:'scenes/vrchat.jpg' },
        { t:'music', id:'ost-p' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Caramba, que viajem' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'É igual ao VRchat de verdade, só que eu tô dentro dele com o meu corpo, caramba hein' },
        { t:'bg',    src:'scenes/abbyl-laboratorio.jpeg' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Até que você não é só um cara esquisitão no fim das contas' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Fico feliz que tenha gostado-' },
        { t:'bg',    src:'scenes/vrchat.jpg' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Será que dá pra ir pra qualquer instância?' },
        { t:'bg',    src:'scenes/abbyl-laboratorio.jpeg' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Sev-' },
        { t:'bg',    src:'scenes/vrchat.jpg' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Será que eu consigo mudar de Skin?', changeSkin:true },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Oloco, consigo sim' },
        { t:'bg',    src:'scenes/abbyl-laboratorio.jpeg' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Seven!' },
        { t:'bg',    src:'scenes/vrchat.jpg' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'Será que eu consigo usar efeitos também?' },
        { t:'bg',    src:'scenes/abbyl-laboratorio.jpeg' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'SEVEN, ME ESCUTA' },
        { t:'bg',    src:'scenes/vrchat.jpg' },
        { t:'dlg', who:'',       left:null, right:null,      text:'[Seven não se encontra mais no enquadramento]', hideRight:true },
        { t:'bg',    src:'scenes/abbyl-laboratorio.jpeg' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Fala sério.' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Acho que a minha pior ideia foi ter jogado ele lá...' },
        { t:'bg',    src:'scenes/vrchat.jpg' },
        { t:'music', id:'creeppy' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'AAAAH SOCORRO! TEM FURRYS POR TODA PARTE' },
        { t:'dlg', who:'Furry',  left:'furry1', right:null,  text:'Vem cá, fofinho, você tem rabinho e orelhinhas como a gente, deixa a gente te mostrar algo bem legal' },
        { t:'dlg', who:'Seven',  left:null, right:'seven',   text:'NAAAAAAAAAAAAAAAO' },
        { t:'bg',    src:'scenes/abbyl-laboratorio.jpeg' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Droga! SEVEN! SEVEN! RESPONDA!' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Merda! O que foi que eu fiz!' },
        { t:'timeskip' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'É, acho melhor eu entrar.' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Preciso resgatá-lo' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Aqui vou eu...' },
        { t:'stopmusic' },
        { t:'flash' },
        { t:'bg',    src:'scenes/vrchat.jpg' },
        { t:'music', id:'megalovania' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Finalmente, aqui estou, agora preciso achar ele.' },
        { t:'dlg', who:'Abbyl',  left:'abbyl', right:null,   text:'Droga, parece a voz do Seven no meio daquilo, preciso correr' },
        { t:'minigame' },
        { t:'bg',    src:'scenes/vrchat1.png' },
        { t:'music', id:'ost-p' },
        { t:'dlg', who:'Seven',   left:null, right:'seven',  text:'Hahahaha, cê loko, mó gente boa vocês.' },
        { t:'dlg', who:'Seven',   left:null, right:'seven',  text:'Me conta mais uma vez a história de quando vocês acabaram com aquele esquisito, hahaha' },
        { t:'dlg', who:'Abbyl',   left:'abbyl', right:'seven', text:'O que significa isso, Seven?' },
        { t:'dlg', who:'Seven',   left:null, right:'seven',  text:'Ah, oi, Abbyl, esses caras são legais demais, me mostraram muita coisa legal aqui no VRChat, eu nunca pensei que ficar aqui com o corpo físico seria tão legal' },
        { t:'dlg', who:'Furry 2', left:'furry2', right:'seven', text:'Corpo físico? Do que ele tá falando?' },
        { t:'dlg', who:'Abbyl',   left:'abbyl', right:'seven', text:'E eu aqui preocupado com você.' },
        { t:'dlg', who:'Furry',   left:'furry1', right:'seven', text:'Você também tem orelhinhas e rabo, também é um de nós?' },
        { t:'dlg', who:'Abbyl',   left:'abbyl', right:'furry1', text:'Não, não, não, você entendeu tudo errado' },
        { t:'dlg', who:'Furry',   left:'furry1', right:'abbyl', text:'Vamos, não seja tímido, vamos ser amigos.' },
        { t:'dlg', who:'Abbyl',   left:'abbyl', right:'furry1', text:'NAAAAAAAAAAAAAAAO!' },
        { t:'dlg', who:'Furry',   left:'furry1', right:'abbyl', text:'Podemos conversar sobre garotas cavalos se você quiser' },
        { t:'dlg', who:'Abbyl',   left:'abbyl', right:'furry1', text:'Sente-se, meu amigo' },
        { t:'dlg', who:'',        left:null, right:'seven',  text:'Seven apenas fica parado sem dizer uma palavra' },
        { t:'calendar' },
    ];

    function gs(id){ return document.getElementById(id); }

    // ── Fundo ────────────────────────────────────────────────
    function setBg(src){
        var bg=gs('bg-image'); if(!bg) return;
        var bgDiv=gs('background'); if(bgDiv) bgDiv.style.display='';
        bg.style.opacity='0';
        setTimeout(function(){
            bg.src='./assets/images/'+src;
            bg.style.display='block';
            bg.style.opacity='0.6';
        },250);
    }

    // ── Personagens ──────────────────────────────────────────
    var CHAR_SRCS = {
        abbyl:   './assets/images/characters/abbyl.png',
        bybyl:   './assets/images/characters/abbyl.png',
        furry1:  './assets/images/characters/furry1.png',
        furry2:  './assets/images/characters/furry2.png',
        aldrich: './assets/images/characters/aldrich.png',
    };
    // Musume overrides para o cheat Abbyl — Abbyl NÃO é trocada, o resto sim
    var MUSUME_SRCS = {
        seven:       './assets/images/ui/musume/seven.png',
        aldrich:     './assets/images/ui/musume/aldrich.png',
        arabel:      './assets/images/ui/musume/arabel.png',
        nero:        './assets/images/ui/musume/nero.png',
        nina:        './assets/images/ui/musume/nina.png',
        volkenburt:  './assets/images/ui/musume/Eishin_Flash_(Main).png',
        furry1:      './assets/images/ui/musume/furry1.png',
        furry2:      './assets/images/ui/musume/furry2.png',
        default:     './assets/images/ui/musume/Fenomeno_(Main).png',
    };
    function sevenSrc(){ return _sevenSkin?'./assets/images/characters/sevenskin.png':'./assets/images/characters/seven.png'; }

    function resolveCharSrc(key){
        // Abbyl nunca é trocada pelo cheat
        if(key==='abbyl'||key==='bybyl') return CHAR_SRCS[key]||('./assets/images/characters/'+key+'.png');
        if(window._abbylCheatPersist){
            if(key==='seven') return MUSUME_SRCS.seven;
            return MUSUME_SRCS[key] || MUSUME_SRCS.default;
        }
        if(key==='seven') return sevenSrc();
        return CHAR_SRCS[key]||('./assets/images/characters/'+key+'.png');
    }

    // Timers pendentes por lado — cancelados antes de cada nova chamada
    // ── Personagens — lógica idêntica ao updateCharacter do jogo principal ──
    function setChar(side, key){
        var divEl=gs('character-'+side), imgEl=gs('char-'+side+'-img');
        if(!divEl||!imgEl) return;

        if(!key){
            divEl.classList.remove('visible');
            imgEl.dataset.char='';
            imgEl.dataset.sevenSkin='';
            return;
        }

        var src     = resolveCharSrc(key);
        var newSkin = (window._abbylCheatPersist ? 'musume' : '') + (_sevenSkin ? '1' : '0');

        if(imgEl.dataset.char===key && imgEl.dataset.sevenSkin===newSkin){
            divEl.classList.add('visible');
        } else {
            divEl.classList.remove('visible');
            setTimeout(function(){
                imgEl.src=src;
                imgEl.dataset.char=key;
                imgEl.dataset.sevenSkin=newSkin;
                requestAnimationFrame(function(){ requestAnimationFrame(function(){ divEl.classList.add('visible'); }); });
            },300);
        }
    }

    // Cor rainbow do Seven na fala de flex
    var _sevenFlexIv = null;
    var _FLEX_COLORS = [
        {c:'#ff4466',r:'255,68,102'},
        {c:'#ff9900',r:'255,153,0'},
        {c:'#ffee00',r:'255,238,0'},
        {c:'#00ff99',r:'0,255,153'},
        {c:'#00ccff',r:'0,204,255'},
        {c:'#cc44ff',r:'204,68,255'},
    ];
    var _flexIdx = 0;
    function startFlexColors(){
        stopFlexColors();
        _flexIdx = 0;
        _sevenFlexIv = setInterval(function(){
            var col = _FLEX_COLORS[_flexIdx % _FLEX_COLORS.length];
            var w = gs('dialogue-wrapper');
            if(w){ w.style.setProperty('--spk-color', col.c); w.style.setProperty('--spk-color-rgb', col.r); }
            var spk = gs('speaker-box');
            if(spk) spk.style.background = col.c;
            _flexIdx++;
        }, 180);
    }
    function stopFlexColors(){
        if(_sevenFlexIv){ clearInterval(_sevenFlexIv); _sevenFlexIv=null; }
        // Restaura cor padrão do Seven
        var w=gs('dialogue-wrapper');
        if(w){ w.style.setProperty('--spk-color','#00ff99'); w.style.setProperty('--spk-color-rgb','0,255,153'); }
        var spk=gs('speaker-box');
        if(spk) spk.style.background='';
    }

    // ── Áudio ────────────────────────────────────────────────
    function fadeOut(cb){
        if(!_curBg){ if(cb) cb(); return; }
        var a=_curBg; _curBg=null; var vol=a.volume;
        var iv=setInterval(function(){ vol=Math.max(0,vol-0.07); a.volume=vol; if(vol<=0){ clearInterval(iv); a.pause(); a.currentTime=0; if(cb) cb(); } },60);
    }
    function playMusic(id){
        var elId={'discord-chat':'discord-chat-music','ost-p':'ost-p','creeppy':'creeppy-music','megalovania':'megalovania-music'}[id];
        var el=elId?gs(elId):null; if(!el) return;
        var vols={'ost-p':0.55,'discord-chat':0.45,'megalovania':0.6,'creeppy':0.5};
        var gv=typeof _globalVolume!=='undefined'?_globalVolume:1;
        fadeOut(function(){
            _curBg=el; el.volume=Math.min(1,(vols[id]||0.5)*gv);
            el.currentTime=0; el.play().catch(function(){});
        });
    }

    // ── Diálogo (usa elementos existentes do game) ────────────
    var SPK_COL = {
        'Abbyl':           {c:'#00e5ff',r:'0,229,255'},
        'Bybyl':           {c:'#00e5ff',r:'0,229,255'},
        'Seven':           {c:'#00ff99',r:'0,255,153'},
        'Furry':           {c:'#ff9933',r:'255,153,51'},
        'Furry 2':         {c:'#ff9933',r:'255,153,51'},
        'Criatura':        {c:'#cc0000',r:'204,0,0'},
        'Aldrich Pudding': {c:'#eb459e',r:'235,69,158'},
        'Lucão':           {c:'#faa61a',r:'250,166,26'},
        'Raposo':          {c:'#57f287',r:'87,242,135'},
        'Fox':             {c:'#5865f2',r:'88,101,242'},
    };
    var _fullText='';

    function showDialogue(step){
        var wrapper=gs('dialogue-wrapper'), spkBox=gs('speaker-box');
        var dtxt=gs('dialogue-text'), nxt=gs('next-indicator');
        if(!wrapper||!dtxt) return;
        // Garante visibilidade (game-screen children são ocultados no init)
        wrapper.style.display='';
        if(wrapper.parentElement) wrapper.parentElement.style.display='block';

        setChar('left',  step.left||null);
        setChar('right', step.right||null);

        var spk=step.who||'';
        wrapper.dataset.speaker=spk;
        var col=SPK_COL[spk];
        if(col){ wrapper.style.setProperty('--spk-color',col.c); wrapper.style.setProperty('--spk-color-rgb',col.r); }
        else    { wrapper.style.removeProperty('--spk-color'); wrapper.style.removeProperty('--spk-color-rgb'); }

        if(spkBox){ spkBox.textContent=spk; spkBox.classList.toggle('active',!!spk); }
        if(nxt) nxt.style.display='none';
        dtxt.textContent=''; _waitClick=false; _fullText=step.text||'';

        // Typewriter — usa setInterval igual ao jogo principal
        // para poder ser interrompido pelo pause corretamente
        _twGen++;
        var myGen=_twGen;
        var text=_fullText, i=0;
        if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
        _twInterval = setInterval(function(){
            if(_destroyed||myGen!==_twGen){ clearInterval(_twInterval); _twInterval=null; return; }
            if(_isPaused()) return; // congela o tick sem cancelar
            if(i<text.length){
                dtxt.textContent+=text[i++];
                if(text[i-1]!==' '&&i%2===0&&typeof _playNeroStoreTick==='function') _playNeroStoreTick();
            } else {
                clearInterval(_twInterval); _twInterval=null;
                _waitClick=true;
                if(nxt) nxt.style.display='block';
            }
        }, 30);
        _pendingSkip=function(){
            if(_waitClick) return;
            if(_isPaused()) return;
            _twGen++;
            if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
            dtxt.textContent=_fullText; _waitClick=true; if(nxt) nxt.style.display='block';
        };
    }

    // ── Flash branco ─────────────────────────────────────────
    function doFlash(cb){
        var fl=gs('white-flash'), heal=gs('heal-sound');
        if(!fl){ if(cb) cb(); return; }
        if(heal){ heal.currentTime=0; heal.volume=0.8; heal.play().catch(function(){}); }
        fl.style.transition='opacity 0.05s ease-in'; fl.style.opacity='1';
        setTimeout(function(){ fl.style.transition='opacity 0.6s ease-out'; fl.style.opacity='0'; setTimeout(cb,700); },80);
    }

    // ── Timeskip ─────────────────────────────────────────────
    function doTimeskip(cb){
        // Para música e esconde diálogo/personagens imediatamente
        fadeOut(null);
        var dw=gs('dialogue-wrapper'); if(dw) dw.style.display='none';
        var nb=gs('next-indicator');   if(nb) nb.style.display='none';
        var spk=gs('speaker-box');     if(spk){ spk.textContent=''; spk.classList.remove('active'); }
        var lDiv=gs('character-left'); if(lDiv) lDiv.classList.remove('visible');
        var rDiv=gs('character-right');if(rDiv) rDiv.classList.remove('visible');
        var lImg=gs('char-left-img');  if(lImg){ lImg.dataset.char=''; lImg.dataset.sevenSkin=''; }
        var rImg=gs('char-right-img'); if(rImg){ rImg.dataset.char=''; rImg.dataset.sevenSkin=''; }

        if(typeof showTimeCardAnimation==='function'){
            showTimeCardAnimation({time:'22:05',period:'NOITE',date:'SEG  ·  13 DE JANEIRO',location:'Laboratório da Abbyl'},function(){
                // Restaura dialogue-wrapper antes de continuar
                var dw2=gs('dialogue-wrapper'); if(dw2) dw2.style.display='';
                cb();
            });
            return;
        }
        var ov=document.createElement('div');
        ov.style.cssText='position:fixed;inset:0;background:#000;z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.8s';
        ov.innerHTML='<span style="color:#fff;font-size:clamp(18px,3vw,36px);letter-spacing:8px;font-weight:300">2 horas depois...</span>';
        document.body.appendChild(ov);
        requestAnimationFrame(function(){requestAnimationFrame(function(){ ov.style.opacity='1'; });});
        setTimeout(function(){
            ov.style.opacity='0';
            setTimeout(function(){
                ov.remove();
                var dw2=gs('dialogue-wrapper'); if(dw2) dw2.style.display='';
                cb();
            },800);
        },2500);
    }

    // ── Seven clones ─────────────────────────────────────────
    function spawnClones(){
        if(_spawnBlocked||_destroyed) return;
        clearClones();
        var gs_=gs('game-screen'); if(!gs_) return;
        // Com cheat Abbyl ativo usa o gif do Aldrich, senão usa o Seven normal
        var cloneSrc=window._abbylCheatPersist?'./assets/images/ui/call/aldrich pudding.gif':sevenSrc();
        for(var i=0;i<8;i++){
            (function(idx){
                var img=document.createElement('img');
                img.src=cloneSrc;
                img.style.cssText='position:absolute;z-index:3;pointer-events:none;height:clamp(100px,18vh,220px);width:auto;left:'+(Math.random()*80)+'%;top:'+(Math.random()*50)+'%;opacity:0;transition:opacity 0.4s;'+(idx%2===0?'transform:scaleX(-1)':'');
                img.dataset.ch14clone='1';
                gs_.appendChild(img); _clones.push(img);
                setTimeout(function(){ img.style.opacity='0.8'; },idx*80);
            })(i);
        }
    }
    function clearClones(){
        _spawnBlocked=true;
        _clones.forEach(function(el){ el.style.opacity='0'; setTimeout(function(){ el.remove(); },400); });
        _clones=[];
    }
    function resetClones(){
        _spawnBlocked=false;
    }

    // ── Minigame — configuração por dificuldade ─────────────
    var MG_DIFFICULTY = {
        easy: {
            phases: [
                { total:8,  spd:1.2, time:40 },
            ],
            lives: 3,
            label: 'FÁCIL',
        },
        normal: {
            phases: [
                { total:10, spd:1.4, time:30 },
                { total:18, spd:4.0, time:22 },
                { total:26, spd:7.5, time:15 },
            ],
            lives: 3,
            label: 'NORMAL',
        },
        hard: {
            phases: [
                { total:12, spd:2.5, time:25 },
                { total:18, spd:4.5, time:20 },
                { total:24, spd:7.0, time:16 },
                { total:30, spd:9.5, time:13 },
                { total:38, spd:13.0,time:10 },
            ],
            lives: 2,
            label: 'DIFÍCIL',
        },
        legendary: {
            phases: [
                { total:20, spd:5.0,  time:18 },  // fase 1 — aquecimento
                { total:30, spd:8.0,  time:14 },  // fase 2
                { total:40, spd:12.0, time:11 },  // fase 3 — caótico
                { total:50, spd:16.0, time: 9 },  // fase 4 — insano
                { total:60, spd:20.0, time: 7 },  // fase 5
                { total:70, spd:25.0, time: 6 },  // fase 6
                { total:80, spd:30.0, time: 5 },  // fase 7 — absurdo
            ],
            lives: 1,  // 1 vida — erra uma, acabou
            label: '★ LEGENDARY',
        },
    };

    function _getMgConfig(){
        var diff = (typeof window._mgDifficulty !== 'undefined') ? window._mgDifficulty : 'normal';
        return MG_DIFFICULTY[diff] || MG_DIFFICULTY.normal;
    }

    var _mgLives   = 3;
    var _mgPhase   = 0;
    var _mgFound   = 0;

    function buildMg(){
        var d=document.createElement('div'); d.id='ch14-mg';
        d.style.cssText='position:fixed;inset:0;z-index:5000;background:rgba(0,0,0,0.87);display:flex;flex-direction:column;align-items:center;padding-top:18px';
        d.innerHTML=
             '<div id="ch14-mg-diff" style="color:rgba(255,255,255,0.25);font-size:9px;letter-spacing:4px;font-weight:800;margin-bottom:2px">NORMAL</div>'+'<div id="ch14-mg-phase"  style="color:rgba(255,255,255,0.45);font-size:11px;letter-spacing:5px;font-weight:800;margin-bottom:4px">FASE 1 / 3</div>'
            +'<div style="color:#fff;font-size:13px;letter-spacing:4px;font-weight:800;margin-bottom:6px">ACHE O SEVEN!</div>'
            +'<div id="ch14-mg-hearts" style="font-size:22px;letter-spacing:4px;margin-bottom:4px">❤️❤️❤️</div>'
            +'<div id="ch14-mg-arena"  style="position:relative;width:100%;flex:1;overflow:hidden"></div>'
            // ── overlay de resultado (fase vencida ou vida perdida) ──
            +'<div id="ch14-mg-result" style="display:none;position:fixed;inset:0;z-index:5100;background:rgba(0,0,0,0.92);flex-direction:column;align-items:center;justify-content:center">'
            +'<p id="ch14-mg-rtxt" style="color:#fff;font-size:clamp(15px,2vw,22px);letter-spacing:4px;margin-bottom:24px;text-align:center;white-space:pre-line"></p>'
            +'<button id="ch14-mg-rbtn" style="padding:10px 28px;background:#7c3aed;color:#fff;border:none;font-size:14px;letter-spacing:3px;cursor:pointer;font-family:inherit">CONTINUAR</button>'
            +'</div>'
            // ── game over ──
            +'<div id="ch14-mg-gameover" style="display:none;position:fixed;inset:0;z-index:5200;background:#000;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 1s">'
            +'<div style="font-size:clamp(28px,6vw,72px);font-weight:900;color:#ff2244;letter-spacing:6px;font-family:Arial Black,sans-serif;margin-bottom:16px">GAME OVER</div>'
            +'<div style="font-size:clamp(13px,1.8vw,20px);color:rgba(255,255,255,0.7);letter-spacing:3px;margin-bottom:48px;text-align:center">O Seven agora é furry.</div>'
            +'<button id="ch14-mg-restart" style="padding:12px 36px;background:transparent;border:2px solid rgba(255,34,68,0.6);color:rgba(255,34,68,0.8);font-size:13px;font-weight:800;letter-spacing:3px;cursor:pointer;font-family:inherit;text-transform:uppercase;transition:all .2s">Reiniciar Capítulo</button>'
            +'</div>';
        document.body.appendChild(d); return d;
    }

    function _updateHearts(){
        var h=gs('ch14-mg-hearts'); if(!h) return;
        var maxLives=_getMgConfig().lives;
        var s=''; for(var i=0;i<maxLives;i++) s+=(i<_mgLives?'❤️':'🖤'); h.textContent=s;
    }
    function _updatePhaseLabel(){
        var cfg=_getMgConfig();
        var p=gs('ch14-mg-phase'); if(p) p.textContent='FASE '+(_mgPhase+1)+' / '+cfg.phases.length;
        var d=gs('ch14-mg-diff');  if(d) d.textContent=cfg.label;
    }

    function _flashRed(){
        var fl=document.createElement('div');
        fl.style.cssText='position:fixed;inset:0;z-index:5050;background:rgba(255,0,0,0.4);pointer-events:none;transition:opacity 0.35s';
        document.body.appendChild(fl);
        setTimeout(function(){ fl.style.opacity='0'; setTimeout(function(){ fl.remove(); },350); },60);
    }

    function _mgHitFurry(){
        if(!_mgActive) return;
        _mgLives--; _updateHearts(); _flashRed();
        if(_mgLives<=0){
            if(_mgInterval&&_mgInterval.cancel)_mgInterval.cancel(); _mgInterval=null;
            clearTimeout(_mgTimeout); _mgActive=false;
            setTimeout(_showGameOver, 300);
        }
    }

    // ── Efeito de áudio do game over: pitch down + lowpass ──────────
    // Usa apenas playbackRate — sem createMediaElementSource para não
    // sequestrar o elemento e quebrar a reprodução após reiniciar.
    var _goPitchIv   = null;
    var _goAudioEl   = null;

    function _applyGameOverAudio() {
        try {
            var audioEl = document.getElementById('megalovania-music');
            if (!audioEl || audioEl.paused) return;
            _goAudioEl = audioEl;

            // Pitch down gradual: 1.0 → 0.72 em 1.2s
            var startRate  = 1.0;
            var targetRate = 0.72;
            var steps      = 30;
            var stepMs     = 1200 / steps;
            var step       = 0;
            audioEl.playbackRate = startRate;

            if (_goPitchIv) clearInterval(_goPitchIv);
            _goPitchIv = setInterval(function() {
                step++;
                audioEl.playbackRate = startRate + (targetRate - startRate) * (step / steps);
                if (step >= steps) { clearInterval(_goPitchIv); _goPitchIv = null; }
            }, stepMs);
        } catch(e) {}
    }

    function _removeGameOverAudio() {
        if (_goPitchIv) { clearInterval(_goPitchIv); _goPitchIv = null; }
        if (_goAudioEl) { _goAudioEl.playbackRate = 1.0; _goAudioEl = null; }
    }
    // ── fim efeito game over ──────────────────────────────────────────

    function _showGameOver(){
        var go=gs('ch14-mg-gameover'); if(!go) return;
        go.style.display='flex';
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ go.style.opacity='1'; }); });
        _applyGameOverAudio();
        var rb=gs('ch14-mg-restart');
        if(rb){
            rb.addEventListener('mouseenter',function(){ rb.style.borderColor='rgba(255,34,68,1)'; rb.style.color='#ff2244'; });
            rb.addEventListener('mouseleave',function(){ rb.style.borderColor='rgba(255,34,68,0.6)'; rb.style.color='rgba(255,34,68,0.8)'; });
            rb.addEventListener('click',function(){
                _removeGameOverAudio();
                // Destrói minigame e reinicia o capítulo 1.4 do zero
                var mg=gs('ch14-mg'); if(mg) mg.remove();
                _mgSprites.forEach(function(s){ s.el.remove(); }); _mgSprites=[];
                if(typeof loadChapter==='function') loadChapter('1.4');
            });
        }
    }

    function startMgRound(){
        _updateHearts(); _updatePhaseLabel();
        var diffCfg=_getMgConfig();
        var cfg=diffCfg.phases[_mgPhase]||diffCfg.phases[diffCfg.phases.length-1];
        var arena=gs('ch14-mg-arena'); if(!arena) return;
        _mgSprites.forEach(function(s){ s.el.remove(); }); _mgSprites=[];

        var TOTAL=cfg.total, sevenIdx=Math.floor(Math.random()*TOTAL);
        for(var i=0;i<TOTAL;i++){
            (function(idx){
                var isSeven=idx===sevenIdx;
                var img=document.createElement('img');
                img.src=isSeven?'./assets/images/characters/sevengame.png':'./assets/images/characters/furrygame.png';
                img.style.cssText='position:absolute;cursor:pointer;height:clamp(50px,8vh,95px);width:auto;user-select:none;will-change:transform;left:0;top:0;pointer-events:auto';
                var vw=arena.clientWidth||window.innerWidth, vh=arena.clientHeight||window.innerHeight*0.8;
                var x=Math.random()*(vw*0.85), y=Math.random()*(vh*0.75);
                img.style.transform='translate('+x+'px,'+y+'px)';
                var spd=(cfg.spd+Math.random()*1.2), angle=Math.random()*Math.PI*2;
                var obj={el:img, x:x, y:y, dx:Math.cos(angle)*spd, dy:Math.sin(angle)*spd};
                // Linha de previsão — só em fácil e normal, só para o Seven
                if(isSeven){
                    var diff2=(typeof window._mgDifficulty!=='undefined')?window._mgDifficulty:'normal';
                    if(diff2==='easy'||diff2==='normal'){
                        var line=document.createElement('div');
                        line.id='ch14-mg-predict';
                        line.style.cssText='position:absolute;pointer-events:none;z-index:0;height:1px;background:linear-gradient(to right,rgba(80,255,140,0.7),rgba(80,255,140,0));transform-origin:0 50%;border-radius:1px';
                        arena.appendChild(line);
                        obj.predictLine=line;
                    }
                }
                _mgSprites.push(obj); arena.appendChild(img);
                if(isSeven){
                    img.addEventListener('click',function(e){ e.stopPropagation(); if(!_mgActive) return; _mgFoundSeven(); });
                } else {
                    img.addEventListener('click',function(e){ e.stopPropagation(); if(!_mgActive) return; _mgHitFurry(); });
                }
            })(i);
        }

        if(_mgInterval&&_mgInterval.cancel)_mgInterval.cancel(); _mgInterval=null; clearTimeout(_mgTimeout);
        var vw2=arena.clientWidth||window.innerWidth, vh2=arena.clientHeight||window.innerHeight*0.8;
        var _rafRunning=true, _lastTs=null;
        // Usa rAF com delta de tempo real — sem lag e com velocidade proporcional à fase
        function _rafLoop(ts){
            if(!_rafRunning||_destroyed||!_mgActive) return;
            if(_lastTs===null) _lastTs=ts;
            var dt=Math.min((ts-_lastTs)/16.67,3); // normalizado para 60fps; cap de 3x para não explodir em pause
            _lastTs=ts;
            _mgSprites.forEach(function(o){
                o.x+=o.dx*dt; o.y+=o.dy*dt;
                if(o.x<0||o.x>vw2*0.88){o.dx*=-1; o.x=Math.max(0,Math.min(vw2*0.88,o.x));}
                if(o.y<0||o.y>vh2*0.85){o.dy*=-1; o.y=Math.max(0,Math.min(vh2*0.85,o.y));}
                o.el.style.transform='translate('+o.x+'px,'+o.y+'px)';
                // Atualiza linha de previsão
                if(o.predictLine){
                    var sprW=o.el.offsetWidth||40, sprH=o.el.offsetHeight||60;
                    var cx=o.x+sprW*0.5, cy=o.y+sprH*0.5;
                    var predLen=70;
                    var ang=Math.atan2(o.dy,o.dx)*180/Math.PI;
                    o.predictLine.style.width=predLen+'px';
                    o.predictLine.style.left=cx+'px';
                    o.predictLine.style.top=cy+'px';
                    o.predictLine.style.transform='rotate('+ang+'deg)';
                }
            });
            requestAnimationFrame(_rafLoop);
        }
        requestAnimationFrame(_rafLoop);
        _mgInterval={cancel:function(){ _rafRunning=false; }};
        _mgTimeout=setTimeout(function(){
            if(_mgInterval&&_mgInterval.cancel)_mgInterval.cancel(); _mgInterval=null;
            _mgActive=false; _showTimerFail();
        },cfg.time*1000);
    }

    function _mgClearPredictLine(){
        _mgSprites.forEach(function(o){ if(o.predictLine){ o.predictLine.remove(); o.predictLine=null; } });
    }

    function _mgFoundSeven(){
        if(_mgInterval&&_mgInterval.cancel)_mgInterval.cancel(); _mgInterval=null;
        clearTimeout(_mgTimeout); _mgActive=false;
        _mgClearPredictLine();
        try{ var s=new Audio('assets/audio/correct.mp3'); s.volume=0.8; s.play(); }catch(e){}
        _mgFound++; _mgPhase++;

        var diffCfg2=_getMgConfig();
        var totalPhases=diffCfg2.phases.length;
        var rt=gs('ch14-mg-rtxt'), rb=gs('ch14-mg-rbtn'), rbox=gs('ch14-mg-result');
        if(_mgFound>=totalPhases){
            // Venceu todas as fases — avança história
            if(rt) rt.textContent='VOCÊ ACHOU O SEVEN!\n'+totalPhases+' / '+totalPhases+'  ✓';
            if(rb){
                rb.textContent='CONTINUAR';
                rb.onclick=function(){
                    rbox.style.display='none';
                    var mg=gs('ch14-mg'); if(mg){ mg.remove(); }
                    _mgSprites.forEach(function(s){ s.el.remove(); }); _mgSprites=[];
                    runStep();
                };
            }
        } else {
            // Próxima fase
            var phaseLabels=['','FASE 2: MAIS RÁPIDO!','FASE 3: MUITO RÁPIDO!','FASE 4: CAÓTICO!','FASE 5: MÁXIMO CAOS!'];
            if(rt) rt.textContent='ENCONTROU! ('+_mgFound+' / '+totalPhases+')\n'+(phaseLabels[_mgFound]||'PRÓXIMA FASE!');
            if(rb){
                rb.textContent='PRÓXIMA FASE';
                rb.onclick=function(){
                    rbox.style.display='none';
                    _mgActive=true;
                    startMgRound();
                };
            }
        }
        if(rbox) rbox.style.display='flex';
    }

    function _showTimerFail(){
        // Tempo acabou — tenta de novo na mesma fase sem perder vida
        _mgClearPredictLine();
        var rt=gs('ch14-mg-rtxt'), rb=gs('ch14-mg-rbtn'), rbox=gs('ch14-mg-result');
        if(rt) rt.textContent='O SEVEN FUGIU!\nTENTE DE NOVO';
        if(rb){ rb.textContent='TENTAR DE NOVO'; rb.onclick=function(){ rbox.style.display='none'; _mgActive=true; startMgRound(); }; }
        if(rbox) rbox.style.display='flex';
    }

    // ── Calendário ────────────────────────────────────────────
    // ── Monólogo centralizado (sem personagem, sem narrator) ──────────────
    function doMono(step, cb){
        var ov=document.createElement('div');
        ov.style.cssText='position:fixed;inset:0;z-index:9500;display:flex;align-items:center;justify-content:center;padding:0 10vw;pointer-events:all';
        var txt=document.createElement('div');
        txt.style.cssText='font-size:clamp(15px,1.8vw,22px);color:rgba(255,255,255,0);line-height:1.9;text-align:center;font-style:italic;letter-spacing:1px;transition:color 0.8s ease;max-width:640px';
        txt.textContent=step.text||'';
        ov.appendChild(txt);
        document.body.appendChild(ov);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ txt.style.color='rgba(255,255,255,0.82)'; }); });
        _active=true; _waitClick=false;
        function _next(){
            document.removeEventListener('click', _next);
            document.removeEventListener('keydown', _nextKD);
            txt.style.color='rgba(255,255,255,0)';
            setTimeout(function(){ ov.remove(); cb(); },700);
        }
        function _nextKD(e){
            var isAdv=(typeof kbIs==='function')?kbIs(e,'ADVANCE'):(e.code==='Space');
            if(!isAdv&&e.code!=='Enter'&&e.code!=='KeyZ') return;
            _next();
        }
        setTimeout(function(){ document.addEventListener('click', _next); document.addEventListener('keydown', _nextKD); },400);
    }

    // ── Monólogo com nome do personagem (sem sprite) ──────────────────────
    function doMonoChar(step, cb){
        var dw=gs('dialogue-wrapper'), spkBox=gs('speaker-box');
        var dtxt=gs('dialogue-text'), nxt=gs('next-indicator');
        if(!dw||!dtxt){ cb(); return; }
        setChar('left', null);
        setChar('right', null);
        dw.style.display='';
        var spk=step.who||'';
        dw.dataset.speaker=spk;
        var col=SPK_COL[spk];
        if(col){ dw.style.setProperty('--spk-color',col.c); dw.style.setProperty('--spk-color-rgb',col.r); }
        if(spkBox){ spkBox.textContent=spk; spkBox.classList.toggle('active',!!spk); }
        if(nxt) nxt.style.display='none';
        dtxt.textContent=''; _waitClick=false; _fullText=step.text||'';
        var i=0;
        if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
        _twGen++;
        var gen=_twGen;
        _twInterval=setInterval(function(){
            if(_destroyed||gen!==_twGen){ clearInterval(_twInterval); return; }
            if(window.gamePaused||( document.getElementById('pause-overlay')&&document.getElementById('pause-overlay').classList.contains('open') )){ return; }
            if(i<_fullText.length){ dtxt.textContent+=_fullText[i++]; }
            else{ clearInterval(_twInterval); _twInterval=null; if(nxt) nxt.style.display='block'; _waitClick=true; }
        },28);
        _pendingSkip=function(){
            if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
            dtxt.textContent=_fullText; if(nxt) nxt.style.display='block'; _waitClick=true; _pendingSkip=null;
        };
        // cb is called when user clicks (via _onInput → runStep)
        void cb;
    }

    // ── Sonho — entra ─────────────────────────────────────────────────────
    var _dreamOv=null;
    function doDreamEnter(cb){
        fadeOut(null);
        var dw=gs('dialogue-wrapper'); if(dw) dw.style.display='none';
        var lDiv=gs('character-left'); if(lDiv) lDiv.classList.remove('visible');
        var rDiv=gs('character-right'); if(rDiv) rDiv.classList.remove('visible');
        _dreamOv=document.createElement('div');
        _dreamOv.style.cssText='position:fixed;inset:0;z-index:9600;background:#000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 1.2s ease;overflow:hidden';
        // Fundo onírico com ruído vermelho pulsante
        var noise=document.createElement('canvas');
        noise.width=4; noise.height=4;
        noise.style.cssText='position:absolute;inset:0;width:100%;height:100%;opacity:0.04;image-rendering:pixelated';
        _dreamOv.appendChild(noise);
        var vignette=document.createElement('div');
        vignette.style.cssText='position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(100,0,0,0.3) 0%,rgba(0,0,0,0.85) 100%);animation:ch14DreamPulse 3s ease-in-out infinite';
        _dreamOv.appendChild(vignette);
        // Texto "SONHO" ao fundo
        var bgLbl=document.createElement('div'); bgLbl.textContent='SONHO';
        bgLbl.style.cssText='position:absolute;font-size:clamp(80px,18vw,200px);font-weight:900;font-family:Arial Black,sans-serif;color:rgba(180,0,0,0.04);letter-spacing:-4px;user-select:none;pointer-events:none';
        _dreamOv.appendChild(bgLbl);
        // CSS da animação
        if(!document.getElementById('ch14-dream-style')){
            var st=document.createElement('style');
            st.id='ch14-dream-style';
            st.textContent='@keyframes ch14DreamPulse{0%,100%{opacity:1}50%{opacity:0.55}}@keyframes ch14EchoWave{0%,100%{transform:translateY(0) scaleX(1)}25%{transform:translateY(-3px) scaleX(1.01)}75%{transform:translateY(3px) scaleX(0.99)}}';
            document.head.appendChild(st);
        }
        // Dialogue wrapper ficará sobre o overlay
        var dw2=gs('dialogue-wrapper'); if(dw2){ dw2.style.zIndex='9700'; }
        document.body.appendChild(_dreamOv);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ _dreamOv.style.opacity='1'; }); });
        setTimeout(function(){
            var dw2=gs('dialogue-wrapper'); if(dw2){ dw2.style.display=''; }
            cb();
        }, 1400);
    }

    function doDreamLeave(cb){
        var dw=gs('dialogue-wrapper'); if(dw){ dw.style.zIndex=''; dw.style.display='none'; }
        if(_dreamOv){ _dreamOv.style.opacity='0'; setTimeout(function(){ if(_dreamOv){ _dreamOv.remove(); _dreamOv=null; } cb(); },1200); }
        else cb();
    }

    // ── Glitch no bg-image ────────────────────────────────────────────────
    var _glitchIv=null;
    function doGlitchOn(){
        if(!document.getElementById('ch14-glitch-style')){
            var st=document.createElement('style');
            st.id='ch14-glitch-style';
            st.textContent='@keyframes ch14Glitch1{0%,100%{clip-path:inset(0 0 95% 0);transform:translateX(-4px)}50%{clip-path:inset(30% 0 50% 0);transform:translateX(4px)}}@keyframes ch14Glitch2{0%,100%{clip-path:inset(50% 0 30% 0);transform:translateX(3px)}50%{clip-path:inset(80% 0 5% 0);transform:translateX(-3px)}}';
            document.head.appendChild(st);
        }
        var bg=gs('bg-image'); if(!bg) return;
        bg.style.filter='saturate(0.3) brightness(0.55)';
        // Dois layers de glitch sobre o bg
        ['ch14-gl1','ch14-gl2'].forEach(function(id,i){
            var g=gs(id); if(g) g.remove();
            var gl=document.createElement('img');
            gl.id=id; gl.src=bg.src;
            gl.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:0.6;pointer-events:none;z-index:2;animation:ch14Glitch'+(i+1)+' '+(0.18+i*0.07)+'s steps(1) infinite;mix-blend-mode:screen';
            gl.style.filter='hue-rotate('+(i*120)+'deg) saturate(3)';
            var bgParent=bg.parentElement||document.getElementById('game-screen');
            if(bgParent) bgParent.appendChild(gl);
        });
        // Ruído horizontal randômico
        _glitchIv=setInterval(function(){
            var bg2=gs('bg-image'); if(!bg2) return;
            bg2.style.transform='translateX('+(Math.random()*6-3)+'px)';
            setTimeout(function(){ var b=gs('bg-image'); if(b) b.style.transform=''; },60);
        },220);
    }
    function doGlitchOff(){
        clearInterval(_glitchIv); _glitchIv=null;
        ['ch14-gl1','ch14-gl2'].forEach(function(id){ var g=gs(id); if(g) g.remove(); });
        var bg=gs('bg-image'); if(bg){ bg.style.filter=''; bg.style.transform=''; }
    }

    // ── Seven piscando (começa a sumir) ───────────────────────────────────
    var _blinkIv=null;
    function doSevenBlink(){
        var rImg=gs('char-right-img'); if(!rImg) return;
        var v=true;
        _blinkIv=setInterval(function(){
            rImg.style.opacity=v?'0':'1'; v=!v;
        },220);
    }
    function doSevenGone(cb){
        clearInterval(_blinkIv); _blinkIv=null;
        var rDiv=gs('character-right'), rImg=gs('char-right-img');
        if(!rDiv||!rImg){ cb(); return; }
        rImg.style.transition='opacity 1.2s ease';
        rImg.style.opacity='0';
        setTimeout(function(){
            rDiv.classList.remove('visible');
            rImg.style.transition=''; rImg.style.opacity='1';
            cb();
        },1300);
    }

    // ── Eco — texto que balança com som de eco ────────────────────────────
    function doEcho(step, cb){
        var dw=gs('dialogue-wrapper'), spkBox=gs('speaker-box');
        var dtxt=gs('dialogue-text'), nxt=gs('next-indicator');
        if(!dw||!dtxt){ cb(); return; }
        var spk=step.who||'';
        dw.dataset.speaker=spk;
        var col=SPK_COL[spk];
        if(col){ dw.style.setProperty('--spk-color',col.c); dw.style.setProperty('--spk-color-rgb',col.r); }
        if(spkBox){ spkBox.textContent=spk; spkBox.classList.toggle('active',!!spk); }
        if(nxt) nxt.style.display='none';
        // Escreve letra por letra como typewriter, depois aplica eco
        dtxt.textContent=''; _waitClick=false; _fullText=step.text||'';
        var i=0;
        if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
        _twGen++; var gen=_twGen;
        _twInterval=setInterval(function(){
            if(_destroyed||gen!==_twGen){ clearInterval(_twInterval); return; }
            if(window.gamePaused) return;
            if(i<_fullText.length){ dtxt.textContent+=_fullText[i++]; }
            else{
                clearInterval(_twInterval); _twInterval=null;
                // Transforma em spans com animação de eco
                var letters=dtxt.textContent.split('');
                dtxt.innerHTML='';
                letters.forEach(function(ch,li){
                    var sp=document.createElement('span');
                    sp.textContent=ch;
                    sp.style.cssText='display:inline-block;animation:ch14EchoWave 0.7s ease-in-out infinite;animation-delay:'+(li*0.03)+'s';
                    dtxt.appendChild(sp);
                });
                // Som de eco: 3 toques decrescentes
                [0,180,340].forEach(function(delay,ei){
                    setTimeout(function(){
                        try{
                            var s=new Audio('assets/audio/confirmation.mp3');
                            s.volume=Math.max(0.05,0.45-ei*0.18); s.playbackRate=0.85+ei*0.08;
                            s.play();
                        }catch(e){}
                    },delay);
                });
                if(nxt) nxt.style.display='block'; _waitClick=true;
            }
        },32);
        _pendingSkip=function(){
            if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
            dtxt.textContent=_fullText;
            if(nxt) nxt.style.display='block'; _waitClick=true; _pendingSkip=null;
        };
        void cb;
    }

    // ── Timeskip customizável ────────────────────────────────────────────
    function doTimeskipCustom(step, cb){
        fadeOut(null);
        var dw=gs('dialogue-wrapper'); if(dw) dw.style.display='none';
        var nb=gs('next-indicator');   if(nb) nb.style.display='none';
        var spk=gs('speaker-box');     if(spk){ spk.textContent=''; spk.classList.remove('active'); }
        var lDiv=gs('character-left'); if(lDiv) lDiv.classList.remove('visible');
        var rDiv=gs('character-right');if(rDiv) rDiv.classList.remove('visible');
        if(typeof showTimeCardAnimation==='function'){
            showTimeCardAnimation({time:step.time||'??:??',period:step.period||'',date:step.date||'',location:step.location||''},function(){
                var dw2=gs('dialogue-wrapper'); if(dw2) dw2.style.display='';
                cb();
            });
            return;
        }
        var ov=document.createElement('div');
        ov.style.cssText='position:fixed;inset:0;background:#000;z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.8s';
        ov.innerHTML='<span style="color:#fff;font-size:clamp(18px,3vw,36px);letter-spacing:8px;font-weight:300">'+(step.location||'')+'</span>';
        document.body.appendChild(ov);
        requestAnimationFrame(function(){requestAnimationFrame(function(){ ov.style.opacity='1'; });});
        setTimeout(function(){ ov.style.opacity='0'; setTimeout(function(){ ov.remove(); var dw2=gs('dialogue-wrapper'); if(dw2) dw2.style.display=''; cb(); },800); },2500);
    }

    // ── SFX one-shot ─────────────────────────────────────────────────────
    function doSfx(step){
        try{ var s=new Audio(step.src); s.volume=0.7; s.play(); }catch(e){}
    }

    // ── Discord Call v2 ───────────────────────────────────────────────────
    var _dc14Screen=null, _dc14Timer=null, _dc14Secs=0;
    var DC14_CHARS = {
        abbyl:   { name:'Abbyl',           color:'#f0a050', img:'assets/images/characters/abbyl.png' },
        pudding: { name:'Aldrich Pudding',  color:'#eb459e', img:'assets/images/ui/call/aldrich pudding.gif' },
        lucao:   { name:'Lucão',            color:'#faa61a', img:'assets/images/characters/lucao.png' },
        raposo:  { name:'Raposo',           color:'#57f287', img:'assets/images/characters/raposo.png' },
        fox:     { name:'Fox',              color:'#5865f2', img:'assets/images/characters/fox.png' },
    };
    function _dc14MakeCard(id){
        var c=DC14_CHARS[id]; if(!c) return null;
        var card=document.createElement('div');
        card.id='dc14av-'+id;
        card.style.cssText='display:flex;flex-direction:column;align-items:center;gap:10px;opacity:0;transform:scale(0.5);transition:opacity 0.4s,transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        var ring=document.createElement('div');
        ring.id='dc14ring-'+id;
        ring.style.cssText='width:114px;height:114px;border-radius:50%;border:3px solid rgba(255,255,255,0.1);padding:3px;transition:border-color 0.25s,box-shadow 0.25s';
        var inner=document.createElement('div');
        inner.style.cssText='width:100%;height:100%;border-radius:50%;overflow:hidden;background:#222';
        var img=document.createElement('img');
        img.src=c.img; img.style.cssText='width:100%;height:100%;object-fit:cover;object-position:center 22%;display:block;border-radius:50%';
        img.onerror=function(){
            inner.style.background=c.color+'33';
            inner.innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:'+c.color+'">'+c.name[0]+'</div>';
        };
        inner.appendChild(img);
        ring.appendChild(inner); card.appendChild(ring);
        var tag=document.createElement('div');
        tag.style.cssText='font-size:12px;font-weight:800;letter-spacing:0.3px;background:rgba(0,0,0,0.55);padding:3px 10px;border-radius:4px;color:'+c.color+';max-width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center';
        tag.textContent=c.name;
        card.appendChild(tag);
        return card;
    }
    function dc14Open(step, cb){
        fadeOut(null);
        var dw=gs('dialogue-wrapper'); if(dw) dw.style.display='none';
        var lDiv=gs('character-left'); if(lDiv) lDiv.classList.remove('visible');
        var rDiv=gs('character-right'); if(rDiv) rDiv.classList.remove('visible');
        var color=step.color||'#5865f2';
        var scr=document.createElement('div');
        scr.id='dc14-screen';
        scr.style.cssText='position:fixed;inset:0;z-index:9200;display:flex;flex-direction:column;background:rgba(54,57,63,0.97);opacity:0;transition:opacity 0.6s ease';
        scr.innerHTML=
            '<div style="height:44px;background:rgba(30,31,34,.96);border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;padding:0 16px;gap:10px;flex-shrink:0">'
            +'<span style="font-size:14px;font-weight:800;color:#dbdee1"># '+(step.channel||'geral')+'</span>'
            +'<span style="font-size:11px;color:#80848e;margin-left:4px">— '+(step.server||'')+'</span>'
            +'<div style="margin-left:auto;display:flex;align-items:center;gap:6px;background:rgba(35,165,90,.14);border:1px solid rgba(35,165,90,.3);border-radius:4px;padding:3px 10px;font-size:11px;font-weight:700;color:#23a55a">'
            +'<span id="dc14dot" style="width:6px;height:6px;background:#23a55a;border-radius:50%;animation:ch14Blink 2s infinite"></span>'
            +' Em chamada · <span id="dc14timer">00:00</span></div></div>'
            +'<div id="dc14-callarea" style="flex:1;display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap;padding:24px"></div>'
            +'<div id="dc14-dialog" style="position:relative;bottom:0;left:0;right:0;padding:0 20px 20px;display:flex;justify-content:center;transform:translateY(0)">'
            +'<div style="width:100%;max-width:780px;background:rgba(20,21,24,.96);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px 20px 14px">'
            +'<div id="dc14-name" style="font-size:13px;font-weight:900;margin-bottom:6px;letter-spacing:.3px"></div>'
            +'<div id="dc14-text" style="font-size:15px;font-weight:500;color:#e0e3e7;line-height:1.6;min-height:22px"></div>'
            +'<div style="position:absolute;bottom:28px;right:36px;font-size:10px;color:#80848e;letter-spacing:.5px">▼ clique</div>'
            +'</div></div>';
        if(!document.getElementById('ch14-dc-style')){
            var st=document.createElement('style');
            st.id='ch14-dc-style';
            st.textContent='@keyframes ch14Blink{0%,100%{opacity:1}50%{opacity:.25}}@keyframes ch14dcSpk{0%,100%{border-color:rgba(255,255,255,.1);box-shadow:none}50%{border-color:#23a55a;box-shadow:0 0 0 3px rgba(35,165,90,.22)}}';
            document.head.appendChild(st);
        }
        document.body.appendChild(scr);
        _dc14Screen=scr;
        var area=document.getElementById('dc14-callarea');
        (step.chars||[]).forEach(function(id){
            var card=_dc14MakeCard(id); if(!card) return;
            area.appendChild(card);
            requestAnimationFrame(function(){ requestAnimationFrame(function(){ card.style.opacity='1'; card.style.transform='scale(1)'; }); });
        });
        // Timer
        _dc14Secs=0;
        _dc14Timer=setInterval(function(){
            _dc14Secs++;
            var tel=document.getElementById('dc14timer'); if(!tel) return;
            tel.textContent=String(Math.floor(_dc14Secs/60)).padStart(2,'0')+':'+String(_dc14Secs%60).padStart(2,'0');
        },1000);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ scr.style.opacity='1'; setTimeout(cb,500); }); });
    }
    function dc14Dlg(step, cb){
        var id=step.who||'';
        var c=DC14_CHARS[id];
        var nameEl=document.getElementById('dc14-name');
        var textEl=document.getElementById('dc14-text');
        if(!nameEl||!textEl){ _waitClick=true; return; }
        // Reset speaking rings
        Object.keys(DC14_CHARS).forEach(function(k){
            var ring=document.getElementById('dc14ring-'+k);
            if(ring) ring.style.animation='';
        });
        var speaking=step.speaking||[id];
        speaking.forEach(function(sid){
            var ring=document.getElementById('dc14ring-'+sid);
            if(ring) ring.style.cssText=ring.style.cssText.replace(/animation:[^;]+;?/,'')+'animation:ch14dcSpk 0.9s ease-in-out infinite';
        });
        if(nameEl){ nameEl.textContent=(c&&c.name)||id; nameEl.style.color=(c&&c.color)||'#fff'; }
        if(textEl){ textEl.textContent=''; }
        _waitClick=false; _fullText=step.text||'';
        var i=0;
        if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
        _twGen++; var gen=_twGen;
        _twInterval=setInterval(function(){
            if(_destroyed||gen!==_twGen){ clearInterval(_twInterval); return; }
            if(window.gamePaused) return;
            if(i<_fullText.length){ textEl.textContent+=_fullText[i++]; }
            else{ clearInterval(_twInterval); _twInterval=null; _waitClick=true; }
        },28);
        _pendingSkip=function(){
            if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
            textEl.textContent=_fullText; _waitClick=true; _pendingSkip=null;
        };
        void cb;
    }
    function dc14Close(cb){
        clearInterval(_dc14Timer); _dc14Timer=null;
        if(!_dc14Screen){ cb(); return; }
        _dc14Screen.style.opacity='0';
        setTimeout(function(){
            if(_dc14Screen){ _dc14Screen.remove(); _dc14Screen=null; }
            var dw=gs('dialogue-wrapper'); if(dw) dw.style.display='';
            cb();
        },600);
    }

    function doCalendar(cb){
        fadeOut(null);
        var dw=gs('dialogue-wrapper'); if(dw) dw.style.display='none';
        var nb=gs('next-indicator');   if(nb) nb.style.display='none';
        var spk=gs('speaker-box');     if(spk){ spk.textContent=''; spk.classList.remove('active'); }
        var lDiv=gs('character-left'); if(lDiv) lDiv.classList.remove('visible');
        var rDiv=gs('character-right'); if(rDiv) rDiv.classList.remove('visible');

        var COL_W=110;
        var days=[{name:'SÁB',num:11},{name:'DOM',num:12},{name:'SEG',num:13},{name:'TER',num:14},{name:'QUA',num:15},{name:'QUI',num:16},{name:'SEX',num:17},{name:'SÁB',num:18}];
        var FROM=0, TO=7;
        var TRAVEL_DURATION=3200; // ms da animação contínua

        var ov=document.createElement('div');
        ov.style.cssText='position:fixed;inset:0;background:#0a000f;z-index:10000;opacity:0;transition:opacity 1.1s ease;overflow:hidden';
        document.body.appendChild(ov);

        var bm=document.createElement('div'); bm.textContent='JAN';
        bm.style.cssText='position:absolute;right:8%;top:50%;transform:translateY(-50%);font-size:clamp(120px,22vw,260px);font-weight:900;font-family:Arial Black,sans-serif;color:rgba(255,255,255,0);letter-spacing:-8px;user-select:none;line-height:1;transition:color 1.8s ease';
        ov.appendChild(bm);
        var yr=document.createElement('div'); yr.textContent='2025';
        yr.style.cssText='position:absolute;right:calc(8% + 10px);top:calc(50% - clamp(60px,11vw,130px) - 28px);font-size:15px;color:rgba(255,255,255,0);font-family:monospace;letter-spacing:4px;transition:color 1.8s ease';
        ov.appendChild(yr);

        var strip=document.createElement('div');
        strip.style.cssText='position:absolute;left:50%;bottom:22%;transform:translateX(-50%) translateY(40px);width:'+(COL_W*8)+'px;height:120px;display:flex;align-items:stretch;opacity:0;transition:opacity 0.8s ease,transform 0.8s cubic-bezier(0.22,1,0.36,1)';
        ov.appendChild(strip);

        // Barra — posição animada via JS, sem CSS transition
        var bar=document.createElement('div');
        bar.style.cssText='position:absolute;top:0;bottom:0;width:'+COL_W+'px;left:'+(FROM*COL_W)+'px;background:#7c3aed;box-shadow:0 0 32px 8px rgba(124,58,237,0.55)';
        strip.appendChild(bar);

        // Brilho de rastro da barra
        var trail=document.createElement('div');
        trail.style.cssText='position:absolute;top:0;bottom:0;left:'+(FROM*COL_W)+'px;width:0;background:linear-gradient(to right,rgba(124,58,237,0.08),rgba(124,58,237,0));pointer-events:none';
        strip.appendChild(trail);

        var cols=[];
        days.forEach(function(d,idx){
            var col=document.createElement('div');
            col.style.cssText='position:relative;width:'+COL_W+'px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1;overflow:hidden';
            col.dataset.idx=idx;
            var n=document.createElement('div'); n.textContent=d.name;
            n.style.cssText='font-size:13px;letter-spacing:3px;font-family:monospace;font-weight:bold;margin-bottom:6px;color:'+(idx===FROM?'#fff':'#444');
            var nm=document.createElement('div'); nm.textContent=d.num;
            nm.style.cssText='font-size:clamp(32px,4vw,48px);font-weight:900;font-family:Arial Black,sans-serif;line-height:1;color:'+(idx===FROM?'#fff':'#333');
            col.appendChild(n); col.appendChild(nm); strip.appendChild(col);
            cols.push({el:col, name:n, num:nm, active:idx===FROM});
        });

        var dayLabels=['SÁB  ·  11 DE JANEIRO','DOM  ·  12 DE JANEIRO','SEG  ·  13 DE JANEIRO','TER  ·  14 DE JANEIRO','QUA  ·  15 DE JANEIRO','QUI  ·  16 DE JANEIRO','SEX  ·  17 DE JANEIRO','SÁB  ·  18 DE JANEIRO'];
        var lbl=document.createElement('div'); lbl.textContent=dayLabels[FROM];
        lbl.style.cssText='position:absolute;left:50%;bottom:calc(22% - 48px);transform:translateX(-50%) translateY(10px);color:rgba(255,255,255,0);font-size:13px;letter-spacing:5px;font-family:monospace;white-space:nowrap;transition:color 0.5s ease,transform 0.5s cubic-bezier(0.22,1,0.36,1)';
        ov.appendChild(lbl);

        // Linha de velocidade — aparece no meio quando vai rápido
        var speedLine=document.createElement('div');
        speedLine.style.cssText='position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden';
        ov.appendChild(speedLine);

        function easeInOutQuart(t){ return t<0.5?8*t*t*t*t:1-Math.pow(-2*t+2,4)/2; }
        function lerp(a,b,t){ return a+(b-a)*t; }

        var _lastDay=-1;
        var _lblTimeout=null;
        function _updateActiveDay(dayIdx){
            if(dayIdx===_lastDay) return;
            _lastDay=dayIdx;
            cols.forEach(function(c,i){
                var a=i===dayIdx;
                c.name.style.transition='color 0.18s ease';
                c.num.style.transition='color 0.18s ease';
                c.name.style.color=a?'#fff':'#444';
                c.num.style.color=a?'#fff':'#333';
            });
            // Label: sobe e some, troca texto, desce e aparece
            if(_lblTimeout) clearTimeout(_lblTimeout);
            lbl.style.color='rgba(255,255,255,0)';
            lbl.style.transform='translateX(-50%) translateY(-10px)';
            _lblTimeout=setTimeout(function(){
                lbl.textContent=dayLabels[dayIdx];
                lbl.style.transform='translateX(-50%) translateY(0)';
                lbl.style.color='rgba(255,255,255,0.55)';
            },120);
            // Som por dia
            try{ var s=new Audio('assets/audio/confirmation.mp3'); s.volume=Math.max(0.15,0.5-Math.abs(dayIdx-FROM-(TO-FROM)/2)*0.06); s.play(); }catch(e){}
        }

        // Linhas de velocidade dinâmicas
        var _lineEls=[];
        function _updateSpeedLines(velocity){
            // velocity: 0..1 (relativo ao pico)
            var show=velocity>0.55;
            _lineEls.forEach(function(l){ l.style.opacity=show?(velocity-0.55)*1.8*0.35+'':0; });
            if(show && _lineEls.length===0){
                for(var i=0;i<8;i++){
                    var l=document.createElement('div');
                    var y=15+i*10;
                    l.style.cssText='position:absolute;height:1px;background:rgba(124,58,237,0.25);top:'+y+'%;right:0;width:'+(30+Math.random()*40)+'%;opacity:0;transition:opacity 0.1s,width 0.2s';
                    speedLine.appendChild(l);
                    _lineEls.push(l);
                }
            }
        }

        // Fade in
        requestAnimationFrame(function(){requestAnimationFrame(function(){ ov.style.opacity='1'; });});
        setTimeout(function(){
            strip.style.opacity='1';
            strip.style.transform='translateX(-50%) translateY(0)';
            bm.style.color='rgba(255,255,255,0.045)';
            yr.style.color='rgba(255,255,255,0.18)';
        },500);
        setTimeout(function(){
            lbl.style.color='rgba(255,255,255,0.55)';
            lbl.style.transform='translateX(-50%) translateY(0)';
        },1100);

        // ── Animação contínua ─────────────────────────────────
        var _rafId=null;
        var _startTime=null;
        var _prevBarPos=FROM*COL_W;

        function _animFrame(ts){
            if(!_startTime) _startTime=ts;
            var elapsed=ts-_startTime;
            var t=Math.min(elapsed/TRAVEL_DURATION,1);
            var te=easeInOutQuart(t); // 0→1 suave
            var barPos=lerp(FROM*COL_W, TO*COL_W, te);

            // Posição absoluta da barra
            bar.style.left=barPos+'px';

            // Rastro
            trail.style.left=(FROM*COL_W)+'px';
            trail.style.width=(barPos-FROM*COL_W+COL_W/2)+'px';

            // Velocidade instantânea (derivada da easing) para blur e linhas
            var dt=0.002;
            var vel=(easeInOutQuart(Math.min(t+dt,1))-easeInOutQuart(Math.max(t-dt,0)))/(2*dt)*TO/TRAVEL_DURATION*1000;
            var normVel=Math.min(vel/(TO/TRAVEL_DURATION*1000*2.5),1);

            // Blur nos cols ao passar rápido
            cols.forEach(function(c,i){
                var dist=Math.abs(barPos/COL_W - i);
                var blurAmt=normVel>0.4 ? Math.max(0,(normVel-0.4)*8*(1-Math.min(dist,1))) : 0;
                c.el.style.filter=blurAmt>0.3?'blur('+blurAmt.toFixed(1)+'px)':'';
            });

            _updateSpeedLines(normVel);

            // Dia ativo (centro da barra)
            var currentDay=Math.round(barPos/COL_W);
            if(currentDay>=FROM && currentDay<=TO) _updateActiveDay(currentDay);

            if(t<1){ _rafId=requestAnimationFrame(_animFrame); }
            else {
                // Garante que chegou exatamente no TO
                bar.style.left=(TO*COL_W)+'px';
                _updateActiveDay(TO);
                cols.forEach(function(c){ c.el.style.filter=''; });
                _updateSpeedLines(0);
            }
        }

        setTimeout(function(){ _rafId=requestAnimationFrame(_animFrame); }, 1800);

        // Fecha após animação + pausa no dia final
        var TOTAL=1800+TRAVEL_DURATION+1200;
        setTimeout(function(){
            if(_rafId){ cancelAnimationFrame(_rafId); _rafId=null; }
            var gsEl=gs('game-screen'); if(gsEl) gsEl.style.display='none';
            var bgImg=gs('bg-image'); if(bgImg){ bgImg.src=''; bgImg.style.display='none'; }
            ov.style.transition='opacity 1.4s ease'; ov.style.opacity='0';
            setTimeout(function(){ ov.remove(); if(cb) cb(); },1450);
        }, TOTAL);
    }

    // ── Fim do Capítulo — vai direto ao menu ─────────────────
    function showEndCard(){
        _cleanup();
        // Esconde game-screen e bg antes de mostrar o card
        var gsEl=gs('game-screen');
        if(gsEl){ gsEl.style.display='none'; gsEl.style.opacity=''; }
        var bgImg=gs('bg-image');
        if(bgImg){ bgImg.src=''; bgImg.style.display='none'; bgImg.style.opacity='0.6'; }

        var card=document.createElement('div');
        card.id='ch14-end-card';
        card.style.cssText='position:fixed;inset:0;background:#000;z-index:10001;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 1.2s ease';
        card.innerHTML='<div style="font-size:clamp(16px,2.5vw,26px);color:#fff;letter-spacing:8px;font-weight:300;margin-bottom:14px">— Fim da Demo —</div>'
            +'<div style="font-size:12px;color:rgba(255,255,255,0.35);letter-spacing:4px;margin-bottom:48px">Obrigado por jogar</div>'
            +'<button id="ch14-end-btn" style="padding:11px 30px;background:transparent;border:1px solid rgba(255,255,255,.2);border-radius:8px;color:rgba(255,255,255,.5);font-size:12px;font-weight:700;letter-spacing:2px;cursor:pointer;font-family:inherit;transition:all .25s;text-transform:uppercase">Voltar ao Menu Principal</button>';
        document.body.appendChild(card);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ card.style.opacity='1'; }); });

        var btn=document.getElementById('ch14-end-btn');
        if(btn){
            btn.addEventListener('mouseenter',function(){ btn.style.borderColor='rgba(255,255,255,.5)'; btn.style.color='#fff'; });
            btn.addEventListener('mouseleave',function(){ btn.style.borderColor='rgba(255,255,255,.2)'; btn.style.color='rgba(255,255,255,.5)'; });
            btn.addEventListener('click',function(){
                card.style.opacity='0';
                setTimeout(function(){
                    card.remove();
                    var ms=gs('menu-screen');
                    if(ms) ms.style.display='flex';
                    if(typeof DiscordPresence !== 'undefined') DiscordPresence.menu();
                }, 600);
            });
        }
    }

    // ── Runner ────────────────────────────────────────────────
    function runStep(){
        if(_destroyed) return;
        if(_stepIndex>=STORY.length){ doCalendar(function(){ if(typeof loadChapter==='function') loadChapter('1.5'); }); return; }
        var step=STORY[_stepIndex++];
        if(step.t==='bg'){        setBg(step.src); runStep(); return; }
        if(step.t==='music'){     playMusic(step.id); runStep(); return; }
        if(step.t==='stopmusic'){ fadeOut(null); runStep(); return; }
        if(step.t==='flash'){     doFlash(runStep); return; }
        if(step.t==='timeskip'){  doTimeskip(runStep); return; }
        if(step.t==='calendar'){  doCalendar(function(){ if(typeof loadChapter==='function') loadChapter('1.5'); }); return; }
        if(step.t==='mono'){      doMono(step, runStep); return; }
        if(step.t==='monochar'){  doMonoChar(step, runStep); return; }
        if(step.t==='dreamenter'){ doDreamEnter(runStep); return; }
        if(step.t==='dreamleave'){ doDreamLeave(runStep); return; }
        if(step.t==='glitchon'){  doGlitchOn(); runStep(); return; }
        if(step.t==='glitchoff'){ doGlitchOff(); runStep(); return; }
        if(step.t==='sfx'){       doSfx(step); runStep(); return; }
        if(step.t==='sevenblink'){ doSevenBlink(); runStep(); return; }
        if(step.t==='sevengone'){ doSevenGone(runStep); return; }
        if(step.t==='echo'){      doEcho(step, runStep); return; }
        if(step.t==='timeskipcustom'){ doTimeskipCustom(step, runStep); return; }
        if(step.t==='dc14open'){  dc14Open(step, runStep); return; }
        if(step.t==='dc14dlg'){   dc14Dlg(step, runStep); return; }
        if(step.t==='dc14close'){ dc14Close(runStep); return; }
        if(step.t==='minigame'){
            _mgLives=_getMgConfig().lives; _mgPhase=0; _mgFound=0;
            // Bloqueia input durante toda a transição para não quebrar música/minigame
            _waitClick=false;
            _active=false;
            if(typeof window.playGameTimeTransition==='function'){
                window.playGameTimeTransition(function(){
                    if(typeof window._releaseGameTimeOverlay==='function') window._releaseGameTimeOverlay();
                    _active=true;
                    _mgActive=true; var mg=buildMg(); mg.style.display='flex'; startMgRound();
                });
            } else {
                _active=true;
                _mgActive=true; var mg=buildMg(); mg.style.display='flex'; startMgRound();
            }
            return;
        }
        if(step.t==='dlg'){
            if(step.changeSkin){ _sevenSkin=true; }
            if(step.hideRight){ setChar('right',null); }
            if(step.clearFlex){ clearClones(); stopFlexColors(); }
            if(step.blinkchar){ doSevenBlink(); }
            showDialogue(step);
            if(step.sevenFlex){ resetClones(); setTimeout(spawnClones,200); setTimeout(startFlexColors,100); }
            return;
        }
        runStep();
    }

    // ── Input ─────────────────────────────────────────────────
    function _isPaused(){
        if(window.gamePaused) return true;
        var po=document.getElementById('pause-overlay');
        if(po&&po.classList.contains('open')) return true;
        // Janela de 300ms após fechar o pause para absorver o clique/tecla do botão Continuar
        if(window._pauseClosedAt && (Date.now()-window._pauseClosedAt)<300) return true;
        return false;
    }

    function _onInput(e){
        if(!_active||_destroyed) return;
        if(_isPaused()) return;
        if(_mgActive) return;
        if(e&&e.target&&e.target.id==='ch14-mg-rbtn') return;
        if(!_waitClick&&_pendingSkip){ _pendingSkip(); return; }
        if(!_waitClick) return;
        _waitClick=false; _pendingSkip=null; runStep();
    }

    function _onKD(e){
        if(!_active||_destroyed) return;
        if(e.key==='Escape'||e.code==='Escape') return; // deixa o index.html tratar
        if(_isPaused()) return;
        var isAdvance=(typeof kbIs==='function')?kbIs(e,'ADVANCE'):(e.code==='Space');
        if(!isAdvance&&e.code!=='Enter'&&e.code!=='KeyZ') return;
        _onInput(e);
    }

    function _cleanup(){
        _active=false; _destroyed=true;
        if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
        clearClones(); stopFlexColors();

        if(_mgInterval&&_mgInterval.cancel)_mgInterval.cancel();_mgInterval=null; clearTimeout(_mgTimeout);
        var mg=gs('ch14-mg'); if(mg) mg.remove();
        document.removeEventListener('click', _onInput);
        document.removeEventListener('keydown', _onKD);
        // Limpa personagens e diálogo
        var lDiv=gs('character-left'); if(lDiv) lDiv.classList.remove('visible');
        var rDiv=gs('character-right'); if(rDiv) rDiv.classList.remove('visible');
        var spk=gs('speaker-box'); if(spk){ spk.textContent=''; spk.classList.remove('active'); }
        var nxt=gs('next-indicator'); if(nxt) nxt.style.display='none';
        var dtxt=gs('dialogue-text'); if(dtxt) dtxt.textContent='';
        // Remove quaisquer clones que possam ter sobrado no DOM
        document.querySelectorAll('[data-ch14clone]').forEach(function(el){ el.remove(); });
        // Restaura dialogue-wrapper para não quebrar outros capítulos
        var dw=gs('dialogue-wrapper'); if(dw){ dw.style.display=''; dw.style.zIndex=''; }
        // Limpa novos estados
        doGlitchOff();
        clearInterval(_blinkIv); _blinkIv=null;
        clearInterval(_dc14Timer); _dc14Timer=null;
        if(_dc14Screen){ _dc14Screen.remove(); _dc14Screen=null; }
        if(_dreamOv){ _dreamOv.remove(); _dreamOv=null; }
        // Esconde gameScreen e limpa bg para não vazar em outras telas
        var gsEl=gs('game-screen');
        if(gsEl){ gsEl.style.display='none'; gsEl.style.opacity=''; }
        var bgImg=gs('bg-image');
        if(bgImg){ bgImg.src=''; bgImg.style.display='none'; }
    }

    // ── Public ────────────────────────────────────────────────
    return {
        init: function(){
            _active=true; _destroyed=false; _stepIndex=0;
            _waitClick=false; _pendingSkip=null; _sevenSkin=false; _clones=[]; _spawnBlocked=false; _mgActive=false; _mgLives=_getMgConfig().lives; _mgPhase=0; _mgFound=0;
            _flexIdx=0;
            var gameScreen=gs('game-screen');
            if(gameScreen){ Array.from(gameScreen.children).forEach(function(c){ c.style.display=''; }); gameScreen.style.display='block'; }
            var bg=gs('bg-image'); if(bg){ bg.src=''; bg.style.display='none'; bg.style.opacity='0.6'; }
            var lDiv=gs('character-left'); if(lDiv) lDiv.classList.remove('visible');
            var rDiv=gs('character-right'); if(rDiv) rDiv.classList.remove('visible');
            var spk=gs('speaker-box'); if(spk){ spk.textContent=''; spk.classList.remove('active'); }
            var dtxt=gs('dialogue-text'); if(dtxt) dtxt.textContent='';
            var nxt=gs('next-indicator'); if(nxt) nxt.style.display='none';
            var w=gs('dialogue-wrapper'); if(w) w.dataset.speaker='';
            document.addEventListener('click', _onInput);
            document.addEventListener('keydown', _onKD);
            // ── Snapshot do STORY original na primeira run ──────────
            if (!_CH14_STORY_ORIGINAL) {
                _CH14_STORY_ORIGINAL = STORY.map(function(s){ return Object.assign({}, s); });
            }

            // ── Replay Dialogue Hook ─────────────────────────────────
            if (typeof window._replayGetRuns === 'function' && typeof window._ch14GetReplayOverrides === 'function') {
                var _r14 = window._replayGetRuns();
                var _rc14 = (_r14 && _r14['1.4']) ? _r14['1.4'] : 0;
                var _ov14 = window._ch14GetReplayOverrides(_rc14);
                if (_ov14) {
                    Object.keys(_ov14).forEach(function(idx) {
                        var i = parseInt(idx);
                        if (i >= 0 && i < STORY.length) {
                            STORY[i] = Object.assign({}, STORY[i], _ov14[i]);
                        }
                    });
                }
            }

            setTimeout(runStep,200);
        },
        destroy: function(){
            // Restaura o STORY original para a próxima run
            if (_CH14_STORY_ORIGINAL) {
                _CH14_STORY_ORIGINAL.forEach(function(step, i) {
                    STORY[i] = Object.assign({}, step);
                });
            }
            fadeOut(null); _cleanup();
        }
    };
})();