import React, { useState, useEffect } from 'react';
import { BrainCircuit, Loader2, Clock, CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function AIGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  
  // Quiz Player State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizComplete, setQuizComplete] = useState(false);

  const generateQuiz = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      // Note: Assumes backend is running on port 5000
      const response = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, numQuestions: 5 })
      });
      
      const data = await response.json();
      if (data.success && data.questions) {
        setQuizData(data.questions);
        resetPlayer();
      } else {
        alert('Failed to generate quiz. Check backend connection and API key.');
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to AI Server. Is the backend running on port 5000?');
      // For demo purposes, use mock data if backend fails
      setQuizData([
        {
          question: `Sample ${difficulty} question about ${topic}? (Backend not connected)`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          explanation: 'This is a mock explanation because the backend failed to connect.'
        }
      ]);
      resetPlayer();
    } finally {
      setLoading(false);
    }
  };

  const resetPlayer = () => {
    setCurrentQIndex(0);
    setSelectedAnswer('');
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(30);
    setQuizComplete(false);
  };

  useEffect(() => {
    if (!quizData || quizComplete || isAnswered) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizData, currentQIndex, quizComplete, isAnswered]);

  const handleTimeOut = () => {
    setIsAnswered(true);
  };

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    if (option === quizData[currentQIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQIndex < quizData.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedAnswer('');
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setQuizComplete(true);
    }
  };

  if (quizComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
        <BrainCircuit size={64} className="mx-auto text-blue-500 mb-6" />
        <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Topic: {topic} ({difficulty})</p>
        
        <div className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-8">
          {score} / {quizData.length}
        </div>
        
        <button 
          onClick={() => setQuizData(null)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCw size={20} /> Generate New Quiz
        </button>
      </div>
    );
  }

  if (quizData) {
    const currentQ = quizData[currentQIndex];
    return (
      <div className="max-w-3xl mx-auto mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full">
            Question {currentQIndex + 1} of {quizData.length}
          </span>
          <div className="flex items-center gap-2 font-mono text-lg font-bold text-orange-500">
            <Clock size={20} /> 00:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white leading-tight">
          {currentQ.question}
        </h3>

        <div className="grid grid-cols-1 gap-3 mb-8">
          {currentQ.options.map((opt, idx) => {
            let btnClass = "border-2 text-left px-5 py-4 rounded-xl font-medium transition-all ";
            
            if (!isAnswered) {
              btnClass += "border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer";
            } else {
              btnClass += "cursor-default ";
              if (opt === currentQ.correctAnswer) {
                btnClass += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/40 dark:border-green-500 dark:text-green-200";
              } else if (opt === selectedAnswer) {
                btnClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/40 dark:border-red-500 dark:text-red-200";
              } else {
                btnClass += "opacity-50 border-gray-200 dark:border-gray-700";
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
                  {isAnswered && opt === currentQ.correctAnswer && <CheckCircle2 className="text-green-500" />}
                  {isAnswered && opt === selectedAnswer && opt !== currentQ.correctAnswer && <XCircle className="text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 mb-6 border border-blue-100 dark:border-blue-800">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Explanation:</h4>
            <p className="text-blue-900 dark:text-blue-100">{currentQ.explanation}</p>
          </div>
        )}

        {isAnswered && (
          <button 
            onClick={nextQuestion}
            className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
          >
            {currentQIndex < quizData.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight size={20} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="bg-blue-100 dark:bg-blue-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BrainCircuit size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Quiz Generator</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Enter any topic and let AI generate a custom quiz for you.</p>
        </div>

        <form onSubmit={generateQuiz} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. React Hooks, World War 2, Astrophysics" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {['Easy', 'Medium', 'Hard'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 rounded-lg font-medium transition-colors ${difficulty === lvl ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !topic.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-lg font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" /> Generating...</> : <><BrainCircuit /> Generate Magic Quiz</>}
          </button>
        </form>
      </div>
    </div>
  );
}
