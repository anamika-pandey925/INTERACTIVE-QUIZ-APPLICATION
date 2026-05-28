import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Code2, HelpCircle, Star, Target, CheckCircle2, XCircle, ChevronRight, Play, Bookmark, BarChart } from 'lucide-react';

const MOCK_CODING_CHALLENGES = [
  {
    id: 1,
    topic: 'Algorithms',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    initialCode: 'function twoSum(nums, target) {\n  // Write your code here\n  \n}',
    explanation: 'A brute force approach is O(n^2), but you can achieve O(n) using a hash map to store previously seen numbers and their indices.',
  },
  {
    id: 2,
    topic: 'Data Structures',
    title: 'Reverse Linked List',
    difficulty: 'Medium',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    initialCode: '/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nfunction reverseList(head) {\n  \n}',
    explanation: 'Maintain three pointers: prev, current, and next. Iterate through the list, changing current.next to prev, then moving prev and current one step forward.',
  }
];

const MOCK_MCQ_QUESTIONS = [
  {
    id: 101,
    topic: 'React.js',
    difficulty: 'Medium',
    question: 'What is the primary purpose of the useEffect hook in React?',
    options: [
      'To manage complex local state',
      'To perform side effects in function components',
      'To cache expensive calculations',
      'To directly manipulate the DOM'
    ],
    answer: 'To perform side effects in function components',
    explanation: 'useEffect is used for side effects like data fetching, subscriptions, or manually changing the DOM in React components.'
  },
  {
    id: 102,
    topic: 'System Design',
    difficulty: 'Hard',
    question: 'Which of the following is the primary benefit of sharding a database?',
    options: [
      'Improves data consistency',
      'Provides horizontal scalability',
      'Reduces storage requirements',
      'Simplifies database joins'
    ],
    answer: 'Provides horizontal scalability',
    explanation: 'Sharding distributes data across multiple machines, allowing the database to scale horizontally to handle more traffic and data.'
  }
];

