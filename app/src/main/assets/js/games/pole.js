/* Field of Wonders / So'z Topish Game Engine
   - Clean Single-Player Word Guessing Engine
   - 100% multilingual questions & topics (UZ, RU, EN, TR)
   - Real-time letter reveal, hearts/lives system, hint feature, and whole-word solver
*/
const PoleGame = {
  score: 0,
  lives: 5,
  maxLives: 5,
  questionIdx: 0,
  currentQuestion: null,
  guessedLetters: new Set(),
  isOver: false,

  questions: {
    uz: [
      { q: "Quyosh sistemasidagi eng katta sayyora qaysi?", a: "YUPITER", topic: "Astronomiya" },
      { q: "Dunyodagi eng uzun daryo qaysi?", a: "NIL", topic: "Geografiya" },
      { q: "Dunyodagi eng baland tog' cho'qqisi qaysi?", a: "EVEREST", topic: "Geografiya" },
      { q: "O'zbekiston Respublikasining poytaxti qaysi shahar?", a: "TOSHKENT", topic: "Geografiya" },
      { q: "Dengizdagi eng ulkan sutemizuvchi jonivor nima?", a: "KIT", topic: "Hayvonot olami" },
      { q: "Yer yuzidagi eng tez yuguruvchi yirtqich jonivor?", a: "GEPARD", topic: "Tabiat" },
      { q: "Kompyuterning hisoblash markazi hisoblangan mikrosxema?", a: "PROTSESSOR", topic: "Texnologiya" },
      { q: "Quyoshga eng yaqin joylashgan birinchi sayyora?", a: "MERKURIY", topic: "Koinot" },
      { q: "Mashhur qadimiy piramidalar joylashgan mamlakat?", a: "MISR", topic: "Tarix" },
      { q: "Yer shari yuzasining 71 foizini qoplab turgan modda?", a: "SUV", topic: "Tabiat" },
      { q: "Eng katta okean qaysi?", a: "TINCH", topic: "Geografiya" },
      { q: "Odam tanasidagi qonni tozalovchi asosiy juft a'zo?", a: "BUYRAK", topic: "Biologiya" },
      { q: "O'zbekiston bayrog'ida nechta yulduz bor?", a: "ONIKKI", topic: "Davlat ramzlari" },
      { q: "Dunyodagi eng chuqur chuchuk suvli ko'l qaysi?", a: "BAYKAL", topic: "Geografiya" },
      { q: "Qushlarning tanasini qoplab turuvchi qoplama?", a: "PAT", topic: "Zoologiya" },
      { q: "Oltinning kimyoviy belgisi lotincha qanday?", a: "AURUM", topic: "Kimyo" },
      { q: "Elektr lampochkasini ixtiro qilgan olim?", a: "EDISON", topic: "Kashfiyotlar" },
      { q: "Avtomobil harakatlanishi uchun yonilg'i turi?", a: "BENZIN", topic: "Texnika" },
      { q: "Futbol o'yinida maydonda nechta o'yinchi bo'ladi?", a: "O'NBIR", topic: "Sport" },
      { q: "Eng sovuq qit'a qaysi?", a: "ANTARKTIDA", topic: "Geografiya" }
    ],
    ru: [
      { q: "Самая большая планета Солнечной системы?", a: "ЮПИТЕР", topic: "Астрономия" },
      { q: "Самая длинная река в мире?", a: "НИЛ", topic: "География" },
      { q: "Самая высокая горная вершина мира?", a: "ЭВЕРЕСТ", topic: "География" },
      { q: "Столица Республики Узбекистан?", a: "ТАШКЕНТ", topic: "География" },
      { q: "Самое крупное млекопитающее на Земле?", a: "КИТ", topic: "Природа" },
      { q: "Самое быстрое наземное животное?", a: "ГЕПАРД", topic: "Фауна" },
      { q: "Главный вычислительный процессор компьютера?", a: "ПРОЦЕССОР", topic: "Технологии" },
      { q: "Ближайшая к Солнцу планета?", a: "МЕРКУРИЙ", topic: "Космос" },
      { q: "В какой стране находятся великие пирамиды?", a: "ЕГИПЕТ", topic: "История" },
      { q: "Самый большой океан на Земле?", a: "ТИХИЙ", topic: "География" },
      { q: "Самое глубокое озеро в мире?", a: "БАЙКАЛ", topic: "Природа" },
      { q: "Орган человека, качающий кровь?", a: "СЕРДЦЕ", topic: "Анатомия" }
    ],
    en: [
      { q: "What is the largest planet in our Solar System?", a: "JUPITER", topic: "Astronomy" },
      { q: "What is the longest river in the world?", a: "NILE", topic: "Geography" },
      { q: "What is the highest mountain peak on Earth?", a: "EVEREST", topic: "Geography" },
      { q: "What is the capital city of Uzbekistan?", a: "TASHKENT", topic: "Geography" },
      { q: "What is the largest mammal in the ocean?", a: "WHALE", topic: "Wildlife" },
      { q: "What is the fastest land animal on Earth?", a: "CHEETAH", topic: "Nature" },
      { q: "What is the main brain processor of a computer?", a: "CPU", topic: "Technology" },
      { q: "Which planet is closest to the Sun?", a: "MERCURY", topic: "Space" },
      { q: "Country famous for the Ancient Pyramids?", a: "EGYPT", topic: "History" },
      { q: "What is the largest ocean on Earth?", a: "PACIFIC", topic: "Geography" },
      { q: "What is the deepest lake in the world?", a: "BAIKAL", topic: "Nature" }
    ],
    tr: [
      { q: "Güneş Sistemindeki en büyük gezegen hangisidir?", a: "JUPITER", topic: "Astronomi" },
      { q: "Dünyanın en uzun nehri hangisidir?", a: "NIL", topic: "Coğrafya" },
      { q: "Dünyanın en yüksek dağı hangisidir?", a: "EVEREST", topic: "Coğrafya" },
      { q: "Özbekistan'ın başkenti neresidir?", a: "TASKENT", topic: "Şehirler" },
      { q: "Dünyadaki en büyük deniz memelisi?", a: "BALINA", topic: "Doğa" },
      { q: "Karadaki en hızlı koşan hayvan?", a: "CIPAT", topic: "Hayvanlar" },
      { q: "Güneş'e en yakın gezegen hangisidir?", a: "MERKUR", topic: "Uzay" },
      { q: "Dünyanın en büyük okyanusu hangisidir?", a: "PASIFIK", topic: "Coğrafya" }
    ]
  },

  t() {
    return I18N[App.lang] || I18N.uz;
  },

  init() {
    this.score = 0;
    this.questionIdx = 0;
  },

  updateUIStrings() {
    const t = this.t();
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el && txt) el.textContent = txt;
    };
    setTxt('pole-header-title', t.mPoleTitle || "Mo'jizalar Maydoni");
    setTxt('pole-lbl-score', t.score || "BALL");
    setTxt('pole-lbl-lives', t.poleLives || "JONLAR");
    setTxt('pole-lbl-question', t.poleQuestion || "SAVOL");
    setTxt('pole-hint-lbl', t.poleRevealLetter || "Harf Ochish");
    setTxt('pole-guess-lbl', t.poleGuessWordBtn || "Butun So'zni Aytish");
    setTxt('pole-next-lbl', t.poleNextQuestion || "Keyingi Savol");
  },

  start() {
    this.isOver = false;
    this.lives = this.maxLives;
    this.guessedLetters = new Set();
    this.updateUIStrings();

    const lang = App.lang || 'uz';
    const list = this.questions[lang] || this.questions.uz;
    if (this.questionIdx >= list.length) {
      this.questionIdx = 0;
    }
    this.currentQuestion = list[this.questionIdx];

    this.renderScoreboard();
    this.renderQuestion();
    this.renderBoard();
    this.renderKeyboard();
  },

  renderScoreboard() {
    const sEl = document.getElementById('pole-score-val');
    if (sEl) sEl.textContent = `⭐ ${this.score}`;

    const lEl = document.getElementById('pole-lives-val');
    if (lEl) {
      let hearts = '';
      for (let i = 0; i < this.maxLives; i++) {
        hearts += (i < this.lives) ? '❤️' : '🖤';
      }
      lEl.textContent = hearts;
    }

    const qEl = document.getElementById('pole-q-num-val');
    const lang = App.lang || 'uz';
    const total = (this.questions[lang] || this.questions.uz).length;
    if (qEl) qEl.textContent = `${this.questionIdx + 1} / ${total}`;
  },

  renderQuestion() {
    if (!this.currentQuestion) return;
    const tag = document.getElementById('pole-topic-tag');
    if (tag) tag.textContent = `📌 ${this.currentQuestion.topic}`;

    const qText = document.getElementById('pole-question-text');
    if (qText) qText.textContent = this.currentQuestion.q;
  },

  renderBoard() {
    const board = document.getElementById('pole-word-board');
    if (!board || !this.currentQuestion) return;
    board.innerHTML = '';

    const word = this.currentQuestion.a.toUpperCase();
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const box = document.createElement('div');
      box.className = 'pole-letter-box';

      if (char === ' ' || char === '-') {
        box.className += ' pole-letter-space';
        box.textContent = char;
      } else if (this.guessedLetters.has(char)) {
        box.className += ' revealed animate-pop';
        box.textContent = char;
      } else {
        box.textContent = '';
      }
      board.appendChild(box);
    }
  },

  renderKeyboard() {
    const kBox = document.getElementById('pole-keyboard-box');
    if (!kBox) return;
    kBox.innerHTML = '';

    const lang = App.lang || 'uz';
    let letters = [];
    if (lang === 'ru') {
      letters = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split('');
    } else {
      letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
      if (lang === 'uz') {
        letters.push("O'", "G'", "SH", "CH");
      }
    }

    letters.forEach(char => {
      const btn = document.createElement('button');
      btn.className = 'pole-key-btn';
      btn.textContent = char;
      btn.id = `pole-key-${char.replace(/[^a-zA-Z0-9]/g, '_')}`;

      if (this.guessedLetters.has(char)) {
        btn.disabled = true;
        const inWord = this.currentQuestion && this.currentQuestion.a.toUpperCase().includes(char);
        btn.classList.add(inWord ? 'key-hit' : 'key-miss');
      } else {
        btn.onclick = () => this.pickLetter(char);
      }

      kBox.appendChild(btn);
    });
  },

  pickLetter(char) {
    if (this.isOver || !this.currentQuestion || this.guessedLetters.has(char)) return;

    this.guessedLetters.add(char);
    const word = this.currentQuestion.a.toUpperCase();

    // Check if letter is in word
    if (word.includes(char)) {
      AudioEngine.tap();
      // Count occurrences
      let count = 0;
      for (let c of word) {
        if (c === char) count++;
      }
      this.score += count * 50;
      this.renderScoreboard();
      this.renderBoard();
      this.renderKeyboard();

      // Check for win
      if (this.isWordCompleted()) {
        this.handleWordWin();
      }
    } else {
      AudioEngine.error();
      this.lives--;
      this.renderScoreboard();
      this.renderKeyboard();

      if (this.lives <= 0) {
        this.handleGameOver();
      } else {
        App.showToast(`❌ "${char}" harfi bu so'zda yo'q!`);
      }
    }
  },

  isWordCompleted() {
    if (!this.currentQuestion) return false;
    const word = this.currentQuestion.a.toUpperCase();
    for (let char of word) {
      if (char === ' ' || char === '-') continue;
      if (!this.guessedLetters.has(char)) return false;
    }
    return true;
  },

  handleWordWin() {
    this.isOver = true;
    this.score += 200; // Bonus for completion
    this.renderScoreboard();
    AudioEngine.win();
    Confetti.fire(45);

    setTimeout(() => {
      App.showModal(
        '🎉',
        "Ajoyib! So'z Topildi!",
        `To'g'ri javob: "${this.currentQuestion.a}". Siz +200 bonus ball to'pladingiz!`,
        () => {
          PoleGame.questionIdx++;
          PoleGame.start();
        }
      );
    }, 400);
  },

  handleGameOver() {
    this.isOver = true;
    AudioEngine.loss();

    setTimeout(() => {
      App.showModal(
        '💔',
        "Imkoniyatlar Tugadi!",
        `To'g'ri so'z: "${this.currentQuestion.a}" edi. Qaytadan urinib ko'rasizmi?`,
        () => {
          PoleGame.start();
        }
      );
    }, 400);
  },

  giveHint() {
    if (this.isOver || !this.currentQuestion) return;
    const word = this.currentQuestion.a.toUpperCase();
    const missing = [];
    for (let char of word) {
      if (char !== ' ' && char !== '-' && !this.guessedLetters.has(char)) {
        if (!missing.includes(char)) missing.push(char);
      }
    }

    if (missing.length === 0) return;
    const randomChar = missing[Math.floor(Math.random() * missing.length)];
    AudioEngine.tap();
    App.showToast(`💡 Maslahat: Harf "${randomChar}"`);
    this.pickLetter(randomChar);
  },

  openGuessWordModal() {
    if (this.isOver || !this.currentQuestion) return;
    const modal = document.getElementById('pole-word-modal');
    const input = document.getElementById('pole-word-input');
    if (modal) modal.classList.add('active');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 150);
    }
  },

  closeGuessWordModal() {
    const modal = document.getElementById('pole-word-modal');
    if (modal) modal.classList.remove('active');
  },

  submitFullWord() {
    const input = document.getElementById('pole-word-input');
    if (!input || !this.currentQuestion) return;
    const entered = input.value.trim().toUpperCase();
    this.closeGuessWordModal();

    if (!entered) return;

    const answer = this.currentQuestion.a.toUpperCase();
    if (entered === answer) {
      // Reveal all letters
      for (let c of answer) {
        if (c !== ' ' && c !== '-') this.guessedLetters.add(c);
      }
      this.score += 300; // Big bonus for solving whole word!
      this.renderBoard();
      this.renderKeyboard();
      this.handleWordWin();
    } else {
      AudioEngine.error();
      this.lives--;
      this.renderScoreboard();
      App.showToast(`❌ Noto'g'ri so'z!`);
      if (this.lives <= 0) {
        this.handleGameOver();
      }
    }
  },

  nextQuestionManual() {
    AudioEngine.tap();
    this.questionIdx++;
    this.start();
  }
};
