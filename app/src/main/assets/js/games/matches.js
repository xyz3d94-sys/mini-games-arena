/* Matchstick Math Game Engine
   - 10 Progressive Levels (1-4: 1 stick, 5-7: 2 sticks, 8-10: 3 sticks)
   - Battleship-style Mode Switch (Solo 10 Levels / 1v1 Multiplayer)
   - Full 4-language i18n support (UZ, RU, EN, TR)
   - Realistic 3D Matchstick graphics
   - Interactive Pick & Place mechanics
*/
const MatchesGame = {
  mode: 'solo', // 'solo' or 'player'
  level: 1, // 1 to 10
  score: 0,
  secondsElapsed: 0,
  timerInterval: null,
  isOver: false,
  handCount: 0,
  initialBits: [],
  currentBits: [],
  currentPuzzle: null,

  // 7-segment bitmasks for digits 0-9
  DIGITS: {
    "0": [1, 1, 1, 1, 1, 1, 0],
    "1": [0, 1, 1, 0, 0, 0, 0],
    "2": [1, 1, 0, 1, 1, 0, 1],
    "3": [1, 1, 1, 1, 0, 0, 1],
    "4": [0, 1, 1, 0, 0, 1, 1],
    "5": [1, 0, 1, 1, 0, 1, 1],
    "6": [1, 0, 1, 1, 1, 1, 1],
    "7": [1, 1, 1, 0, 0, 0, 0],
    "8": [1, 1, 1, 1, 1, 1, 1],
    "9": [1, 1, 1, 1, 0, 1, 1]
  },
  OPS: {
    "+": [1, 1],
    "-": [1, 0]
  },

  // 15 Progressive Verified Levels
  puzzles: [
    // LEVEL 1 (1 move)
    {
      level: 1,
      moves: 1,
      init: ["6", "+", "4", "4"],
      sol: ["0", "+", "4", "4"],
      eq: "0 + 4 = 4",
      step: {
        uz: "6 raqamining o'rtasidagi cho'p yuqori o'ng burchakka ko'chirilib, 0 hosil qilindi: 0 + 4 = 4.",
        en: "Move the middle matchstick of 6 to the upper-right slot to make 0: 0 + 4 = 4.",
        ru: "Переместите среднюю спичку из 6 в правый верхний угол, чтобы получить 0: 0 + 4 = 4.",
        tr: "6'nın ortasındaki kibriti sağ üst köşeye taşıyarak 0 yapın: 0 + 4 = 4."
      },
      visual: "6 + 4 = 4  ➔  0 + 4 = 4"
    },
    // LEVEL 2 (1 move)
    {
      level: 2,
      moves: 1,
      init: ["9", "-", "5", "8"],
      sol: ["3", "+", "5", "8"],
      eq: "3 + 5 = 8",
      step: {
        uz: "9 raqamining yuqori chap cho'pi minus belgisi ustiga qo'yilib plus qilindi va 3 + 5 = 8 hosil bo'ldi.",
        en: "Move top-left matchstick from 9 to the minus sign to make it plus: 3 + 5 = 8.",
        ru: "Переместите левую верхнюю спичку из 9 на минус, превратив его в плюс: 3 + 5 = 8.",
        tr: "9'un sol üst kibritini eksi işaretine taşıyıp artı yapın: 3 + 5 = 8."
      },
      visual: "9 - 5 = 8  ➔  3 + 5 = 8"
    },
    // LEVEL 3 (1 move)
    {
      level: 3,
      moves: 1,
      init: ["5", "+", "7", "2"],
      sol: ["9", "-", "7", "2"],
      eq: "9 - 7 = 2",
      step: {
        uz: "Plus belgisining vertikal cho'pi olinib, 5 ning yuqori o'ngiga qo'yildi: 9 - 7 = 2.",
        en: "Move the vertical match from the plus sign to 5 to make it 9: 9 - 7 = 2.",
        ru: "Переместите вертикальную спичку из плюса в 5, чтобы получить 9: 9 - 7 = 2.",
        tr: "Artı işaretindeki dikey kibriti 5'e taşıyıp 9 yapın: 9 - 7 = 2."
      },
      visual: "5 + 7 = 2  ➔  9 - 7 = 2"
    },
    // LEVEL 4 (1 move)
    {
      level: 4,
      moves: 1,
      init: ["9", "+", "3", "5"],
      sol: ["9", "-", "3", "6"],
      eq: "9 - 3 = 6",
      step: {
        uz: "Plus belgisining vertikal cho'pi olinib, 5 ning pastki chap tomoniga qo'yildi: 9 - 3 = 6.",
        en: "Move the vertical match from the plus sign to 5 to make it 6: 9 - 3 = 6.",
        ru: "Переместите вертикальную спичку из плюса в 5, чтобы получить 6: 9 - 3 = 6.",
        tr: "Artı işaretindeki dikey kibriti 5'in sol altına taşıyıp 6 yapın: 9 - 3 = 6."
      },
      visual: "9 + 3 = 5  ➔  9 - 3 = 6"
    },
    // LEVEL 5 (1 move)
    {
      level: 5,
      moves: 1,
      init: ["8", "+", "3", "3"],
      sol: ["6", "+", "3", "9"],
      eq: "6 + 3 = 9",
      step: {
        uz: "8 ning yuqori o'ng cho'pi olinib (6 qolib), tenglikdan keyingi 3 ning yuqori chapiga qo'yildi (9 bo'ldi): 6 + 3 = 9.",
        en: "Move top-right match of 8 (becoming 6) to the top-left of 3 (becoming 9): 6 + 3 = 9.",
        ru: "Переместите правую верхнюю спичку из 8 (станет 6) в левый верх 3 (станет 9): 6 + 3 = 9.",
        tr: "8'in sağ üst kibritini (6 olur) 3'ün sol üstüne taşıyın (9 olur): 6 + 3 = 9."
      },
      visual: "8 + 3 = 3  ➔  6 + 3 = 9"
    },
    // LEVEL 6 (1 move)
    {
      level: 6,
      moves: 1,
      init: ["3", "+", "5", "6"],
      sol: ["3", "+", "3", "6"],
      eq: "3 + 3 = 6",
      step: {
        uz: "5 raqamining yuqori chap cho'pi yuqori o'ng burchakka ko'chirilib, 3 ga aylantirildi: 3 + 3 = 6.",
        en: "Move the top-left matchstick of 5 to the top-right to make 3: 3 + 3 = 6.",
        ru: "Переместите левую верхнюю спичку из 5 в правый верх, превратив в 3: 3 + 3 = 6.",
        tr: "5'in sol üst kibritini sağ üste taşıyıp 3 yapın: 3 + 3 = 6."
      },
      visual: "3 + 5 = 6  ➔  3 + 3 = 6"
    },
    // LEVEL 7 (1 move)
    {
      level: 7,
      moves: 1,
      init: ["8", "-", "3", "9"],
      sol: ["6", "+", "3", "9"],
      eq: "6 + 3 = 9",
      step: {
        uz: "8 ning yuqori o'ng cho'pi olinib (6 bo'ldi) minus belgisi ustiga qo'yildi (plus bo'ldi): 6 + 3 = 9.",
        en: "Move top-right match from 8 (becomes 6) to the minus sign (becomes +): 6 + 3 = 9.",
        ru: "Переместите правую верхнюю спичку из 8 (станет 6) на минус (станет +): 6 + 3 = 9.",
        tr: "8'in sağ üst kibritini (6 olur) eksiye taşıyıp artı yapın: 6 + 3 = 9."
      },
      visual: "8 - 3 = 9  ➔  6 + 3 = 9"
    },
    // LEVEL 8 (1 move)
    {
      level: 8,
      moves: 1,
      init: ["9", "-", "7", "3"],
      sol: ["9", "-", "7", "2"],
      eq: "9 - 7 = 2",
      step: {
        uz: "Natijadagi 3 ning pastki o'ng cho'pi pastki chapga ko'chirilib, 2 ga aylantirildi: 9 - 7 = 2.",
        en: "Move bottom-right match of 3 to the bottom-left to make 2: 9 - 7 = 2.",
        ru: "Переместите правую нижнюю спичку из 3 в левый низ, сделав 2: 9 - 7 = 2.",
        tr: "3'ün sağ alt kibritini sol alta taşıyarak 2 yapın: 9 - 7 = 2."
      },
      visual: "9 - 7 = 3  ➔  9 - 7 = 2"
    },
    // LEVEL 9 (1 move)
    {
      level: 9,
      moves: 1,
      init: ["5", "+", "1", "8"],
      sol: ["9", "-", "1", "8"],
      eq: "9 - 1 = 8",
      step: {
        uz: "Plus belgisining vertikal cho'pi olinib, 5 ning yuqori o'ngiga qo'yildi va 9 hosil bo'ldi: 9 - 1 = 8.",
        en: "Move the vertical matchstick from + to the top-right of 5 to make 9: 9 - 1 = 8.",
        ru: "Переместите вертикальную спичку из плюса в правый верх 5 (станет 9): 9 - 1 = 8.",
        tr: "Artı işaretindeki dikey kibriti 5'in sağ üstüne taşıyıp 9 yapın: 9 - 1 = 8."
      },
      visual: "5 + 1 = 8  ➔  9 - 1 = 8"
    },
    // LEVEL 10 (1 move)
    {
      level: 10,
      moves: 1,
      init: ["6", "+", "1", "5"],
      sol: ["5", "+", "1", "6"],
      eq: "5 + 1 = 6",
      step: {
        uz: "6 raqamining pastki chap cho'pi natijadagi 5 ning pastki chapiga ko'chirildi: 5 + 1 = 6.",
        en: "Move the bottom-left match of 6 to the bottom-left of 5: 5 + 1 = 6.",
        ru: "Переместите левую нижнюю спичку из 6 в левый низ 5: 5 + 1 = 6.",
        tr: "6'nın sol alt kibritini sonuçtaki 5'in sol altına taşıyın: 5 + 1 = 6."
      },
      visual: "6 + 1 = 5  ➔  5 + 1 = 6"
    },
    // LEVEL 11 (1 move)
    {
      level: 11,
      moves: 1,
      init: ["3", "+", "3", "8"],
      sol: ["5", "+", "3", "8"],
      eq: "5 + 3 = 8",
      step: {
        uz: "Birinchi 3 ning yuqori o'ng cho'pi yuqori chapga ko'chirilib 5 qilindi: 5 + 3 = 8.",
        en: "Move the top-right match of the first 3 to the top-left to make 5: 5 + 3 = 8.",
        ru: "Переместите правую верхнюю спичку из первой 3 в левый верх, сделав 5: 5 + 3 = 8.",
        tr: "İlk 3'ün sağ üst kibritini sol üste taşıyarak 5 yapın: 5 + 3 = 8."
      },
      visual: "3 + 3 = 8  ➔  5 + 3 = 8"
    },
    // LEVEL 12 (1 move)
    {
      level: 12,
      moves: 1,
      init: ["6", "+", "2", "6"],
      sol: ["8", "-", "2", "6"],
      eq: "8 - 2 = 6",
      step: {
        uz: "Plusdan vertikal cho'pni olib 6 ning yuqori o'ngiga qo'ying: 8 - 2 = 6.",
        en: "Move match from + to 6 to make 8: 8 - 2 = 6.",
        ru: "Переместите спичку из + в 6: 8 - 2 = 6.",
        tr: "Artıdan kibriti 6 ya taşıyıp 8 yapın: 8 - 2 = 6."
      },
      visual: "6 + 2 = 6  ➔  8 - 2 = 6"
    },
    // LEVEL 13 (1 move)
    {
      level: 13,
      moves: 1,
      init: ["3", "-", "1", "4"],
      sol: ["5", "-", "1", "4"],
      eq: "5 - 1 = 4",
      step: {
        uz: "3 ning yuqori o'ng cho'pini chap yuqoriga surib 5 qiling: 5 - 1 = 4.",
        en: "Move top-right of 3 to top-left: 5 - 1 = 4.",
        ru: "Переместите спичку в 3, чтобы стало 5: 5 - 1 = 4.",
        tr: "3 ün kibritini sola taşıyıp 5 yapın: 5 - 1 = 4."
      },
      visual: "3 - 1 = 4  ➔  5 - 1 = 4"
    },
    // LEVEL 14 (1 move)
    {
      level: 14,
      moves: 1,
      init: ["9", "+", "1", "8"],
      sol: ["8", "+", "1", "9"],
      eq: "8 + 1 = 9",
      step: {
        uz: "9 ning pastki chap cho'pini 8 ga yoki 8 dan 9 ga ko'chiring: 8 + 1 = 9.",
        en: "Exchange match between 9 and 8: 8 + 1 = 9.",
        ru: "Переместите спичку между 9 и 8: 8 + 1 = 9.",
        tr: "9 ile 8 arasında kibrit taşıyın: 8 + 1 = 9."
      },
      visual: "9 + 1 = 8  ➔  8 + 1 = 9"
    },
    // LEVEL 15 (1 move)
    {
      level: 15,
      moves: 1,
      init: ["7", "-", "2", "4"],
      sol: ["7", "-", "3", "4"],
      eq: "7 - 3 = 4",
      step: {
        uz: "2 ning pastki chap cho'pini pastki o'ngga surib 3 qiling: 7 - 3 = 4.",
        en: "Move bottom-left match of 2 to bottom-right to make 3: 7 - 3 = 4.",
        ru: "Переместите спичку в 2, превратив в 3: 7 - 3 = 4.",
        tr: "2 nin kibritini sağ alta taşıyıp 3 yapın: 7 - 3 = 4."
      },
      visual: "7 - 2 = 4  ➔  7 - 3 = 4"
    },
    // LEVEL 16 (1 move)
    {
      level: 16,
      moves: 1,
      init: ["1", "+", "1", "3"],
      sol: ["1", "+", "1", "2"],
      eq: "1 + 1 = 2",
      step: {
        uz: "3 ning yuqori o'ng cho'pini pastki chapga surib 2 qiling: 1 + 1 = 2.",
        en: "Move top-right match of 3 to bottom-left to make 2: 1 + 1 = 2.",
        ru: "Переместите спичку в 3, чтобы получить 2: 1 + 1 = 2.",
        tr: "3 ün kibritini sol alta taşıyıp 2 yapın: 1 + 1 = 2."
      },
      visual: "1 + 1 = 3  ➔  1 + 1 = 2"
    },
    // LEVEL 17 (1 move)
    {
      level: 17,
      moves: 1,
      init: ["1", "+", "2", "5"],
      sol: ["1", "+", "2", "3"],
      eq: "1 + 2 = 3",
      step: {
        uz: "5 ning yuqori chap cho'pini yuqori o'ngga surib 3 qiling: 1 + 2 = 3.",
        en: "Move top-left match of 5 to top-right to make 3: 1 + 2 = 3.",
        ru: "Переместите спичку в 5, чтобы получить 3: 1 + 2 = 3.",
        tr: "5 in kibritini sağ üste taşıyıp 3 yapın: 1 + 2 = 3."
      },
      visual: "1 + 2 = 5  ➔  1 + 2 = 3"
    },
    // LEVEL 18 (1 move)
    {
      level: 18,
      moves: 1,
      init: ["1", "+", "4", "3"],
      sol: ["1", "+", "4", "5"],
      eq: "1 + 4 = 5",
      step: {
        uz: "3 ning yuqori o'ng cho'pini chap yuqoriga surib 5 qiling: 1 + 4 = 5.",
        en: "Move top-right of 3 to top-left to make 5: 1 + 4 = 5.",
        ru: "Переместите спичку в 3, сделав 5: 1 + 4 = 5.",
        tr: "3 ün kibritini sol üste taşıyıp 5 yapın: 1 + 4 = 5."
      },
      visual: "1 + 4 = 3  ➔  1 + 4 = 5"
    },
    // LEVEL 19 (1 move)
    {
      level: 19,
      moves: 1,
      init: ["1", "+", "5", "9"],
      sol: ["1", "+", "5", "6"],
      eq: "1 + 5 = 6",
      step: {
        uz: "9 ning yuqori o'ng cho'pini pastki chapga surib 6 qiling: 1 + 5 = 6.",
        en: "Move top-right of 9 to bottom-left to make 6: 1 + 5 = 6.",
        ru: "Переместите спичку из 9 в 6: 1 + 5 = 6.",
        tr: "9 un kibritini sol alta taşıyıp 6 yapın: 1 + 5 = 6."
      },
      visual: "1 + 5 = 9  ➔  1 + 5 = 6"
    },
    // LEVEL 20 (2 moves)
    {
      level: 20,
      moves: 2,
      init: ["0", "+", "0", "8"],
      sol: ["8", "-", "8", "0"],
      eq: "8 - 8 = 0",
      step: {
        uz: "Plusdan vertikal cho'pni birinchi 0 ga qo'yib 8 qiling, 8 ning o'rtasidagi cho'pni ikkinchi 0 ga qo'ying: 8 - 8 = 0.",
        en: "Move 2 matches: + to first 0 (makes 8), middle of 8 to second 0 (makes 8): 8 - 8 = 0.",
        ru: "Переместите 2 спички: + в первый 0, из 8 во второй: 8 - 8 = 0.",
        tr: "2 kibrit taşıyarak çözün: 8 - 8 = 0."
      },
      visual: "0 + 0 = 8  ➔  8 - 8 = 0"
    },
    // LEVEL 21 (2 moves)
    {
      level: 21,
      moves: 2,
      init: ["4", "+", "6", "8"],
      sol: ["3", "+", "6", "9"],
      eq: "3 + 6 = 9",
      step: {
        uz: "4 ning cho'pini 3 ga ko'chiring va 8 ning cho'pini 9 ga moslang: 3 + 6 = 9.",
        en: "Move 2 matches to turn 4 into 3 and 8 into 9: 3 + 6 = 9.",
        ru: "Переместите 2 спички: 4 в 3, 8 в 9: 3 + 6 = 9.",
        tr: "2 kibrit taşıyarak 3 + 6 = 9 yapın."
      },
      visual: "4 + 6 = 8  ➔  3 + 6 = 9"
    },
    // LEVEL 22 (2 moves)
    {
      level: 22,
      moves: 2,
      init: ["8", "-", "5", "9"],
      sol: ["3", "+", "6", "9"],
      eq: "3 + 6 = 9",
      step: {
        uz: "8 dan 2 ta cho'p olib (3 qolib), bittasini minusga (plus) va ikkinchisini 5 ga qo'ying: 3 + 6 = 9.",
        en: "Move 2 matches from 8 to minus and 5: 3 + 6 = 9.",
        ru: "Переместите 2 спички из 8 на минус и 5: 3 + 6 = 9.",
        tr: "8 den 2 kibriti eksi ve 5 e taşıyın: 3 + 6 = 9."
      },
      visual: "8 - 5 = 9  ➔  3 + 6 = 9"
    },
    // LEVEL 23 (2 moves)
    {
      level: 23,
      moves: 2,
      init: ["5", "+", "5", "8"],
      sol: ["6", "+", "3", "9"],
      eq: "6 + 3 = 9",
      step: {
        uz: "2 ta cho'pni ko'chiring: 5 ni 6 ga, ikkinchi 5 ni 3 ga, 8 ni 9 ga aylantiring: 6 + 3 = 9.",
        en: "Move 2 matches to make 6 + 3 = 9.",
        ru: "Переместите 2 спички, получив 6 + 3 = 9.",
        tr: "2 kibrit taşıyıp 6 + 3 = 9 yapın."
      },
      visual: "5 + 5 = 8  ➔  6 + 3 = 9"
    },
    // LEVEL 24 (2 moves)
    {
      level: 24,
      moves: 2,
      init: ["3", "+", "2", "8"],
      sol: ["3", "+", "6", "9"],
      eq: "3 + 6 = 9",
      step: {
        uz: "2 raqamini 6 ga, 8 raqamini 9 ga aylantirish uchun 2 ta cho'pni ko'chiring: 3 + 6 = 9.",
        en: "Move 2 matches to turn 2 into 6 and 8 into 9: 3 + 6 = 9.",
        ru: "Переместите 2 спички: 2 в 6, 8 в 9: 3 + 6 = 9.",
        tr: "2 kibrit taşıyın: 2 yi 6 ya, 8 i 9 a dönüştürün: 3 + 6 = 9."
      },
      visual: "3 + 2 = 8  ➔  3 + 6 = 9"
    },
    // LEVEL 25 (3 moves, master)
    {
      level: 25,
      moves: 3,
      init: ["1", "+", "2", "7"],
      sol: ["4", "-", "3", "1"],
      eq: "4 - 3 = 1",
      step: {
        uz: "3 ta cho'pni ko'chiring: 1 ni 4 ga, plusni minusga, 2 ni 3 ga va 7 ni 1 ga: 4 - 3 = 1.",
        en: "Move 3 matchsticks: 1 into 4, + into -, 2 into 3, 7 into 1: 4 - 3 = 1.",
        ru: "Переместите 3 спички: 1 в 4, + в -, 2 в 3, 7 в 1: 4 - 3 = 1.",
        tr: "3 kibrit taşıyın: 1'i 4'e, +'yı -'ye, 2'yi 3'e, 7'yi 1'e: 4 - 3 = 1."
      },
      visual: "1 + 2 = 7  ➔  4 - 3 = 1"
    }
  ],

  t() {
    return I18N[App.lang] || I18N.uz;
  },

  loadProgression() {
    try {
      const savedSolved = localStorage.getItem('arena_matches_solved_ids');
      this.solvedIds = savedSolved ? JSON.parse(savedSolved) : [];
      if (!Array.isArray(this.solvedIds)) this.solvedIds = [];

      const savedLvl = localStorage.getItem('arena_matches_level');
      this.level = savedLvl ? parseInt(savedLvl, 10) : 1;
    } catch (e) {
      this.solvedIds = [];
      this.level = 1;
    }
  },

  saveProgression() {
    try {
      localStorage.setItem('arena_matches_solved_ids', JSON.stringify(this.solvedIds));
      localStorage.setItem('arena_matches_level', this.level.toString());
    } catch (e) {}
  },

  pickNextUnsolvedPuzzle() {
    this.loadProgression();
    const unsolved = this.puzzles.filter(p => !this.solvedIds.includes(p.level));
    if (unsolved.length > 0) {
      this.currentPuzzle = unsolved[0];
      this.level = this.currentPuzzle.level;
    } else {
      // All solved! Loop or pick next
      const p = this.puzzles[(this.level - 1) % this.puzzles.length] || this.puzzles[0];
      this.currentPuzzle = p;
      this.level = p.level;
    }
  },

  // CRITICAL: init() MUST NOT start the game or open modals automatically!
  init() {
    this.loadProgression();
    this.score = 0;
    this.mode = 'solo';
    this.isOver = false;
  },

  setMode(m) {
    AudioEngine.tap();
    if (m === 'player') {
      Multiplayer.openChallengeModal('matches', this.t().mMatchesTitle || "Matchstick Math");
      return;
    }
    this.mode = 'solo';
    const bSolo = document.getElementById('matches-tab-solo');
    const bPlayer = document.getElementById('matches-tab-player');
    if (bSolo) bSolo.classList.add('active');
    if (bPlayer) bPlayer.classList.remove('active');
    this.start();
  },

  startMultiplayer(isHost) {
    this.mode = 'player';
    const bSolo = document.getElementById('matches-tab-solo');
    const bPlayer = document.getElementById('matches-tab-player');
    if (bSolo) bSolo.classList.remove('active');
    if (bPlayer) bPlayer.classList.add('active');

    if (isHost) {
      const p = this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
      Multiplayer.sendGameMove('matches', {
        type: 'matches_start',
        puzzleLevel: p.level
      });
      this.level = p.level;
    }
    this.startRound();
  },

  handleRemoteMove(data) {
    if (!data) return;
    if (data.type === 'matches_start') {
      this.level = data.puzzleLevel || 1;
      this.startRound();
    } else if (data.type === 'matches_win') {
      this.opponentWon(data.opponentScore);
    }
  },

  start() {
    this.stop();
    this.score = 0;
    this.pickNextUnsolvedPuzzle();
    this.startRound();
  },

  nextPuzzle() {
    AudioEngine.tap();
    this.loadProgression();
    const curLevel = this.currentPuzzle ? this.currentPuzzle.level : 0;
    const higherUnsolved = this.puzzles.filter(p => p.level > curLevel && !this.solvedIds.includes(p.level));
    if (higherUnsolved.length > 0) {
      this.currentPuzzle = higherUnsolved[0];
      this.level = this.currentPuzzle.level;
    } else {
      const anyUnsolved = this.puzzles.filter(p => !this.solvedIds.includes(p.level));
      if (anyUnsolved.length > 0) {
        this.currentPuzzle = anyUnsolved[0];
        this.level = this.currentPuzzle.level;
      } else {
        const nextIdx = (this.level % this.puzzles.length);
        this.currentPuzzle = this.puzzles[nextIdx];
        this.level = this.currentPuzzle.level;
      }
    }
    this.startRound();
  },

  skipPuzzle() {
    AudioEngine.tap();
    this.loadProgression();
    const curLevel = this.currentPuzzle ? this.currentPuzzle.level : 0;
    const candidates = this.puzzles.filter(p => p.level !== curLevel && !this.solvedIds.includes(p.level));
    if (candidates.length > 0) {
      this.currentPuzzle = candidates[Math.floor(Math.random() * candidates.length)];
      this.level = this.currentPuzzle.level;
    } else {
      const others = this.puzzles.filter(p => p.level !== curLevel);
      this.currentPuzzle = others[Math.floor(Math.random() * others.length)] || this.puzzles[0];
      this.level = this.currentPuzzle.level;
    }
    this.startRound();
  },

  startRound() {
    this.stop();
    this.isOver = false;
    this.handCount = 0;
    this.secondsElapsed = 0;

    const p = this.puzzles.find(x => x.level === this.level) || this.puzzles[0];
    this.currentPuzzle = p;

    // 23 bits: 7 d1, 2 op, 7 d2, 7 d3
    this.initialBits = [
      ...this.DIGITS[p.init[0]],
      ...this.OPS[p.init[1]],
      ...this.DIGITS[p.init[2]],
      ...this.DIGITS[p.init[3]]
    ];
    this.currentBits = [...this.initialBits];

    this.updateUIStrings();
    this.renderBoard();
    this.startTimer();
  },

  resetCurrentPuzzle() {
    AudioEngine.tap();
    if (!this.currentPuzzle) return;
    this.currentBits = [...this.initialBits];
    this.handCount = 0;
    this.updateStatusDOM();
    this.renderBoard();
    const t = this.t();
    App.showToast(t.matchesToastReset || "Reset");
  },

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  startTimer() {
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.secondsElapsed++;
      this.updateTimerDisplay();
    }, 1000);
  },

  updateTimerDisplay() {
    const timeEl = document.getElementById('matches-time-val');
    if (timeEl) timeEl.textContent = this.secondsElapsed + 's';
  },

  getMovesCount() {
    let removed = 0;
    for (let i = 0; i < this.initialBits.length; i++) {
      if (this.initialBits[i] === 1 && this.currentBits[i] === 0) {
        removed++;
      }
    }
    return removed;
  },

  updateStatusDOM() {
    const t = this.t();
    const handDisp = document.getElementById('matches-hand-display');
    if (handDisp) {
      handDisp.textContent = `${this.handCount} ${t.matchesHand || ''}`;
    }
  },

  updateUIStrings() {
    const t = this.t();
    const p = this.currentPuzzle || this.puzzles[0];

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el && txt) el.textContent = txt;
    };

    setTxt('matches-header-title', t.mMatchesTitle || "Matchstick Math");
    setTxt('matches-lbl-solo', `${t.singlePlayer || 'Solo'} (1-${this.puzzles.length} ${t.matchesLevel || 'Level'})`);
    setTxt('matches-lbl-score', t.score || "SCORE");
    setTxt('matches-lbl-hand', t.matchesHand || "IN HAND");
    setTxt('matches-lbl-time', t.timeElapsedText || "TIME");

    setTxt('matches-level-badge', `${this.level}-${(t.matchesLevel || 'LEVEL').toUpperCase()}`);
    setTxt('matches-goal-text', `${p.moves} ${t.matchesGoal || 'moves'}`);
    setTxt('matches-prog-text', `${this.level} / ${this.puzzles.length}`);

    setTxt('matches-guide-text', t.matchesInstruction || 'Gugurt cho\'pini olish uchun bosing, bo\'sh joyga qo\'yish uchun xira chiziqni bosing');
    setTxt('matches-btn-reset-txt', t.matchesReset || "Qaytarish");
    setTxt('matches-btn-hint-txt', t.matchesSolution || "Yechim");
    setTxt('matches-btn-skip-txt', t.matchesSkip || "Boshqa");
    setTxt('matches-btn-next-txt', t.matchesNext || "Keyingi");

    // Solution Modal Buttons
    setTxt('matches-sol-btn-close', t.matchesBtnClose || t.matchesClose || 'Yopish');
    setTxt('matches-sol-btn-apply', t.matchesApply || 'Doskaga qo\'yish');
    setTxt('matches-sol-btn-next', t.matchesBtnNext || 'Keyingisi');

    const sEl = document.getElementById('matches-score-val');
    if (sEl) sEl.textContent = this.score;

    this.updateStatusDOM();
    this.updateLiveEquationPreview();
  },

  updateLiveEquationPreview() {
    const evalEl = document.getElementById('matches-live-eval');
    const formulaEl = document.getElementById('matches-eval-formula');
    const statusEl = document.getElementById('matches-eval-status');
    if (!evalEl || !formulaEl || !statusEl) return;

    const res = this.evaluateBits(this.currentBits);
    if (res) {
      formulaEl.textContent = res.text;
      if (res.isCorrect) {
        statusEl.textContent = "To'g'ri tenglama!";
        evalEl.style.borderColor = "#34d399";
        evalEl.style.background = "rgba(16, 185, 129, 0.25)";
        statusEl.style.color = "#34d399";
      } else {
        const calc = res.op === '+' ? res.d1 + res.d2 : res.d1 - res.d2;
        statusEl.textContent = `Hozirgi (${calc} ≠ ${res.d3}):`;
        evalEl.style.borderColor = "rgba(249, 115, 22, 0.5)";
        evalEl.style.background = "rgba(15, 23, 42, 0.85)";
        statusEl.style.color = "#fb923c";
      }
    } else {
      formulaEl.textContent = "...";
      statusEl.textContent = "Hozirgi holat:";
      evalEl.style.borderColor = "rgba(255, 255, 255, 0.12)";
      evalEl.style.background = "rgba(15, 23, 42, 0.6)";
      statusEl.style.color = "#94a3b8";
    }
  },

  renderBoard() {
    const container = document.getElementById('matches-board-container');
    if (!container) return;

    const renderSeg = (idx, segClass, posClass) => {
      const isActive = this.currentBits[idx] === 1;
      const canPlace = !isActive && this.handCount > 0;
      const stateClass = isActive ? 'active' : ('empty' + (canPlace ? ' can-place' : ''));
      return `<div class="m-seg ${segClass} ${posClass} ${stateClass}" onclick="MatchesGame.onSegmentClick(${idx})"></div>`;
    };

    // Digit 1
    const d1HTML = `
      <div class="match-digit">
        ${renderSeg(0, 'm-seg-h', 'm-seg-0')}
        ${renderSeg(5, 'm-seg-v', 'm-seg-5')}
        ${renderSeg(1, 'm-seg-v', 'm-seg-1')}
        ${renderSeg(6, 'm-seg-h', 'm-seg-6')}
        ${renderSeg(4, 'm-seg-v', 'm-seg-4')}
        ${renderSeg(2, 'm-seg-v', 'm-seg-2')}
        ${renderSeg(3, 'm-seg-h', 'm-seg-3')}
      </div>
    `;

    // Operator (+ or -)
    const opHTML = `
      <div class="match-op">
        ${renderSeg(7, 'm-op-h', '')}
        ${renderSeg(8, 'm-op-v', '')}
      </div>
    `;

    // Digit 2
    const d2HTML = `
      <div class="match-digit">
        ${renderSeg(9, 'm-seg-h', 'm-seg-0')}
        ${renderSeg(14, 'm-seg-v', 'm-seg-5')}
        ${renderSeg(10, 'm-seg-v', 'm-seg-1')}
        ${renderSeg(15, 'm-seg-h', 'm-seg-6')}
        ${renderSeg(13, 'm-seg-v', 'm-seg-4')}
        ${renderSeg(11, 'm-seg-v', 'm-seg-2')}
        ${renderSeg(12, 'm-seg-h', 'm-seg-3')}
      </div>
    `;

    // Equals sign (=)
    const eqHTML = `
      <div class="match-eq">
        <div class="m-seg m-eq-t active" style="cursor:default;"></div>
        <div class="m-seg m-eq-b active" style="cursor:default;"></div>
      </div>
    `;

    // Digit 3
    const d3HTML = `
      <div class="match-digit">
        ${renderSeg(16, 'm-seg-h', 'm-seg-0')}
        ${renderSeg(21, 'm-seg-v', 'm-seg-5')}
        ${renderSeg(17, 'm-seg-v', 'm-seg-1')}
        ${renderSeg(22, 'm-seg-h', 'm-seg-6')}
        ${renderSeg(20, 'm-seg-v', 'm-seg-4')}
        ${renderSeg(18, 'm-seg-v', 'm-seg-2')}
        ${renderSeg(19, 'm-seg-h', 'm-seg-3')}
      </div>
    `;

    container.innerHTML = d1HTML + opHTML + d2HTML + eqHTML + d3HTML;
    this.updateLiveEquationPreview();
  },

  onSegmentClick(idx) {
    if (this.isOver) return;
    const t = this.t();

    if (this.currentBits[idx] === 1) {
      // Pick up stick
      const maxAllowed = this.currentPuzzle ? this.currentPuzzle.moves : 1;
      const alreadyMoved = this.getMovesCount();

      if (this.handCount < maxAllowed && alreadyMoved < maxAllowed) {
        this.currentBits[idx] = 0;
        this.handCount++;
        AudioEngine.tap();
        this.updateStatusDOM();
        this.renderBoard();
      } else {
        AudioEngine.error();
        App.showToast(t.matchesToastPlaceFirst || "Place match first!");
      }
    } else {
      // Place stick into slot
      if (this.handCount > 0) {
        this.currentBits[idx] = 1;
        this.handCount--;
        AudioEngine.tap();
        this.updateStatusDOM();
        this.renderBoard();

        if (this.handCount === 0) {
          this.checkBoardEquation();
        }
      } else {
        AudioEngine.error();
        App.showToast(t.matchesToastPickFirst || "Pick match first!");
      }
    }
  },

  checkBoardEquation() {
    const evalResult = this.evaluateBits(this.currentBits);
    if (!evalResult) return;

    const t = this.t();
    if (evalResult.isCorrect) {
      const isIdenticalToInit = this.currentBits.every((v, i) => v === this.initialBits[i]);
      if (isIdenticalToInit) return;

      // SUCCESS!
      this.isOver = true;
      this.stop();
      AudioEngine.win();
      Confetti.fire(70);

      if (this.currentPuzzle && !this.solvedIds.includes(this.currentPuzzle.level)) {
        this.solvedIds.push(this.currentPuzzle.level);
        this.saveProgression();
      }

      const pts = (this.currentPuzzle ? this.currentPuzzle.moves : 1) * 20;
      this.score += pts;
      const sEl = document.getElementById('matches-score-val');
      if (sEl) sEl.textContent = this.score;

      if (this.mode === 'player') {
        Multiplayer.sendGameMove('matches', {
          type: 'matches_win',
          opponentScore: this.score
        });
      }

      this.showSolutionModal(`🎉 ${t.matchesCorrect || 'Solved!'} (+${pts})`, this.currentPuzzle);
    } else {
      App.showToast(t.matchesToastWrong || "Equation is not yet correct!");
    }
  },

  evaluateBits(bits) {
    const d1B = bits.slice(0, 7);
    const opB = bits.slice(7, 9);
    const d2B = bits.slice(9, 16);
    const d3B = bits.slice(16, 23);

    const findDigit = (b) => {
      for (let d = 0; d <= 9; d++) {
        if (this.DIGITS["" + d].every((v, i) => v === b[i])) return d;
      }
      if ([1, 1, 1, 0, 0, 1, 1].every((v, i) => v === b[i])) return 9;
      return null;
    };

    const findOp = (b) => {
      if (b[0] === 1 && b[1] === 1) return "+";
      if (b[0] === 1 && b[1] === 0) return "-";
      return null;
    };

    const d1 = findDigit(d1B);
    const op = findOp(opB);
    const d2 = findDigit(d2B);
    const d3 = findDigit(d3B);

    if (d1 === null || op === null || d2 === null || d3 === null) return null;

    const isCorrect = (op === "+" && d1 + d2 === d3) || (op === "-" && d1 - d2 === d3);
    return { d1, op, d2, d3, text: `${d1} ${op} ${d2} = ${d3}`, isCorrect };
  },

  opponentWon(oppScore) {
    this.isOver = true;
    this.stop();
    AudioEngine.error();
    const t = this.t();
    this.showSolutionModal(`👥 ${t.opponent || 'Opponent'} (${oppScore})`, this.currentPuzzle);
  },

  showSolutionModal(title, p) {
    if (!p) return;
    const t = this.t();
    const lang = App.lang || 'uz';

    const modalEl = document.getElementById('matches-solution-modal');
    const titleEl = document.getElementById('matches-sol-title');
    const eqEl = document.getElementById('matches-sol-eq');
    const stepEl = document.getElementById('matches-sol-step');
    const visualEl = document.getElementById('matches-sol-visual');
    const btnClose = document.getElementById('matches-sol-btn-close');
    const btnApply = document.getElementById('matches-sol-btn-apply');
    const btnNext = document.getElementById('matches-sol-btn-next');

    if (titleEl) titleEl.textContent = title;
    if (eqEl) eqEl.textContent = p.eq;

    const stepText = (p.step && (p.step[lang] || p.step.en || p.step.uz)) || '';
    if (stepEl) stepEl.innerHTML = `<strong>${t.matchesStep || 'Step:'}</strong><br>${stepText}`;
    if (visualEl) visualEl.textContent = `${t.matchesVisual || 'Comparison:'}\n${p.visual}`;

    if (btnClose) btnClose.textContent = t.matchesBtnClose || t.matchesClose || 'Yopish';
    if (btnApply) btnApply.textContent = t.matchesApply || 'Doskaga qo\'yish';
    if (btnNext) btnNext.textContent = t.matchesBtnNext || 'Keyingisi';

    if (modalEl) modalEl.classList.add('active');
  },

  closeSolutionModal() {
    const modalEl = document.getElementById('matches-solution-modal');
    if (modalEl) modalEl.classList.remove('active');
  },

  onModalNext() {
    this.closeSolutionModal();
    this.nextPuzzle();
  },

  applySolutionToBoard() {
    const p = this.currentPuzzle;
    if (!p || !p.sol) return;
    AudioEngine.win();
    this.isOver = true;
    this.stop();
    this.currentBits = [
      ...this.DIGITS[p.sol[0]],
      ...this.OPS[p.sol[1]],
      ...this.DIGITS[p.sol[2]],
      ...this.DIGITS[p.sol[3]]
    ];
    this.handCount = 0;
    this.updateHandUI();
    this.renderEquation();
    this.closeSolutionModal();
    const t = this.t();
    App.showToast(t.matchesApplied || "To'g'ri yechim doskaga qo'yildi! ✅");
  },

  showHint() {
    AudioEngine.tap();
    const p = this.currentPuzzle;
    if (!p) return;
    const t = this.t();
    this.showSolutionModal(`💡 ${t.matchesSolution || 'Solution'}`, p);
  }
};
