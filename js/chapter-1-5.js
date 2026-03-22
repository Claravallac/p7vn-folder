/* ═══════════════════════════════════════════════════════════════
   Capítulo 1.5 — Depois do Time Skip
   Usa os elementos do game-screen existentes igual aos outros caps.
═══════════════════════════════════════════════════════════════ */
'use strict';

var _CH15_STORY_ORIGINAL = null;

window.Chapter15 = (function () {

    var _active=false, _stepIndex=0, _waitClick=false, _destroyed=false;
    var _curBg=null, _sevenSkin=false, _twGen=0, _twInterval=null, _pendingSkip=null;

    // ── Roteiro ───────────────────────────────────────────────
    var STORY = [
        // ── Monólogo de abertura ─────────────────────────────────────────────
        { t:'mono', text:'E então, Abbyl começou a ir mais e mais vezes ao VRChat com seu corpo físico...' },
        { t:'mono', text:'Levou também seus amigos, todos os dias ele voltava lá com eles...' },
        { t:'mono', text:'Até que...' },

        // ── Sonho ─────────────────────────────────────────────────────────────
        { t:'dreamenter' },
        { t:'dlg', who:'Criatura', left:null, right:null, text:'Por que você está indo lá? Por que está levando seus amigos para um caminho sem volta? Você gosta de os ver sofrer?' },
        { t:'dreamleave' },

        // ── Abbyl acorda — glitch, sem personagem ─────────────────────────────
        { t:'bg',  src:'scenes/abbylterror.png' },
        { t:'glitchon' },
        { t:'monochar', who:'Abbyl', text:'Que sonho estranho... O que era aquilo?' },
        { t:'monochar', who:'Abbyl', text:'Desde que criei o transportador eu venho tendo sonhos estranhos...' },
        { t:'monochar', who:'Abbyl', text:'Quer dizer, a ideia de aquilo ser um universo paralelo é muito estranho...' },
        { t:'monochar', who:'Abbyl', text:'Por que diabos um game de chat cheio de pessoas rasas seria algo tão profundo?' },
        { t:'monochar', who:'Abbyl', text:'Eu não vou mentir, mas tenho um pouco de receio de descobrir...' },
        { t:'glitchoff' },

        // ── Quarto da Abbyl ──────────────────────────────────────────────────
        { t:'bg',  src:'scenes/quarto-abbyl.png' },
        { t:'sfx', src:'assets/audio/cama.mp3' },
        { t:'dlg', who:'Abbyl', left:'abbyl', right:null, text:'Bem, hoje é o dia que a Arabel finalmente vai voltar da faculdade e vai assistir Uma Musume comigo, afinal, ela prometeu. Não é hora de ficar tão sério!' },

        // ── 3 horas depois — Casa do Seven ──────────────────────────────────
        { t:'timeskipcustom', time:'15:32', period:'TARDE', date:'SÁB  ·  18 DE JANEIRO', location:'Casa do Seven' },
        { t:'bg',  src:'scenes/casa-seven.png' },
        { t:'dlg', who:'Seven', left:null, right:'seven', text:'Caraca, o Pudding vai amar esse Reels aqui, kkkkkk' },
        { t:'sevenblink' },
        { t:'dlg', who:'Seven', left:null, right:'seven', text:'O que tá acontecendo comigo? Eu tô... Eu tô sumindo... Nãooooooooo', blinkchar:'seven' },
        { t:'echo', who:'Seven', text:'Até quando o Seven ganha, o Seven perdeeeeeee' },
        { t:'sevengone' },

        // ── 30 minutos depois — Aldrich ──────────────────────────────────────
        { t:'timeskipcustom', time:'16:02', period:'TARDE', date:'SÁB  ·  18 DE JANEIRO', location:'Casa de Aldrich Pudding' },
        { t:'bg',  src:'scenes/Aldrich-casa.png' },
        { t:'dlg', who:'Aldrich Pudding', left:'aldrich', right:null, text:'Que estranho, ele não me mandou 40 reels como de costume, só me mandou 39' },
        { t:'dlg', who:'Aldrich Pudding', left:'aldrich', right:null, text:'Tem algo errado acontecendo aqui... É melhor eu investigar!' },
        { t:'dlg', who:'Aldrich Pudding', left:'aldrich', right:null, text:'Só terminar essa comissão aqui antes.' },

        // ── 30 minutos depois — Call Aldrich + Abbyl ─────────────────────────
        { t:'timeskipcustom', time:'16:32', period:'TARDE', date:'SÁB  ·  18 DE JANEIRO', location:'Laboratório da Abbyl' },
        { t:'dc15open', chars:['pudding','abbyl'], channel:'#geral', server:'Himari Squad' },
        { t:'dc15dlg', who:'pudding', text:'Abbyl, você não viu o Seven?' },
        { t:'dc15dlg', who:'abbyl',   text:'Ele não vive com você?' },
        { t:'dc15dlg', who:'pudding', text:'Ele não aparece faz um tempo e não atende as minhas ligações.' },
        { t:'dc15dlg', who:'abbyl',   text:'Deve estar dormindo ou só de bobeira por aí.' },
        { t:'dc15dlg', who:'pudding', text:'Ele me mandou 1 Reels a menos' },
        { t:'dc15dlg', who:'abbyl',   text:'Precisamos encontrá-lo, eu irei usar tudo o que tenho disponível ao meu alcance.' },
        { t:'dc15close' },

        // ── Enquanto isso — outro server ─────────────────────────────────────
        { t:'dc15open', chars:['lucao','raposo','fox'], channel:'#geral', server:'Squad do CS', color:'#fc5c65' },
        { t:'dc15dlg', who:'lucao',  text:'Então, fechou o CS?' },
        { t:'dc15dlg', who:'raposo', text:'Só se for agora.' },
        { t:'dc15dlg', who:'fox',    text:'Beleza, só vou chamar o Seven aqui.' },
        { t:'dc15dlg', who:'fox',    text:'estranho, ele não atende' },
        { t:'dc15dlg', who:'raposo', text:'Deve estar dormindo ou só de bobeira por aí.' },
        { t:'dc15dlg', who:'fox',    text:'Notei que ele não me mandou Reels no Instagram também...' },
        { t:'dc15dlg', who:'raposo', text:'O CS pode esperar. Precisamos encontrá-lo!', speaking:['raposo','lucao'] },
        { t:'dc15close' },

        // ── Fim ───────────────────────────────────────────────────────────────
        { t:'endcard' },
    ];

    function gs(id){ return document.getElementById(id); }

    // ── Fundo ─────────────────────────────────────────────────
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

    // ── Personagens ───────────────────────────────────────────
    var CHAR_SRCS = {
        abbyl:   './assets/images/characters/abbyl.png',
        seven:   './assets/images/characters/seven.png',
        aldrich: './assets/images/characters/aldrich.png',
    };
    var MUSUME_SRCS = {
        seven:   './assets/images/ui/musume/seven.png',
        aldrich: './assets/images/ui/musume/aldrich.png',
        default: './assets/images/ui/musume/Fenomeno_(Main).png',
    };
    function resolveCharSrc(key){
        if(key==='abbyl') return CHAR_SRCS.abbyl;
        if(window._abbylCheatPersist) return MUSUME_SRCS[key]||MUSUME_SRCS.default;
        return CHAR_SRCS[key]||('./assets/images/characters/'+key+'.png');
    }

    var _charTimers = { left:null, right:null };
    function setChar(side, key){
        var divId = side==='left'?'character-left':'character-right';
        var imgId = side==='left'?'char-left-img':'char-right-img';
        var div=gs(divId), img=gs(imgId);
        if(!div||!img) return;
        if(_charTimers[side]){ clearTimeout(_charTimers[side]); _charTimers[side]=null; }
        if(!key){ div.classList.remove('visible'); img.dataset.char=''; return; }
        var src=resolveCharSrc(key);
        if(img.dataset.char===key){ div.classList.add('visible'); return; }
        div.classList.remove('visible');
        _charTimers[side]=setTimeout(function(){
            img.src=src; img.dataset.char=key;
            div.classList.add('visible');
        },150);
    }

    // ── Música ────────────────────────────────────────────────
    function fadeOut(cb){
        if(!_curBg){ if(cb) cb(); return; }
        var a=_curBg; _curBg=null; var vol=a.volume;
        var iv=setInterval(function(){ vol=Math.max(0,vol-0.07); a.volume=vol; if(vol<=0){ clearInterval(iv); a.pause(); a.currentTime=0; if(cb) cb(); } },60);
    }
    function playMusic(id){
        var map={'ost-p':'ost-p','discord-chat':'discord-chat-music'};
        var elId=map[id]; var el=elId?gs(elId):null; if(!el) return;
        var vols={'ost-p':0.55,'discord-chat':0.45};
        var gv=typeof _globalVolume!=='undefined'?_globalVolume:1;
        fadeOut(function(){ _curBg=el; el.volume=Math.min(1,(vols[id]||0.5)*gv); el.currentTime=0; el.play().catch(function(){}); });
    }

    // ── Diálogo ───────────────────────────────────────────────
    var SPK_COL = {
        'Abbyl':           {c:'#00e5ff',r:'0,229,255'},
        'Seven':           {c:'#00ff99',r:'0,255,153'},
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
        wrapper.style.display='';
        if(wrapper.parentElement) wrapper.parentElement.style.display='block';
        setChar('left',  step.left||null);
        setChar('right', step.right||null);
        var spk=step.who||'';
        wrapper.dataset.speaker=spk;
        var col=SPK_COL[spk];
        if(col){ wrapper.style.setProperty('--spk-color',col.c); wrapper.style.setProperty('--spk-color-rgb',col.r); }
        else   { wrapper.style.removeProperty('--spk-color'); wrapper.style.removeProperty('--spk-color-rgb'); }
        if(spkBox){ spkBox.textContent=spk; spkBox.classList.toggle('active',!!spk); }
        if(nxt) nxt.style.display='none';
        dtxt.textContent=''; _waitClick=false; _fullText=step.text||'';
        var i=0;
        if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
        _twGen++; var gen=_twGen;
        _twInterval=setInterval(function(){
            if(_destroyed||gen!==_twGen){ clearInterval(_twInterval); return; }
            if(window.gamePaused||( gs('pause-overlay')&&gs('pause-overlay').classList.contains('open') )){ return; }
            if(i<_fullText.length){ dtxt.textContent+=_fullText[i++]; }
            else{ clearInterval(_twInterval); _twInterval=null; if(nxt) nxt.style.display='block'; _waitClick=true; }
        },28);
        _pendingSkip=function(){
            if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
            dtxt.textContent=_fullText; if(nxt) nxt.style.display='block'; _waitClick=true; _pendingSkip=null;
        };
    }

    // ── Flash ─────────────────────────────────────────────────
    function doFlash(cb){
        var fl=gs('white-flash');
        if(!fl){ if(cb) cb(); return; }
        fl.style.transition='opacity 0.05s ease-in'; fl.style.opacity='1';
        setTimeout(function(){ fl.style.transition='opacity 0.6s ease-out'; fl.style.opacity='0'; setTimeout(cb,700); },80);
    }

    // ── Monólogo centralizado ─────────────────────────────────
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

    // ── Monólogo com nome (sem sprite) ────────────────────────
    function doMonoChar(step, cb){
        var dw=gs('dialogue-wrapper'), spkBox=gs('speaker-box');
        var dtxt=gs('dialogue-text'), nxt=gs('next-indicator');
        if(!dw||!dtxt){ cb(); return; }
        setChar('left', null); setChar('right', null);
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
        _twGen++; var gen=_twGen;
        _twInterval=setInterval(function(){
            if(_destroyed||gen!==_twGen){ clearInterval(_twInterval); return; }
            if(window.gamePaused) return;
            if(i<_fullText.length){ dtxt.textContent+=_fullText[i++]; }
            else{ clearInterval(_twInterval); _twInterval=null; if(nxt) nxt.style.display='block'; _waitClick=true; }
        },28);
        _pendingSkip=function(){
            if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
            dtxt.textContent=_fullText; if(nxt) nxt.style.display='block'; _waitClick=true; _pendingSkip=null;
        };
        void cb;
    }

    // ── Sonho ─────────────────────────────────────────────────
    var _dreamOv=null;
    function doDreamEnter(cb){
        fadeOut(null);
        var dw=gs('dialogue-wrapper'); if(dw) dw.style.display='none';
        var lDiv=gs('character-left'); if(lDiv) lDiv.classList.remove('visible');
        var rDiv=gs('character-right'); if(rDiv) rDiv.classList.remove('visible');
        _dreamOv=document.createElement('div');
        _dreamOv.style.cssText='position:fixed;inset:0;z-index:9600;background:#000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 1.2s ease;overflow:hidden';
        var vignette=document.createElement('div');
        vignette.style.cssText='position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(100,0,0,0.3) 0%,rgba(0,0,0,0.85) 100%);animation:ch15DreamPulse 3s ease-in-out infinite';
        _dreamOv.appendChild(vignette);
        var bgLbl=document.createElement('div'); bgLbl.textContent='SONHO';
        bgLbl.style.cssText='position:absolute;font-size:clamp(80px,18vw,200px);font-weight:900;font-family:Arial Black,sans-serif;color:rgba(180,0,0,0.04);letter-spacing:-4px;user-select:none;pointer-events:none';
        _dreamOv.appendChild(bgLbl);
        if(!document.getElementById('ch15-dream-style')){
            var st=document.createElement('style'); st.id='ch15-dream-style';
            st.textContent='@keyframes ch15DreamPulse{0%,100%{opacity:1}50%{opacity:0.55}}@keyframes ch15EchoWave{0%,100%{transform:translateY(0) scaleX(1)}25%{transform:translateY(-3px) scaleX(1.01)}75%{transform:translateY(3px) scaleX(0.99)}}';
            document.head.appendChild(st);
        }
        var dw2=gs('dialogue-wrapper'); if(dw2) dw2.style.zIndex='9700';
        document.body.appendChild(_dreamOv);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ _dreamOv.style.opacity='1'; }); });
        setTimeout(function(){ var dw2=gs('dialogue-wrapper'); if(dw2) dw2.style.display=''; cb(); },1400);
    }
    function doDreamLeave(cb){
        var dw=gs('dialogue-wrapper'); if(dw){ dw.style.zIndex=''; dw.style.display='none'; }
        if(_dreamOv){ _dreamOv.style.opacity='0'; setTimeout(function(){ if(_dreamOv){ _dreamOv.remove(); _dreamOv=null; } cb(); },1200); }
        else cb();
    }

    // ── Glitch ────────────────────────────────────────────────
    var _glitchIv=null;
    function doGlitchOn(){
        if(!document.getElementById('ch15-glitch-style')){
            var st=document.createElement('style'); st.id='ch15-glitch-style';
            st.textContent='@keyframes ch15Glitch1{0%,100%{clip-path:inset(0 0 95% 0);transform:translateX(-4px)}50%{clip-path:inset(30% 0 50% 0);transform:translateX(4px)}}@keyframes ch15Glitch2{0%,100%{clip-path:inset(50% 0 30% 0);transform:translateX(3px)}50%{clip-path:inset(80% 0 5% 0);transform:translateX(-3px)}}';
            document.head.appendChild(st);
        }
        var bg=gs('bg-image'); if(!bg) return;
        bg.style.filter='saturate(0.3) brightness(0.55)';
        ['ch15-gl1','ch15-gl2'].forEach(function(id,i){
            var g=gs(id); if(g) g.remove();
            var gl=document.createElement('img');
            gl.id=id; gl.src=bg.src;
            gl.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.6;pointer-events:none;z-index:2;animation:ch15Glitch'+(i+1)+' '+(0.18+i*0.07)+'s steps(1) infinite;mix-blend-mode:screen';
            gl.style.filter='hue-rotate('+(i*120)+'deg) saturate(3)';
            var bgParent=bg.parentElement||gs('game-screen');
            if(bgParent) bgParent.appendChild(gl);
        });
        _glitchIv=setInterval(function(){
            var b=gs('bg-image'); if(!b) return;
            b.style.transform='translateX('+(Math.random()*6-3)+'px)';
            setTimeout(function(){ var b2=gs('bg-image'); if(b2) b2.style.transform=''; },60);
        },220);
    }
    function doGlitchOff(){
        clearInterval(_glitchIv); _glitchIv=null;
        ['ch15-gl1','ch15-gl2'].forEach(function(id){ var g=gs(id); if(g) g.remove(); });
        var bg=gs('bg-image'); if(bg){ bg.style.filter=''; bg.style.transform=''; }
    }

    // ── Seven pisca e some ────────────────────────────────────
    var _blinkIv=null;
    function doSevenBlink(){
        var rImg=gs('char-right-img'); if(!rImg) return;
        var v=true;
        _blinkIv=setInterval(function(){ rImg.style.opacity=v?'0':'1'; v=!v; },220);
    }
    function doSevenGone(cb){
        clearInterval(_blinkIv); _blinkIv=null;
        var rDiv=gs('character-right'), rImg=gs('char-right-img');
        if(!rDiv||!rImg){ cb(); return; }
        rImg.style.transition='opacity 1.2s ease'; rImg.style.opacity='0';
        setTimeout(function(){ rDiv.classList.remove('visible'); rImg.style.transition=''; rImg.style.opacity='1'; cb(); },1300);
    }

    // ── Eco ───────────────────────────────────────────────────
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
                var letters=dtxt.textContent.split('');
                dtxt.innerHTML='';
                letters.forEach(function(ch,li){
                    var sp=document.createElement('span');
                    sp.textContent=ch;
                    sp.style.cssText='display:inline-block;animation:ch15EchoWave 0.7s ease-in-out infinite;animation-delay:'+(li*0.03)+'s';
                    dtxt.appendChild(sp);
                });
                [0,180,340].forEach(function(delay,ei){
                    setTimeout(function(){
                        try{ var s=new Audio('assets/audio/confirmation.mp3'); s.volume=Math.max(0.05,0.45-ei*0.18); s.playbackRate=0.85+ei*0.08; s.play(); }catch(e){}
                    },delay);
                });
                if(nxt) nxt.style.display='block'; _waitClick=true;
            }
        },32);
        _pendingSkip=function(){
            if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
            dtxt.textContent=_fullText; if(nxt) nxt.style.display='block'; _waitClick=true; _pendingSkip=null;
        };
        void cb;
    }

    // ── Timeskip customizável ─────────────────────────────────
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

    // ── SFX avulso ────────────────────────────────────────────
    function doSfx(step){
        try{ var s=new Audio(step.src); s.volume=0.7; s.play(); }catch(e){}
    }

    // ── Discord Call ──────────────────────────────────────────
    var _dc15Screen=null, _dc15Timer=null, _dc15Secs=0;
    var DC15_CHARS = {
        abbyl:   { name:'Abbyl',           color:'#f0a050', img:'assets/images/characters/abbyl.png' },
        pudding: { name:'Aldrich Pudding',  color:'#eb459e', img:'assets/images/ui/call/aldrich pudding.gif' },
        lucao:   { name:'Lucão',            color:'#faa61a', img:'assets/images/characters/lucao.png' },
        raposo:  { name:'Raposo',           color:'#57f287', img:'assets/images/characters/raposo.png' },
        fox:     { name:'Fox',              color:'#5865f2', img:'assets/images/characters/fox.png' },
    };
    function _dc15MakeCard(id){
        var c=DC15_CHARS[id]; if(!c) return null;
        var card=document.createElement('div');
        card.id='dc15av-'+id;
        card.style.cssText='display:flex;flex-direction:column;align-items:center;gap:10px;opacity:0;transform:scale(0.5);transition:opacity 0.4s,transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        var ring=document.createElement('div'); ring.id='dc15ring-'+id;
        ring.style.cssText='width:114px;height:114px;border-radius:50%;border:3px solid rgba(255,255,255,0.1);padding:3px;transition:border-color 0.25s,box-shadow 0.25s';
        var inner=document.createElement('div');
        inner.style.cssText='width:100%;height:100%;border-radius:50%;overflow:hidden;background:#222';
        var img=document.createElement('img');
        img.src=c.img; img.style.cssText='width:100%;height:100%;object-fit:cover;object-position:center 22%;display:block;border-radius:50%';
        img.onerror=function(){ inner.style.background=c.color+'33'; inner.innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:'+c.color+'">'+c.name[0]+'</div>'; };
        inner.appendChild(img); ring.appendChild(inner); card.appendChild(ring);
        var tag=document.createElement('div');
        tag.style.cssText='font-size:12px;font-weight:800;letter-spacing:0.3px;background:rgba(0,0,0,0.55);padding:3px 10px;border-radius:4px;color:'+c.color+';max-width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center';
        tag.textContent=c.name; card.appendChild(tag);
        return card;
    }
    function dc15Open(step, cb){
        fadeOut(null);
        var dw=gs('dialogue-wrapper'); if(dw) dw.style.display='none';
        var lDiv=gs('character-left'); if(lDiv) lDiv.classList.remove('visible');
        var rDiv=gs('character-right'); if(rDiv) rDiv.classList.remove('visible');
        var scr=document.createElement('div'); scr.id='dc15-screen';
        scr.style.cssText='position:fixed;inset:0;z-index:9200;display:flex;flex-direction:column;background:rgba(54,57,63,0.97);opacity:0;transition:opacity 0.6s ease';
        scr.innerHTML=
            '<div style="height:44px;background:rgba(30,31,34,.96);border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;padding:0 16px;gap:10px;flex-shrink:0">'
            +'<span style="font-size:14px;font-weight:800;color:#dbdee1"># '+(step.channel||'geral')+'</span>'
            +'<span style="font-size:11px;color:#80848e;margin-left:4px">— '+(step.server||'')+'</span>'
            +'<div style="margin-left:auto;display:flex;align-items:center;gap:6px;background:rgba(35,165,90,.14);border:1px solid rgba(35,165,90,.3);border-radius:4px;padding:3px 10px;font-size:11px;font-weight:700;color:#23a55a">'
            +'<span style="width:6px;height:6px;background:#23a55a;border-radius:50%"></span>'
            +' Em chamada · <span id="dc15timer">00:00</span></div></div>'
            +'<div id="dc15-callarea" style="flex:1;display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap;padding:24px"></div>'
            +'<div style="padding:0 20px 20px;display:flex;justify-content:center">'
            +'<div style="width:100%;max-width:780px;background:rgba(20,21,24,.96);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px 20px 14px;position:relative">'
            +'<div id="dc15-name" style="font-size:13px;font-weight:900;margin-bottom:6px;letter-spacing:.3px"></div>'
            +'<div id="dc15-text" style="font-size:15px;font-weight:500;color:#e0e3e7;line-height:1.6;min-height:22px"></div>'
            +'<div style="position:absolute;bottom:14px;right:16px;font-size:10px;color:#80848e;letter-spacing:.5px">▼ clique</div>'
            +'</div></div>';
        if(!document.getElementById('ch15-dc-style')){
            var st=document.createElement('style'); st.id='ch15-dc-style';
            st.textContent='@keyframes ch15dcSpk{0%,100%{border-color:rgba(255,255,255,.1);box-shadow:none}50%{border-color:#23a55a;box-shadow:0 0 0 3px rgba(35,165,90,.22)}}';
            document.head.appendChild(st);
        }
        document.body.appendChild(scr);
        _dc15Screen=scr;
        var area=document.getElementById('dc15-callarea');
        (step.chars||[]).forEach(function(id){
            var card=_dc15MakeCard(id); if(!card) return;
            area.appendChild(card);
            requestAnimationFrame(function(){ requestAnimationFrame(function(){ card.style.opacity='1'; card.style.transform='scale(1)'; }); });
        });
        _dc15Secs=0;
        _dc15Timer=setInterval(function(){
            _dc15Secs++;
            var tel=document.getElementById('dc15timer'); if(!tel) return;
            tel.textContent=String(Math.floor(_dc15Secs/60)).padStart(2,'0')+':'+String(_dc15Secs%60).padStart(2,'0');
        },1000);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ scr.style.opacity='1'; setTimeout(cb,500); }); });
    }
    function dc15Dlg(step, cb){
        var id=step.who||'';
        var c=DC15_CHARS[id];
        var nameEl=document.getElementById('dc15-name');
        var textEl=document.getElementById('dc15-text');
        if(!nameEl||!textEl){ _waitClick=true; return; }
        Object.keys(DC15_CHARS).forEach(function(k){ var ring=document.getElementById('dc15ring-'+k); if(ring) ring.style.animation=''; });
        var speaking=step.speaking||[id];
        speaking.forEach(function(sid){ var ring=document.getElementById('dc15ring-'+sid); if(ring) ring.style.animation='ch15dcSpk 0.9s ease-in-out infinite'; });
        nameEl.textContent=(c&&c.name)||id; nameEl.style.color=(c&&c.color)||'#fff';
        textEl.textContent='';
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
        _pendingSkip=function(){ if(_twInterval){ clearInterval(_twInterval); _twInterval=null; } textEl.textContent=_fullText; _waitClick=true; _pendingSkip=null; };
        void cb;
    }
    function dc15Close(cb){
        clearInterval(_dc15Timer); _dc15Timer=null;
        if(!_dc15Screen){ cb(); return; }
        _dc15Screen.style.opacity='0';
        setTimeout(function(){ if(_dc15Screen){ _dc15Screen.remove(); _dc15Screen=null; } var dw=gs('dialogue-wrapper'); if(dw) dw.style.display=''; cb(); },600);
    }

    // ── End Card ──────────────────────────────────────────────
    function showEndCard(){
        _cleanup();
        var gsEl=gs('game-screen'); if(gsEl){ gsEl.style.display='none'; gsEl.style.opacity=''; }
        var bgImg=gs('bg-image'); if(bgImg){ bgImg.src=''; bgImg.style.display='none'; bgImg.style.opacity='0.6'; }
        var card=document.createElement('div');
        card.id='ch15-end-card';
        card.style.cssText='position:fixed;inset:0;background:#000;z-index:10001;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 1.2s ease';
        card.innerHTML='<div style="font-size:clamp(16px,2.5vw,26px);color:#fff;letter-spacing:8px;font-weight:300;margin-bottom:14px">— Fim do Capítulo 1.5 —</div>'
            +'<button id="ch15-end-btn" style="padding:11px 30px;background:transparent;border:1px solid rgba(255,255,255,.2);border-radius:8px;color:rgba(255,255,255,.5);font-size:12px;font-weight:700;letter-spacing:2px;cursor:pointer;font-family:inherit;transition:all .25s;text-transform:uppercase">Voltar ao Menu Principal</button>';
        document.body.appendChild(card);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ card.style.opacity='1'; }); });
        var btn=document.getElementById('ch15-end-btn');
        if(btn){
            btn.addEventListener('mouseenter',function(){ btn.style.borderColor='rgba(255,255,255,.5)'; btn.style.color='#fff'; });
            btn.addEventListener('mouseleave',function(){ btn.style.borderColor='rgba(255,255,255,.2)'; btn.style.color='rgba(255,255,255,.5)'; });
            btn.addEventListener('click',function(){
                card.style.opacity='0';
                setTimeout(function(){ card.remove(); var ms=gs('menu-screen'); if(ms) ms.style.display='flex'; if(typeof DiscordPresence!=='undefined') DiscordPresence.menu(); },600);
            });
        }
    }

    // ── Runner ────────────────────────────────────────────────
    function runStep(){
        if(_destroyed) return;
        if(_stepIndex>=STORY.length){ showEndCard(); return; }
        var step=STORY[_stepIndex++];
        if(step.t==='bg'){            setBg(step.src); runStep(); return; }
        if(step.t==='music'){         playMusic(step.id); runStep(); return; }
        if(step.t==='stopmusic'){     fadeOut(null); runStep(); return; }
        if(step.t==='flash'){         doFlash(runStep); return; }
        if(step.t==='sfx'){           doSfx(step); runStep(); return; }
        if(step.t==='mono'){          doMono(step, runStep); return; }
        if(step.t==='monochar'){      doMonoChar(step, runStep); return; }
        if(step.t==='dreamenter'){    doDreamEnter(runStep); return; }
        if(step.t==='dreamleave'){    doDreamLeave(runStep); return; }
        if(step.t==='glitchon'){      doGlitchOn(); runStep(); return; }
        if(step.t==='glitchoff'){     doGlitchOff(); runStep(); return; }
        if(step.t==='sevenblink'){    doSevenBlink(); runStep(); return; }
        if(step.t==='sevengone'){     doSevenGone(runStep); return; }
        if(step.t==='echo'){          doEcho(step, runStep); return; }
        if(step.t==='timeskipcustom'){ doTimeskipCustom(step, runStep); return; }
        if(step.t==='dc15open'){      dc15Open(step, runStep); return; }
        if(step.t==='dc15dlg'){       dc15Dlg(step, runStep); return; }
        if(step.t==='dc15close'){     dc15Close(runStep); return; }
        if(step.t==='endcard'){       showEndCard(); return; }
        if(step.t==='dlg'){
            if(step.blinkchar){ doSevenBlink(); }
            showDialogue(step);
            return;
        }
        runStep();
    }

    // ── Input ─────────────────────────────────────────────────
    function _isPaused(){
        if(window.gamePaused) return true;
        var po=gs('pause-overlay'); if(po&&po.classList.contains('open')) return true;
        if(window._pauseClosedAt&&(Date.now()-window._pauseClosedAt)<300) return true;
        return false;
    }
    function _onInput(e){
        if(!_active||_destroyed) return;
        if(_isPaused()) return;
        if(e&&e.target&&e.target.id==='dc15-callarea') return;
        if(!_waitClick&&_pendingSkip){ _pendingSkip(); return; }
        if(!_waitClick) return;
        _waitClick=false; _pendingSkip=null; runStep();
    }
    function _onKD(e){
        if(!_active||_destroyed) return;
        if(e.key==='Escape'||e.code==='Escape') return;
        if(_isPaused()) return;
        var isAdv=(typeof kbIs==='function')?kbIs(e,'ADVANCE'):(e.code==='Space');
        if(!isAdv&&e.code!=='Enter'&&e.code!=='KeyZ') return;
        _onInput(e);
    }

    // ── Cleanup ───────────────────────────────────────────────
    function _cleanup(){
        _active=false; _destroyed=true;
        if(_twInterval){ clearInterval(_twInterval); _twInterval=null; }
        doGlitchOff();
        clearInterval(_blinkIv); _blinkIv=null;
        clearInterval(_dc15Timer); _dc15Timer=null;
        if(_dc15Screen){ _dc15Screen.remove(); _dc15Screen=null; }
        if(_dreamOv){ _dreamOv.remove(); _dreamOv=null; }
        document.removeEventListener('click', _onInput);
        document.removeEventListener('keydown', _onKD);
        var lDiv=gs('character-left'); if(lDiv) lDiv.classList.remove('visible');
        var rDiv=gs('character-right'); if(rDiv) rDiv.classList.remove('visible');
        var spk=gs('speaker-box'); if(spk){ spk.textContent=''; spk.classList.remove('active'); }
        var nxt=gs('next-indicator'); if(nxt) nxt.style.display='none';
        var dtxt=gs('dialogue-text'); if(dtxt) dtxt.textContent='';
        var dw=gs('dialogue-wrapper'); if(dw){ dw.style.display=''; dw.style.zIndex=''; }
        var gsEl=gs('game-screen'); if(gsEl){ gsEl.style.display='none'; gsEl.style.opacity=''; }
        var bgImg=gs('bg-image'); if(bgImg){ bgImg.src=''; bgImg.style.display='none'; }
    }

    // ── Public ────────────────────────────────────────────────
    return {
        init: function(){
            _active=true; _destroyed=false; _stepIndex=0;
            _waitClick=false; _pendingSkip=null; _sevenSkin=false;
            _glitchIv=null; _blinkIv=null; _dreamOv=null;
            _dc15Screen=null; _dc15Timer=null; _dc15Secs=0;
            if(!_CH15_STORY_ORIGINAL){
                _CH15_STORY_ORIGINAL=STORY.map(function(s){ return Object.assign({},s); });
            }
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
            setTimeout(runStep,200);
        },
        destroy: function(){
            if(_CH15_STORY_ORIGINAL){
                _CH15_STORY_ORIGINAL.forEach(function(step,i){ STORY[i]=Object.assign({},step); });
            }
            fadeOut(null); _cleanup();
        }
    };
})();
