/* ==========================================================================
   BRAINBURST QUIZ - CORE LOGIC & INTERACTIVE ENGINE
   ========================================================================== */

// --- Global Application State ---
const state = {
  username: '',
  category: 'any',
  difficulty: 'easy',
  questions: [],
  currentIndex: 0,
  userAnswers: [], // Stores user answers (or "Skipped ⚡", "Time Out ⏰")
  score: 0,
  timerInterval: null,
  timeLeftMs: 15000,
  totalTimeLimitMs: 15000,
  timerTickMs: 100, // Tick rate for smooth progress bar transition
  hasAnsweredCurrent: false
};

// --- Audio Synthesizer Engine (Web Audio API) ---
let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'correct') {
      // Crisp ascending electronic chord
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.05);
        
        gain.gain.setValueAtTime(0.12, now + index * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.05);
        osc.stop(now + index * 0.05 + 0.35);
      });
    } else if (type === 'incorrect') {
      // Dissonant dual-tone low buzzer
      [145, 142].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.28);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      });
    } else if (type === 'complete') {
      // Triumphant technical fanfare
      const chords = [
        [261.63, 329.63, 392.00], // C4 Major
        [349.23, 440.00, 523.25], // F4 Major
        [392.00, 493.88, 587.33], // G4 Major
        [523.25, 659.25, 783.99, 1046.50] // C5 Major
      ];
      chords.forEach((chord, chordIndex) => {
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + chordIndex * 0.18);
          
          gain.gain.setValueAtTime(0.08, now + chordIndex * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chordIndex * 0.18 + 0.45);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + chordIndex * 0.18);
          osc.stop(now + chordIndex * 0.18 + 0.45);
        });
      });
    }
  } catch (e) {
    console.warn("Web Audio Context not allowed or initialized yet: ", e);
  }
}

// --- High Performance Canvas Confetti Particle System ---
function runConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const colors = ['#5a55fa', '#00e5ff', '#10b981', '#ef4444', '#f59e0b', '#ec4899'];
  const particles = [];
  const particleCount = 125;
  
  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.r = Math.random() * 6 + 4;
      this.d = Math.random() * particleCount;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.tilt = Math.random() * 10 - 5;
      this.tiltAngleIncremental = Math.random() * 0.06 + 0.02;
      this.tiltAngle = 0;
      this.speedY = Math.random() * 3 + 2;
    }
    
    draw() {
      ctx.beginPath();
      ctx.lineWidth = this.r / 2;
      ctx.strokeStyle = this.color;
      ctx.moveTo(this.x + this.tilt + this.r / 2, this.y);
      ctx.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 2);
      ctx.stroke();
    }
    
    update() {
      this.tiltAngle += this.tiltAngleIncremental;
      this.y += this.speedY;
      this.tilt = Math.sin(this.tiltAngle - (this.d / 3)) * 12;
      return this.y > canvas.height;
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new ConfettiParticle());
  }
  
  let animationId;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const isOffScreen = p.update();
      p.draw();
      if (!isOffScreen) {
        active = true;
      }
    }
    if (active) {
      animationId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  const resizeHandler = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeHandler);
  
  animate();
  
  setTimeout(() => {
    window.removeEventListener('resize', resizeHandler);
    cancelAnimationFrame(animationId);
  }, 6000);
}

// --- Robust Local Offline Deck (Fallback Trivia Repository) ---
const fallbackCategories = [
  { id: "any", name: "Any Category" },
  { id: 9, name: "General Knowledge" },
  { id: 18, name: "Computers" },
  { id: 17, name: "Science & Nature" },
  { id: 22, name: "Geography" },
  { id: 23, name: "History" }
];

