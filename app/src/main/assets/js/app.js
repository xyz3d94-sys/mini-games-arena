/* Main Application Orchestrator */
const App = {
  lang: 'uz',
  currentView: 'menu',

  init() {
    AudioEngine.loadPreferences();
    Confetti.init();
    this.detectLanguage();
    this.applyLanguage();

    Multiplayer.init();
    Battleship.init();
    MazeGame.init();
    TTT.init();
    MathGame.init();
    GuessNew.init();
    RPS.init();
    MatchesGame.init();
    PoleGame.init();
    MemoryGame.init();
    MinesGame.init();
    StroopGame.init();
    if (typeof MathMaze !== 'undefined') MathMaze.init();
    if (typeof FruitGame !== 'undefined') FruitGame.init();
    if (typeof TTT5 !== 'undefined') TTT5.init();
    if (typeof Battleship5 !== 'undefined') Battleship5.init();
    if (typeof ChessGame !== 'undefined') ChessGame.init();

    // If running in native Android app with AdMob banner at bottom, hide duplicate web banner
    if (typeof window !== 'undefined' && window.AndroidBridge) {
      const b = document.getElementById('admob-banner-container');
      if (b) b.style.display = 'none';
    }

    // Always start at main menu
    this.goView('menu');
  },

  detectLanguage() {
    const saved = localStorage.getItem('app_user_lang');
    if (saved && ['uz', 'ru', 'en', 'tr'].includes(saved)) {
      this.lang = saved;
      return;
    }
    const sys = (navigator.language || navigator.userLanguage || 'uz').toLowerCase();
    if (sys.startsWith('ru')) this.lang = 'ru';
    else if (sys.startsWith('en')) this.lang = 'en';
    else if (sys.startsWith('tr')) this.lang = 'tr';
    else this.lang = 'uz';
  },

  setLanguage(langCode) {
    AudioEngine.tap();
    this.lang = langCode;
    localStorage.setItem('app_user_lang', langCode);
    this.applyLanguage();
    this.closeLangModal();
    this.refreshActiveView();
  },

  refreshActiveView() {
    if (this.currentView === 'battleship') {
      if (Battleship.inPlacement) {
        Battleship.renderPlacementView();
      } else {
        Battleship.renderBattleBoards();
        Battleship.updateStatus();
      }
    } else if (this.currentView === 'battleship5') {
      if (typeof Battleship5 !== 'undefined') {
        if (Battleship5.inPlacement) {
          Battleship5.renderPlacementView();
        } else {
          Battleship5.renderBattleBoards();
          Battleship5.updateStatus();
        }
      }
    } else if (this.currentView === 'ttt') {
      TTT.updateStatus();
    } else if (this.currentView === 'ttt5') {
      if (typeof TTT5 !== 'undefined') {
        TTT5.updateStatus();
        TTT5.updateLabels();
      }
    } else if (this.currentView === 'chess') {
      if (typeof ChessGame !== 'undefined') {
        ChessGame.renderBoard();
        ChessGame.updateStatus();
        ChessGame.updatePlayerLabels();
        ChessGame.updateSettingsQuickSummary();
        ChessGame.renderHistory();
      }
    } else if (this.currentView === 'math' && MathGame.currentProblem) {
      const tagEl = document.getElementById('math-current-level-tag');
      const t = I18N[this.lang] || I18N.uz;
      if (tagEl) {
        tagEl.textContent = t['mathLvl' + MathGame.level] || (t.mathLevel + " " + MathGame.level);
      }
    } else if (this.currentView === 'matches') {
      MatchesGame.updateUIStrings();
    } else if (this.currentView === 'pole') {
      PoleGame.updateUIStrings();
    } else if (this.currentView === 'memory') {
      MemoryGame.updateUIStrings();
    } else if (this.currentView === 'guess') {
      const t = I18N[this.lang] || I18N.uz;
      const meter = document.getElementById('guess-meter-text');
      if (meter && GuessNew.tries === 0) meter.textContent = t.pickOneTile;
    } else if (this.currentView === 'rps') {
      const t = I18N[this.lang] || I18N.uz;
      const alertBox = document.getElementById('rps-status-alert');
      if (alertBox && !RPS.p1Choice) alertBox.textContent = t.rpsMakeChoice;
    }
  },

  applyLanguage() {
    const t = I18N[this.lang] || I18N.uz;

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el && txt !== undefined) el.textContent = txt;
    };

    // Header & Subtitles
    setTxt('header-sub', t.appSub);
    setTxt('main-brand-title', t.appName || 'Mini Games');
    setTxt('top-game-badge', t.topGameBadge || "🔥 TOP O'YIN");
    setTxt('poki-play-pill', t.playBtn || "O'ynash");
    setTxt('hero-badge', t.heroBadge);
    setTxt('hero-title', t.heroTitle);
    setTxt('hero-desc', t.heroDesc);
    setTxt('lbl-your-id', t.yourId);
    setTxt('btn-copy-id', t.copyId || 'Nusxalash');

    if (typeof Multiplayer !== 'undefined') {
      if (Multiplayer.updatePlayerIdUI) Multiplayer.updatePlayerIdUI();
      if (Multiplayer.updateConnectedPeerUI) Multiplayer.updateConnectedPeerUI();
    }

    // Menu Cards
    setTxt('m-battle-title', t.mBattleTitle);
    setTxt('m-battle-desc', t.mBattleDesc);
    setTxt('m-maze-title', t.mMazeTitle);
    setTxt('m-maze-desc', t.mMazeDesc);
    setTxt('m-ttt-title', t.mTTTTitle);
    setTxt('m-ttt-desc', t.mTTTDesc);
    setTxt('m-math-title', t.mMathTitle);
    setTxt('m-math-desc', t.mMathDesc);
    setTxt('m-matches-title', t.mMatchesTitle);
    setTxt('m-matches-desc', t.mMatchesDesc);
    setTxt('m-pole-title', t.mPoleTitle);
    setTxt('m-pole-desc', t.mPoleDesc);
    setTxt('m-memory-title', t.mMemoryTitle);
    setTxt('m-memory-desc', t.mMemoryDesc);
    setTxt('m-guess-title', t.mGuessTitle);
    setTxt('m-guess-desc', t.mGuessDesc);
    setTxt('m-rps-title', t.mRPSTitle);
    setTxt('m-rps-desc', t.mRPSDesc);
    setTxt('m-mines-title', t.mMinesTitle);
    setTxt('m-mines-desc', t.mMinesDesc);
    setTxt('m-stroop-title', t.mStroopTitle);
    setTxt('m-stroop-desc', t.mStroopDesc);
    setTxt('m-arena-banner-title', t.mMathMazeTitle || 'Matematik Labirint');
    setTxt('m-mathmaze-title', t.mMathMazeTitle);
    setTxt('m-fruitmath-title', t.mFruitMathTitle);
    setTxt('m-ttt5-title', t.mTTT5Title || "X va O (5x5)");
    setTxt('m-ttt5-desc', t.mTTT5Desc);
    setTxt('m-battle5-title', t.mBattle5Title || "Dengiz Jangi (5x5)");
    setTxt('m-battle5-desc', t.mBattle5Desc);
    setTxt('m-chess-title', t.mChessTitle || "Shaxmat");
    setTxt('m-chess-desc', t.mChessDesc);

    // Game view headers and specific elements
    setTxt('mathmaze-header-title', t.mathMazeHeaderTitle);
    setTxt('lbl-maze-goal', t.mathMazeGoal);
    setTxt('lbl-maze-current', t.mathMazeCurrent);
    setTxt('lbl-maze-steps', t.mathMazeSteps);
    setTxt('lbl-maze-level', t.mathMazeLevel);
    setTxt('mathmaze-undo-btn', t.mathMazeUndo);
    setTxt('mathmaze-reset-btn', t.mathMazeReset);
    setTxt('mathmaze-next-btn', t.mathMazeNext);

    setTxt('fruitmath-header-title', t.fruitMathHeaderTitle);
    setTxt('lbl-fruit-lvl', t.fruitMathLevel);
    setTxt('fruit-submit-btn', t.fruitMathCheck);

    // Language Selector Button
    const langLabels = { uz: "🇺🇿 O'zbek", ru: "🇷🇺 Русский", en: "🇬🇧 English", tr: "🇹🇷 Türkçe" };
    setTxt('lang-btn', langLabels[this.lang]);

    ['uz', 'ru', 'en', 'tr'].forEach(c => {
      setTxt('check-' + c, (c === this.lang) ? '✔' : '');
    });

    // Global Mode Buttons & Back Buttons
    document.querySelectorAll('.lbl-vs-bot').forEach(b => b.textContent = t.btnVsBot);
    document.querySelectorAll('.lbl-vs-player').forEach(b => b.textContent = t.btnVsPlayer);
    document.querySelectorAll('.btn-back').forEach(b => b.textContent = t.back);

    // Battleship
    setTxt('bs-header-title', t.bsTitle);
    setTxt('bs-placement-title', t.bsHideShips);
    setTxt('bs-btn-auto', t.bsAutoPlace);
    setTxt('bs-btn-clear', t.bsClear);
    setTxt('bs-btn-start-battle', t.bsStartBattle);
    setTxt('bs-btn-rotate', Battleship.isHorizontal ? t.bsRotateHoriz : t.bsRotateVert);
    setTxt('bs-score-lbl-you', t.you);
    setTxt('bs-fleet-status-lbl', t.bsFleetStatus);
    setTxt('bs-target-radar-lbl', `🎯 ${t.bsTargetRadar}`);
    setTxt('bs-your-fleet-lbl', t.bsYourFleet);
    setTxt('bs-fleet-ships-desc', t.bsShipsCountDesc);
    setTxt('bs-btn-reposition', t.bsChangeFleet);
    setTxt('bs-opp-label', Battleship.mode === 'bot' ? t.enemy : t.opponent);

    // Battleship 5x5
    setTxt('bs5-header-title', t.bs5Title || "Dengiz Jangi (5x5)");
    setTxt('bs5-placement-title', t.bsHideShips);
    setTxt('bs5-btn-auto', t.bsAutoPlace);
    setTxt('bs5-btn-clear', t.bsClear);
    setTxt('bs5-btn-start-battle', t.bsStartBattle);
    if (typeof Battleship5 !== 'undefined') {
      setTxt('bs5-btn-rotate', Battleship5.isHorizontal ? t.bsRotateHoriz : t.bsRotateVert);
      setTxt('bs5-opp-label', Battleship5.mode === 'bot' ? t.enemy : t.opponent);
    }
    setTxt('bs5-score-lbl-you', t.you);
    setTxt('bs5-fleet-status-lbl', t.bs5FleetStatus || "FLOT (5x5)");
    setTxt('bs5-target-radar-lbl', `🎯 ${t.bs5TargetRadar || 'NISHON RADARI (5x5)'}`);
    setTxt('bs5-your-fleet-lbl', t.bs5YourFleet || "Sizning Flotingiz (5x5)");
    setTxt('bs5-fleet-ships-desc', t.bs5ShipsCountDesc || "1x(3), 1x(2), 2x(1) kemalar");
    setTxt('bs5-btn-reposition', t.bsChangeFleet);

    // Maze
    setTxt('maze-header-title', t.mazeTitle);
    setTxt('maze-moves-lbl', `🟡 ${t.you} (${t.mazeSteps || t.steps || 'Qadam'})`);
    setTxt('maze-stars-lbl', `✨ ${t.mazeStars || t.stars || 'Yulduz'}`);
    setTxt('maze-wins-lbl', `🏆 ${t.you}`);
    setTxt('maze-opp-lbl', (typeof MazeGame !== 'undefined' && MazeGame.mode === 'bot') ? `🤖 ${t.bot}` : `👤 ${t.opponent}`);

    // Tic-Tac-Toe
    setTxt('ttt-header-title', t.tttTitle);
    setTxt('ttt-draw-lbl', t.draw);
    setTxt('ttt-btn-new-round', t.newRound);
    if (TTT.mode === 'bot') {
      setTxt('ttt-lbl-x', `X (${t.you})`);
      setTxt('ttt-lbl-o', `O (${t.bot})`);
    } else {
      setTxt('ttt-lbl-x', `X (${t.you})`);
      setTxt('ttt-lbl-o', `O (${t.opponent})`);
    }

    // Tic-Tac-Toe 5x5
    setTxt('ttt5-header-title', t.ttt5Title || "X va O (5x5)");
    setTxt('ttt5-rule-note-txt', t.ttt5Rule || "G'alaba uchun: ketma-ket 4 ta belgi (gorizontal, vertikal yoki diagonal)");
    setTxt('ttt5-draw-lbl', t.draw);
    setTxt('ttt5-btn-new-round', t.newRound);
    if (typeof TTT5 !== 'undefined') {
      TTT5.updateLabels();
    }

    // Chess (Shaxmat)
    setTxt('chess-header-title', t.chessTitle || "Shaxmat (Chess)");
    setTxt('chess-settings-card-title', t.chessSettingsCardTitle || "⚙️ O'yin Sozlamalari");
    setTxt('chess-lbl-color', t.chessLblColor || "Rang:");
    setTxt('chess-lbl-diff', t.chessLblDiff || "Qiyinlik:");
    setTxt('chess-lbl-time', t.chessLblTime || "Vaqt:");
    setTxt('chess-tab-bot-txt', t.chessVsBot || "🤖 Botga qarshi");
    setTxt('chess-tab-local-txt', t.chessVsPlayer || "👥 2 O'yinchi");
    setTxt('chess-tab-online-txt', t.chessVsOnline || "🌐 Onlayn");
    setTxt('chess-color-w-txt', t.chessColorWhite ? t.chessColorWhite.replace('⚪ ', '') : "Oqlar");
    setTxt('chess-color-random-txt', t.chessColorRandom ? t.chessColorRandom.replace('🎲 ', '') : "Tasodifiy");
    setTxt('chess-color-b-txt', t.chessColorBlack ? t.chessColorBlack.replace('⚫ ', '') : "Qoralar");
    setTxt('chess-diff-easy', t.chessDiffEasy || "🟢 Oson");
    setTxt('chess-diff-medium', t.chessDiffMedium || "🟡 O'rta");
    setTxt('chess-diff-hard', t.chessDiffHard || "🔴 Qiyin");
    setTxt('chess-diff-master', t.chessDiffMaster || "🏆 Usta");
    setTxt('chess-btn-undo-txt', t.chessUndo ? t.chessUndo.replace('↩ ', '') : "Qaytarish");
    setTxt('chess-btn-flip-txt', t.chessFlip ? t.chessFlip.replace('🔄 ', '') : "Aylantirish");
    setTxt('chess-btn-new-txt', t.chessNewGame ? t.chessNewGame.replace('⚡ ', '') : "Yangi");
    setTxt('chess-btn-draw-txt', t.chessBtnDraw ? t.chessBtnDraw.replace('🤝 ', '') : "Durang");
    setTxt('chess-btn-resign-txt', t.chessBtnResign ? t.chessBtnResign.replace('🏳️ ', '') : "Taslim");
    setTxt('chess-btn-undo', t.chessUndo || "↩ Qaytarish");
    setTxt('chess-btn-flip', t.chessFlip || "🔄 Aylantirish");
    setTxt('chess-btn-new', t.chessNewGame || "Yangi O'yin");
    setTxt('chess-promote-title', t.chessPromoteTitle || "Piyodani almashtiring:");
    setTxt('chess-time-1m', t.chessTime1m || "⚡ 1 daq");
    setTxt('chess-time-3m', t.chessTime3m || "⚡ 3 daq");
    setTxt('chess-time-5m', t.chessTime5m || "⏱️ 5 daq");
    setTxt('chess-time-10m', t.chessTime10m || "⌛ 10 daq");
    setTxt('chess-time-unlimited', t.chessTimeUnlimited || "♾️ Cheksiz");
    setTxt('chess-lbl-white-clock', t.chessWhite || "Oqlar");
    setTxt('chess-lbl-black-clock', t.chessBlack || "Qoralar");
    if (typeof ChessGame !== 'undefined') {
      if (ChessGame.updateStatus) ChessGame.updateStatus();
      if (ChessGame.updatePlayerLabels) ChessGame.updatePlayerLabels();
      if (ChessGame.updateSettingsQuickSummary) ChessGame.updateSettingsQuickSummary();
      if (ChessGame.update2pModalStrings) ChessGame.update2pModalStrings();
      if (ChessGame.renderVsControls) ChessGame.renderVsControls();
    }
    this.update2pModalStrings();
    setTxt('chess-time-modal-title', t.chessTimeSelectTitle || "⏱️ Vaqt Nazorati");
    setTxt('chess-time-modal-desc', t.chessTimeSelectDesc || "O'yin uchun vaqtni tanlang (bir marta tanlanadi):");
    setTxt('chess-time-cancel-btn', t.cancel || "Bekor Qilish");

    // Speed Math
    setTxt('math-header-title', t.mathTitle);
    for (let i = 1; i <= 10; i++) {
      setTxt('math-tab-' + i, t['mathLvl' + i] || (t.mathLevel + ' ' + i));
    }
    setTxt('math-lbl-score', t.score);
    setTxt('math-lbl-streak', t.streak);
    setTxt('math-lbl-record', t.record);
    setTxt('math-btn-solution', t.seeSolution);

    // Guess
    setTxt('guess-header-title', t.guessTitle);
    setTxt('guess-tab-25', t.guess1to25);
    setTxt('guess-tab-50', t.guess1to50);
    setTxt('guess-lbl-tries', t.tries);
    setTxt('guess-lbl-range', t.searchRange);
    setTxt('guess-lbl-status', t.status);
    setTxt('guess-btn-restart', t.restart);

    // RPS
    setTxt('rps-header-title', t.rpsTitle);
    setTxt('rps-lbl-round', t.round);
    setTxt('rps-lbl-you-1', t.you);
    setTxt('rps-name-1', t.you);
    setTxt('rps-lbl-2', RPS.mode === 'bot' ? t.bot : t.opponent);
    setTxt('rps-name-2', RPS.mode === 'bot' ? t.bot : t.opponent);
    setTxt('rps-lbl-rock', t.rpsRock || t.rock);
    setTxt('rps-lbl-paper', t.rpsPaper || t.paper);
    setTxt('rps-lbl-scissors', t.rpsScissors || t.scissors);
    setTxt('rps-status-alert', t.rpsMakeChoice || 'Tanlovingizni bajaring!');

    // Multiplayer Modal
    setTxt('mp-modal-main-title', t.mpTitle);
    setTxt('mp-tab-id', t.mpTabId);
    setTxt('mp-tab-radar', t.mpTabRadar);
    setTxt('mp-tab-recent', t.mpTabRecent);
    setTxt('mp-id-desc-text', t.mpIdDesc);
    const mpIn = document.getElementById('mp-target-id-input');
    if (mpIn) mpIn.placeholder = t.mpInputPlaceholder;
    setTxt('btn-send-invite-txt', t.mpSendInvite);
    setTxt('mp-radar-desc-text', t.mpRadarDesc);
    setTxt('btn-radar-act', t.mpRadarSearch);
    setTxt('btn-mp-cancel', t.cancel);
    setTxt('m-incoming-title', t.mpIncomingTitle);
    setTxt('m-incoming-desc', t.mpIncomingDesc);
    setTxt('btn-incoming-accept', t.mpAccept);
    setTxt('btn-incoming-decline', t.mpDecline);

    // Maze
    if (typeof MazeGame !== 'undefined' && MazeGame.updateUIStrings) {
      MazeGame.updateUIStrings();
    }

    // Math (Tezkor Matematika)
    if (typeof MathGame !== 'undefined' && MathGame.updateUIStrings) {
      MathGame.updateUIStrings();
    }

    // Matches
    if (typeof MatchesGame !== 'undefined' && MatchesGame.updateUIStrings) {
      MatchesGame.updateUIStrings();
    }

    // Pole (Mo'jizalar maydoni)
    if (typeof PoleGame !== 'undefined' && PoleGame.updateUIStrings) {
      PoleGame.updateUIStrings();
    }

    // Memory
    if (typeof MemoryGame !== 'undefined' && MemoryGame.updateUIStrings) {
      MemoryGame.updateUIStrings();
    }

    // Multiplayer UI and connected peer banner
    if (typeof Multiplayer !== 'undefined') {
      if (Multiplayer.updateConnectedPeerUI) Multiplayer.updateConnectedPeerUI();
      if (Multiplayer.updateUIStrings) Multiplayer.updateUIStrings();
    }

    // Minesweeper
    setTxt('mines-header-title', t.minesHeaderTitle || 'Mina Qidiruvchi');
    setTxt('lbl-mines-mines', t.minesMines || 'MINALAR');
    setTxt('lbl-mines-time', t.minesTime || 'VAQT');
    if (typeof MinesGame !== 'undefined') {
      MinesGame.updateStatsUI();
      const hintEl = document.getElementById('mines-status-hint');
      if (hintEl && !MinesGame.gameOver && !MinesGame.gameWon) {
        hintEl.textContent = t.minesTapHint || "Bosish: ochish | Uzoq bosish: 🚩 bayroq";
      }
    }

    // Stroop Color Brain
    setTxt('stroop-header-title', t.stroopHeaderTitle || 'Rangli So\'zlar');
    setTxt('stroop-instruction-text', t.stroopRule || 'Matnni o\'qimang! So\'z qaysi rangda yozilgan bo\'lsa, o\'sha rangli tugmani bosing!');
    setTxt('stroop-mascot-txt', t.stroopFindTextColor || 'Matn rangini toping!');
    setTxt('lbl-color-red', t.colorRed || 'QIZIL');
    setTxt('lbl-color-green', t.colorGreen || 'YASHIL');
    setTxt('lbl-color-blue', t.colorBlue || 'KO\'K');
    setTxt('lbl-color-yellow', t.colorYellow || 'SARIQ');
    const stroopStartBtn = document.getElementById('stroop-start-btn');
    if (stroopStartBtn && (!StroopGame || !StroopGame.isPlaying)) {
      stroopStartBtn.textContent = `▶ ${t.stroopStart || 'Boshlash'}`;
    }
    if (typeof StroopGame !== 'undefined' && !StroopGame.isPlaying) {
      StroopGame.updateStatsUI();
    }

    // Math Maze (5x5 Pathfinding Puzzle)
    setTxt('mathmaze-header-title', t.mathMazeHeaderTitle || 'Matematik Labirint (100)');
    setTxt('lbl-maze-goal', t.mathMazeGoal || 'MAQSAD: 100');
    setTxt('lbl-maze-current', t.mathMazeCurrent || 'YIG\'INDI');
    setTxt('lbl-maze-steps', t.mathMazeSteps || 'QADAM');
    setTxt('lbl-maze-level', t.mathMazeLevel || 'BOSQICH');
    setTxt('mathmaze-undo-btn', t.mathMazeUndo || '1 Qadam Orqaga');
    setTxt('mathmaze-reset-btn', t.mathMazeReset || 'Boshidan Boshlash');
    setTxt('mathmaze-sol-btn', t.mathMazeSolution || 'Yechim');
    setTxt('mathmaze-next-btn', t.mathMazeNext || 'Keyingi Bosqich');
    const mathMazeHint = document.getElementById('mathmaze-status-hint');
    if (mathMazeHint && typeof MathMaze !== 'undefined' && !MathMaze.isFinished) {
      mathMazeHint.textContent = t.mathMazeRule || "Boshlang'ich katakdan boshlab faqat pastga ⬇️ va o'ngga ➡️ yuring!";
    }

    // Fruit Math
    setTxt('fruitmath-header-title', t.fruitMathHeaderTitle || 'Mevali Tenglamalar');
    setTxt('lbl-fruit-score', t.fruitMathScore || 'BALL');
    setTxt('lbl-fruit-streak', t.fruitMathStreak || 'SERIYA');
    setTxt('lbl-fruit-level', t.fruitMathLevel || 'BOSQICH');
    setTxt('fruit-check-btn', t.fruitMathCheck || 'Tekshirish');
    setTxt('fruit-next-btn', t.fruitMathNext || 'Keyingi ➜');
    const fruitInput = document.getElementById('fruit-answer-input');
    if (fruitInput) fruitInput.placeholder = t.fruitMathPlaceholder || 'Javobni kiriting';

    // Lang modal
    setTxt('lang-modal-title', t.langModalTitle);
    setTxt('lang-modal-desc', t.langModalDesc);
    setTxt('lang-modal-close', t.close);
  },

  openLangModal() {
    AudioEngine.tap();
    document.getElementById('lang-modal').classList.add('active');
  },
  closeLangModal() {
    document.getElementById('lang-modal').classList.remove('active');
  },

  goView(vName) {
    AudioEngine.tap();
    if (this.currentView === 'math' && vName !== 'math') MathGame.stop();
    if (this.currentView === 'matches' && vName !== 'matches') MatchesGame.stop();
    if (this.currentView === 'pole' && vName !== 'pole') { if (PoleGame && PoleGame.botTimeout) clearTimeout(PoleGame.botTimeout); }
    if (this.currentView === 'memory' && vName !== 'memory') MemoryGame.stop();
    if (this.currentView === 'maze' && vName !== 'maze') MazeGame.stopBot();
    if (this.currentView === 'stroop' && vName !== 'stroop') StroopGame.stopTimer();
    if (this.currentView === 'chess' && vName !== 'chess' && typeof ChessGame !== 'undefined') ChessGame.stop();

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById('view-' + vName);
    if (el) el.classList.add('active');
    this.currentView = vName;

    // Immediately snap viewport and containers to top (prevents games starting at bottom)
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    const appCont = document.getElementById('app-container');
    if (appCont) appCont.scrollTop = 0;
    if (el) el.scrollTop = 0;

    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      if (appCont) appCont.scrollTop = 0;
      if (el) el.scrollTop = 0;
    }, 30);

    // Toggle main app header and ID bar so games start cleanly at screen top
    const mainHeader = document.getElementById('main-header');
    const idBar = document.getElementById('player-id-bar');
    if (vName === 'menu') {
      if (mainHeader) mainHeader.style.display = 'flex';
      if (idBar) idBar.style.display = 'flex';
    } else {
      if (mainHeader) mainHeader.style.display = 'none';
      if (idBar) idBar.style.display = 'none';

      // Soft background music starts when entering any game
      if (AudioEngine.enabled && AudioEngine.musicEnabled && !AudioEngine.musicTimer) {
        AudioEngine.startMusic();
      }
    }

    if (vName === 'battleship') {
      if (Battleship.phase === 'battle') Battleship.renderBattleBoards();
      else Battleship.renderPlacementView();
    }
    else if (vName === 'maze') MazeGame.startNewMaze();
    else if (vName === 'math') MathGame.start();
    else if (vName === 'matches') MatchesGame.start();
    else if (vName === 'pole') PoleGame.start();
    else if (vName === 'memory') MemoryGame.start();
    else if (vName === 'guess') GuessNew.start();
    else if (vName === 'ttt') TTT.updateStatus();
    else if (vName === 'mines') MinesGame.start();
    else if (vName === 'stroop') StroopGame.start();
    else if (vName === 'mathmaze' && typeof MathMaze !== 'undefined') MathMaze.start();
    else if (vName === 'fruitmath' && typeof FruitGame !== 'undefined') FruitGame.start();
    else if (vName === 'battleship5' && typeof Battleship5 !== 'undefined') {
      if (Battleship5.phase === 'battle') Battleship5.renderBattleBoards();
      else Battleship5.renderPlacementView();
    }
    else if (vName === 'ttt5' && typeof TTT5 !== 'undefined') {
      TTT5.updateStatus();
    }
    else if (vName === 'chess' && typeof ChessGame !== 'undefined') {
      ChessGame.renderBoard();
      ChessGame.updateStatus();
      if (ChessGame.renderVsControls) ChessGame.renderVsControls();
    }
  },

  navigateTo(vName) {
    this.goView(vName);
  },

  showModal(icon, title, desc, onPrimary, btnText) {
    const t = I18N[this.lang] || I18N.uz;
    document.getElementById('m-icon').textContent = icon;
    document.getElementById('m-title').textContent = title;
    document.getElementById('m-desc').innerHTML = desc;
    const btn = document.getElementById('m-btn-primary');
    if (btn) {
      btn.textContent = btnText || t.ok || 'OK';
      btn.onclick = () => {
        App.closeModal();
        if (onPrimary) onPrimary();
      };
    }
    document.getElementById('generic-modal').classList.add('active');
  },

  closeModal() {
    AudioEngine.tap();
    document.getElementById('generic-modal').classList.remove('active');
  },

  showConfirmModal(icon, title, desc, onConfirm, confirmTxt, cancelTxt) {
    const t = I18N[this.lang] || I18N.uz;
    const iconEl = document.getElementById('c-icon');
    const titleEl = document.getElementById('c-title');
    const descEl = document.getElementById('c-desc');
    const confirmBtn = document.getElementById('c-btn-confirm');
    const cancelBtn = document.getElementById('c-btn-cancel');

    if (iconEl) iconEl.textContent = icon || '❓';
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.innerHTML = desc;
    if (confirmBtn) confirmBtn.textContent = confirmTxt || t.yes || "Ha";
    if (cancelBtn) cancelBtn.textContent = cancelTxt || t.cancel || "Bekor qilish";

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        App.closeConfirmModal();
        if (onConfirm) onConfirm();
      };
    }
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.add('active');
  },

  closeConfirmModal() {
    AudioEngine.tap();
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.remove('active');
  },

  showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  },

  toggleSearch() {
    AudioEngine.tap();
    const wrap = document.getElementById('poki-search-wrap');
    if (!wrap) return;
    wrap.classList.toggle('active');
    if (wrap.classList.contains('active')) {
      const input = document.getElementById('poki-search-input');
      if (input) input.focus();
    } else {
      this.filterGames('');
    }
  },

  filterGames(query) {
    const q = (query || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.poki-card');
    cards.forEach(card => {
      const data = (card.getAttribute('data-game') || '').toLowerCase();
      const text = card.textContent.toLowerCase();
      if (!q || data.includes(q) || text.includes(q)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  },

  /* 2-Player Universal Selection Modal (ID Connect, Online Radar, Local Play) */
  current2pGameKey: null,
  gamesCompletedCount: 0,
  adCountdownTimer: null,

  open2pModal(gameKey) {
    AudioEngine.tap();
    this.current2pGameKey = gameKey || 'chess';
    this.update2pModalStrings();
    const modal = document.getElementById('universal-2p-modal');
    if (modal) modal.classList.add('active');
  },

  close2pModal() {
    AudioEngine.tap();
    const modal = document.getElementById('universal-2p-modal');
    if (modal) modal.classList.remove('active');
  },

  on2pSelectOnlineId() {
    AudioEngine.tap();
    const game = this.current2pGameKey || 'chess';
    this.close2pModal();
    if (typeof Multiplayer !== 'undefined') {
      Multiplayer.openChallengeModal(game);
      Multiplayer.setMpTab('id');
      setTimeout(() => {
        const inp = document.getElementById('mp-target-id-input');
        if (inp) inp.focus();
      }, 200);
    }
  },

  on2pSelectOnlineRadar() {
    AudioEngine.tap();
    const game = this.current2pGameKey || 'chess';
    this.close2pModal();
    if (typeof Multiplayer !== 'undefined') {
      Multiplayer.openChallengeModal(game);
      Multiplayer.setMpTab('radar');
      Multiplayer.startRadarSearch();
    }
  },

  on2pSelectLocal() {
    AudioEngine.tap();
    const game = this.current2pGameKey || 'chess';
    this.close2pModal();
    if (game === 'chess' && typeof ChessGame !== 'undefined') {
      ChessGame.setMode('local');
    } else if (game === 'battleship' && typeof Battleship !== 'undefined') {
      Battleship.setMode('player');
    } else if (game === 'battleship5' && typeof Battleship5 !== 'undefined') {
      Battleship5.setMode('player');
    } else if (game === 'ttt' && typeof TTT !== 'undefined') {
      TTT.setMode('local');
    } else if (game === 'ttt5' && typeof TTT5 !== 'undefined') {
      TTT5.setMode('local');
    } else if (game === 'maze' && typeof MazeGame !== 'undefined') {
      MazeGame.setMode('player');
    } else if (game === 'rps' && typeof RPS !== 'undefined') {
      RPS.setMode('player');
    }
  },

  update2pModalStrings() {
    const t = (typeof I18N !== 'undefined' && I18N[this.lang]) || (typeof I18N !== 'undefined' && I18N.uz) || {};
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.textContent = val;
    };
    const titles = {
      chess: t.mChessTitle || "Shaxmat",
      battleship: t.mBattleTitle || "Dengiz Jangi",
      battleship5: t.mBattle5Title || "Dengiz Jangi (5x5)",
      ttt: t.mTTTTitle || "X va O",
      ttt5: t.mTTT5Title || "X va O (5x5)",
      maze: t.mMazeTitle || "Labirint",
      rps: t.mRPSTitle || "Tosh Qaychi Qog'oz"
    };
    const title = titles[this.current2pGameKey] || "";
    const suffix = title ? ` (${title})` : "";
    set('univ-2p-modal-title', (t.chess2pTitle || "2 O'yinchi") + suffix);
    set('univ-2p-modal-desc', t.chess2pDesc || "Raqib bilan o'ynash usulini tanlang:");
    set('univ-opt-id-title', t.chessOptId || "ID orqali bog'lanish");
    set('univ-opt-id-desc', t.chessOptIdDesc || "Do'stingizning ID raqamini kiritib chaqiruv yuboring");
    set('univ-opt-radar-title', t.chessOptRadar || "Onlayn qidiruv (Radar)");
    set('univ-opt-radar-desc', t.chessOptRadarDesc || "Faol onlayn o'yinchilarni qidirish va tezkor o'yin");
    set('univ-opt-local-title', t.chessOptLocal || "Bitta telefonda o'ynash");
    set('univ-opt-local-desc', t.chessOptLocalDesc || "Ikkala o'yinchi bitta qurilmada navbatma-navbat o'ynaydi");
    set('univ-2p-cancel-btn', t.cancel || "Bekor Qilish");
  },

  notifyGameCompleted() {
    this.gamesCompletedCount++;
    console.log("Game completed! Total finished count: " + this.gamesCompletedCount);

    // Call native Android AdMob Interstitial bridge
    if (typeof window !== 'undefined' && window.AndroidBridge && window.AndroidBridge.onGameFinished) {
      try {
        window.AndroidBridge.onGameFinished();
      } catch (e) {
        console.warn("AndroidBridge onGameFinished error:", e);
      }
    }

    // Web fallback: every 2 completed games show full-screen AdMob interstitial
    if (this.gamesCompletedCount >= 2) {
      this.gamesCompletedCount = 0;
      if (!window.AndroidBridge || !window.AndroidBridge.onGameFinished) {
        this.showAdInterstitial();
      }
    }
  },

  showAdInterstitial() {
    const modal = document.getElementById('admob-interstitial-modal');
    if (!modal) return;
    modal.classList.add('active');

    const closeBtn = document.getElementById('ad-interstitial-close-btn');
    let timeLeft = 3;
    if (closeBtn) {
      closeBtn.disabled = true;
      closeBtn.textContent = `⏳ ${timeLeft}s`;
    }
    if (this.adCountdownTimer) clearInterval(this.adCountdownTimer);
    this.adCountdownTimer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(this.adCountdownTimer);
        this.adCountdownTimer = null;
        if (closeBtn) {
          closeBtn.disabled = false;
          closeBtn.textContent = '✕ Yopish';
        }
      } else {
        if (closeBtn) closeBtn.textContent = `⏳ ${timeLeft}s`;
      }
    }, 1000);
  },

  closeAdInterstitial() {
    AudioEngine.tap();
    if (this.adCountdownTimer) {
      clearInterval(this.adCountdownTimer);
      this.adCountdownTimer = null;
    }
    const modal = document.getElementById('admob-interstitial-modal');
    if (modal) modal.classList.remove('active');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
