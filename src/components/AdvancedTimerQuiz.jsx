import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, AlertTriangle, CheckCircle2, XCircle, Skull, Trophy, Play, Volume2, VolumeX, ArrowRight, RotateCcw, Home, Award, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Global Audio Synthesizer (Web Audio API) ---
const playSynthSound = (type, soundEnabled) => {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    if (type === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'correct') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.05);
        
        gain.gain.setValueAtTime(0.12, now + index * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.35);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + index * 0.05);
        osc.stop(now + index * 0.05 + 0.35);
      });
    } else if (type === 'incorrect') {
      [145, 142].forEach((freq) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.28);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      });
    } else if (type === 'complete') {
      const chords = [
        [261.63, 329.63, 392.00], // C4 Major
        [349.23, 440.00, 523.25], // F4 Major
        [392.00, 493.88, 587.33], // G4 Major
        [523.25, 659.25, 783.99, 1046.50] // C5 Major
      ];
      chords.forEach((chord, chordIndex) => {
        chord.forEach((freq) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + chordIndex * 0.18);
          
          gain.gain.setValueAtTime(0.08, now + chordIndex * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chordIndex * 0.18 + 0.45);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + chordIndex * 0.18);
          osc.stop(now + chordIndex * 0.18 + 0.45);
        });
      });
    }
  } catch (e) {
    console.warn("Web Audio API blocked or not supported: ", e);
  }
};

// --- Decoding & Shuffling Utilities ---
const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// --- Curated Offline Fallback Quiz Deck ---
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

