import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Loader2, X, TrendingUp, TrendingDown, ReceiptText, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Records = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const formRef = useRef(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/records', {
        params: {
          page,
          type: typeFilter || undefined,
          category: categoryFilter || undefined
        }
      });
      setRecords(res.data.records);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, typeFilter, categoryFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record forever?')) {
      try {
        await axios.delete(`/records/${id}`);
        toast.success('Record deleted securely');
        fetchRecords();
      } catch (err) {
        toast.error('Failed to delete record');
      }
    }
  };

  const openForm = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        amount: record.amount,
        type: record.type,
        category: record.category,
        date: new Date(record.date).toISOString().split('T')[0],
        notes: record.notes || ''
      });
    } else {
      setEditingRecord(null);
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setIsFormOpen(true);
    // Smooth scroll to form area
    setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await axios.put(`/records/${editingRecord._id}`, formData);
        toast.success('Transaction successfully updated');
      } else {
        await axios.post('/records', formData);
        toast.success('New transaction logged');
      }
      closeForm();
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const formatCur = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num || 0);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both pb-20 relative">
      <div ref={formRef} className="absolute -top-10"></div>
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 relative z-10">
         <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
               Financial Ledger
            </h1>
            <p className="text-slate-500 font-medium mt-1">Track and filter all your historical income and expense transactions.</p>
         </div>
         {user?.role === 'Admin' && !isFormOpen && (
           <button 
             onClick={() => openForm()}
             className="flex items-center gap-2 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all font-semibold"
           >
             <Plus className="w-5 h-5" />
             Log Transaction
           </button>
         )}
      </div>

      {/* Inline Form Card */}
      {isFormOpen && (
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/80 overflow-hidden relative z-10 animate-in slide-in-from-top-4 duration-300">
            {/* Decorative Blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none blur-3xl"></div>
            
            <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center relative">
               <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">
                     {editingRecord ? 'Update Transaction' : 'Log Transaction'}
                   </h3>
                   <p className="text-slate-500 text-sm font-medium mt-1">
                     {editingRecord ? 'Modify the details of this financial entry.' : 'Provide the details for the new financial entry.'}
                   </p>
               </div>
               <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 focus:outline-none bg-white shadow-sm border border-slate-200 hover:border-slate-300 p-2 rounded-full transition-all active:scale-95">
                  <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="px-8 py-8 relative">
                <form id="recordForm" onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Type</label>
                       <select 
                         required
                         value={formData.type}
                         onChange={(e) => setFormData({...formData, type: e.target.value})}
                         className="w-full border border-slate-200/80 bg-slate-50/50 text-slate-800 font-semibold rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all hover:border-slate-300"
                       >
                         <option value="income">Income (+)</option>
                         <option value="expense">Expense (-)</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Amount</label>
                       <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-500 font-bold">₹</span>
                          </div>
                          <input 
                            type="number"
                            required
                            step="0.01"
                            min="0"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            className="w-full border border-slate-200/80 bg-slate-50/50 text-slate-800 font-black text-lg rounded-xl pl-8 pr-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:font-normal placeholder:text-slate-300 placeholder:text-base hover:border-slate-300"
                            placeholder="0.00"
                          />
                       </div>
                     </div>
                     
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Category</label>
                        <input 
                          type="text"
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full border border-slate-200/80 bg-slate-50/50 text-slate-800 font-semibold rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:font-normal placeholder:text-slate-300 hover:border-slate-300"
                          placeholder="e.g. Salary, Rent, Maintenance..."
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Date</label>
                        <input 
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full border border-slate-200/80 bg-slate-50/50 text-slate-800 font-semibold rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all hover:border-slate-300"
                        />
                     </div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Reference Notes</label>
                      <textarea 
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        rows="2"
                        className="w-full border border-slate-200/80 bg-slate-50/50 text-slate-800 font-medium rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none placeholder:font-normal placeholder:text-slate-300 hover:border-slate-300"
                        placeholder="Include reference IDs, memos, or specific details..."
                      ></textarea>
                   </div>
                </form>
            </div>
            
            <div className="bg-slate-50/80 px-8 py-5 flex items-center justify-end gap-3 border-t border-slate-100/80">
                <button 
                  type="button" 
                  onClick={closeForm}
                  className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200/50 transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="recordForm"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold shadow-md shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/20"
                >
                  {editingRecord ? 'Save Changes' : 'Commit Record'}
                </button>
            </div>
        </div>
      )}

      {/* Modern Filter Bar */}
      <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-wrap lg:flex-nowrap gap-5 items-end relative z-10 transition-all">
         <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 hidden sm:flex shrink-0">
             <Filter className="w-5 h-5 text-slate-400" />
         </div>
         
         <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-[180px]">
           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Transaction Type</label>
           <select 
              value={typeFilter} 
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm cursor-pointer hover:border-slate-300"
           >
             <option value="">All Transactions</option>
             <option value="income">Income Only</option>
             <option value="expense">Expenses Only</option>
           </select>
         </div>
         
         <div className="flex flex-col gap-1.5 w-full sm:w-auto flex-1 max-w-md">
           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Search Category</label>
           <div className="relative">
             <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
             <input 
                type="text" 
                placeholder="e.g. Sales, Subscriptions, Office Supplies..."
                value={categoryFilter} 
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="bg-white border border-slate-200 text-slate-800 font-medium rounded-xl pl-10 pr-4 py-2.5 w-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder:text-slate-300 placeholder:font-normal hover:border-slate-300"
             />
           </div>
         </div>
      </div>

      {/* Main Ledger Database */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100/80">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Category & Desc</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Type</th>
                {user?.role === 'Admin' && (
                  <th className="px-8 py-5 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                   <td colSpan={user?.role === 'Admin' ? 5 : 4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                         <Loader2 className="w-8 h-8 animate-spin text-indigo-400"/>
                         <p className="text-slate-400 font-medium text-sm">Fetching ledger...</p>
                      </div>
                   </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                   <td colSpan={user?.role === 'Admin' ? 5 : 4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex justify-center items-center border border-slate-100">
                             <ReceiptText className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                         </div>
                         <div>
                            <p className="text-slate-600 font-semibold text-lg tracking-tight">No records found</p>
                            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or adding a new transaction.</p>
                         </div>
                      </div>
                   </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/60 transition-colors group cursor-default">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-slate-500">
                        {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="text-slate-800 font-bold tracking-tight">{record.category}</span>
                          <span className="text-sm text-slate-400 truncate max-w-[250px]">{record.notes || <span className="italic opacity-60">No additional details recorded.</span>}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                        <p className={`text-base font-black tracking-tight ${record.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>
                           {record.type === 'income' ? '+' : '-'}{formatCur(record.amount)}
                        </p>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                           record.type === 'income' 
                             ? 'bg-emerald-50/50 border border-emerald-100 text-emerald-600' 
                             : 'bg-rose-50/50 border border-rose-100 text-rose-600'
                       }`}>
                           {record.type === 'income' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                           {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                       </div>
                    </td>
                    {user?.role === 'Admin' && (
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <button onClick={() => openForm(record)} className="text-indigo-400 hover:text-indigo-600 focus:outline-none transition p-2 bg-indigo-50/0 hover:bg-indigo-50 rounded-lg hidden sm:inline-block">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(record._id)} className="text-rose-400 hover:text-rose-600 focus:outline-none transition p-2 bg-rose-50/0 hover:bg-rose-50 rounded-lg hidden sm:inline-block ml-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Details */}
        <div className="bg-white/50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
           <div className="text-sm text-slate-500 font-medium tracking-wide">
              Page <span className="font-bold text-slate-800">{page}</span> of <span className="font-bold text-slate-800">{totalPages || 1}</span>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-semibold rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm disabled:opacity-40 disabled:hover:bg-white transition-all"
              >
                Previous
              </button>
              <button 
                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                 disabled={page === totalPages || totalPages === 0}
                 className="inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-semibold rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm disabled:opacity-40 disabled:hover:bg-white transition-all"
              >
                Next
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Records;
