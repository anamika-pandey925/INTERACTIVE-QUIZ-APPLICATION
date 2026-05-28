import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Trophy, CheckCircle, Target, Activity, Clock, Award, ChevronRight } from 'lucide-react';

const weeklyData = [
  { name: 'Mon', quizzes: 2 },
  { name: 'Tue', quizzes: 4 },
  { name: 'Wed', quizzes: 3 },
  { name: 'Thu', quizzes: 6 },
  { name: 'Fri', quizzes: 5 },
  { name: 'Sat', quizzes: 8 },
  { name: 'Sun', quizzes: 7 },
];

const subjectData = [
  { name: 'HTML', score: 85 },
  { name: 'CSS', score: 78 },
  { name: 'JavaScript', score: 92 },
  { name: 'Python', score: 88 },
  { name: 'C++', score: 65 },
  { name: 'Java', score: 72 },
];

const pieData = [
  { name: 'Correct', value: 342 },
  { name: 'Incorrect', value: 89 },
];

const COLORS = ['#22c55e', '#ef4444']; // Green for correct, Red for incorrect
const BAR_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

const leaderboard = [
  { rank: 1, name: 'Alex Johnson', score: 2850, avatar: 'https://i.pravatar.cc/150?u=1' },
  { rank: 2, name: 'Sarah Williams', score: 2720, avatar: 'https://i.pravatar.cc/150?u=2' },
  { rank: 3, name: 'Michael Chen', score: 2680, avatar: 'https://i.pravatar.cc/150?u=3' },
  { rank: 4, name: 'Emma Davis', score: 2540, avatar: 'https://i.pravatar.cc/150?u=4' },
  { rank: 5, name: 'James Wilson', score: 2490, avatar: 'https://i.pravatar.cc/150?u=5' },
];

const recentHistory = [
  { id: 1, subject: 'JavaScript Advanced', date: '2 hours ago', score: '90%', status: 'passed' },
  { id: 2, subject: 'CSS Flexbox & Grid', date: 'Yesterday', score: '100%', status: 'passed' },
  { id: 3, subject: 'Python Basics', date: '2 days ago', score: '65%', status: 'failed' },
  { id: 4, subject: 'React Fundamentals', date: '3 days ago', score: '85%', status: 'passed' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6 pt-24 pb-20">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track your learning progress and performance.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-2">
            <Activity size={18} />
            Generate Report
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Quizzes" 
            value="45" 
            icon={<Target className="text-blue-500" size={24} />} 
            trend="+12% from last month"
            trendUp={true}
          />
          <StatCard 
            title="Average Accuracy" 
            value="79.3%" 
            icon={<CheckCircle className="text-green-500" size={24} />} 
            trend="+2.4% from last month"
            trendUp={true}
          />
          <StatCard 
            title="Time Spent" 
            value="24h 15m" 
            icon={<Clock className="text-purple-500" size={24} />} 
            trend="Stable"
            trendUp={true}
          />
          <StatCard 
            title="Global Rank" 
            value="#428" 
            icon={<Trophy className="text-yellow-500" size={24} />} 
            trend="Up 24 positions"
            trendUp={true}
          />
        </div>

        {/* Charts Section 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Activity Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold mb-6">Weekly Activity</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quizzes" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Correct vs Incorrect */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Answer Accuracy</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Overall ratio of correct vs incorrect answers</p>
            <div className="flex-grow flex items-center justify-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Performance */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold mb-6">Subject Performance</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} width={80} />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(107, 114, 128, 0.1)'}}
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} animationDuration={1500}>
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leaderboard & History Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Leaderboard */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="font-semibold flex items-center gap-2"><Award size={18} className="text-yellow-500" /> Leaderboard</h3>
              </div>
              <div className="p-0 flex-grow">
                {leaderboard.map((user, idx) => (
                  <div key={user.rank} className={`flex items-center gap-3 p-3 px-5 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${idx === 0 ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}>
                    <div className={`w-6 text-center font-bold text-sm ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                      #{user.rank}
                    </div>
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" />
                    <div className="flex-grow">
                      <p className="text-sm font-medium">{user.name}</p>
                    </div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{user.score}</div>
                  </div>
                ))}
              </div>
              <button className="p-3 text-sm text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors w-full border-t border-gray-100 dark:border-gray-800">
                View Full Ranking
              </button>
            </div>

            {/* Recent History */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="font-semibold flex items-center gap-2"><Clock size={18} className="text-blue-500" /> Recent Quizzes</h3>
              </div>
              <div className="p-0 flex-grow">
                {recentHistory.map((quiz) => (
                  <div key={quiz.id} className="flex flex-col gap-1 p-3 px-5 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium truncate max-w-[140px]">{quiz.subject}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${quiz.status === 'passed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {quiz.score}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{quiz.date}</span>
                      <ChevronRight size={14} className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
              <button className="p-3 text-sm text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors w-full border-t border-gray-100 dark:border-gray-800">
                View All History
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h4 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h4>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-md ${trendUp ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
