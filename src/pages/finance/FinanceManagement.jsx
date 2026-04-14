import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, TrendingUp, TrendingDown, Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react";
import TransactionModal from "./TransactionModal";

const FinanceManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- FETCH & MERGE DATA ---
  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const [incomeRes, expenseRes] = await Promise.all([
          axios.get("http://localhost:8080/finance/income/all"),
          axios.get("http://localhost:8080/finance/expense/all")
        ]);

        // Map Income format
        const formattedIncome = incomeRes.data.map(item => ({
          id: `INC-${item.id}`,
          type: 'INCOME',
          amount: item.amount,
          date: item.dateReceived,
          category: item.incomeCategory?.name,
          description: item.description,
          donor: item.donor?.name || '-'
        }));

        // Map Expense format
        const formattedExpense = expenseRes.data.map(item => ({
          id: `EXP-${item.id}`,
          type: 'EXPENSE',
          amount: item.amount,
          date: item.dateSpent,
          category: item.expenseCategory?.name,
          description: item.description,
          donor: '-'
        }));

        // Combine and Sort by Date (Newest first)
        const combinedLedger = [...formattedIncome, ...formattedExpense].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTransactions(combinedLedger);
      } catch (error) {
        console.error("Failed to fetch ledger:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLedger();
  }, [refreshTrigger]);

  // --- CALCULATE DASHBOARD TOTALS ---
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // --- SEARCH FILTER ---
  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatting helper
  const formatCurrency = (amount) => `Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      
      {/* --- DASHBOARD CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Landmark size={24}/></div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Net Balance</p>
            <h3 className={`text-2xl font-black ${netBalance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>{formatCurrency(netBalance)}</h3>
          </div>
        </div>
        <div className="bg-emerald-50/70 backdrop-blur-xl border border-emerald-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700"><TrendingUp size={24}/></div>
          <div>
            <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Total Income</p>
            <h3 className="text-2xl font-black text-emerald-900">{formatCurrency(totalIncome)}</h3>
          </div>
        </div>
        <div className="bg-rose-50/70 backdrop-blur-xl border border-rose-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-200 flex items-center justify-center text-rose-700"><TrendingDown size={24}/></div>
          <div>
            <p className="text-sm font-bold text-rose-700 uppercase tracking-wider">Total Expense</p>
            <h3 className="text-2xl font-black text-rose-900">{formatCurrency(totalExpense)}</h3>
          </div>
        </div>
      </div>

      {/* --- LEDGER TABLE --- */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl flex flex-col min-h-0 flex-1">
        
        <div className="p-5 border-b border-gray-200/50 flex justify-between items-center gap-4 bg-white/30 shrink-0">
          <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Transaction Ledger</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400"><Search size={16} /></div>
              <input type="text" placeholder="Search ledger..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white/50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-400" />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-xl font-medium shadow-md transition-all text-sm">
              <Plus size={16} /> Add Record
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100/50 text-gray-600 font-bold uppercase text-xs tracking-wider sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Donor/Source</th>
                <th className="px-6 py-4 text-right">Amount (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading ledger...</td></tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100/50 hover:bg-white/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500">{t.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{t.description}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{t.donor}</td>
                    <td className={`px-6 py-4 font-bold text-right flex justify-end items-center gap-1 ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'INCOME' ? <ArrowDownRight size={14}/> : <ArrowUpRight size={14}/>}
                      {t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No transactions recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal 
        isModalOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => setRefreshTrigger(prev => prev + 1)} 
      />
    </div>
  );
};

export default FinanceManagement;