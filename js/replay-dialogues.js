// ============================================================
//  REPLAY DIALOGUE SYSTEM  v2
//
//  Quando o player repete um capítulo, os personagens começam
//  a notar algo estranho — déjà vu, resignação, consciência
//  do loop. Cada capítulo tem variantes para 2ª, 3ª e 4ª+ vez.
//
//  Como funciona:
//    loadChapter() chama window._applyReplayVariants(id, chapter)
//    antes de atribuir a currentChapter. Essa função devolve um
//    CLONE do objeto com as linhas modificadas — nunca altera o
//    original. O contador de runs é salvo em vnChapterRuns_v1.
//
//  Estrutura de uma variante:
//  {
//    lineIndex : número (índice na lista original)
//    mode      : 'replace' | 'insert_before' | 'insert_after'
//    line      : { speaker, text, left?, right? }
//  }
// ============================================================

(function () {

    // ── CONTAGEM DE RUNS ──────────────────────────────────────────
    const RUNS_KEY = 'vnChapterRuns_v1';

    function getRuns() {
        try { return JSON.parse(GameStorage.getItem(RUNS_KEY) || '{}'); }
        catch (_) { return {}; }
    }

    function incrementRun(id) {
        const runs = getRuns();
        const key  = String(id);
        runs[key]  = (runs[key] || 0) + 1;
        try { GameStorage.setItem(RUNS_KEY, JSON.stringify(runs)); } catch (_) {}
        return runs[key];
    }

    // Debug helpers
    window._replayGetRuns  = getRuns;
    window._replayResetAll = function () {
        try { GameStorage.setItem(RUNS_KEY, '{}'); } catch (_) {}
    };

    // ── O QUE O PUDDING ESTAVA DESENHANDO ────────────────────────────
    //
    //  Index 12 no cap 1:
    //    "Sinceramente, o que me impressiona é quando não me pedem
    //     para desenhar uma grávida dando para um anão elfo em plena
    //     3 da manhã."
    //
    //  A cada repetição o Pudding revela um pedido diferente e cada
    //  vez mais bizarro. A piada vai escalando sem parar.
    //
    //  Index 1 no cap 1 (complementar):
    //    "Eu já falei para você não atrapalhar meus desenhos..."
    //  → também muda a cada vez para dar contexto ao que ele está fazendo
    //
    //  Index 2 no cap 1.2:
    //    "Mais uma invenção doida do Abbyl, agora sai da frente,
    //     preciso ir desenhar."
    //  → também varia

    // O que ele estava desenhando desta vez (linha 12, cap 1)
    const PUDDING_DRAWING_LINES = [
        // run2 (2ª vez)
        "Sinceramente, o que me impressiona é quando não me pedem para desenhar um cavaleiro medieval chorando abraçado com um peixe betta em plena 2 da tarde.",
        // run3
        "Sinceramente, o que me impressiona é quando não me pedem para desenhar a Estátua da Liberdade usando crocs e comendo yakisoba.",
        // run4
        "Sinceramente, o que me impressiona é quando não me pedem para desenhar um hamster pilotando um helicóptero numa tempestade usando óculos escuros.",
        // run5
        "Sinceramente, o que me impressiona é quando não me pedem para desenhar o papa jogando CS em LAN house às 4 da manhã.",
        // run6+
        "Sinceramente, o que me impressiona é quando não me pedem para desenhar. Ponto. Só isso. Já aceito qualquer coisa.",
    ];

    // O que ele estava fazendo/trabalhando (linha 1, cap 1 — contexto)
    const PUDDING_INTERRUPTED_LINES = [
        // run2
        "Eu já falei para você não atrapalhar minha sessão de estudos de anatomia de criaturas fantásticas para me mostrar essas invenções estranhas",
        // run3
        "Eu já falei para você não atrapalhar meu processo criativo de uma cena épica de batalha com três dragões e um contador de impostos para me mostrar essas invenções estranhas",
        // run4
        "Eu já falei para você não atrapalhar meu projeto de série de 47 capítulos sobre um polvo que virou detective para me mostrar essas invenções estranhas",
        // run5
        "Eu já falei para você não atrapalhar minha comissão urgente de um banner de aniversário do cachorro de uma pessoa que eu nunca conheci para me mostrar essas invenções estranhas",
        // run6+
        "Eu já falei para você não me interromper. Qualquer coisa. O que quer que eu esteja fazendo.",
    ];

    // O que ele precisa ir fazer no cap 1.2 (linha 2)
    const PUDDING_LEAVING_LINES = [
        // run2
        "Mais uma invenção doida do Abbyl, agora sai da frente, preciso terminar de desenhar um gato com asas de borboleta voando sobre uma cidade cyberpunk.",
        // run3
        "Mais uma invenção doida do Abbyl, agora sai da frente, preciso entregar uma ilustração de um filósofo grego jogando vôlei de praia.",
        // run4
        "Mais uma invenção doida do Abbyl, agora sai da frente, preciso terminar o episódio 12 do meu mangá sobre um taxista que descobriu ser herdeiro de um reino subaquático.",
        // run5
        "Mais uma invenção doida do Abbyl, agora sai da frente, tenho seis comissões atrasadas e minha sanidade já foi embora há muito tempo.",
        // run6+
        "Mais uma invenção doida do Abbyl. Sai da frente.",
    ];

    function getPuddingLine(pool, runCount) {
        // runCount 2 → índice 0, runCount 3 → 1, etc. Clamp no último.
        const idx = Math.min(runCount - 2, pool.length - 1);
        return pool[idx];
    }


    // ── VARIANTES POR CAPÍTULO ────────────────────────────────────
    const VARIANTS = {

        // ── PRÓLOGO (id 0) ── Nero e Arabel
        0: {
            run2: [
                { lineIndex: 0, mode: 'insert_before',
                  line: { speaker: 'Nero', text: '...Espera.' } },
                { lineIndex: 0, mode: 'insert_before',
                  line: { speaker: 'Nero', text: 'Essa sensação de novo... Déjà vu?' } },
            ],
            run3: [
                { lineIndex: 0, mode: 'replace',
                  line: { speaker: 'Nero', text: 'Finalmente! De novo.' } },
                { lineIndex: 1, mode: 'replace',
                  line: { speaker: 'Nero', text: '...Por que estou repetindo isso? Eu já disse exatamente isso antes.' } },
                { lineIndex: 3, mode: 'insert_after',
                  line: { speaker: 'Arabel', text: 'Você também sentiu isso, não foi? Como se já tivéssemos feito isso antes.' } },
            ],
            run4plus: [
                { lineIndex: 0, mode: 'replace',
                  line: { speaker: 'Nero', text: 'Finalmente. Outra vez. Mais uma.' } },
                { lineIndex: 1, mode: 'replace',
                  line: { speaker: 'Nero', text: 'Eu já perdi a conta de quantas vezes disse isso.' } },
                { lineIndex: 2, mode: 'replace',
                  line: { speaker: 'Arabel', text: 'Nero... por que nós estamos fazendo isso de novo? Governar o quê? Nós já fizemos isso.' } },
                { lineIndex: 3, mode: 'replace',
                  line: { speaker: 'Nero', text: 'Alguém está nos assistindo. Eu sinto.' } },
            ]
        },

        // ── CAPÍTULO 1 (id 1) ── Abbyl e Pudding no laboratório
        // Linhas relevantes (0-based):
        //   0  → "Abbyl!"
        //   1  → "Eu já falei para você não atrapalhar meus desenhos..."
        //   3  → "Eu não sou idiota."
        //   4  → trigger showPuddingChoice
        //   5  → "Tá bom, mas só essa vez, eu realmente preciso desenhar."
        //   12 → A linha do desenho bizarro (grávida/elfo)
        //   13 → "Não sabia que você tinha uma opinião tão forte sobre isso..."
        //   15 → "Quem será?"
        //   21 → "Você tem um laboratório agora é?..."
        1: {
            run2: [
                // O que ele estava fazendo
                { lineIndex: 1, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: null, left: 'aldrich', right: null,
                          _pool: 'interrupted' } },
                // Sinal de déjà vu
                { lineIndex: 0, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: 'Abbyl! ...Essa cena parece familiar.', left: 'aldrich', right: null } },
                // O desenho bizarro desta vez
                { lineIndex: 12, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: null, left: 'aldrich', right: 'abbyl',
                          _pool: 'drawing' } },
                // Abbyl comenta diferente
                { lineIndex: 13, mode: 'replace',
                  line: { speaker: 'Abbyl', text: 'Hmm... você realmente tem um histórico interessante de comissões.', left: 'abbyl', right: 'aldrich' } },
                // Ele já sabe quem é
                { lineIndex: 15, mode: 'replace',
                  line: { speaker: 'Abbyl', text: 'Quem será? ...Já sei quem é.', left: 'abbyl', right: null } },
            ],
            run3: [
                { lineIndex: 1, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: null, left: 'aldrich', right: null,
                          _pool: 'interrupted' } },
                { lineIndex: 0, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: 'Abbyl. Antes que você diga qualquer coisa — eu já ouvi esse papo antes.', left: 'aldrich', right: null } },
                { lineIndex: 3, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: 'Eu não sou idiota. Mas vou deixar você fazer isso de qualquer jeito, aparentemente.', left: 'aldrich', right: 'abbyl' } },
                { lineIndex: 4, mode: 'replace',
                  line: { speaker: 'Abbyl', text: 'Qual é, Pudding... por algum motivo sinto que você vai aceitar.', left: 'abbyl', right: 'aldrich' } },
                { lineIndex: 5, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: 'Tá bom. Eu sabia que ia ceder. Isso é perturbador.', left: 'aldrich', right: 'abbyl' } },
                { lineIndex: 12, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: null, left: 'aldrich', right: 'abbyl',
                          _pool: 'drawing' } },
                { lineIndex: 13, mode: 'replace',
                  line: { speaker: 'Abbyl', text: 'Isso parece... incrivelmente específico. Quem pede isso?', left: 'abbyl', right: 'aldrich' } },
                { lineIndex: 21, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: 'Você tem um laboratório agora é? Já comentei sobre o favoritismo do roteirista numa outra vida. Ou foi nessa? Não lembro mais.', left: 'aldrich', right: 'abbyl' } },
            ],
            run4plus: [
                { lineIndex: 1, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: null, left: 'aldrich', right: null,
                          _pool: 'interrupted' } },
                { lineIndex: 0, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: 'Abbyl.', left: 'aldrich', right: null } },
                { lineIndex: 0, mode: 'insert_after',
                  line: { speaker: 'Aldrich Pudding', text: 'Eu vou economizar minha energia e só dizer: eu sei o que vem por aí.', left: 'aldrich', right: null } },
                { lineIndex: 4, mode: 'replace',
                  line: { speaker: 'Abbyl', text: 'Qual é, Pudding...', left: 'abbyl', right: 'aldrich' } },
                { lineIndex: 4, mode: 'insert_after',
                  line: { speaker: 'Aldrich Pudding', text: '...Tá bom. Já sei que vou dizer isso de qualquer jeito.', left: 'aldrich', right: 'abbyl' } },
                { lineIndex: 12, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: null, left: 'aldrich', right: 'abbyl',
                          _pool: 'drawing' } },
                { lineIndex: 13, mode: 'replace',
                  line: { speaker: 'Abbyl', text: 'Você sabe que eu nunca vou mais te perguntar sobre as suas comissões, né?', left: 'abbyl', right: 'aldrich' } },
                { lineIndex: 13, mode: 'insert_after',
                  line: { speaker: 'Aldrich Pudding', text: 'Obrigado. Levei anos para chegar a esse ponto.', left: 'aldrich', right: 'abbyl' } },
                { lineIndex: 15, mode: 'replace',
                  line: { speaker: 'Abbyl', text: 'Quem será? É o Seven. Sempre é o Seven.', left: 'abbyl', right: null } },
            ]
        },

        // ── CAPÍTULO 1.2 (id 2) ── Seven e Nina
        // Linhas relevantes:
        //   0  → "Não toque em nada, seu doido!"
        //   2  → "Mais uma invenção doida do Abbyl, preciso ir desenhar."
        //   12 → "Esse cara não muda..."
        //   15 → fala final da Bybyl
        2: {
            run2: [
                { lineIndex: 0, mode: 'replace',
                  line: { speaker: 'Abbyl', text: 'Não toque em nada, seu doido! ...De novo.', left: 'abbyl', right: null } },
                { lineIndex: 2, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: null, left: 'aldrich', right: 'seven',
                          _pool: 'leaving' } },
                { lineIndex: 12, mode: 'replace',
                  line: { speaker: 'Abbyl', text: 'Esse cara não muda... Nunca muda, em nenhuma versão dessa história.', left: 'abbyl', right: null } },
            ],
            run3: [
                { lineIndex: 0, mode: 'replace',
                  line: { speaker: 'Abbyl', text: 'Não toque em nada, seu doido! Como sempre.', left: 'abbyl', right: null } },
                { lineIndex: 1, mode: 'replace',
                  line: { speaker: 'Seven', text: 'Eu só ia chamar vocês pra um Vavazinho... espera, isso já aconteceu.', left: 'seven', right: null } },
                { lineIndex: 1, mode: 'insert_after',
                  line: { speaker: 'Seven', text: 'Sinto que fiz isso antes. Muitas vezes. Tipo muitas mesmo.', left: 'seven', right: null } },
                { lineIndex: 2, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: null, left: 'aldrich', right: 'seven',
                          _pool: 'leaving' } },
                { lineIndex: 15, mode: 'replace',
                  line: { speaker: 'Bybyl', text: 'Sabe, às vezes eu não entendo o porquê me sabotaram tanto assim... ou melhor, lembro muito bem. Já passei por isso.', left: 'abbyl', right: null } },
            ],
            run4plus: [
                { lineIndex: 0, mode: 'replace',
                  line: { speaker: 'Abbyl', text: 'Não toque em nada.', left: 'abbyl', right: null } },
                { lineIndex: 1, mode: 'replace',
                  line: { speaker: 'Seven', text: 'Vocês percebem que a gente já fez isso várias vezes, né?', left: 'seven', right: null } },
                { lineIndex: 2, mode: 'replace',
                  line: { speaker: 'Aldrich Pudding', text: null, left: 'aldrich', right: 'seven',
                          _pool: 'leaving' } },
                { lineIndex: 13, mode: 'insert_after',
                  line: { speaker: 'Nina', text: 'Esse nome... bybyl. Já ouvi isso tão, tão, tão, tão... tão, tão, tão, tão... bom.', left: 'nina', right: 'abbyl' } },
                { lineIndex: 15, mode: 'replace',
                  line: { speaker: 'Bybyl', text: '...Já sei. Já sei o que vai acontecer. E mesmo assim estou aqui.', left: 'abbyl', right: null } },
            ]
        },
    };


    // ── APLICADOR DE VARIANTES ────────────────────────────────────
    function applyVariants(originalLines, variantList, runCount) {
        const lines = originalLines.map(l => Object.assign({}, l));

        const ORDER = { insert_after: 0, replace: 1, insert_before: 2 };
        const sorted = variantList.slice().sort((a, b) => {
            if (b.lineIndex !== a.lineIndex) return b.lineIndex - a.lineIndex;
            return (ORDER[a.mode] ?? 1) - (ORDER[b.mode] ?? 1);
        });

        for (const v of sorted) {
            const idx = v.lineIndex;
            if (idx < 0 || idx > lines.length) continue;

            // Resolve linhas com _pool (texto dinâmico do Pudding)
            let resolvedLine = Object.assign({}, v.line);
            if (resolvedLine._pool) {
                let pool;
                if (resolvedLine._pool === 'drawing')     pool = PUDDING_DRAWING_LINES;
                else if (resolvedLine._pool === 'interrupted') pool = PUDDING_INTERRUPTED_LINES;
                else if (resolvedLine._pool === 'leaving')    pool = PUDDING_LEAVING_LINES;
                if (pool) resolvedLine.text = getPuddingLine(pool, runCount);
                delete resolvedLine._pool;
            }

            switch (v.mode) {
                case 'replace':
                    if (idx < lines.length) {
                        lines[idx] = Object.assign({}, lines[idx], resolvedLine);
                    }
                    break;
                case 'insert_before':
                    lines.splice(idx, 0, resolvedLine);
                    break;
                case 'insert_after':
                    lines.splice(idx + 1, 0, resolvedLine);
                    break;
            }
        }

        return lines;
    }


    // ── FUNÇÃO PÚBLICA ─────────────────────────────────────────────
    // Os diálogos alternativos só ativam após 10 repetições completas do capítulo.
    // runCount 11 → primeira vez com variante (run2), 12 → run3, 13+ → run4plus.
    const REPLAY_MIN_RUNS = 10; // mínimo de repetições completas antes de variar

    window._applyReplayVariants = function (chapterId, chapterObj) {
        if (!chapterObj) return chapterObj;

        const runCount = incrementRun(chapterId);

        const cv = VARIANTS[chapterId];
        // Só ativa variantes depois de REPLAY_MIN_RUNS repetições completas
        if (!cv || runCount <= REPLAY_MIN_RUNS) return chapterObj;

        // Normaliza: run(REPLAY_MIN_RUNS+1) → como run2, run(REPLAY_MIN_RUNS+2) → run3, etc.
        const normalizedRun = runCount - REPLAY_MIN_RUNS + 1;

        let variantList;
        if      (normalizedRun === 2) variantList = cv.run2     || null;
        else if (normalizedRun === 3) variantList = cv.run3     || null;
        else                          variantList = cv.run4plus || cv.run3 || null;

        if (!variantList || !Array.isArray(chapterObj.lines)) return chapterObj;

        const patchedLines = applyVariants(chapterObj.lines, variantList, runCount);
        return Object.assign({}, chapterObj, { lines: patchedLines });
    };


    // ── VARIANTES DO CAPÍTULO 1.3 (DISCORD CALL) ─────────────────
    // Expostas via window._ch13GetReplayOverrides(runCount)
    // Retorna um objeto { [storyIndex]: newStep } com os steps que
    // devem ser substituídos naquela run.
    // O Chapter13Complete chama isso no init() e aplica sobre o STORY.

    const CH13_VARIANTS = {
        run2: {
            // Bybyl entra diferente
            1:  { t:'dlg', who:'bybyl', text:'Então, qual a boa, pessoal? ...Essa call parece familiar.' },
            // Seven percebe algo
            2:  { t:'dlg', who:'seven', text:'Nada demais. O Pudding tá desenhando de novo. Sempre ele.' },
            // Bybyl já sabe a resposta
            5:  { t:'dlg', who:'bybyl', text:'Não é mais fácil só ligar pelo WhatsApp? — sim, eu já sei a resposta.' },
            6:  { t:'dlg', who:'seven', text:'Não tá constando. Muito trampo. Por que você pergunta se já sabe?' },
            // Comentário durante a transmissão
            13: { t:'dlg', who:'multi', who2:['bybyl','seven'], text:'Você é realmente bom nisso... de novo.' },
            // Bybyl questiona a call diferente
            16: { t:'dlg', who:'bybyl', text:'Vocês não estão achando essa Call um pouco chata, não? Ainda?' },
            // Abbyl já antecipa
            22: { t:'dlg', who:'abbyl', text:'Eu fiz um aparelho que acessa o universo paralelo. Antes que vocês falem.' },
        },
        run3: {
            1:  { t:'dlg', who:'bybyl', text:'...oi.' },
            2:  { t:'dlg', who:'seven', text:'Oi. ...ei, você também sentiu isso? Tipo, que já fizemos isso antes?' },
            3:  { t:'dlg', who:'bybyl', text:'Sim. Mas vamos fingir que não.' },
            4:  { t:'dlg', who:'seven', text:'Combinado.' },
            5:  { t:'dlg', who:'bybyl', text:'WhatsApp, Muito trampo, eu sei, pode pular.' },
            6:  { t:'dlg', who:'seven', text:'Justo.' },
            7:  { t:'dlg', who:'bybyl', text:'Relação estranha de vocês. Sempre foi.' },
            9:  { t:'dlg', who:'volkenburt', text:'E aí pessoal. Sei que vocês já estavam me esperando.' },
            10: { t:'dlg', who:'multi', who2:['bybyl','seven'], text:'Opa, Volken.' },
            11: { t:'dlg', who:'volkenburt', text:'O tanque, eu sei, você já viram, mas olha de novo.' },
            13: { t:'dlg', who:'multi', who2:['bybyl','seven'], text:'Você é muito bom nisso. Isso nunca muda.' },
            16: { t:'dlg', who:'bybyl', text:'Call chata. Sim. Como sempre nesse ponto.' },
            17: { t:'dlg', who:'multi', who2:['seven','volkenburt'], text:'Mais ou menos. Previsto.' },
            18: { t:'dlg', who:'bybyl', text:'Eu ia falar do aparelho. Já sei.' },
            22: { t:'dlg', who:'abbyl', text:'Eu fiz um aparelho que acessa o universo paralelo. Não precisa reagir, eu já sei como vai ser.' },
            23: { t:'dlg', who:'volkenburt', text:'Cara, você deve tá é doido da cabeça. Preciso falar isso.' },
            24: { t:'dlg', who:'seven', text:'O remédio, Abbyl. Roteiro.' },
            25: { t:'dlg', who:'abbyl', text:'Ninguém me leva a sério aqui... nunca mesmo.' },
            27: { t:'dlg', who:'abbyl', text:'Será que ninguém aqui liga para o que eu faço? Já sei a resposta.', dr:true },
        },
        run4plus: {
            1:  { t:'dlg', who:'bybyl', text:'...' },
            2:  { t:'dlg', who:'seven', text:'...' },
            3:  { t:'dlg', who:'bybyl', text:'Você não vai dizer nada diferente dessa vez?' },
            4:  { t:'dlg', who:'seven', text:'Provavelmente não.' },
            5:  { t:'dlg', who:'bybyl', text:'WhatsApp. Trampo. Sei.' },
            6:  { t:'dlg', who:'seven', text:'Sim.' },
            7:  { t:'dlg', who:'bybyl', text:'Relação estranha.' },
            9:  { t:'dlg', who:'volkenburt', text:'E aí.' },
            10: { t:'dlg', who:'multi', who2:['bybyl','seven'], text:'Volken.' },
            11: { t:'dlg', who:'volkenburt', text:'O tanque.' },
            13: { t:'dlg', who:'multi', who2:['bybyl','seven'], text:'Bom nisso.' },
            16: { t:'dlg', who:'bybyl', text:'Chata.' },
            17: { t:'dlg', who:'multi', who2:['seven','volkenburt'], text:'Mais ou menos.' },
            18: { t:'dlg', who:'bybyl', text:'Aparelho.' },
            19: { t:'dlg', who:'bybyl', text:'Nick.' },
            21: { t:'dlg', who:'abbyl', text:'Melhor.' },
            22: { t:'dlg', who:'abbyl', text:'Aparelho. Universo paralelo.' },
            23: { t:'dlg', who:'volkenburt', text:'Doido.' },
            24: { t:'dlg', who:'seven', text:'Remédio.' },
            25: { t:'dlg', who:'abbyl', text:'Ninguém me leva a sério.' },
            26: { t:'dramatic' },  // dramatic ainda acontece — o peso permanece
            27: { t:'dlg', who:'abbyl', text:'Será que ninguém aqui liga para o que eu faço?', dr:true },
            28: { t:'dlg', who:'mysterious', text:'Eu ligo. Sempre liguei. Você que não percebe.', dr:true },
        },
    };

    window._ch13GetReplayOverrides = function(runCount) {
        // Só ativa variantes após REPLAY_MIN_RUNS repetições completas
        if (runCount <= REPLAY_MIN_RUNS) return null;
        const normalizedRun = runCount - REPLAY_MIN_RUNS + 1;
        if (normalizedRun === 2) return CH13_VARIANTS.run2;
        if (normalizedRun === 3) return CH13_VARIANTS.run3;
        return CH13_VARIANTS.run4plus;
    };

    console.log('[ReplayDialogues] v2 pronto.');

})();