const fallbackQuestions = {
  easy: [
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question: "Which planet is known as the Red Planet in our Solar System?",
      correct_answer: "Mars",
      incorrect_answers: ["Venus", "Jupiter", "Saturn"],
      explanation: "Mars is called the Red Planet because iron minerals in its soil oxidize, or rust, causing the soil and atmosphere to look red."
    },
    {
      category: "Science & Nature",
      type: "multiple",
      difficulty: "easy",
      question: "What is the chemical symbol for standard water?",
      correct_answer: "H2O",
      incorrect_answers: ["CO2", "O2", "NaCl"],
      explanation: "Water molecules consist of two hydrogen atoms bonded to a single oxygen atom, represented as H2O."
    },
    {
      category: "Computers",
      type: "multiple",
      difficulty: "easy",
      question: "In computer hardware, what does USB stand for?",
      correct_answer: "Universal Serial Bus",
      incorrect_answers: ["Universal System Binary", "Ultra Speed Boot", "United Service Board"],
      explanation: "USB stands for Universal Serial Bus, an industry standard for cables, connectors, and protocols for connection, communication, and power supply."
    },
    {
      category: "Geography",
      type: "multiple",
      difficulty: "easy",
      question: "Which is the largest and deepest ocean on Earth?",
      correct_answer: "Pacific Ocean",
      incorrect_answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
      explanation: "The Pacific Ocean is the largest and deepest of Earth's oceanic divisions, extending from the Arctic Ocean in the north to the Southern Ocean."
    },
    {
      category: "Art",
      type: "multiple",
      difficulty: "easy",
      question: "Which Renaissance artist painted the masterpiece Mona Lisa?",
      correct_answer: "Leonardo da Vinci",
      incorrect_answers: ["Vincent van Gogh", "Pablo Picasso", "Michelangelo"],
      explanation: "The Mona Lisa was painted by the Italian Renaissance polymath Leonardo da Vinci in the early 16th century."
    },
    {
      category: "History",
      type: "multiple",
      difficulty: "easy",
      question: "Which nation gifted the iconic Statue of Liberty to the United States?",
      correct_answer: "France",
      incorrect_answers: ["United Kingdom", "Germany", "Italy"],
      explanation: "France gifted the Statue of Liberty to the United States in 1886 as a symbol of friendship and the shared love of liberty."
    },
    {
      category: "Animals",
      type: "multiple",
      difficulty: "easy",
      question: "What is the fastest land animal on the planet?",
      correct_answer: "Cheetah",
      incorrect_answers: ["Lion", "Leopard", "Pronghorn"],
      explanation: "The cheetah is the fastest land animal, capable of reaching speeds between 50 to 80 mph (80 to 128 km/h) in short bursts."
    },
    {
      category: "Sports",
      type: "multiple",
      difficulty: "easy",
      question: "How many players are on the field for a standard soccer team during a match?",
      correct_answer: "11",
      incorrect_answers: ["9", "10", "12"],
      explanation: "A standard soccer match is played between two teams, each containing 11 players including a goalkeeper."
    },
    {
      category: "Entertainment: Film",
      type: "multiple",
      difficulty: "easy",
      question: "Which classic Disney movie features the character Simba?",
      correct_answer: "The Lion King",
      incorrect_answers: ["Aladdin", "Tarzan", "Mulan"],
      explanation: "Simba is the central protagonist of Disney's classic animated feature film 'The Lion King', released in 1994."
    },
    {
      category: "Mathematics",
      type: "multiple",
      difficulty: "easy",
      question: "What is the exact square root of the number 144?",
      correct_answer: "12",
      incorrect_answers: ["10", "14", "16"],
      explanation: "Twelve multiplied by twelve is equal to 144, making 12 the exact square root."
    }
  ],
  medium: [
    {
      category: "Computers",
      type: "multiple",
      difficulty: "medium",
      question: "What does HTTP stand for in website addresses?",
      correct_answer: "Hypertext Transfer Protocol",
      incorrect_answers: ["Hypertext Transmission Process", "High Transfer Tech Protocol", "Hyper Transfer Text Program"],
      explanation: "HTTP is the foundation of data communication for the World Wide Web, standing for Hypertext Transfer Protocol."
    },
    {
      category: "History",
      type: "multiple",
      difficulty: "medium",
      question: "In which year did the famous Titanic passenger ship sink after striking an iceberg?",
      correct_answer: "1912",
      incorrect_answers: ["1905", "1918", "1922"],
      explanation: "The RMS Titanic sank on April 15, 1912 in the North Atlantic Ocean after colliding with an iceberg during her maiden voyage."
    },
    {
      category: "Science & Nature",
      type: "multiple",
      difficulty: "medium",
      question: "Which chemical element is the primary component of the Sun's mass?",
      correct_answer: "Hydrogen",
      incorrect_answers: ["Helium", "Oxygen", "Carbon"],
      explanation: "Hydrogen constitutes roughly 73% of the Sun's mass, with helium making up around 25%, and heavier elements in trace amounts."
    },
    {
      category: "Mythologies",
      type: "multiple",
      difficulty: "medium",
      question: "Who is the hammer-wielding Norse god associated with lightning and thunder?",
      correct_answer: "Thor",
      incorrect_answers: ["Odin", "Loki", "Freyr"],
      explanation: "Thor is the hammer-wielding Norse protector god associated with thunder, lightning, storms, and strength."
    },
    {
      category: "Entertainment: Music",
      type: "multiple",
      difficulty: "medium",
      question: "Which legendary rock band released the timeless 1973 album 'The Dark Side of the Moon'?",
      correct_answer: "Pink Floyd",
      incorrect_answers: ["The Beatles", "Led Zeppelin", "Queen"],
      explanation: "'The Dark Side of the Moon' is the eighth studio album by the English rock band Pink Floyd, remaining one of the best-selling albums in history."
    },
    {
      category: "Geography",
      type: "multiple",
      difficulty: "medium",
      question: "What is the official capital city of Australia?",
      correct_answer: "Canberra",
      incorrect_answers: ["Sydney", "Melbourne", "Brisbane"],
      explanation: "Canberra was selected as Australia's capital in 1908 as a compromise between rivals Sydney and Melbourne."
    },
    {
      category: "Literature",
      type: "multiple",
      difficulty: "medium",
      question: "Who authored the famous tragic play 'Romeo and Juliet'?",
      correct_answer: "William Shakespeare",
      incorrect_answers: ["Charles Dickens", "Mark Twain", "Jane Austen"],
      explanation: "William Shakespeare wrote 'Romeo and Juliet' early in his career, documenting the tragic story of two young star-crossed lovers."
    },
    {
      category: "Science: Chemistry",
      type: "multiple",
      difficulty: "medium",
      question: "What is the atomic number of the element Carbon?",
      correct_answer: "6",
      incorrect_answers: ["12", "8", "14"],
      explanation: "Carbon is the sixth element on the periodic table, having six protons in its atomic nucleus."
    },
    {
      category: "Entertainment: Video Games",
      type: "multiple",
      difficulty: "medium",
      question: "Which open-world sandbox game is widely ranked as the best-selling video game of all time?",
      correct_answer: "Minecraft",
      incorrect_answers: ["Grand Theft Auto V", "Tetris", "Wii Sports"],
      explanation: "Minecraft was released in 2011 and has sold over 300 million copies across all gaming platforms, making it the best-seller."
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "medium",
      question: "What is the official national currency of Japan?",
      correct_answer: "Yen",
      incorrect_answers: ["Won", "Yuan", "Ringgit"],
      explanation: "The Japanese Yen is the official currency of Japan and is the third most traded currency in the foreign exchange market."
    }
  ],
  hard: [
    {
      category: "Computers",
      type: "multiple",
      difficulty: "hard",
      question: "In standard computer networking, which TCP port does secure HTTPS traffic typically utilize?",
      correct_answer: "443",
      incorrect_answers: ["80", "8080", "22"],
      explanation: "Port 443 is the global standard port for secure web transfer protocols (HTTPS), whereas unsecure HTTP utilizes Port 80."
    },
    {
      category: "Science: Physics",
      type: "multiple",
      difficulty: "hard",
      question: "Which physicist formulated the legendary Theory of General Relativity in 1915?",
      correct_answer: "Albert Einstein",
      incorrect_answers: ["Isaac Newton", "Niels Bohr", "Max Planck"],
      explanation: "Albert Einstein developed General Relativity, providing a unified description of gravity as a geometric property of space and time."
    },
    {
      category: "History",
      type: "multiple",
      difficulty: "hard",
      question: "Who was officially crowned the very first Emperor of the Roman Empire, ruling from 27 BC?",
      correct_answer: "Augustus",
      incorrect_answers: ["Julius Caesar", "Nero", "Tiberius"],
      explanation: "Augustus (born Octavian) became the first Emperor of Rome after the collapse of the Roman Republic."
    },
    {
      category: "Geography",
      type: "multiple",
      difficulty: "hard",
      question: "Which is the absolute deepest and oldest freshwater lake on Earth?",
      correct_answer: "Lake Baikal",
      incorrect_answers: ["Lake Superior", "Lake Tanganyika", "Lake Victoria"],
      explanation: "Lake Baikal in southern Siberia, Russia, is the deepest lake in the world at 1,642 meters, holding about 20% of the world's fresh surface water."
    },
    {
      category: "Art",
      type: "multiple",
      difficulty: "hard",
      question: "Which Spanish surrealist artist painted the iconic melting clocks in 'The Persistence of Memory'?",
      correct_answer: "Salvador Dalí",
      incorrect_answers: ["Pablo Picasso", "Joan Miró", "Francisco Goya"],
      explanation: "Salvador Dalí painted the surreal classic 'The Persistence of Memory' in 1931, symbolizing the relativity of space and time."
    },
    {
      category: "Mathematics",
      type: "multiple",
      difficulty: "hard",
      question: "Which mathematical constant is defined as the ratio of a circle's circumference to its diameter?",
      correct_answer: "Pi",
      incorrect_answers: ["Euler's Number", "Golden Ratio", "Planck's Constant"],
      explanation: "Pi (represented by the Greek letter π) represents the exact ratio of a circle's circumference to its diameter, approximately 3.14159."
    },
    {
      category: "Science & Nature",
      type: "multiple",
      difficulty: "hard",
      question: "What is the heaviest naturally occurring chemical element found on Earth?",
      correct_answer: "Uranium",
      incorrect_answers: ["Plutonium", "Lead", "Osmium"],
      explanation: "Uranium, with an atomic number of 92, is the heaviest naturally occurring element found in significant quantities on Earth."
    },
    {
      category: "Literature",
      type: "multiple",
      difficulty: "hard",
      question: "Who authored the colossal 19th-century epic Russian novel 'War and Peace'?",
      correct_answer: "Leo Tolstoy",
      incorrect_answers: ["Fyodor Dostoevsky", "Anton Chekhov", "Alexander Pushkin"],
      explanation: "Russian author Leo Tolstoy published 'War and Peace' in 1869, recounting the history of the French invasion of Russia."
    },
    {
      category: "Entertainment: Board Games",
      type: "multiple",
      difficulty: "hard",
      question: "In chess, which unique piece has the exclusive ability to jump directly over other occupied squares?",
      correct_answer: "Knight",
      incorrect_answers: ["Rook", "Bishop", "Queen"],
      explanation: "The Knight moves in an 'L' shape and is the only piece on the chess board that can hop over other pieces."
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "hard",
      question: "Which northern nation is home to the world's oldest continuous parliament (Althing), founded in 930 AD?",
      correct_answer: "Iceland",
      incorrect_answers: ["United Kingdom", "Greece", "Norway"],
      explanation: "The Althing is the national parliament of Iceland. It is the oldest surviving parliament or assembly in the world."
    }
  ]
};

