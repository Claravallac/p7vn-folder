// Batalha Arabel - Estilo Pokémon (Simplificado)
let pkmnBattleActive = false;
let pkmnPlayerTurn = true;

const pkmnPlayer = {
    name: 'ABBYL',
    hp: 100,
    maxHp: 100,
    moves: [
        { name: 'ATAQUE', damage: 20 },
        { name: 'ESPECIAL', damage: 35 },
        { name: 'DEFENDER', damage: 0, heal: true },
        { name: 'CURAR', damage: 0, heal: 30 }
    ]
};

const pkmnEnemy = {
    name: 'ARABEL',
    hp: 150,
    maxHp: 150,
    moves: [
        { name: 'ATAQUE', damage: 20 },
        { name: 'ESPECIAL', damage: 35 }
    ]
};

function startPkmnArabelBattle() {
    pkmnBattleActive = true;
    pkmnPlayerTurn = true;
    pkmnPlayer.hp = pkmnPlayer.maxHp;
    pkmnEnemy.hp = pkmnEnemy.maxHp;

    gameScreen.style.display = 'none';
    utBattleScreen.style.display = 'none';
    realBattleScreen.style.display = 'none';

    const pkmnScreen = document.getElementById('pkmn-battle-screen');
    pkmnScreen.style.display = 'flex';

    pkmnUpdateUI();

    battleMusic.volume = 0.3;
    battleMusic.play().catch(() => {});
}

function pkmnUpdateUI() {
    const playerBar = document.getElementById('pkmn-player-hp-bar');
    const enemyBar = document.getElementById('pkmn-arabel-hp-bar');

    playerBar.style.width = (pkmnPlayer.hp / pkmnPlayer.maxHp * 100) + '%';
    enemyBar.style.width = (pkmnEnemy.hp / pkmnEnemy.maxHp * 100) + '%';

    document.getElementById('pkmn-player-hp-text').innerText = Math.round(pkmnPlayer.hp) + '/' + pkmnPlayer.maxHp;
}

function pkmnPlayerAttack(moveIndex) {
    if (!pkmnBattleActive || !pkmnPlayerTurn) return;

    const moves = { ataque: 0, especial: 1, defender: 2, curar: 3 };
    const move = pkmnPlayer.moves[moves[moveIndex]];

    pkmnPlayerTurn = false;
    document.getElementById('pkmn-menu-attacks').style.display = 'none';

    if (move.heal) {
        pkmnPlayer.hp = Math.min(pkmnPlayer.maxHp, pkmnPlayer.hp + (move.heal || 0));
    } else {
        pkmnEnemy.hp = Math.max(0, pkmnEnemy.hp - move.damage);
        sfxAttack.currentTime = 0;
        sfxAttack.play().catch(() => {});
        document.getElementById('pkmn-arabel-sprite').style.animation = 'pkmnShake 0.3s';
        setTimeout(() => {
            document.getElementById('pkmn-arabel-sprite').style.animation = '';
        }, 300);
    }

    pkmnUpdateUI();

    if (pkmnEnemy.hp <= 0) {
        pkmnBattleActive = false;
        battleMusic.pause();
        battleMusic.currentTime = 0;
        setTimeout(() => {
            document.getElementById('pkmn-battle-screen').style.display = 'none';
            startNeroBattle();
        }, 2000);
        return;
    }

    setTimeout(() => {
        pkmnEnemyTurn();
    }, 1500);
}

function pkmnEnemyTurn() {
    if (!pkmnBattleActive) return;

    const randomMove = pkmnEnemy.moves[Math.floor(Math.random() * pkmnEnemy.moves.length)];
    pkmnPlayer.hp = Math.max(0, pkmnPlayer.hp - randomMove.damage);

    sfxFail.currentTime = 0;
    sfxFail.play().catch(() => {});

    document.getElementById('pkmn-player-sprite').style.animation = 'pkmnShake 0.3s';
    setTimeout(() => {
        document.getElementById('pkmn-player-sprite').style.animation = '';
    }, 300);

    pkmnUpdateUI();

    if (pkmnPlayer.hp <= 0) {
        pkmnBattleActive = false;
        setTimeout(() => {
            triggerGameOver();
        }, 1000);
        return;
    }

    setTimeout(() => {
        pkmnPlayerTurn = true;
        document.getElementById('pkmn-menu-main').style.display = 'grid';
    }, 1500);
}
