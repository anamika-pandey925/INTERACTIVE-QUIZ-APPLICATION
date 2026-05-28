import React, { useState } from 'react';
import ThemeToggle from './components/ThemeToggle';
import Dashboard from './components/Dashboard';
import Certificate from './components/Certificate';
import AIGenerator from './components/AIGenerator';
import VoiceQuiz from './components/VoiceQuiz';
import MultiplayerBattle from './components/MultiplayerBattle';
import GamificationDashboard from './components/GamificationDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdvancedTimerQuiz from './components/AdvancedTimerQuiz';
import InterviewPrep from './components/InterviewPrep';

function App() {
  const [currentView, setCurrentView] = useState('home');

  // Admin Dashboard takes over the full screen
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <nav className="w-full bg-[#2e7d32] dark:bg-gray-900 py-3 px-6 flex justify-between items-center fixed top-0 left-0 shadow-md z-50 transition-colors duration-300">
          <button onClick={() => setCurrentView('home')} className="text-white hover:text-gray-200 font-bold flex items-center gap-2">
            ← Back to App
          </button>
          <div><ThemeToggle /></div>
        </nav>
        <AdminDashboard />
      </div>
    );
  }

  // Interview Prep might take full screen height for the coding editor
  if (currentView === 'interview') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
        <nav className="w-full bg-[#2e7d32] dark:bg-gray-900 py-3 px-6 flex justify-between items-center shadow-md z-50 transition-colors duration-300">
          <button onClick={() => setCurrentView('home')} className="text-white hover:text-gray-200 font-bold flex items-center gap-2">
            ← Back
          </button>
          <div className="text-white font-black text-lg">Interview Prep</div>
          <div><ThemeToggle /></div>
        </nav>
        <InterviewPrep />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#d4f5d4] dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 pt-20 pb-16 font-sans">
      <nav className="w-full bg-[#2e7d32] dark:bg-gray-900 py-4 px-6 flex justify-between items-center fixed top-0 left-0 shadow-md z-50 transition-colors duration-300">
        <div className="flex gap-4 lg:gap-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
            <button onClick={() => setCurrentView('home')} className={`text-sm lg:text-lg font-bold transition-colors ${currentView === 'home' ? 'text-[#a5d6a7]' : 'text-white hover:text-[#a5d6a7]'}`}>Home</button>
            <button onClick={() => setCurrentView('dashboard')} className={`text-sm lg:text-lg font-bold transition-colors ${currentView === 'dashboard' ? 'text-[#a5d6a7]' : 'text-white hover:text-[#a5d6a7]'}`}>Stats</button>
            <button onClick={() => setCurrentView('gamification')} className={`text-sm lg:text-lg font-bold transition-colors flex items-center gap-1 ${currentView === 'gamification' ? 'text-yellow-300' : 'text-yellow-100 hover:text-white'}`}>🏆 Rewards</button>
            <button onClick={() => setCurrentView('interview')} className={`text-sm lg:text-lg font-bold transition-colors flex items-center gap-1 ${currentView === 'interview' ? 'text-cyan-300' : 'text-cyan-100 hover:text-white'}`}>💼 Interview</button>
            <button onClick={() => setCurrentView('aigenerator')} className={`text-sm lg:text-lg font-bold transition-colors ${currentView === 'aigenerator' ? 'text-blue-300' : 'text-blue-100 hover:text-white'}`}>✨ AI Quiz</button>
            <button onClick={() => setCurrentView('voicequiz')} className={`text-sm lg:text-lg font-bold transition-colors flex items-center gap-1 ${currentView === 'voicequiz' ? 'text-red-300' : 'text-red-100 hover:text-white'}`}>🎙️ Voice</button>
            <button onClick={() => setCurrentView('multiplayer')} className={`text-sm lg:text-lg font-bold transition-colors flex items-center gap-1 ${currentView === 'multiplayer' ? 'text-indigo-300' : 'text-indigo-100 hover:text-white'}`}>⚔️ Battle</button>
            <button onClick={() => setCurrentView('timerquiz')} className={`text-sm lg:text-lg font-bold transition-colors flex items-center gap-1 ${currentView === 'timerquiz' ? 'text-orange-300' : 'text-orange-100 hover:text-white'}`}>⏱️ Time Attack</button>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('admin')} className="text-xs bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-700 font-medium hidden lg:block">Admin</button>
            <ThemeToggle />
        </div>
      </nav>
      
      {currentView === 'home' && (
        <div className="max-w-6xl mx-auto mt-8 px-4 md:px-8 font-sans">
          {/* Hero Section */}
          <div className="text-center py-12 md:py-20 relative overflow-hidden rounded-3xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700 shadow-2xl mb-12">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl pointer-events-none"></div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold mb-6 tracking-wide shadow-sm border border-blue-200 dark:border-blue-800">
              ⚡ Platform v2.0 Live
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white mb-6 leading-tight">
              The Ultimate Platform For <br/> <span className="text-blue-600 dark:text-blue-400">Next-Gen Learning.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto font-medium">
              AI-generated questions, real-time multiplayer battles, and comprehensive technical interview prep—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button onClick={() => setCurrentView('interview')} className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105">
                Start Interview Prep
              </button>
              <button onClick={() => setCurrentView('multiplayer')} className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-105">
                Join Multiplayer Battle
              </button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <FeatureCard 
              icon="✨" title="AI Quiz Generator" color="blue"
              desc="Type any topic and let OpenAI instantly generate a custom quiz with explanations."
              onClick={() => setCurrentView('aigenerator')}
            />
            <FeatureCard 
              icon="💼" title="Interview Simulator" color="cyan"
              desc="Practice system design and algorithmic coding challenges with Monaco Editor."
              onClick={() => setCurrentView('interview')}
            />
            <FeatureCard 
              icon="⚔️" title="Multiplayer Arena" color="indigo"
              desc="Challenge your friends in real-time Socket.io 1v1 quiz battles."
              onClick={() => setCurrentView('multiplayer')}
            />
            <FeatureCard 
              icon="🎙️" title="Voice Recognition" color="red"
              desc="Hands-free quizzes. The app reads questions aloud and listens for your verbal answers."
              onClick={() => setCurrentView('voicequiz')}
            />
            <FeatureCard 
              icon="🏆" title="Gamification" color="yellow"
              desc="Level up, earn XP, maintain streaks, and claim daily challenge badges."
              onClick={() => setCurrentView('gamification')}
            />
            <FeatureCard 
              icon="⏱️" title="Time Attack" color="orange"
              desc="Sudden death mode. Beat the countdown timer for massive score multipliers."
              onClick={() => setCurrentView('timerquiz')}
            />
          </div>

          {/* Legacy Categories */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              📚 Standard Practice Tests
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <a href={`${import.meta.env.BASE_URL}HTML Ques.html`} className="bg-[#28a745] hover:bg-[#218838] text-white p-4 rounded-xl text-center font-bold transition-all shadow-md hover:-translate-y-1">HTML</a>
                <a href={`${import.meta.env.BASE_URL}CSS Ques.html`} className="bg-[#28a745] hover:bg-[#218838] text-white p-4 rounded-xl text-center font-bold transition-all shadow-md hover:-translate-y-1">CSS</a>
                <a href={`${import.meta.env.BASE_URL}JavaScript Ques.html`} className="bg-[#28a745] hover:bg-[#218838] text-white p-4 rounded-xl text-center font-bold transition-all shadow-md hover:-translate-y-1">JavaScript</a>
                <a href={`${import.meta.env.BASE_URL}Python Ques.html`} className="bg-[#28a745] hover:bg-[#218838] text-white p-4 rounded-xl text-center font-bold transition-all shadow-md hover:-translate-y-1">Python</a>
                <a href={`${import.meta.env.BASE_URL}C++.html`} className="bg-[#28a745] hover:bg-[#218838] text-white p-4 rounded-xl text-center font-bold transition-all shadow-md hover:-translate-y-1">C/C++</a>
                <a href={`${import.meta.env.BASE_URL}Java Ques.html`} className="bg-[#28a745] hover:bg-[#218838] text-white p-4 rounded-xl text-center font-bold transition-all shadow-md hover:-translate-y-1">Java</a>
            </div>
          </div>
        </div>
      )}

      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'gamification' && <GamificationDashboard />}
      {currentView === 'certificate' && <Certificate />}
      {currentView === 'aigenerator' && <AIGenerator />}
      {currentView === 'voicequiz' && <VoiceQuiz />}
      {currentView === 'multiplayer' && <MultiplayerBattle />}
      {currentView === 'timerquiz' && <AdvancedTimerQuiz />}
      
      <div className="fixed bottom-0 w-full bg-[#218838] dark:bg-black text-white text-center py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.2)] z-50 transition-colors duration-300">
        &copy; 2026 Quiz & Interview Prep Platform. All rights reserved.
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, onClick, color }) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col items-start hover:-translate-y-1`}
    >
      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default App;
