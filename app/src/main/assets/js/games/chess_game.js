/* Comprehensive Chess Game with Authentic Neo Vector Pieces, Varied Master AI, Color Selection & Dual Clocks */

const ChessOpeningBook = {
  // Initial position moves for White
  "": [
    { from: "e2", to: "e4", weight: 45 }, // King's Pawn
    { from: "d2", to: "d4", weight: 35 }, // Queen's Pawn
    { from: "c2", to: "c4", weight: 12 }, // English Opening
    { from: "g1", to: "f3", weight: 8 }   // Réti Opening
  ],
  // Responses to 1. e4
  "e2e4": [
    { from: "e7", to: "e5", weight: 36 }, // Open Game
    { from: "c7", to: "c5", weight: 34 }, // Sicilian Defense
    { from: "e7", to: "e6", weight: 15 }, // French Defense
    { from: "c7", to: "c6", weight: 10 }, // Caro-Kann Defense
    { from: "g8", to: "f6", weight: 5 }   // Alekhine's Defense
  ],
  // 1. e4 e5
  "e2e4 e7e5": [
    { from: "g1", to: "f3", weight: 75 }, // King's Knight
    { from: "f1", to: "c4", weight: 15 }, // Bishop's Opening
    { from: "d2", to: "d4", weight: 10 }  // Center Game
  ],
  // 1. e4 e5 2. Nf3
  "e2e4 e7e5 g1f3": [
    { from: "b8", to: "c6", weight: 75 }, // Nc6
    { from: "g8", to: "f6", weight: 20 }, // Petrov Defense
    { from: "d7", to: "d6", weight: 5 }   // Philidor Defense
  ],
  // 1. e4 e5 2. Nf3 Nc6
  "e2e4 e7e5 g1f3 b8c6": [
    { from: "f1", to: "c4", weight: 50 }, // Italian Game
    { from: "f1", to: "b5", weight: 40 }, // Ruy Lopez (Spanish)
    { from: "d2", to: "d4", weight: 10 }  // Scotch Game
  ],
  // Italian Game: 1. e4 e5 2. Nf3 Nc6 3. Bc4
  "e2e4 e7e5 g1f3 b8c6 f1c4": [
    { from: "f8", to: "c5", weight: 60 }, // Giuoco Piano
    { from: "g8", to: "f6", weight: 40 }  // Two Knights Defense
  ],
  // Ruy Lopez: 1. e4 e5 2. Nf3 Nc6 3. Bb5
  "e2e4 e7e5 g1f3 b8c6 f1b5": [
    { from: "a7", to: "a6", weight: 75 }, // Morphy Defense
    { from: "g8", to: "f6", weight: 25 }  // Berlin Defense
  ],
  // Sicilian: 1. e4 c5
  "e2e4 c7c5": [
    { from: "g1", to: "f3", weight: 75 }, // Open Sicilian
    { from: "b1", to: "c3", weight: 15 }, // Closed Sicilian
    { from: "c2", to: "c3", weight: 10 }  // Alapin
  ],
  "e2e4 c7c5 g1f3": [
    { from: "d7", to: "d6", weight: 45 },
    { from: "e7", to: "e6", weight: 30 },
    { from: "b8", to: "c6", weight: 25 }
  ],
  // French: 1. e4 e6
  "e2e4 e7e6": [
    { from: "d2", to: "d4", weight: 90 },
    { from: "d2", to: "d3", weight: 10 }
  ],
  "e2e4 e7e6 d2d4": [
    { from: "d7", to: "d5", weight: 95 }
  ],
  // Caro-Kann: 1. e4 c6
  "e2e4 c7c6": [
    { from: "d2", to: "d4", weight: 90 }
  ],
  "e2e4 c7c6 d2d4": [
    { from: "d7", to: "d5", weight: 95 }
  ],
  // 1. d4
  "d2d4": [
    { from: "d7", to: "d5", weight: 45 },
    { from: "g8", to: "f6", weight: 40 },
    { from: "e7", to: "e6", weight: 15 }
  ],
  // 1. d4 d5
  "d2d4 d7d5": [
    { from: "c2", to: "c4", weight: 75 }, // Queen's Gambit
    { from: "g1", to: "f3", weight: 15 },
    { from: "c1", to: "f4", weight: 10 }  // London System
  ],
  // Queen's Gambit: 1. d4 d5 2. c4
  "d2d4 d7d5 c2c4": [
    { from: "e7", to: "e6", weight: 60 }, // QGD
    { from: "c7", to: "c6", weight: 30 }, // Slav
    { from: "d5", to: "c4", weight: 10 }  // QGA
  ],
  // 1. d4 Nf6
  "d2d4 g8f6": [
    { from: "c2", to: "c4", weight: 80 },
    { from: "g1", to: "f3", weight: 20 }
  ],
  "d2d4 g8f6 c2c4": [
    { from: "g7", to: "g6", weight: 50 }, // King's Indian / Grunfeld
    { from: "e7", to: "e6", weight: 40 }, // Nimzo / Queen's Indian
    { from: "c7", to: "c5", weight: 10 }  // Benoni
  ],
  // 1. c4
  "c2c4": [
    { from: "e7", to: "e5", weight: 40 },
    { from: "c7", to: "c5", weight: 30 },
    { from: "g8", to: "f6", weight: 30 }
  ],
  // 1. Nf3
  "g1f3": [
    { from: "d7", to: "d5", weight: 50 },
    { from: "g8", to: "f6", weight: 40 },
    { from: "c7", to: "c5", weight: 10 }
  ]
};

