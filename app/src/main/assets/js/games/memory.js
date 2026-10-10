/* Memory Game (Xotira Mashqi) Engine
   - 4x4 Responsive Grid
   - 100% i18n support (UZ, EN, RU, TR)
   - Flip animations and sound effects
*/
const MemoryGame = {
  emojis: ['🐼', '🐯', '🐻', '🐸', '🦁', '🐱', '🐮', '🦌', '🐑', '🐰', '🦊', '🦨'],
  cards: [],
  flipped: [],
  matched: 0,
  score: 0,
  moves: 0,
  timer: null,
  timeElapsed: 0,
  isOver: false,
  isLocked: false,

  t() {
    return I18N[App.lang] || I18N.uz;
  },

  init() {},

  updateUIStrings() {
    const t = this.t();
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el && txt) el.textContent = txt;
    };
    setTxt('memory-header-title', t.mMemoryTitle || "Memory Match");
    setTxt('memory-lbl-score', t.score || "SCORE");
    setTxt('memory-lbl-moves', t.tries || "MOVES");
    setTxt('memory-lbl-time', t.timeElapsedText || "TIME");
  },

  start() {
    this.stop();
    this.isOver = false;
    this.isLocked = false;
    this.matched = 0;
    this.score = 0;
    this.moves = 0;
    this.timeElapsed = 0;
    this.flipped = [];

    this.updateUIStrings();

    const scoreEl = document.getElementById('memory-score-val');
    const movesEl = document.getElementById('memory-moves-val');
    const timeEl = document.getElementById('memory-time-val');
    if (scoreEl) scoreEl.textContent = '⭐ 0';
    if (movesEl) movesEl.textContent = '0';
    if (timeEl) timeEl.textContent = '⏱️ 0s';

    this.timer = setInterval(() => {
      this.timeElapsed++;
      const tEl = document.getElementById('memory-time-val');
      if (tEl) tEl.textContent = `⏱️ ${this.timeElapsed}s`;
    }, 1000);

    // Pick 8 random animals (16 cards total = 4x4 grid)
    const shuffledEmojis = [...this.emojis].sort(() => Math.random() - 0.5).slice(0, 8);
    const deck = this.generateNonAdjacentDeck(shuffledEmojis);

    this.cards = deck.map((emoji, index) => ({
      id: index,
      emoji: emoji,
      isFlipped: false,
      isMatched: false
    }));

    this.render();
  },

  // Generates a 4x4 grid where identical cards are NEVER adjacent (horizontally, vertically, or diagonally)
  generateNonAdjacentDeck(selectedEmojis) {
    const isAdjacent = (i1, i2) => {
      const r1 = Math.floor(i1 / 4), c1 = i1 % 4;
      const r2 = Math.floor(i2 / 4), c2 = i2 % 4;
      return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
    };

    for (let attempt = 0; attempt < 2000; attempt++) {
      const grid = Array(16).fill(null);
      let success = true;

      for (let p = 0; p < selectedEmojis.length; p++) {
        const e = selectedEmojis[p];
        const emptySlots = [];
        for (let i = 0; i < 16; i++) {
          if (grid[i] === null) emptySlots.push(i);
        }
        emptySlots.sort(() => Math.random() - 0.5);

        let placed = false;
        for (let a = 0; a < emptySlots.length; a++) {
          for (let b = a + 1; b < emptySlots.length; b++) {
            const s1 = emptySlots[a];
            const s2 = emptySlots[b];
            if (!isAdjacent(s1, s2)) {
              grid[s1] = e;
              grid[s2] = e;
              placed = true;
              break;
            }
          }
          if (placed) break;
        }

        if (!placed) {
          success = false;
          break;
        }
      }

      if (success) {
        return grid;
      }
    }

    // Guaranteed mathematical fallback layout where dr >= 2, dc >= 2 for all pairs
    const e = selectedEmojis;
    return [
      e[0], e[1], e[2], e[3],
      e[4], e[5], e[6], e[7],
      e[2], e[3], e[0], e[1],
      e[6], e[7], e[4], e[5]
    ];
  },

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  restart() {
    AudioEngine.tap();
    this.start();
  },

  flipCard(index) {
    if (this.isOver || this.isLocked) return;
    const card = this.cards[index];
    if (!card || card.isFlipped || card.isMatched) return;

    AudioEngine.tap();
    card.isFlipped = true;
    this.flipped.push(index);
    this.updateCardDOM(index);

    if (this.flipped.length === 2) {
      this.moves++;
      const movesEl = document.getElementById('memory-moves-val');
      if (movesEl) movesEl.textContent = `${this.moves}`;

      this.isLocked = true;
      setTimeout(() => this.checkMatch(), 600);
    }
  },

  checkMatch() {
    if (this.flipped.length < 2) {
      this.isLocked = false;
      return;
    }
    const [i1, i2] = this.flipped;
    const card1 = this.cards[i1];
    const card2 = this.cards[i2];

    if (card1 && card2 && card1.emoji === card2.emoji) {
      card1.isMatched = true;
      card2.isMatched = true;
      this.matched += 2;
      this.score += 10;
      AudioEngine.win();
      const scoreEl = document.getElementById('memory-score-val');
      if (scoreEl) scoreEl.textContent = `⭐ ${this.score}`;

      this.updateCardDOM(i1);
      this.updateCardDOM(i2);

      if (this.matched === this.cards.length) {
        setTimeout(() => this.gameOver(), 400);
      }
    } else {
      if (card1) card1.isFlipped = false;
      if (card2) card2.isFlipped = false;
      AudioEngine.error();
      this.updateCardDOM(i1);
      this.updateCardDOM(i2);
    }

    this.flipped = [];
    this.isLocked = false;
  },

  updateCardDOM(index) {
    const card = this.cards[index];
    const el = document.getElementById('memory-card-' + index);
    if (!el || !card) return;

    if (card.isMatched) {
      el.className = 'mem-card matched';
      el.textContent = card.emoji;
    } else if (card.isFlipped) {
      el.className = 'mem-card flipped';
      el.textContent = card.emoji;
    } else {
      el.className = 'mem-card card-back';
      el.textContent = '❓';
    }
  },

  render() {
    const board = document.getElementById('memory-board');
    if (!board) return;
    board.innerHTML = '';

    this.cards.forEach((card, index) => {
      const el = document.createElement('div');
      el.id = 'memory-card-' + index;
      el.className = 'mem-card' + (card.isFlipped ? ' flipped' : '') + (card.isMatched ? ' matched' : ' card-back');
      el.textContent = (card.isFlipped || card.isMatched) ? card.emoji : '❓';
      el.onclick = () => this.flipCard(index);
      board.appendChild(el);
    });
  },

  gameOver() {
    this.isOver = true;
    this.stop();
    Confetti.fire(60);

    const t = this.t();
    const title = t.youWin || "Victory!";
    const desc = `${t.pointsEarned || "Points:"} <b>${this.score}</b><br>${t.tries || "Moves:"} <b>${this.moves}</b><br>${t.timeElapsedText || "Time:"} <b>${this.timeElapsed}s</b>`;

    App.showModal('🎉', title, desc, () => this.start());
  }
};
