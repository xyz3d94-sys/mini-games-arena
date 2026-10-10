/* 10x10 Battleship (Dengiz Jangi) Engine with Manual Placement & Optimized Performance */
const Battleship = {
  mode: 'bot', // 'bot' or 'player'
  phase: 'place', // 'place' (custom hiding) or 'battle'
  
  fleetDefs: [
    { id: 0, nameUz: "🚢 Battleship (4)", nameRu: "🚢 Battleship (4)", nameEn: "🚢 Battleship (4)", size: 4 },
    { id: 1, nameUz: "🛳️ Cruiser (3)", nameRu: "🛳️ Cruiser (3)", nameEn: "🛳️ Cruiser (3)", size: 3 },
    { id: 2, nameUz: "🚤 Destroyer-1 (2)", nameRu: "🚤 Destroyer-1 (2)", nameEn: "🚤 Destroyer-1 (2)", size: 2 },
    { id: 3, nameUz: "🚤 Destroyer-2 (2)", nameRu: "🚤 Destroyer-2 (2)", nameEn: "🚤 Destroyer-2 (2)", size: 2 },
    { id: 4, nameUz: "⛵ Patrol-1 (1)", nameRu: "⛵ Patrol-1 (1)", nameEn: "⛵ Patrol-1 (1)", size: 1 },
    { id: 5, nameUz: "⛵ Patrol-2 (1)", nameRu: "⛵ Patrol-2 (1)", nameEn: "⛵ Patrol-2 (1)", size: 1 }
  ],

  selectedShipIndex: 0,
  isHorizontal: true,
  myPlacedShips: [[], [], [], [], [], []], // indices for each of the 6 ships
  myBoard: Array(100).fill(0), // 0: empty, 1: ship, 2: miss, 3: hit
  oppBoard: Array(100).fill(0), // 0: unrevealed, 2: miss, 3: hit
  oppShips: [],
  myTurn: true,
  isOver: false,
  botHuntQueue: [],
  myScore: 0,
  oppScore: 0,
  myReady: false,
  oppReady: false,

  // Cached DOM elements
  placementCells: [],
  oppGridCells: [],
  myMiniCells: [],

  init() {
    this.enterPlacementPhase();
  },

  t() {
    return I18N[App.lang] || I18N.uz;
  },

  setMode(m) {
    AudioEngine.tap();
    this.mode = m;
    const tabBot = document.getElementById('bs-tab-bot');
    const tabPlayer = document.getElementById('bs-tab-player');
    if (tabBot) tabBot.classList.toggle('active', m === 'bot');
    if (tabPlayer) tabPlayer.classList.toggle('active', m === 'player');

    const oppLabel = document.getElementById('bs-opp-label');
    const t = this.t();
    if (m === 'bot') {
      if (oppLabel) oppLabel.textContent = `🤖 ${t.enemy || 'Dushman'}`;
    } else {
      if (oppLabel) oppLabel.textContent = `👥 ${t.player2 || "2-O'yinchi"}`;
    }
    this.enterPlacementPhase();
  },

  startMultiplayer(isHost) {
    this.mode = 'player';
    document.getElementById('bs-tab-bot').classList.remove('active');
    document.getElementById('bs-tab-player').classList.add('active');
    const oppLabel = document.getElementById('bs-opp-label');
    if (oppLabel) oppLabel.textContent = `👥 ${this.t().opponent}`;
    this.myTurn = isHost;
    this.myReady = false;
    this.oppReady = false;
    this.enterPlacementPhase();
    App.showToast(this.t().bsPlaceShipPrompt);
  },

  enterPlacementPhase(isSync = false) {
    if (this.mode === 'player' && !isSync) {
      Multiplayer.sendGameMove({ type: 'bs_restart' });
    }
    this.phase = 'place';
    this.inPlacement = true;
    this.isOver = false;
    this.myReady = false;
    this.oppReady = false;
    this.botHuntQueue = [];
    this.oppBoard = Array(100).fill(0);
    this.oppShips = this.placeFleetRandomly(Array(100).fill(0), [4, 3, 2, 2, 1, 1]);

    // Board starts empty so user can choose where to hide their ships
    if (this.myPlacedShips.every(s => s.length === 0)) {
      this.myBoard = Array(100).fill(0);
      this.selectedShipIndex = 0;
    } else {
      this.syncBoardFromShips();
    }

    document.getElementById('bs-placement-card').style.display = 'block';
    document.getElementById('bs-battle-card').style.display = 'none';

    this.renderPlacementView();
  },

  syncBoardFromShips() {
    this.myBoard = Array(100).fill(0);
    for (const ship of this.myPlacedShips) {
      for (const idx of ship) {
        this.myBoard[idx] = 1;
      }
    }
  },

  toggleOrientation() {
    AudioEngine.tap();
    this.isHorizontal = !this.isHorizontal;
    const btn = document.getElementById('bs-btn-rotate');
    if (btn) {
      btn.textContent = this.isHorizontal ? this.t().bsRotateHoriz : this.t().bsRotateVert;
    }
  },

  selectShip(index) {
    AudioEngine.tap();
    this.selectedShipIndex = index;
    this.renderShipPills();
  },

  clearMyFleet() {
    AudioEngine.tap();
    this.myPlacedShips = [[], [], [], [], [], []];
    this.myBoard = Array(100).fill(0);
    this.selectedShipIndex = 0;
    this.renderPlacementView();
    App.showToast(this.t().bsPlaceShipPrompt);
  },

  autoPlaceMyFleet(showToast = true) {
    if (showToast) AudioEngine.tap();
    const tempBoard = Array(100).fill(0);
    const generated = this.placeFleetRandomly(tempBoard, [4, 3, 2, 2, 1, 1]);
    this.myPlacedShips = generated;
    this.myBoard = tempBoard;
    this.selectedShipIndex = 0;
    this.renderPlacementView();
    if (showToast) App.showToast(this.t().bsFleetRepositioned);
  },

  placeFleetRandomly(board, sizes) {
    const ships = [];
    for (const size of sizes) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 300) {
        attempts++;
        const horizontal = Math.random() > 0.5;
        const x = Math.floor(Math.random() * (horizontal ? (10 - size + 1) : 10));
        const y = Math.floor(Math.random() * (horizontal ? 10 : (10 - size + 1)));

        const indices = [];
        let canPlace = true;

        for (let i = 0; i < size; i++) {
          const cx = horizontal ? x + i : x;
          const cy = horizontal ? y : y + i;
          const idx = cy * 10 + cx;

          // Check direct cell and 8-direction buffer around cell
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
                if (board[ny * 10 + nx] === 1) canPlace = false;
              }
            }
          }
          indices.push(idx);
        }

        if (canPlace) {
          indices.forEach(idx => board[idx] = 1);
          ships.push(indices);
          placed = true;
        }
      }
    }
    return ships;
  },

  onPlacementCellClick(idx) {
    // If clicked on an already placed ship, select that ship so user can relocate it
    for (let sIdx = 0; sIdx < this.myPlacedShips.length; sIdx++) {
      if (this.myPlacedShips[sIdx].includes(idx)) {
        this.selectedShipIndex = sIdx;
        this.renderShipPills();
        AudioEngine.tap();
        return;
      }
    }

    const shipDef = this.fleetDefs[this.selectedShipIndex];
    const size = shipDef.size;
    const x = idx % 10;
    const y = Math.floor(idx / 10);

    const newIndices = [];
    for (let i = 0; i < size; i++) {
      const cx = this.isHorizontal ? x + i : x;
      const cy = this.isHorizontal ? y : y + i;
      if (cx >= 10 || cy >= 10) {
        AudioEngine.error();
        App.showToast(this.t().bsOutOfBounds);
        return;
      }
      newIndices.push(cy * 10 + cx);
    }

    // Check collision with other placed ships
    for (let sIdx = 0; sIdx < this.myPlacedShips.length; sIdx++) {
      if (sIdx === this.selectedShipIndex) continue;
      const otherShip = this.myPlacedShips[sIdx];
      for (const c of newIndices) {
        if (otherShip.includes(c)) {
          AudioEngine.error();
          App.showToast(this.t().bsOverlap);
          return;
        }
      }
    }

    // Place ship
    AudioEngine.bsPlace();
    this.myPlacedShips[this.selectedShipIndex] = newIndices;
    this.syncBoardFromShips();

    // Auto advance to next unplaced ship
    const nextUnplaced = this.myPlacedShips.findIndex(s => s.length === 0);
    if (nextUnplaced !== -1) {
      this.selectedShipIndex = nextUnplaced;
    }

    this.renderPlacementView();
  },

  renderPlacementView() {
    this.renderShipPills();

    const grid = document.getElementById('bs-placement-grid');
    if (!grid) return;

    // Create DOM cells once if not already created
    if (this.placementCells.length !== 100) {
      grid.innerHTML = '';
      this.placementCells = [];
      for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'bs-cell';
        cell.onclick = () => this.onPlacementCellClick(i);
        grid.appendChild(cell);
        this.placementCells.push(cell);
      }
    }

    // Update cell styles in-place without destroying DOM
    for (let i = 0; i < 100; i++) {
      const cell = this.placementCells[i];
      const isShip = (this.myBoard[i] === 1);
      if (isShip) {
        cell.className = 'bs-cell bs-my-ship';
        cell.style.background = '#0ea5e9';
        cell.style.borderColor = '#38bdf8';
        cell.textContent = '🚢';
      } else {
        cell.className = 'bs-cell';
        cell.style.background = '';
        cell.style.borderColor = '';
        cell.textContent = '';
      }
    }

    const placedCount = this.myPlacedShips.filter(s => s.length > 0).length;
    const startBtn = document.getElementById('bs-btn-start-battle');
    if (startBtn) {
      if (placedCount === 6) {
        startBtn.style.opacity = '1';
        startBtn.textContent = `⚔️ ${this.t().bsStartBattle}`;
      } else {
        startBtn.style.opacity = '0.7';
        startBtn.textContent = `⚔️ ${this.t().bsStartBattle} (${placedCount}/6)`;
      }
    }
  },

  renderShipPills() {
    const tray = document.getElementById('bs-ships-tray');
    if (!tray) return;
    tray.innerHTML = '';

    this.fleetDefs.forEach((def, index) => {
      const pill = document.createElement('div');
      pill.className = 'bs-ship-pill';
      if (index === this.selectedShipIndex) pill.classList.add('active');
      const isPlaced = (this.myPlacedShips[index].length > 0);
      if (isPlaced) pill.classList.add('placed');

      let label = def.nameUz;
      if (App.lang === 'ru') label = def.nameRu;
      else if (App.lang === 'en') label = def.nameEn;

      pill.textContent = isPlaced ? `${label} ✓` : label;
      pill.onclick = () => this.selectShip(index);
      tray.appendChild(pill);
    });

    const rotateBtn = document.getElementById('bs-btn-rotate');
    if (rotateBtn) {
      rotateBtn.textContent = this.isHorizontal ? this.t().bsRotateHoriz : this.t().bsRotateVert;
    }
  },

  startBattle() {
    const placedCount = this.myPlacedShips.filter(s => s.length > 0).length;
    if (placedCount < 6) {
      AudioEngine.error();
      App.showToast(`${6 - placedCount} ${this.t().bsRemainingToPlace}! ${this.t().bsPlaceShipPrompt}`);
      return;
    }

    if (this.mode === 'player') {
      this.myReady = true;
      Multiplayer.sendGameMove({ type: 'bs_ready', fleet: this.myPlacedShips });

      if (!this.oppReady) {
        App.showModal('⏳', this.t().mpWaitingOpp, this.t().bsWaitingOppReady);
        return;
      }
    }

    this.beginActualBattle();
  },

  beginActualBattle() {
    AudioEngine.sonar();
    this.phase = 'battle';
    this.inPlacement = false;
    this.isOver = false;
    this.botHuntQueue = [];
    this.oppBoard = Array(100).fill(0);

    if (this.mode === 'bot') {
      this.oppShips = this.placeFleetRandomly(Array(100).fill(0), [4, 3, 2, 2, 1, 1]);
    }

    this.syncBoardFromShips();

    document.getElementById('bs-placement-card').style.display = 'none';
    document.getElementById('bs-battle-card').style.display = 'block';

    this.initBattleBoardsDOM();
    this.renderBattleBoards();
    this.updateStatus();
    App.showToast(this.t().bsBattleStarted);
  },

  initBattleBoardsDOM() {
    const oppGrid = document.getElementById('bs-opp-grid');
    if (oppGrid && this.oppGridCells.length !== 100) {
      oppGrid.innerHTML = '';
      this.oppGridCells = [];
      for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'bs-cell';
        cell.onclick = () => this.playerFire(i);
        oppGrid.appendChild(cell);
        this.oppGridCells.push(cell);
      }
    }

    const myGrid = document.getElementById('bs-my-grid');
    if (myGrid && this.myMiniCells.length !== 100) {
      myGrid.innerHTML = '';
      this.myMiniCells = [];
      for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'bs-mini-cell';
        myGrid.appendChild(cell);
        this.myMiniCells.push(cell);
      }
    }
  },

  renderBattleBoards() {
    this.initBattleBoardsDOM();

    // Update Opponent Grid (Firing Target) in-place
    for (let i = 0; i < 100; i++) {
      const cell = this.oppGridCells[i];
      if (!cell) continue;
      const val = this.oppBoard[i];
      if (val === 2) {
        cell.className = 'bs-cell bs-miss';
        cell.textContent = '🌊';
      } else if (val === 3) {
        cell.className = 'bs-cell bs-hit';
        cell.textContent = '💥';
      } else {
        cell.className = 'bs-cell';
        cell.textContent = '';
      }
    }

    // Update My Fleet Grid (Mini display) in-place
    for (let i = 0; i < 100; i++) {
      const cell = this.myMiniCells[i];
      if (!cell) continue;
      const val = this.myBoard[i];
      if (val === 1) {
        cell.className = 'bs-mini-cell bs-my-ship';
        cell.textContent = '';
      } else if (val === 2) {
        cell.className = 'bs-mini-cell bs-miss';
        cell.textContent = '•';
      } else if (val === 3) {
        cell.className = 'bs-mini-cell bs-hit';
        cell.textContent = '×';
      } else {
        cell.className = 'bs-mini-cell';
        cell.textContent = '';
      }
    }

    this.updateFleetStats();
  },

  updateFleetStats() {
    const myRemaining = this.myPlacedShips.filter(s => !s.every(idx => this.myBoard[idx] === 3)).length;
    const oppRemaining = this.oppShips.filter(s => !s.every(idx => this.oppBoard[idx] === 3)).length;

    const myStat = document.getElementById('bs-my-remaining');
    const oppStat = document.getElementById('bs-opp-remaining');
    if (myStat) myStat.textContent = `🚢 ${myRemaining}/6`;
    if (oppStat) oppStat.textContent = `🎯 ${oppRemaining}/6`;
  },

  updateStatus() {
    const el = document.getElementById('bs-status-msg');
    if (!el || this.isOver) return;

    if (this.myTurn) {
      el.textContent = this.t().bsMyTurn;
      el.style.color = "#38bdf8";
    } else {
      el.textContent = (this.mode === 'bot') ? this.t().bsBotFiring : this.t().bsOppThinking;
      el.style.color = "#f59e0b";
    }
  },

  playerFire(idx) {
    if (this.isOver || !this.myTurn) return;
    if (this.oppBoard[idx] !== 0) return;

    AudioEngine.bsShot();

    if (this.mode === 'bot') {
      let hit = false;
      let sunkShip = null;

      for (const ship of this.oppShips) {
        if (ship.includes(idx)) {
          hit = true;
          this.oppBoard[idx] = 3;
          if (ship.every(cell => this.oppBoard[cell] === 3)) sunkShip = ship;
          break;
        }
      }

      if (!hit) {
        this.oppBoard[idx] = 2;
        AudioEngine.bsMiss();
        this.myTurn = false;
      } else {
        if (sunkShip) {
          AudioEngine.bsSink();
          App.showToast(this.t().bsShipSunk);
        } else {
          AudioEngine.bsHit();
        }
      }

      this.renderBattleBoards();

      const oppAlive = this.oppShips.some(s => !s.every(c => this.oppBoard[c] === 3));
      if (!oppAlive) {
        this.handleGameOver(true);
        return;
      }

      this.updateStatus();
      if (!this.myTurn) {
        setTimeout(() => this.botTurn(), 700);
      }
    } else {
      // MULTIPLAYER MODE: Send shot to opponent immediately
      // Mark as pending or test against oppShips
      let hit = false;
      let sunkShip = null;

      for (const ship of this.oppShips) {
        if (ship.includes(idx)) {
          hit = true;
          this.oppBoard[idx] = 3;
          if (ship.every(cell => this.oppBoard[cell] === 3)) sunkShip = ship;
          break;
        }
      }

      if (!hit) {
        this.oppBoard[idx] = 2;
        AudioEngine.bsMiss();
        this.myTurn = false;
      } else {
        if (sunkShip) {
          AudioEngine.bsSink();
          App.showToast(this.t().bsShipSunk);
        } else {
          AudioEngine.bsHit();
        }
        this.myTurn = true; // Still my turn on hit!
      }

      this.renderBattleBoards();
      this.updateStatus();

      // Send to opponent
      Multiplayer.sendGameMove({
        type: 'fire',
        idx: idx,
        hit: hit,
        sunk: !!sunkShip
      });

      const oppAlive = this.oppShips.some(s => !s.every(c => this.oppBoard[c] === 3));
      if (!oppAlive) {
        this.handleGameOver(true);
      }
    }
  },

  botTurn() {
    if (this.isOver || this.myTurn) return;

    let targetIdx = -1;
    while (this.botHuntQueue.length > 0) {
      const candidate = this.botHuntQueue.shift();
      if (this.myBoard[candidate] === 0 || this.myBoard[candidate] === 1) {
        targetIdx = candidate;
        break;
      }
    }

    if (targetIdx === -1) {
      const unshot = [];
      for (let i = 0; i < 100; i++) {
        if (this.myBoard[i] === 0 || this.myBoard[i] === 1) unshot.push(i);
      }
      if (unshot.length === 0) return;
      targetIdx = unshot[Math.floor(Math.random() * unshot.length)];
    }

    const hit = (this.myBoard[targetIdx] === 1);
    if (hit) {
      this.myBoard[targetIdx] = 3;
      AudioEngine.bsHit();

      const x = targetIdx % 10;
      const y = Math.floor(targetIdx / 10);
      const neighbors = [];
      if (x > 0) neighbors.push(targetIdx - 1);
      if (x < 9) neighbors.push(targetIdx + 1);
      if (y > 0) neighbors.push(targetIdx - 10);
      if (y < 9) neighbors.push(targetIdx + 10);

      this.botHuntQueue.push(...neighbors);
    } else {
      this.myBoard[targetIdx] = 2;
      AudioEngine.bsMiss();
      this.myTurn = true;
    }

    this.renderBattleBoards();

    const myAlive = this.myPlacedShips.some(s => !s.every(idx => this.myBoard[idx] === 3));
    if (!myAlive) {
      this.handleGameOver(false);
      return;
    }

    if (!this.myTurn) {
      setTimeout(() => this.botTurn(), 800);
    } else {
      this.updateStatus();
    }
  },

  handleRemoteMove(data) {
    if (data.type === 'bs_restart') {
      this.enterPlacementPhase(true);
      App.showToast("Raqib o'yinni yangitdan boshladi");
    } else if (data.type === 'bs_ready') {
      this.oppShips = data.fleet;
      this.oppReady = true;
      if (this.myReady) {
        App.closeModal();
        this.beginActualBattle();
      }
    } else if (data.type === 'fire') {
      const idx = data.idx;
      const hit = (this.myBoard[idx] === 1);
      this.myBoard[idx] = hit ? 3 : 2;
      this.myTurn = !hit;
      this.renderBattleBoards();
      this.updateStatus();

      const myAlive = this.myPlacedShips.some(s => !s.every(c => this.myBoard[c] === 3));
      if (!myAlive) this.handleGameOver(false);
    }
  },

  handleGameOver(playerWon) {
    this.isOver = true;
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
    const t = this.t();
    if (playerWon) {
      this.myScore++;
      document.getElementById('bs-my-score').textContent = this.myScore;
      AudioEngine.win();
      Confetti.fire(40);
      App.showModal('🏆', t.bsWinTitle, t.bsWinDesc, () => Battleship.enterPlacementPhase());
    } else {
      this.oppScore++;
      document.getElementById('bs-opp-score').textContent = this.oppScore;
      AudioEngine.error();
      App.showModal('💥', t.bsLossTitle, t.bsLossDesc, () => Battleship.enterPlacementPhase());
    }
  }
};
