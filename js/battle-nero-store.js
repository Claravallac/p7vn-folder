// ============================================================
//  BATALHA DA NERO — ROTA DA LOJA  (sistema independente v2)
// ============================================================
(function () {
'use strict';

var NS_MAX_HP        = 5000;
var NS_PLAYER_MAX    = 92;
var NS_ARENA_W       = 340;
var NS_ARENA_H       = 200;
var NS_HEART_R       = 8;
var NS_INVINCIBLE_MS = 900;
var NS_TICK          = 16;

var ns = {
    active:false, phase:'idle',
    neroHp:NS_MAX_HP, playerHp:NS_PLAYER_MAX,
    invincible:false, dead:false,
    mercyCount:0, turnNum:0, _lastPattern:null,
    keys:{}, projectiles:[],
    hx:0, hy:0,
    loop:null, dodgeTimer:null,
    timingVal:0, timingDir:1, timingActive:false, timingIv:null
};
var els = {};

// ── Sons ─────────────────────────────────────────────────────
function sfx(id, vol) {
    var el = document.getElementById(id);
    if (!el) return;
    try { el.currentTime=0; el.volume=vol!==undefined?vol:0.7; el.play().catch(function(){}); } catch(e){}
}
var SFX = {
    hit:      function(){ sfx('sfx-slash',    0.8); },
    hurt:     function(){ sfx('sfx-hurtsound',0.75); },
    confirm:  function(){ sfx('sfx-menuconfirm',0.6); },
    navigate: function(){ sfx('sfx-menumove', 0.5); },
    gameover: function(){ sfx('sfx-gameover', 0.8); },
    dust:     function(){ sfx('sfx-enemydust',0.18); },
    heal:     function(){ sfx('sfx-healsound',0.7); },
    shatter:  function(){ sfx('sfx-soul-shatter',0.8); }
};

// ── Utilidades ────────────────────────────────────────────────
function clamp(v,mn,mx){ return Math.max(mn,Math.min(mx,v)); }

function setMessage(text) {
    if (!els.message) return;
    els.message.textContent = '';
    var i=0;
    if (els._msgIv) clearInterval(els._msgIv);
    els._msgIv = setInterval(function(){
        if (i<text.length){ els.message.textContent+=text[i]; i++; }
        else clearInterval(els._msgIv);
    }, 28);
}

// ── HUD ───────────────────────────────────────────────────────
function updateNeroHp() {
    var pct = Math.max(0,ns.neroHp/NS_MAX_HP)*100;
    if (els.neroHpFill) {
        els.neroHpFill.style.width = pct+'%';
        var clr = pct>50?'#aa00ff':pct>25?'#ff44aa':'#ff2222';
        els.neroHpFill.style.background = clr;
        els.neroHpFill.style.boxShadow  = '0 0 8px '+clr;
    }
    if (els.neroHpNum) els.neroHpNum.textContent = Math.max(0,ns.neroHp);
}
function updatePlayerHp() {
    var pct = Math.max(0,ns.playerHp/NS_PLAYER_MAX)*100;
    if (els.playerHpFill) {
        els.playerHpFill.style.width = pct+'%';
        els.playerHpFill.style.background = pct>50?'#ff6060':pct>25?'#ffaa00':'#ff2222';
    }
    if (els.playerHpNum) els.playerHpNum.textContent = Math.max(0,ns.playerHp)+' / '+NS_PLAYER_MAX;
}

// ── Balão de fala da Nero ─────────────────────────────────────
var _neroBubbleIv = null;
function showNeroBubble(text, dur) {
    var bubble = document.getElementById('ns-nero-bubble');
    var lineEl = document.getElementById('ns-nero-bubble-text');
    if (!bubble||!lineEl) return;
    if (_neroBubbleIv) clearInterval(_neroBubbleIv);
    lineEl.textContent=''; bubble.style.opacity='1';
    var i=0;
    _neroBubbleIv = setInterval(function(){
        if (i<text.length){ lineEl.textContent+=text[i]; i++; }
        else {
            clearInterval(_neroBubbleIv);
            setTimeout(function(){
                bubble.style.opacity='0';
                setTimeout(function(){ lineEl.textContent=''; },400);
            }, dur||3500);
        }
    }, 32);
}

// ── Projéteis ─────────────────────────────────────────────────
function spawnProj(cfg) {
    var r=cfg.r||7;
    var color = cfg.color || '#fff';
    var shadow = color === '#fff' || color === '#ddd' ? 'none' : '0 0 '+(r+2)+'px '+color;
    var div=document.createElement('div');
    div.style.cssText=[
        'position:absolute','width:'+(r*2)+'px','height:'+(r*2)+'px',
        'border-radius:50%','background:'+color,
        'box-shadow:'+shadow,
        'pointer-events:none','left:'+(cfg.x-r)+'px','top:'+(cfg.y-r)+'px'
    ].join(';');
    if (els.arena) els.arena.appendChild(div);
    ns.projectiles.push({x:cfg.x,y:cfg.y,vx:cfg.vx,vy:cfg.vy,r:r,el:div});
}
function clearProjs() {
    ns.projectiles.forEach(function(p){if(p.el&&p.el.parentNode)p.el.parentNode.removeChild(p.el);});
    ns.projectiles=[];
}


// ── Projéteis especiais ───────────────────────────────────────
function spawnBone(cfg) {
    var w=cfg.w||40, h=cfg.h||10;
    var div=document.createElement('div');
    div.style.cssText=[
        'position:absolute',
        'width:'+w+'px','height:'+h+'px',
        'background:#fff',
        'pointer-events:none',
        'left:'+cfg.x+'px','top:'+cfg.y+'px'
    ].join(';');
    if(els.arena) els.arena.appendChild(div);
    ns.projectiles.push({x:cfg.x+w/2,y:cfg.y+h/2,vx:cfg.vx||0,vy:cfg.vy||0,r:Math.min(w,h)/2+2,el:div,bone:true,w:w,h:h});
}

// ── Padrões ───────────────────────────────────────────────────
function patBoneRain() {
    for(var w=0;w<4;w++)(function(ww){
        setTimeout(function(){
            if(!ns.active||ns.phase!=='dodge') return;
            var gap=30+Math.floor(Math.random()*6)*30;
            [0,50,100,150,200,250,300].forEach(function(x){
                if(Math.abs(x+22-gap)<38) return;
                setTimeout(function(){ if(!ns.active) return; spawnBone({x:x,y:-14,w:44,h:12,vx:0,vy:2.6}); }, Math.random()*60);
            });
        }, ww*1500);
    })(w);
}

function patBoneWall() {
    for(var w=0;w<3;w++)(function(ww){
        setTimeout(function(){
            if(!ns.active||ns.phase!=='dodge') return;
            var gap=20+Math.floor(Math.random()*4)*42;
            [0,42,84,126,168].forEach(function(y){
                if(Math.abs(y+21-gap)<46) return;
                spawnBone({x:-50,y:y,w:44,h:18,vx:3.2,vy:0});
            });
            setTimeout(function(){
                if(!ns.active) return;
                var gap2=20+Math.floor(Math.random()*4)*42;
                [0,42,84,126,168].forEach(function(y){
                    if(Math.abs(y+21-gap2)<46) return;
                    spawnBone({x:NS_ARENA_W+6,y:y,w:44,h:18,vx:-3.2,vy:0});
                });
            }, 700);
        }, ww*1800);
    })(w);
}

function patCorridor() {
    for(var w=0;w<3;w++)(function(ww){
        setTimeout(function(){
            if(!ns.active||ns.phase!=='dodge') return;
            var gapX=NS_ARENA_W*(0.2+Math.random()*0.6);
            for(var i=0;i<8;i++)(function(ii){
                var x=(ii/7)*NS_ARENA_W;
                if(Math.abs(x-gapX)<55) return;
                setTimeout(function(){ if(!ns.active) return; spawnBone({x:x-20,y:-14,w:44,h:12,vx:0,vy:3.0}); }, ii*30);
            })(i);
        }, ww*2000);
    })(w);
}

function patExpand() {
    for(var w=0;w<5;w++)(function(ww){
        setTimeout(function(){
            if(!ns.active||ns.phase!=='dodge') return;
            var cx=NS_ARENA_W/2,cy=NS_ARENA_H/2;
            [{vx:0,vy:-3.2},{vx:0,vy:3.2},{vx:-3.2,vy:0},{vx:3.2,vy:0},
             {vx:-2.3,vy:-2.3},{vx:2.3,vy:-2.3},{vx:-2.3,vy:2.3},{vx:2.3,vy:2.3}
            ].forEach(function(d){ spawnProj({x:cx,y:cy,vx:d.vx,vy:d.vy,r:7,color:'#fff'}); });
            SFX.dust();
        }, ww*1200);
    })(w);
}

function patSpiral() {
    for(var w=0;w<3;w++)(function(ww){
        setTimeout(function(){
            if(!ns.active||ns.phase!=='dodge') return;
            var cx=NS_ARENA_W/2,cy=NS_ARENA_H/2,total=8,offset=ww*(Math.PI/8);
            for(var i=0;i<total;i++){
                var a=(i/total)*Math.PI*2+offset;
                spawnProj({x:cx,y:cy,vx:Math.cos(a)*2.8,vy:Math.sin(a)*2.8,r:8,color:'#fff'});
            }
            SFX.dust();
        }, ww*1800);
    })(w);
}

function patSniper() {
    // pequeno delay inicial para o coração estar posicionado antes de mirar
    for(var s=0;s<5;s++)(function(ss){
        setTimeout(function(){
            if(!ns.active||ns.phase!=='dodge') return;
            var tx=ns.hx+NS_HEART_R, ty=ns.hy+NS_HEART_R;
            var corners=[{x:-5,y:-5},{x:NS_ARENA_W+5,y:-5},{x:-5,y:NS_ARENA_H+5},{x:NS_ARENA_W+5,y:NS_ARENA_H+5}];
            var c=corners[ss%4];
            var dx=tx-c.x, dy=ty-c.y, len=Math.sqrt(dx*dx+dy*dy)||1;
            spawnProj({x:c.x,y:c.y,vx:dx/len*4.2,vy:dy/len*4.2,r:9,color:'#fff'});
            SFX.dust();
        }, 300 + ss*1000); // começa em 300ms para o coração já estar posicionado
    })(s);
}

function patChaos() {
    for(var w=0;w<6;w++)(function(ww){
        setTimeout(function(){
            if(!ns.active||ns.phase!=='dodge') return;
            for(var i=0;i<3;i++){
                var edge=Math.floor(Math.random()*4),x,y,vx,vy,spd=2.5+Math.random()*1.5;
                if(edge===0){x=Math.random()*NS_ARENA_W;y=-10;vx=(Math.random()-.5)*1.5;vy=spd;}
                else if(edge===1){x=NS_ARENA_W+10;y=Math.random()*NS_ARENA_H;vx=-spd;vy=(Math.random()-.5)*1.5;}
                else if(edge===2){x=Math.random()*NS_ARENA_W;y=NS_ARENA_H+10;vx=(Math.random()-.5)*1.5;vy=-spd;}
                else{x=-10;y=Math.random()*NS_ARENA_H;vx=spd;vy=(Math.random()-.5)*1.5;}
                spawnProj({x:x,y:y,vx:vx,vy:vy,r:7,color:'#fff'});
            }
            SFX.dust();
        }, ww*750);
    })(w);
}

var PATTERNS=[patBoneRain,patBoneWall,patCorridor,patSniper,patChaos];
// ── Dodge loop ────────────────────────────────────────────────
function dodgeLoop() {
    if(!ns.active||ns.phase!=='dodge') return;
    var spd=3.2;
    if(ns.keys['ArrowLeft'] ||ns.keys['a']||ns.keys['A']) ns.hx-=spd;
    if(ns.keys['ArrowRight']||ns.keys['d']||ns.keys['D']) ns.hx+=spd;
    if(ns.keys['ArrowUp']   ||ns.keys['w']||ns.keys['W']) ns.hy-=spd;
    if(ns.keys['ArrowDown'] ||ns.keys['s']||ns.keys['S']) ns.hy+=spd;
    ns.hx=clamp(ns.hx,0,NS_ARENA_W-NS_HEART_R*2);
    ns.hy=clamp(ns.hy,0,NS_ARENA_H-NS_HEART_R*2);
    if(els.heart){els.heart.style.left=ns.hx+'px';els.heart.style.top=ns.hy+'px';}
    var hcx=ns.hx+NS_HEART_R, hcy=ns.hy+NS_HEART_R;
    var kept=[], len=ns.projectiles.length;
    for(var i=0;i<len;i++){
        var p=ns.projectiles[i];
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-p.r*2||p.x>NS_ARENA_W+p.r*2||p.y<-p.r*2||p.y>NS_ARENA_H+p.r*2){
            if(p.el&&p.el.parentNode) p.el.parentNode.removeChild(p.el);
            continue;
        }
        if(p.el){
            if(p.bone){ p.el.style.left=(p.x-p.w/2)+'px'; p.el.style.top=(p.y-p.h/2)+'px'; }
            else       { p.el.style.left=(p.x-p.r  )+'px'; p.el.style.top=(p.y-p.r  )+'px'; }
        }
        if(!ns.invincible){
            var dx=hcx-p.x, dy=hcy-p.y, rSum=NS_HEART_R+p.r-3;
            if(dx*dx+dy*dy<rSum*rSum){
                takeDamage(18);
                if(p.el&&p.el.parentNode) p.el.parentNode.removeChild(p.el);
                continue;
            }
        }
        kept.push(p);
    }
    ns.projectiles=kept;
}

function takeDamage(amount) {
    if(ns.invincible||ns.dead) return;
    SFX.hurt();
    ns.playerHp=Math.max(0,ns.playerHp-amount);
    updatePlayerHp();
    if(ns.playerHp<=0){playerDead();return;}
    ns.invincible=true;
    var b=0,iv=setInterval(function(){
        b++;
        if(els.heart) els.heart.style.opacity=(b%2===0)?'0.2':'1';
        if(b>=8){clearInterval(iv);if(els.heart)els.heart.style.opacity='1';ns.invincible=false;}
    }, NS_INVINCIBLE_MS/8);
}

function playerDead() {
    if(ns.dead) return;
    ns.dead=true; ns.active=false; ns.phase='over';
    clearProjs();
    if(ns.loop){clearInterval(ns.loop);ns.loop=null;}
    if(ns.dodgeTimer){clearTimeout(ns.dodgeTimer);ns.dodgeTimer=null;}

    // para batalha imediatamente
    var bm=document.getElementById('battle-music');
    if(bm){try{bm.pause();bm.currentTime=0;}catch(e){}}

    // ativa cooldown de 10 min
    if(typeof window._setNeroFightCooldown==='function') window._setNeroFightCooldown();

    if(els.heart) els.heart.style.opacity='0';
    setMessage('* ...');
    showNeroBubble('...',1500);

    // pausa dramática → fade → tela de game over (música toca lá)
    setTimeout(function(){
        fadeToBlack(800, function(){
            hideScreen();
            SFX.gameover();
            showGameOverScreen();
        });
    }, 2600);
}

function showGameOverScreen() {
    var ov = document.createElement('div');
    ov.id = 'ns-gameover-screen';
    ov.style.cssText = 'position:fixed;inset:0;background:#000;z-index:10500;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;font-family:VT323,monospace;opacity:0;transition:opacity 1.2s;';

    var title = document.createElement('div');
    title.textContent = 'GAME OVER';
    title.style.cssText = 'font-size:80px;color:#ff2222;letter-spacing:10px;text-shadow:0 0 40px rgba(255,34,34,0.7);';

    var sub = document.createElement('div');
    sub.textContent = 'Nero venceu.';
    sub.style.cssText = 'font-size:26px;color:#888;letter-spacing:2px;';

    var hint = document.createElement('div');
    hint.textContent = '[ pressione qualquer tecla ]';
    hint.style.cssText = 'font-size:19px;color:#333;margin-top:40px;letter-spacing:2px;cursor:pointer;transition:color 0.4s;';

    ov.appendChild(title);
    ov.appendChild(sub);
    ov.appendChild(hint);
    document.body.appendChild(ov);

    // fade in
    setTimeout(function(){ ov.style.opacity='1'; }, 50);

    // libera saída depois que a música terminar (~4s)
    setTimeout(function(){
        hint.style.color = '#999';

        var go=document.getElementById('sfx-gameover');
        if(go){try{go.pause();go.currentTime=0;}catch(e){}}

        var leave = function(){
            document.removeEventListener('keydown', leave);
            hint.removeEventListener('click', leave);
            ov.style.opacity = '0';
            setTimeout(function(){
                if(ov.parentNode) ov.parentNode.removeChild(ov);
                goToMenu();
                var fo=document.getElementById('ns-fade-overlay');
                if(fo){fo.style.transition='opacity 0.6s';fo.style.opacity='0';}
            }, 900);
        };
        document.addEventListener('keydown', leave);
        hint.addEventListener('click', leave);
    }, 4200);
}

// ── FIGHT timing ─────────────────────────────────────────────
function startTiming() {
    ns.timingVal=0; ns.timingDir=1; ns.timingActive=true;
    SFX.confirm();
    if(els.timingWrap) els.timingWrap.style.display='block';
    if(ns.timingIv) clearInterval(ns.timingIv);
    var speed=2.2+ns.turnNum*0.35;
    ns.timingIv=setInterval(function(){
        if(!ns.timingActive) return;
        ns.timingVal+=ns.timingDir*speed;
        if(ns.timingVal>=100){ns.timingVal=100;ns.timingDir=-1;}
        if(ns.timingVal<=0)  {ns.timingVal=0;  ns.timingDir= 1;}
        if(els.timingFill) els.timingFill.style.width=ns.timingVal+'%';
    }, NS_TICK);
}

function confirmTiming() {
    if(!ns.timingActive) return;
    ns.timingActive=false; clearInterval(ns.timingIv);
    if(els.timingWrap) els.timingWrap.style.display='none';
    hideActionPanel();
    var q=ns.timingVal;
    var multi=q>=80?1.8:q>=55?1.3:q>=30?0.9:0.45;
    var dmg=Math.round(140*multi);
    ns.neroHp-=dmg; updateNeroHp();
    SFX.hit();
    var msgs=['* Golpe fraco! ('+dmg+' de dano)','* Acertou! ('+dmg+' de dano)','* Bom timing! ('+dmg+' de dano)','* Crítico! ('+dmg+' de dano)'];
    var idx=q>=80?3:q>=55?2:q>=30?1:0;
    setMessage(msgs[idx]);
    showNeroBubble(idx>=2?'Isso doeu...':'É só isso?',2000);
    if(ns.neroHp<=0){neroDefeated();return;}
    ns.phase='transitioning';
    setTimeout(function(){startDodgePhase();},1200);
}

// ── ACT ───────────────────────────────────────────────────────
var actLines=[
    ['Olhar','Nero parece irritada mas concentrada.'],
    ['Provocar','Continue tentando.'],
    ['Falar','Não tenho nada a te dizer.'],
    ['Insultar','Você é mesmo irritante.']
];
var actIdx=0;
function doAct() {
    SFX.confirm();
    var opt=actLines[actIdx%actLines.length]; actIdx++;
    setMessage('* '+opt[1]); showNeroBubble(opt[1],2500);
    hideActionPanel(); ns.phase='transitioning';
    setTimeout(function(){startDodgePhase();},1500);
}

// ── ITEM ──────────────────────────────────────────────────────
function doItem() {
    var inv=(typeof inventory!=='undefined')?inventory:null;
    var items=inv?(inv.items||[]):[];
    var healItem=null;
    for(var i=0;i<items.length;i++){if(items[i]&&items[i].heal){healItem=items[i];break;}}
    if(!healItem){SFX.navigate();setMessage('* Sem itens úteis.');setTimeout(function(){if(ns.phase==='player'&&ns.active)showActionPanel();},1200);return;}
    SFX.heal();
    ns.playerHp=Math.min(NS_PLAYER_MAX,ns.playerHp+healItem.heal);
    updatePlayerHp();
    setMessage('* Você usou '+(healItem.name||'item')+'! (+'+healItem.heal+' HP)');
    if(inv.remove) inv.remove(healItem.id||i);
    hideActionPanel(); ns.phase='transitioning';
    setTimeout(function(){startDodgePhase();},1200);
}

// ── MERCY ─────────────────────────────────────────────────────
var MERCY_LINES=[
    'Mercy? Você pagou 9999 moedas pra isso.',
    'Você tá com dó agora? Sério?',
    'Não vai adiantar.',
    'faça como quiser, mas não irei devolver seu dinheiro, saia daqui.'
];
function doMercy() {
    SFX.confirm(); ns.mercyCount++;
    hideActionPanel(); ns.phase='transitioning';
    var line=MERCY_LINES[Math.min(ns.mercyCount-1,MERCY_LINES.length-1)];
    setMessage('* Nero: '+line); showNeroBubble(line,2800);
    if(ns.mercyCount>=4){
        ns.active=false;
        setTimeout(function(){
            fadeToBlack(800,function(){hideScreen();goToMenu();fadeClear(600);});
        },2200);
        return;
    }
    setTimeout(function(){startDodgePhase();},1800);
}

// ── Nero derrotada ────────────────────────────────────────────
function neroDefeated() {
    ns.active=false; ns.phase='over';
    clearProjs();
    if(ns.loop){clearInterval(ns.loop);ns.loop=null;}
    if(ns.dodgeTimer){clearTimeout(ns.dodgeTimer);ns.dodgeTimer=null;}
    SFX.shatter();
    if(els.neroSprite){els.neroSprite.style.transition='opacity 1s';els.neroSprite.style.opacity='0';}
    setMessage('* Nero: ... não esperava isso de você.');
    if(typeof saveUnlockChapter==='function') saveUnlockChapter('ending-nero-store');
    setTimeout(function(){
        fadeToBlack(1000,function(){hideScreen();showNeroStoreEnding();});
    },2800);
}

// ── Fases do turno ────────────────────────────────────────────
function startDodgePhase() {
    if(!ns.active) return;
    ns.phase='dodge'; ns.turnNum++;
    clearProjs();
    ns.hx=NS_ARENA_W/2-NS_HEART_R; ns.hy=NS_ARENA_H/2-NS_HEART_R;
    if(els.heart){els.heart.style.left=ns.hx+'px';els.heart.style.top=ns.hy+'px';els.heart.style.opacity='1';}
    if(els.arena) els.arena.style.display='block';
    var falas=['Consegue desviar?','Tô aquecendo.','Você vai se cansar.','Continue tentando.','Isso é só o começo.','Não vai adiantar.'];
    showNeroBubble(falas[(ns.turnNum-1)%falas.length],3000);
    var dur=6000;
    if(ns.dodgeTimer) clearTimeout(ns.dodgeTimer);
    ns.dodgeTimer=setTimeout(function(){if(ns.phase==='dodge'&&ns.active)endDodgePhase();},dur);

    // todos os padrões disponíveis desde o início, sem repetir o último
    var pool = PATTERNS.filter(function(p){ return p !== ns._lastPattern; });
    if(pool.length===0) pool = PATTERNS.slice();
    var chosen = pool[Math.floor(Math.random()*pool.length)];
    ns._lastPattern = chosen;
    chosen();
}
function endDodgePhase() {
    ns.phase='transitioning'; clearProjs();
    if(els.arena) els.arena.style.display='none';
    if(els.heart) els.heart.style.opacity='0';
    setTimeout(function(){if(ns.active)startPlayerPhase();},500);
}
function startPlayerPhase() {
    if(!ns.active) return;
    ns.phase='player';
    setMessage('* O que você vai fazer?');
    showActionPanel();
}

function showActionPanel(){
    if(!els.actionPanel) return;
    els.actionPanel.style.display='flex';
    els.actionPanel.classList.remove('ns-btns-visible');
    void els.actionPanel.offsetWidth;
    els.actionPanel.classList.add('ns-btns-visible');
}
function hideActionPanel(){
    if(els.actionPanel)els.actionPanel.style.display='none';
    if(els.timingWrap) els.timingWrap.style.display='none';
    ns.timingActive=false;
    if(ns.timingIv){clearInterval(ns.timingIv);ns.timingIv=null;}
}

// ── Transições ────────────────────────────────────────────────
function fadeToBlack(dur,cb){
    var fo=document.getElementById('ns-fade-overlay');
    if(!fo){if(cb)cb();return;}
    fo.style.transition='opacity '+(dur/1000)+'s ease'; fo.style.opacity='1';
    setTimeout(function(){if(cb)cb();},dur+50);
}
function fadeClear(dur){
    var fo=document.getElementById('ns-fade-overlay');
    if(!fo) return;
    fo.style.transition='opacity '+(dur/1000)+'s ease'; fo.style.opacity='0';
}
function goToMenu(){
    var m=document.getElementById('menu-screen');
    var mm=document.getElementById('menu-music');
    if(m) m.style.display='flex';
    if(typeof showMenuView==='function') showMenuView('main-menu-buttons',true);
    if(mm){try{mm.volume=0.7;mm.play().catch(function(){});}catch(e){}}
}
function hideScreen(){
    var scr=document.getElementById('ns-battle-screen');
    if(scr) scr.style.display='none';
    var bm=document.getElementById('battle-music');
    if(bm){try{bm.pause();bm.currentTime=0;}catch(e){}}
    document.removeEventListener('keydown',onKD);
    document.removeEventListener('keyup',  onKU);
    if(ns.loop){clearInterval(ns.loop);ns.loop=null;}
    if(ns.dodgeTimer){clearTimeout(ns.dodgeTimer);ns.dodgeTimer=null;}
    clearProjs();
}

// ── Ending exclusivo ──────────────────────────────────────────
function showNeroStoreEnding(){
    var ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:#000;z-index:10500;display:flex;align-items:center;justify-content:center;flex-direction:column;';
    var txt=document.createElement('div');
    txt.style.cssText='font-family:VT323,monospace;font-size:34px;color:#fff;text-align:center;max-width:580px;line-height:1.7;white-space:pre-line;padding:0 24px;';
    var hint=document.createElement('div');
    hint.style.cssText='font-family:VT323,monospace;font-size:20px;color:#444;margin-top:48px;letter-spacing:2px;cursor:pointer;';
    hint.textContent='[ pressione qualquer tecla ]';
    ov.appendChild(txt); ov.appendChild(hint);
    document.body.appendChild(ov);
    ov.style.opacity='0'; ov.style.transition='opacity 0.8s';
    setTimeout(function(){ov.style.opacity='1';},50);
    var lines=['Você venceu.','.','..','...','Nero: O dinheiro era meu de qualquer forma.','Nero: Mas... valeu a pena.','[ FIM ]'];
    var idx=0,built='';
    function next(){
        if(idx>=lines.length){
            hint.style.color='#888';
            var leave=function(){
                document.removeEventListener('keydown',leave);
                hint.removeEventListener('click',leave);
                ov.style.opacity='0';
                setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);goToMenu();fadeClear(600);},700);
            };
            setTimeout(function(){document.addEventListener('keydown',leave);hint.addEventListener('click',leave);},400);
            return;
        }
        built+=(idx>0?'\n':'')+lines[idx]; txt.textContent=built; idx++;
        setTimeout(next,idx<=3?550:2000);
    }
    setTimeout(next,500);
}

