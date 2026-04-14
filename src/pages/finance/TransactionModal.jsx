import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

const TransactionModal = ({ isModalOpen, onClose, onSuccess }) => {
  const [isRendered, setIsRendered] = useState(isModalOpen);
  const [isClosing, setIsClosing] = useState(false);

  // --- UI TOGGLE ---
  const [transactionType, setTransactionType] = useState("INCOME"); // 'INCOME' or 'EXPENSE'

  // --- DROPDOWNS ---
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [donors, setDonors] = useState([]);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    donorId: "",
    description: "",
  });

  useEffect(() => {
    if (isModalOpen) {
      setIsRendered(true);
      setIsClosing(false);
      setFormData({ amount: "", date: new Date().toISOString().split("T")[0], categoryId: "", donorId: "", description: "" });
      fetchDropdowns();
    } else if (isRendered) {
      setIsClosing(true);
      setTimeout(() => { setIsRendered(false); setIsClosing(false); }, 400);
    }
  }, [isModalOpen]);

  const fetchDropdowns = async () => {
    try {
      const [incCat, expCat, donorRes] = await Promise.all([
        axios.get("http://localhost:8080/finance/income-categories"),
        axios.get("http://localhost:8080/finance/expense-categories"),
        axios.get("http://localhost:8080/finance/donors")
      ]);
      setIncomeCategories(incCat.data);
      setExpenseCategories(expCat.data);
      setDonors(donorRes.data);
    } catch (error) { console.error("Failed to load dropdowns:", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.categoryId || !formData.description) {
        alert("Please fill in the required fields (Amount, Category, Description).");
        return;
    }

    try {
      if (transactionType === "INCOME") {
        const payload = {
          amount: parseFloat(formData.amount),
          dateReceived: formData.date,
          description: formData.description,
          incomeCategory: { id: parseInt(formData.categoryId) },
          donor: formData.donorId ? { id: parseInt(formData.donorId) } : null
        };
        await axios.post("http://localhost:8080/finance/income/add", payload);
      } else {
        const payload = {
          amount: parseFloat(formData.amount),
          dateSpent: formData.date,
          description: formData.description,
          expenseCategory: { id: parseInt(formData.categoryId) }
        };
        await axios.post("http://localhost:8080/finance/expense/add", payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert("Failed to save transaction.");
    }
  };

  if (!isRendered) return null;

  const inputBaseClass = "w-full p-2.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity ${isClosing ? "animate-glass-out" : "animate-glass"}`}>
      <div className={`relative w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-6 ${isClosing ? "animate-modal-out" : "animate-modal"}`}>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Wallet size={20} /></div>
            <h2 className="text-xl font-extrabold text-gray-800">New Transaction</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
        </div>

        {/* --- TYPE TOGGLE --- */}
        <div className="flex bg-gray-100/80 p-1 rounded-xl mb-6 shadow-inner">
          <button type="button" onClick={() => {setTransactionType("INCOME"); setFormData({...formData, categoryId: ""});}} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${transactionType === "INCOME" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <ArrowDownRight size={16} /> Record Income
          </button>
          <button type="button" onClick={() => {setTransactionType("EXPENSE"); setFormData({...formData, categoryId: ""});}} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${transactionType === "EXPENSE" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <ArrowUpRight size={16} /> Log Expense
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Amount (Rs) *</label>
              <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className={inputBaseClass} placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Date *</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={inputBaseClass} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Category *</label>
            <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className={inputBaseClass}>
              <option value="">-- Select {transactionType === "INCOME" ? "Income" : "Expense"} Category --</option>
              {transactionType === "INCOME" 
                ? incomeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                : expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              }
            </select>
          </div>

          {transactionType === "INCOME" && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Donor (Optional)</label>
              <select value={formData.donorId} onChange={e => setFormData({...formData, donorId: e.target.value})} className={inputBaseClass}>
                <option value="">-- Anonymous / General --</option>
                {donors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Description / Note *</label>
            <textarea required rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`${inputBaseClass} resize-none`} placeholder="What was this for?"></textarea>
          </div>

          <div className="mt-2 pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-md transition-all ${transactionType === "INCOME" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}>
              Save {transactionType === "INCOME" ? "Income" : "Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;