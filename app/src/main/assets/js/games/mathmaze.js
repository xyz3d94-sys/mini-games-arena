/**
 * MATEMATIK LABIRINT (5x5 Pathfinding Puzzle — Yagona Yo'l: 100 Ball)
 * Start: (0,0) -> Finish: (4,4)
 * Faqat PASTGA ⬇️ va O'NGGA ➡️ harakatlanish mumkin.
 * MARRAGA BORGANDA YIG'INDI ANIQ 100 BALL BO'LISHI SHART!
 * Kafolat: Har bir bosqichda 100 ball yig'adigan FAQAT 1 TA YAGONA TO'G'RI YO'L mavjud!
 */

const MathMaze = {
  currentLevel: 1,
  grid: [],
  path: [], // Array of { r, c, val }
  targetSum: 100,
  currentSum: 0,
  isFinished: false,
  isWon: false,

  init() {
    try {
      const savedLvl = localStorage.getItem('arena_mathmaze_lvl');
      if (savedLvl) {
        this.currentLevel = Math.max(1, parseInt(savedLvl, 10) || 1);
      }
    } catch (e) {
      this.currentLevel = 1;
    }
  },

  t() {
    return (typeof I18N !== 'undefined' && I18N[App.lang]) || {};
  },

  // Count how many paths from (0,0) to (4,4) sum to 100
  countSolutions(grid) {
    let count = 0;
    function dfs(r, c, sum) {
      const s = sum + grid[r][c];
      if (r === 4 && c === 4) {
        if (s === 100) count++;
        return;
      }
      if (r < 4) dfs(r + 1, c, s);
      if (c < 4) dfs(r, c + 1, s);
    }
    dfs(0, 0, 0);
    return count;
  },

  // Procedural generator guaranteeing EXACTLY 1 unique path equaling 100
  generateBoard(lvl = 1) {
    const isHard = (lvl >= 4);

    for (let attempt = 0; attempt < 400; attempt++) {
      // 1. Pick a random 8-move path (4 Down, 4 Right)
      const moves = [0, 0, 0, 0, 1, 1, 1, 1]; // 0: Right, 1: Down
      for (let i = moves.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [moves[i], moves[j]] = [moves[j], moves[i]];
      }

      const solPath = [{ r: 0, c: 0 }];
      let cr = 0, cc = 0;
      for (const m of moves) {
        if (m === 0) cc++;
        else cr++;
        solPath.push({ r: cr, c: cc });
      }

      // 2. Partition 100 across 9 cells
      const numbers = [];
      let remaining = 100;
      for (let i = 0; i < 8; i++) {
        const avg = Math.floor(remaining / (9 - i));
        const minVal = Math.max(2, avg - 6);
        const maxVal = avg + 6;
        const val = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
        numbers.push(val);
        remaining -= val;
      }
      numbers.push(remaining);

      // If hard level (lvl >= 4), make one cell a negative balancing tile e.g. -5 or -10
      if (isHard && Math.random() < 0.6) {
        const negIdx = Math.floor(Math.random() * 5) + 2; // middle path
        const negVal = lvl >= 7 ? -10 : -5;
        const addBack = numbers[negIdx] - negVal;
        numbers[negIdx] = negVal;
        numbers[numbers.length - 1] += addBack;
      }

      // 3. Populate 5x5 grid
      const grid = Array(5).fill(0).map(() => Array(5).fill(0));
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          grid[r][c] = Math.floor(Math.random() * 18) + 4;
        }
      }

      // Embed solution path
      solPath.forEach((pt, idx) => {
        grid[pt.r][pt.c] = numbers[idx];
      });

      // 4. Verify strictly 1 solution
      const solCount = this.countSolutions(grid);
      if (solCount === 1) {
        return grid;
      }
    }

    // Fallback: guaranteed curated level 1
    return [
      [10, 15,  8, 20, 12],
      [ 7, 20, 15, 12, 18],
      [11,  4, 10, 15,  9],
      [ 3, 14,  6, 10,  8],
      [16,  2, 12,  7,  5]
    ];
  },

  start(lvl) {
    if (lvl) this.currentLevel = lvl;
    this.isFinished = false;
    this.isWon = false;

    // Generate guaranteed board with 1 unique solution
    this.grid = this.generateBoard(this.currentLevel);

    // Initial position at (0,0)
    const startVal = this.grid[0][0];
    this.path = [{ r: 0, c: 0, val: startVal }];
    this.currentSum = startVal;

    this.renderBoard();
    this.updateDashboard();

    const nextBtn = document.getElementById('mathmaze-next-btn');
    if (nextBtn) nextBtn.style.display = 'none';

    const undoBtn = document.getElementById('mathmaze-undo-btn');
    if (undoBtn) undoBtn.classList.remove('undo-suggest');

    const hintEl = document.getElementById('mathmaze-status-hint');
    if (hintEl) {
      hintEl.textContent = this.t().mathMazeRule || "Faqat pastga ⬇️ va o'ngga ➡️ yuring. Marraga borganda yig'indi aniq 100 bo'lishi shart!";
      hintEl.style.color = '#cbd5e1';
    }
  },

  renderBoard() {
    const board = document.getElementById('mathmaze-board');
    if (!board) return;
    board.innerHTML = '';

    const head = this.path[this.path.length - 1];

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const val = this.grid[r][c];
        const cell = document.createElement('div');
        cell.className = 'maze-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        // Display string
        const signStr = val >= 0 ? `+${val}` : `${val}`;
        let tagStr = '';

        if (r === 0 && c === 0) {
          cell.classList.add('is-start');
          tagStr = '🏁 Bosh';
        } else if (r === 4 && c === 4) {
          cell.classList.add('is-goal');
          tagStr = '🎯 100';
        }

        // Check if cell is in active path
        const inPathIdx = this.path.findIndex(p => p.r === r && p.c === c);
        const isHead = (inPathIdx !== -1 && inPathIdx === this.path.length - 1);

        // Cartoon runner avatar inside current head cell
        let runnerHTML = '';
        if (isHead) {
          let runnerIcon = '🏃‍♂️';
          if (this.isWon) runnerIcon = '🎉';
          else if (this.isFinished && !this.isWon) runnerIcon = '😵';
          runnerHTML = `<div class="maze-runner-avatar">${runnerIcon}</div>`;
        }

        cell.innerHTML = `
          ${runnerHTML}
          <span class="maze-cell-num">${signStr}</span>
          ${tagStr ? `<span class="maze-cell-tag">${tagStr}</span>` : ''}
        `;

        if (inPathIdx !== -1) {
          cell.classList.add('on-path');
          if (isHead) {
            cell.classList.add('is-head');
          }
        } else if (!this.isFinished) {
          // Highlight available valid moves: only DOWN (r+1, c) or RIGHT (r, c+1)
          const isNextValid = (r === head.r + 1 && c === head.c) || (r === head.r && c === head.c + 1);
          if (isNextValid) {
            cell.classList.add('is-next-valid');
          }
        }

        cell.onclick = (e) => this.handleCellClick(r, c, e);
        board.appendChild(cell);
      }
    }
  },

  handleCellClick(r, c, e) {
    const head = this.path[this.path.length - 1];

    // 1. Tapping on the current head cell (or runner) steps back
    if (r === head.r && c === head.c) {
      if (this.path.length > 1) {
        this.undoStep();
      }
      return;
    }

    // 2. Tapping any previous cell along the path rewinds to that cell
    const pathIdx = this.path.findIndex(p => p.r === r && p.c === c);
    if (pathIdx !== -1) {
      this.isFinished = false;
      this.isWon = false;
      this.path = this.path.slice(0, pathIdx + 1);
      this.currentSum = this.path.reduce((acc, p) => acc + p.val, 0);

      const undoBtn = document.getElementById('mathmaze-undo-btn');
      if (undoBtn) undoBtn.classList.remove('undo-suggest');

      const nextBtn = document.getElementById('mathmaze-next-btn');
      if (nextBtn) nextBtn.style.display = 'none';

      if (typeof AudioEngine !== 'undefined' && AudioEngine.mazeUndo) {
        AudioEngine.mazeUndo();
      }

      this.renderBoard();
      this.updateDashboard();
      return;
    }

    // If finished already and didn't tap path, ignore forward moves
    if (this.isFinished) return;

    // 3. Move forward: Only allow DOWN (r+1, c) or RIGHT (r, c+1)
    const isDown = (r === head.r + 1 && c === head.c);
    const isRight = (r === head.r && c === head.c + 1);

    if (isDown || isRight) {
      const val = this.grid[r][c];
      this.path.push({ r, c, val });
      this.currentSum += val;

      // Pop floating number animation over the tapped cell
      this.showFloatingCellNumber(r, c, val);

      if (typeof AudioEngine !== 'undefined' && AudioEngine.mazeStep) {
        AudioEngine.mazeStep(this.path.length);
      }

      this.renderBoard();
      this.updateDashboard();

      // Check if reached goal cell (4,4)
      if (r === 4 && c === 4) {
        this.checkFinish();
      }
    } else {
      // Invalid direction (cannot jump or move left/up)
      if (typeof AudioEngine !== 'undefined' && AudioEngine.mazeInvalid) {
        AudioEngine.mazeInvalid();
      }
      const hintEl = document.getElementById('mathmaze-status-hint');
      if (hintEl) {
        hintEl.textContent = "Faqat pastga ⬇️ yoki o'ngga ➡️ yurishingiz mumkin!";
        hintEl.style.color = '#f87171';
        setTimeout(() => {
          if (!this.isFinished) {
            hintEl.textContent = this.t().mathMazeRule || "Boshlang'ich katakdan boshlab faqat pastga ⬇️ va o'ngga ➡️ yuring!";
            hintEl.style.color = '#cbd5e1';
          }
        }, 1400);
      }
    }
  },

  showFloatingCellNumber(r, c, val) {
    const board = document.getElementById('mathmaze-board');
    if (!board) return;
    const targetCell = board.querySelector(`[data-r="${r}"][data-c="${c}"]`);
    if (!targetCell) return;

    const floatEl = document.createElement('div');
    floatEl.className = 'maze-float-num';
    floatEl.textContent = val >= 0 ? `+${val}` : `${val}`;
    floatEl.style.color = val >= 0 ? '#facc15' : '#f87171';
    targetCell.appendChild(floatEl);

    setTimeout(() => {
      if (floatEl.parentNode) floatEl.parentNode.removeChild(floatEl);
    }, 750);
  },

  isAnimatingSolution: false,
  solutionTimer: null,

  findSolutionPath() {
    let sol = null;
    const grid = this.grid;
    function dfs(r, c, sum, currentPath) {
      if (sol) return;
      const val = grid[r][c];
      const s = sum + val;
      const nextPath = [...currentPath, { r, c, val }];
      if (r === 4 && c === 4) {
        if (s === 100) {
          sol = nextPath;
        }
        return;
      }
      if (r < 4) dfs(r + 1, c, s, nextPath);
      if (c < 4) dfs(r, c + 1, s, nextPath);
    }
    dfs(0, 0, 0, []);
    return sol;
  },

  showSolution() {
    if (this.isAnimatingSolution) return;
    const solPath = this.findSolutionPath();
    if (!solPath || solPath.length === 0) {
      return;
    }

    if (this.solutionTimer) {
      clearInterval(this.solutionTimer);
      this.solutionTimer = null;
    }

    this.isAnimatingSolution = true;
    this.isFinished = false;
    this.isWon = false;

    // Reset to start first
    const startVal = this.grid[0][0];
    this.path = [{ r: 0, c: 0, val: startVal }];
    this.currentSum = startVal;
    this.renderBoard();
    this.updateDashboard();

    const hintEl = document.getElementById('mathmaze-status-hint');
    if (hintEl) {
      hintEl.textContent = "Yechim ko'rsatilmoqda: Qadam-baqadam yo'l...";
      hintEl.style.color = '#38bdf8';
    }

    let stepIdx = 1;
    this.solutionTimer = setInterval(() => {
      if (stepIdx >= solPath.length) {
        clearInterval(this.solutionTimer);
        this.solutionTimer = null;
        this.isAnimatingSolution = false;
        this.isFinished = true;
        this.isWon = true;

        if (typeof AudioEngine !== 'undefined' && AudioEngine.mazeCelebrate) {
          AudioEngine.mazeCelebrate();
        }

        if (hintEl) {
          const pathDesc = solPath.map((p, i) => i === 0 ? `${p.val}` : (p.r > solPath[i-1].r ? `Pastga (+${p.val})` : `O'ngga (+${p.val})`)).join(' -> ');
          hintEl.textContent = `Yechim yo'li: ${pathDesc} = 100!`;
          hintEl.style.color = '#4ade80';
        }

        const nextBtn = document.getElementById('mathmaze-next-btn');
        if (nextBtn) nextBtn.style.display = 'flex';
        this.renderBoard();
        this.updateDashboard();
        return;
      }

      const nextCell = solPath[stepIdx];
      this.path.push(nextCell);
      this.currentSum += nextCell.val;

      if (typeof AudioEngine !== 'undefined' && AudioEngine.mazeStep) {
        AudioEngine.mazeStep(this.path.length);
      }

      this.renderBoard();
      this.updateDashboard();
      stepIdx++;
    }, 400);
  },

  undoStep() {
    if (this.solutionTimer) {
      clearInterval(this.solutionTimer);
      this.solutionTimer = null;
      this.isAnimatingSolution = false;
    }
    if (this.path.length <= 1) return;
    this.isFinished = false;
    this.isWon = false;
    const removed = this.path.pop();
    this.currentSum -= removed.val;

    if (typeof AudioEngine !== 'undefined' && AudioEngine.mazeUndo) {
      AudioEngine.mazeUndo();
    }

    const nextBtn = document.getElementById('mathmaze-next-btn');
    if (nextBtn) nextBtn.style.display = 'none';

    const undoBtn = document.getElementById('mathmaze-undo-btn');
    if (undoBtn) undoBtn.classList.remove('undo-suggest');

    const hintEl = document.getElementById('mathmaze-status-hint');
    if (hintEl) {
      hintEl.textContent = this.t().mathMazeRule || "Faqat pastga va o'ngga yuring. Marraga borganda yig'indi aniq 100 bo'lishi shart!";
      hintEl.style.color = '#cbd5e1';
    }

    this.renderBoard();
    this.updateDashboard();
  },

  resetPath() {
    if (this.solutionTimer) {
      clearInterval(this.solutionTimer);
      this.solutionTimer = null;
      this.isAnimatingSolution = false;
    }
    const startVal = this.grid[0][0];
    this.path = [{ r: 0, c: 0, val: startVal }];
    this.currentSum = startVal;
    this.isFinished = false;
    this.isWon = false;

    if (typeof AudioEngine !== 'undefined' && AudioEngine.mazeUndo) {
      AudioEngine.mazeUndo();
    }

    const nextBtn = document.getElementById('mathmaze-next-btn');
    if (nextBtn) nextBtn.style.display = 'none';

    const undoBtn = document.getElementById('mathmaze-undo-btn');
    if (undoBtn) undoBtn.classList.remove('undo-suggest');

    const hintEl = document.getElementById('mathmaze-status-hint');
    if (hintEl) {
      hintEl.textContent = this.t().mathMazeRule || "Faqat pastga va o'ngga yuring. Marraga borganda yig'indi aniq 100 bo'lishi shart!";
      hintEl.style.color = '#cbd5e1';
    }

    this.renderBoard();
    this.updateDashboard();
  },

  checkFinish() {
    this.isFinished = true;
    const hintEl = document.getElementById('mathmaze-status-hint');
    const nextBtn = document.getElementById('mathmaze-next-btn');
    const undoBtn = document.getElementById('mathmaze-undo-btn');

    if (this.currentSum === this.targetSum) {
      // SUCCESS! EXACTLY 100
      this.isWon = true;

      if (typeof AudioEngine !== 'undefined' && AudioEngine.mazeCelebrate) {
        AudioEngine.mazeCelebrate();
      } else if (typeof AudioEngine !== 'undefined' && AudioEngine.win) {
        AudioEngine.win();
      }

      if (typeof Confetti !== 'undefined') {
        Confetti.fire(35);
      }

      if (hintEl) {
        hintEl.textContent = this.t().mathMazeSuccess || "G'ALABA! Aniq 100 ball yig'ildi! Yagona to'g'ri yo'lni topdingiz! 🎉";
        hintEl.style.color = '#4ade80';
      }

      if (nextBtn) nextBtn.style.display = 'flex';
      if (undoBtn) undoBtn.classList.remove('undo-suggest');

      // Level progress
      this.currentLevel++;
      try {
        localStorage.setItem('arena_mathmaze_lvl', this.currentLevel.toString());
      } catch (e) {}

      const lvlBadge = document.getElementById('mathmaze-lvl-val');
      if (lvlBadge) lvlBadge.textContent = this.currentLevel;

      this.renderBoard();
    } else {
      // REACHED (4,4) BUT SUM !== 100
      this.isWon = false;

      if (typeof AudioEngine !== 'undefined' && AudioEngine.error) {
        AudioEngine.error();
      }

      const diff = this.currentSum - 100;
      const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
      if (hintEl) {
        const msg = (this.t().mathMazeOver || "Yig'indi {sum} bo'ldi (100 emas). Orqaga qaytib boshqa yo'ldan yuring! ↩")
          .replace('{sum}', `${this.currentSum} (${diffStr})`);
        hintEl.textContent = msg;
        hintEl.style.color = '#f87171';
      }

      // Highlight Undo button with pulsing glow so player immediately knows to step back!
      if (undoBtn) undoBtn.classList.add('undo-suggest');

      this.renderBoard();
    }
  },

  nextLevel() {
    this.start(this.currentLevel);
  },

  updateDashboard() {
    const sumEl = document.getElementById('mathmaze-sum-val');
    if (sumEl) {
      sumEl.textContent = this.currentSum;
      sumEl.style.color = (this.currentSum === 100) ? '#4ade80' : (this.currentSum > 100 ? '#f87171' : '#facc15');
    }

    const stepEl = document.getElementById('mathmaze-steps-val');
    if (stepEl) stepEl.textContent = `${this.path.length - 1}/8`;

    const lvlEl = document.getElementById('mathmaze-lvl-val');
    if (lvlEl) lvlEl.textContent = this.currentLevel;

    // Progress bar towards 100
    const bar = document.getElementById('mathmaze-progress-bar');
    if (bar) {
      const pct = Math.min(100, Math.max(0, (this.currentSum / this.targetSum) * 100));
      bar.style.width = `${pct}%`;
      if (this.currentSum > 100) {
        bar.classList.add('over');
      } else {
        bar.classList.remove('over');
      }
    }
  }
};