// --- Decoding & Shuffling Utilities ---
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getOfflineQuestions(difficulty, categoryId) {
  let list = [...fallbackQuestions[difficulty]];
  
  if (categoryId !== 'any') {
    const selectElem = document.getElementById('category-select');
    if (selectElem) {
      const selectedOption = selectElem.options[selectElem.selectedIndex];
      if (selectedOption) {
        const catName = selectedOption.text.toLowerCase();
        const filtered = list.filter(q => {
          const qCat = q.category.toLowerCase();
          return qCat.includes(catName) || catName.includes(qCat);
        });
        if (filtered.length >= 3) {
          const others = list.filter(q => !filtered.includes(q));
          list = [...filtered, ...others].slice(0, 10);
        }
      }
    }
  }
  
  return shuffleArray(list).map(q => {
    const options = shuffleArray([...q.incorrect_answers, q.correct_answer]);
    return {
      ...q,
      options: options
    };
  });
}

// --- API Fetching Core ---
async function fetchQuestions() {
  const categoryParam = state.category !== 'any' ? `&category=${state.category}` : '';
  const url = `https://opentdb.com/api.php?amount=10${categoryParam}&difficulty=${state.difficulty}&type=multiple`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API network failure");
    const data = await res.json();
    
    if (data.response_code === 0 && data.results && data.results.length > 0) {
      return data.results.map((q) => {
        const correct = decodeHtml(q.correct_answer);
        const incorrect = q.incorrect_answers.map(decodeHtml);
        const options = shuffleArray([...incorrect, correct]);
        
        return {
          category: decodeHtml(q.category),
          type: q.type,
          difficulty: q.difficulty,
          question: decodeHtml(q.question),
          correct_answer: correct,
          incorrect_answers: incorrect,
          options: options,
          explanation: `The correct answer is indeed <strong>${correct}</strong>. Learn more by researching this topic!`
        };
      });
    } else {
      console.warn(`Trivia API returned code ${data.response_code}. Initializing fallback deck.`);
      return getOfflineQuestions(state.difficulty, state.category);
    }
  } catch (error) {
    console.error("Trivia API fetch failed. Using fallback deck: ", error);
    return getOfflineQuestions(state.difficulty, state.category);
  }
}

