/* 3x3 Tic-Tac-Toe Engine with Localization */
const TTT = {
  mode: 'bot', // 'bot', 'local', or 'player' (online)
  board: Array(9).fill(null),
  turn: 'X',
  mySymbol: 'X',
  isOver: false,
  roundCount: 0,
  scoreX: 0,
  scoreO: 0,
  scoreDraw: 0,

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
      Multiplayer.openChallengeModal('ttt', this.t().tttTitle);
      return;
    }
    this.mode = m; // 'bot' or 'local'
    this.roundCount = 0;
    this.scoreX = 0;
    this.scoreO = 0;
    this.scoreDraw = 0;
    document.getElementById('ttt-score-x').textContent = '0';
    document.getElementById('ttt-score-o').textContent = '0';
    document.getElementById('ttt-score-draw').textContent = '0';

    const tabBot = document.getElementById('ttt-tab-bot');
    const tabLocal = document.getElementById('ttt-tab-player');
    const tabOnline = document.getElementById('ttt-tab-online');
    if (tabBot) tabBot.classList.toggle('active', m === 'bot');
    if (tabLocal) tabLocal.classList.toggle('active', m === 'local');
    if (tabOnline) tabOnline.classList.toggle('active', m === 'online');

    const t = this.t();
    if (m === 'bot') {
      document.getElementById('ttt-lbl-x').textContent = `X (${t.you || 'Siz'})`;
      document.getElementById('ttt-lbl-o').textContent = `O (${t.bot || 'Bot'})`;
    } else {
      document.getElementById('ttt-lbl-x').textContent = `X (1-${t.you || 'O\'yinchi'})`;
      document.getElementById('ttt-lbl-o').textContent = `O (2-${t.opponent || 'O\'yinchi'})`;
    }
    this.newRound();
  },

  startMultiplayer(isHost) {
    this.mode = 'player';
    this.roundCount = 0;
    this.scoreX = 0;
    this.scoreO = 0;
    this.scoreDraw = 0;
    document.getElementById('ttt-score-x').textContent = '0';
    document.getElementById('ttt-score-o').textContent = '0';
    document.getElementById('ttt-score-draw').textContent = '0';

    const tabBot = document.getElementById('ttt-tab-bot');
    const tabLocal = document.getElementById('ttt-tab-player');
    const tabOnline = document.getElementById('ttt-tab-online');
    if (tabBot) tabBot.classList.remove('active');
    if (tabLocal) tabLocal.classList.remove('active');
    if (tabOnline) tabOnline.classList.add('active');

    this.mySymbol = isHost ? 'X' : 'O';
    const t = this.t();
    document.getElementById('ttt-lbl-x').textContent = isHost ? `X (${t.you || 'Siz'})` : `X (${t.opponent || 'Raqib'})`;
    document.getElementById('ttt-lbl-o').textContent = isHost ? `O (${t.opponent || 'Raqib'})` : `O (${t.you || 'Siz'})`;
    this.newRound();
    App.showToast(isHost ? (t.turnYou || 'Sizning navbatingiz') : (t.turnOpp || 'Raqib navbati'));
  },

  newRound(remoteSync = false) {
    if (!remoteSync) AudioEngine.tap();
    this.board = Array(9).fill(null);
    this.roundCount++;
    // Alternate starter: Round 1 (odd) starts with X, Round 2 (even) starts with O
    this.turn = (this.roundCount % 2 === 1) ? 'X' : 'O';
    this.isOver = false;
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach(c => {
      c.textContent = '';
      c.className = 'ttt-cell';
    });
    this.updateStatus();

    // If bot mode and it's O's turn, bot starts the game first
    if (this.mode === 'bot' && this.turn === 'O') {
      setTimeout(() => {
        if (!this.isOver && this.turn === 'O' && this.mode === 'bot') {
          this.aiMove();
        }
      }, 550);
    }

    // In multiplayer, send restart command so both boards clear together
    if (!remoteSync && this.mode === 'player') {
      Multiplayer.sendGameMove({ type: 'ttt_restart', roundCount: this.roundCount });
    }
  },

  updateStatus() {
    const t = this.t();
    const dot = document.getElementById('ttt-turn-dot');
    const msg = document.getElementById('ttt-status-msg');
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
    if (this.mode === 'bot' && this.turn === 'O') return; // In bot mode, player can only play on X
    if (this.mode === 'player' && this.turn !== this.mySymbol) return; // In online mode, wait for your symbol

    this.applyMove(idx, this.turn);

    if (this.mode === 'player') {
      Multiplayer.sendGameMove({ type: 'move', idx, player: this.mySymbol });
    }

    if (!this.isOver && this.mode === 'bot' && this.turn === 'O') {
      setTimeout(() => this.aiMove(), 380);
    }
  },

  applyMove(idx, player) {
    this.board[idx] = player;
    const cell = document.querySelectorAll('.ttt-cell')[idx];
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
    if (data.type === 'move' && this.board[data.idx] === null) {
      this.applyMove(data.idx, data.player);
    } else if (data.type === 'ttt_restart') {
      if (typeof data.roundCount === 'number') {
        this.roundCount = data.roundCount - 1;
      }
      this.newRound(true);
    }
  },

  checkWinner(b) {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (const [a, b1, c] of lines) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
        return { winner: b[a], combo: [a, b1, c] };
      }
    }
    return null;
  },

  handleWin(win) {
    this.isOver = true;
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
    const t = this.t();
    const cells = document.querySelectorAll('.ttt-cell');
    win.combo.forEach(i => cells[i].classList.add('winner-cell'));

    if (win.winner === 'X') {
      this.scoreX++;
      document.getElementById('ttt-score-x').textContent = this.scoreX;
      AudioEngine.win();
      Confetti.fire(55);
    } else {
      this.scoreO++;
      document.getElementById('ttt-score-o').textContent = this.scoreO;
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

    document.getElementById('ttt-status-msg').textContent = winMsg;
    setTimeout(() => {
      App.showModal(win.winner === 'X' ? '🏆' : (this.mode === 'bot' ? '🤖' : '🏆'), `${win.winner} G'alaba!`, winMsg, () => TTT.newRound());
    }, 500);
  },

  handleDraw() {
    this.isOver = true;
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
    const t = this.t();
    this.scoreDraw++;
    document.getElementById('ttt-score-draw').textContent = this.scoreDraw;
    document.getElementById('ttt-status-msg').textContent = t.draw;
    AudioEngine.tttDraw();
    setTimeout(() => {
      App.showModal('🤝', t.draw, t.drawDesc, () => TTT.newRound());
    }, 450);
  },

  aiMove() {
    if (this.isOver) return;
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) {
        this.board[i] = 'O';
        if (this.checkWinner(this.board)) { this.board[i] = null; this.applyMove(i, 'O'); return; }
        this.board[i] = null;
      }
    }
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) {
        this.board[i] = 'X';
        if (this.checkWinner(this.board)) { this.board[i] = null; this.applyMove(i, 'O'); return; }
        this.board[i] = null;
      }
    }
    if (this.board[4] === null) { this.applyMove(4, 'O'); return; }
    const corners = [0, 2, 6, 8].filter(c => this.board[c] === null);
    if (corners.length) {
      this.applyMove(corners[Math.floor(Math.random() * corners.length)], 'O');
      return;
    }
    const open = this.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    if (open.length) this.applyMove(open[Math.floor(Math.random() * open.length)], 'O');
  }
};
