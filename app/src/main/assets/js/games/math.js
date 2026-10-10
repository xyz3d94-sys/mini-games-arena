/* Fast Math & Algebra (Tezkor Matematika) Game Engine
   - 10 Complete Levels with progressive difficulty
   - 100% Multilingual Questions and Explanations (UZ, EN, RU, TR)
   - Battleship-style Mode Switch (Bot / Player)
   - Dynamic Timer and Streak multipliers
*/
const MathGame = {
  mode: 'bot', // 'bot' or 'player'
  level: 1,
  timer: null,
  timeLeft: 60,
  maxTime: 60,
  score: 0,
  streak: 0,
  best: 0,
  correctCount: 0,
  currentProblem: null,

  init() {
    const b = localStorage.getItem('math_best_score_v4');
    if (b) {
      this.best = parseInt(b) || 0;
      const el = document.getElementById('math-best-val');
      if (el) el.textContent = this.best;
    }
  },

  t() {
    return I18N[App.lang] || I18N.uz;
  },

  updateUIStrings() {
    const t = this.t();
    const lang = App.lang || 'uz';
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el && txt) el.textContent = txt;
    };

    setTxt('math-header-title', t.mMathTitle || "Speed Math");
    setTxt('math-lbl-vs-bot', t.vsBot || "Vs Bot");
    setTxt('math-lbl-vs-player', t.vsPlayer || "Vs Player");
    setTxt('math-lbl-best', t.bestScoreText || "BEST");
    setTxt('math-lbl-score', t.score || "SCORE");
    setTxt('math-lbl-time', t.timeElapsedText || "TIME");

    // Update level tabs 1..10
    for (let i = 1; i <= 10; i++) {
      const tab = document.getElementById('math-tab-' + i);
      if (tab) {
        let lvlName = `${i}-bosqich`;
        if (lang === 'ru') lvlName = `${i}-уровень`;
        else if (lang === 'en') lvlName = `Level ${i}`;
        else if (lang === 'tr') lvlName = `${i}. Seviye`;
        tab.textContent = lvlName;
      }
    }

    if (this.currentProblem) {
      let lvlPrefix = `${this.level}-bosqich`;
      if (lang === 'ru') lvlPrefix = `${this.level}-уровень`;
      else if (lang === 'en') lvlPrefix = `Level ${this.level}`;
      else if (lang === 'tr') lvlPrefix = `${this.level}. Seviye`;
      const tagEl = document.getElementById('math-current-level-tag');
      if (tagEl) tagEl.textContent = lvlPrefix;
    }
  },

  setMode(m) {
    AudioEngine.tap();
    if (m === 'player') {
      Multiplayer.openChallengeModal('math', this.t().mMathTitle || "Speed Math");
      return;
    }
    this.mode = 'bot';
    const bBot = document.getElementById('math-tab-bot');
    const bPlayer = document.getElementById('math-tab-player');
    if (bBot) bBot.classList.add('active');
    if (bPlayer) bPlayer.classList.remove('active');
    this.restart();
  },

  startMultiplayer(isHost) {
    this.mode = 'player';
    const bBot = document.getElementById('math-tab-bot');
    const bPlayer = document.getElementById('math-tab-player');
    if (bBot) bBot.classList.remove('active');
    if (bPlayer) bPlayer.classList.add('active');
    this.restart();
  },

  setLevel(lvl) {
    AudioEngine.tap();
    this.level = lvl;
    for (let i = 1; i <= 10; i++) {
      const btn = document.getElementById('math-tab-' + i);
      if (btn) {
        const isActive = (lvl === i);
        btn.classList.toggle('active', isActive);
        if (isActive) {
          try {
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          } catch(e) {}
        }
      }
    }
    this.restart();
  },

  start() {
    this.correctCount = 0;
    this.score = 0;
    this.streak = 0;
    this.maxTime = (this.level <= 5) ? 60 : 120;
    this.timeLeft = this.maxTime;
    const sEl = document.getElementById('math-score-val');
    const stEl = document.getElementById('math-streak-val');
    if (sEl) sEl.textContent = '0';
    if (stEl) stEl.textContent = '🔥 0';
    this.updateUIStrings();
    this.nextQuestion();
    this.startTimer();
  },

  restart() {
    this.stop();
    this.start();
  },

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  startTimer() {
    this.stop();
    this.updateTimerBar();
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerBar();
      if (this.timeLeft <= 5 && this.timeLeft > 0) {
        AudioEngine.mathTick();
      }
      if (this.timeLeft <= 0) this.gameOver();
    }, 1000);
  },

  updateTimerBar() {
    const timeEl = document.getElementById('math-time-val');
    const fillEl = document.getElementById('math-timer-fill');
    if (timeEl) timeEl.textContent = this.timeLeft + 's';
    if (fillEl) {
      const pct = Math.max(0, (this.timeLeft / this.maxTime) * 100);
      fillEl.style.width = pct + '%';
    }
  },

  nextQuestion() {
    const activeLevel = this.level;
    const lang = App.lang || 'uz';
    let exp = '', ans = 0, explanation = '';

    let lvlName = `${activeLevel}-bosqich`;
    if (lang === 'ru') lvlName = `${activeLevel}-уровень`;
    else if (lang === 'en') lvlName = `Level ${activeLevel}`;
    else if (lang === 'tr') lvlName = `${activeLevel}. Seviye`;

    if (activeLevel === 1) { // Lvl 1: Basic addition, subtraction, missing numbers, tri-sums, word problems
      const sub = Math.floor(Math.random() * 7);
      if (sub === 0) { // a + b = ?
        const a = Math.floor(Math.random() * 40) + 5;
        const b = Math.floor(Math.random() * 40) + 5;
        ans = a + b;
        exp = `${a} + ${b} = ?`;
        explanation = `${a} + ${b} = ${ans}`;
      } else if (sub === 1) { // a - b = ?
        const a = Math.floor(Math.random() * 50) + 20;
        const b = Math.floor(Math.random() * (a - 8)) + 5;
        ans = a - b;
        exp = `${a} - ${b} = ?`;
        explanation = `${a} - ${b} = ${ans}`;
      } else if (sub === 2) { // a + ? = c
        const a = Math.floor(Math.random() * 30) + 10;
        ans = Math.floor(Math.random() * 30) + 5;
        const c = a + ans;
        exp = `${a} + ? = ${c}`;
        explanation = `? = ${c} - ${a} = ${ans}`;
      } else if (sub === 3) { // ? - b = c
        ans = Math.floor(Math.random() * 40) + 20;
        const b = Math.floor(Math.random() * 15) + 5;
        const c = ans - b;
        exp = `? - ${b} = ${c}`;
        explanation = `? = ${c} + ${b} = ${ans}`;
      } else if (sub === 4) { // a + b + c = ?
        const a = Math.floor(Math.random() * 15) + 3;
        const b = Math.floor(Math.random() * 15) + 3;
        const c = Math.floor(Math.random() * 15) + 3;
        ans = a + b + c;
        exp = `${a} + ${b} + ${c} = ?`;
        explanation = `${a} + ${b} + ${c} = ${ans}`;
      } else if (sub === 5) { // a - b - c = ?
        const a = Math.floor(Math.random() * 40) + 30;
        const b = Math.floor(Math.random() * 12) + 3;
        const c = Math.floor(Math.random() * 10) + 2;
        ans = a - b - c;
        exp = `${a} - ${b} - ${c} = ?`;
        explanation = `${a} - ${b} - ${c} = ${ans}`;
      } else { // Practical word problem
        const initCount = Math.floor(Math.random() * 25) + 10;
        const added = Math.floor(Math.random() * 15) + 5;
        ans = initCount + added;
        if (lang === 'en') exp = `There were ${initCount} books. Added ${added}. Total = ?`;
        else if (lang === 'ru') exp = `Было ${initCount} книг. Добавили ${added}. Всего = ?`;
        else if (lang === 'tr') exp = `${initCount} kitap vardı. ${added} tane eklendi. Toplam = ?`;
        else exp = `Javonda ${initCount} ta kitob bor edi. Yana ${added} ta qo'yildi. Jami = ?`;
        explanation = `${initCount} + ${added} = ${ans}`;
      }
    } else if (activeLevel === 2) { // Lvl 2: Multiplication, Division, Mixed fast operations
      const sub = Math.floor(Math.random() * 7);
      if (sub === 0) { // a × b = ?
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 12) + 2;
        ans = a * b;
        exp = `${a} × ${b} = ?`;
        explanation = `${a} × ${b} = ${ans}`;
      } else if (sub === 1) { // a ÷ b = ?
        const b = Math.floor(Math.random() * 8) + 2;
        ans = Math.floor(Math.random() * 10) + 2;
        const a = b * ans;
        exp = `${a} ÷ ${b} = ?`;
        explanation = `${a} ÷ ${b} = ${ans}`;
      } else if (sub === 2) { // a × ? = c
        const a = Math.floor(Math.random() * 8) + 3;
        ans = Math.floor(Math.random() * 9) + 2;
        const c = a * ans;
        exp = `${a} × ? = ${c}`;
        explanation = `? = ${c} ÷ ${a} = ${ans}`;
      } else if (sub === 3) { // ? ÷ b = c
        const b = Math.floor(Math.random() * 7) + 2;
        const c = Math.floor(Math.random() * 8) + 2;
        ans = b * c;
        exp = `? ÷ ${b} = ${c}`;
        explanation = `? = ${c} × ${b} = ${ans}`;
      } else if (sub === 4) { // 2a + b = ?
        const a = Math.floor(Math.random() * 7) + 3;
        const b = Math.floor(Math.random() * 20) + 5;
        ans = 2 * a + b;
        exp = `2 × ${a} + ${b} = ?`;
        explanation = `${2 * a} + ${b} = ${ans}`;
      } else if (sub === 5) { // a × b - c = ?
        const a = Math.floor(Math.random() * 8) + 3;
        const b = Math.floor(Math.random() * 6) + 3;
        const c = Math.floor(Math.random() * 10) + 2;
        ans = a * b - c;
        exp = `${a} × ${b} - ${c} = ?`;
        explanation = `${a * b} - ${c} = ${ans}`;
      } else { // Word problem: boxes with items
        const boxes = Math.floor(Math.random() * 6) + 3;
        const perBox = Math.floor(Math.random() * 7) + 4;
        ans = boxes * perBox;
        if (lang === 'en') exp = `${boxes} boxes with ${perBox} pens each. Total pens = ?`;
        else if (lang === 'ru') exp = `${boxes} коробок по ${perBox} ручек в каждой. Всего = ?`;
        else if (lang === 'tr') exp = `Her birinde ${perBox} kalem olan ${boxes} kutu. Toplam = ?`;
        else exp = `${boxes} ta qutining har birida ${perBox} tadan qalam bor. Jami = ?`;
        explanation = `${boxes} × ${perBox} = ${ans}`;
      }
    } else if (activeLevel === 3) { // Lvl 3: Parentheses, Order of operations, Squares
      const sub = Math.floor(Math.random() * 5);
      if (sub === 0) { // (a - b) × c
        const a = Math.floor(Math.random() * 16) + 6;
        const b = Math.floor(Math.random() * (a - 2)) + 1;
        const c = Math.floor(Math.random() * 7) + 2;
        ans = (a - b) * c;
        exp = `(${a} - ${b}) × ${c} = ?`;
        explanation = `(${a - b}) × ${c} = ${ans}`;
      } else if (sub === 1) { // a × b + c
        const a = Math.floor(Math.random() * 9) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        const c = Math.floor(Math.random() * 25) + 5;
        ans = a * b + c;
        exp = `${a} × ${b} + ${c} = ?`;
        explanation = `${a * b} + ${c} = ${ans}`;
      } else if (sub === 2) { // a + b × c
        const a = Math.floor(Math.random() * 25) + 5;
        const b = Math.floor(Math.random() * 8) + 2;
        const c = Math.floor(Math.random() * 6) + 2;
        ans = a + b * c;
        exp = `${a} + ${b} × ${c} = ?`;
        explanation = `${a} + ${b * c} = ${ans}`;
      } else if (sub === 3) { // (a + b) ÷ c
        const c = Math.floor(Math.random() * 6) + 2;
        ans = Math.floor(Math.random() * 9) + 2;
        const sum = c * ans;
        const a = Math.floor(Math.random() * (sum - 4)) + 2;
        const b = sum - a;
        exp = `(${a} + ${b}) ÷ ${c} = ?`;
        explanation = `${sum} ÷ ${c} = ${ans}`;
      } else { // a² + b
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 20) + 2;
        ans = a * a + b;
        exp = `${a}² + ${b} = ?`;
        explanation = `${a * a} + ${b} = ${ans}`;
      }
    } else if (activeLevel === 4) { // Lvl 4: Linear equations & Unknowns
      const sub = Math.floor(Math.random() * 5);
      if (sub === 0) { // ax + b = c
        const a = Math.floor(Math.random() * 6) + 2;
        ans = Math.floor(Math.random() * 12) + 2;
        const b = Math.floor(Math.random() * 20) + 3;
        const c = a * ans + b;
        exp = `${a}x + ${b} = ${c}. x = ?`;
        explanation = `${a}x = ${c - b} &rarr; x = ${ans}`;
      } else if (sub === 1) { // ax - b = c
        const a = Math.floor(Math.random() * 6) + 2;
        ans = Math.floor(Math.random() * 12) + 2;
        const b = Math.floor(Math.random() * 20) + 3;
        const c = a * ans - b;
        exp = `${a}x - ${b} = ${c}. x = ?`;
        explanation = `${a}x = ${c + b} &rarr; x = ${ans}`;
      } else if (sub === 2) { // c - ax = b
        const a = Math.floor(Math.random() * 5) + 2;
        ans = Math.floor(Math.random() * 10) + 2;
        const b = Math.floor(Math.random() * 15) + 2;
        const c = b + a * ans;
        exp = `${c} - ${a}x = ${b}. x = ?`;
        explanation = `${a}x = ${c - b} &rarr; x = ${ans}`;
      } else if (sub === 3) { // 2(x + a) = c
        ans = Math.floor(Math.random() * 10) + 2;
        const a = Math.floor(Math.random() * 8) + 2;
        const c = 2 * (ans + a);
        exp = `2(x + ${a}) = ${c}. x = ?`;
        explanation = `x + ${a} = ${c / 2} &rarr; x = ${ans}`;
      } else { // ax + bx = c
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 4) + 2;
        ans = Math.floor(Math.random() * 10) + 2;
        const c = (a + b) * ans;
        exp = `${a}x + ${b}x = ${c}. x = ?`;
        explanation = `${a + b}x = ${c} &rarr; x = ${ans}`;
      }
    } else if (activeLevel === 5) { // Lvl 5: Percentages, Discounts, Proportions
      const sub = Math.floor(Math.random() * 5);
      if (sub === 0) { // p% of total
        const pList = [10, 20, 25, 50, 75];
        const p = pList[Math.floor(Math.random() * pList.length)];
        const mult = Math.floor(Math.random() * 8) + 1;
        const total = (p === 75 || p === 25) ? mult * 40 : mult * 10;
        ans = Math.round((total * p) / 100);
        if (lang === 'en') exp = `${p}% of ${total} = ?`;
        else if (lang === 'ru') exp = `${p}% от ${total} = ?`;
        else if (lang === 'tr') exp = `${total}'nin %${p}'i = ?`;
        else exp = `${total} ning ${p}% i = ?`;
        explanation = `(${total} × ${p}) / 100 = ${ans}`;
      } else if (sub === 1) { // Discount
        const original = (Math.floor(Math.random() * 8) + 2) * 50; // 100, 150, 200..
        const discPct = [10, 20, 50][Math.floor(Math.random() * 3)];
        ans = original - (original * discPct / 100);
        if (lang === 'en') exp = `Price: ${original}, Discount: ${discPct}%. Final = ?`;
        else if (lang === 'ru') exp = `Цена: ${original}, Скидка: ${discPct}%. Итог = ?`;
        else if (lang === 'tr') exp = `Fiyat: ${original}, İndirim: %${discPct}. Son fiyat = ?`;
        else exp = `Narx: ${original}, Chegirma: ${discPct}%. Yakuniy narx = ?`;
        explanation = `${original} - ${(original * discPct / 100)} = ${ans}`;
      } else if (sub === 2) { // Ratio A:B = 2:3
        const k = Math.floor(Math.random() * 8) + 2;
        const r1 = 2, r2 = 3;
        const aVal = r1 * k;
        ans = r2 * k;
        if (lang === 'en') exp = `Ratio 2:3. If A = ${aVal}, then B = ?`;
        else if (lang === 'ru') exp = `Пропорция 2:3. Если A = ${aVal}, то B = ?`;
        else if (lang === 'tr') exp = `Oran 2:3. A = ${aVal} ise B = ?`;
        else exp = `Nisbat 2:3. Agar A = ${aVal} bo'lsa, B = ?`;
        explanation = `B = (${aVal} / 2) × 3 = ${ans}`;
      } else if (sub === 3) { // 50% + 20%
        const total = (Math.floor(Math.random() * 5) + 2) * 100;
        const p1 = 50, p2 = 20;
        ans = (total * (p1 + p2)) / 100;
        if (lang === 'en') exp = `(50% + 20%) of ${total} = ?`;
        else if (lang === 'ru') exp = `(50% + 20%) от ${total} = ?`;
        else if (lang === 'tr') exp = `${total}'nin (%50 + %20)'si = ?`;
        else exp = `${total} ning (50% + 20%) i = ?`;
        explanation = `70% of ${total} = ${ans}`;
      } else { // Finding percentage: What % is A of B?
        const b = [20, 50, 100, 200][Math.floor(Math.random() * 4)];
        ans = [10, 25, 50][Math.floor(Math.random() * 3)];
        const a = (b * ans) / 100;
        if (lang === 'en') exp = `${a} is what % of ${b}?`;
        else if (lang === 'ru') exp = `Сколько % составляет ${a} от ${b}?`;
        else if (lang === 'tr') exp = `${a}, ${b}'nin yüzde kaçıdır?`;
        else exp = `${a} soni ${b} ning necha foizi (%)?`;
        explanation = `(${a} / ${b}) × 100% = ${ans}%`;
      }
    } else if (activeLevel === 6) { // Lvl 6: Geometry (Square, Rectangle, Cube, Circle)
      const sub = Math.floor(Math.random() * 5);
      if (sub === 0) { // Square Area
        const a = Math.floor(Math.random() * 12) + 3;
        ans = a * a;
        if (lang === 'en') exp = `Square side a = ${a}. Area (S) = ?`;
        else if (lang === 'ru') exp = `Сторона квадрата a = ${a}. Площадь (S) = ?`;
        else if (lang === 'tr') exp = `Karenin kenarı a = ${a}. Alanı (S) = ?`;
        else exp = `Kvadrat tomoni a = ${a}. Yuzasi (S) = ?`;
        explanation = `S = a² = ${a} × ${a} = ${ans}`;
      } else if (sub === 1) { // Rectangle Perimeter
        const w = Math.floor(Math.random() * 15) + 4;
        const h = Math.floor(Math.random() * 10) + 3;
        ans = 2 * (w + h);
        if (lang === 'en') exp = `Rectangle sides ${w} & ${h}. Perimeter (P) = ?`;
        else if (lang === 'ru') exp = `Стороны прямоугольника ${w} и ${h}. Периметр (P) = ?`;
        else if (lang === 'tr') exp = `Dikdörtgen kenarları ${w} ve ${h}. Çevre (P) = ?`;
        else exp = `To'rtburchak tomonlari ${w} va ${h}. Perimetri (P) = ?`;
        explanation = `P = 2 × (${w} + ${h}) = ${ans}`;
      } else if (sub === 2) { // Rectangle Area
        const w = Math.floor(Math.random() * 12) + 3;
        const h = Math.floor(Math.random() * 9) + 2;
        ans = w * h;
        if (lang === 'en') exp = `Rectangle sides ${w} & ${h}. Area (S) = ?`;
        else if (lang === 'ru') exp = `Стороны прямоугольника ${w} и ${h}. Площадь (S) = ?`;
        else if (lang === 'tr') exp = `Dikdörtgen kenarları ${w} ve ${h}. Alanı (S) = ?`;
        else exp = `To'rtburchak tomonlari ${w} va ${h}. Yuzasi (S) = ?`;
        explanation = `S = ${w} × ${h} = ${ans}`;
      } else if (sub === 3) { // Cube Volume
        const a = Math.floor(Math.random() * 5) + 2;
        ans = a * a * a;
        if (lang === 'en') exp = `Cube edge a = ${a}. Volume (V) = ?`;
        else if (lang === 'ru') exp = `Ребро куба a = ${a}. Объём (V) = ?`;
        else if (lang === 'tr') exp = `Küpün kenarı a = ${a}. Hacmi (V) = ?`;
        else exp = `Kubning qirrasi a = ${a}. Hajmi (V) = ?`;
        explanation = `V = a³ = ${a}³ = ${ans}`;
      } else { // Square Perimeter
        const a = Math.floor(Math.random() * 15) + 3;
        ans = 4 * a;
        if (lang === 'en') exp = `Square side a = ${a}. Perimeter (P) = ?`;
        else if (lang === 'ru') exp = `Сторона квадрата a = ${a}. Периметр (P) = ?`;
        else if (lang === 'tr') exp = `Karenin kenarı a = ${a}. Çevre (P) = ?`;
        else exp = `Kvadrat tomoni a = ${a}. Perimetri (P) = ?`;
        explanation = `P = 4a = 4 × ${a} = ${ans}`;
      }
    } else if (activeLevel === 7) { // Lvl 7: Triangles & Angles
      const sub = Math.floor(Math.random() * 4);
      if (sub === 0) { // Triangle 3rd angle
        const a1 = Math.floor(Math.random() * 45) + 35;
        const a2 = Math.floor(Math.random() * 45) + 35;
        ans = 180 - (a1 + a2);
        if (lang === 'en') exp = `Triangle angles ${a1}° & ${a2}°. 3rd angle = ?`;
        else if (lang === 'ru') exp = `Углы треугольника ${a1}° и ${a2}°. 3-й угол = ?`;
        else if (lang === 'tr') exp = `Üçgen açıları ${a1}° ve ${a2}°. 3. açı = ?`;
        else exp = `Uchburchak burchaklari ${a1}° va ${a2}°. 3-burchak = ?`;
        explanation = `180° - (${a1}° + ${a2}°) = ${ans}°`;
      } else if (sub === 1) { // Right triangle acute angle
        const a1 = Math.floor(Math.random() * 60) + 15;
        ans = 90 - a1;
        if (lang === 'en') exp = `Right triangle acute angle = ${a1}°. Other angle = ?`;
        else if (lang === 'ru') exp = `Острый угол прямоуг. треугольника = ${a1}°. Второй = ?`;
        else if (lang === 'tr') exp = `Dik üçgende dar açı = ${a1}°. Diğer dar açı = ?`;
        else exp = `To'g'ri burchakli uchburchak o'tkir burchagi = ${a1}°. Ikkinchisi = ?`;
        explanation = `90° - ${a1}° = ${ans}°`;
      } else if (sub === 2) { // Triangle Area
        const base = (Math.floor(Math.random() * 8) + 2) * 2;
        const h = Math.floor(Math.random() * 9) + 3;
        ans = (base * h) / 2;
        if (lang === 'en') exp = `Triangle base = ${base}, height = ${h}. Area (S) = ?`;
        else if (lang === 'ru') exp = `Основание = ${base}, высота = ${h}. Площадь (S) = ?`;
        else if (lang === 'tr') exp = `Taban = ${base}, yükseklik = ${h}. Alan (S) = ?`;
        else exp = `Uchburchak asosi = ${base}, balandligi = ${h}. Yuzasi (S) = ?`;
        explanation = `S = (${base} × ${h}) / 2 = ${ans}`;
      } else { // Quadrilateral 4th angle
        const a1 = 100, a2 = 80, a3 = 70;
        ans = 360 - (a1 + a2 + a3);
        if (lang === 'en') exp = `Quadrilateral angles 100°, 80°, 70°. 4th angle = ?`;
        else if (lang === 'ru') exp = `Углы 4-угольника 100°, 80°, 70°. 4-й угол = ?`;
        else if (lang === 'tr') exp = `Dörtgenin açıları 100°, 80°, 70°. 4. açı = ?`;
        else exp = `To'rtburchak burchaklari 100°, 80°, 70°. 4-burchak = ?`;
        explanation = `360° - (100° + 80° + 70°) = ${ans}°`;
      }
    } else if (activeLevel === 8) { // Lvl 8: Square Roots, Cube Roots & Pythagoras
      const sub = Math.floor(Math.random() * 4);
      if (sub === 0) { // Pythagorean hypotenuse
        const pyth = [[3,4,5], [6,8,10], [5,12,13], [9,12,15], [8,15,17]];
        const triple = pyth[Math.floor(Math.random() * pyth.length)];
        ans = triple[2];
        exp = `&radic;(${triple[0]}² + ${triple[1]}²) = c. c = ?`;
        explanation = `&radic;(${triple[0]*triple[0]} + ${triple[1]*triple[1]}) = ${ans}`;
      } else if (sub === 1) { // Perfect Square Roots
        const roots = [11, 12, 13, 14, 15, 16, 20, 25];
        ans = roots[Math.floor(Math.random() * roots.length)];
        const sq = ans * ans;
        exp = `&radic;${sq} = ?`;
        explanation = `${ans}² = ${sq} &rarr; &radic;${sq} = ${ans}`;
      } else if (sub === 2) { // Cube Roots
        const cRoots = [2, 3, 4, 5, 6];
        ans = cRoots[Math.floor(Math.random() * cRoots.length)];
        const cb = ans * ans * ans;
        exp = `&#8731;${cb} = ?`;
        explanation = `${ans}³ = ${cb} &rarr; &#8731;${cb} = ${ans}`;
      } else { // Pythagorean leg
        const pyth = [[3,4,5], [6,8,10], [5,12,13]];
        const triple = pyth[Math.floor(Math.random() * pyth.length)];
        ans = triple[0];
        exp = `&radic;(${triple[2]}² - ${triple[1]}²) = a. a = ?`;
        explanation = `&radic;(${triple[2]*triple[2]} - ${triple[1]*triple[1]}) = ${ans}`;
      }
    } else if (activeLevel === 9) { // Lvl 9: Quadratic Equations & Factoring
      const sub = Math.floor(Math.random() * 3);
      if (sub === 0) { // Largest root
        const r1 = Math.floor(Math.random() * 5) + 1;
        const r2 = Math.floor(Math.random() * 5) + 1;
        ans = Math.max(r1, r2);
        const b = -(r1 + r2);
        const c = r1 * r2;
        const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
        const cSign = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
        if (lang === 'en') exp = `x² ${bSign}x ${cSign} = 0. Largest root = ?`;
        else if (lang === 'ru') exp = `x² ${bSign}x ${cSign} = 0. Больший корень = ?`;
        else if (lang === 'tr') exp = `x² ${bSign}x ${cSign} = 0. Büyük kök = ?`;
        else exp = `x² ${bSign}x ${cSign} = 0. Katta ildiz = ?`;
        explanation = `(x - ${r1})(x - ${r2}) = 0 &rarr; x = ${r1}, ${r2}. Max = ${ans}`;
      } else if (sub === 1) { // Smallest root
        const r1 = Math.floor(Math.random() * 4) + 1;
        const r2 = Math.floor(Math.random() * 5) + 5;
        ans = Math.min(r1, r2);
        const b = -(r1 + r2);
        const c = r1 * r2;
        const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
        const cSign = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
        if (lang === 'en') exp = `x² ${bSign}x ${cSign} = 0. Smallest root = ?`;
        else if (lang === 'ru') exp = `x² ${bSign}x ${cSign} = 0. Меньший корень = ?`;
        else if (lang === 'tr') exp = `x² ${bSign}x ${cSign} = 0. Küçük kök = ?`;
        else exp = `x² ${bSign}x ${cSign} = 0. Kichik ildiz = ?`;
        explanation = `(x - ${r1})(x - ${r2}) = 0 &rarr; x = ${r1}, ${r2}. Min = ${ans}`;
      } else { // Difference of squares
        const a = Math.floor(Math.random() * 8) + 3;
        const b = Math.floor(Math.random() * (a - 1)) + 1;
        ans = a * a - b * b;
        exp = `(${a} - ${b})(${a} + ${b}) = ?`;
        explanation = `${a}² - ${b}² = ${a*a} - ${b*b} = ${ans}`;
      }
    } else { // Lvl 10: Logarithms, Exponentials, Arithmetic progression
      const sub = Math.floor(Math.random() * 4);
      if (sub === 0) { // Logarithm
        const base = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
        ans = Math.floor(Math.random() * 3) + 2;
        const val = Math.pow(base, ans);
        exp = `log<sub>${base}</sub>(${val}) = ?`;
        explanation = `${base}<sup>${ans}</sup> = ${val} &rarr; ans = ${ans}`;
      } else if (sub === 1) { // 2^x = val
        ans = Math.floor(Math.random() * 5) + 2;
        const val = Math.pow(2, ans);
        exp = `2<sup>x</sup> = ${val}. x = ?`;
        explanation = `2<sup>${ans}</sup> = ${val} &rarr; x = ${ans}`;
      } else if (sub === 2) { // Arithmetic Progression n-th term
        const a1 = Math.floor(Math.random() * 6) + 2;
        const d = Math.floor(Math.random() * 4) + 2;
        const n = 5;
        ans = a1 + (n - 1) * d;
        if (lang === 'en') exp = `Progression: ${a1}, ${a1+d}, ${a1+2*d}... 5th term = ?`;
        else if (lang === 'ru') exp = `Прогрессия: ${a1}, ${a1+d}, ${a1+2*d}... 5-й член = ?`;
        else if (lang === 'tr') exp = `Dizi: ${a1}, ${a1+d}, ${a1+2*d}... 5. terim = ?`;
        else exp = `Arifmetik progressiya: ${a1}, ${a1+d}, ${a1+2*d}... 5-hadi = ?`;
        explanation = `a₅ = ${a1} + 4×${d} = ${ans}`;
      } else { // Sum of 1..N
        const n = [10, 12, 14, 20][Math.floor(Math.random() * 4)];
        ans = (n * (n + 1)) / 2;
        exp = `1 + 2 + 3 + ... + ${n} = ?`;
        explanation = `S = ${n} × ${n+1} / 2 = ${ans}`;
      }
    }

    this.currentProblem = { exp, ans, explanation, levelText: lvlName };

    const tagEl = document.getElementById('math-current-level-tag');
    const expEl = document.getElementById('math-expression');
    if (tagEl) tagEl.textContent = this.currentProblem.levelText;
    if (expEl) expEl.innerHTML = this.currentProblem.exp;

    const options = new Set([this.currentProblem.ans]);
    while (options.size < 4) {
      const delta = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = this.currentProblem.ans + delta;
      if (fake >= 0) options.add(fake);
    }
    const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
    shuffled.forEach((opt, idx) => {
      const btn = document.getElementById('math-opt-' + idx);
      if (btn) {
        btn.textContent = opt;
        btn.className = 'math-choice-btn';
      }
    });
  },

  pick(btnIdx) {
    if (!this.currentProblem) return;
    const btn = document.getElementById('math-opt-' + btnIdx);
    if (!btn) return;
    const val = parseInt(btn.textContent);

    if (val === this.currentProblem.ans) {
      btn.classList.add('correct-glow');
      this.score += 10 + (this.streak * 2);
      this.streak++;
      this.correctCount++;

      AudioEngine.mathCorrect(this.streak);
      const sEl = document.getElementById('math-score-val');
      const stEl = document.getElementById('math-streak-val');
      if (sEl) sEl.textContent = this.score;
      if (stEl) stEl.textContent = `🔥 ${this.streak}`;
      this.updateTimerBar();

      setTimeout(() => this.nextQuestion(), 200);
    } else {
      btn.classList.add('wrong-glow');
      this.streak = 0;

      AudioEngine.mathWrong();
      const stEl = document.getElementById('math-streak-val');
      if (stEl) stEl.textContent = '🔥 0';
      this.updateTimerBar();

      if (this.timeLeft <= 0) {
        this.gameOver();
      } else {
        setTimeout(() => this.nextQuestion(), 280);
      }
    }
  },

  showSolutionModal() {
    AudioEngine.tap();
    if (!this.currentProblem) return;
    const t = this.t();
    App.showModal('💡', t.solutionTitle || "Solution", `
      <div style="text-align:left; background:rgba(255,255,255,0.05); padding:14px; border-radius:12px; font-size:13px; line-height:1.6;">
        <div style="font-size:16px; font-weight:800; color:#38bdf8; margin-bottom:8px;">${this.currentProblem.exp}</div>
        <div>${this.currentProblem.explanation}</div>
        <div style="margin-top:10px; font-weight:800; color:#34d399;">${t.correctAnswer || 'Answer:'} ${this.currentProblem.ans}</div>
      </div>
    `, null);
  },

  gameOver() {
    this.stop();
    AudioEngine.error();
    const t = this.t();

    let isBest = false;
    if (this.score > this.best) {
      this.best = this.score;
      isBest = true;
      localStorage.setItem('math_best_score_v4', this.best);
      const el = document.getElementById('math-best-val');
      if (el) el.textContent = this.best;
      Confetti.fire(70);
    }

    const lang = App.lang || 'uz';
    const correctText = lang === 'uz' ? `To'g'ri javoblar: <b>${this.correctCount}</b> ta<br>` :
      (lang === 'ru' ? `Правильно: <b>${this.correctCount}</b><br>` :
      (lang === 'tr' ? `Doğru cevaplar: <b>${this.correctCount}</b><br>` : `Correct: <b>${this.correctCount}</b><br>`));

    App.showModal(
      isBest ? '🏆' : '⌛',
      isBest ? (t.newRecord || "New Record!") : (t.timeUp || "Time's up!"),
      `${correctText}${t.pointsEarned || 'Score:'} <b>${this.score}</b><br>${t.bestScore || 'Best:'} <b>${this.best}</b>`,
      () => MathGame.start()
    );
  }
};