// --- Question Rendering & UI Control Flows ---
function updateDifficultyBadge(difficultyText) {
  const badge = document.getElementById('meta-difficulty');
  badge.textContent = difficultyText.charAt(0).toUpperCase() + difficultyText.slice(1);
  badge.className = 'meta-tag';
  
  if (difficultyText === 'easy') {
    badge.classList.add('diff-tag-easy');
  } else if (difficultyText === 'medium') {
    badge.classList.add('diff-tag-medium');
  } else {
    badge.classList.add('diff-tag-hard');
  }
}

function renderQuestion() {
  if (state.currentIndex < 0 || state.currentIndex >= state.questions.length) return;
  
  state.hasAnsweredCurrent = state.userAnswers[state.currentIndex] !== null;
  const q = state.questions[state.currentIndex];
  
  // Header state
  document.getElementById('question-count-text').textContent = `Question ${state.currentIndex + 1} of ${state.questions.length}`;
  document.getElementById('meta-category').textContent = q.category;
  updateDifficultyBadge(q.difficulty);
  
  // Question text
  document.getElementById('question-text').innerHTML = q.question;
  
  // Progress bar
  const progressPercent = ((state.currentIndex + 1) / state.questions.length) * 100;
  document.getElementById('progress-indicator').style.width = `${progressPercent}%`;
  
  // Options render
  const optionsGrid = document.getElementById('options-grid');
  optionsGrid.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  
  q.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('data-letter', letters[index]);
    btn.innerHTML = `<span>${opt}</span>`;
    
    const previousAnswer = state.userAnswers[state.currentIndex];
    if (previousAnswer !== null) {
      btn.disabled = true;
      if (opt === q.correct_answer) {
        btn.classList.add('correct');
      } else if (opt === previousAnswer) {
        btn.classList.add('wrong');
      } else {
        btn.classList.add('opacity-50');
      }
    }
    
    btn.addEventListener('click', () => {
      handleOptionSelect(opt, btn);
    });
    
    optionsGrid.appendChild(btn);
  });
  
  // Feedbacks render
  const explanationBox = document.getElementById('explanation-box');
  if (state.hasAnsweredCurrent) {
    showExplanation(state.userAnswers[state.currentIndex] === q.correct_answer);
  } else {
    explanationBox.classList.add('hidden');
  }
  
  // Nav triggers
  document.getElementById('prev-btn').disabled = state.currentIndex === 0;
  
  const nextBtn = document.getElementById('next-btn');
  if (state.currentIndex === state.questions.length - 1) {
    nextBtn.querySelector('span').textContent = 'Finish Quiz 🏁';
  } else {
    nextBtn.querySelector('span').textContent = 'Next Question →';
  }
  nextBtn.disabled = !state.hasAnsweredCurrent;
  
  const skipBtn = document.getElementById('skip-btn');
  skipBtn.disabled = state.hasAnsweredCurrent;
  
  // Timer loops
  resetTimer();
  if (!state.hasAnsweredCurrent) {
    startTimer();
  }
}