export default function InterviewPrep() {
  const [view, setView] = useState('dashboard'); // dashboard, coding, mcq, mock
  
  // Dashboard Analytics State
  const [stats, setStats] = useState({
    mcqCompleted: 45,
    codingCompleted: 12,
    mockInterviews: 3,
    accuracy: 82
  });

  // Saved/Favorites
  const [favorites, setFavorites] = useState([101, 1]); // IDs of saved questions

  // MCQ State
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [mcqAnswered, setMcqAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');

  // Coding State
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [codeValue, setCodeValue] = useState(MOCK_CODING_CHALLENGES[0].initialCode);
  const [showCodeExplanation, setShowCodeExplanation] = useState(false);

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleMCQSelect = (option) => {
    if (mcqAnswered) return;
    setSelectedOption(option);
    setMcqAnswered(true);
  };

  const nextMCQ = () => {
    if (currentMCQIndex < MOCK_MCQ_QUESTIONS.length - 1) {
      setCurrentMCQIndex(prev => prev + 1);
      setMcqAnswered(false);
      setSelectedOption('');
    } else {
      setView('dashboard');
    }
  };

  const submitCode = () => {
    // In a real app, this would run against test cases
    setShowCodeExplanation(true);
  };

  if (view === 'dashboard') {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 mt-4 font-sans">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
            <Briefcase className="text-blue-600" size={36} /> Interview Prep Hub
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Master algorithms, system design, and frontend concepts.</p>
        </header>

        {/* Analytics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<HelpCircle className="text-purple-500"/>} title="MCQs Solved" value={stats.mcqCompleted} />
          <StatCard icon={<Code2 className="text-blue-500"/>} title="Code Challenges" value={stats.codingCompleted} />
          <StatCard icon={<Target className="text-red-500"/>} title="Mock Interviews" value={stats.mockInterviews} />
          <StatCard icon={<BarChart className="text-green-500"/>} title="Avg. Accuracy" value={`${stats.accuracy}%`} />
        </div>

        {/* Action Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <ActionCard 
            title="MCQ Training" 
            desc="Topic-wise multiple choice questions for rapid fire concept checking." 
            icon={<HelpCircle size={32} className="text-purple-500" />}
            onClick={() => {
              setCurrentMCQIndex(0);
              setMcqAnswered(false);
              setSelectedOption('');
              setView('mcq');
            }}
            bg="bg-purple-50 dark:bg-purple-900/10 hover:border-purple-500"
          />

          <ActionCard 
            title="Coding Arena" 
            desc="Solve algorithmic challenges with our integrated Monaco Editor." 
            icon={<Code2 size={32} className="text-blue-500" />}
            onClick={() => {
              setCurrentCodeIndex(0);
              setCodeValue(MOCK_CODING_CHALLENGES[0].initialCode);
              setShowCodeExplanation(false);
              setView('coding');
            }}
            bg="bg-blue-50 dark:bg-blue-900/10 hover:border-blue-500"
          />

          <ActionCard 
            title="Mock Interview" 
            desc="Simulated 45-minute timed sessions combining coding and theory." 
            icon={<Briefcase size={32} className="text-gray-800 dark:text-gray-200" />}
            onClick={() => alert("Mock Interview feature coming soon!")}
            bg="bg-gray-100 dark:bg-gray-800/50 hover:border-gray-500"
          />

        </div>

        {/* Saved Topics / Recommended */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Star className="text-yellow-500" /> Saved For Review
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              <SavedListItem title="Two Sum" type="Coding" diff="Easy" />
              <SavedListItem title="React useEffect Purpose" type="MCQ" diff="Medium" />
            </ul>
          </div>
        </div>

      </div>
    );
  }

  if (view === 'mcq') {
    const q = MOCK_MCQ_QUESTIONS[currentMCQIndex];
    const isFav = favorites.includes(q.id);

    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 mt-4">
        <button onClick={() => setView('dashboard')} className="text-sm font-bold text-blue-600 mb-6 flex items-center">
          ← Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-lg mb-2 mr-2">
                {q.topic}
              </span>
              <DifficultyBadge level={q.difficulty} />
            </div>
            <button onClick={() => toggleFavorite(q.id)} className={`p-2 rounded-full transition-colors ${isFav ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-400 hover:text-yellow-500 dark:bg-gray-700'}`}>
              <Bookmark size={20} fill={isFav ? "currentColor" : "none"} />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === q.answer;
              
              let btnClass = "w-full text-left p-4 rounded-xl border-2 font-medium transition-all ";
              if (!mcqAnswered) {
                btnClass += "border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer";
              } else {
                btnClass += "cursor-default ";
                if (isCorrect) btnClass += "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-300";
                else if (isSelected) btnClass += "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-300";
                else btnClass += "opacity-50 border-gray-200 dark:border-gray-700";
              }

              return (
                <button key={i} onClick={() => handleMCQSelect(opt)} disabled={mcqAnswered} className={btnClass}>
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {mcqAnswered && isCorrect && <CheckCircle2 className="text-green-500" />}
                    {mcqAnswered && isSelected && !isCorrect && <XCircle className="text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {mcqAnswered && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><HelpCircle size={18}/> Instant Explanation</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{q.explanation}</p>
                </div>
                <button onClick={nextMCQ} className="mt-6 w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors">
                  Next Question <ChevronRight size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    );
  }

  if (view === 'coding') {
    const q = MOCK_CODING_CHALLENGES[currentCodeIndex];
    const isFav = favorites.includes(q.id);

    return (
      <div className="max-w-7xl mx-auto p-4 flex flex-col h-[calc(100vh-100px)] mt-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setView('dashboard')} className="text-sm font-bold text-blue-600 flex items-center">
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <DifficultyBadge level={q.difficulty} />
            <button onClick={() => toggleFavorite(q.id)} className={`p-2 rounded-full transition-colors ${isFav ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-400 hover:text-yellow-500 dark:bg-gray-700'}`}>
              <Bookmark size={20} fill={isFav ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Question Details */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{q.title}</h2>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">{q.topic}</span>
            <div className="mt-6 prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300">
              <p>{q.description}</p>
            </div>
            
            {showCodeExplanation && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Solution Explanation</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{q.explanation}</p>
                <button 
                  onClick={() => {
                    if(currentCodeIndex < MOCK_CODING_CHALLENGES.length - 1) {
                      setCurrentCodeIndex(prev => prev + 1);
                      setCodeValue(MOCK_CODING_CHALLENGES[currentCodeIndex + 1].initialCode);
                      setShowCodeExplanation(false);
                    } else {
                      setView('dashboard');
                    }
                  }}
                  className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                >
                  Next Challenge
                </button>
              </motion.div>
            )}
          </div>

          {/* Monaco Editor */}
          <div className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl bg-[#1e1e1e]">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-900 border-b border-gray-800 text-white">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-gray-400" />
                <span className="text-sm font-mono text-gray-300">solution.js</span>
              </div>
              <button 
                onClick={submitCode}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded text-sm font-bold transition-colors"
              >
                <Play size={14} /> Run Code
              </button>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language="javascript"
                theme="vs-dark"
                value={codeValue}
                onChange={(val) => setCodeValue(val)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Sub-components
function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between items-start">
      <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">{icon}</div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">{title}</p>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{value}</h3>
    </div>
  );
}

function ActionCard({ title, desc, icon, onClick, bg }) {
  return (
    <div onClick={onClick} className={`p-6 rounded-3xl border-2 border-transparent transition-all cursor-pointer group shadow-sm ${bg}`}>
      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

function DifficultyBadge({ level }) {
  const colors = {
    'Easy': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Hard': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg ${colors[level] || colors['Medium']}`}>{level}</span>;
}

function SavedListItem({ title, type, diff }) {
  return (
    <li className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer group">
      <div>
        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">{type}</span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <DifficultyBadge level={diff} />
        <ChevronRight className="text-gray-400 group-hover:text-blue-600" size={18} />
      </div>
    </li>
  );
}
