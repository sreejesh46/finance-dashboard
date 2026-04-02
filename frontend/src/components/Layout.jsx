import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ReceiptText, Users, LogOut, Menu, TrendingUp, Bell, Search, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Clock } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs) {
    return twMerge(clsx(inputs));
}

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Debounced Search Effect
  useEffect(() => {
     if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
     }

     const timer = setTimeout(async () => {
        setIsSearching(true);
        try {
           const res = await axios.get('/records', { params: { search: searchQuery, limit: 5 } });
           setSearchResults(res.data.records || []);
           setShowSearchResults(true);
        } catch(e) {
           console.error("Search error", e);
        } finally {
           setIsSearching(false);
        }
     }, 300);

     return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchNotifications = async () => {
     try {
         const res = await axios.get('/notifications');
         setNotifications(res.data);
     } catch(e) {
         console.error("Failed to fetch notifications");
     }
  };

  useEffect(() => {
     if (user) {
         fetchNotifications();
     }
  }, [user]);

  useEffect(() => {
     const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
           setShowSearchResults(false);
        }
        if (notifRef.current && !notifRef.current.contains(event.target)) {
           setShowNotifications(false);
        }
     };
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
      try {
          await axios.put(`/notifications/${id}/read`);
          setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      } catch(e) {
          console.error(e);
      }
  };

  const markAllAsRead = async () => {
      try {
          await axios.put('/notifications/read-all');
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch(e) {
          console.error(e);
      }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Viewer', 'Analyst', 'Admin'] },
    { name: 'Financial Records', path: '/records', icon: ReceiptText, roles: ['Viewer', 'Analyst', 'Admin'] },
    { name: 'User Management', path: '/users', icon: Users, roles: ['Admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || 'Viewer'));

  return (
    <div className="flex bg-[#f8fafc] h-screen overflow-hidden text-slate-900 font-sans selection:bg-indigo-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-all"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Premium Dark Sidebar */}
      <div className={cx(
        "fixed inset-y-0 left-0 z-50 bg-slate-950 flex flex-col transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-20" : "w-72"
      )}>
        {/* Brand Header */}
        <div className={cx("flex h-20 items-center flex-shrink-0 bg-slate-950 border-b border-white/5 relative transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-6")}>
          <div className="flex items-center gap-3 text-white font-bold text-2xl tracking-tight">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-1.5 rounded-lg shadow-md shadow-indigo-500/30 flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <>
                <span>FinDash</span>
                <span className="text-[10px] uppercase tracking-widest bg-white/10 text-white/70 px-2 py-0.5 rounded-full ml-1 font-semibold border border-white/10">PRO</span>
              </>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cx("absolute hidden lg:flex items-center justify-center w-7 h-7 bg-slate-800 rounded-full border border-white/10 text-slate-400 hover:text-white transition-all z-50 hover:bg-slate-700 shadow-md shadow-black/50", 
              isCollapsed ? "-right-3.5" : "right-4"
            )}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 ml-0.5" /> : <ChevronLeft className="w-4 h-4 mr-0.5" />}
          </button>
        </div>
        
        {/* Navigation */}
        <div className={cx("flex flex-col flex-grow py-6 overflow-y-auto custom-scrollbar", isCollapsed ? "px-2" : "px-4")}>
          {!isCollapsed && <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Main Menu</p>}
          <nav className="flex-1 space-y-1.5">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) => cx(
                  "flex items-center gap-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isCollapsed ? "justify-center px-0" : "px-3",
                  isActive 
                    ? "text-white bg-indigo-600/10" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                {({ isActive }) => (
                  <>
                    <div className={cx(
                        "absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transition-all duration-300 rounded-r-md", 
                        isActive ? "scale-y-100" : "scale-y-0"
                    )}></div>
                    <item.icon className={cx("w-5 h-5 flex-shrink-0 transition-transform duration-300", 
                        isActive ? "text-indigo-400 scale-110" : "opacity-75 group-hover:opacity-100"
                    )} />
                    {!isCollapsed && <span className="relative z-10 font-semibold tracking-wide truncate">{item.name}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className={cx("bg-slate-950 mt-auto border-t border-white/5", isCollapsed ? "p-2" : "p-4")}>
           <Link to="/profile" className={cx("flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner hover:bg-white/10 transition-colors cursor-pointer group", isCollapsed ? "p-2 justify-center" : "p-3")}>
              {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover shadow-md shadow-indigo-500/20 border-2 border-slate-950 group-hover:scale-105 transition-transform duration-300" />
              ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 flex flex-shrink-0 items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 border-2 border-slate-950 group-hover:scale-105 transition-transform duration-300">
                      {user?.name?.charAt(0).toUpperCase()}
                  </div>
              )}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate drop-shadow-sm group-hover:text-indigo-300 transition-colors">{user?.name}</p>
                    <p className="text-xs text-indigo-300 font-medium tracking-wide shadow-sm">{user?.role}</p>
                </div>
              )}
           </Link>
           <button 
             onClick={handleLogout}
             title={isCollapsed ? "Log out" : undefined}
             className={cx("mt-3 flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold text-rose-400 rounded-xl hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-transparent hover:border-rose-500/20", isCollapsed ? "px-0" : "px-3")}
           >
             <LogOut className={isCollapsed ? "w-5 h-5" : "w-4 h-4"} />
             {!isCollapsed && <span>Log out</span>}
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-0 overflow-hidden relative">
        
        {/* Dynamic Frosted Topbar */}
        <div className="absolute top-0 w-full z-20 pointer-events-none">
             <div className="h-20 bg-gradient-to-b from-[#f8fafc] to-transparent"></div>
        </div>

        <div className="relative z-30 flex-shrink-0 flex h-20 items-center justify-between px-4 sm:px-8 border-b border-slate-200/60 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/40">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-indigo-600 focus:outline-none p-2 rounded-lg hover:bg-indigo-50 transition-colors lg:hidden mr-4"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 flex items-center justify-between lg:justify-end gap-6">
                
                {/* Search Bar */}
                <div ref={searchRef} className="hidden sm:flex flex-col max-w-sm w-full relative">
                    <div className="relative flex items-center">
                        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                        <input 
                           type="text" 
                           placeholder="Quick search..." 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           onFocus={() => { if (searchQuery.trim()) setShowSearchResults(true); }}
                           className="w-full pl-9 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm" 
                        />
                        {isSearching && <Loader2 className="w-4 h-4 absolute right-3 text-indigo-500 animate-spin" />}
                    </div>
                    
                    {/* Search Dropdown */}
                    {showSearchResults && (
                        <div className="absolute top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden z-50">
                            {searchResults.length > 0 ? (
                                <ul className="divide-y divide-slate-100">
                                    {searchResults.map(record => (
                                        <li key={record._id}>
                                           <Link 
                                             to="/records" 
                                             onClick={() => { setShowSearchResults(false); setSearchQuery(''); }}
                                             className="block p-3 hover:bg-slate-50 transition-colors"
                                           >
                                              <p className="text-sm font-semibold text-slate-800 tracking-tight">{record.category}</p>
                                              <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-slate-500 truncate max-w-[180px]">{record.notes || 'No description'}</p>
                                                <p className={cx("text-xs font-bold", record.type === 'income' ? 'text-emerald-500' : 'text-slate-600')}>
                                                    {record.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(record.amount)}
                                                </p>
                                              </div>
                                           </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-sm font-medium text-slate-500">No records found</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div ref={notifRef} className="relative">
                    <button 
                        onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                        className="relative p-2 text-slate-400 hover:text-indigo-600 bg-white rounded-full shadow-sm border border-slate-200/60 hover:shadow-md transition-all active:scale-95"
                    >
                        {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white">{unreadCount}</span>}
                        <Bell className="w-5 h-5" />
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 max-h-96 flex flex-col bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden z-50">
                            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h4 className="text-sm font-black text-slate-800">Notifications</h4>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs font-bold text-indigo-500 hover:text-indigo-600">Mark all as read</button>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? (
                                    <ul className="divide-y divide-slate-50">
                                        {notifications.map(notif => (
                                            <li key={notif._id} className={cx("p-3 flex gap-3 transition-colors", notif.isRead ? "bg-white opacity-60" : "bg-indigo-50/30")}>
                                                <div className="mt-0.5">
                                                    {notif.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                                                     notif.type === 'alert' ? <Bell className="w-4 h-4 text-rose-500" /> :
                                                     <Clock className="w-4 h-4 text-indigo-400" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={cx("text-sm transition-all", notif.isRead ? "text-slate-600 font-medium" : "text-slate-800 font-semibold")}>{notif.message}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1.5">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                {!notif.isRead && (
                                                    <button onClick={() => markAsRead(notif._id)} className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 self-center hover:scale-150 transition-transform" title="Mark as read" />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-6 text-center text-sm font-medium text-slate-500 flex flex-col items-center">
                                        <Bell className="w-8 h-8 text-slate-200 mb-2" />
                                        You're all caught up!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-[#f8fafc] scroll-smooth">
          {/* Subtle Background Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="py-8 px-4 sm:px-8 h-full relative z-10 mx-auto max-w-[1600px]">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