function handleOptionSelect(selectedOption, clickedBtn) {
  if (state.hasAnsweredCurrent) return;
  
  stopTimer();
  state.hasAnsweredCurrent = true;
  state.userAnswers[state.currentIndex] = selectedOption;
  
  const q = state.questions[state.currentIndex];
  const buttons = document.querySelectorAll('.option-btn');
  const isCorrect = selectedOption === q.correct_answer;
  
  if (isCorrect) {
    let multiplier = 10;
    if (q.difficulty === 'medium') multiplier = 20;
    if (q.difficulty === 'hard') multiplier = 30;
    
    const timeRatio = state.timeLeftMs / state.totalTimeLimitMs;
    const speedBonus = Math.round(timeRatio * 10);
    state.score += multiplier + speedBonus;
    
    playSound('correct');
  } else {
    playSound('incorrect');
  }
  
  buttons.forEach(btn => {
    btn.disabled = true;
    const btnText = btn.querySelector('span').textContent;
    if (btnText === q.correct_answer) {
      btn.classList.add('correct');
    } else if (btnText === selectedOption) {
      btn.classList.add('wrong');
    } else {
      btn.classList.add('opacity-50');
    }
  });
  
  showExplanation(isCorrect);
  document.getElementById('next-btn').disabled = false;
  document.getElementById('skip-btn').disabled = true;
}

