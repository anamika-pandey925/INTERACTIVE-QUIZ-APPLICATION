import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, Settings, LogOut, 
  Search, Plus, Edit2, Trash2, ChevronRight, Activity,
  TrendingUp, Award, ShieldAlert, CheckCircle2, XCircle
} from 'lucide-react';

// Mock Data
const mockUsers = [
  { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'User', status: 'Active', joinDate: '2025-10-12' },
  { id: 2, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Admin', status: 'Active', joinDate: '2025-09-05' },
  { id: 3, name: 'Michael Chen', email: 'mike@example.com', role: 'User', status: 'Inactive', joinDate: '2025-11-20' },
  { id: 4, name: 'Emma Davis', email: 'emma@example.com', role: 'User', status: 'Active', joinDate: '2026-01-15' },
  { id: 5, name: 'James Wilson', email: 'james@example.com', role: 'User', status: 'Active', joinDate: '2026-02-28' },
];

const mockQuizzes = [
  { id: 101, title: 'React Fundamentals', category: 'Programming', difficulty: 'Medium', attempts: 1245, status: 'Published' },
  { id: 102, title: 'Advanced CSS', category: 'Design', difficulty: 'Hard', attempts: 890, status: 'Published' },
  { id: 103, title: 'JavaScript Basics', category: 'Programming', difficulty: 'Easy', attempts: 3420, status: 'Published' },
  { id: 104, title: 'Python for Data Science', category: 'Data', difficulty: 'Hard', attempts: 560, status: 'Draft' },
];

export default function AdminDashboard() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Check existing token
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate JWT Authentication
    if (loginForm.email === 'admin@quizapp.com' && loginForm.password === 'admin123') {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockToken';
      localStorage.setItem('adminToken', fakeToken);
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid admin credentials. (Hint: admin@quizapp.com / admin123)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Portal</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to access the dashboard</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <XCircle size={16} /> {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
              <input 
                type="email" 
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input 
                type="password" 
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
              Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter users based on search
  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans pt-16">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col hidden md:flex z-10">
        <div className="p-6">
          <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-blue-600" /> AdminOS
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={<Users size={20} />} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarItem icon={<BookOpen size={20} />} label="Quizzes" active={activeTab === 'quizzes'} onClick={() => setActiveTab('quizzes')} />
          <SidebarItem icon={<Activity size={20} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Top Bar */}
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your platform and view statistics.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Global search..." 
                  className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                A
              </div>
            </div>
          </header>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value="12,450" change="+12%" icon={<Users size={24} className="text-blue-500" />} />
                <StatCard title="Active Quizzes" value="342" change="+5%" icon={<BookOpen size={24} className="text-purple-500" />} />
                <StatCard title="Total Attempts" value="89.2k" change="+24%" icon={<Activity size={24} className="text-green-500" />} />
                <StatCard title="Avg. Score" value="76%" change="-2%" icon={<Award size={24} className="text-yellow-500" />} negative />
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Quiz Completions</h3>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                            U{i}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">User {i}892</p>
                            <p className="text-xs text-gray-500">Completed React Fundamentals</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-500">95%</p>
                          <p className="text-xs text-gray-400">2 mins ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-xl font-medium transition-colors">
                      <span className="flex items-center gap-2"><Plus size={18} /> Create New Quiz</span>
                      <ChevronRight size={18} />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
                      <span className="flex items-center gap-2"><Users size={18} /> Invite Admin</span>
                      <ChevronRight size={18} />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
                      <span className="flex items-center gap-2"><Activity size={18} /> Export Reports</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap">
                  <Plus size={16} /> Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Join Date</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center gap-1 text-xs font-semibold ${user.status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                            {user.status === 'Active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {user.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">{user.joinDate}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-gray-800">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === 'quizzes' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">Quiz Management</h3>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                  <Plus size={16} /> Create Quiz
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {mockQuizzes.map(quiz => (
                  <div key={quiz.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-500 transition-colors group relative bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${quiz.status === 'Published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {quiz.status}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 bg-white dark:bg-gray-700 rounded-md shadow-sm"><Edit2 size={14} /></button>
                        <button className="p-1.5 text-gray-500 hover:text-red-600 bg-white dark:bg-gray-700 rounded-md shadow-sm"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">{quiz.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{quiz.category} • {quiz.difficulty}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 font-medium">{quiz.attempts.toLocaleString()} Attempts</span>
                      <button className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline">View Stats</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// Sub-components
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ title, value, change, icon, negative }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">{icon}</div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${negative ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
          {negative ? <TrendingUp className="inline rotate-180 mr-1" size={12} /> : <TrendingUp className="inline mr-1" size={12} />}
          {change}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
