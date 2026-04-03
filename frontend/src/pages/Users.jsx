import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, User, Edit2, Trash2, Loader2, X, Activity, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    status: 'active'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (user) => {
    if (user.role === 'Admin') {
      toast.error('Cannot securely delete an Admin account');
      return;
    }
    if (window.confirm(`Are you absolutely sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        await axios.delete(`/users/${user._id}`);
        toast.success('Account successfully purged');
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const openForm = (user) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`/users/${editingUser._id}`, formData);
        toast.success('Access configuration updated');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
       case 'Admin': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
       case 'Analyst': return <Activity className="w-4 h-4 text-emerald-500" />;
       default: return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 relative z-10">
         <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
               Access Management
            </h1>
            <p className="text-slate-500 font-medium mt-1">Govern platform users, auditing roles, and authorization states.</p>
         </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100/80">
                <th className="px-8 py-5">System Account</th>
                <th className="px-8 py-5">Role Protocol</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Onboarded</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                   <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                         <Loader2 className="w-8 h-8 animate-spin text-indigo-400"/>
                         <p className="text-slate-400 font-medium text-sm">Authenticating lists...</p>
                      </div>
                   </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-8 py-20 text-center">
                     <div className="flex flex-col items-center justify-center gap-4">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex justify-center items-center border border-slate-100">
                             <Users className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                         </div>
                         <p className="text-slate-600 font-semibold text-lg tracking-tight">No registered configurations</p>
                      </div>
                   </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors group cursor-default">
                    <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                           {u.avatar ? (
                             <img
                               src={u.avatar}
                               alt={u.name}
                               className="w-10 h-10 rounded-[10px] object-cover border border-slate-300/50 shadow-sm shrink-0"
                             />
                           ) : (
                             <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300/50 flex items-center justify-center font-black text-slate-600 shadow-sm shrink-0">
                               {u.name.charAt(0).toUpperCase()}
                             </div>
                           )}
                           <div className="flex flex-col">
                              <span className="text-slate-800 font-bold tracking-tight">{u.name}</span>
                              <span className="text-xs text-slate-400 font-medium">{u.email}</span>
                           </div>
                        </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                          {getRoleIcon(u.role)}
                          <span className={`text-sm font-black tracking-tight ${
                              u.role === 'Admin' ? 'text-rose-600' : u.role === 'Analyst' ? 'text-emerald-600' : 'text-slate-500'
                          }`}>{u.role}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-[11px] uppercase tracking-wider font-extrabold rounded-md shadow-sm border ${
                        u.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {u.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                      <button onClick={() => openForm(u)} className="text-indigo-400 hover:text-indigo-600 focus:outline-none transition p-2 bg-indigo-50/0 hover:bg-indigo-50 rounded-lg hidden sm:inline-block">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => handleDelete(u)} 
                         disabled={u.role === 'Admin'}
                         className="text-rose-400 hover:text-rose-600 focus:outline-none transition p-2 bg-rose-50/0 hover:bg-rose-50 rounded-lg hidden sm:inline-block ml-1 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standardized Tailwind Modal */}
      {isModalOpen && (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto custom-scrollbar">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-[2rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-white/20">
                <div className="bg-white px-6 pt-5 pb-4 sm:p-8 sm:pb-6 relative">
                
                {/* Modal Decorative Blur */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none blur-3xl"></div>
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                   <div>
                       <h3 className="text-2xl font-black text-slate-800 tracking-tight" id="modal-title">
                         Update Permissions
                       </h3>
                       <p className="text-slate-400 text-sm font-medium mt-1">
                         Modify security clearance and platform availability for {formData.name}.
                       </p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 focus:outline-none bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors active:scale-95 border border-transparent hover:border-slate-300">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                
                <form id="userForm" onSubmit={handleSubmit} className="space-y-5 relative z-10">
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Registered Identity</label>
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-slate-200 bg-slate-50/50 text-slate-800 font-semibold rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:font-normal placeholder:text-slate-300"
                      />
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Primary Email</label>
                      <input 
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full border border-slate-200 bg-slate-100 text-slate-500 font-medium rounded-xl px-4 py-3 outline-none cursor-not-allowed"
                        disabled
                      />
                      <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-1.5 ml-1">Email addresses act as immutable account identifiers.</p>
                   </div>

                   <div className="grid grid-cols-2 gap-5 pt-2 border-t border-slate-100/80">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Security Level</label>
                        <select 
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          className="w-full border border-slate-200 bg-slate-50/50 text-slate-800 font-black rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        >
                          <option value="Viewer">Viewer (Read-Only)</option>
                          <option value="Analyst">Analyst (Insights)</option>
                          <option value="Admin">Admin (Full Access)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Account Status</label>
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full border border-slate-200 bg-slate-50/50 text-slate-800 font-black rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Suspended</option>
                        </select>
                      </div>
                   </div>
                </form>
              </div>
              <div className="bg-slate-50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse sm:gap-3 border-t border-slate-100">
                <button 
                  type="submit" 
                  form="userForm"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold shadow-md hover:bg-slate-800 transition-all focus:outline-none mb-3 sm:mb-0"
                >
                  Save Configuration
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-700 bg-white border border-slate-300 font-semibold hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Users;