function showExplanation(isCorrect) {
  const explanationBox = document.getElementById('explanation-box');
  const feedbackTitle = document.getElementById('feedback-title');
  const explanationText = document.getElementById('explanation-text');
  const q = state.questions[state.currentIndex];
  
  explanationBox.classList.remove('hidden');
  
  if (isCorrect) {
    feedbackTitle.textContent = 'Absolutely Correct! ✨';
    explanationBox.querySelector('.explanation-icon').textContent = '✨';
    explanationBox.classList.remove('text-danger');
    explanationBox.classList.add('text-success');
  } else {
    feedbackTitle.textContent = 'Oops, Incorrect! ❌';
    explanationBox.querySelector('.explanation-icon').textContent = '💡';
    explanationBox.classList.remove('text-success');
    explanationBox.classList.add('text-danger');
  }
  
  explanationText.innerHTML = q.explanation;
}

// --- Circular Timer Loop Elements ---
function resetTimer() {
  stopTimer();
  state.timeLeftMs = state.totalTimeLimitMs;
  updateTimerUI();
}

function startTimer() {
  const tickRate = state.timerTickMs;
  state.timerInterval = setInterval(() => {
    state.timeLeftMs -= tickRate;
    if (state.timeLeftMs <= 0) {
      state.timeLeftMs = 0;
      updateTimerUI();
      handleTimeOut();
    } else {
      updateTimerUI();
    }
  }, tickRate);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimerUI() {
  const timerProgress = document.getElementById('timer-progress');
  const timerText = document.getElementById('timer-text');
  
  const secondsLeft = Math.ceil(state.timeLeftMs / 1000);
  timerText.textContent = secondsLeft;
  
  const fraction = state.timeLeftMs / state.totalTimeLimitMs;
  const dashOffset = 276.4 * (1 - fraction);
  timerProgress.style.strokeDashoffset = dashOffset;
  
  if (state.timeLeftMs <= 5000) {
    timerProgress.classList.add('warning');
  } else {
    timerProgress.classList.remove('warning');
  }
}

function handleTimeOut() {
  stopTimer();
  if (state.hasAnsweredCurrent) return;
  
  state.hasAnsweredCurrent = true;
  state.userAnswers[state.currentIndex] = 'Time Out ⏰';
  
  playSound('incorrect');
  
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => {
    btn.disabled = true;
    const btnText = btn.querySelector('span').textContent;
    if (btnText === state.questions[state.currentIndex].correct_answer) {
      btn.classList.add('correct');
    } else {
      btn.classList.add('opacity-50');
    }
  });
  
  const explanationBox = document.getElementById('explanation-box');
  const feedbackTitle = document.getElementById('feedback-title');
  const explanationText = document.getElementById('explanation-text');
  
  explanationBox.classList.remove('hidden');
  explanationBox.classList.remove('text-success');
  explanationBox.classList.add('text-danger');
  feedbackTitle.textContent = 'Time is Up! ⏰';
  explanationText.innerHTML = `You ran out of time! The correct answer is <strong>${state.questions[state.currentIndex].correct_answer}</strong>.`;
  
  document.getElementById('next-btn').disabled = false;
  document.getElementById('skip-btn').disabled = true;
}

// --- Leaderboard Board Mechanics (LocalStorage) ---
function saveToLeaderboard(name, score) {
  let leaderboard = [];
  try {
    leaderboard = JSON.parse(localStorage.getItem('brainburst_leaderboard')) || [];
  } catch (e) {
    leaderboard = [];
  }
  
  leaderboard.push({ name: name, score: score, date: new Date().toLocaleDateString() });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  
  localStorage.setItem('brainburst_leaderboard', JSON.stringify(leaderboard));
}

function renderLeaderboard() {
  const listElem = document.getElementById('leaderboard-list');
  listElem.innerHTML = '';
  
  let leaderboard = [];
  try {
    leaderboard = JSON.parse(localStorage.getItem('brainburst_leaderboard')) || [];
  } catch (e) {
    leaderboard = [];
  }
  
  if (leaderboard.length === 0) {
    listElem.innerHTML = '<li class="muted-text text-sm py-4 text-center">No scores yet. Be the first!</li>';
    return;
  }
  
  const rankEmojis = ['🥇', '🥈', '🥉', '4th', '5th'];
  leaderboard.forEach((entry, index) => {
    const li = document.createElement('li');
    li.className = 'leaderboard-item';
    li.innerHTML = `
      <span class="leaderboard-rank">${rankEmojis[index] || index + 1}</span>
      <span class="leaderboard-name">${entry.name}</span>
      <span class="leaderboard-score text-success">${entry.score} pts</span>
    `;
    listElem.appendChild(li);
  });
}

