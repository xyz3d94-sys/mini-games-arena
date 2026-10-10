/* Rock - Paper - Scissors (Tosh - Qaychi - Qog'oz) Engine with Localization */
const RPS = {
  mode: 'bot',
  p1Score: 0,
  p2Score: 0,
  turn2P: 1,
  p1Choice: null,
  emojis: { rock: '✊', paper: '✋', scissors: '✌️' },

  init() {
    this.resetRound();
  },

  t() {
    return I18N[App.lang] || I18N.uz;
  },

  setMode(m) {
    AudioEngine.tap();
    this.mode = m; // 'bot' or 'player' (local 2P)
    const tabBot = document.getElementById('rps-tab-bot');
    const tabPlayer = document.getElementById('rps-tab-player');
    if (tabBot) tabBot.classList.toggle('active', m === 'bot');
    if (tabPlayer) tabPlayer.classList.toggle('active', m === 'player');

    const t = this.t();
    if (m === 'bot') {
      document.getElementById('rps-lbl-2').textContent = t.bot || 'Bot';
      document.getElementById('rps-name-2').textContent = t.bot || 'Bot';
      document.getElementById('rps-lbl-1').textContent = t.chessYou || 'Siz';
      document.getElementById('rps-name-1').textContent = t.chessYou || 'Siz';
    } else {
      document.getElementById('rps-lbl-2').textContent = `👥 ${t.player2 || "2-O'yinchi"}`;
      document.getElementById('rps-name-2').textContent = `👥 ${t.player2 || "2-O'yinchi"}`;
      document.getElementById('rps-lbl-1').textContent = `👤 ${t.player1 || "1-O'yinchi"}`;
      document.getElementById('rps-name-1').textContent = `👤 ${t.player1 || "1-O'yinchi"}`;
    }
    this.resetScore();
  },

  startMultiplayer(isHost) {
    this.mode = 'player';
    document.getElementById('rps-tab-bot').classList.remove('active');
    document.getElementById('rps-tab-player').classList.add('active');
    document.getElementById('rps-lbl-2').textContent = `👥 ${this.t().opponent}`;
    document.getElementById('rps-name-2').textContent = `👥 ${this.t().opponent}`;
    this.resetScore();
    App.showToast(this.t().rpsMakeChoice);
  },

  resetScore() {
    AudioEngine.tap();
    this.p1Score = 0;
    this.p2Score = 0;
    document.getElementById('rps-score-1').textContent = '0';
    document.getElementById('rps-score-2').textContent = '0';
    this.resetRound();
  },

  resetRound() {
    this.p1Choice = null;
    this.turn2P = 1;
    const h1 = document.getElementById('rps-hand-1');
    const h2 = document.getElementById('rps-hand-2');
    if (h1 && h2) {
      h1.textContent = '❔';
      h2.textContent = '❔';
      h1.className = 'rps-hand-circle';
      h2.className = 'rps-hand-circle';
    }
    const alertBox = document.getElementById('rps-status-alert');
    if (alertBox) {
      alertBox.textContent = this.t().rpsMakeChoice;
    }
  },

  play(choice) {
    AudioEngine.tap();
    const t = this.t();
    const h1 = document.getElementById('rps-hand-1');
    const h2 = document.getElementById('rps-hand-2');
    const alertBox = document.getElementById('rps-status-alert');

    if (this.mode === 'bot') {
      // If currently counting down / shaking, don't interrupt
      if (h1.classList.contains('shake')) return;

      // Clear any pending timeout
      if (this.roundTimeout) {
        clearTimeout(this.roundTimeout);
        this.roundTimeout = null;
      }

      // If previous round finished (has 'reveal'), reset classes immediately so new round starts!
      h1.classList.remove('reveal');
      h2.classList.remove('reveal');

      const list = ['rock', 'paper', 'scissors'];
      const botChoice = list[Math.floor(Math.random() * list.length)];

      h1.textContent = '✊'; h2.textContent = '✊';
      h1.classList.add('shake'); h2.classList.add('shake');
      alertBox.textContent = "1... 2... 3...";

      AudioEngine.rpsCount(1);
      setTimeout(() => AudioEngine.rpsCount(2), 220);
      setTimeout(() => AudioEngine.rpsCount(3), 440);

      setTimeout(() => {
        h1.classList.remove('shake'); h2.classList.remove('shake');
        h1.classList.add('reveal'); h2.classList.add('reveal');
        h1.textContent = this.emojis[choice];
        h2.textContent = this.emojis[botChoice];
        this.evalMatch(choice, botChoice, t.youWin, t.botWin);

        // After round result, invite to pick again to continue
        this.roundTimeout = setTimeout(() => {
          if (this.mode === 'bot' && !h1.classList.contains('shake')) {
            alertBox.textContent = t.rpsMakeChoice || "Tanlang va o'yin davom etadi!";
          }
        }, 2200);
      }, 650);
    } else {
      // If previous round was revealed, reset round immediately so user can pick next
      if (h1.classList.contains('reveal') || h2.classList.contains('reveal')) {
        this.resetRound();
      }

      if (typeof Multiplayer !== 'undefined' && Multiplayer.connectedPeerId) {
        // Connected online multiplayer
        if (this.p1Choice) return;
        this.p1Choice = choice;
        h1.textContent = '🔒';
        alertBox.textContent = t.rpsSavedWaiting || "Tanlov saqlandi. Raqib kutilmoqda...";
        Multiplayer.sendGameMove({ type: 'rps_pick', choice: choice });
        if (this.oppPendingChoice) {
          this.executeMultiplayerReveal(this.oppPendingChoice);
          this.oppPendingChoice = null;
        }
      } else {
        // Local 2-Player Pass & Play!
        if (h1.classList.contains('shake')) return;
        if (this.p1Choice === null) {
          this.p1Choice = choice;
          h1.textContent = '🔒';
          h1.className = 'rps-hand-circle';
          alertBox.textContent = `👥 ${t.player2 || "2-O'yinchi"} ${t.yourTurn || "navbati"}!`;
          if (App.showToast) App.showToast(`${t.player1 || "1-O'yinchi"} tanladi! Endi ${t.player2 || "2-O'yinchi"} tanlasin.`);
        } else {
          const p1 = this.p1Choice;
          const p2 = choice;
          this.p1Choice = null;

          h2.textContent = '🔒';
          h1.textContent = '✊'; h2.textContent = '✊';
          h1.className = 'rps-hand-circle shake';
          h2.className = 'rps-hand-circle shake';
          alertBox.textContent = "1... 2... 3...";

          AudioEngine.rpsCount(1);
          setTimeout(() => AudioEngine.rpsCount(2), 220);
          setTimeout(() => AudioEngine.rpsCount(3), 440);

          setTimeout(() => {
            h1.classList.remove('shake'); h2.classList.remove('shake');
            h1.classList.add('reveal'); h2.classList.add('reveal');
            h1.textContent = this.emojis[p1];
            h2.textContent = this.emojis[p2];

            const p1WinMsg = `${t.player1 || "1-O'yinchi"} ${t.youWin || "yutdi!"} 🏆`;
            const p2WinMsg = `${t.player2 || "2-O'yinchi"} ${t.youWin || "yutdi!"} 🏆`;
            this.evalMatch(p1, p2, p1WinMsg, p2WinMsg);

            this.roundTimeout = setTimeout(() => {
              this.resetRound();
            }, 2400);
          }, 700);
        }
      }
    }
  },

  handleRemoteMove(data) {
    if (data.type === 'rps_pick') {
      const oppChoice = data.choice;
      const t = this.t();
      const h2 = document.getElementById('rps-hand-2');

      if (this.p1Choice) {
        // Both have chosen, execute reveal
        this.executeMultiplayerReveal(oppChoice);
      } else {
        // Opponent chose first
        this.oppPendingChoice = oppChoice;
        h2.textContent = '🔒';
        document.getElementById('rps-status-alert').textContent = t.rpsOppReady;
      }
    } else if (data.type === 'rps_sync_score') {
        this.p1Score = data.p2Score; // Mirror
        this.p2Score = data.p1Score; // Mirror
        document.getElementById('rps-score-1').textContent = this.p1Score;
        document.getElementById('rps-score-2').textContent = this.p2Score;
    }
  },

  executeMultiplayerReveal(oppChoice) {
      const t = this.t();
      const h1 = document.getElementById('rps-hand-1');
      const h2 = document.getElementById('rps-hand-2');
      const alertBox = document.getElementById('rps-status-alert');

      h1.textContent = '✊'; h2.textContent = '✊';
      h1.className = 'rps-hand-circle shake';
      h2.className = 'rps-hand-circle shake';
      alertBox.textContent = "1... 2... 3...";

      AudioEngine.rpsCount(1);
      setTimeout(() => AudioEngine.rpsCount(2), 220);
      setTimeout(() => AudioEngine.rpsCount(3), 440);

      setTimeout(() => {
          h1.classList.remove('shake'); h2.classList.remove('shake');
          h1.classList.add('reveal'); h2.classList.add('reveal');
          h1.textContent = this.emojis[this.p1Choice];
          h2.textContent = this.emojis[oppChoice];
          this.evalMatch(this.p1Choice, oppChoice, t.youWin, t.oppWin);
          
          if (Multiplayer.isHost) {
              setTimeout(() => {
                  Multiplayer.sendGameMove({ type: 'rps_sync_score', p1Score: this.p1Score, p2Score: this.p2Score });
              }, 500);
          }

          setTimeout(() => {
              if (this.mode === 'player') this.resetRound();
          }, 2500);
      }, 650);
  },

  evalMatch(c1, c2, p1WinMsg, p2WinMsg) {
    const t = this.t();
    const alertBox = document.getElementById('rps-status-alert');

    // Play action sound based on gestures
    if (c1 === 'rock' || c2 === 'rock') AudioEngine.rpsRock();
    else if (c1 === 'scissors' || c2 === 'scissors') AudioEngine.rpsScissors();
    else if (c1 === 'paper' || c2 === 'paper') AudioEngine.rpsPaper();

    if (c1 === c2) {
      alertBox.textContent = t.draw;
      setTimeout(() => AudioEngine.tttDraw(), 200);
    } else if (
      (c1 === 'rock' && c2 === 'scissors') ||
      (c1 === 'paper' && c2 === 'rock') ||
      (c1 === 'scissors' && c2 === 'paper')
    ) {
      this.p1Score++;
      document.getElementById('rps-score-1').textContent = this.p1Score;
      alertBox.textContent = p1WinMsg;
      setTimeout(() => AudioEngine.win(), 250);
      Confetti.fire(45);
    } else {
      this.p2Score++;
      document.getElementById('rps-score-2').textContent = this.p2Score;
      alertBox.textContent = p2WinMsg;
      setTimeout(() => {
        if (this.mode === 'bot') AudioEngine.error(); else AudioEngine.win();
      }, 250);
    }

    if (this.p1Score >= 3 || this.p2Score >= 3) {
      if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
      const p1Won = (this.p1Score >= 3);
      const winTitle = p1Won ? (t.youWin || "G'alaba!") : (t.botWin || "Raqib g'alaba qozondi!");
      setTimeout(() => {
        App.showModal(p1Won ? '🏆' : '💥', winTitle, `${this.p1Score} - ${this.p2Score}`, () => RPS.resetScore());
      }, 650);
    }
  }
};
