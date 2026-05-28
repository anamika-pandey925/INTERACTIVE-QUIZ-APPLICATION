import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, AlertTriangle, CheckCircle2, XCircle, Skull, Trophy, Play } from 'lucide-react';

const mockQuestions = [
  { question: "What is the speed of light?", options: ["299,792 km/s", "150,000 km/s", "1,000,000 km/s", "343 m/s"], answer: "299,792 km/s" },
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: "Mars" },
  { question: "What is the capital of Japan?", options: ["Seoul", "Beijing", "Tokyo", "Bangkok"], answer: "Tokyo" },
  { question: "Who painted the Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"], answer: "Leonardo da Vinci" },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: "Pacific" }
];

export default function AdvancedTimerQuiz() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, result
  const [suddenDeath, setSuddenDeath] = useState(false);
  
  // Game State
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);
  
  // Timers
  const globalTimeTotal = 120; // 2 minutes total
  const [globalTime, setGlobalTime] = useState(globalTimeTotal);
  
  const questionTimeTotal = 15; // 15s per question
  const [questionTime, setQuestionTime] = useState(questionTimeTotal);

  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');

  const globalTimerRef = useRef(null);
  const questionTimerRef = useRef(null);

  // Start Timers
  useEffect(() => {
    if (gameState === 'playing' && !isAnswered) {
      globalTimerRef.current = setInterval(() => {
        setGlobalTime(prev => {
          if (prev <= 1) {
            handleGameOver("Global time ran out!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      questionTimerRef.current = setInterval(() => {
        setQuestionTime(prev => {
          if (prev <= 1) {
            clearInterval(questionTimerRef.current);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(globalTimerRef.current);
      clearInterval(questionTimerRef.current);
    };
  }, [gameState, isAnswered]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    if (suddenDeath) {
      setTimeout(() => handleGameOver("Sudden Death! You ran out of time!"), 1500);
    } else {
      setTimeout(() => nextQuestion(), 2000);
    }
  };

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    
    clearInterval(questionTimerRef.current);
    setIsAnswered(true);
    setSelectedAnswer(opt);

    const isCorrect = opt === mockQuestions[qIndex].answer;
    
    if (isCorrect) {
      setScore(prev => prev + 100);
      
      // Calculate Time Bonus
      const bonus = Math.floor((questionTime / questionTimeTotal) * 50);
      setBonusPoints(prev => prev + bonus);
      
      setTimeout(() => nextQuestion(), 1500);
    } else {
      if (suddenDeath) {
        setTimeout(() => handleGameOver("Sudden Death! Wrong answer!"), 1500);
      } else {
        setTimeout(() => nextQuestion(), 1500);
      }
    }
  };

  const nextQuestion = () => {
    if (qIndex < mockQuestions.length - 1) {
      setQIndex(prev => prev + 1);
      setQuestionTime(questionTimeTotal);
      setIsAnswered(false);
      setSelectedAnswer('');
    } else {
      handleGameOver("Quiz Completed!");
    }
  };

  const handleGameOver = (reason) => {
    clearInterval(globalTimerRef.current);
    clearInterval(questionTimerRef.current);
    setGameState('result');
  };

  const startGame = () => {
    setQIndex(0);
    setScore(0);
    setBonusPoints(0);
    setGlobalTime(globalTimeTotal);
    setQuestionTime(questionTimeTotal);
    setIsAnswered(false);
    setSelectedAnswer('');
    setGameState('playing');
  };

  // Format time MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (gameState === 'menu') {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <Clock size={64} className="mx-auto text-blue-500 mb-4" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-wider">Time Attack Mode</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Test your speed and accuracy under extreme pressure.</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold flex items-center gap-2 text-gray-800 dark:text-white"><Skull className="text-red-500" size={18} /> Sudden Death Mode</h3>
              <p className="text-sm text-gray-500">One mistake or timeout = Instant Game Over.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={suddenDeath} onChange={() => setSuddenDeath(!suddenDeath)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm text-center">
              <span className="block text-xs uppercase text-gray-400 font-bold">Global Time</span>
              <span className="block text-2xl font-black text-blue-500">{formatTime(globalTimeTotal)}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm text-center">
              <span className="block text-xs uppercase text-gray-400 font-bold">Per Question</span>
              <span className="block text-2xl font-black text-orange-500">{questionTimeTotal}s</span>
            </div>
          </div>
        </div>

        <button onClick={startGame} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 text-xl">
          <Play size={24} /> START CHALLENGE
        </button>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
        <Trophy size={80} className="mx-auto text-yellow-400 mb-6 drop-shadow-lg" />
        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase mb-2">Game Over</h2>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 my-8 space-y-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
            <span className="text-gray-500 font-bold uppercase text-sm">Base Score</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">{score}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
            <span className="text-gray-500 font-bold uppercase text-sm flex items-center gap-1"><Zap size={14} className="text-yellow-500"/> Time Bonus</span>
            <span className="text-xl font-black text-yellow-500">+{bonusPoints}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-800 dark:text-white font-black uppercase text-lg">Total Score</span>
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{score + bonusPoints}</span>
          </div>
        </div>

        <button onClick={() => setGameState('menu')} className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-transform hover:scale-[1.02]">
          Play Again
        </button>
      </div>
    );
  }

  const currentQ = mockQuestions[qIndex];
  const isLowTime = questionTime <= 5 && !isAnswered;
  const globalProgress = (globalTime / globalTimeTotal) * 100;
  const questionProgress = (questionTime / questionTimeTotal) * 100;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      
      {/* Global Status Bar */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-gray-100 dark:bg-gray-800 w-full">
          <motion.div 
            animate={{ width: `${globalProgress}%` }}
            className={`h-full ${globalTime <= 30 ? 'bg-red-500' : 'bg-blue-500'}`}
          />
        </div>
        <div className="flex items-center gap-2 font-bold text-gray-500">
          <Trophy size={18} className="text-yellow-500" /> Score: <span className="text-gray-900 dark:text-white text-xl">{score + bonusPoints}</span>
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold text-lg ${globalTime <= 30 ? 'text-red-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
          <Clock size={18} /> {formatTime(globalTime)}
        </div>
        {suddenDeath && (
          <div className="flex items-center gap-1 text-xs font-black bg-red-100 text-red-600 px-2 py-1 rounded uppercase">
            <Skull size={12} /> Sudden Death
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        
        {/* Animated Low Time Warning Overlay */}
        <AnimatePresence>
          {isLowTime && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 border-8 border-red-500 rounded-3xl pointer-events-none z-10"
              transition={{ repeat: Infinity, duration: 0.5, direction: "reverse" }}
            />
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mb-8">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Question {qIndex + 1} of {mockQuestions.length}</span>
          
          {/* Circular Question Timer */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-gray-100 dark:text-gray-700" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <motion.path 
                className={isLowTime ? 'text-red-500' : 'text-orange-500'}
                strokeWidth="3" strokeDasharray={`${questionProgress}, 100`} strokeLinecap="round" stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                animate={{ strokeDasharray: `${questionProgress}, 100` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <span className={`absolute text-xl font-black ${isLowTime ? 'text-red-500 animate-bounce' : 'text-gray-900 dark:text-white'}`}>
              {questionTime}
            </span>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
          {currentQ.question}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswer === opt;
            const isCorrectOption = opt === currentQ.answer;
            
            let btnClass = "p-4 text-left rounded-xl border-2 font-semibold text-lg transition-all relative overflow-hidden ";
            
            if (!isAnswered) {
              btnClass += "border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer";
            } else {
              btnClass += "cursor-default ";
              if (isCorrectOption) {
                btnClass += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/40 dark:border-green-500 dark:text-green-200 z-10 scale-[1.02] shadow-lg";
              } else if (isSelected && !isCorrectOption) {
                btnClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/40 dark:border-red-500 dark:text-red-200";
              } else {
                btnClass += "opacity-40 border-gray-200 dark:border-gray-700";
              }
            }

            return (
              <button 
                key={idx}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
                className={btnClass}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  {isAnswered && isCorrectOption && <CheckCircle2 className="text-green-500" />}
                  {isAnswered && isSelected && !isCorrectOption && <XCircle className="text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Time Bonus Pop-up Animation */}
        <AnimatePresence>
          {isAnswered && selectedAnswer === currentQ.answer && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-black text-xl shadow-2xl flex items-center gap-2 border-4 border-white z-20"
            >
              <Zap size={24} /> +{Math.floor((questionTime / questionTimeTotal) * 50)} TIME BONUS!
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
