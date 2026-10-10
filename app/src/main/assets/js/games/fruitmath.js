/**
 * MEVALI TENGLAMALAR (Algebraic Fruit Puzzle)
 * System of equations using cartoon fruit variables.
 * Calculates order of operations (PEMDAS) correctly.
 */

const FruitGame = {
  level: 1,
  score: 0,
  streak: 0,
  currentProblem: null,
  currentInput: '',
  isAnswered: false,

  // Curated educational levels with clear logic
  handcraftedLevels: [
    {
      level: 1,
      rows: [
        { left: ['🍉', '+', '🍉'], right: 40 },
        { left: ['🍉', '+', '🍏'], right: 50 },
        { left: ['🍉', '+', '🍊', '+', '🍏'], right: 90 },
      ],
      target: { left: ['🍉', '+', '🍏', '×', '🍊'] },
      values: { '🍉': 20, '🍏': 30, '🍊': 40 },
      answer: 1220, // 20 + (30 * 40) = 20 + 1200 = 1220
      explanation: "🍉 = 20\n🍏 = 30\n🍊 = 40\nAmal: 20 + 30 × 40 = 20 + 1200 = 1220"
    },
    {
      level: 2,
      rows: [
        { left: ['🍏', '+', '🍏', '+', '🍏'], right: 30 },
        { left: ['🍏', '+', '🍌', '+', '🍌'], right: 26 },
        { left: ['🍌', '+', '🍓'], right: 17 },
      ],
      target: { left: ['🍓', '+', '🍏', '×', '🍌'] },
      values: { '🍏': 10, '🍌': 8, '🍓': 9 },
      answer: 89, // 9 + (10 * 8) = 89
      explanation: "🍏 = 10\n🍌 = 8\n🍓 = 9\nAmal: 9 + 10 × 8 = 9 + 80 = 89"
    },
    {
      level: 3,
      rows: [
        { left: ['🍇', '+', '🍇'], right: 24 },
        { left: ['🍇', '-', '🍊'], right: 5 },
        { left: ['🍊', '+', '🍉'], right: 27 },
      ],
      target: { left: ['(', '🍉', '-', '🍇', ')', '×', '🍊'] },
      values: { '🍇': 12, '🍊': 7, '🍉': 20 },
      answer: 56, // (20 - 12) * 7 = 8 * 7 = 56
      explanation: "🍇 = 12\n🍊 = 7\n🍉 = 20\nAmal: (20 - 12) × 7 = 8 × 7 = 56"
    },
    {
      level: 4,
      rows: [
        { left: ['🍍', '+', '🍍'], right: 50 },
        { left: ['🍍', '+', '🍓'], right: 40 },
        { left: ['🍓', '+', '🍌'], right: 20 },
      ],
      target: { left: ['🍍', '+', '🍓', '×', '🍌'] },
      values: { '🍍': 25, '🍓': 15, '🍌': 5 },
      answer: 100, // 25 + 15 * 5 = 25 + 75 = 100
      explanation: "🍍 = 25\n🍓 = 15\n🍌 = 5\nAmal: 25 + 15 × 5 = 25 + 75 = 100"
    },
    {
      level: 5,
      rows: [
        { left: ['🍉', '+', '🍉', '+', '🍉'], right: 60 },
        { left: ['🍉', '+', '🍏', '+', '🍏'], right: 44 },
        { left: ['🍏', '+', '🍇'], right: 27 },
      ],
      target: { left: ['🍉', '×', '🍏', '-', '🍇'] },
      values: { '🍉': 20, '🍏': 12, '🍇': 15 },
      answer: 225, // 20 * 12 - 15 = 240 - 15 = 225
      explanation: "🍉 = 20\n🍏 = 12\n🍇 = 15\nAmal: 20 × 12 - 15 = 240 - 15 = 225"
    }
  ],

  init() {
    const saved = localStorage.getItem('arena_fruitmath_lvl');
    if (saved) {
      this.level = Math.max(1, parseInt(saved, 10) || 1);
    }
  },

  start(lvl) {
    if (lvl) this.level = lvl;
    this.isAnswered = false;
    this.currentInput = '';

    // Load handcrafted or generate procedural problem
    const predefined = this.handcraftedLevels.find(l => l.level === this.level);
    if (predefined) {
      this.currentProblem = predefined;
    } else {
      this.currentProblem = this.generateProcedural();
    }

    this.renderChalkboard();
    this.renderOptions();
    this.updateDashboard();

    const solBox = document.getElementById('fruit-solution-box');
    if (solBox) solBox.style.display = 'none';

    const submitBtn = document.getElementById('fruit-submit-btn');
    if (submitBtn) submitBtn.textContent = i18n.t('fruitMathCheck') || "Tekshirish";
  },

  generateProcedural() {
    const fruits = ['🍉', '🍏', '🍊', '🍌', '🍓', '🍇', '🍍'];
    // Shuffle and pick 3 fruits
    const shuffled = [...fruits].sort(() => 0.5 - Math.random());
    const [A, B, C] = [shuffled[0], shuffled[1], shuffled[2]];

    const valA = Math.floor(Math.random() * 15) + 10; // 10..24
    const valB = Math.floor(Math.random() * 12) + 5;  // 5..16
    const valC = Math.floor(Math.random() * 8) + 2;   // 2..9

    const r1Right = valA * 2;
    const r2Right = valA + valB;
    const r3Right = valA + valB + valC;

    // Target: A + B * C
    const answer = valA + (valB * valC);

    return {
      level: this.level,
      rows: [
        { left: [A, '+', A], right: r1Right },
        { left: [A, '+', B], right: r2Right },
        { left: [A, '+', B, '+', C], right: r3Right }
      ],
      target: { left: [A, '+', B, '×', C] },
      values: { [A]: valA, [B]: valB, [C]: valC },
      answer: answer,
      explanation: `${A} = ${valA}\n${B} = ${valB}\n${C} = ${valC}\nAmal: ${valA} + ${valB} × ${valC} = ${valA} + ${valB * valC} = ${answer}`
    };
  },

  renderChalkboard() {
    const board = document.getElementById('fruit-board');
    if (!board || !this.currentProblem) return;

    let html = '';

    // Render known equations
    this.currentProblem.rows.forEach(r => {
      const leftHtml = r.left.map(token => {
        if (['+', '-', '×', '=', '(', ')'].includes(token)) {
          return `<span class="fruitmath-op">${token}</span>`;
        }
        return `<span class="fruitmath-icon">${token}</span>`;
      }).join(' ');

      html += `
        <div class="fruitmath-row">
          <div class="fruitmath-eq-left">${leftHtml}</div>
          <div class="fruitmath-op">=</div>
          <div class="fruitmath-eq-val">${r.right}</div>
        </div>
      `;
    });

    // Render Target Row
    const targetHtml = this.currentProblem.target.left.map(token => {
      if (['+', '-', '×', '=', '(', ')'].includes(token)) {
        return `<span class="fruitmath-op">${token}</span>`;
      }
      return `<span class="fruitmath-icon">${token}</span>`;
    }).join(' ');

    html += `
      <div class="fruitmath-row fruitmath-target-row">
        <div class="fruitmath-eq-left">${targetHtml}</div>
        <div class="fruitmath-op">=</div>
        <div class="fruitmath-q-mark">?</div>
      </div>
    `;

    board.innerHTML = html;
  },

  renderOptions() {
    const container = document.getElementById('fruit-options-grid');
    if (!container || !this.currentProblem) return;

    const correct = this.currentProblem.answer;

    // Distractor 1: Left-to-right (ignoring PEMDAS) e.g. (A + B) * C
    const vals = this.currentProblem.values;
    const fruits = Object.keys(vals);
    let distractor1 = correct + 10;
    if (fruits.length >= 3) {
      const [f1, f2, f3] = fruits;
      distractor1 = (vals[f1] + vals[f2]) * vals[f3];
    }
    if (distractor1 === correct) distractor1 = correct + 15;

    // Distractor 2 & 3: Off by small adjustments
    const distractor2 = Math.max(1, correct - Math.floor(Math.random() * 8 + 3));
    const distractor3 = correct + Math.floor(Math.random() * 12 + 4);

    const choices = Array.from(new Set([correct, distractor1, distractor2, distractor3]));
    while (choices.length < 4) {
      choices.push(correct + choices.length * 5);
    }
    choices.sort(() => 0.5 - Math.random());

    container.innerHTML = choices.map(opt => `
      <button class="fruitmath-option-btn" onclick="FruitGame.handleQuickChoice(${opt})">${opt}</button>
    `).join('');
  },

  handleQuickChoice(val) {
    if (this.isAnswered) return;
    this.currentInput = String(val);
    this.updateInputDisplay();
    this.submitAnswer();
  },

  pressKey(key) {
    if (this.isAnswered) return;
    if (typeof AudioEngine !== 'undefined' && AudioEngine.fruitKey) {
      AudioEngine.fruitKey();
    }

    if (key === 'C') {
      this.currentInput = '';
    } else if (key === 'back') {
      this.currentInput = this.currentInput.slice(0, -1);
    } else {
      if (this.currentInput.length < 7) {
        this.currentInput += key;
      }
    }
    this.updateInputDisplay();
  },

  updateInputDisplay() {
    const disp = document.getElementById('fruit-input-val');
    if (disp) {
      disp.textContent = this.currentInput || '?';
    }
  },

  submitAnswer() {
    if (!this.currentInput || !this.currentProblem) return;

    if (this.isAnswered) {
      // If already solved, this button advances to next level
      this.level++;
      localStorage.setItem('arena_fruitmath_lvl', this.level);
      this.start();
      return;
    }

    const entered = parseInt(this.currentInput, 10);
    const correct = this.currentProblem.answer;

    const solBox = document.getElementById('fruit-solution-box');
    const submitBtn = document.getElementById('fruit-submit-btn');

    if (entered === correct) {
      // CORRECT!
      this.isAnswered = true;
      this.score += 20 + (this.streak * 5);
      this.streak++;

      if (typeof AudioEngine !== 'undefined' && AudioEngine.fruitCorrect) {
        AudioEngine.fruitCorrect();
      }
      if (typeof App !== 'undefined' && App.launchConfetti) {
        App.launchConfetti();
      }

      if (solBox) {
        solBox.innerHTML = `
          <div style="color:#4ade80; font-weight:900; font-size:14px; margin-bottom:4px;">
            ${i18n.t('fruitMathSuccess') || "To'g'ri javob! Barakalla! 🌟"}
          </div>
          <div style="white-space:pre-line;">${this.currentProblem.explanation}</div>
        `;
        solBox.style.display = 'block';
      }

      if (submitBtn) {
        submitBtn.textContent = i18n.t('fruitMathNext') || "Keyingi ➜";
      }

      this.updateDashboard();
    } else {
      // WRONG
      this.streak = 0;
      if (typeof AudioEngine !== 'undefined' && AudioEngine.fruitWrong) {
        AudioEngine.fruitWrong();
      }

      if (solBox) {
        solBox.innerHTML = `
          <div style="color:#f87171; font-weight:900; font-size:14px; margin-bottom:4px;">
            ${(i18n.t('fruitMathWrong') || "Noto'g'ri! To'g'ri javob: {ans}").replace('{ans}', correct)}
          </div>
          <div style="white-space:pre-line;">${this.currentProblem.explanation}</div>
        `;
        solBox.style.display = 'block';
      }

      this.updateDashboard();
    }
  },

  updateDashboard() {
    const lvlEl = document.getElementById('fruit-level-val');
    if (lvlEl) lvlEl.textContent = this.level;

    const scoreEl = document.getElementById('fruit-score-val');
    if (scoreEl) scoreEl.textContent = this.score;

    const streakEl = document.getElementById('fruit-streak-val');
    if (streakEl) streakEl.textContent = `🔥 ${this.streak}`;
  }
};