// ── Input ─────────────────────────────────────────────────────
function onKD(e){ns.keys[e.key]=true;}
function onKU(e){ns.keys[e.key]=false;}

// ── Init ──────────────────────────────────────────────────────
function init(){
    els.screen      =document.getElementById('ns-battle-screen');
    els.neroSprite  =document.getElementById('ns-nero-sprite');
    els.arena       =document.getElementById('ns-arena');
    els.heart       =document.getElementById('ns-heart');
    els.actionPanel =document.getElementById('ns-action-panel');
    els.timingWrap  =document.getElementById('ns-timing-wrap');
    els.timingFill  =document.getElementById('ns-timing-fill');
    els.message     =document.getElementById('ns-message');
    els.neroHpFill  =document.getElementById('ns-nero-hp-fill');
    els.neroHpNum   =document.getElementById('ns-nero-hp-num');
    els.playerHpFill=document.getElementById('ns-player-hp-fill');
    els.playerHpNum =document.getElementById('ns-player-hp-num');

    // cria elementos de áudio se não existirem
    var audioMap={
        'sfx-slash':'./assets/audio/slash.wav',
        'sfx-hurtsound':'./assets/audio/hurtsound.wav',
        'sfx-menuconfirm':'./assets/audio/menuconfirm.wav',
        'sfx-menumove':'./assets/audio/menumove.wav',
        'sfx-gameover':'./assets/audio/mus_gameover.ogg',
        'sfx-enemydust':'./assets/audio/enemydust.wav',
        'sfx-healsound':'./assets/audio/healsound.wav',
        'sfx-soul-shatter':'./assets/audio/soul_shatter.wav'
    };
    Object.keys(audioMap).forEach(function(id){
        if(document.getElementById(id)) return;
        var a=document.createElement('audio'); a.id=id; a.preload='auto';
        var s=document.createElement('source'); s.src=audioMap[id];
        s.type=audioMap[id].endsWith('.ogg')?'audio/ogg':'audio/wav';
        a.appendChild(s); document.body.appendChild(a);
    });

    // ── Botão FIGHT ──
    var btnFight=document.getElementById('ns-btn-fight');
    function resetFightBtn(){
        if(btnFight) btnFight.innerHTML='<span class="ns-btn-heart"></span> ⚔ FIGHT';
        ['ns-btn-act','ns-btn-item','ns-btn-mercy'].forEach(function(id){
            var b=document.getElementById(id); if(b) b.style.display='';
        });
    }
    if(btnFight){
        btnFight.addEventListener('mouseenter',function(){SFX.navigate();});
        btnFight.addEventListener('click',function(){
            if(ns.phase!=='player'||!ns.active) return;
            if(!ns.timingActive){
                // primeiro clique — mostra timing, esconde outros botões
                ['ns-btn-act','ns-btn-item','ns-btn-mercy'].forEach(function(id){
                    var b=document.getElementById(id); if(b) b.style.display='none';
                });
                btnFight.innerHTML='<span class="ns-btn-heart"></span> ★ CONFIRMAR';
                startTiming();
                setMessage('* Pressione FIGHT no momento certo!');
            } else {
                // segundo clique — confirma
                resetFightBtn();
                confirmTiming();
            }
        });
    }

    ['ns-btn-act','ns-btn-item','ns-btn-mercy'].forEach(function(id){
        var b=document.getElementById(id);
        if(b) b.addEventListener('mouseenter',function(){SFX.navigate();});
    });
    var btnAct=document.getElementById('ns-btn-act');
    var btnItem=document.getElementById('ns-btn-item');
    var btnMercy=document.getElementById('ns-btn-mercy');
    if(btnAct)   btnAct.addEventListener('click',  function(){if(ns.phase==='player'&&ns.active)doAct();});
    if(btnItem)  btnItem.addEventListener('click', function(){if(ns.phase==='player'&&ns.active)doItem();});
    if(btnMercy) btnMercy.addEventListener('click',function(){if(ns.phase==='player'&&ns.active)doMercy();});

    // Enter/Z confirma timing
    document.addEventListener('keydown',function(e){
        if((e.key==='Enter'||e.key==='z'||e.key==='Z')&&ns.timingActive){
            resetFightBtn(); confirmTiming();
        }
    });
}

