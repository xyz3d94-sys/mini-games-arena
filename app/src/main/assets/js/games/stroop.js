/* =========================================================================
   COLOR BRAIN / STROOP TEST (RANGLI SO'ZLAR)
   - Giant bold color word in the center
   - Ink color may differ from semantic word text
   - 4 large thumb-friendly color buttons at bottom
   - 30-second timer: +1s for correct, -2s penalty for error
   - 10 points per correct answer
   - High Score persisted in localStorage ('stroop_high_score')
   - Fullscreen / card border flash animation on correct/wrong
   - Vibration and audio feedback
   ========================================================================= */

const StroopGame = {
  score: 0,
  highScore: 0,
  timeLeft: 30,
  timerInterval: null,
  isPlaying: false,
  combo: 0,
  isTrickRound: false,

  // 6 vibrant colors for high variety and cognitive challenge
  COLORS: [
    { id: 'red', hex: '#ef4444', emoji: '🔴' },
    { id: 'green', hex: '#22c55e', emoji: '🟢' },
    { id: 'blue', hex: '#3b82f6', emoji: '🔵' },
    { id: 'yellow', hex: '#eab308', emoji: '🟡' },
    { id: 'purple', hex: '#a855f7', emoji: '🟣' },
    { id: 'orange', hex: '#f97316', emoji: '🟠' }
  ],

  currentColorId: null, // The actual ink color
  currentWordColorId: null, // The semantic word meaning

  t() {
    return (typeof I18N !== 'undefined' && I18N[App.lang]) || {};
  },

  getColorName(colorId) {
    const t = this.t();
    switch (colorId) {
      case 'red': return t.colorRed || 'QIZIL';
      case 'green': return t.colorGreen || 'YASHIL';
      case 'blue': return t.colorBlue || "KO'K";
      case 'yellow': return t.colorYellow || 'SARIQ';
      case 'purple': return t.colorPurple || 'BINAFSHA';
      case 'orange': return t.colorOrange || "TO'Q SARIQ";
      default: return '';
    }
  },

  init() {
    this.loadHighScore();
    this.updateStatsUI();
    this.renderButtons(['red', 'green', 'blue', 'yellow']);
  },

  renderButtons(activeColorIds) {
    const arena = document.getElementById('stroop-active-arena');
    if (!arena) return;

    arena.innerHTML = '';
    activeColorIds.forEach(id => {
      const c = this.COLORS.find(x => x.id === id);
      if (!c) return;
      const btn = document.createElement('button');
      btn.className = `stroop-btn stroop-btn-${c.id}`;
      btn.onclick = () => StroopGame.chooseColor(c.id);
      btn.innerHTML = `<span>${this.getColorName(c.id)}</span>`;
      arena.appendChild(btn);
    });
  },

  loadHighScore() {
    try {
      const saved = localStorage.getItem('stroop_high_score');
      this.highScore = saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      this.highScore = 0;
    }
  },

  saveHighScore() {
    try {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('stroop_high_score', this.highScore.toString());
      }
    } catch (e) {}
  },

  start() {
    this.isPlaying = true;
    this.score = 0;
    this.timeLeft = 30;
    this.combo = 0;
    this.isTrickRound = false;
    this.loadHighScore();
    this.updateStatsUI();

    const startBtn = document.getElementById('stroop-start-btn');
    if (startBtn) startBtn.style.display = 'none';

    const gameArea = document.getElementById('stroop-active-arena');
    if (gameArea) gameArea.style.display = 'grid';

    const wordCard = document.getElementById('stroop-word-card');
    if (wordCard) wordCard.classList.remove('fever-mode');

    const trickAlert = document.getElementById('stroop-trick-banner');
    if (trickAlert) trickAlert.style.display = 'none';

    this.nextChallenge();
    this.startTimer();
  },

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateStatsUI();
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  nextChallenge() {
    // Dynamic difficulty: Trick Round probability increases with score/combo
    const trickProb = this.score >= 50 ? 0.35 : (this.combo >= 2 ? 0.25 : 0.15);
    this.isTrickRound = Math.random() < trickProb;

    // Pick ink color from all 6 colors
    const inkIndex = Math.floor(Math.random() * this.COLORS.length);
    this.currentColorId = this.COLORS[inkIndex].id;

    // Pick semantic word: 80% chance of conflicting color to invoke Stroop interference
    if (Math.random() < 0.80) {
      const otherColors = this.COLORS.filter((_, i) => i !== inkIndex);
      const chosen = otherColors[Math.floor(Math.random() * otherColors.length)];
      this.currentWordColorId = chosen.id;
    } else {
      this.currentWordColorId = this.currentColorId;
    }

    // Dynamic 4 button selection: MUST include the target answer and distractor
    const targetId = this.isTrickRound ? this.currentWordColorId : this.currentColorId;
    const distractorId = this.isTrickRound ? this.currentColorId : this.currentWordColorId;
    const pool = new Set([targetId, distractorId]);

    // Fill up to 4 distinct buttons randomly from the 6 colors
    const remaining = this.COLORS.map(c => c.id).filter(id => !pool.has(id)).sort(() => Math.random() - 0.5);
    for (const rId of remaining) {
      if (pool.size >= 4) break;
      pool.add(rId);
    }
    // Shuffle the 4 buttons on every challenge so player cannot rely on muscle memory!
    const buttonColors = Array.from(pool).sort(() => Math.random() - 0.5);
    this.renderButtons(buttonColors);

    const wordEl = document.getElementById('stroop-display-word');
    if (wordEl) {
      wordEl.textContent = this.getColorName(this.currentWordColorId);
      wordEl.style.color = this.COLORS[inkIndex].hex;
      wordEl.style.textShadow = `0 0 24px ${this.COLORS[inkIndex].hex}66`;

      // Dynamic subtle tilt (-5deg to +5deg) to break visual monotony
      const tilt = (Math.random() * 10 - 5).toFixed(1);
      wordEl.style.transform = `rotate(${tilt}deg)`;

      // Pop animation
      wordEl.classList.remove('stroop-pop');
      void wordEl.offsetWidth; // Trigger reflow
      wordEl.classList.add('stroop-pop');
    }

    // Update Mascot and Intrigue Banner
    const trickAlert = document.getElementById('stroop-trick-banner');
    const mascotIcon = document.getElementById('stroop-mascot-icon');
    const mascotTxt = document.getElementById('stroop-mascot-txt');
    const wordCard = document.getElementById('stroop-word-card');
    const t = this.t();

    if (this.isTrickRound) {
      if (trickAlert) {
        trickAlert.style.display = 'block';
        trickAlert.textContent = t.stroopTrickAlert || '⚡ DIQQAT: SO\'ZNING O\'ZINI BOSING! ⚡';
      }
      if (mascotIcon) mascotIcon.textContent = '⚡';
      if (mascotTxt) mascotTxt.textContent = t.stroopReverseMode || 'Teskari Rejim! Matnni bosing!';
      if (AudioEngine.stroopTrickAlert) AudioEngine.stroopTrickAlert();
    } else {
      if (trickAlert) trickAlert.style.display = 'none';

      if (this.combo >= 5) {
        if (mascotIcon) mascotIcon.textContent = '🔥';
        if (mascotTxt) mascotTxt.textContent = 'ULTRA FEVER! 2x';
        if (wordCard) wordCard.classList.add('fever-mode');
      } else if (this.combo >= 3) {
        if (mascotIcon) mascotIcon.textContent = '🤠';
        if (mascotTxt) mascotTxt.textContent = `${t.stroopCombo || 'Kombo'}: ${this.combo}x`;
        if (wordCard) wordCard.classList.remove('fever-mode');
      } else {
        if (mascotIcon) mascotIcon.textContent = '🧐';
        if (mascotTxt) mascotTxt.textContent = t.stroopFindTextColor || 'Matn rangini toping!';
        if (wordCard) wordCard.classList.remove('fever-mode');
      }
    }
  },

  chooseColor(chosenId) {
    if (!this.isPlaying) return;

    // In a Trick Round, player must choose the semantic word, not the ink color!
    const targetId = this.isTrickRound ? this.currentWordColorId : this.currentColorId;

    if (chosenId === targetId) {
      // Correct!
      this.combo++;
      const multiplier = Math.min(5, this.combo);
      const points = (this.isTrickRound ? 30 : 10) * (this.combo >= 5 ? 2 : 1);
      this.score += points;

      // Time reward: +1s, or +2s during fever
      const timeBonus = this.combo >= 5 ? 2 : 1;
      this.timeLeft = Math.min(99, this.timeLeft + timeBonus);

      this.saveHighScore();
      this.updateStatsUI();

      if (this.combo === 5 && AudioEngine.stroopFever) {
        AudioEngine.stroopFever();
        if (typeof Confetti !== 'undefined') Confetti.fire(20);
      } else {
        AudioEngine.stroopCorrect(this.combo);
      }

      this.triggerFlash('flash-success');
      const floatTxt = this.isTrickRound 
        ? `+${points} MASTER! (+${timeBonus}s)` 
        : (this.combo >= 5 ? `🔥 +${points} (+${timeBonus}s)` : `+${points} (+${timeBonus}s)`);
      this.showFloatingFloat(floatTxt, this.combo >= 5 ? '#f97316' : '#22c55e');

      this.nextChallenge();
    } else {
      // Wrong!
      this.combo = 0;
      this.timeLeft = Math.max(0, this.timeLeft - 2); // -2s penalty
      this.updateStatsUI();

      const mascotIcon = document.getElementById('stroop-mascot-icon');
      const mascotTxt = document.getElementById('stroop-mascot-txt');
      if (mascotIcon) mascotIcon.textContent = '😵';
      if (mascotTxt) mascotTxt.textContent = 'Xato! Kombo uzildi!';

      const wordCard = document.getElementById('stroop-word-card');
      if (wordCard) wordCard.classList.remove('fever-mode');

      AudioEngine.stroopWrong();
      this.triggerFlash('flash-error');
      this.showFloatingFloat('-2s', '#ef4444');

      const arena = document.getElementById('view-stroop');
      if (arena) {
        arena.classList.remove('screen-shake');
        void arena.offsetWidth;
        arena.classList.add('screen-shake');
      }

      if (this.timeLeft <= 0) {
        this.endGame();
      } else {
        this.nextChallenge();
      }
    }
  },

  triggerFlash(className) {
    const arena = document.getElementById('view-stroop');
    if (arena) {
      arena.classList.remove('flash-success', 'flash-error');
      void arena.offsetWidth;
      arena.classList.add(className);
      setTimeout(() => {
        arena.classList.remove(className);
      }, 250);
    }
  },

  showFloatingFloat(text, color) {
    const container = document.getElementById('stroop-word-card');
    if (!container) return;

    const el = document.createElement('div');
    el.className = 'stroop-float-feedback';
    el.textContent = text;
    el.style.color = color;
    container.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 600);
  },

  updateStatsUI() {
    const timeEl = document.getElementById('stroop-time-val');
    if (timeEl) {
      timeEl.textContent = `⏱️ ${this.timeLeft}s`;
      timeEl.style.color = this.timeLeft <= 5 ? '#ef4444' : '#f43f5e';
    }

    const scoreEl = document.getElementById('stroop-score-val');
    if (scoreEl) scoreEl.textContent = `⭐ ${this.score}`;

    const bestEl = document.getElementById('stroop-best-val');
    if (bestEl) bestEl.textContent = `🏆 ${this.highScore}`;

    const comboEl = document.getElementById('stroop-combo-val');
    if (comboEl) {
      comboEl.textContent = `🔥 ${this.combo}x`;
      comboEl.style.color = this.combo >= 5 ? '#f97316' : (this.combo >= 2 ? '#facc15' : '#94a3b8');
    }
  },

  endGame() {
    this.isPlaying = false;
    this.stopTimer();
    this.saveHighScore();
    this.updateStatsUI();

    AudioEngine.error();

    const startBtn = document.getElementById('stroop-start-btn');
    if (startBtn) {
      startBtn.style.display = 'block';
      const t = this.t();
      startBtn.textContent = `🔄 ${t.restart || 'Qayta Boshlash'}`;
    }

    const wordEl = document.getElementById('stroop-display-word');
    if (wordEl) {
      const t = this.t();
      wordEl.textContent = t.timeUp || 'Vaqt Tugadi!';
      wordEl.style.color = '#ef4444';
      wordEl.style.textShadow = 'none';
    }

    const t = this.t();
    const msg = (t.stroopOverDesc || "To'plangan ball: {score} | Rekord: {best}")
      .replace('{score}', this.score)
      .replace('{best}', this.highScore);
    
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`🏁 ${t.stroopOver || 'Vaqt tugadi!'} ${msg}`);
    }
  }
};
