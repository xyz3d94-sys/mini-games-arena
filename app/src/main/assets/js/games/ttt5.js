/* 5x5 Tic-Tac-Toe (X va O 5x5) Engine with Smart AI, Alternating Turns & Localization */
const TTT5 = {
  mode: 'bot', // 'bot', 'local', or 'player' (online)
  board: Array(25).fill(null),
  turn: 'X',
  mySymbol: 'X',
  isOver: false,
  roundCount: 0,
  scoreX: 0,
  scoreO: 0,
  scoreDraw: 0,

  // All 28 possible 4-in-a-row winning combinations on a 5x5 grid
  lines: [
    // Rows (10)
    [0,1,2,3], [1,2,3,4],
    [5,6,7,8], [6,7,8,9],
    [10,11,12,13], [11,12,13,14],
    [15,16,17,18], [16,17,18,19],
    [20,21,22,23], [21,22,23,24],
    // Columns (10)
    [0,5,10,15], [5,10,15,20],
    [1,6,11,16], [6,11,16,21],
    [2,7,12,17], [7,12,17,22],
    [3,8,13,18], [8,13,18,23],
    [4,9,14,19], [9,14,19,24],
    // Diagonals \ (4)
    [0,6,12,18], [1,7,13,19],
    [5,11,17,23], [6,12,18,24],
    // Anti-Diagonals / (4)
    [3,7,11,15], [4,8,12,16],
    [8,12,16,20], [9,13,17,21]
  ],

  init() {
    this.roundCount = 0;
    this.newRound();
  },

  t() {
    return (typeof I18N !== 'undefined' && I18N[App.lang]) || (typeof I18N !== 'undefined' && I18N.uz) || {};
  },

  setMode(m) {
    AudioEngine.tap();
    if (m === 'online') {
      const t = this.t();
      Multiplayer.openChallengeModal('ttt5', t.ttt5Title || "X va O (5x5)");
      return;
    }
    this.mode = m; // 'bot' or 'local'
    this.roundCount = 0;
    this.scoreX = 0;
    this.scoreO = 0;
    this.scoreDraw = 0;
    const sx = document.getElementById('ttt5-score-x');
    const so = document.getElementById('ttt5-score-o');
    const sd = document.getElementById('ttt5-score-draw');
    if (sx) sx.textContent = '0';
    if (so) so.textContent = '0';
    if (sd) sd.textContent = '0';

    const tabBot = document.getElementById('ttt5-tab-bot');
    const tabLocal = document.getElementById('ttt5-tab-player');
    if (tabBot) tabBot.classList.toggle('active', m === 'bot');
    if (tabLocal) tabLocal.classList.toggle('active', m === 'local');

    this.updateLabels();
    this.newRound();
  },

  updateLabels() {
    const t = this.t();
    const lblX = document.getElementById('ttt5-lbl-x');
    const lblO = document.getElementById('ttt5-lbl-o');
    if (!lblX || !lblO) return;

    if (this.mode === 'bot') {
      lblX.textContent = `X (${t.you || 'Siz'})`;
      lblO.textContent = `O (${t.bot || 'Bot'})`;
    } else if (this.mode === 'local') {
      lblX.textContent = `X (1-${t.you || 'O\'yinchi'})`;
      lblO.textContent = `O (2-${t.opponent || 'O\'yinchi'})`;
    } else {
      lblX.textContent = this.mySymbol === 'X' ? `X (${t.you || 'Siz'})` : `X (${t.opponent || 'Raqib'})`;
      lblO.textContent = this.mySymbol === 'O' ? `O (${t.you || 'Siz'})` : `O (${t.opponent || 'Raqib'})`;
    }
  },

  startMultiplayer(isHost) {
    this.mode = 'player';
    this.roundCount = 0;
    this.scoreX = 0;
    this.scoreO = 0;
    this.scoreDraw = 0;
    const sx = document.getElementById('ttt5-score-x');
    const so = document.getElementById('ttt5-score-o');
    const sd = document.getElementById('ttt5-score-draw');
    if (sx) sx.textContent = '0';
    if (so) so.textContent = '0';
    if (sd) sd.textContent = '0';

    const tabBot = document.getElementById('ttt5-tab-bot');
    const tabLocal = document.getElementById('ttt5-tab-player');
    const tabOnline = document.getElementById('ttt5-tab-online');
    if (tabBot) tabBot.classList.remove('active');
    if (tabLocal) tabLocal.classList.remove('active');
    if (tabOnline) tabOnline.classList.add('active');

    this.mySymbol = isHost ? 'X' : 'O';
    this.updateLabels();
    this.newRound();
    const t = this.t();
    App.showToast(isHost ? (t.turnYou || 'Sizning navbatingiz') : (t.turnOpp || 'Raqib navbati'));
  },

  newRound(remoteSync = false) {
    if (!remoteSync) AudioEngine.tap();
    this.board = Array(25).fill(null);
    this.roundCount++;
    // Alternate starter: Round 1 (odd) starts with X, Round 2 (even) starts with O
    this.turn = (this.roundCount % 2 === 1) ? 'X' : 'O';
    this.isOver = false;

    const cells = document.querySelectorAll('.ttt5-cell');
    cells.forEach(c => {
      c.textContent = '';
      c.className = 'ttt5-cell';
    });
    this.updateStatus();

    // If bot mode and it's O's turn, bot starts opening move!
    if (this.mode === 'bot' && this.turn === 'O') {
      setTimeout(() => {
        if (!this.isOver && this.turn === 'O' && this.mode === 'bot') {
          this.aiMove();
        }
      }, 550);
    }

    if (!remoteSync && this.mode === 'player') {
      Multiplayer.sendGameMove({ type: 'ttt5_restart', roundCount: this.roundCount });
    }
  },

  updateStatus() {
    const t = this.t();
    const dot = document.getElementById('ttt5-turn-dot');
    const msg = document.getElementById('ttt5-status-msg');
    if (!dot || !msg) return;

    dot.textContent = this.turn;
    dot.className = 'ttt-turn-dot ' + (this.turn === 'X' ? 'dot-x' : 'dot-o');

    if (this.mode === 'bot') {
      msg.textContent = (this.turn === 'X') ? `${t.turnYou || 'Sizning navbatingiz'} (X)` : `${t.turnBot || 'Bot o\'ylamoqda...'} (O)`;
    } else if (this.mode === 'local') {
      msg.textContent = (this.turn === 'X') ? `1-O'yinchi (X) navbati` : `2-O'yinchi (O) navbati`;
    } else {
      msg.textContent = (this.turn === this.mySymbol) ? `${t.turnYou || 'Sizning navbatingiz'} (${this.mySymbol})` : `${t.turnOpp || 'Raqib navbati'} (${this.turn})`;
    }
  },

  clickCell(idx) {
    if (this.isOver || this.board[idx] !== null) return;
    if (this.mode === 'bot' && this.turn === 'O') return;
    if (this.mode === 'player' && this.turn !== this.mySymbol) return;

    this.applyMove(idx, this.turn);

    if (this.mode === 'player') {
      Multiplayer.sendGameMove({ type: 'ttt5_move', idx, player: this.mySymbol });
    }

    if (!this.isOver && this.mode === 'bot' && this.turn === 'O') {
      setTimeout(() => this.aiMove(), 380);
    }
  },

  applyMove(idx, player) {
    this.board[idx] = player;
    const cell = document.querySelectorAll('.ttt5-cell')[idx];
    if (cell) {
      cell.textContent = player;
      cell.classList.add(player === 'X' ? 'val-x' : 'val-o');
    }
    if (player === 'X') AudioEngine.tttPlaceX();
    else AudioEngine.tttPlaceO();

    const win = this.checkWinner(this.board);
    if (win) {
      this.handleWin(win);
    } else if (this.board.every(b => b !== null)) {
      this.handleDraw();
    } else {
      this.turn = (this.turn === 'X') ? 'O' : 'X';
      this.updateStatus();
    }
  },

  handleRemoteMove(data) {
    if (data.type === 'ttt5_move' && this.board[data.idx] === null) {
      this.applyMove(data.idx, data.player);
    } else if (data.type === 'ttt5_restart') {
      if (typeof data.roundCount === 'number') {
        this.roundCount = data.roundCount - 1;
      }
      this.newRound(true);
    }
  },

  checkWinner(b) {
    for (const line of this.lines) {
      const [a, b1, c, d] = line;
      if (b[a] && b[a] === b[b1] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a], combo: [a, b1, c, d] };
      }
    }
    return null;
  },

  handleWin(win) {
    this.isOver = true;
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
    const t = this.t();
    const cells = document.querySelectorAll('.ttt5-cell');
    win.combo.forEach(i => cells[i].classList.add('winner-cell'));

    if (win.winner === 'X') {
      this.scoreX++;
      const sx = document.getElementById('ttt5-score-x');
      if (sx) sx.textContent = this.scoreX;
      AudioEngine.win();
      Confetti.fire(55);
    } else {
      this.scoreO++;
      const so = document.getElementById('ttt5-score-o');
      if (so) so.textContent = this.scoreO;
      if (this.mode === 'bot') AudioEngine.error(); else AudioEngine.win();
    }

    let winMsg = '';
    if (this.mode === 'bot') {
      winMsg = (win.winner === 'X') ? (t.youWin || 'G\'alaba!') : (t.botWin || 'Bot yutdi!');
    } else if (this.mode === 'local') {
      winMsg = (win.winner === 'X') ? "1-O'yinchi (X) g'alaba qozondi! 🏆" : "2-O'yinchi (O) g'alaba qozondi! 🏆";
    } else {
      winMsg = (win.winner === this.mySymbol) ? (t.youWin || 'G\'alaba!') : (t.oppWin || 'Raqib yutdi!');
    }

    const stMsg = document.getElementById('ttt5-status-msg');
    if (stMsg) stMsg.textContent = winMsg;
    setTimeout(() => {
      App.showModal(win.winner === 'X' ? '🏆' : (this.mode === 'bot' ? '🤖' : '🏆'), `${win.winner} G'alaba!`, winMsg, () => TTT5.newRound());
    }, 550);
  },

  handleDraw() {
    this.isOver = true;
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
    const t = this.t();
    this.scoreDraw++;
    const sd = document.getElementById('ttt5-score-draw');
    if (sd) sd.textContent = this.scoreDraw;
    const stMsg = document.getElementById('ttt5-status-msg');
    if (stMsg) stMsg.textContent = t.draw || "Durang! 🤝";
    AudioEngine.tttDraw();
    setTimeout(() => {
      App.showModal('🤝', t.draw || "Durang!", t.drawDesc || "Kuchlar teng keldi!", () => TTT5.newRound());
    }, 500);
  },

  /* Strategic AI for 5x5 Connect 4 */
  aiMove() {
    if (this.isOver) return;

    // 1. Win if possible: Can O make 4 in a row?
    for (let i = 0; i < 25; i++) {
      if (this.board[i] === null) {
        this.board[i] = 'O';
        if (this.checkWinner(this.board)) {
          this.board[i] = null;
          this.applyMove(i, 'O');
          return;
        }
        this.board[i] = null;
      }
    }

    // 2. Block immediate win: Can X make 4 in a row?
    for (let i = 0; i < 25; i++) {
      if (this.board[i] === null) {
        this.board[i] = 'X';
        if (this.checkWinner(this.board)) {
          this.board[i] = null;
          this.applyMove(i, 'O');
          return;
        }
        this.board[i] = null;
      }
    }

    // 3. Count 3-in-a-row opportunities and blocks
    let bestMove = -1;
    let bestScore = -9999;

    for (let i = 0; i < 25; i++) {
      if (this.board[i] !== null) continue;

      let score = 0;

      // Position bias: Center cell (12) is most powerful, middle ring next
      const r = Math.floor(i / 5);
      const c = i % 5;
      const distFromCenter = Math.abs(r - 2) + Math.abs(c - 2);
      score += (4 - distFromCenter) * 3;

      // Evaluate lines containing cell i
      for (const line of this.lines) {
        if (!line.includes(i)) continue;
        const counts = { X: 0, O: 0, empty: 0 };
        for (const idx of line) {
          if (idx === i) counts.O++;
          else if (this.board[idx] === 'O') counts.O++;
          else if (this.board[idx] === 'X') counts.X++;
          else counts.empty++;
        }

        // If line is pure O (our attack)
        if (counts.X === 0) {
          if (counts.O === 3) score += 80;
          else if (counts.O === 2) score += 20;
          else score += 5;
        }

        // Evaluate blocking opponent on this line
        const oppCounts = { X: 0, O: 0 };
        for (const idx of line) {
          if (idx === i) oppCounts.X++;
          else if (this.board[idx] === 'X') oppCounts.X++;
          else if (this.board[idx] === 'O') oppCounts.O++;
        }
        if (oppCounts.O === 0) {
          if (oppCounts.X === 3) score += 65; // High priority block
          else if (oppCounts.X === 2) score += 18;
        }
      }

      // Add small random jitter so bot moves are not 100% repetitive
      score += Math.random() * 4;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }

    if (bestMove !== -1) {
      this.applyMove(bestMove, 'O');
      return;
    }

    // Fallback: pick any open cell
    const open = this.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    if (open.length) {
      this.applyMove(open[Math.floor(Math.random() * open.length)], 'O');
    }
  }
};