// --- Comprehensive Answer Review Panel ---
function renderReviewPanel() {
  const container = document.getElementById('review-container');
  container.innerHTML = '';
  
  state.questions.forEach((q, index) => {
    const userAns = state.userAnswers[index];
    const isCorrect = userAns === q.correct_answer;
    
    const reviewItem = document.createElement('div');
    reviewItem.className = 'review-item';
    
    let answersHtml = '';
    if (isCorrect) {
      answersHtml = `
        <div class="review-ans-card success">
          <span class="review-ans-label">Your Correct Answer</span>
          <span>${userAns}</span>
        </div>
      `;
    } else {
      let label = 'Your Answer';
      let cardClass = 'danger';
      if (userAns === 'Skipped ⚡') {
        label = 'You Skipped This';
        cardClass = 'muted';
      } else if (userAns === 'Time Out ⏰') {
        label = 'Timed Out';
        cardClass = 'muted';
      }
      
      answersHtml = `
        <div class="review-ans-card ${cardClass}">
          <span class="review-ans-label">${label}</span>
          <span>${userAns}</span>
        </div>
        <div class="review-ans-card success">
          <span class="review-ans-label">Correct Answer</span>
          <span>${q.correct_answer}</span>
        </div>
      `;
    }
    
    reviewItem.innerHTML = `
      <div class="review-q-text">${index + 1}. ${q.question}</div>
      <div class="review-answers">
        ${answersHtml}
      </div>
      <div class="review-explanation">
        <strong>Explanation:</strong> ${q.explanation}
      </div>
    `;
    container.appendChild(reviewItem);
  });
}

