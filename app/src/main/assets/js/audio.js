/* Web Audio API Engine & Haptics with Game-Specific Sound Effects */
const AudioEngine = {
  enabled: true,
  ctx: null,

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  playTone(freq, type = 'sine', duration = 0.08, vol = 0.12) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },

  playNoise(duration = 0.2, filterType = 'lowpass', filterFreq = 800, vol = 0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },

  vibrate(pattern = 30) {
    try {
      if (window.AndroidBridge && typeof window.AndroidBridge.vibrate === 'function') {
        const ms = Array.isArray(pattern) ? (pattern[0] || 50) : pattern;
        window.AndroidBridge.vibrate(Number(ms));
        return;
      }
    } catch (e) {}
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {}
  },

  tap() {
    this.playTone(550, 'sine', 0.05, 0.08);
    this.vibrate(15);
  },

  win() {
    if (!this.enabled) return;
    this.init();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.18, 0.15), i * 65);
    });
    this.vibrate([30, 40, 70]);
  },

  error() {
    if (!this.enabled) return;
    this.init();
    this.playTone(220, 'sawtooth', 0.2, 0.14);
    setTimeout(() => this.playTone(175, 'sawtooth', 0.22, 0.14), 100);
    this.vibrate([50, 40, 70]);
  },

  mineClick() {
    this.playTone(620, 'sine', 0.04, 0.08);
  },

  mineFlag() {
    this.playTone(880, 'triangle', 0.07, 0.12);
    this.vibrate(50);
  },

  mineExplode() {
    this.playNoise(0.5, 'lowpass', 280, 0.35);
    this.vibrate(300);
  },

  stroopCorrect(combo = 1) {
    const base = Math.min(1200, 580 + (combo * 60));
    this.playTone(base, 'sine', 0.05, 0.14);
    setTimeout(() => this.playTone(base * 1.33, 'sine', 0.08, 0.16), 55);
    if (combo >= 4) {
      setTimeout(() => this.playTone(base * 1.5, 'sine', 0.1, 0.18), 110);
    }
    this.vibrate(25);
  },

  stroopFever() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.12, 0.18), i * 50);
    });
    this.vibrate([40, 30, 60]);
  },

  stroopTrickAlert() {
    this.playTone(987.77, 'sawtooth', 0.1, 0.18);
    setTimeout(() => this.playTone(880, 'sawtooth', 0.12, 0.18), 90);
    this.vibrate([50, 40, 50]);
  },

  stroopWrong() {
    this.playTone(180, 'sawtooth', 0.16, 0.2);
    setTimeout(() => this.playTone(140, 'sawtooth', 0.18, 0.2), 80);
    this.vibrate([100, 40, 100]);
  },

  mazeStep(stepIndex = 1) {
    const baseFreq = 420 + Math.min(500, stepIndex * 45);
    this.playTone(baseFreq, 'sine', 0.07, 0.14);
    setTimeout(() => this.playTone(baseFreq * 1.25, 'triangle', 0.05, 0.12), 40);
    this.vibrate(18);
  },

  mazeUndo() {
    this.playTone(600, 'sine', 0.06, 0.12);
    setTimeout(() => this.playTone(420, 'sine', 0.08, 0.12), 45);
    this.vibrate(15);
  },

  mazeCelebrate() {
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.15, 0.2), i * 70);
    });
    this.vibrate([60, 40, 80, 40, 120]);
  },

  mazeInvalid() {
    this.playTone(200, 'sawtooth', 0.12, 0.15);
    this.vibrate(60);
  },

  fruitKey() {
    this.playTone(700, 'sine', 0.04, 0.08);
    this.vibrate(15);
  },

  fruitCorrect() {
    this.playTone(523.25, 'triangle', 0.1, 0.15);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.1, 0.15), 70);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.15, 0.18), 140);
    this.vibrate([25, 35, 60]);
  },

  fruitWrong() {
    this.playTone(240, 'sawtooth', 0.15, 0.2);
    setTimeout(() => this.playTone(190, 'sawtooth', 0.2, 0.2), 90);
    this.vibrate(180);
  },

  /* =========================================================================
     1. DENGIZ JANGI (BATTLESHIP) OVOZLARI
     ========================================================================= */
  bsSonar() {
    if (!this.enabled) return;
    this.init();
    try {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.75);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.75);
    } catch (e) {}
  },

  bsShot() {
    if (!this.enabled) return;
    this.init();
    try {
      if (!this.ctx) return;
      this.playNoise(0.08, 'bandpass', 1200, 0.25);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
      if (navigator.vibrate) try { navigator.vibrate([40, 20, 60]); } catch (e) {}
    } catch (e) {}
  },

  bsHit() {
    if (!this.enabled) return;
    this.init();
    try {
      if (!this.ctx) return;
      this.playTone(380, 'sawtooth', 0.12, 0.22);
      setTimeout(() => this.playTone(220, 'sawtooth', 0.18, 0.2), 30);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, this.ctx.currentTime + 0.55);
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.55);

      this.playNoise(0.45, 'lowpass', 420, 0.35);
      if (navigator.vibrate) try { navigator.vibrate([70, 40, 110, 40, 80]); } catch (e) {}
    } catch (e) {}
  },

  bsMiss() {
    if (!this.enabled) return;
    this.init();
    try {
      if (!this.ctx) return;
      this.playNoise(0.35, 'bandpass', 750, 0.22);
      this.playTone(180, 'sine', 0.15, 0.1);
      setTimeout(() => this.playNoise(0.2, 'lowpass', 500, 0.12), 80);
      if (navigator.vibrate) try { navigator.vibrate(15); } catch (e) {}
    } catch (e) {}
  },

  bsSink() {
    if (!this.enabled) return;
    this.init();
    try {
      if (!this.ctx) return;
      [98.0, 123.47, 146.83, 196.0].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (idx * 0.08));
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + (idx * 0.08));
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + (idx * 0.08));
        osc.stop(this.ctx.currentTime + 1.4);
      });
      this.playNoise(0.6, 'lowpass', 300, 0.25);
      if (navigator.vibrate) try { navigator.vibrate([100, 60, 200, 80, 250]); } catch (e) {}
    } catch (e) {}
  },

  bsPlace() {
    this.playTone(340, 'triangle', 0.06, 0.12);
  },

  sonar() { this.bsSonar(); },
  splash() { this.bsMiss(); },
  explosion() { this.bsHit(); },

  /* =========================================================================
     2. SEHRLI LABIRINT (MAGIC MAZE) OVOZLARI
     ========================================================================= */
  mazeStepSound() {
    if (!this.enabled) return;
    this.init();
    try {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
      if (navigator.vibrate) try { navigator.vibrate(8); } catch (e) {}
    } catch (e) {}
  },

  mazeWall() {
    if (!this.enabled) return;
    this.playTone(130, 'triangle', 0.08, 0.1);
    if (navigator.vibrate) try { navigator.vibrate(25); } catch (e) {}
  },

  mazeStar() {
    if (!this.enabled) return;
    this.init();
    [1046.5, 1318.5, 1568.0, 2093.0].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.14, 0.12), i * 45);
    });
    if (navigator.vibrate) try { navigator.vibrate([20, 30, 40]); } catch (e) {}
  },

  mazeExit() {
    if (!this.enabled) return;
    this.init();
    [440, 554, 659, 880, 1108].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.22, 0.15), i * 70);
    });
    if (navigator.vibrate) try { navigator.vibrate([50, 40, 80, 40, 100]); } catch (e) {}
  },

  /* =========================================================================
     3. X VA O (TIC-TAC-TOE) OVOZLARI
     ========================================================================= */
  tttPlaceX() {
    if (!this.enabled) return;
    this.playTone(840, 'triangle', 0.05, 0.15);
    if (navigator.vibrate) try { navigator.vibrate(18); } catch (e) {}
  },

  tttPlaceO() {
    if (!this.enabled) return;
    this.init();
    try {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
      if (navigator.vibrate) try { navigator.vibrate(20); } catch (e) {}
    } catch (e) {}
  },

  tttWin() {
    this.win();
  },

  tttDraw() {
    if (!this.enabled) return;
    this.playTone(392, 'sine', 0.18, 0.1);
    setTimeout(() => this.playTone(370, 'sine', 0.25, 0.1), 120);
  },

  /* =========================================================================
     4. TEZKOR MATEMATIKA (SPEED MATH) OVOZLARI
     ========================================================================= */
  mathCorrect(streak = 0) {
    if (!this.enabled) return;
    this.init();
    const baseFreq = Math.min(1300, 587.3 + (streak * 65));
    try {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
      if (navigator.vibrate) try { navigator.vibrate(25); } catch (e) {}
    } catch (e) {}
  },

  mathWrong() {
    if (!this.enabled) return;
    this.init();
    try {
      if (!this.ctx) return;
      [145, 137].forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      });
      if (navigator.vibrate) try { navigator.vibrate([60, 40, 80]); } catch (e) {}
    } catch (e) {}
  },

  mathTick() {
    if (!this.enabled) return;
    this.playTone(1150, 'sine', 0.025, 0.07);
  },

  /* =========================================================================
     5. XAZINA SONNI TOP (TREASURE GUESSER) OVOZLARI
     ========================================================================= */
  guessHot() {
    if (!this.enabled) return;
    this.init();
    this.playNoise(0.14, 'bandpass', 1200, 0.14);
    this.playTone(880, 'sine', 0.1, 0.16);
    if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {}
  },

  guessWarm() {
    if (!this.enabled) return;
    this.playTone(523.25, 'sine', 0.12, 0.12);
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.1), 40);
  },

  guessCold() {
    if (!this.enabled) return;
    this.init();
    this.playTone(1760, 'sine', 0.15, 0.1);
    setTimeout(() => this.playTone(2217, 'sine', 0.12, 0.08), 50);
  },

  guessFound() {
    if (!this.enabled) return;
    this.init();
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.18, 0.16), i * 60);
    });
    [1500, 1850, 2100, 2400].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.08, 0.12), 350 + (i * 70));
    });
    if (navigator.vibrate) try { navigator.vibrate([40, 50, 70, 50, 120]); } catch (e) {}
  },

  /* =========================================================================
     6. TOSH - QAYCHI - QOG'OZ (ROCK-PAPER-SCISSORS) OVOZLARI
     ========================================================================= */
  rpsCount(step = 1) {
    if (!this.enabled) return;
    const freqs = [220, 261.6, 329.6];
    const f = freqs[Math.min(2, Math.max(0, step - 1))];
    this.playTone(f, 'triangle', 0.08, 0.18);
    if (navigator.vibrate) try { navigator.vibrate(20); } catch (e) {}
  },

  rpsRock() {
    if (!this.enabled) return;
    this.init();
    try {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
      this.playNoise(0.2, 'lowpass', 350, 0.22);
      if (navigator.vibrate) try { navigator.vibrate(45); } catch (e) {}
    } catch (e) {}
  },

  rpsScissors() {
    if (!this.enabled) return;
    this.init();
    this.playTone(1500, 'sawtooth', 0.04, 0.15);
    setTimeout(() => this.playTone(1900, 'sawtooth', 0.05, 0.15), 35);
    if (navigator.vibrate) try { navigator.vibrate([15, 20, 15]); } catch (e) {}
  },

  rpsPaper() {
    if (!this.enabled) return;
    this.playNoise(0.18, 'bandpass', 1800, 0.2);
    if (navigator.vibrate) try { navigator.vibrate(20); } catch (e) {}
  },

  /* =========================================================================
     7. MULTIPLAYER & TIZIM OVOZLARI (SYSTEM & NOTIFICATION SOUNDS)
     ========================================================================= */
  inviteAlert() {
    if (!this.enabled) return;
    this.init();
    const tones = [587.33, 739.99, 880.0];
    tones.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.18, 0.22), i * 110);
    });
    setTimeout(() => {
      tones.forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.14, 0.18), i * 100);
      });
    }, 450);
    if (navigator.vibrate) try { navigator.vibrate([100, 80, 150, 80, 200]); } catch (e) {}
  },

  match() {
    this.chessCapture();
  },

  chessCapture() {
    if (!this.enabled) return;
    this.init();
    try {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);

      setTimeout(() => {
        try {
          if (!this.ctx) return;
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'sine';
          const t2 = this.ctx.currentTime;
          osc2.frequency.setValueAtTime(220, t2);
          osc2.frequency.exponentialRampToValueAtTime(60, t2 + 0.06);
          gain2.gain.setValueAtTime(0.18, t2);
          gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.07);
          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);
          osc2.start(t2);
          osc2.stop(t2 + 0.07);
        } catch (e) {}
      }, 40);
    } catch (e) {}
    if (navigator.vibrate) try { navigator.vibrate(28); } catch (e) {}
  },

  matchStart() {
    if (!this.enabled) return;
    this.init();
    [440, 554.37, 659.25, 880, 1108.7].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.15, 0.2), i * 55);
    });
    if (navigator.vibrate) try { navigator.vibrate([50, 40, 90]); } catch (e) {}
  },

  dotaMatchFound() {
    if (!this.enabled) return;
    this.init();
    try {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.4);
      gain1.gain.setValueAtTime(0.45, this.ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start();
      osc1.stop(this.ctx.currentTime + 0.5);

      [261.63, 392.0, 523.25, 659.25, 783.99].forEach((f, i) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(f, this.ctx.currentTime);
          gain2.gain.setValueAtTime(0.2, this.ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);
          osc2.start();
          osc2.stop(this.ctx.currentTime + 1.2);
        }, i * 35);
      });
      if (navigator.vibrate) try { navigator.vibrate([120, 80, 200, 100, 300]); } catch (e) {}
    } catch (e) {}
  },

  turnAlert() {
    if (!this.enabled) return;
    this.init();
    this.playTone(659.25, 'sine', 0.08, 0.12);
    setTimeout(() => this.playTone(880, 'sine', 0.12, 0.15), 70);
    if (navigator.vibrate) try { navigator.vibrate(20); } catch (e) {}
  },

  /* =========================================================================
     8. PROCEDURAL AMBIENT CHILLOUT GAME SOUNDTRACK (LO-FI CHORD PADS)
     ========================================================================= */
  musicEnabled: false,
  musicTimer: null,
  musicStep: 0,
  musicGain: null,

  chordPadNotes: [
    [220.0, 261.63, 329.63, 392.0],
    [174.61, 220.0, 261.63, 329.63],
    [130.81, 196.0, 246.94, 329.63],
    [196.0, 261.63, 293.66, 392.0]
  ],

  arpeggioMelody: [
    523.25, 659.25, 392.0, 440.0,  523.25, 392.0, 659.25, 783.99,
    440.0,  523.25, 329.63, 392.0, 440.0,  523.25, 659.25, 523.25,
    329.63, 392.0,  493.88, 523.25, 392.0,  523.25, 659.25, 587.33,
    392.0,  523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25
  ],

  basslineNotes: [
    110.0, 110.0, 87.31, 87.31, 65.41, 65.41, 98.0, 98.0
  ],

  startMusic() {
    if (!this.musicEnabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.musicTimer) return;

    this.musicStep = 0;
    const stepDuration = 240;

    this.musicTimer = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) {
        this.stopMusic();
        return;
      }
      try {
        const step = this.musicStep % 32;

        if (step % 8 === 0) {
          const chordIdx = Math.floor(step / 8);
          const chord = this.chordPadNotes[chordIdx];
          chord.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.018, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 1.8);
          });
        }

        const note = this.arpeggioMelody[step];
        if (note > 0) {
          const mOsc = this.ctx.createOscillator();
          const mGain = this.ctx.createGain();
          mOsc.type = 'triangle';
          mOsc.frequency.setValueAtTime(note, this.ctx.currentTime);
          mGain.gain.setValueAtTime(0.024, this.ctx.currentTime);
          mGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.22);
          mOsc.connect(mGain);
          mGain.connect(this.ctx.destination);
          mOsc.start();
          mOsc.stop(this.ctx.currentTime + 0.22);
        }

        if (step % 4 === 0) {
          const bIdx = Math.floor(step / 4) % this.basslineNotes.length;
          const bFreq = this.basslineNotes[bIdx];
          const bOsc = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bOsc.type = 'sine';
          bOsc.frequency.setValueAtTime(bFreq, this.ctx.currentTime);
          bGain.gain.setValueAtTime(0.038, this.ctx.currentTime);
          bGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.45);
          bOsc.connect(bGain);
          bGain.connect(this.ctx.destination);
          bOsc.start();
          bOsc.stop(this.ctx.currentTime + 0.45);
        }

        this.musicStep++;
      } catch (e) {}
    }, stepDuration);
  },

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  },

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    try { localStorage.setItem('app_music_enabled', this.musicEnabled ? '1' : '0'); } catch (e) {}
    const btn = document.getElementById('music-btn');
    if (btn) {
      btn.textContent = this.musicEnabled ? '🎵' : '🔇';
      btn.style.opacity = this.musicEnabled ? '1' : '0.6';
    }
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  },

  toggleSound() {
    this.enabled = !this.enabled;
    this.musicEnabled = this.enabled;
    try {
      localStorage.setItem('app_sound_enabled', this.enabled ? '1' : '0');
      localStorage.setItem('app_music_enabled', this.musicEnabled ? '1' : '0');
    } catch (e) {}
    const btn = document.getElementById('sound-btn');
    if (btn) btn.textContent = this.enabled ? '🔊' : '🔇';
    if (this.enabled) {
      this.tap();
      this.startMusic();
    } else {
      this.stopMusic();
    }
  },

  loadPreferences() {
    try {
      const snd = localStorage.getItem('app_sound_enabled');
      if (snd !== null) this.enabled = (snd === '1');
      const mus = localStorage.getItem('app_music_enabled');
      if (mus !== null) this.musicEnabled = (mus === '1');
      else this.musicEnabled = true;
    } catch (e) {}
    const sndBtn = document.getElementById('sound-btn');
    if (sndBtn) sndBtn.textContent = this.enabled ? '🔊' : '🔇';
    if (this.musicEnabled && this.enabled) {
      setTimeout(() => this.startMusic(), 800);
    }
  }
};

