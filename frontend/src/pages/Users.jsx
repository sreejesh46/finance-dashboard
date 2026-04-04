import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, User, Users as UsersIcon, Edit2, Trash2, Loader2, X, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const Users = () => {
  const { isDark } = useTheme();
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

  const activeAdminCount = users.filter((u) => u.role === 'Admin' && u.status === 'active').length;
  const isEditingLastActiveAdmin =
    editingUser?.role === 'Admin' &&
    editingUser?.status === 'active' &&
    activeAdminCount <= 1;
  const roleLocked = isEditingLastActiveAdmin;
  const statusLocked = isEditingLastActiveAdmin;

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
      if (user.status === 'active' && activeAdminCount <= 1) {
        toast.error('Cannot delete the last active admin account');
      } else {
        toast.error('Cannot securely delete an Admin account');
      }
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
        if (isEditingLastActiveAdmin && formData.role !== 'Admin') {
          toast.error('You cannot change the last active admin to another role');
          return;
        }

        if (isEditingLastActiveAdmin && formData.status !== 'active') {
          toast.error('You cannot deactivate the last active admin');
          return;
        }

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

  const surfaceClass = isDark
    ? 'bg-[#26272E] border border-slate-800 shadow-[0_24px_60px_rgba(2,6,23,0.4)]'
    : 'bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
  const headingClass = isDark ? 'text-slate-50' : 'text-slate-900';
  const bodyMutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const labelClass = isDark ? 'text-slate-500' : 'text-slate-400';
  const inputClass = isDark
    ? 'border-slate-800 bg-[#17191A] text-slate-100 placeholder:text-slate-500 focus:bg-[#17191A] focus:ring-sky-500/20 focus:border-sky-500'
    : 'border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-300 focus:bg-white focus:ring-indigo-500/20 focus:border-indigo-500';

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 relative z-10">
         <div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${headingClass}`}>
               Access Management
            </h1>
            <p className={`font-medium mt-1 ${bodyMutedClass}`}>Govern platform users, auditing roles, and authorization states.</p>
         </div>
      </div>

      <div className={`${surfaceClass} rounded-3xl overflow-hidden relative z-10`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs font-bold uppercase tracking-widest border-b ${isDark ? 'bg-[#1f2025] text-slate-500 border-slate-800' : 'bg-slate-50/50 text-slate-400 border-slate-100/80'}`}>
                <th className="px-8 py-5">System Account</th>
                <th className="px-8 py-5">Role Protocol</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Onboarded</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'divide-y divide-slate-800/80' : 'divide-y divide-slate-50'}>
              {loading ? (
                <tr>
                   <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                         <Loader2 className="w-8 h-8 animate-spin text-indigo-400"/>
                         <p className={`font-medium text-sm ${bodyMutedClass}`}>Authenticating lists...</p>
                      </div>
                   </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-8 py-20 text-center">
                     <div className="flex flex-col items-center justify-center gap-4">
                         <div className={`w-16 h-16 rounded-full flex justify-center items-center ${isDark ? 'bg-[#17191A] border border-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
                             <UsersIcon className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} strokeWidth={1.5} />
                         </div>
                         <p className={`font-semibold text-lg tracking-tight ${headingClass}`}>No registered configurations</p>
                      </div>
                   </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className={`transition-colors group cursor-default ${isDark ? 'hover:bg-[#1f2025]' : 'hover:bg-slate-50/60'}`}>
                    <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                           {u.avatar ? (
                             <img src={u.avatar} alt={u.name} className={`w-10 h-10 rounded-[10px] object-cover shadow-sm shrink-0 ${isDark ? 'border border-slate-700' : 'border border-slate-300/50'}`} />
                           ) : (
                             <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center font-black shadow-sm shrink-0 ${isDark ? 'bg-[#17191A] border border-slate-700 text-slate-300' : 'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300/50 text-slate-600'}`}>
                               {u.name.charAt(0).toUpperCase()}
                             </div>
                           )}
                           <div className="flex flex-col">
                              <span className={`font-bold tracking-tight ${headingClass}`}>{u.name}</span>
                              <span className={`text-xs font-medium ${labelClass}`}>{u.email}</span>
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
                    <td className={`px-8 py-5 whitespace-nowrap text-sm font-semibold ${labelClass}`}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                        <button onClick={() => openForm(u)} className={`focus:outline-none transition p-2 rounded-lg hidden sm:inline-block ${isDark ? 'text-sky-400 hover:text-sky-300 hover:bg-[#17191A]' : 'text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                      <button 
                         onClick={() => handleDelete(u)} 
                         disabled={u.role === 'Admin'}
                         className={`focus:outline-none transition p-2 rounded-lg hidden sm:inline-block ml-1 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed ${isDark ? 'text-rose-400 hover:text-rose-300 hover:bg-[#17191A]' : 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'}`}
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
              <div className={`relative transform overflow-hidden rounded-[2rem] text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border ${isDark ? 'bg-[#26272E] border-slate-800' : 'bg-white border-white/20'}`}>
                <div className={`px-6 pt-5 pb-4 sm:p-8 sm:pb-6 relative ${isDark ? 'bg-[#26272E]' : 'bg-white'}`}>
                
                {/* Modal Decorative Blur */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none blur-3xl ${isDark ? 'bg-sky-500/15' : 'bg-indigo-500/10'}`}></div>
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                   <div>
                       <h3 className={`text-2xl font-black tracking-tight ${headingClass}`} id="modal-title">
                         Update Permissions
                       </h3>
                       <p className={`text-sm font-medium mt-1 ${bodyMutedClass}`}>
                         Modify security clearance and platform availability for {formData.name}.
                       </p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className={`focus:outline-none p-2 rounded-full transition-colors active:scale-95 border ${isDark ? 'text-slate-400 hover:text-white bg-[#17191A] hover:bg-[#1f2025] border-slate-800 hover:border-slate-700' : 'text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 border-transparent hover:border-slate-300'}`}>
                      <X className="w-5 h-5" />
                   </button>
                </div>
                
                <form id="userForm" onSubmit={handleSubmit} className="space-y-5 relative z-10">
                   <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest pl-1 mb-1.5 ${labelClass}`}>Registered Identity</label>
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full font-semibold rounded-xl px-4 py-3 outline-none transition-all placeholder:font-normal ${inputClass}`}
                      />
                   </div>

                   <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest pl-1 mb-1.5 ${labelClass}`}>Primary Email</label>
                      <input 
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full font-medium rounded-xl px-4 py-3 outline-none cursor-not-allowed ${isDark ? 'border border-slate-800 bg-[#17191A] text-slate-500' : 'border border-slate-200 bg-slate-100 text-slate-500'}`}
                        disabled
                      />
                      <p className={`text-[11px] font-medium tracking-wide mt-1.5 ml-1 ${labelClass}`}>Email addresses act as immutable account identifiers.</p>
                   </div>

                   <div className={`grid grid-cols-2 gap-5 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100/80'}`}>
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-widest pl-1 mb-1.5 ${labelClass}`}>Security Level</label>
                        <select 
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          disabled={roleLocked}
                          className={`w-full font-black rounded-xl px-4 py-3 outline-none transition-all disabled:cursor-not-allowed ${isDark ? 'border border-slate-800 bg-[#17191A] text-slate-100 focus:bg-[#17191A] focus:ring-sky-500/20 focus:border-sky-500 disabled:bg-[#17191A] disabled:text-slate-600' : 'border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400'}`}
                        >
                          <option value="Viewer">Viewer (Read-Only)</option>
                          <option value="Analyst">Analyst (Insights)</option>
                          <option value="Admin">Admin (Full Access)</option>
                        </select>
                        {roleLocked && (
                          <p className="text-[11px] text-amber-600 font-medium tracking-wide mt-1.5 ml-1">
                            This role is locked because at least one active admin must remain.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-widest pl-1 mb-1.5 ${labelClass}`}>Account Status</label>
                        <select 
                          value={formData.status}
                          onChange={(e) => {
                            if (isEditingLastActiveAdmin && e.target.value !== 'active') {
                              toast.error('You cannot deactivate the last active admin');
                              return;
                            }
                            setFormData({...formData, status: e.target.value});
                          }}
                          className={`w-full font-black rounded-xl px-4 py-3 outline-none transition-all ${isDark ? 'border border-slate-800 bg-[#17191A] text-slate-100 focus:bg-[#17191A] focus:ring-sky-500/20 focus:border-sky-500' : 'border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Suspended</option>
                        </select>
                        {statusLocked && (
                          <p className="text-[11px] text-amber-600 font-medium tracking-wide mt-1.5 ml-1">
                            The last active admin cannot be suspended.
                          </p>
                        )}
                      </div>
                   </div>
                </form>
              </div>
              <div className={`px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse sm:gap-3 border-t ${isDark ? 'bg-[#1f2025] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <button 
                  type="submit" 
                  form="userForm"
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-semibold transition-all focus:outline-none mb-3 sm:mb-0 ${isDark ? 'bg-[#156EF3] shadow-[0_14px_30px_rgba(21,110,243,0.35)] hover:brightness-110' : 'bg-slate-900 shadow-md hover:bg-slate-800'}`}
                >
                  Save Configuration
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold transition-colors focus:outline-none ${isDark ? 'text-slate-300 bg-[#17191A] border border-slate-800 hover:bg-[#1f2025]' : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'}`}
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