// ── START ─────────────────────────────────────────────────────
window.startNeroStoreBattle=function(){
    init();
    ns.active=false; ns.phase='idle'; ns.neroHp=NS_MAX_HP; ns.playerHp=NS_PLAYER_MAX;
    ns.invincible=false; ns.dead=false; ns.mercyCount=0; ns.turnNum=0; ns._lastPattern=null;
    ns.keys={}; ns.projectiles=[]; ns.timingActive=false;
    if(ns.timingIv)  {clearInterval(ns.timingIv);  ns.timingIv=null;}
    if(ns.loop)      {clearInterval(ns.loop);       ns.loop=null;}
    if(ns.dodgeTimer){clearTimeout(ns.dodgeTimer);  ns.dodgeTimer=null;}
    clearProjs();

    var scr=document.getElementById('ns-battle-screen');
    if(!scr) return;
    scr.style.display='flex';

    var fo=document.getElementById('ns-fade-overlay');
    if(fo){fo.style.transition='none';fo.style.opacity='1';}

    updateNeroHp(); updatePlayerHp();
    if(els.arena)       els.arena.style.display='none';
    if(els.heart)       els.heart.style.opacity='0';
    if(els.actionPanel) els.actionPanel.style.display='none';
    if(els.timingWrap)  els.timingWrap.style.display='none';
    if(els.neroSprite)  els.neroSprite.style.opacity='0';

    var bm=document.getElementById('battle-music');
    if(bm){try{bm.volume=0.3;bm.currentTime=0;bm.play().catch(function(){});}catch(e){}}

    // Para músicas da loja antes de iniciar a batalha
    var nsm=document.getElementById('nero-store-music');
    var nsmo=document.getElementById('nero-store-music-other');
    if(nsm){try{nsm.pause();nsm.currentTime=0;}catch(e){}}
    if(nsmo){try{nsmo.pause();nsmo.currentTime=0;}catch(e){}}

    // Adiciona 5 itens de cura no inventário da batalha (curam HP inteiro)
    if(typeof inventory!=='undefined'){
        inventory.items = inventory.items.filter(function(i){ return i.id !== 'ns_cura'; });
        for(var _h=0;_h<5;_h++){
            inventory.items.push({
                id: 'ns_cura',
                name: '💊 ITEM DE CURA',
                heal: NS_PLAYER_MAX,
                color: '#00ff88'
            });
        }
    }

    document.removeEventListener('keydown',onKD);
    document.removeEventListener('keyup',  onKU);
    document.addEventListener('keydown',onKD);
    document.addEventListener('keyup',  onKU);

    ns.loop=setInterval(dodgeLoop, NS_TICK);

    setTimeout(function(){
        if(fo){fo.style.transition='opacity 0.8s';fo.style.opacity='0';}
        if(els.neroSprite){els.neroSprite.style.transition='opacity 0.8s';els.neroSprite.style.opacity='1';}
        // mostra botões junto com o fade-in (com slide-up)
        if(els.actionPanel){
            els.actionPanel.style.display='flex';
            els.actionPanel.classList.remove('ns-btns-visible');
            void els.actionPanel.offsetWidth;
            els.actionPanel.classList.add('ns-btns-visible');
        }
        setTimeout(function(){
            ns.active=true;
            showNeroBubble('Vamos terminar isso.',2500);
            setMessage('* Nero aparece na sua frente.');
            setTimeout(function(){startPlayerPhase();},1800);
        }, 900);
    }, 120);
};

})();