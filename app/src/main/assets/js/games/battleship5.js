/* 5x5 Battleship (Tezkor Dengiz Jangi 5x5) Engine with Manual/Auto Placement, Smart AI & Full Localization */
const Battleship5 = {
  mode: 'bot', // 'bot' or 'player'
  phase: 'place', // 'place' or 'battle'

  fleetDefs: [
    { id: 0, nameUz: "🚢 Cruiser (3)", nameRu: "🚢 Крейсер (3)", nameEn: "🚢 Cruiser (3)", nameTr: "🚢 Kruvazör (3)", size: 3 },
    { id: 1, nameUz: "🚤 Destroyer (2)", nameRu: "🚤 Эсминец (2)", nameEn: "🚤 Destroyer (2)", nameTr: "🚤 Muhrip (2)", size: 2 },
    { id: 2, nameUz: "⛵ Patrol-1 (1)", nameRu: "⛵ Катер-1 (1)", nameEn: "⛵ Patrol-1 (1)", nameTr: "⛵ Bot-1 (1)", size: 1 },
    { id: 3, nameUz: "⛵ Patrol-2 (1)", nameRu: "⛵ Катер-2 (1)", nameEn: "⛵ Patrol-2 (1)", nameTr: "⛵ Bot-2 (1)", size: 1 }
  ],

  selectedShipIndex: 0,
  isHorizontal: true,
  myPlacedShips: [[], [], [], []], // 4 ships
  myBoard: Array(25).fill(0), // 0: empty, 1: ship, 2: miss, 3: hit
  oppBoard: Array(25).fill(0), // 0: unrevealed, 2: miss, 3: hit
  oppShips: [],
  myTurn: true,
  isOver: false,
  botHuntQueue: [],
  myScore: 0,
  oppScore: 0,
  myReady: false,
  oppReady: false,

  init() {
    this.enterPlacementPhase();
  },

  t() {
    return (typeof I18N !== 'undefined' && I18N[App.lang]) || (typeof I18N !== 'undefined' && I18N.uz) || {};
  },

  setMode(m) {
    AudioEngine.tap();
    this.mode = m;
    const tabBot = document.getElementById('bs5-tab-bot');
    const tabPlayer = document.getElementById('bs5-tab-player');
    if (tabBot) tabBot.classList.toggle('active', m === 'bot');
    if (tabPlayer) tabPlayer.classList.toggle('active', m === 'player');

    const oppLabel = document.getElementById('bs5-opp-label');
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
    const tabBot = document.getElementById('bs5-tab-bot');
    const tabPlayer = document.getElementById('bs5-tab-player');
    if (tabBot) tabBot.classList.remove('active');
    if (tabPlayer) tabPlayer.classList.add('active');
    const oppLabel = document.getElementById('bs5-opp-label');
    if (oppLabel) oppLabel.textContent = `👥 ${this.t().opponent || 'Raqib'}`;
    this.myTurn = isHost;
    this.myReady = false;
    this.oppReady = false;
    this.enterPlacementPhase();
    App.showToast(this.t().bs5PlaceShipPrompt || "4 ta kemani 5x5 xaritaga joylashtiring");
  },

  enterPlacementPhase(isSync = false) {
    if (this.mode === 'player' && !isSync) {
      Multiplayer.sendGameMove({ type: 'bs5_restart' });
    }
    this.phase = 'place';
    this.inPlacement = true;
    this.isOver = false;
    this.myReady = false;
    this.oppReady = false;
    this.botHuntQueue = [];
    this.oppBoard = Array(25).fill(0);
    this.oppShips = this.placeFleetRandomly(Array(25).fill(0), [3, 2, 1, 1]);

    if (this.myPlacedShips.every(s => s.length === 0)) {
      this.myBoard = Array(25).fill(0);
      this.selectedShipIndex = 0;
    } else {
      this.syncBoardFromShips();
    }

    const pCard = document.getElementById('bs5-placement-card');
    const bCard = document.getElementById('bs5-battle-card');
    if (pCard) pCard.style.display = 'block';
    if (bCard) bCard.style.display = 'none';

    this.renderPlacementView();
  },

  syncBoardFromShips() {
    this.myBoard = Array(25).fill(0);
    for (const ship of this.myPlacedShips) {
      for (const idx of ship) {
        this.myBoard[idx] = 1;
      }
    }
  },

  toggleOrientation() {
    AudioEngine.tap();
    this.isHorizontal = !this.isHorizontal;
    const btn = document.getElementById('bs5-btn-rotate');
    if (btn) {
      const t = this.t();
      btn.textContent = this.isHorizontal ? (t.bsRotateHoriz || 'Gorizontal') : (t.bsRotateVert || 'Vertikal');
    }
  },

  selectShip(index) {
    AudioEngine.tap();
    this.selectedShipIndex = index;
    this.renderShipPills();
  },

  clearMyFleet() {
    AudioEngine.tap();
    this.myPlacedShips = [[], [], [], []];
    this.myBoard = Array(25).fill(0);
    this.selectedShipIndex = 0;
    this.renderPlacementView();
    App.showToast(this.t().bs5PlaceShipPrompt || "4 ta kemani joylashtiring");
  },

  autoPlaceMyFleet(showToast = true) {
    if (showToast) AudioEngine.tap();
    const tempBoard = Array(25).fill(0);
    const generated = this.placeFleetRandomly(tempBoard, [3, 2, 1, 1]);
    this.myPlacedShips = generated;
    this.myBoard = tempBoard;
    this.selectedShipIndex = 0;
    this.renderPlacementView();
    if (showToast) App.showToast(this.t().bsFleetRepositioned || "Kemalaringiz joylashtirildi!");
  },

  placeFleetRandomly(board, sizes) {
    const ships = [];
    for (const size of sizes) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 300) {
        attempts++;
        const horizontal = Math.random() > 0.5;
        const x = Math.floor(Math.random() * (horizontal ? (5 - size + 1) : 5));
        const y = Math.floor(Math.random() * (horizontal ? 5 : (5 - size + 1)));

        const indices = [];
        let canPlace = true;

        for (let i = 0; i < size; i++) {
          const cx = horizontal ? x + i : x;
          const cy = horizontal ? y : y + i;
          const idx = cy * 5 + cx;

          // Check cell and adjacent boundary
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx >= 0 && nx < 5 && ny >= 0 && ny < 5) {
                if (board[ny * 5 + nx] === 1) {
                  canPlace = false;
                  break;
                }
              }
            }
            if (!canPlace) break;
          }
          if (!canPlace) break;
          indices.push(idx);
        }

        if (canPlace) {
          indices.forEach(idx => board[idx] = 1);
          ships.push(indices);
          placed = true;
        }
      }

      // Fallback: relax diagonal buffers if tight
      if (!placed) {
        for (let idx = 0; idx < 25; idx++) {
          if (board[idx] === 0) {
            board[idx] = 1;
            ships.push([idx]);
            break;
          }
        }
      }
    }
    return ships;
  },

  renderPlacementView() {
    this.renderShipPills();
    this.renderPlacementGrid();
  },

  renderShipPills() {
    const tray = document.getElementById('bs5-ships-tray');
    if (!tray) return;
    tray.innerHTML = '';
    const lang = App.lang || 'uz';
    const langKey = lang === 'ru' ? 'nameRu' : (lang === 'en' ? 'nameEn' : (lang === 'tr' ? 'nameTr' : 'nameUz'));

    this.fleetDefs.forEach((def, index) => {
      const isPlaced = this.myPlacedShips[index] && this.myPlacedShips[index].length > 0;
      const isSelected = this.selectedShipIndex === index;

      const pill = document.createElement('div');
      pill.className = `bs-ship-pill ${isSelected ? 'active' : ''} ${isPlaced ? 'placed' : ''}`;
      pill.innerHTML = `<span>${def[langKey] || def.nameUz}</span> ${isPlaced ? '✓' : ''}`;
      pill.onclick = () => this.selectShip(index);
      tray.appendChild(pill);
    });
  },

  renderPlacementGrid() {
    const grid = document.getElementById('bs5-placement-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'bs-cell bs5-cell';
      cell.dataset.index = i;

      if (this.myBoard[i] === 1) {
        cell.classList.add('bs-my-ship');
        cell.textContent = '🚢';
      }

      cell.onclick = () => this.onPlacementCellClick(i);
      grid.appendChild(cell);
    }
  },

  onPlacementCellClick(index) {
    const shipDef = this.fleetDefs[this.selectedShipIndex];
    if (!shipDef) return;

    const x = index % 5;
    const y = Math.floor(index / 5);
    const size = shipDef.size;

    if (this.isHorizontal && x + size > 5) {
      App.showToast(this.t().bsOutOfBounds || "Maydon tashqarisiga chiqib ketdi!");
      AudioEngine.error();
      return;
    }
    if (!this.isHorizontal && y + size > 5) {
      App.showToast(this.t().bsOutOfBounds || "Maydon tashqarisiga chiqib ketdi!");
      AudioEngine.error();
      return;
    }

    const newIndices = [];
    for (let i = 0; i < size; i++) {
      newIndices.push(this.isHorizontal ? y * 5 + (x + i) : (y + i) * 5 + x);
    }

    // Check overlap with other ships
    for (let sIdx = 0; sIdx < this.myPlacedShips.length; sIdx++) {
      if (sIdx === this.selectedShipIndex) continue;
      const otherShip = this.myPlacedShips[sIdx];
      for (const idx of newIndices) {
        if (otherShip.includes(idx)) {
          App.showToast(this.t().bsOverlap || "Kemalar ustma-ust tushmasligi kerak!");
          AudioEngine.error();
          return;
        }
      }
    }

    // Place the ship
    this.myPlacedShips[this.selectedShipIndex] = newIndices;
    this.syncBoardFromShips();
    AudioEngine.tap();

    // Auto advance to next unplaced ship
    let nextIdx = -1;
    for (let i = 0; i < this.fleetDefs.length; i++) {
      if (!this.myPlacedShips[i] || this.myPlacedShips[i].length === 0) {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx !== -1) {
      this.selectedShipIndex = nextIdx;
    }

    this.renderPlacementView();

    const placedCount = this.myPlacedShips.filter(s => s.length > 0).length;
    if (placedCount === this.fleetDefs.length) {
      App.showToast(this.t().bs5AllPlaced || "Barcha 4 ta kema joylandi! Jangni boshlang!");
    }
  },

  startBattle() {
    const placedCount = this.myPlacedShips.filter(s => s.length > 0).length;
    if (placedCount < this.fleetDefs.length) {
      const remaining = this.fleetDefs.length - placedCount;
      App.showToast(`Yana ${remaining} ${this.t().bsRemainingToPlace || 'ta kema qoldi!'}`);
      AudioEngine.error();
      return;
    }

    AudioEngine.tap();
    if (this.mode === 'player') {
      this.myReady = true;
      Multiplayer.sendGameMove({ type: 'bs5_ready', fleet: this.myPlacedShips });
      if (!this.oppReady) {
        App.showToast(this.t().bsWaitingOppReady || "Raqib kutilmoqda...");
        return;
      }
    }

    this.beginCombat();
  },

  beginCombat() {
    this.phase = 'battle';
    this.inPlacement = false;
    this.isOver = false;

    const pCard = document.getElementById('bs5-placement-card');
    const bCard = document.getElementById('bs5-battle-card');
    if (pCard) pCard.style.display = 'none';
    if (bCard) bCard.style.display = 'block';

    this.renderBattleBoards();
    this.updateStatus();
    App.showToast(this.t().bsBattleStarted || "Jang boshlandi! O't oching!");
  },

  renderBattleBoards() {
    this.renderOppRadarGrid();
    this.renderMyMiniGrid();
    this.updateScoreboard();
  },

  renderOppRadarGrid() {
    const grid = document.getElementById('bs5-opp-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'bs-cell bs5-cell';
      cell.dataset.index = i;

      const state = this.oppBoard[i];
      if (state === 2) {
        cell.classList.add('bs-miss');
        cell.textContent = '🌊';
      } else if (state === 3) {
        cell.classList.add('bs-hit');
        cell.textContent = '💥';
      }

      cell.onclick = () => this.playerFire(i);
      grid.appendChild(cell);
    }
  },

  renderMyMiniGrid() {
    const grid = document.getElementById('bs5-my-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'bs-mini-cell bs5-mini-cell';

      if (this.myBoard[i] === 1) cell.classList.add('bs-my-ship');
      else if (this.myBoard[i] === 2) cell.classList.add('bs-miss');
      else if (this.myBoard[i] === 3) {
        cell.classList.add('bs-hit');
        cell.textContent = '💥';
      }

      grid.appendChild(cell);
    }
  },

  updateScoreboard() {
    const myRem = this.countRemainingShips(this.myPlacedShips, this.myBoard);
    const oppRem = this.countRemainingShips(this.oppShips, this.oppBoard);

    const elMyRem = document.getElementById('bs5-my-remaining');
    const elOppRem = document.getElementById('bs5-opp-remaining');
    const elMyScore = document.getElementById('bs5-my-score');
    const elOppScore = document.getElementById('bs5-opp-score');

    if (elMyRem) elMyRem.textContent = `🚢 ${myRem}/4`;
    if (elOppRem) elOppRem.textContent = `🎯 ${oppRem}/4`;
    if (elMyScore) elMyScore.textContent = this.myScore;
    if (elOppScore) elOppScore.textContent = this.oppScore;
  },

  countRemainingShips(ships, board) {
    let remaining = 0;
    for (const ship of ships) {
      const isSunk = ship.length > 0 && ship.every(idx => board[idx] === 3);
      if (!isSunk) remaining++;
    }
    return remaining;
  },

  updateStatus() {
    const t = this.t();
    const msg = document.getElementById('bs5-status-msg');
    if (!msg) return;

    if (this.myTurn) {
      msg.textContent = t.bsMyTurn || "Sizning navbatingiz: Dushman katagiga bosing!";
      msg.style.color = "#38bdf8";
    } else {
      msg.textContent = this.mode === 'bot' ? (t.bsBotFiring || "🤖 Dushman o'q uzmoqda...") : (t.bsOppThinking || "👥 Raqib o'ylamoqda...");
      msg.style.color = "#f43f5e";
    }
  },

  playerFire(index) {
    if (this.isOver || !this.myTurn) return;
    if (this.oppBoard[index] !== 0) return; // already fired here

    let isHit = false;
    for (const ship of this.oppShips) {
      if (ship.includes(index)) {
        isHit = true;
        break;
      }
    }

    this.oppBoard[index] = isHit ? 3 : 2;
    if (isHit) {
      AudioEngine.win();
      this.myScore += 10;
      this.checkShipSunk(this.oppShips, this.oppBoard, true);
    } else {
      AudioEngine.waterSplash();
    }

    this.renderBattleBoards();

    if (this.mode === 'player') {
      Multiplayer.sendGameMove({ type: 'bs5_fire', index, isHit });
    }

    const oppRem = this.countRemainingShips(this.oppShips, this.oppBoard);
    if (oppRem === 0) {
      this.handleGameOver(true);
      return;
    }

    this.myTurn = false;
    this.updateStatus();

    if (this.mode === 'bot') {
      setTimeout(() => this.botTurn(), 550);
    }
  },

  botTurn() {
    if (this.isOver || this.myTurn) return;

    let targetIdx = -1;

    // Check hunt queue first
    while (this.botHuntQueue.length > 0) {
      const candidate = this.botHuntQueue.shift();
      if (this.myBoard[candidate] !== 2 && this.myBoard[candidate] !== 3) {
        targetIdx = candidate;
        break;
      }
    }

    // Otherwise random shot on unrevealed cell
    if (targetIdx === -1) {
      const open = [];
      for (let i = 0; i < 25; i++) {
        if (this.myBoard[i] !== 2 && this.myBoard[i] !== 3) {
          open.push(i);
        }
      }
      if (open.length > 0) {
        targetIdx = open[Math.floor(Math.random() * open.length)];
      }
    }

    if (targetIdx === -1) return;

    const isHit = this.myBoard[targetIdx] === 1;
    this.myBoard[targetIdx] = isHit ? 3 : 2;

    if (isHit) {
      AudioEngine.error();
      this.oppScore += 10;

      // Add neighbors to hunt queue (up, down, left, right)
      const x = targetIdx % 5;
      const y = Math.floor(targetIdx / 5);
      const neighbors = [];
      if (y > 0) neighbors.push((y - 1) * 5 + x);
      if (y < 4) neighbors.push((y + 1) * 5 + x);
      if (x > 0) neighbors.push(y * 5 + (x - 1));
      if (x < 4) neighbors.push(y * 5 + (x + 1));

      neighbors.forEach(n => {
        if (this.myBoard[n] !== 2 && this.myBoard[n] !== 3 && !this.botHuntQueue.includes(n)) {
          this.botHuntQueue.push(n);
        }
      });

      this.checkShipSunk(this.myPlacedShips, this.myBoard, false);
    } else {
      AudioEngine.waterSplash();
    }

    this.renderBattleBoards();

    const myRem = this.countRemainingShips(this.myPlacedShips, this.myBoard);
    if (myRem === 0) {
      this.handleGameOver(false);
      return;
    }

    this.myTurn = true;
    this.updateStatus();
  },

  checkShipSunk(ships, board, isEnemy) {
    for (const ship of ships) {
      if (ship.length > 0 && ship.every(idx => board[idx] === 3)) {
        // Just sunk
        if (!ship.notified) {
          ship.notified = true;
          const t = this.t();
          App.showToast(isEnemy ? (t.bsShipSunk || "🔥 Dushman kemasi cho'ktirildi!") : "💥 Sizning kemangiz cho'kdi!");
        }
      }
    }
  },

  handleGameOver(userWon) {
    this.isOver = true;
    if (typeof App !== 'undefined' && App.notifyGameCompleted) App.notifyGameCompleted();
    const t = this.t();

    if (userWon) {
      AudioEngine.win();
      Confetti.fire(70);
      App.showModal(
        '🏆',
        t.bsWinTitle || "G'alaba!",
        t.bs5WinDesc || "Siz dushmanning barcha 4 ta kemasini cho'ktirdingiz!",
        () => this.enterPlacementPhase()
      );
    } else {
      AudioEngine.error();
      App.showModal(
        '💥',
        t.bsLossTitle || "Mag'lubiyat!",
        t.bs5LossDesc || "Dushman sizning butun 5x5 flotingizni cho'ktirdi!",
        () => this.enterPlacementPhase()
      );
    }
  },

  backToPlacement() {
    AudioEngine.tap();
    this.enterPlacementPhase();
  },

  handleRemoteMove(data) {
    if (data.type === 'bs5_ready') {
      this.oppReady = true;
      if (data.fleet) this.oppShips = data.fleet;
      if (this.myReady) this.beginCombat();
    } else if (data.type === 'bs5_fire') {
      const idx = data.index;
      const isHit = this.myBoard[idx] === 1;
      this.myBoard[idx] = isHit ? 3 : 2;
      this.renderBattleBoards();
      Multiplayer.sendGameMove({ type: 'bs5_result', index: idx, isHit });
      this.myTurn = true;
      this.updateStatus();
    } else if (data.type === 'bs5_restart') {
      this.enterPlacementPhase(true);
    }
  }
};
