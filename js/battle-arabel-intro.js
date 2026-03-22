// Intro da batalha Arabel com Dev
function utAction(action) {
    if (!canInteract || isTyping) return;
    if (action === 'fight') {
        if (quizCompleted) {
            showDevMessage("Isso não foi tão divertido, já sei, a gente pode brincar de ARG, o que acha?", startPasswordScreen);
        } else {
            showDevMessage(
                "Desenvolver esse sistema de batalha é bem mais complicado do que parece... então acho melhor que façam um duelo de perguntas e respostas!",
                (aceitou) => {
                    if (aceitou) {
                        startQuizIntro();
                    } else {
                        startArabelBattle();
                    }
                },
                false,
                true
            );
        }
        return;
    }
    if (action === 'mercy') { alert("Neste universo nenhum ser tem perdão, muito menos você."); return; }
    let response = "";
    if (action === 'act')  response = "* Você tenta argumentar com Arabel.\\n* Ela ri de você.";
    if (action === 'item') response = "* Você não tem itens úteis agora.";
    startTyping(response, utArenaText, 40);
}
