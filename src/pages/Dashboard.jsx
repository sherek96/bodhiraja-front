import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, GraduationCap, Wallet, TrendingUp, 
  CalendarCheck, ArrowUpRight, ArrowDownRight, Activity 
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    todayAttendance: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:8080/users/dashboard/summary");
        setStats(res.data);
      } catch (err) { console.error("Dashboard load failed", err); }
    };
    fetchStats();
  }, []);

  const formatCurrency = (val) => `Rs. ${val.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* --- TOP WELCOME BAR --- */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Pirivena Overview</h1>
          <p className="text-gray-500 font-medium">Welcome back! Here is what's happening today.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-sm font-bold text-gray-600 flex items-center gap-2">
          <Activity size={16} className="text-emerald-500 animate-pulse" />
          System Live: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <GraduationCap size={24} />
            </div>
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase">Academic</span>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Monks</h3>
          <p className="text-3xl font-black text-gray-800">{stats.totalStudents}</p>
        </div>

        {/* Total Staff */}
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md uppercase">HR</span>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Active Staff</h3>
          <p className="text-3xl font-black text-gray-800">{stats.totalStaff}</p>
        </div>

        {/* Monthly Income */}
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
              <ArrowDownRight size={14} /> This Month
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Monthly Income</h3>
          <p className="text-2xl font-black text-gray-800 truncate">{formatCurrency(stats.monthlyIncome)}</p>
        </div>

        {/* Attendance Marker */}
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <CalendarCheck size={24} />
            </div>
            <span className="text-[10px] font-black bg-orange-50 text-orange-600 px-2 py-1 rounded-md uppercase">Live</span>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Attendance Logs</h3>
          <p className="text-3xl font-black text-gray-800">{stats.todayAttendance} <span className="text-sm font-normal text-gray-400">Classes</span></p>
        </div>
      </div>

      {/* --- MIDDLE SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Financial Health Card */}
        <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
             <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold opacity-80 mb-6">Financial Pulse</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-gray-400">Monthly Expenses</span>
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <ArrowUpRight size={16} /> {formatCurrency(stats.monthlyExpense)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400">Net Surplus</span>
                <span className="text-emerald-400 text-2xl font-black">
                  {formatCurrency(stats.monthlyIncome - stats.monthlyExpense)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links / Navigation Helper */}
        <div className="bg-white/40 border border-dashed border-gray-300 p-8 rounded-3xl flex flex-col justify-center items-center text-center">
            <h2 className="text-lg font-bold text-gray-700 mb-2">Ready to take action?</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">Use the sidebar to manage enrollments, log daily attendance, or update the financial ledger.</p>
            <div className="flex gap-3">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
               <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-75"></div>
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-150"></div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;