const ChessGame = {
  game: null,
  mode: 'bot', // 'bot', 'local' (2 players on same device), or 'player' (online)
  difficulty: 'medium', // 'easy', 'medium', 'hard', 'master'
  timeLimitOption: '5m', // '1m', '3m', '5m', '10m', 'unlimited'
  timeLeftWhite: 300,
  timeLeftBlack: 300,
  clockInterval: null,
  userColorChoice: 'w', // 'w', 'random', or 'b'
  playerColor: 'w', // 'w' or 'b'
  isFlipped: false,
  selectedSquare: null,
  legalMovesForSelected: [],
  lastMove: null,
  pendingPromotionMove: null,
  isOver: false,
  isThinking: false,
  abortSearch: false,
  botTimer: null,
  moveHistoryList: [],

  pieceValues: { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 },

  // Positional Piece-Square Tables (White perspective)
  pst: {
    p: [
      [ 0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [15, 15, 25, 35, 35, 25, 15, 15],
      [ 5, 10, 20, 30, 30, 20, 10,  5],
      [ 0,  5, 15, 25, 25, 15,  5,  0],
      [ 5, -5,-10,  5,  5,-10, -5,  5],
      [ 5, 10, 10,-20,-20, 10, 10,  5],
      [ 0,  0,  0,  0,  0,  0,  0,  0]
    ],
    n: [
      [-50,-40,-30,-30,-30,-30,-40,-50],
      [-40,-20,  0,  5,  5,  0,-20,-40],
      [-30,  5, 15, 25, 25, 15,  5,-30],
      [-30, 10, 25, 30, 30, 25, 10,-30],
      [-30,  5, 20, 30, 30, 20,  5,-30],
      [-30, 10, 15, 20, 20, 15, 10,-30],
      [-40,-20,  5, 10, 10,  5,-20,-40],
      [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    b: [
      [-20,-10,-10,-10,-10,-10,-10,-20],
      [-10,  5,  0,  0,  0,  0,  5,-10],
      [-10, 10, 15, 20, 20, 15, 10,-10],
      [-10, 15, 15, 25, 25, 15, 15,-10],
      [-10, 10, 20, 25, 25, 20, 10,-10],
      [-10, 15, 15, 15, 15, 15, 15,-10],
      [-10,  5, 10,  5,  5, 10,  5,-10],
      [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    r: [
      [ 0,  0,  0,  5,  5,  0,  0,  0],
      [25, 30, 30, 30, 30, 30, 30, 25],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [ 0,  0,  5, 10, 10,  5,  0,  0]
    ],
    q: [
      [-20,-10,-10, -5, -5,-10,-10,-20],
      [-10,  0,  0,  0,  0,  0,  0,-10],
      [-10,  0,  5, 10, 10,  5,  0,-10],
      [ -5,  0, 10, 15, 15, 10,  0, -5],
      [  0,  0, 10, 15, 15, 10,  0, -5],
      [-10,  5, 10, 10, 10, 10,  5,-10],
      [-10,  0,  5,  0,  0,  0,  0,-10],
      [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    kMid: [
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-20,-30,-30,-40,-40,-30,-30,-20],
      [-10,-20,-20,-20,-20,-20,-20,-10],
      [ 20, 20,  0,  0,  0,  0, 20, 20],
      [ 20, 30, 10,  0,  0, 10, 30, 20]
    ],
    kEnd: [
      [-50,-40,-30,-20,-20,-30,-40,-50],
      [-30,-20,-10,  0,  0,-10,-20,-30],
      [-30,-10, 20, 30, 30, 20,-10,-30],
      [-30,-10, 30, 40, 40, 30,-10,-30],
      [-30,-10, 30, 40, 40, 30,-10,-30],
      [-30,-10, 20, 30, 30, 20,-10,-30],
      [-30,-30,  0,  0,  0,  0,-30,-30],
      [-50,-30,-30,-30,-30,-30,-30,-50]
    ]
  },

  init() {
    if (typeof Chess !== 'undefined') {
      this.game = new Chess();
    }
    const vsControls = document.getElementById('chess-vs-player-controls');
    if (vsControls) {
      vsControls.style.display = (this.mode === 'local') ? 'flex' : 'none';
    }
    this.updatePlayerLabels();
    this.updateSettingsQuickSummary();
    this.startNewGame(false);
  },

  t() {
    return (typeof I18N !== 'undefined' && I18N[App.lang]) || (typeof I18N !== 'undefined' && I18N.uz) || {};
  },

  toggleSettings(force) {
    AudioEngine.tap();
    const card = document.getElementById('chess-settings-card');
    const bar = document.getElementById('chess-quick-settings-bar');
    if (!card) return;

    const isVisible = (card.style.display !== 'none');
    const targetState = (typeof force === 'boolean') ? force : !isVisible;

    if (targetState) {
      card.style.display = 'block';
      if (bar) bar.style.display = 'none';
    } else {
      card.style.display = 'none';
      if (bar) bar.style.display = 'flex';
      this.updateSettingsQuickSummary();
    }
  },

  updateSettingsQuickSummary() {
    const summaryEl = document.getElementById('chess-quick-summary-txt');
    if (!summaryEl) return;
    const t = this.t();

    const colorNames = {
      w: t.chessColorWhite || '⚪ Oqlar',
      random: t.chessColorRandom || '🎲 Tasodifiy',
      b: t.chessColorBlack || '⚫ Qoralar'
    };
    const diffNames = {
      easy: t.chessDiffEasy || '🟢 Oson',
      medium: t.chessDiffMedium || "🟡 O'rta",
      hard: t.chessDiffHard || '🔴 Qiyin',
      master: t.chessDiffMaster || '🏆 Usta'
    };
    const timeNames = {
      '1m': '⚡ 1 daq',
      '3m': '⚡ 3 daq',
      '5m': '⏱️ 5 daq',
      '10m': '⌛ 10 daq',
      'unlimited': '♾️ Cheksiz'
    };

    const cTxt = colorNames[this.userColorChoice] || '⚪ Oqlar';
    const dTxt = (this.mode === 'bot') ? (diffNames[this.difficulty] || "🟡 O'rta") : '';
    const tTxt = timeNames[this.timeLimitOption] || '⏱️ 5 daq';

    if (this.mode === 'bot') {
      summaryEl.textContent = `${cTxt} • ${dTxt} • ${tTxt}`;
    } else {
      summaryEl.textContent = `${cTxt} • ${tTxt}`;
    }
  },

  updatePlayerLabels() {
    const t = this.t();
    const oppNameEl = document.getElementById('chess-opp-name');
    const oppAvatarEl = document.getElementById('chess-opp-avatar');
    const playerNameEl = document.getElementById('chess-player-name');
    const playerAvatarEl = document.getElementById('chess-player-avatar');
    const oppIcon = document.getElementById('chess-clock-icon-b');
    const playerIcon = document.getElementById('chess-clock-icon-w');

    const diffNames = {
      easy: t.chessDiffEasy ? t.chessDiffEasy.replace('🟢 ', '') : 'Oson',
      medium: t.chessDiffMedium ? t.chessDiffMedium.replace('🟡 ', '') : "O'rta",
      hard: t.chessDiffHard ? t.chessDiffHard.replace('🔴 ', '') : 'Qiyin',
      master: t.chessDiffMaster ? t.chessDiffMaster.replace('🏆 ', '') : 'Usta'
    };

    const bottomColor = this.isFlipped ? 'b' : 'w';
    const topColor = this.isFlipped ? 'w' : 'b';

    const playerColorLabel = (bottomColor === 'w') ? (t.chessWhite || 'Oqlar') : (t.chessBlack || 'Qoralar');
    const oppColorLabel = (topColor === 'w') ? (t.chessWhite || 'Oqlar') : (t.chessBlack || 'Qoralar');

    if (oppIcon) oppIcon.textContent = (topColor === 'w') ? '⚪' : '⚫';
    if (playerIcon) playerIcon.textContent = (bottomColor === 'w') ? '⚪' : '⚫';

    if (this.mode === 'bot') {
      if (oppNameEl) oppNameEl.textContent = `${t.chessBot || 'Bot'} (${diffNames[this.difficulty] || "O'rta"})`;
      if (oppAvatarEl) oppAvatarEl.textContent = '🤖';
      if (playerNameEl) playerNameEl.textContent = `${t.chessYou || 'Siz'} (${playerColorLabel})`;
      if (playerAvatarEl) playerAvatarEl.textContent = '👤';
    } else if (this.mode === 'local') {
      const p1 = t.player1 || "1-O'yinchi";
      const p2 = t.player2 || "2-O'yinchi";
      const bottomName = (bottomColor === 'w') ? p1 : p2;
      const topName = (topColor === 'w') ? p1 : p2;
      if (oppNameEl) oppNameEl.textContent = `${topName} (${oppColorLabel})`;
      if (oppAvatarEl) oppAvatarEl.textContent = '👥';
      if (playerNameEl) playerNameEl.textContent = `${bottomName} (${playerColorLabel})`;
      if (playerAvatarEl) playerAvatarEl.textContent = '👤';
    } else if (this.mode === 'player') {
      const cleanOpp = (typeof Multiplayer !== 'undefined' && (Multiplayer.connectedPeerId || Multiplayer.opponentId))
        ? String(Multiplayer.connectedPeerId || Multiplayer.opponentId).replace(/[^0-9]/g, '')
        : '';
      const oppId = cleanOpp ? `#${cleanOpp}` : (t.opponent || 'Raqib');
      if (oppNameEl) oppNameEl.textContent = `${oppId} (${oppColorLabel})`;
      if (oppAvatarEl) oppAvatarEl.textContent = '🌐';
      if (playerNameEl) playerNameEl.textContent = `${t.chessYou || 'Siz'} (${playerColorLabel})`;
      if (playerAvatarEl) playerAvatarEl.textContent = '👤';
    }
  },

  stop() {
    this.abortSearch = true;
    this.isThinking = false;
    if (this.botTimer) {
      clearTimeout(this.botTimer);
      this.botTimer = null;
    }
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  },

  setColorChoice(c) {
    AudioEngine.tap();
    this.userColorChoice = c;
    ['w', 'random', 'b'].forEach(col => {
      const btn = document.getElementById(`chess-color-${col}`);
      if (btn) btn.classList.toggle('active', col === c);
    });
    this.updateSettingsQuickSummary();
    this.startNewGame(false);
  },

  startNewGame(flip = false) {
    if (this.mode === 'player') {
      const isHost = (typeof Multiplayer !== 'undefined' && Multiplayer.isHost);
      if (typeof Multiplayer !== 'undefined') {
        Multiplayer.sendGameMove({ type: 'chess_restart' });
      }
      this.startMultiplayer(isHost);
      return;
    }

    this.stop();
    this.abortSearch = false;
    if (typeof Chess !== 'undefined') {
      this.game = new Chess();
    }
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.lastMove = null;
    this.pendingPromotionMove = null;
    this.isOver = false;
    this.isThinking = false;
    this.moveHistoryList = [];

    if (this.mode === 'local') {
      // In 2-player local mode, alternate colors across rounds:
      // Round 0: Player 1 White, Player 2 Black
      // Round 1: Player 1 Black, Player 2 White
      const isOddRound = (this.twoPlayerRoundCount % 2 === 1);
      this.playerColor = isOddRound ? 'b' : 'w';
      this.isFlipped = (this.playerColor === 'b');
    } else if (flip) {
      this.playerColor = (this.playerColor === 'w') ? 'b' : 'w';
      this.isFlipped = (this.playerColor === 'b');
    } else {
      if (this.userColorChoice === 'random') {
        this.playerColor = (Math.random() < 0.5) ? 'w' : 'b';
      } else if (this.userColorChoice === 'b') {
        this.playerColor = 'b';
      } else {
        this.playerColor = 'w';
      }
      this.isFlipped = (this.playerColor === 'b');
    }

    // Reset clocks according to chosen timeLimitOption
    this.resetClocks();

    this.updatePlayerLabels();
    this.updateSettingsQuickSummary();
    this.renderBoard();
    this.updateStatus();
    this.updateCaptured();
    this.renderHistory();
    this.updateClockUI();

    // Start clock timer
    this.startClock();

    // If player is Black and playing bot, bot plays White and moves first!
    if (this.mode === 'bot' && this.playerColor === 'b') {
      this.isThinking = true;
      this.updateStatus();
      this.botTimer = setTimeout(() => this.makeBotMove(), 350);
    }
  },

  promptNewGameWithTime() {
    AudioEngine.tap();
    const modal = document.getElementById('chess-time-select-modal');
    if (modal) {
      const curr = this.timeLimitOption || '5m';
      ['1m', '3m', '5m', '10m', 'unlimited'].forEach(o => {
        const btn = document.getElementById(`chess-modal-time-${o}`);
        if (btn) btn.classList.toggle('active', o === curr);
      });
      modal.classList.add('active');
    } else {
      this.startNewGame(false);
    }
  },

  applyNewGameWithTime(opt) {
    AudioEngine.tap();
    if (opt) {
      this.timeLimitOption = opt;
      ['1m', '3m', '5m', '10m', 'unlimited'].forEach(o => {
        const btn = document.getElementById(`chess-time-${o}`);
        if (btn) btn.classList.toggle('active', o === opt);
        const modalBtn = document.getElementById(`chess-modal-time-${o}`);
        if (modalBtn) modalBtn.classList.toggle('active', o === opt);
      });
    }
    this.closeTimeModal();

    if (this.mode === 'local') {
      this.twoPlayerRoundCount++;
    } else if (this.mode === 'player') {
      this.onlineRoundCount++;
      if (typeof Multiplayer !== 'undefined') {
        Multiplayer.sendGameMove({
          type: 'chess_sync_start',
          timeLimitOption: this.timeLimitOption,
          roundIndex: this.onlineRoundCount
        });
        Multiplayer.sendGameMove({ type: 'chess_restart' });
      }
      const isHost = (typeof Multiplayer !== 'undefined' && Multiplayer.isHost);
      this.startMultiplayer(isHost);
      return;
    }
    this.startNewGame(false);
  },

  closeTimeModal() {
    AudioEngine.tap();
    const modal = document.getElementById('chess-time-select-modal');
    if (modal) modal.classList.remove('active');
  },

  setTimeLimit(opt) {
    AudioEngine.tap();
    this.timeLimitOption = opt;
    ['1m', '3m', '5m', '10m', 'unlimited'].forEach(o => {
      const btn = document.getElementById(`chess-time-${o}`);
      if (btn) btn.classList.toggle('active', o === opt);
    });
    this.updateSettingsQuickSummary();
    if (this.mode === 'player') {
      if (typeof Multiplayer !== 'undefined') {
        Multiplayer.sendGameMove({ type: 'chess_sync_start', timeLimitOption: opt });
      }
      this.resetClocks();
      this.updateClockUI();
    } else {
      this.promptNewGameWithTime();
    }
  },

  resetClocks() {
    const times = { '1m': 60, '3m': 180, '5m': 300, '10m': 600, 'unlimited': 999999 };
    const seconds = times[this.timeLimitOption] || 300;
    this.timeLeftWhite = seconds;
    this.timeLeftBlack = seconds;
  },

  startClock() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.timeLimitOption === 'unlimited') return;

    this.clockInterval = setInterval(() => {
      if (this.isOver || !this.game) return;

      const turn = this.game.turn();
      if (turn === 'w') {
        this.timeLeftWhite--;
        if (this.timeLeftWhite <= 0) {
          this.timeLeftWhite = 0;
          if (this.mode === 'player' && this.playerColor === 'w') {
            if (typeof Multiplayer !== 'undefined') {
              Multiplayer.sendGameMove({ type: 'chess_timeout', color: 'w' });
            }
          }
          this.handleTimeOut('w');
        }
      } else {
        this.timeLeftBlack--;
        if (this.timeLeftBlack <= 0) {
          this.timeLeftBlack = 0;
          if (this.mode === 'player' && this.playerColor === 'b') {
            if (typeof Multiplayer !== 'undefined') {
              Multiplayer.sendGameMove({ type: 'chess_timeout', color: 'b' });
            }
          }
          this.handleTimeOut('b');
        }
      }
      this.updateClockUI();
    }, 1000);
  },

  updateClockUI() {
    const elW = document.getElementById('chess-time-val-w');
    const elB = document.getElementById('chess-time-val-b');
    const boxW = document.getElementById('chess-clock-box-w');
    const boxB = document.getElementById('chess-clock-box-b');
    if (!elW || !elB) return;

    if (this.timeLimitOption === 'unlimited') {
      elW.textContent = '♾️';
      elB.textContent = '♾️';
      if (boxW) boxW.classList.remove('active', 'low-time');
      if (boxB) boxB.classList.remove('active', 'low-time');
      return;
    }

    const fmt = s => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    // Correctly assign clocks: bottom strip is the player at bottom, top strip is opponent at top!
    const bottomColor = this.isFlipped ? 'b' : 'w';
    const topColor = this.isFlipped ? 'w' : 'b';
    const bottomTime = (bottomColor === 'w') ? this.timeLeftWhite : this.timeLeftBlack;
    const topTime = (topColor === 'w') ? this.timeLeftWhite : this.timeLeftBlack;

    elW.textContent = fmt(bottomTime); // elW is in bottom strip
    elB.textContent = fmt(topTime);    // elB is in top strip

    const turn = this.game ? this.game.turn() : 'w';
    if (boxW) {
      boxW.classList.toggle('active', turn === bottomColor && !this.isOver);
      boxW.classList.toggle('low-time', bottomTime <= 30);
    }
    if (boxB) {
      boxB.classList.toggle('active', turn === topColor && !this.isOver);
      boxB.classList.toggle('low-time', topTime <= 30);
    }
  },

  handleTimeOut(colorLost) {
    this.isOver = true;
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
    const t = this.t();

    let isWinner = false;
    if (this.mode === 'bot' || this.mode === 'player') {
      isWinner = (colorLost !== this.playerColor);
    } else {
      isWinner = true;
    }

    if (isWinner) {
      AudioEngine.win();
      Confetti.fire(75);
    } else {
      AudioEngine.error();
    }

    const winner = colorLost === 'w' ? (t.chessBlack || "Qoralar") : (t.chessWhite || "Oqlar");
    let desc = '';
    if (this.mode === 'player') {
      desc = isWinner ? (t.chessTimeWin || "Raqibning vaqti tugadi. Siz g'alaba qozondingiz! 🏆") : (t.chessTimeLose || "Vaqtingiz tugadi. Raqib g'alaba qozondi!");
    } else {
      desc = `${winner} ${t.youWin || "vaqt bo'yicha g'alaba qozondi!"}`;
    }

    App.showModal(
      '⌛',
      t.chessTimeOut || "Vaqt Tugadi!",
      desc,
      () => {
        if (this.mode === 'player') {
          if (typeof Multiplayer !== 'undefined') {
            Multiplayer.sendGameMove({ type: 'chess_restart' });
          }
          const isHost = (typeof Multiplayer !== 'undefined' && Multiplayer.isHost);
          this.startMultiplayer(isHost);
        } else {
          this.startNewGame(false);
        }
      }
    );
  },

  open2pModal() {
    AudioEngine.tap();
    // If already paired with an online opponent, challenge them directly
    if (typeof Multiplayer !== 'undefined' && Multiplayer.connectedPeerId) {
      const t = this.t();
      Multiplayer.openChallengeModal('chess', t.chessTitle || 'Shaxmat');
      return;
    }
    const modal = document.getElementById('chess-2p-modal');
    if (modal) {
      this.update2pModalStrings();
      modal.classList.add('active');
    }
  },

  close2pModal() {
    AudioEngine.tap();
    const modal = document.getElementById('chess-2p-modal');
    if (modal) modal.classList.remove('active');
  },

  openOnlineWithId() {
    AudioEngine.tap();
    this.close2pModal();
    const t = this.t();
    if (typeof Multiplayer !== 'undefined') {
      Multiplayer.openChallengeModal('chess', t.chessTitle || 'Shaxmat');
      Multiplayer.setMpTab('id');
      setTimeout(() => {
        const inp = document.getElementById('mp-target-id-input');
        if (inp) {
          inp.focus();
        }
      }, 200);
    }
  },

  openOnlineRadar() {
    AudioEngine.tap();
    this.close2pModal();
    const t = this.t();
    if (typeof Multiplayer !== 'undefined') {
      Multiplayer.openChallengeModal('chess', t.chessTitle || 'Shaxmat');
      Multiplayer.setMpTab('radar');
      Multiplayer.startRadarSearch();
    }
  },

  setLocalModeFromModal() {
    AudioEngine.tap();
    this.close2pModal();
    this.setMode('local');
  },

  openOnlineChallenge() {
    AudioEngine.tap();
    const t = this.t();
    if (typeof Multiplayer !== 'undefined') {
      Multiplayer.openChallengeModal('chess', t.chessTitle || 'Shaxmat');
    }
  },

  update2pModalStrings() {
    const t = this.t();
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.textContent = val;
    };
    set('chess-2p-modal-title', t.chess2pTitle || "2 O'yinchi (Shaxmat)");
    set('chess-2p-modal-desc', t.chess2pDesc || "Raqib bilan o'ynash usulini tanlang:");
    set('chess-opt-id-title', t.chessOptId || "ID orqali bog'lanish");
    set('chess-opt-id-desc', t.chessOptIdDesc || "Do'stingizning ID raqamini kiritib chaqiruv yuboring");
    set('chess-opt-radar-title', t.chessOptRadar || "Onlayn qidiruv (Radar)");
    set('chess-opt-radar-desc', t.chessOptRadarDesc || "Faol onlayn o'yinchilarni qidirish va tezkor o'yin");
    set('chess-opt-local-title', t.chessOptLocal || "Bitta telefonda o'ynash");
    set('chess-opt-local-desc', t.chessOptLocalDesc || "Ikkala o'yinchi bitta qurilmada navbatma-navbat o'ynaydi");
    set('chess-2p-cancel-btn', t.cancel || "Bekor Qilish");
  },

  renderVsControls() {
    const vsControls = document.getElementById('chess-vs-player-controls');
    if (!vsControls) return;
    const t = this.t();

    if (this.mode === 'local') {
      vsControls.style.display = 'block';
      vsControls.innerHTML = `
        <div class="chess-mode-badge-strip">
          <div class="chess-badge-info">
            <span class="chess-badge-icon">📱</span>
            <span>${t.chessLocalModeBadge || "1 Telefonda 2 O'yinchi"}</span>
          </div>
          <button class="chess-badge-action-btn" onclick="ChessGame.open2pModal()">
            ${t.chessOnlineBtn || "🌐 Onlayn o'ynash (ID / Qidiruv)"}
          </button>
        </div>
      `;
    } else if (this.mode === 'player') {
      vsControls.style.display = 'block';
      const cleanOpp = (typeof Multiplayer !== 'undefined' && (Multiplayer.connectedPeerId || Multiplayer.opponentId))
        ? String(Multiplayer.connectedPeerId || Multiplayer.opponentId).replace(/[^0-9]/g, '')
        : '';
      const oppStr = cleanOpp ? `#${cleanOpp}` : (t.opponent || 'Raqib');
      vsControls.innerHTML = `
        <div class="chess-mode-badge-strip online">
          <div class="chess-badge-info">
            <span class="online-dot" style="background:#10b981; box-shadow:0 0 6px #10b981;"></span>
            <span>🌐 ${oppStr}</span>
          </div>
          <button class="chess-badge-action-btn" onclick="ChessGame.openOnlineChallenge()">
            ${t.chessSwitchOppBtn || "🔍 Raqib almashtirish"}
          </button>
        </div>
      `;
    } else {
      vsControls.style.display = 'none';
      vsControls.innerHTML = '';
    }
  },

  setMode(m) {
    AudioEngine.tap();
    if (m === 'online') {
      const t = this.t();
      if (typeof Multiplayer !== 'undefined') {
        Multiplayer.openChallengeModal('chess', t.chessTitle || 'Shaxmat');
      }
      return;
    }

    this.mode = m; // 'bot' or 'local'
    const tabBot = document.getElementById('chess-tab-bot');
    const tabLocal = document.getElementById('chess-tab-local');
    const tabOnline = document.getElementById('chess-tab-online');

    if (tabBot) tabBot.classList.toggle('active', m === 'bot');
    if (tabLocal) tabLocal.classList.toggle('active', m === 'local');
    if (tabOnline) tabOnline.classList.remove('active');

    const diffBox = document.getElementById('chess-difficulty-bar');
    if (diffBox) {
      diffBox.style.display = (m === 'bot') ? 'flex' : 'none';
    }

    const colorBox = document.getElementById('chess-color-select-bar');
    if (colorBox) {
      colorBox.style.display = (m === 'bot') ? 'flex' : 'none';
    }

    this.renderVsControls();

    const undoBtn = document.getElementById('chess-btn-undo');
    if (undoBtn) {
      undoBtn.style.display = 'flex';
    }

    this.updatePlayerLabels();
    this.updateSettingsQuickSummary();
    this.startNewGame(false);
  },

  startMultiplayer(isHost) {
    this.stop();
    this.mode = 'player';
    this.isOver = false;
    this.isThinking = false;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.lastMove = null;
    this.pendingPromotionMove = null;
    this.moveHistoryList = [];

    // UI tab updates
    const tabBot = document.getElementById('chess-tab-bot');
    const tabLocal = document.getElementById('chess-tab-local');
    const tabOnline = document.getElementById('chess-tab-online');
    if (tabBot) tabBot.classList.remove('active');
    if (tabLocal) tabLocal.classList.remove('active');
    if (tabOnline) tabOnline.classList.add('active');

    // Controls visibility
    const diffBox = document.getElementById('chess-difficulty-bar');
    if (diffBox) diffBox.style.display = 'none';

    const colorBox = document.getElementById('chess-color-select-bar');
    if (colorBox) colorBox.style.display = 'none';

    this.renderVsControls();

    // Ensure all action buttons (Undo, Flip, New Game, Draw, Resign) remain visible in unified action bar
    const undoBtn = document.getElementById('chess-btn-undo');
    if (undoBtn) undoBtn.style.display = 'inline-flex';

    // Host is White (bottom), Guest is Black (bottom) on even rounds; alternate on odd rounds
    const isRoundSwapped = (this.onlineRoundCount % 2 === 1);
    const amIWhite = isHost ? !isRoundSwapped : isRoundSwapped;
    this.playerColor = amIWhite ? 'w' : 'b';
    this.isFlipped = !amIWhite;

    if (typeof Chess !== 'undefined') {
      this.game = new Chess();
    }

    this.resetClocks();
    this.updatePlayerLabels();
    this.updateSettingsQuickSummary();
    this.renderBoard();
    this.updateStatus();
    this.updateCaptured();
    this.renderHistory();
    this.updateClockUI();
    this.startClock();

    const t = this.t();
    if (isHost) {
      const syncData = {
        type: 'chess_sync_start',
        timeLimitOption: this.timeLimitOption,
        fen: this.game ? this.game.fen() : null
      };
      if (typeof Multiplayer !== 'undefined') {
        Multiplayer.sendGameMove(syncData);
        setTimeout(() => Multiplayer.sendGameMove(syncData), 250);
      }
      App.showToast(`${t.yourTurn || "Sizning navbatingiz"} ⚪ (${t.chessWhite || "Oqlar"})`);
    } else {
      App.showToast(`${t.turnOpp || "Raqib navbati"} ⚪ (${t.chessWhite || "Oqlar"})`);
    }
  },

  handleRemoteMove(data) {
    if (!data || !data.type) return;

    if (data.type === 'chess_sync_start') {
      if (typeof data.roundIndex === 'number') {
        this.onlineRoundCount = data.roundIndex;
      }
      if (this.mode !== 'player') {
        this.startMultiplayer(false);
      }
      if (data.timeLimitOption && data.timeLimitOption !== this.timeLimitOption) {
        this.timeLimitOption = data.timeLimitOption;
        ['1m', '3m', '5m', '10m', 'unlimited'].forEach(o => {
          const btn = document.getElementById(`chess-time-${o}`);
          if (btn) btn.classList.toggle('active', o === this.timeLimitOption);
        });
        this.resetClocks();
        this.updateClockUI();
      }
      if (data.fen && this.game && this.game.fen() !== data.fen) {
        this.game.load(data.fen);
        this.renderBoard();
        this.updateStatus();
      }
      return;
    }

    if (data.type === 'chess_move') {
      if (this.mode !== 'player') {
        this.startMultiplayer(false);
      }
      if (!this.game) return;

      let res = null;
      try {
        res = this.game.move(data.move);
      } catch (e) {
        res = null;
      }

      if (!res && data.fen) {
        this.game.load(data.fen);
      }

      const hist = this.game.history({ verbose: true });
      this.lastMove = res || (hist.length > 0 ? hist[hist.length - 1] : null);
      this.selectedSquare = null;
      this.legalMovesForSelected = [];

      if (typeof data.timeW === 'number') this.timeLeftWhite = data.timeW;
      if (typeof data.timeB === 'number') this.timeLeftBlack = data.timeB;

      try {
        if (res && res.captured) {
          if (AudioEngine.chessCapture) AudioEngine.chessCapture();
          else if (AudioEngine.match) AudioEngine.match();
          else AudioEngine.tap();
        } else {
          AudioEngine.tap();
        }
      } catch (e) {
        console.warn('Audio capture error:', e);
      }

      this.updateMoveHistoryList();
      this.renderBoard();
      this.updateStatus();
      this.updateCaptured();
      this.renderHistory();
      this.updateClockUI();

      this.checkGameOver();
      return;
    }

    if (data.type === 'chess_draw_offer') {
      const t = this.t();
      AudioEngine.tap();
      App.showConfirmModal(
        '🤝',
        t.chessOfferDrawTitle || "Durang taklifi",
        `<b>${t.opponent || "Raqib"}</b> ${t.chessOfferDrawDesc || "durang taklif qildi"}.<br><br>${t.acceptDrawPrompt || "Durangga rozimisiz?"}`,
        () => {
          if (typeof Multiplayer !== 'undefined') {
            Multiplayer.sendGameMove({ type: 'chess_draw_accept' });
          }
          this.endGameByDrawOnline();
        },
        t.yes || "Ha, durang",
        t.no || "Yo'q, davom etamiz",
        () => {
          if (typeof Multiplayer !== 'undefined') {
            Multiplayer.sendGameMove({ type: 'chess_draw_decline' });
          }
        }
      );
      return;
    }

    if (data.type === 'chess_draw_accept') {
      this.endGameByDrawOnline();
      return;
    }

    if (data.type === 'chess_draw_decline') {
      const t = this.t();
      App.showToast(t.chessDrawDeclined || "Raqib durang taklifini rad etdi!");
      return;
    }

    if (data.type === 'chess_resign') {
      this.endGameByResignOnline(true);
      return;
    }

    if (data.type === 'chess_timeout') {
      this.handleTimeOut(data.color);
      return;
    }

    if (data.type === 'chess_restart') {
      const isHost = (typeof Multiplayer !== 'undefined' && Multiplayer.isHost);
      this.startMultiplayer(isHost);
      return;
    }

    if (data.type === 'chess_undo') {
      if (this.game) {
        this.game.undo();
        const hist = this.game.history({ verbose: true });
        this.lastMove = hist.length > 0 ? hist[hist.length - 1] : null;
        this.selectedSquare = null;
        this.legalMovesForSelected = [];
        this.updateMoveHistoryList();
        this.renderBoard();
        this.updateStatus();
        this.updateCaptured();
        this.renderHistory();
        this.updateClockUI();
        App.showToast(this.t().chessUndo || "↩ Qaytarildi");
      }
      return;
    }
  },

  setDifficulty(level) {
    AudioEngine.tap();
    this.difficulty = level;
    ['easy', 'medium', 'hard', 'master'].forEach(l => {
      const btn = document.getElementById(`chess-diff-${l}`);
      if (btn) btn.classList.toggle('active', l === level);
    });
    const t = this.t();
    const names = {
      easy: t.chessDiffEasy || 'Oson',
      medium: t.chessDiffMedium || "O'rta",
      hard: t.chessDiffHard || 'Qiyin',
      master: t.chessDiffMaster || 'Usta'
    };
    if (App.showToast) App.showToast(`${t.chessLblDiff || "Daraja"}: ${names[level]}`);
    this.updatePlayerLabels();
    this.updateSettingsQuickSummary();
    this.startNewGame(false);
  },

  flipBoard() {
    AudioEngine.tap();
    this.isFlipped = !this.isFlipped;
    this.renderBoard();
    this.updateClockUI();
    this.updateCaptured();
    this.updatePlayerLabels();
  },

  undoMove() {
    if (this.isOver || this.isThinking || !this.game) return;
    AudioEngine.tap();

    if (this.mode === 'player') {
      if (typeof Multiplayer !== 'undefined') {
        Multiplayer.sendGameMove({ type: 'chess_undo' });
      }
      this.game.undo();
    } else if (this.mode === 'bot') {
      // In bot mode: if it is player's turn, undo both the bot's move and the player's move
      if (this.game.turn() === this.playerColor) {
        this.game.undo();
        this.game.undo();
      } else {
        this.game.undo();
      }
    } else {
      this.game.undo();
    }

    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    const hist = this.game.history({ verbose: true });
    this.lastMove = hist.length > 0 ? hist[hist.length - 1] : null;
    this.updateMoveHistoryList();
    this.renderBoard();
    this.updateStatus();
    this.updateCaptured();
    this.renderHistory();
    this.updateClockUI();
  },

  offerDraw() {
    if (this.isOver || !this.game) return;
    AudioEngine.tap();
    const t = this.t();

    if (this.mode === 'player') {
      App.showConfirmModal(
        '🤝',
        t.chessOfferDrawTitle || "Durang taklif qilish",
        t.chessSendDrawConfirm || "Raqibga durang taklifini yuborishni xohlaysizmi?",
        () => {
          if (typeof Multiplayer !== 'undefined') {
            Multiplayer.sendGameMove({ type: 'chess_draw_offer' });
          }
          App.showToast(t.chessDrawSent || "🤝 Durang taklifi raqibga yuborildi...");
        },
        t.yes || "Ha, yuborish",
        t.cancel || "Bekor qilish"
      );
      return;
    }

    if (this.mode === 'local') {
      const turn = this.game.turn();
      const offering = (turn === 'w') ? (t.chessWhite || "Oqlar") : (t.chessBlack || "Qoralar");
      const opponent = (turn === 'w') ? (t.chessBlack || "Qoralar") : (t.chessWhite || "Oqlar");

      App.showConfirmModal(
        '🤝',
        t.chessOfferDrawTitle || "Durang taklif qilish",
        `<b>${offering}</b> ${t.chessOfferDrawDesc || "durang taklif qildi"}.<br><br><b>${opponent}</b>, durangga rozimisiz?`,
        () => {
          this.endGameByDraw();
        },
        t.yes || "Ha, durang",
        t.no || "Yo'q, davom etamiz"
      );
    } else {
      // In bot mode
      const evalScore = this.evaluateBoard();
      if (Math.abs(evalScore) <= 150) {
        App.showModal(
          '🤝',
          t.chessDraw || "Durang!",
          t.chessBotDrawAccept || "🤖 Bot durang taklifingizga rozi bo'ldi!",
          () => this.endGameByDraw()
        );
      } else {
        App.showToast(t.chessBotDrawDecline || "🤖 Bot taklifni rad etdi, kurash davom etadi!");
      }
    }
  },

  endGameByDraw() {
    this.isOver = true;
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
    AudioEngine.tap();
    const t = this.t();

    this.moveHistoryList.push("½ - ½");
    this.renderHistory();

    const dot = document.getElementById('chess-turn-dot');
    const msg = document.getElementById('chess-status-msg');
    if (dot) dot.textContent = '🤝';
    if (msg) msg.textContent = t.chessDraw || "Durang qayd etildi!";

    App.showModal(
      '🤝',
      t.chessDraw || "Durang!",
      t.chessOfferDrawAgreed || "O'yinchilar kelishuvi bilan durang qayd etildi (½ - ½)!",
      () => this.startNewGame(false)
    );
  },

  endGameByDrawOnline() {
    this.isOver = true;
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
    AudioEngine.tap();
    const t = this.t();

    this.moveHistoryList.push("½ - ½");
    this.renderHistory();

    const dot = document.getElementById('chess-turn-dot');
    const msg = document.getElementById('chess-status-msg');
    if (dot) dot.textContent = '🤝';
    if (msg) msg.textContent = t.chessDraw || "Durang qayd etildi!";

    App.showModal(
      '🤝',
      t.chessDraw || "Durang!",
      t.chessOfferDrawAgreed || "O'yinchilar kelishuvi bilan durang qayd etildi (½ - ½)!",
      () => {
        if (typeof Multiplayer !== 'undefined') {
          Multiplayer.sendGameMove({ type: 'chess_restart' });
        }
        const isHost = (typeof Multiplayer !== 'undefined' && Multiplayer.isHost);
        this.startMultiplayer(isHost);
      }
    );
  },

  resignGame() {
    if (this.isOver || !this.game) return;
    AudioEngine.tap();
    const t = this.t();

    if (this.mode === 'player') {
      App.showConfirmModal(
        '🏳️',
        t.chessResignConfirmTitle || "Taslim bo'lish",
        t.chessResignConfirmDesc || "Haqiqatan ham taslim bo'lishni (yutqazishni) xohlaysizmi?",
        () => {
          if (typeof Multiplayer !== 'undefined') {
            Multiplayer.sendGameMove({ type: 'chess_resign', color: this.playerColor });
          }
          this.endGameByResignOnline(false);
        },
        t.chessBtnResign ? t.chessBtnResign.replace('🏳️ ', '') : (t.yes || "Ha"),
        t.cancel || "Bekor qilish"
      );
      return;
    }

    if (this.mode === 'local') {
      const turn = this.game.turn();
      const resigning = (turn === 'w') ? (t.chessWhite || "Oqlar") : (t.chessBlack || "Qoralar");
      const winner = (turn === 'w') ? (t.chessBlack || "Qoralar") : (t.chessWhite || "Oqlar");

      App.showConfirmModal(
        '🏳️',
        t.chessResignConfirmTitle || "Taslim bo'lish",
        `<b>${resigning}</b>: ${t.chessResignConfirmDesc || "Haqiqatan ham taslim bo'lishni (yutqazishni) xohlaysizmi?"}`,
        () => {
          this.endGameByResign(turn, winner, resigning);
        },
        t.chessBtnResign ? t.chessBtnResign.replace('🏳️ ', '') : (t.yes || "Ha"),
        t.cancel || "Bekor qilish"
      );
    } else {
      // In bot mode
      App.showConfirmModal(
        '🏳️',
        t.chessResignConfirmTitle || "Taslim bo'lish",
        t.chessResignConfirmDesc || "Haqiqatan ham taslim bo'lishni xohlaysizmi?",
        () => {
          this.isOver = true;
          if (this.clockInterval) clearInterval(this.clockInterval);
          if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
          AudioEngine.error();
          const dot = document.getElementById('chess-turn-dot');
          const msg = document.getElementById('chess-status-msg');
          if (dot) dot.textContent = '🏳️';
          if (msg) msg.textContent = "🤖 Bot g'alaba qozondi!";
          App.showModal(
            '🤖',
            t.gameOver || "O'yin tugadi",
            `Siz taslim bo'ldingiz. 🤖 Bot g'alaba qozondi!`,
            () => this.startNewGame(false)
          );
        },
        t.chessBtnResign ? t.chessBtnResign.replace('🏳️ ', '') : "Taslim bo'lish",
        t.cancel || "Bekor qilish"
      );
    }
  },

  endGameByResign(colorResigned, winner, resigning) {
    this.isOver = true;
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
    AudioEngine.win();
    Confetti.fire(100);
    const t = this.t();

    const resultScore = (colorResigned === 'w') ? "0 - 1" : "1 - 0";
    this.moveHistoryList.push(resultScore);
    this.renderHistory();

    const dot = document.getElementById('chess-turn-dot');
    const msg = document.getElementById('chess-status-msg');
    if (dot) dot.textContent = '👑';
    if (msg) msg.textContent = `${winner} ${t.youWin || "g'alaba qozondi!"}`;

    App.showModal(
      '👑',
      t.gameOver || "O'yin tugadi",
      `<b>${resigning}</b> ${t.chessResignedMsg || "taslim bo'ldi."}<br><br>🏆 <b>${winner}</b> ${t.youWin || "g'alaba qozondi!"} (${resultScore})`,
      () => this.startNewGame(false)
    );
  },

  endGameByResignOnline(iWon) {
    this.isOver = true;
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
    const t = this.t();

    const dot = document.getElementById('chess-turn-dot');
    const msg = document.getElementById('chess-status-msg');

    const resultScore = (this.playerColor === 'w') ? (iWon ? "1 - 0" : "0 - 1") : (iWon ? "0 - 1" : "1 - 0");
    this.moveHistoryList.push(resultScore);
    this.renderHistory();

    if (iWon) {
      AudioEngine.win();
      Confetti.fire(100);
      if (dot) dot.textContent = '👑';
      if (msg) msg.textContent = t.youWin || "G'alaba qozondingiz! 🏆";
      App.showModal(
        '👑',
        t.youWin || "G'alaba!",
        t.chessOppResignedWin || "Raqib taslim bo'ldi. Siz g'alaba qozondingiz! 🏆",
        () => {
          if (typeof Multiplayer !== 'undefined') {
            Multiplayer.sendGameMove({ type: 'chess_restart' });
          }
          const isHost = (typeof Multiplayer !== 'undefined' && Multiplayer.isHost);
          this.startMultiplayer(isHost);
        }
      );
    } else {
      AudioEngine.error();
      if (dot) dot.textContent = '🏳️';
      if (msg) msg.textContent = t.chessYouResigned || "Siz taslim bo'ldingiz";
      App.showModal(
        '🏳️',
        t.gameOver || "O'yin tugadi",
        t.chessYouResignedMsg || "Siz taslim bo'ldingiz. Raqib g'alaba qozondi.",
        () => {
          if (typeof Multiplayer !== 'undefined') {
            Multiplayer.sendGameMove({ type: 'chess_restart' });
          }
          const isHost = (typeof Multiplayer !== 'undefined' && Multiplayer.isHost);
          this.startMultiplayer(isHost);
        }
      );
    }
  },

  getPieceSVG(color, type) {
    const key = `${color}_${type}`;
    if (typeof ChessPiecesSVG !== 'undefined' && ChessPiecesSVG[key]) {
      return `<svg viewBox="0 0 45 45" class="chess-piece-svg">${ChessPiecesSVG[key]}</svg>`;
    }
    const unicode = {
      w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
      b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
    };
    return `<span class="chess-piece-fallback">${unicode[color][type]}</span>`;
  },

  renderBoard() {
    const boardEl = document.getElementById('chess-board');
    if (!boardEl || !this.game) return;
    boardEl.innerHTML = '';

    const board = this.game.board();
    const inCheck = this.game.in_check();
    const turn = this.game.turn();

    const ranks = this.isFlipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
    const files = this.isFlipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];

    for (let rIdx = 0; rIdx < 8; rIdx++) {
      const r = ranks[rIdx];
      for (let fIdx = 0; fIdx < 8; fIdx++) {
        const f = files[fIdx];
        const squareName = String.fromCharCode(97 + f) + (8 - r);
        const piece = board[r][f];
        const isLight = (r + f) % 2 === 0;

        const cell = document.createElement('div');
        cell.className = `chess-sq ${isLight ? 'sq-light' : 'sq-dark'}`;
        cell.dataset.square = squareName;

        // Rank coordinate (left edge)
        if (fIdx === 0) {
          const coordRank = document.createElement('span');
          coordRank.className = `chess-coord chess-coord-rank ${isLight ? 'coord-light' : 'coord-dark'}`;
          coordRank.textContent = (8 - r);
          cell.appendChild(coordRank);
        }

        // File coordinate (bottom edge)
        if (rIdx === 7) {
          const coordFile = document.createElement('span');
          coordFile.className = `chess-coord chess-coord-file ${isLight ? 'coord-light' : 'coord-dark'}`;
          coordFile.textContent = String.fromCharCode(97 + f);
          cell.appendChild(coordFile);
        }

        // Last move highlight
        if (this.lastMove && (this.lastMove.from === squareName || this.lastMove.to === squareName)) {
          cell.classList.add('sq-last-move');
        }

        // Selected square highlight
        if (this.selectedSquare === squareName) {
          cell.classList.add('sq-selected');
        }

        // King in check highlight
        if (inCheck && piece && piece.type === 'k' && piece.color === turn) {
          cell.classList.add('sq-check');
        }

        // Vector piece
        if (piece) {
          const pieceHolder = document.createElement('div');
          pieceHolder.className = 'chess-piece-holder';
          pieceHolder.innerHTML = this.getPieceSVG(piece.color, piece.type);
          cell.appendChild(pieceHolder);
        }

        // Target dot / capture ring for legal moves
        const isLegalTarget = this.legalMovesForSelected.some(m => m.to === squareName);
        if (isLegalTarget) {
          const hint = document.createElement('div');
          hint.className = piece ? 'chess-capture-ring' : 'chess-move-dot';
          cell.appendChild(hint);
        }

        cell.onclick = () => this.onSquareClick(squareName);
        boardEl.appendChild(cell);
      }
    }
  },

  onSquareClick(square) {
    try {
      if (this.isOver || !this.game || this.isThinking) return;

      if (this.mode === 'bot' && this.game.turn() !== this.playerColor) return;
      if (this.mode === 'player' && this.game.turn() !== this.playerColor) return;

      const pieceAtSquare = this.game.get(square);

      if (this.selectedSquare) {
        const move = this.legalMovesForSelected.find(m => m.to === square);
        if (move) {
          if (move.flags && move.flags.includes('p')) {
            this.pendingPromotionMove = { from: this.selectedSquare, to: square };
            this.showPromotionDialog();
            return;
          }
          this.executeMove(move);
          return;
        }
      }

      // Select piece if it belongs to current player's turn
      if (pieceAtSquare && pieceAtSquare.color === this.game.turn()) {
        AudioEngine.tap();
        this.selectedSquare = square;
        this.legalMovesForSelected = this.game.moves({ square: square, verbose: true });
        this.renderBoard();
      } else {
        if (this.selectedSquare) {
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          this.renderBoard();
        }
      }
    } catch (err) {
      console.warn('onSquareClick exception:', err);
    }
  },

  executeMove(move) {
    if (!this.game) return;
    let res = null;
    try {
      res = this.game.move(move);
    } catch (e) {
      console.warn('Move execution error:', e);
      return;
    }
    if (!res) return;

    this.lastMove = res;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];

    try {
      if (res.captured) {
        if (AudioEngine.chessCapture) AudioEngine.chessCapture();
        else if (AudioEngine.match) AudioEngine.match();
        else AudioEngine.tap();
      } else {
        AudioEngine.tap();
      }
    } catch (e) {
      console.warn('Audio capture error:', e);
    }

    this.updateMoveHistoryList();
    this.renderBoard();
    this.updateStatus();
    this.updateCaptured();
    this.renderHistory();
    this.updateClockUI();

    // Send move to remote opponent in online multiplayer mode!
    if (this.mode === 'player') {
      if (typeof Multiplayer !== 'undefined') {
        Multiplayer.sendGameMove({
          type: 'chess_move',
          move: move,
          fen: this.game.fen(),
          timeW: this.timeLeftWhite,
          timeB: this.timeLeftBlack
        });
      }
    }

    if (this.checkGameOver()) return;

    // Trigger AI move in bot mode
    if (this.mode === 'bot' && this.game.turn() !== this.playerColor) {
      this.isThinking = true;
      this.updateStatus();
      this.botTimer = setTimeout(() => this.makeBotMove(), 200);
    }
  },

  showPromotionDialog() {
    const modal = document.getElementById('chess-promotion-modal');
    if (!modal) return;
    const color = this.game ? this.game.turn() : 'w';
    const btnQ = document.querySelector('.chess-promote-btn[onclick*="\'q\'"]');
    const btnR = document.querySelector('.chess-promote-btn[onclick*="\'r\'"]');
    const btnB = document.querySelector('.chess-promote-btn[onclick*="\'b\'"]');
    const btnN = document.querySelector('.chess-promote-btn[onclick*="\'n\'"]');
    if (btnQ) btnQ.innerHTML = this.getPieceSVG(color, 'q');
    if (btnR) btnR.innerHTML = this.getPieceSVG(color, 'r');
    if (btnB) btnB.innerHTML = this.getPieceSVG(color, 'b');
    if (btnN) btnN.innerHTML = this.getPieceSVG(color, 'n');
    modal.classList.add('active');
  },

  selectPromotionPiece(pieceType) {
    const modal = document.getElementById('chess-promotion-modal');
    if (modal) modal.classList.remove('active');

    if (this.pendingPromotionMove) {
      const move = {
        from: this.pendingPromotionMove.from,
        to: this.pendingPromotionMove.to,
        promotion: pieceType
      };
      this.pendingPromotionMove = null;
      this.executeMove(move);
    }
  },

  /* ---------------- HIGH-PERFORMANCE SMART & VARIED CHESS ENGINE ---------------- */

  killerMoves: {},

  recordKillerMove(ply, move) {
    if (!this.killerMoves[ply]) this.killerMoves[ply] = [];
    const list = this.killerMoves[ply];
    if (!list.some(m => m.from === move.from && m.to === move.to)) {
      list.unshift(move);
      if (list.length > 2) list.pop();
    }
  },

  getOpeningMove(legalMoves) {
    if (!this.game) return null;
    const history = this.game.history({ verbose: true });
    // Look up moves in book
    const key = history.map(m => m.from + m.to).join(' ');
    const entries = ChessOpeningBook[key];
    if (!entries || entries.length === 0) return null;

    // Find legal moves matching book entries
    const available = [];
    let totalWeight = 0;
    for (const entry of entries) {
      const match = legalMoves.find(m => m.from === entry.from && m.to === entry.to);
      if (match) {
        available.push({ move: match, weight: entry.weight || 10 });
        totalWeight += (entry.weight || 10);
      }
    }

    if (available.length === 0) return null;

    // Weighted random selection among opening options
    let rand = Math.random() * totalWeight;
    for (const item of available) {
      rand -= item.weight;
      if (rand <= 0) return item.move;
    }
    return available[0].move;
  },

  makeBotMove() {
    if (this.isOver || !this.game || this.abortSearch || this.game.turn() === this.playerColor) {
      this.isThinking = false;
      return;
    }

    const legalMoves = this.game.moves({ verbose: true });
    if (legalMoves.length === 0) {
      this.isThinking = false;
      this.checkGameOver();
      return;
    }

    this.killerMoves = {};

    // 1. OPENING BOOK (Used for Master, Hard, Medium, and 40% on Easy)
    if (this.difficulty !== 'easy' || Math.random() < 0.4) {
      const bookMove = this.getOpeningMove(legalMoves);
      if (bookMove) {
        this.isThinking = false;
        this.executeMove(bookMove);
        return;
      }
    }

    // 2. EASY: Depth 1 + basic capture awareness (avoids hanging pieces, 35% casual variety)
    if (this.difficulty === 'easy') {
      const scored = legalMoves.map(m => {
        this.game.move(m);
        // Score relative to bot's turn:
        const relScore = -this.evaluateBoardRelative();
        this.game.undo();
        return { move: m, score: relScore };
      });
      scored.sort((a, b) => b.score - a.score);

      let chosen = scored[0].move;
      if (scored.length > 1 && Math.random() < 0.35) {
        const casualPool = scored.slice(0, Math.min(scored.length, 3));
        chosen = casualPool[Math.floor(Math.random() * casualPool.length)].move;
      }
      this.isThinking = false;
      this.executeMove(chosen);
      return;
    }

    // 3. MEDIUM, HARD, MASTER: Search with Alpha-Beta Negamax, Quiescence Search & Move Ordering
    const sortedMoves = this.orderCandidateMoves(legalMoves, 0);

    const depthConfig = {
      medium: { depth: 2, qdepth: 2, margin: 40 },
      hard:   { depth: 3, qdepth: 2, margin: 25 },
      master: { depth: 4, qdepth: 3, margin: 12 }
    }[this.difficulty] || { depth: 2, qdepth: 2, margin: 40 };

    const evaluatedCandidates = [];
    let idx = 0;

    // Asynchronous step-based search processing each root move so UI NEVER freezes!
    const processCandidateBatch = () => {
      if (this.abortSearch || !this.game || this.isOver) {
        this.isThinking = false;
        return;
      }

      const batchStartTime = Date.now();
      // Spend up to 16ms per slice to maintain 60 FPS UI responsiveness
      while (idx < sortedMoves.length && (Date.now() - batchStartTime < 16)) {
        const move = sortedMoves[idx];
        this.game.move(move);

        let score = 0;
        if (this.game.in_checkmate()) {
          score = 100000;
        } else if (this.game.in_draw()) {
          score = -20;
        } else {
          // Pure Negamax: score is inverted response of opponent
          score = -this.negamax(
            depthConfig.depth - 1,
            -1000000,
            1000000,
            depthConfig.qdepth,
            1
          );
        }
        this.game.undo();

        evaluatedCandidates.push({ move, score });
        idx++;
      }

      if (idx < sortedMoves.length) {
        // Yield to browser event loop
        this.botTimer = setTimeout(processCandidateBatch, 4);
      } else {
        // Search finished!
        this.isThinking = false;
        this.botTimer = null;
        if (this.abortSearch || evaluatedCandidates.length === 0) return;

        // Sort descending by score (highest is best for bot!)
        evaluatedCandidates.sort((a, b) => b.score - a.score);
        const topScore = evaluatedCandidates[0].score;

        // Variety: collect all candidate moves within margin of topScore
        const topPool = evaluatedCandidates.filter(c => (topScore - c.score) <= depthConfig.margin);
        const chosen = topPool[Math.floor(Math.random() * topPool.length)].move;

        this.executeMove(chosen);
      }
    };

    // Start search
    this.botTimer = setTimeout(processCandidateBatch, 60);
  },

  negamax(depth, alpha, beta, qdepth, ply) {
    if (this.abortSearch) return 0;

    if (this.game.in_checkmate()) {
      return -100000 + ply; // Faster checkmate preferred
    }
    if (this.game.in_draw()) return 0;

    if (depth <= 0) {
      return this.quiescence(alpha, beta, qdepth, ply);
    }

    const moves = this.game.moves({ verbose: true });
    if (moves.length === 0) return 0;

    const ordered = this.orderCandidateMoves(moves, ply);
    let bestScore = -999999;

    for (let i = 0; i < ordered.length; i++) {
      const move = ordered[i];
      this.game.move(move);
      const score = -this.negamax(depth - 1, -beta, -alpha, qdepth, ply + 1);
      this.game.undo();

      if (score > bestScore) bestScore = score;
      if (score > alpha) {
        alpha = score;
        if (!move.captured) this.recordKillerMove(ply, move);
      }
      if (alpha >= beta) break; // Alpha-beta cutoff!
    }

    return bestScore;
  },

  quiescence(alpha, beta, qdepth, ply) {
    if (this.abortSearch) return 0;

    const standPat = this.evaluateBoardRelative();
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
    if (qdepth <= 0) return standPat;

    // Delta Pruning
    if (standPat < alpha - 950) return alpha;

    const moves = this.game.moves({ verbose: true });
    const tacticalMoves = moves.filter(m => m.captured || m.promotion || (m.san && m.san.includes('+')));
    if (tacticalMoves.length === 0) return standPat;

    const ordered = this.orderCandidateMoves(tacticalMoves, ply);

    for (let i = 0; i < ordered.length; i++) {
      const move = ordered[i];
      this.game.move(move);
      const score = -this.quiescence(-beta, -alpha, qdepth - 1, ply + 1);
      this.game.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  },

  evaluateBoardRelative() {
    if (!this.game) return 0;
    const turn = this.game.turn();
    const abs = this.evaluateBoardAbsolute();
    return (turn === 'w') ? abs : -abs;
  },

  orderCandidateMoves(moves, ply = 0) {
    const killers = (this.killerMoves && this.killerMoves[ply]) || [];

    return moves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // 1. Checkmate priority
      if (a.san && a.san.includes('#')) scoreA += 50000;
      if (b.san && b.san.includes('#')) scoreB += 50000;

      // 2. Promotions
      if (a.promotion) scoreA += (a.promotion === 'q' ? 850 : 400);
      if (b.promotion) scoreB += (b.promotion === 'q' ? 850 : 400);

      // 3. Captures (MVV-LVA)
      if (a.captured) {
        scoreA += (this.pieceValues[a.captured] * 10) - this.pieceValues[a.piece];
      }
      if (b.captured) {
        scoreB += (this.pieceValues[b.captured] * 10) - this.pieceValues[b.piece];
      }

      // 4. Killer Moves
      if (killers.some(k => k.from === a.from && k.to === a.to)) scoreA += 350;
      if (killers.some(k => k.from === b.from && k.to === b.to)) scoreB += 350;

      // 5. Checks
      if (a.san && a.san.includes('+')) scoreA += 150;
      if (b.san && b.san.includes('+')) scoreB += 150;

      // 6. Castling
      if (a.san === 'O-O' || a.san === 'O-O-O') scoreA += 90;
      if (b.san === 'O-O' || b.san === 'O-O-O') scoreB += 90;

      return scoreB - scoreA;
    });
  },

  evaluateBoardAbsolute() {
    if (!this.game) return 0;
    if (this.game.in_checkmate()) {
      return this.game.turn() === 'w' ? -100000 : 100000;
    }
    if (this.game.in_draw()) return 0;

    let score = 0;
    const board = this.game.board();

    // Endgame phase detection
    let nonPawnMaterial = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type !== 'p' && p.type !== 'k') {
          nonPawnMaterial += this.pieceValues[p.type];
        }
      }
    }
    const isEndgame = nonPawnMaterial < 1300;

    let whiteBishops = 0;
    let blackBishops = 0;
    const whitePawnsPerCol = [0,0,0,0,0,0,0,0];
    const blackPawnsPerCol = [0,0,0,0,0,0,0,0];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const val = this.pieceValues[piece.type];
        let pstVal = 0;

        if (piece.type === 'k') {
          const kTable = isEndgame ? this.pst.kEnd : this.pst.kMid;
          pstVal = (piece.color === 'w') ? kTable[r][c] : kTable[7 - r][c];
        } else if (this.pst[piece.type]) {
          pstVal = (piece.color === 'w') ? this.pst[piece.type][r][c] : this.pst[piece.type][7 - r][c];
        }

        const total = val + pstVal;

        if (piece.color === 'w') {
          score += total;
          if (piece.type === 'b') whiteBishops++;
          if (piece.type === 'p') whitePawnsPerCol[c]++;

          // Center dominance bonus
          if ((r === 3 || r === 4) && (c === 3 || c === 4)) score += 15;
          else if ((r >= 2 && r <= 5) && (c >= 2 && c <= 5)) score += 5;

          // Passed pawn bonus in endgame
          if (piece.type === 'p' && isEndgame) {
            score += (7 - r) * 15;
          }
        } else {
          score -= total;
          if (piece.type === 'b') blackBishops++;
          if (piece.type === 'p') blackPawnsPerCol[c]++;

          // Center dominance bonus
          if ((r === 3 || r === 4) && (c === 3 || c === 4)) score -= 15;
          else if ((r >= 2 && r <= 5) && (c >= 2 && c <= 5)) score -= 5;

          // Passed pawn bonus in endgame
          if (piece.type === 'p' && isEndgame) {
            score -= r * 15;
          }
        }
      }
    }

    // Bishop pair bonus
    if (whiteBishops >= 2) score += 40;
    if (blackBishops >= 2) score -= 40;

    // Doubled pawns penalty
    for (let c = 0; c < 8; c++) {
      if (whitePawnsPerCol[c] > 1) score -= (whitePawnsPerCol[c] - 1) * 20;
      if (blackPawnsPerCol[c] > 1) score += (blackPawnsPerCol[c] - 1) * 20;
    }

    return score;
  },

  // Legacy alias
  evaluateBoard() {
    return this.evaluateBoardAbsolute();
  },

  checkGameOver() {
    const t = this.t();
    if (!this.game) return false;

    if (this.game.in_checkmate()) {
      this.isOver = true;
      if (this.clockInterval) clearInterval(this.clockInterval);
      if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
      const winner = this.game.turn() === 'w' ? 'Black' : 'White';
      let isPlayerWin = false;

      if (this.mode === 'bot') {
        isPlayerWin = (winner === 'White' && this.playerColor === 'w') || (winner === 'Black' && this.playerColor === 'b');
      } else if (this.mode === 'player') {
        isPlayerWin = (winner === 'White' && this.playerColor === 'w') || (winner === 'Black' && this.playerColor === 'b');
      } else {
        isPlayerWin = true;
      }

      if (isPlayerWin) {
        AudioEngine.win();
        Confetti.fire(100);
      } else {
        AudioEngine.error();
      }

      const winnerText = winner === 'White' ? (t.chessWhite || "Oqlar") : (t.chessBlack || "Qoralar");
      let winDesc = '';
      if (this.mode === 'player') {
        winDesc = isPlayerWin ? (t.youWin || "Siz g'alaba qozondingiz! 🏆") : (t.oppWin || "Raqib g'alaba qozondi!");
      } else {
        winDesc = `${winnerText} ${t.youWin || "g'alaba qozondi!"}`;
      }

      App.showModal(
        '👑',
        t.chessCheckmate || "Shaxmat va Mot!",
        winDesc,
        () => {
          if (this.mode === 'player') {
            if (typeof Multiplayer !== 'undefined') {
              Multiplayer.sendGameMove({ type: 'chess_restart' });
            }
            const isHost = (typeof Multiplayer !== 'undefined' && Multiplayer.isHost);
            this.startMultiplayer(isHost);
          } else {
            this.startNewGame(false);
          }
        }
      );
      return true;
    }

    if (this.game.in_draw() || this.game.in_stalemate() || this.game.in_threefold_repetition() || this.game.insufficient_material()) {
      this.isOver = true;
      if (this.clockInterval) clearInterval(this.clockInterval);
      if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
      AudioEngine.tap();
      const title = this.game.in_stalemate() ? (t.chessStalemate || "Pat!") : (t.chessDraw || "Durang!");
      App.showModal('🤝', title, t.draw || "Durang qayd etildi!", () => {
        if (this.mode === 'player') {
          if (typeof Multiplayer !== 'undefined') {
            Multiplayer.sendGameMove({ type: 'chess_restart' });
          }
          const isHost = (typeof Multiplayer !== 'undefined' && Multiplayer.isHost);
          this.startMultiplayer(isHost);
        } else {
          this.startNewGame(false);
        }
      });
      return true;
    }

    return false;
  },

  updateStatus() {
    const dot = document.getElementById('chess-turn-dot');
    const msg = document.getElementById('chess-status-msg');
    if (!msg || !this.game) return;

    const t = this.t();
    if (this.isOver) {
      if (dot) dot.textContent = '🏁';
      msg.textContent = t.gameOver || "O'yin tugadi";
      return;
    }

    const turn = this.game.turn();
    if (dot) dot.textContent = turn === 'w' ? '⚪' : '⚫';

    if (this.isThinking) {
      msg.textContent = t.chessBotThinking || "🤖 Bot o'ylamoqda...";
      return;
    }

    if (this.game.in_check()) {
      msg.textContent = t.chessCheck || "⚔️ Shoxga hujum (SHOH)!";
      return;
    }

    if (this.mode === 'bot') {
      if (turn === this.playerColor) {
        msg.textContent = `${t.yourTurn || "Sizning navbatingiz"} (${turn === 'w' ? (t.chessWhite || 'Oqlar') : (t.chessBlack || 'Qoralar')})`;
      } else {
        msg.textContent = `${t.botTurn || "Bot navbati"} (${turn === 'w' ? (t.chessWhite || 'Oqlar') : (t.chessBlack || 'Qoralar')})`;
      }
    } else if (this.mode === 'player') {
      if (turn === this.playerColor) {
        msg.textContent = `🟢 ${t.yourTurn || "Sizning navbatingiz"} (${this.playerColor === 'w' ? (t.chessWhite || 'Oqlar') : (t.chessBlack || 'Qoralar')})`;
      } else {
        msg.textContent = `⏳ ${t.turnOpp || "Raqib navbati"} (${turn === 'w' ? (t.chessWhite || 'Oqlar') : (t.chessBlack || 'Qoralar')})`;
      }
    } else if (this.mode === 'local') {
      const p1 = t.player1 || "1-O'yinchi";
      const p2 = t.player2 || "2-O'yinchi";
      const yourTurn = t.yourTurn || "navbati";
      if (turn === 'w') {
        msg.textContent = `⚪ ${p1} (${t.chessWhite || 'Oqlar'}) - ${yourTurn}`;
      } else {
        msg.textContent = `⚫ ${p2} (${t.chessBlack || 'Qoralar'}) - ${yourTurn}`;
      }
    } else {
      msg.textContent = turn === 'w' ? (t.chessTurnWhite || "⚪ Oqlar navbati") : (t.chessTurnBlack || "⚫ Qoralar navbati");
    }
  },

  updateCaptured() {
    if (!this.game) return;
    try {
      const trayW = document.getElementById('chess-captured-w');
      const trayB = document.getElementById('chess-captured-b');
      const diffEl = document.getElementById('chess-material-diff');
      if (!trayW && !trayB) return;

      const initial = { p: 8, r: 2, n: 2, b: 2, q: 1 };
      const currentW = { p: 0, r: 0, n: 0, b: 0, q: 0 };
      const currentB = { p: 0, r: 0, n: 0, b: 0, q: 0 };

      const board = this.game.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type !== 'k') {
            if (p.color === 'w') currentW[p.type]++;
            else currentB[p.type]++;
          }
        }
      }

      let capturedByWhite = '';
      let capturedByBlack = '';
      let scoreW = 0;
      let scoreB = 0;

      ['q', 'r', 'b', 'n', 'p'].forEach(type => {
        const lostB = Math.max(0, initial[type] - currentB[type]);
        for (let i = 0; i < lostB; i++) {
          capturedByWhite += this.getPieceSVG('b', type);
          scoreW += this.pieceValues[type];
        }
        const lostW = Math.max(0, initial[type] - currentW[type]);
        for (let i = 0; i < lostW; i++) {
          capturedByBlack += this.getPieceSVG('w', type);
          scoreB += this.pieceValues[type];
        }
      });

      const isPlayerWhite = (this.playerColor === 'w');
      // Bottom strip tray (trayW) displays player's captured pieces
      if (trayW) trayW.innerHTML = isPlayerWhite ? capturedByWhite : capturedByBlack;
      // Top strip tray (trayB) displays opponent's captured pieces
      if (trayB) trayB.innerHTML = isPlayerWhite ? capturedByBlack : capturedByWhite;

      if (diffEl) {
        const diff = isPlayerWhite ? Math.round((scoreW - scoreB) / 100) : Math.round((scoreB - scoreW) / 100);
        if (diff > 0) diffEl.textContent = `+${diff}`;
        else if (diff < 0) diffEl.textContent = `${diff}`;
        else diffEl.textContent = '';
      }
    } catch (e) {
      console.warn('updateCaptured error:', e);
    }
  },

  updateMoveHistoryList() {
    if (!this.game) return;
    const history = this.game.history();
    this.moveHistoryList = [];
    for (let i = 0; i < history.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = history[i];
      const blackMove = history[i + 1] || '';
      this.moveHistoryList.push({ num: moveNum, w: whiteMove, b: blackMove });
    }
  },

  renderHistory() {
    const el = document.getElementById('chess-move-history');
    if (!el) return;
    const t = this.t();
    if (this.moveHistoryList.length === 0) {
      el.innerHTML = `<span style="opacity:0.6; font-style:italic;">${t.chessHistoryEmpty || "Yurishlar tarixi bo'sh"}</span>`;
      return;
    }
    el.innerHTML = this.moveHistoryList.map(item =>
      `<span class="chess-move-pill">${item.num}. ${item.w} ${item.b}</span>`
    ).join(' ');
    el.scrollLeft = el.scrollWidth;
  }
};
