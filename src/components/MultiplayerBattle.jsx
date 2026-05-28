import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { Users, Swords, Trophy, Clock, Zap, Crown, User, AlertCircle } from 'lucide-react';

export default function MultiplayerBattle() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [gameState, setGameState] = useState('lobby'); // lobby, waiting, playing, finished
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);

  // Timer Ref
  const timerRef = useRef(null);

  useEffect(() => {
    // Note: Assuming backend runs on 5000
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('roomJoined', (roomData) => {
      setPlayers(roomData.players);
      setGameState('waiting');
      setErrorMsg('');
    });

    newSocket.on('error', (msg) => {
      setErrorMsg(msg);
    });

    newSocket.on('gameStarted', (data) => {
      setCurrentQuestion(data.question);
      setTotalQuestions(data.totalQuestions);
      setPlayers(data.players);
      setGameState('playing');
      setQuestionIndex(0);
      setIsAnswered(false);
      setSelectedAnswer('');
      startTimer();
    });

    newSocket.on('nextQuestion', (question) => {
      setCurrentQuestion(question);
      setQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer('');
      startTimer();
    });

    newSocket.on('scoreUpdated', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    newSocket.on('gameOver', (finalPlayers) => {
      setPlayers(finalPlayers);
      setGameState('finished');
      clearInterval(timerRef.current);
      triggerConfetti();
    });

    newSocket.on('playerDisconnected', (msg) => {
      setErrorMsg(msg);
      setGameState('finished');
      clearInterval(timerRef.current);
    });

    return () => {
      newSocket.disconnect();
      clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = () => {
    if (!isAnswered && socket) {
      setIsAnswered(true);
      socket.emit('submitAnswer', { roomCode, answer: null });
    }
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = () => {
    if (!username) return setErrorMsg("Enter a username");
    const code = generateRoomCode();
    setRoomCode(code);
    socket.emit('createRoom', { username, roomCode: code });
  };

  const joinRoom = () => {
    if (!username) return setErrorMsg("Enter a username");
    if (!roomCode) return setErrorMsg("Enter a room code");
    socket.emit('joinRoom', { username, roomCode: roomCode.toUpperCase() });
  };

  const submitAnswer = (answer) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(answer);
    clearInterval(timerRef.current);
    socket.emit('submitAnswer', { roomCode, answer });
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // --- RENDERING ---

  if (gameState === 'lobby') {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <Swords size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Quiz Battle</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Challenge your friends in real-time!</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm font-medium">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                placeholder="e.g. CodeNinja"
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              onClick={createRoom}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Zap size={18} /> Create New Game
            </button>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-gray-800 px-4 text-sm text-gray-500 uppercase tracking-widest">Or</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 outline-none text-center font-mono font-bold tracking-widest uppercase"
              placeholder="CODE"
            />
            <button 
              onClick={joinRoom}
              className="bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-bold px-6 rounded-xl transition-colors shadow-md"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'waiting') {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
        <Users size={64} className="mx-auto text-indigo-500 mb-6 animate-bounce" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Waiting for opponent...</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Share this code with your friend to play.</p>
        
        <div className="bg-gray-100 dark:bg-gray-900 py-4 px-6 rounded-xl inline-block mb-8 shadow-inner">
          <span className="text-4xl font-mono font-black text-indigo-600 dark:text-indigo-400 tracking-[0.2em]">{roomCode}</span>
        </div>

        <div className="text-left bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Players joined</h4>
          {players.map((p, i) => (
            <div key={i} className="flex items-center gap-3 mb-2 font-medium">
              <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                {p.username.charAt(0).toUpperCase()}
              </div>
              {p.username} {p.id === socket.id ? '(You)' : ''}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const winner = [...players].sort((a, b) => b.score - a.score)[0];
    const isTie = players.length > 1 && players[0].score === players[1].score;
    const amIWinner = winner.id === socket?.id && !isTie;

    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
        {amIWinner ? (
          <Crown size={80} className="mx-auto text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
        ) : isTie ? (
          <Swords size={80} className="mx-auto text-gray-400 mb-6" />
        ) : (
          <Trophy size={80} className="mx-auto text-gray-400 mb-6" />
        )}
        
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          {errorMsg ? errorMsg : (isTie ? "It's a Tie!" : amIWinner ? "You Won!" : "You Lost")}
        </h2>
        
        <div className="my-10 flex justify-center items-center gap-8 md:gap-16">
          {players.map((p, i) => {
            const isWinner = p.id === winner.id && !isTie;
            return (
              <div key={i} className={`flex flex-col items-center ${isWinner ? 'scale-110' : 'opacity-80'}`}>
                <div className={`relative w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 shadow-lg ${isWinner ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>
                  {isWinner && <Crown size={24} className="absolute -top-4 -right-2 text-yellow-500 rotate-12 drop-shadow-md" />}
                  {p.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-lg">{p.username}</span>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{p.score} <span className="text-sm font-medium text-gray-500 uppercase">pts</span></span>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => {
            setGameState('lobby');
            setRoomCode('');
            setPlayers([]);
          }}
          className="bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
        >
          Play Again
        </button>
      </div>
    );
  }

  if (currentQuestion) {
    // Playing State
    const myScore = players.find(p => p.id === socket?.id)?.score || 0;
    const oppScore = players.find(p => p.id !== socket?.id)?.score || 0;
    const oppName = players.find(p => p.id !== socket?.id)?.username || 'Opponent';

    return (
      <div className="max-w-4xl mx-auto mt-6 p-4 md:p-8">
        
        {/* Battle Header - Live Leaderboard & Timer */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-start">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">You</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{myScore}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-full border-4 ${timeLeft <= 5 ? 'border-red-500 text-red-500' : 'border-indigo-500 text-indigo-500'} bg-white dark:bg-gray-800 shadow-inner z-10`}>
              <span className="text-xl font-bold font-mono">{timeLeft}</span>
            </div>
            <span className="text-xs font-semibold text-gray-500 mt-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              Q {questionIndex + 1} / {totalQuestions}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{oppName}</span>
              <span className="text-2xl font-black text-red-500">{oppScore}</span>
            </div>
          </div>
          
        </div>

        {/* Question Area */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center leading-tight">
            {currentQuestion.question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              let btnClass = "relative p-4 md:p-6 text-left rounded-2xl border-2 transition-all font-semibold text-lg overflow-hidden ";
              
              if (!isAnswered) {
                btnClass += "border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer shadow-sm hover:shadow-md";
              } else {
                btnClass += "cursor-default opacity-90 ";
                if (isSelected) {
                  btnClass += "border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200";
                } else {
                  btnClass += "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 text-gray-500";
                }
              }

              return (
                <button 
                  key={idx}
                  onClick={() => submitAnswer(opt)}
                  disabled={isAnswered}
                  className={btnClass}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-8 text-center animate-pulse text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-2">
              <Clock size={18} /> Waiting for opponent...
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