const unlockWebAudio = () => {
  AudioEngine.init();
  if (AudioEngine.ctx && AudioEngine.ctx.state === 'suspended') {
    AudioEngine.ctx.resume().then(() => {
      try {
        const buf = AudioEngine.ctx.createBuffer(1, 1, 22050);
        const src = AudioEngine.ctx.createBufferSource();
        src.buffer = buf;
        src.connect(AudioEngine.ctx.destination);
        src.start(0);
      } catch (e) {}
      if (AudioEngine.musicEnabled && !AudioEngine.musicTimer) {
        AudioEngine.startMusic();
      }
    }).catch(() => {});
  }
};
['touchstart', 'touchend', 'click', 'pointerdown'].forEach(evt => {
  window.addEventListener(evt, unlockWebAudio, { passive: true });
});

/* Confetti Particle System */
const Confetti = {
  cvs: null, ctx: null, list: [], anim: null,
  init() {
    this.cvs = document.getElementById('confetti-cvs');
    if (this.cvs) {
      this.ctx = this.cvs.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  },
  resize() {
    if (!this.cvs) return;
    this.cvs.width = window.innerWidth;
    this.cvs.height = window.innerHeight;
  },
  fire(count = 30) {
    if (!this.cvs) this.init();
    const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];
    for (let i = 0; i < Math.min(35, count); i++) {
      this.list.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 3,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: Math.random() * 0.02 + 0.015
      });
    }
    if (!this.anim) this.loop();
  },
  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.3;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > window.innerHeight) {
        this.list.splice(i, 1);
        continue;
      }
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    this.ctx.globalAlpha = 1.0;
    if (this.list.length > 0) this.anim = requestAnimationFrame(() => this.loop());
    else {
      this.anim = null;
      this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    }
  }
};