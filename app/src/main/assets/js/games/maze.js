/* Magic Maze Runner (Sehrli Labirint) Engine with Optimized DOM Rendering & Localization */
const MazeGame = {
  mode: 'bot', // 'bot' or 'player'
  size: 21, // 21x21 grid
  grid: [], // 0: path, 1: wall, 2: star
  playerPos: { x: 1, y: 1 },
  botPos: { x: 1, y: 1 },
  exitPos: { x: 11, y: 11 },
  botPath: [],
  botTimer: null,
  starsCollected: 0,
  moves: 0,
  isOver: false,
  myWins: 0,
  oppWins: 0,
  cellEls: [], // 2D array of cached DOM cell elements

  init() {
    this.setupControls();
    this.updateUIStrings();
  },

  t() {
    return (typeof I18N !== 'undefined' && I18N[App.lang]) || (typeof I18N !== 'undefined' && I18N.uz) || {};
  },

  updateUIStrings() {
    const t = this.t();
    const setTxt = (id, str) => { const el = document.getElementById(id); if (el && str) el.textContent = str; };
    setTxt('maze-header-title', t.mazeTitle || 'Labirint');
    setTxt('maze-moves-lbl', `🟡 ${t.you || 'Siz'} (${t.mazeSteps || t.steps || 'Qadam'})`);
    setTxt('maze-wins-lbl', `🏆 ${t.you || 'Siz'}`);
    setTxt('maze-opp-lbl', this.mode === 'bot' ? `🤖 ${t.bot || 'Bot'}` : `👤 ${t.opponent || 'Raqib'}`);
    setTxt('maze-stars-lbl', `✨ ${t.mazeStars || t.stars || 'Yulduz'}`);
    const tabBot = document.querySelector('#maze-tab-bot .lbl-vs-bot');
    if (tabBot) tabBot.textContent = `🤖 ${t.bot || 'Bot'}`;
    const tabPlayer = document.querySelector('#maze-tab-player .lbl-vs-player');
    if (tabPlayer) tabPlayer.textContent = `👥 ${t.opponent || 'O\'yinchi'}`;
  },

  setMode(m) {
    AudioEngine.tap();
    this.mode = m; // 'bot' or 'player'
    document.getElementById('maze-tab-bot').classList.toggle('active', m === 'bot');
    document.getElementById('maze-tab-player').classList.toggle('active', m === 'player');
    this.activePlayer = 1;
    this.updateUIStrings();
    this.startNewMaze();
  },

  startMultiplayer(isHost) {
    this.mode = 'player';
    document.getElementById('maze-tab-bot').classList.remove('active');
    document.getElementById('maze-tab-player').classList.add('active');
    this.updateUIStrings();
    this.startNewMaze();
    App.showToast(this.t().mazeTitle);
  },

  startNewMaze(seed = null) {
    this.updateUIStrings();
    this.stopBot();
    this.isOver = false;
    this.moves = 0;
    this.starsCollected = 0;
    this.activePlayer = 1;
    this.playerPos = { x: 1, y: 1 };
    this.botPos = { x: 1, y: 1 };
    this.exitPos = { x: this.size - 2, y: this.size - 2 };

    // In online multiplayer, host generates the map and sends it to the other player.
    if (this.mode === 'player' && !seed && typeof Multiplayer !== 'undefined' && Multiplayer.connectedPeerId && Multiplayer.isHost) {
        this.generateMaze();
        Multiplayer.sendGameMove({ type: 'maze_map', grid: this.grid });
    } else if (seed) {
        this.grid = seed;
    } else {
        this.generateMaze();
    }

    this.initBoardDOM();
    this.render();

    document.getElementById('maze-moves-val').textContent = '0';
    document.getElementById('maze-stars-val').textContent = '✨ 0/3';

    if (this.mode === 'bot') {
      this.solveBotPath();
      this.startBotMovement();
    }
  },

  generateMaze() {
    const N = this.size;
    this.grid = Array(N).fill(null).map(() => Array(N).fill(1));

    const carve = (x, y) => {
      this.grid[y][x] = 0;
      const dirs = [
        [0, -2], [0, 2], [-2, 0], [2, 0]
      ].sort(() => Math.random() - 0.5);

      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx > 0 && nx < N - 1 && ny > 0 && ny < N - 1 && this.grid[ny][nx] === 1) {
          this.grid[y + dy / 2][x + dx / 2] = 0;
          carve(nx, ny);
        }
      }
    };

    carve(1, 1);
    this.grid[this.exitPos.y][this.exitPos.x] = 0;

    // Remove random walls to create loops and false paths (adashtiradigan yo'llar)
    let extraHoles = Math.floor(N * 1.5);
    while (extraHoles > 0) {
      const rx = Math.floor(Math.random() * (N - 2)) + 1;
      const ry = Math.floor(Math.random() * (N - 2)) + 1;
      if (this.grid[ry][rx] === 1) {
        let adjPaths = 0;
        if (this.grid[ry-1][rx] === 0) adjPaths++;
        if (this.grid[ry+1][rx] === 0) adjPaths++;
        if (this.grid[ry][rx-1] === 0) adjPaths++;
        if (this.grid[ry][rx+1] === 0) adjPaths++;
        if (adjPaths === 2) {
          this.grid[ry][rx] = 0;
          extraHoles--;
        }
      }
    }

    let placed = 0;
    while (placed < 3) {
      const rx = Math.floor(Math.random() * (N - 2)) + 1;
      const ry = Math.floor(Math.random() * (N - 2)) + 1;
      if (this.grid[ry][rx] === 0 && (rx !== 1 || ry !== 1) && (rx !== this.exitPos.x || ry !== this.exitPos.y)) {
        this.grid[ry][rx] = 2;
        placed++;
      }
    }
  },

  solveBotPath() {
    const N = this.size;
    const queue = [[1, 1, []]];
    const visited = Array(N).fill(null).map(() => Array(N).fill(false));
    visited[1][1] = true;

    while (queue.length > 0) {
      const [cx, cy, path] = queue.shift();
      if (cx === this.exitPos.x && cy === this.exitPos.y) {
        this.botPath = [...path, { x: cx, y: cy }];
        return;
      }

      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dx, dy] of dirs) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < N && ny >= 0 && ny < N) {
          if (!visited[ny][nx] && this.grid[ny][nx] !== 1) {
            visited[ny][nx] = true;
            queue.push([nx, ny, [...path, { x: cx, y: cy }]]);
          }
        }
      }
    }
  },

  startBotMovement() {
    let step = 0;
    this.botTimer = setInterval(() => {
      if (this.isOver) { this.stopBot(); return; }
      if (step < this.botPath.length) {
        const oldPos = { ...this.botPos };
        this.botPos = this.botPath[step];
        step++;
        this.updateCell(oldPos.x, oldPos.y);
        this.updateCell(this.botPos.x, this.botPos.y);

        if (this.botPos.x === this.exitPos.x && this.botPos.y === this.exitPos.y) {
          this.handleGameOver(false);
        }
      }
    }, 600);
  },

  stopBot() {
    if (this.botTimer) {
      clearInterval(this.botTimer);
      this.botTimer = null;
    }
  },

  movePlayer(dx, dy) {
    if (this.isOver) return;

    if (this.mode === 'player' && (!window.Multiplayer || !Multiplayer.connectedPeerId)) {
      // Local 2-Player turn-based race!
      const isP1 = (this.activePlayer === 1);
      const currentPos = isP1 ? this.playerPos : this.botPos;
      const nx = currentPos.x + dx;
      const ny = currentPos.y + dy;

      if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.grid[ny][nx] !== 1) {
        const oldPos = { ...currentPos };
        if (isP1) this.playerPos = { x: nx, y: ny };
        else this.botPos = { x: nx, y: ny };
        this.moves++;
        document.getElementById('maze-moves-val').textContent = this.moves;

        if (this.grid[ny][nx] === 2) {
          this.grid[ny][nx] = 0;
          this.starsCollected++;
          AudioEngine.mazeStar();
          document.getElementById('maze-stars-val').textContent = `✨ ${this.starsCollected}/3`;
        } else if (nx === this.exitPos.x && ny === this.exitPos.y) {
          AudioEngine.mazeExit();
        } else {
          AudioEngine.mazeStep();
        }

        this.updateCell(oldPos.x, oldPos.y);
        this.updateCell(nx, ny);

        if (nx === this.exitPos.x && ny === this.exitPos.y) {
          const t = this.t();
          const pWinner = isP1 ? (t.player1 || "1-O'yinchi") : (t.player2 || "2-O'yinchi");
          this.isOver = true;
          if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
          AudioEngine.win();
          Confetti.fire(80);
          App.showModal('🏁', `${pWinner} ${t.youWin || "yutdi!"} 🏆`, `<b>${pWinner}</b> ${this.moves} ${t.mazeMovesDesc || "yurishda marraga yetib bordi!"}`, () => {
            this.startNewMaze();
          });
          return;
        }

        // Switch active player
        this.activePlayer = isP1 ? 2 : 1;
        const t = this.t();
        const nextP = (this.activePlayer === 1) ? `🧙‍♂️ ${t.player1 || "1-O'yinchi"}` : `🧑‍🚀 ${t.player2 || "2-O'yinchi"}`;
        App.showToast(`${nextP} ${t.yourTurn || "navbati"}!`);
      } else {
        AudioEngine.mazeWall();
      }
      return;
    }

    const nx = this.playerPos.x + dx;
    const ny = this.playerPos.y + dy;

    if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.grid[ny][nx] !== 1) {
      const oldPos = { ...this.playerPos };
      this.playerPos = { x: nx, y: ny };
      this.moves++;
      document.getElementById('maze-moves-val').textContent = this.moves;

      if (this.grid[ny][nx] === 2) {
        this.grid[ny][nx] = 0;
        this.starsCollected++;
        AudioEngine.mazeStar();
        document.getElementById('maze-stars-val').textContent = `✨ ${this.starsCollected}/3`;
        App.showToast(this.t().mazeStarCollected);
      } else if (nx === this.exitPos.x && ny === this.exitPos.y) {
        AudioEngine.mazeExit();
      } else {
        AudioEngine.mazeStep();
      }

      this.updateCell(oldPos.x, oldPos.y);
      this.updateCell(this.playerPos.x, this.playerPos.y);

      if (this.mode === 'player') {
        Multiplayer.sendGameMove({ type: 'pos', x: nx, y: ny });
      }

      if (nx === this.exitPos.x && ny === this.exitPos.y) {
        if (this.mode === 'player') {
          Multiplayer.sendGameMove({ type: 'win', x: nx, y: ny, moves: this.moves });
        }
        this.handleGameOver(true);
      }
    } else {
      AudioEngine.mazeWall();
    }
  },

  initBoardDOM() {
    const box = document.getElementById('maze-board');
    if (!box) return;

    if (!this.swipeBound) {
      let touchStartX = 0;
      let touchStartY = 0;
      box.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        e.preventDefault();
      }, {passive: false});
      box.addEventListener('touchmove', e => { e.preventDefault(); }, {passive: false});
      box.addEventListener('touchend', e => {
        let touchEndX = e.changedTouches[0].screenX;
        let touchEndY = e.changedTouches[0].screenY;
        let dx = touchEndX - touchStartX;
        let dy = touchEndY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 30) this.movePlayer(1, 0);
          else if (dx < -30) this.movePlayer(-1, 0);
        } else {
          if (dy > 30) this.movePlayer(0, 1);
          else if (dy < -30) this.movePlayer(0, -1);
        }
      });
      this.swipeBound = true;
    }

    if (this.cellEls.length !== this.size) {
      box.innerHTML = '';
      box.style.display = 'grid';
      box.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
      box.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
      this.cellEls = [];

      for (let y = 0; y < this.size; y++) {
        const row = [];
        for (let x = 0; x < this.size; x++) {
          const cell = document.createElement('div');
          cell.className = 'maze-cell';
          box.appendChild(cell);
          row.push(cell);
        }
        this.cellEls.push(row);
      }
    }
  },

  updateCell(x, y) {
    if (!this.cellEls[y] || !this.cellEls[y][x]) return;
    const cell = this.cellEls[y][x];
    const type = this.grid[y][x];

    let cls = 'maze-cell';
    let txt = '';

    if (type === 1) {
      cls += ' maze-wall';
    } else {
      cls += ' maze-path';
      if (type === 2) {
        cls += ' maze-star';
        txt = '⭐';
      }
    }

    if (x === this.exitPos.x && y === this.exitPos.y) {
      cls += ' maze-exit';
      txt = '🏁';
    }

    if (x === this.botPos.x && y === this.botPos.y && (x !== this.playerPos.x || y !== this.playerPos.y)) {
      cls += ' maze-bot';
      txt = (this.mode === 'bot') ? '👹' : '🧑‍🚀';
    }

    if (x === this.playerPos.x && y === this.playerPos.y) {
      cls += ' maze-player';
      txt = '🧙‍♂️';
    }

    cell.className = cls;
    cell.textContent = txt;
  },

  render() {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.updateCell(x, y);
      }
    }
  },

  handleRemoteMove(data) {
    if (data.type === 'pos') {
      const oldPos = { ...this.botPos };
      this.botPos = { x: data.x, y: data.y };
      this.updateCell(oldPos.x, oldPos.y);
      this.updateCell(this.botPos.x, this.botPos.y);
      if (data.x === this.exitPos.x && data.y === this.exitPos.y) {
        this.handleGameOver(false);
      }
    } else if (data.type === 'win') {
      const oldPos = { ...this.botPos };
      this.botPos = { x: data.x || this.exitPos.x, y: data.y || this.exitPos.y };
      this.updateCell(oldPos.x, oldPos.y);
      this.updateCell(this.botPos.x, this.botPos.y);
      this.handleGameOver(false);
    } else if (data.type === 'req_restart') {
      if (Multiplayer.isHost) {
        this.generateMaze();
        Multiplayer.sendGameMove({ type: 'maze_map', grid: this.grid });
        this.startNewMaze(this.grid);
      }
    } else if (data.type === 'maze_map') {
      // Received map from host
      this.startNewMaze(data.grid);
    }
  },

  handleGameOver(playerWon) {
    if (this.isOver) return;
    this.isOver = true;
    this.stopBot();
    const t = this.t();

    const myScoreEl = document.getElementById('maze-my-score');
    const oppScoreEl = document.getElementById('maze-opp-score');

    this.isOver = true;
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();

    if (playerWon) {
      this.myWins++;
      if (myScoreEl) myScoreEl.textContent = this.myWins;
      AudioEngine.win();
      Confetti.fire(40);
      App.showModal('🎉', t.mazeWinTitle || "G'alaba!", `${this.moves} ${t.mazeWinDesc || "qadamda chiqish yo'lini topdingiz!"}`, () => MazeGame.requestRestart());
    } else {
      this.oppWins++;
      if (oppScoreEl) oppScoreEl.textContent = this.oppWins;
      AudioEngine.error();
      App.showModal('⌛', t.oppWin || "Raqib g'olib bo'ldi!", t.mazeLossDesc || "Raqib sizdan tezroq chiqish yo'lini topdi.", () => MazeGame.requestRestart());
    }
  },

  requestRestart() {
    if (this.mode === 'player') {
      if (Multiplayer.isHost) {
        this.generateMaze();
        Multiplayer.sendGameMove({ type: 'maze_map', grid: this.grid });
        this.startNewMaze(this.grid);
      } else {
        Multiplayer.sendGameMove({ type: 'req_restart' });
        App.showToast(this.t().waitingOpponent || "Yangi xarita kutilmoqda...");
      }
    } else {
      this.startNewMaze();
    }
  },

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (App.currentView !== 'maze') return;
      if (e.key === 'ArrowUp' || e.key === 'w') this.movePlayer(0, -1);
      else if (e.key === 'ArrowDown' || e.key === 's') this.movePlayer(0, 1);
      else if (e.key === 'ArrowLeft' || e.key === 'a') this.movePlayer(-1, 0);
      else if (e.key === 'ArrowRight' || e.key === 'd') this.movePlayer(1, 0);
    });

    let startX = 0, startY = 0;
    const board = document.getElementById('maze-board');
    if (board) {
      board.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });

      board.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 25) {
          this.movePlayer(dx > 0 ? 1 : -1, 0);
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 25) {
          this.movePlayer(0, dy > 0 ? 1 : -1);
        }
      }, { passive: true });
    }
  }
};