const getOfflineQuestions = (difficulty, categoryId, categorySelectElem) => {
  let list = [...fallbackQuestions[difficulty]];
  
  if (categoryId !== 'any' && categorySelectElem) {
    const selectedOption = categorySelectElem.options[categorySelectElem.selectedIndex];
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
  
  return shuffleArray(list).map(q => {
    const options = shuffleArray([...q.incorrect_answers, q.correct_answer]);
    return {
      ...q,
      options
    };
  });
};

export default function AdvancedTimerQuiz() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, result
  const [loading, setLoading] = useState(false);
  
  // Custom Controls State
  const [username, setUsername] = useState('');
  const [category, setCategory] = useState('any');
  const [difficulty, setDifficulty] = useState('easy');
  const [suddenDeath, setSuddenDeath] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Game Play States
  const [categoriesList, setCategoriesList] = useState(fallbackCategories);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');

  // Circular svg countdown timer state
  const timeLimitMs = 15000;
  const [timeLeftMs, setTimeLeftMs] = useState(timeLimitMs);
  const timerIntervalRef = useRef(null);

  // Dynamic Categories Fetch
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('https://opentdb.com/api_category.php');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCategoriesList([{ id: 'any', name: 'Any Category' }, ...data.trivia_categories]);
      } catch (e) {
        setCategoriesList(fallbackCategories);
      }
    };
    loadCategories();
  }, []);

  // API Fetching & Form Processing
  const startQuiz = async (e) => {
    e.preventDefault();
    playSynthSound('click', soundEnabled);
    setLoading(true);
    
    const categoryParam = category !== 'any' ? `&category=${category}` : '';
    const url = `https://opentdb.com/api.php?amount=10${categoryParam}&difficulty=${difficulty}&type=multiple`;
    
    let loadedQuestions = [];
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      if (data.response_code === 0 && data.results && data.results.length > 0) {
        loadedQuestions = data.results.map((q) => {
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
            options,
            explanation: `The correct answer is indeed <strong>${correct}</strong>. Excellent technical review!`
          };
        });
      } else {
        throw new Error();
      }
    } catch (err) {
      const selectElem = document.getElementById('r-category-select');
      loadedQuestions = getOfflineQuestions(difficulty, category, selectElem);
    }
    
    setLoading(false);
    if (loadedQuestions && loadedQuestions.length > 0) {
      setQuestions(loadedQuestions);
      setQIndex(0);
      setScore(0);
      setUserAnswers(new Array(loadedQuestions.length).fill(null));
      setHasAnsweredCurrent(false);
      setSelectedAnswer('');
      setTimeLeftMs(timeLimitMs);
      setGameState('playing');
    } else {
      alert("Error loading questions. Check your internet connection.");
    }
  };

  // Timer Tick Trigger
  useEffect(() => {
    if (gameState === 'playing' && !hasAnsweredCurrent) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeftMs(prev => {
          if (prev <= 100) {
            clearInterval(timerIntervalRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 100;
        });
      }, 100);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [gameState, qIndex, hasAnsweredCurrent]);

  const handleTimeout = () => {
    setHasAnsweredCurrent(true);
    const updatedAnswers = [...userAnswers];
    updatedAnswers[qIndex] = 'Time Out ⏰';
    setUserAnswers(updatedAnswers);
    playSynthSound('incorrect', soundEnabled);
    
    if (suddenDeath) {
      setTimeout(() => handleGameOver(), 1500);
    }
  };

  const handleGameOver = () => {
    clearInterval(timerIntervalRef.current);
    setGameState('result');
    const correctCount = questions.reduce((acc, q, idx) => acc + (userAnswers[idx] === q.correct_answer ? 1 : 0), 0);
    const accuracy = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
    
    if (accuracy >= 80) {
      playSynthSound('complete', soundEnabled);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      playSynthSound('complete', soundEnabled);
    }
  };

  const handleSelectOption = (opt) => {
    if (hasAnsweredCurrent) return;
    
    clearInterval(timerIntervalRef.current);
    setHasAnsweredCurrent(true);
    setSelectedAnswer(opt);
    
    const updatedAnswers = [...userAnswers];
    updatedAnswers[qIndex] = opt;
    setUserAnswers(updatedAnswers);
    
    const currentQ = questions[qIndex];
    const isCorrect = opt === currentQ.correct_answer;
    
    if (isCorrect) {
      let multiplier = 10;
      if (currentQ.difficulty === 'medium') multiplier = 20;
      if (currentQ.difficulty === 'hard') multiplier = 30;
      
      const speedRatio = timeLeftMs / timeLimitMs;
      const speedBonus = Math.round(speedRatio * 10);
      
      setScore(prev => prev + multiplier + speedBonus);
      playSynthSound('correct', soundEnabled);
    } else {
      playSynthSound('incorrect', soundEnabled);
      if (suddenDeath) {
        setTimeout(() => handleGameOver(), 1500);
        return;
      }
    }
  };

  const prevQuestion = () => {
    if (qIndex > 0) {
      playSynthSound('click', soundEnabled);
      setQIndex(prev => prev - 1);
      const prevAns = userAnswers[qIndex - 1];
      setSelectedAnswer(prevAns);
      setHasAnsweredCurrent(prevAns !== null);
      setTimeLeftMs(timeLimitMs);
    }
  };

  const skipQuestion = () => {
    if (hasAnsweredCurrent) return;
    playSynthSound('click', soundEnabled);
    
    clearInterval(timerIntervalRef.current);
    setHasAnsweredCurrent(true);
    const updatedAnswers = [...userAnswers];
    updatedAnswers[qIndex] = 'Skipped ⚡';
    setUserAnswers(updatedAnswers);
  };

  const nextQuestion = () => {
    playSynthSound('click', soundEnabled);
    if (qIndex < questions.length - 1) {
      setQIndex(prev => prev + 1);
      const nextAns = userAnswers[qIndex + 1];
      setSelectedAnswer(nextAns || '');
      setHasAnsweredCurrent(nextAns !== null);
      setTimeLeftMs(timeLimitMs);
    } else {
      handleGameOver();
    }
  };

  const restartQuiz = async () => {
    playSynthSound('click', soundEnabled);
    setLoading(true);
    
    const categoryParam = category !== 'any' ? `&category=${category}` : '';
    const url = `https://opentdb.com/api.php?amount=10${categoryParam}&difficulty=${difficulty}&type=multiple`;
    
    let loadedQuestions = [];
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.response_code === 0 && data.results && data.results.length > 0) {
        loadedQuestions = data.results.map((q) => {
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
            options,
            explanation: `The correct answer is indeed <strong>${correct}</strong>. Excellent technical review!`
          };
        });
      } else throw new Error();
    } catch (e) {
      const selectElem = document.getElementById('r-category-select');
      loadedQuestions = getOfflineQuestions(difficulty, category, selectElem);
    }
    
    setLoading(false);
    if (loadedQuestions && loadedQuestions.length > 0) {
      setQuestions(loadedQuestions);
      setQIndex(0);
      setScore(0);
      setUserAnswers(new Array(loadedQuestions.length).fill(null));
      setHasAnsweredCurrent(false);
      setSelectedAnswer('');
      setTimeLeftMs(timeLimitMs);
      setGameState('playing');
    }
  };

  // Render Category Select Dropdown options
  const categoryOptions = categoriesList.map((cat) => (
    <option key={cat.id} value={cat.id}>{cat.name}</option>
  ));

  // Game UI - MENU / WELCOME SCREEN
  if (gameState === 'menu') {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30">
        <div className="text-center mb-8">
          <Trophy size={64} className="mx-auto text-blue-500 mb-4 animate-bounce" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">BrainBurst Challenger</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Scale up your analytical and technical knowledge with direct category questions, animated timer modules, and visual leaderboards.</p>
        </div>

        <form onSubmit={startQuiz} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 pl-1">Enter Your Name</label>
            <input 
              type="text" 
              required 
              placeholder="e.g., Anamika" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full px-5 py-3.5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 backdrop-blur-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 pl-1">Select Category</label>
              <select 
                id="r-category-select"
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full px-5 py-3.5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 backdrop-blur-sm transition-all"
              >
                {categoryOptions}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 pl-1">Select Difficulty</label>
              <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button 
                    key={level} 
                    type="button"
                    onClick={() => { playSynthSound('click', soundEnabled); setDifficulty(level); }}
                    className={`py-2 rounded-xl text-sm font-bold capitalize transition-all ${difficulty === level ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 dark:bg-gray-900/30 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold flex items-center gap-2 text-gray-800 dark:text-white text-sm"><Skull className="text-red-500" size={16} /> Sudden Death Mode</h3>
                <p className="text-xs text-gray-400 mt-0.5">One incorrect answer or time out triggers an instant game over.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={suddenDeath} onChange={() => { playSynthSound('click', soundEnabled); setSuddenDeath(!suddenDeath); }} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Preparing Challenge...</span>
            ) : (
              <>
                <Play size={20} /> START CHALLENGE
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Game UI - ACTIVE RUNTIME PLAYING SCREEN
  if (gameState === 'playing') {
    const currentQ = questions[qIndex];
    const isLowTime = timeLeftMs <= 5000 && !hasAnsweredCurrent;
    const progressPercentage = ((qIndex + 1) / questions.length) * 100;
    const circularDashOffset = 276.4 * (1 - (timeLeftMs / timeLimitMs));
    
    const difficultyBadgeClass = currentQ.difficulty === 'easy' 
      ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300' 
      : currentQ.difficulty === 'medium'
      ? 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300'
      : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300';

    return (
      <div className="max-w-3xl mx-auto mt-6 p-4">
        {/* Visual Header progress indicator bar */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
        </div>

        <div className="flex justify-between items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 mb-6 relative">
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Active Progress</span>
            <h3 className="text-lg font-black text-gray-800 dark:text-white">Question {qIndex + 1} of {questions.length}</h3>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              title="Toggle Audio Feedback"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {/* Circular Countdown Timer */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className={`w-full h-full transform -rotate-90 ${isLowTime ? 'animate-pulse' : ''}`} viewBox="0 0 100 100">
                <circle className="text-gray-100 dark:text-gray-800" strokeWidth="6" stroke="currentColor" fill="none" cx="50" cy="50" r="44" />
                <circle 
                  className={isLowTime ? 'text-red-500' : 'text-blue-500'} 
                  strokeWidth="6" strokeLinecap="round" stroke="currentColor" fill="none" cx="50" cy="50" r="44"
                  strokeDasharray="276.4" 
                  strokeDashoffset={circularDashOffset}
                  style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
              </svg>
              <span className={`absolute text-base font-black ${isLowTime ? 'text-red-500 animate-bounce' : 'text-gray-800 dark:text-white'}`}>
                {Math.ceil(timeLeftMs / 1000)}
              </span>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20 dark:border-gray-700/30 relative">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">{currentQ.category}</span>
            <span className={`px-3.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider capitalize ${difficultyBadgeClass}`}>{currentQ.difficulty}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mb-8 leading-snug">{currentQ.question}</h2>

          {/* Option Grid */}
          <div className="flex flex-col gap-4">
            {currentQ.options.map((opt, idx) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isSelected = selectedAnswer === opt;
              const isCorrectOption = opt === currentQ.correct_answer;
              const userAnsForThis = userAnswers[qIndex];
              const isAnyAnswered = userAnsForThis !== null;
              
              let btnClass = "w-full text-left p-4.5 rounded-2xl border font-bold text-base transition-all flex items-center justify-between relative overflow-hidden ";
              
              if (!isAnyAnswered) {
                btnClass += "bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 cursor-pointer";
              } else {
                btnClass += "cursor-default ";
                if (isCorrectOption) {
                  btnClass += "bg-green-100/80 border-green-500 text-green-800 dark:bg-green-950/50 dark:border-green-500 dark:text-green-200 font-extrabold shadow-sm";
                } else if (isSelected && !isCorrectOption) {
                  btnClass += "bg-red-100/80 border-red-500 text-red-800 dark:bg-red-950/50 dark:border-red-500 dark:text-red-200";
                } else {
                  btnClass += "opacity-45 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600";
                }
              }

              return (
                <button 
                  key={idx} 
                  disabled={isAnyAnswered}
                  onClick={() => handleSelectOption(opt)} 
                  className={btnClass}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${isCorrectOption && isAnyAnswered ? 'bg-green-500 text-white' : isSelected && isAnyAnswered ? 'bg-red-500 text-white' : 'bg-gray-200/50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                      {letters[idx]}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnyAnswered && isCorrectOption && <CheckCircle2 className="text-green-500" size={20} />}
                  {isAnyAnswered && isSelected && !isCorrectOption && <XCircle className="text-red-500" size={20} />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          <AnimatePresence>
            {hasAnsweredCurrent && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 15 }}
                className="mt-6 p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex gap-4"
              >
                <div className="text-2xl mt-0.5">
                  {userAnswers[qIndex] === currentQ.correct_answer ? '✨' : '💡'}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-800 dark:text-white uppercase tracking-wider mb-1">
                    {userAnswers[qIndex] === currentQ.correct_answer ? 'Absolutely Correct!' : userAnswers[qIndex] === 'Time Out ⏰' ? 'Time is Up! ⏰' : 'Incorrect Answer'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQ.explanation }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-150 dark:border-gray-850">
            <button 
              onClick={prevQuestion} 
              disabled={qIndex === 0}
              className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>

            <button 
              onClick={skipQuestion} 
              disabled={hasAnsweredCurrent}
              className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-850 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Skip ⚡
            </button>

            <button 
              onClick={nextQuestion} 
              disabled={!hasAnsweredCurrent}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
            >
              {qIndex === questions.length - 1 ? 'Finish Quiz 🏁' : 'Next Question →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game UI - RESULTS & LEADERBOARD & Technical review
  if (gameState === 'result') {
    const correctCount = questions.reduce((acc, q, idx) => acc + (userAnswers[idx] === q.correct_answer ? 1 : 0), 0);
    const wrongCount = questions.length - correctCount;
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    
    // Manage Leaderboard boarding local storage
    let leaderboard = [];
    try {
      leaderboard = JSON.parse(localStorage.getItem('brainburst_leaderboard')) || [];
    } catch(e) {
      leaderboard = [];
    }

    const isNewHighScore = leaderboard.length === 0 || score > leaderboard[0].score;

    return (
      <div className="max-w-4xl mx-auto mt-6 p-4">
        {/* Metric Scoreboard Card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20 dark:border-gray-700/30 text-center mb-8">
          <Trophy size={72} className={`mx-auto mb-6 ${accuracy >= 80 ? 'text-yellow-400 animate-bounce' : 'text-gray-400'}`} />
          <h2 className="text-3xl font-black text-gray-950 dark:text-white uppercase tracking-wider">
            {accuracy >= 80 ? 'Brilliant Performance! 🏆' : accuracy >= 50 ? 'Great Effort! 🌟' : 'Keep Learning! 💪'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto font-medium">
            Excellent job {username}! You scored a high accuracy count and demonstrated deep trivia retention. Check your diagnostic metrics below.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-50/50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-850 p-5 rounded-2xl">
              <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">{score}</span>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Points</span>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-850 p-5 rounded-2xl">
              <span className="block text-2xl font-black text-green-500">{correctCount}</span>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Correct</span>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-850 p-5 rounded-2xl">
              <span className="block text-2xl font-black text-red-500">{wrongCount}</span>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Wrong</span>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-850 p-5 rounded-2xl">
              <span className="block text-2xl font-black text-indigo-500 dark:text-indigo-400">{accuracy}%</span>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Accuracy</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top 5 Leaderboard board panel */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/30">
            <h3 className="text-lg font-black text-gray-900 dark:text-white border-b border-gray-150 dark:border-gray-850 pb-3 mb-4 flex items-center gap-2"><Award size={18} className="text-yellow-500" /> TOP HALL OF FAME</h3>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No records saved. Set the first highscore!</p>
            ) : (
              <ol className="space-y-3">
                {leaderboard.slice(0, 5).map((entry, index) => {
                  const rankEmojis = ['🥇', '🥈', '🥉', '4th', '5th'];
                  return (
                    <li key={index} className="flex justify-between items-center px-4 py-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-850 text-sm font-bold">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-6">{rankEmojis[index] || index + 1}</span>
                        <span className="text-gray-800 dark:text-gray-200">{entry.name}</span>
                      </div>
                      <span className="text-green-600 dark:text-green-400 font-extrabold">{entry.score} pts</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Quick options and diagnostic panel */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/30 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white border-b border-gray-150 dark:border-gray-850 pb-3 mb-4 flex items-center gap-2"><HelpCircle size={18} className="text-blue-500" /> WHAT'S NEXT?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                You can review each question along with diagnostic correct details below. Feel free to re-configure the settings or start a new challenge to test your high scores.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={restartQuiz} 
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] shadow-md shadow-blue-500/20"
              >
                <RotateCcw size={18} /> Restart Quiz
              </button>
              <button 
                onClick={() => { playSynthSound('click', soundEnabled); setGameState('menu'); }}
                className="w-full py-3.5 border border-gray-200 dark:border-gray-850 text-gray-800 dark:text-gray-200 font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <Home size={18} /> Change Settings
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable diagnostic answers review list */}
        <div className="mt-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/30">
          <h3 className="text-lg font-black text-gray-900 dark:text-white text-center pb-4 border-b border-gray-150 dark:border-gray-850 mb-6">🔍 COMPREHENSIVE ANSWER REVIEW</h3>
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
            {questions.map((q, index) => {
              const ans = userAnswers[index];
              const isCorrect = ans === q.correct_answer;
              
              return (
                <div key={index} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-850 space-y-3">
                  <div className="text-base font-extrabold text-gray-900 dark:text-white leading-snug">{index + 1}. {q.question}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isCorrect ? (
                      <div className="p-3 bg-green-50/50 dark:bg-green-950/20 border border-green-300 dark:border-green-800/50 text-green-700 dark:text-green-300 rounded-xl text-sm font-bold">
                        <span className="block text-xs text-green-500 font-extrabold uppercase mb-1">Your Correct Answer</span>
                        <span>{ans}</span>
                      </div>
                    ) : (
                      <>
                        <div className={`p-3 border rounded-xl text-sm font-bold ${ans === 'Skipped ⚡' || ans === 'Time Out ⏰' ? 'bg-gray-100/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-750 text-gray-500 dark:text-gray-400' : 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-800/50 text-red-700 dark:text-red-300'}`}>
                          <span className="block text-xs font-extrabold uppercase mb-1">{ans === 'Skipped ⚡' ? 'Skipped' : ans === 'Time Out ⏰' ? 'Timed Out' : 'Your Answer'}</span>
                          <span>{ans}</span>
                        </div>
                        <div className="p-3 bg-green-50/50 dark:bg-green-950/20 border border-green-300 dark:border-green-800/50 text-green-700 dark:text-green-300 rounded-xl text-sm font-bold">
                          <span className="block text-xs text-green-500 font-extrabold uppercase mb-1">Correct Answer</span>
                          <span>{q.correct_answer}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed border-t border-gray-150 dark:border-gray-850 pt-2.5">
                    <strong>Explanation:</strong> <span dangerouslySetInnerHTML={{ __html: q.explanation }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
