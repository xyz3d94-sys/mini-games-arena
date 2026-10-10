/* Treasure Number Guesser (Hot/Cold Interactive Matrix) with Localization */
const GuessNew = {
  mode: 'bot',
  maxRange: 25,
  target: null,
  tries: 0,
  minBound: 1,
  maxBound: 25,
  isOver: false,

  init() {},

  t() {
    return I18N[App.lang] || I18N.uz;
  },

  setMode(m) {
    AudioEngine.tap();
    this.mode = m; // 'bot' or 'player'
    document.getElementById('guess-tab-bot').classList.toggle('active', m === 'bot');
    document.getElementById('guess-tab-player').classList.toggle('active', m === 'player');
    this.start();
  },

  startMultiplayer(isHost) {
    this.mode = 'player';
    document.getElementById('guess-tab-bot').classList.remove('active');
    document.getElementById('guess-tab-player').classList.add('active');
    
    if (isHost) {
        // Host generates the target and sends it to the opponent
        this.start(true); // true means host generates
        Multiplayer.sendGameMove({ type: 'guess_sync_start', maxRange: this.maxRange, target: this.target });
    } else {
        // Guest waits for host's target
        App.showToast("Kutilmoqda...");
    }
  },

  setGrid(range) {
    AudioEngine.tap();
    if (this.mode === 'player') {
      App.showToast("Multiplayer rejimida faqat host qatorni o'zgartira oladi");
      return;
    }
    this.maxRange = range;
    document.getElementById('guess-tab-25').classList.toggle('active', range === 25);
    document.getElementById('guess-tab-50').classList.toggle('active', range === 50);
    this.start();
  },

  start(isHostGenerating = false) {
    if (this.mode === 'bot') AudioEngine.tap();
    const t = this.t();

    // If host or bot, generate a new random target
    if (this.mode === 'bot' || isHostGenerating) {
        // More combinations as requested by user
        this.target = Math.floor(Math.random() * this.maxRange) + 1;
    }

    this.tries = 0;
    this.currentPlayer = 1;
    this.minBound = 1;
    this.maxBound = this.maxRange;
    this.isOver = false;

    document.getElementById('guess-tries-count').textContent = '0';
    document.getElementById('guess-range-text').textContent = `1 - ${this.maxRange}`;
    document.getElementById('guess-meter-icon').textContent = '🎯';
    if (this.mode === 'player') {
      document.getElementById('guess-meter-text').textContent = `🔵 ${t.player1 || "1-O'yinchi"} ${t.yourTurn || "navbati"}`;
    } else {
      document.getElementById('guess-meter-text').textContent = t.pickOneTile;
    }
    document.getElementById('guess-meter').style.borderColor = 'var(--glass-border)';

    this.renderMatrix();
  },

  renderMatrix() {
    const box = document.getElementById('guess-matrix-box');
    if (!box) return;
    box.innerHTML = '';
    box.style.gridTemplateColumns = 'repeat(5, 1fr)';

    for (let i = 1; i <= this.maxRange; i++) {
      const tile = document.createElement('div');
      tile.className = 'guess-tile';
      tile.textContent = i;
      tile.id = 'gtile-' + i;
      tile.onclick = () => this.clickTile(i, true);
      box.appendChild(tile);
    }
  },

  clickTile(num, isLocal = false) {
    if (this.isOver) return;
    const tile = document.getElementById('gtile-' + num);
    if (!tile || tile.classList.contains('state-disabled')) return;

    // We no longer sync every click. We only sync the win.

    const t = this.t();
    this.tries++;
    document.getElementById('guess-tries-count').textContent = this.tries;

    const meterIcon = document.getElementById('guess-meter-icon');
    const meterText = document.getElementById('guess-meter-text');
    const meterBox = document.getElementById('guess-meter');

    if (num === this.target) {
      this.isOver = true;
      tile.className = 'guess-tile state-found';
      tile.textContent = '💎 ' + num;
      meterIcon.textContent = '💎';
      meterText.textContent = `${t.treasureFound} (${num})`;
      meterBox.style.borderColor = '#10b981';

      AudioEngine.guessFound();
      Confetti.fire(70);

      const pWinner = (this.mode === 'player') ? (this.currentPlayer === 1 ? (t.player1 || "1-O'yinchi") : (t.player2 || "2-O'yinchi")) : (t.chessYou || "Siz");

      if (isLocal && typeof Multiplayer !== 'undefined' && Multiplayer.connectedPeerId) {
        Multiplayer.sendGameMove({ type: 'guess_win', num: num, tries: this.tries });
      }

      setTimeout(() => {
        const title = (this.mode === 'player') ? `${pWinner} ${t.youWin || "yutdi!"} 🏆` : (t.treasureFound || "Xazina topildi!");
        App.showModal('💎', title, `<b>${pWinner}</b> ${this.tries} ${t.treasureFoundDesc || "urinishda topdi!"} (${this.target})`, () => {
          GuessNew.start();
        });
      }, 500);
      return;
    }

    const diff = Math.abs(num - this.target);
    if (diff <= 2) {
      tile.className = 'guess-tile state-hot';
      meterIcon.textContent = '🔥';
      meterText.textContent = (num < this.target) ? `${num} → ${t.tooHotHigher}` : `${num} → ${t.tooHotLower}`;
      meterBox.style.borderColor = '#ef4444';
      AudioEngine.guessHot();
    } else if (diff <= 6) {
      tile.className = 'guess-tile state-warm';
      meterIcon.textContent = '🌤️';
      meterText.textContent = (num < this.target) ? `${num} → ${t.warmHigher}` : `${num} → ${t.warmLower}`;
      meterBox.style.borderColor = '#f59e0b';
      AudioEngine.guessWarm();
    } else {
      tile.className = 'guess-tile state-cold';
      meterIcon.textContent = '❄️';
      meterText.textContent = (num < this.target) ? `${num} → ${t.coldHigher}` : `${num} → ${t.coldLower}`;
      meterBox.style.borderColor = '#3b82f6';
      AudioEngine.guessCold();
    }

    if (num < this.target) {
      if (num >= this.minBound) this.minBound = num + 1;
      for (let i = 1; i <= num; i++) {
        const item = document.getElementById('gtile-' + i);
        if (item && i !== num) item.classList.add('state-disabled');
      }
    } else {
      if (num <= this.maxBound) this.maxBound = num - 1;
      for (let i = num; i <= this.maxRange; i++) {
        const item = document.getElementById('gtile-' + i);
        if (item && i !== num) item.classList.add('state-disabled');
      }
    }
    document.getElementById('guess-range-text').textContent = `${this.minBound} - ${this.maxBound}`;

    if (this.mode === 'player' && (!window.Multiplayer || !Multiplayer.connectedPeerId)) {
      this.currentPlayer = (this.currentPlayer === 1) ? 2 : 1;
      const nextP = (this.currentPlayer === 1) ? `🔵 ${t.player1 || "1-O'yinchi"}` : `🟠 ${t.player2 || "2-O'yinchi"}`;
      meterText.textContent = `${nextP} ${t.yourTurn || "navbati"}! (${num < this.target ? '▲ Katta' : '▼ Kichik'})`;
    }
  },

  handleRemoteMove(data) {
    if (data.type === 'guess_sync_start') {
        this.maxRange = data.maxRange;
        document.getElementById('guess-tab-25').classList.toggle('active', this.maxRange === 25);
        document.getElementById('guess-tab-50').classList.toggle('active', this.maxRange === 50);
        this.target = data.target;
        this.start(false); // Guest starts with provided target
    } else if (data.type === 'guess_win') {
        this.isOver = true;
        const tile = document.getElementById('gtile-' + data.num);
        if (tile) {
            tile.className = 'guess-tile state-found';
            tile.textContent = '💎 ' + data.num;
        }
        AudioEngine.error();
        setTimeout(() => {
            const t = this.t();
            App.showModal('😭', "Mag'lubiyat!", `Raqib <b>${data.tries}</b> ta urinishda xazinani topdi!`, () => {
                if (Multiplayer.isHost) GuessNew.startMultiplayer(true);
            });
        }, 500);
    }
  }
};
