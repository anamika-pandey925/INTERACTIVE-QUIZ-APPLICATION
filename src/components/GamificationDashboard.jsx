import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, Trophy, Target, Zap, Shield, Gift, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function GamificationDashboard() {
  const [xp, setXp] = useState(2450);
  const [level, setLevel] = useState(12);
  const [streak, setStreak] = useState(14);
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState(null);

  const xpNextLevel = 3000;
  const progressPercent = (xp / xpNextLevel) * 100;

  const [challenges, setChallenges] = useState([
    { id: 1, title: "Complete 3 React Quizzes", xpReward: 150, completed: false },
    { id: 2, title: "Score 100% on Hard Difficulty", xpReward: 300, completed: false },
    { id: 3, title: "Play a Multiplayer Battle", xpReward: 200, completed: true }
  ]);

  const [badges, setBadges] = useState([
    { id: 1, name: "First Blood", icon: <Zap size={24} />, unlocked: true, color: "text-yellow-400" },
    { id: 2, name: "Perfect Score", icon: <Star size={24} />, unlocked: true, color: "text-purple-400" },
    { id: 3, name: "Quiz Master", icon: <Trophy size={24} />, unlocked: false, color: "text-gray-500" },
    { id: 4, name: "Unstoppable", icon: <Shield size={24} />, unlocked: false, color: "text-gray-500" }
  ]);

  const completeChallenge = (id) => {
    const challenge = challenges.find(c => c.id === id);
    if (challenge.completed) return;

    // Mark as completed
    setChallenges(challenges.map(c => c.id === id ? { ...c, completed: true } : c));
    
    // Add XP
    const newXp = xp + challenge.xpReward;
    let leveledUp = false;
    let newLevel = level;

    if (newXp >= xpNextLevel) {
      newLevel += 1;
      leveledUp = true;
      setXp(newXp - xpNextLevel); // Assuming next level requires same amount for simplicity in demo
      setLevel(newLevel);
    } else {
      setXp(newXp);
    }

    // Show popup
    setRewardData({
      title: leveledUp ? "Level Up!" : "Challenge Completed!",
      xp: challenge.xpReward,
      level: leveledUp ? newLevel : null
    });
    setShowReward(true);

    setTimeout(() => {
      setShowReward(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans overflow-hidden">
      
      {/* Reward Popup Overlay */}
      <AnimatePresence>
        {showReward && rewardData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -100, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.6 }}
              className="bg-gradient-to-b from-indigo-900 to-slate-900 p-8 rounded-3xl border-2 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.4)] text-center relative max-w-sm w-full mx-4"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -top-12 left-1/2 -translate-x-1/2"
              >
                <div className="w-24 h-24 bg-indigo-500 rounded-full blur-xl opacity-50 absolute"></div>
                <Gift size={64} className="text-yellow-400 relative z-10" fill="currentColor" />
              </motion.div>
              
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mt-8 mb-2">
                {rewardData.title}
              </h2>
              
              <div className="bg-white/10 rounded-xl p-4 my-6">
                <p className="text-lg font-bold text-indigo-300">+{rewardData.xp} XP Earned</p>
                {rewardData.level && (
                  <motion.p 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}
                    className="text-2xl font-black text-white mt-2"
                  >
                    You reached Level {rewardData.level}!
                  </motion.p>
                )}
              </div>
              
              <button 
                onClick={() => setShowReward(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-8 pt-16 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-800/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-900 overflow-hidden">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
                </div>
              </div>
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-black px-2 py-1 rounded-full border-2 border-slate-900"
              >
                LVL {level}
              </motion.div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Player One</h1>
              <p className="text-slate-400">Quiz Enthusiast</p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-slate-900/80 px-6 py-3 rounded-2xl border border-slate-700 flex flex-col items-center">
              <Flame size={24} className="text-orange-500 mb-1" fill="currentColor" />
              <span className="text-2xl font-bold">{streak}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Day Streak</span>
            </div>
            <div className="flex-1 md:flex-none bg-slate-900/80 px-6 py-3 rounded-2xl border border-slate-700 flex flex-col items-center">
              <Star size={24} className="text-yellow-400 mb-1" fill="currentColor" />
              <span className="text-2xl font-bold">{xp}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Total XP</span>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Level {level} Progress</h3>
              <p className="text-sm text-slate-400">{xp} / {xpNextLevel} XP to Level {level + 1}</p>
            </div>
            <span className="text-xl font-black text-indigo-400">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Daily Challenges */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="text-pink-500" /> Daily Challenges
            </h2>
            <div className="grid gap-4">
              {challenges.map((challenge) => (
                <motion.div 
                  key={challenge.id}
                  whileHover={!challenge.completed ? { scale: 1.02 } : {}}
                  className={`p-5 rounded-2xl border ${challenge.completed ? 'bg-slate-800/30 border-slate-700/50 opacity-60' : 'bg-slate-800 border-slate-600 shadow-lg'}`}
                >
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${challenge.completed ? 'text-green-500' : 'text-slate-400'}`}>
                        {challenge.completed ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-500" />}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${challenge.completed ? 'line-through text-slate-400' : 'text-white'}`}>{challenge.title}</h4>
                        <p className="text-sm text-indigo-400 font-bold mt-1">+{challenge.xpReward} XP</p>
                      </div>
                    </div>
                    {!challenge.completed && (
                      <button 
                        onClick={() => completeChallenge(challenge.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Badges & Achievements */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="text-indigo-500" /> Achievements
            </h2>
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center text-center group cursor-pointer">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${badge.unlocked ? 'bg-slate-700 shadow-indigo-500/20 border border-slate-600' : 'bg-slate-900/50 border border-slate-800 opacity-50'}`}
                  >
                    <div className={badge.color}>{badge.icon}</div>
                  </motion.div>
                  <span className={`text-sm font-semibold ${badge.unlocked ? 'text-white' : 'text-slate-500'}`}>{badge.name}</span>
                </div>
              ))}
            </div>
            
            {/* Promo / Next Tier */}
            <div className="mt-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-pink-500/20 blur-3xl rounded-full group-hover:bg-pink-500/30 transition-all"></div>
              <h3 className="font-bold text-lg text-white mb-1">Elite Tier Unlock</h3>
              <p className="text-sm text-purple-200 mb-4">Reach Level 20 to unlock exclusive elite tournaments and animated avatars.</p>
              <button className="flex items-center text-sm font-bold text-pink-400 hover:text-pink-300">
                View Requirements <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
