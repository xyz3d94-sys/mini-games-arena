/* =========================================================================
   MINESWEEPER (MINA QIDIRUVCHI) - 9x9 GRID, 10 MINES
   - Safe First Click
   - Tap to Dig, Long-press (or Mode toggle) to Flag 🚩
   - Haptic Feedback & AudioEngine integration
   - Classic vibrant colors for numbers 1-8
   - Recursive flood fill for 0-neighbor empty tiles
   - Timer, Remaining Flags counter, and Interactive Smiley Restart (😃/😮/😵/😎)
   ========================================================================= */

const MinesGame = {
  ROWS: 9,
  COLS: 9,
  TOTAL_MINES: 10,

  board: [], // 2D array of cell objects: { row, col, mine, revealed, flagged, count }
  firstClickDone: false,
  gameOver: false,
  gameWon: false,
  flagMode: false, // For extra mobile comfort toggle
  flagsCount: 0,
  revealedCount: 0,
  timerSeconds: 0,
  timerInterval: null,
  longPressTimer: null,
  longPressFired: false,
  touchStartX: 0,
  touchStartY: 0,

  t() {
    return (typeof I18N !== 'undefined' && I18N[App.lang]) || {};
  },

  init() {
    this.createBoard();
    this.renderHeader();
    this.renderBoard();
  },

  createBoard() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerSeconds = 0;
    this.firstClickDone = false;
    this.gameOver = false;
    this.gameWon = false;
    this.flagsCount = 0;
    this.revealedCount = 0;

    this.board = [];
    for (let r = 0; r < this.ROWS; r++) {
      const row = [];
      for (let c = 0; c < this.COLS; c++) {
        row.push({
          r,
          c,
          mine: false,
          revealed: false,
          flagged: false,
          count: 0
        });
      }
      this.board.push(row);
    }
  },

  start() {
    this.createBoard();
    this.updateStatsUI();
    this.setSmiley('😃');
    this.renderBoard();
    const hintEl = document.getElementById('mines-status-hint');
    if (hintEl) {
      const t = this.t();
      hintEl.textContent = t.minesTapHint || "Bosish: ochish | Uzoq bosish: 🚩 bayroq";
      hintEl.style.color = '#94a3b8';
    }
  },

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerSeconds = 0;
    const tEl = document.getElementById('mines-timer-val');
    if (tEl) tEl.textContent = '000';
    this.timerInterval = setInterval(() => {
      if (this.gameOver || this.gameWon) return;
      this.timerSeconds++;
      if (tEl) {
        tEl.textContent = String(Math.min(999, this.timerSeconds)).padStart(3, '0');
      }
    }, 1000);
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  // Safe first click: generate 10 mines ensuring (startR, startC) and surrounding are safe
  generateMines(startR, startC) {
    let placed = 0;
    const forbidden = new Set();
    // Exclude starting tile and its 8 adjacent neighbors for a pleasant open area
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = startR + dr;
        const nc = startC + dc;
        if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS) {
          forbidden.add(`${nr},${nc}`);
        }
      }
    }

    const available = [];
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        if (!forbidden.has(`${r},${c}`)) {
          available.push({ r, c });
        }
      }
    }

    // Shuffle available cells (Fisher-Yates)
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }

    for (let i = 0; i < this.TOTAL_MINES && i < available.length; i++) {
      const pos = available[i];
      this.board[pos.r][pos.c].mine = true;
      placed++;
    }

    // Fallback if available was smaller than TOTAL_MINES (rare)
    while (placed < this.TOTAL_MINES) {
      const r = Math.floor(Math.random() * this.ROWS);
      const c = Math.floor(Math.random() * this.COLS);
      if (!(r === startR && c === startC) && !this.board[r][c].mine) {
        this.board[r][c].mine = true;
        placed++;
      }
    }

    // Calculate numbers for each cell
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        if (!this.board[r][c].mine) {
          this.board[r][c].count = this.countSurroundingMines(r, c);
        }
      }
    }
  },

  countSurroundingMines(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS) {
          if (this.board[nr][nc].mine) count++;
        }
      }
    }
    return count;
  },

  renderHeader() {
    this.updateStatsUI();
  },

  updateStatsUI() {
    const leftMines = Math.max(0, this.TOTAL_MINES - this.flagsCount);
    const mEl = document.getElementById('mines-count-val');
    if (mEl) mEl.textContent = String(leftMines).padStart(2, '0');

    const tEl = document.getElementById('mines-timer-val');
    if (tEl && !this.firstClickDone) tEl.textContent = '000';

    const modeBtn = document.getElementById('mines-mode-toggle-btn');
    if (modeBtn) {
      const t = this.t();
      modeBtn.textContent = this.flagMode
        ? (t.minesModeFlag || 'Bayroq')
        : (t.minesModeDig || 'Ochish');
      modeBtn.className = 'btn-action ' + (this.flagMode ? 'mines-flag-active' : 'mines-dig-active');
    }
  },

  toggleFlagMode() {
    this.flagMode = !this.flagMode;
    AudioEngine.tap();
    this.updateStatsUI();
  },

  setSmiley(emoji) {
    const sEl = document.getElementById('mines-restart-face');
    if (sEl) sEl.textContent = emoji;
  },

  renderBoard() {
    const container = document.getElementById('mines-board');
    if (!container) return;
    container.innerHTML = '';

    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const cell = this.board[r][c];
        const btn = document.createElement('div');
        btn.id = `mine-cell-${r}-${c}`;
        btn.className = 'mine-tile';
        btn.setAttribute('data-r', r);
        btn.setAttribute('data-c', c);

        // Attach touch & mouse handlers for Tap and Long-press
        this.bindCellEvents(btn, r, c);

        container.appendChild(btn);
      }
    }
  },

  bindCellEvents(el, r, c) {
    // 1. Contextmenu for desktop right-click flag
    el.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleFlag(r, c);
      return false;
    };

    // 2. Touch event handling for Mobile:
    el.addEventListener('touchstart', (e) => {
      if (this.gameOver || this.gameWon) return;
      this.longPressFired = false;
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;

      this.setSmiley('😮');

      this.longPressTimer = setTimeout(() => {
        this.longPressFired = true;
        this.toggleFlag(r, c);
        this.setSmiley('😃');
      }, 420); // 420ms threshold for reliable long press
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
      if (!this.longPressTimer) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - this.touchStartX);
      const dy = Math.abs(touch.clientY - this.touchStartY);
      if (dx > 12 || dy > 12) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
        if (!this.gameOver && !this.gameWon) this.setSmiley('😃');
      }
    }, { passive: true });

    el.addEventListener('touchend', (e) => {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      if (this.longPressFired) {
        e.preventDefault();
        return;
      }
      if (!this.gameOver && !this.gameWon) this.setSmiley('😃');
      this.handleCellClick(r, c);
    });

    el.addEventListener('touchcancel', () => {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      if (!this.gameOver && !this.gameWon) this.setSmiley('😃');
    });

    // 3. Mouse fallback for desktop / click
    el.addEventListener('mousedown', (e) => {
      if (e.button === 0 && !this.gameOver && !this.gameWon) {
        this.setSmiley('😮');
      }
    });

    el.addEventListener('mouseup', () => {
      if (!this.gameOver && !this.gameWon) {
        this.setSmiley('😃');
      }
    });

    el.addEventListener('click', (e) => {
      // In touch devices touchend handles it; prevent double firing
      if (this.longPressFired) {
        this.longPressFired = false;
        return;
      }
      this.handleCellClick(r, c);
    });
  },

  handleCellClick(r, c) {
    if (this.gameOver || this.gameWon) return;

    // If Flag Mode toggle is active, tap toggles flag
    if (this.flagMode) {
      this.toggleFlag(r, c);
      return;
    }

    const cell = this.board[r][c];
    if (cell.flagged || cell.revealed) return;

    // Safe First Click
    if (!this.firstClickDone) {
      this.firstClickDone = true;
      this.generateMines(r, c);
      this.startTimer();
    }

    if (cell.mine) {
      // Mine stepped on! Game Over
      this.hitMine(r, c);
      return;
    }

    // Normal safe cell clicked
    AudioEngine.mineClick();
    this.revealCell(r, c);
    this.checkWinCondition();
  },

  toggleFlag(r, c) {
    if (this.gameOver || this.gameWon) return;
    const cell = this.board[r][c];
    if (cell.revealed) return;

    cell.flagged = !cell.flagged;
    if (cell.flagged) {
      this.flagsCount++;
      AudioEngine.mineFlag(); // Plays high triangle sound + native haptic vibration
    } else {
      this.flagsCount--;
      AudioEngine.tap();
    }

    this.updateCellUI(r, c);
    this.updateStatsUI();
  },

  revealCell(r, c) {
    const cell = this.board[r][c];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    this.revealedCount++;
    this.updateCellUI(r, c);

    // Recursive flood fill: if cell has 0 neighboring mines, reveal all neighbors!
    if (cell.count === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS) {
            const neighbor = this.board[nr][nc];
            if (!neighbor.revealed && !neighbor.flagged && !neighbor.mine) {
              this.revealCell(nr, nc);
            }
          }
        }
      }
    }
  },

  updateCellUI(r, c) {
    const cell = this.board[r][c];
    const el = document.getElementById(`mine-cell-${r}-${c}`);
    if (!el) return;

    if (cell.revealed) {
      el.classList.add('revealed');
      el.classList.remove('flagged');

      if (cell.mine) {
        el.classList.add('is-mine');
        el.textContent = '💣';
      } else if (cell.count > 0) {
        el.textContent = cell.count;
        el.setAttribute('data-num', cell.count);
      } else {
        el.textContent = '';
      }
    } else if (cell.flagged) {
      el.classList.add('flagged');
      el.textContent = '🚩';
    } else {
      el.classList.remove('revealed', 'flagged', 'is-mine');
      el.removeAttribute('data-num');
      el.textContent = '';
    }
  },

  hitMine(hitR, hitC) {
    this.gameOver = true;
    this.stopTimer();
    this.setSmiley('😵');

    AudioEngine.mineExplode(); // Deep explosion sound + 300ms vibration!

    // Mark the triggered mine specially
    const hitEl = document.getElementById(`mine-cell-${hitR}-${hitC}`);
    if (hitEl) {
      hitEl.classList.add('mine-triggered');
      hitEl.textContent = '💥';
    }

    // Reveal all other mines
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const cell = this.board[r][c];
        if (cell.mine && !(r === hitR && c === hitC)) {
          cell.revealed = true;
          this.updateCellUI(r, c);
        } else if (!cell.mine && cell.flagged) {
          // Wrong flag indicator
          const el = document.getElementById(`mine-cell-${r}-${c}`);
          if (el) {
            el.classList.add('wrong-flag');
            el.textContent = '❌';
          }
        }
      }
    }

    const t = this.t();
    const hintEl = document.getElementById('mines-status-hint');
    if (hintEl) {
      hintEl.textContent = t.minesLost || "Mina portladi! Qayta urinib ko'ring 💥";
      hintEl.style.color = '#ef4444';
    }
  },

  checkWinCondition() {
    const totalSafeCells = (this.ROWS * this.COLS) - this.TOTAL_MINES;
    if (this.revealedCount >= totalSafeCells) {
      this.gameWon = true;
      this.stopTimer();
      this.setSmiley('😎');

      AudioEngine.win();
      if (typeof Confetti !== 'undefined') {
        Confetti.fire(80);
      }

      // Auto flag all mines
      for (let r = 0; r < this.ROWS; r++) {
        for (let c = 0; c < this.COLS; c++) {
          const cell = this.board[r][c];
          if (cell.mine && !cell.flagged) {
            cell.flagged = true;
            this.updateCellUI(r, c);
          }
        }
      }
      this.flagsCount = this.TOTAL_MINES;
      this.updateStatsUI();

      const t = this.t();
      const hintEl = document.getElementById('mines-status-hint');
      if (hintEl) {
        hintEl.textContent = t.minesWon || "Tabriklaymiz! Barcha minalar zararsizlantirildi! 😎";
        hintEl.style.color = '#22c55e';
      }
    }
  }
};
