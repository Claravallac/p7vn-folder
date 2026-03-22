const DiscordPresence = (() => {
  function send(scene, payload) {
    window._discordActiveScene = scene;
    if (window.electronAPI?.discordUpdate) {
      window.electronAPI.discordUpdate(payload);
    }
  }

  return {
    menu()              { window._discordActiveScene = 'menu'; if (window.electronAPI?.discordUpdate) window.electronAPI.discordUpdate({ scene: 'menu' }); },
    prologue()          { send('prologue', { scene: 'prologue' }); },
    chapter(num, title) { send('chapter',  { scene: 'chapter', chapterNum: num, chapterTitle: title }); },
    battle()            { send('battle',   { scene: 'battle' }); },
    minigame()          { send('minigame', { scene: 'minigame' }); },
    slots()             { send('slots',    { scene: 'slots' }); },
    pokemon()           { send('pokemon',  { scene: 'pokemon' }); },
    store()             { send('store',    { scene: 'store' }); },
    ending()            { send('ending',   { scene: 'ending' }); },
  };
})();