// --- Quiz Completion Panel ---
function finishQuiz() {
  stopTimer();
  playSound('complete');
  
  document.getElementById('quiz-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.remove('hidden');
  
  let correctCount = 0;
  let wrongCount = 0;
  
  state.questions.forEach((q, index) => {
    const ans = state.userAnswers[index];
    if (ans === q.correct_answer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });
  
  const accuracy = state.questions.length > 0 ? Math.round((correctCount / state.questions.length) * 100) : 0;
  
  document.getElementById('res-score').textContent = state.score;
  document.getElementById('res-correct').textContent = correctCount;
  document.getElementById('res-wrong').textContent = wrongCount;
  document.getElementById('res-percent').textContent = `${accuracy}%`;
  
  const emojiElem = document.getElementById('result-emoji');
  const headlineElem = document.getElementById('result-headline');
  const motivationElem = document.getElementById('result-motivation');
  
  if (accuracy >= 80) {
    emojiElem.textContent = '🏆';
    headlineElem.textContent = 'Brilliant Performance!';
    motivationElem.textContent = `Amazing job, ${state.username}! You've demonstrated exceptional skill with ${accuracy}% accuracy. You're a true trivia master!`;
    runConfetti();
  } else if (accuracy >= 50) {
    emojiElem.textContent = '🌟';
    headlineElem.textContent = 'Great Effort!';
    motivationElem.textContent = `Nice work, ${state.username}! You scored ${accuracy}% accuracy. Keep practicing to reach the Hall of Fame!`;
  } else {
    emojiElem.textContent = '💪';
    headlineElem.textContent = 'Keep Learning!';
    motivationElem.textContent = `Good try, ${state.username}! You got ${correctCount} correct answers. Review your mistakes below to level up for next time.`;
  }
  
  saveToLeaderboard(state.username, state.score);
  renderLeaderboard();
  renderReviewPanel();
}

// --- Core Event Listeners & Bootstrapping ---
document.addEventListener('DOMContentLoaded', () => {
  // Theme management bootstrapping
  let currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  const themeToggle = document.getElementById('theme-toggle');
  const moonIcon = document.getElementById('moon-icon');
  const sunIcon = document.getElementById('sun-icon');
  
  function updateThemeIcons() {
    if (currentTheme === 'dark') {
      moonIcon.classList.add('hidden');
      sunIcon.classList.remove('hidden');
    } else {
      moonIcon.classList.remove('hidden');
      sunIcon.classList.add('hidden');
    }
  }
  
  updateThemeIcons();
  
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcons();
    playSound('click');
  });

  // Sound management bootstrapping
  const soundToggle = document.getElementById('sound-toggle');
  const soundOnIcon = document.getElementById('sound-on-icon');
  const soundOffIcon = document.getElementById('sound-off-icon');
  
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundOnIcon.classList.remove('hidden');
      soundOffIcon.classList.add('hidden');
      playSound('click');
    } else {
      soundOnIcon.classList.add('hidden');
      soundOffIcon.classList.remove('hidden');
    }
  });

  // Dynamic category fetch
  async function loadCategories() {
    const categorySelect = document.getElementById('category-select');
    try {
      const res = await fetch('https://opentdb.com/api_category.php');
      if (!res.ok) throw new Error("Network offline or blocks");
      const data = await res.json();
      
      categorySelect.innerHTML = '<option value="any">Any Category</option>';
      data.trivia_categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        categorySelect.appendChild(opt);
      });
    } catch (error) {
      console.warn("Failed to load online categories. Injecting fallback options: ", error);
      categorySelect.innerHTML = '';
      fallbackCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        categorySelect.appendChild(opt);
      });
    }
  }
  
  loadCategories();
  renderLeaderboard();

  // Setup form submission
  const setupForm = document.getElementById('setup-form');
  setupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    playSound('click');
    
    const usernameInput = document.getElementById('username-input');
    state.username = usernameInput.value.trim() || 'Anonymous';
    
    const categorySelect = document.getElementById('category-select');
    state.category = categorySelect.value;
    
    const difficultyRadio = document.querySelector('input[name="difficulty"]:checked');
    state.difficulty = difficultyRadio ? difficultyRadio.value : 'easy';
    
    const startBtn = document.getElementById('start-btn');
    const originalHtml = startBtn.innerHTML;
    
    // UI Loader State
    startBtn.disabled = true;
    startBtn.innerHTML = `<span>Loading Challenge...</span><div class="loader-spinner"></div>`;
    
    const loadedQuestions = await fetchQuestions();
    
    startBtn.disabled = false;
    startBtn.innerHTML = originalHtml;
    
    if (loadedQuestions && loadedQuestions.length > 0) {
      state.questions = loadedQuestions;
      state.currentIndex = 0;
      state.userAnswers = new Array(state.questions.length).fill(null);
      state.score = 0;
      
      document.getElementById('setup-screen').classList.add('hidden');
      document.getElementById('quiz-screen').classList.remove('hidden');
      
      renderQuestion();
    } else {
      alert("Oops! Could not load the questions. Please check your connection and try again.");
    }
  });

  // Navigation: Next question flow
  const nextBtn = document.getElementById('next-btn');
  nextBtn.addEventListener('click', () => {
    playSound('click');
    if (state.currentIndex < state.questions.length - 1) {
      state.currentIndex++;
      renderQuestion();
    } else {
      finishQuiz();
    }
  });

  // Navigation: Previous question flow
  const prevBtn = document.getElementById('prev-btn');
  prevBtn.addEventListener('click', () => {
    playSound('click');
    if (state.currentIndex > 0) {
      state.currentIndex--;
      renderQuestion();
    }
  });

  // Navigation: Skip question flow
  const skipBtn = document.getElementById('skip-btn');
  skipBtn.addEventListener('click', () => {
    playSound('click');
    if (state.hasAnsweredCurrent) return;
    
    state.hasAnsweredCurrent = true;
    state.userAnswers[state.currentIndex] = 'Skipped ⚡';
    stopTimer();
    
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      const btnText = btn.querySelector('span').textContent;
      if (btnText === state.questions[state.currentIndex].correct_answer) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('opacity-50');
      }
    });
    
    showExplanation(false);
    document.getElementById('next-btn').disabled = false;
    skipBtn.disabled = true;
  });

  // Results: Restart quiz
  const restartBtn = document.getElementById('restart-btn');
  restartBtn.addEventListener('click', async () => {
    playSound('click');
    
    const originalText = restartBtn.textContent;
    restartBtn.disabled = true;
    restartBtn.textContent = 'Loading Quiz...';
    
    const loadedQuestions = await fetchQuestions();
    
    restartBtn.disabled = false;
    restartBtn.textContent = originalText;
    
    if (loadedQuestions && loadedQuestions.length > 0) {
      state.questions = loadedQuestions;
      state.currentIndex = 0;
      state.userAnswers = new Array(state.questions.length).fill(null);
      state.score = 0;
      
      document.getElementById('result-screen').classList.add('hidden');
      document.getElementById('quiz-screen').classList.remove('hidden');
      
      renderQuestion();
    } else {
      alert("Could not load questions. Please check your internet connection.");
    }
  });

  // Results: Go back home
  const homeBtn = document.getElementById('home-btn');
  homeBtn.addEventListener('click', () => {
    playSound('click');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
  });
});
