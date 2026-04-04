import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, ReceiptText, Users, LogOut, TrendingUp, Bell, Search, Loader2, CheckCircle2, Clock, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs) {
    return twMerge(clsx(inputs));
}

const Layout = () => {
  const { user, logout, showAuthTransition, hideAuthTransition } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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
  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen((prev) => !prev);
      return;
    }
    setIsCollapsed((prev) => !prev);
  };

  const handleLogout = () => {
    showAuthTransition('Signing you out...');
    window.setTimeout(() => {
      logout();
      navigate('/login');
      window.setTimeout(() => {
        hideAuthTransition();
      }, 220);
    }, 320);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Viewer', 'Analyst', 'Admin'] },
    { name: 'Financial Records', path: '/records', icon: ReceiptText, roles: ['Analyst', 'Admin'] },
    { name: 'User Management', path: '/users', icon: Users, roles: ['Admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || 'Viewer'));

  return (
    <div className={cx(
      "flex h-screen overflow-hidden font-sans transition-colors duration-300 selection:bg-sky-100",
      isDark ? "bg-[#17191A] text-slate-100" : "bg-[#dfe4ea] text-slate-900"
    )}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className={cx(
            "fixed inset-0 z-40 backdrop-blur-sm lg:hidden transition-all",
            isDark ? "bg-slate-950/50" : "bg-slate-900/20"
          )}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cx(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transform transition-[width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0 lg:static lg:inset-auto",
        isDark
          ? "border-slate-800/80 bg-[#111315]/95 shadow-[0_20px_60px_rgba(2,6,23,0.45)]"
          : "border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.06)]",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-20" : "w-72"
      )}>
        {/* Brand Header */}
        <div className={cx(
          "flex h-20 items-center flex-shrink-0 relative transition-[padding,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isDark ? "border-b border-slate-800/80" : "border-b border-slate-200",
          isCollapsed ? "justify-center px-3" : "px-6"
        )}>
          <div className={cx(
            "relative flex items-center w-full font-bold text-2xl tracking-tight",
            isDark ? "text-slate-50" : "text-slate-950"
          )}>
            <div className={cx(
              "p-1.5 rounded-xl shadow-sm flex-shrink-0",
              isDark ? "bg-[#156EF3] shadow-[0_12px_30px_rgba(21,110,243,0.35)]" : "bg-slate-950"
            )}>
                <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className={cx(
              "absolute left-12 top-1/2 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap transition-all duration-200 ease-out",
              isCollapsed ? "pointer-events-none translate-x-2 opacity-0" : "translate-x-0 opacity-100"
            )}>
              <span className="whitespace-nowrap">FinDash</span>
              <span className={cx(
                "text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ml-1 font-semibold border whitespace-nowrap",
              isDark ? "bg-[#26272E] text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200"
              )}>PRO</span>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className={cx("flex flex-col flex-grow py-6 overflow-y-auto custom-scrollbar transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", isCollapsed ? "px-2" : "px-4")}>
          <div className={cx(
            "overflow-hidden transition-all duration-300",
            isCollapsed ? "max-h-0 opacity-0 mb-0" : "max-h-10 opacity-100 mb-3"
          )}>
            <p className={cx(
              "px-3 text-xs font-semibold uppercase tracking-wider",
              isDark ? "text-slate-500" : "text-slate-400"
            )}>Main Menu</p>
          </div>
          <nav className="flex-1 space-y-1.5">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) => cx(
                  "flex items-center gap-3 py-3 text-sm font-medium rounded-2xl border border-transparent bg-transparent transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-out group relative overflow-hidden will-change-transform",
                  isCollapsed ? "justify-center px-0" : "justify-start px-3",
                  isActive 
                    ? isDark
                      ? "text-white bg-[#26272E] border-slate-700 shadow-[0_10px_30px_rgba(2,6,23,0.25)]"
                      : "text-slate-950 bg-white border-slate-200 shadow-sm"
                    : isDark
                      ? "text-slate-400 hover:bg-[#26272E]/70 hover:text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                )}
              >
                {({ isActive }) => (
                  <>
                    <div className={cx(
                        "absolute left-0 top-0 bottom-0 w-1 bg-[#156EF3] transition-transform duration-300 ease-out rounded-r-md", 
                        isActive ? "scale-y-100" : "scale-y-0"
                    )}></div>
                    <item.icon className={cx("w-5 h-5 flex-shrink-0 transition-transform duration-300", 
                        isActive ? "text-[#156EF3] scale-105" : "opacity-75 group-hover:opacity-100"
                    )} />
                    <span className={cx(
                      "pointer-events-none absolute left-12 right-3 top-1/2 z-10 -translate-y-1/2 truncate font-semibold tracking-wide transition-all duration-300 ease-out",
                      isCollapsed ? "translate-x-2 opacity-0" : "translate-x-0 opacity-100"
                    )}>
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className={cx("mt-auto border-t border-slate-200", isCollapsed ? "p-2" : "p-4")}>
           <Link to="/profile" className={cx(
             "flex items-center gap-3 rounded-3xl transition-colors cursor-pointer group border",
             isDark
               ? "bg-[#26272E] border-slate-800 hover:bg-[#2d2e36]"
               : "bg-slate-50 border-slate-200 hover:bg-white",
             isCollapsed ? "p-2 justify-center" : "p-3"
           )}>
              {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white group-hover:scale-105 transition-transform duration-300" />
              ) : (
                  <div className={cx(
                    "w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform duration-300",
                    isDark ? "bg-[#156EF3] border-2 border-[#111315]" : "bg-slate-950 border-2 border-white"
                  )}>
                      {user?.name?.charAt(0).toUpperCase()}
                  </div>
              )}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                    <p className={cx(
                      "text-sm font-bold truncate transition-colors",
                      isDark ? "text-slate-100" : "text-slate-950"
                    )}>{user?.name}</p>
                    <p className={cx(
                      "text-xs font-medium tracking-wide",
                      isDark ? "text-slate-500" : "text-slate-500"
                    )}>{user?.role}</p>
                </div>
              )}
           </Link>
           <button 
             onClick={handleLogout}
             title={isCollapsed ? "Log out" : undefined}
             className={cx(
               "relative mt-3 flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-2xl transition-all border border-transparent cursor-pointer",
               isDark
                 ? "text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
                 : "text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100",
               isCollapsed ? "px-0" : "justify-start px-3"
             )}
           >
             <LogOut className={isCollapsed ? "w-5 h-5" : "w-4 h-4"} />
             <span className={cx(
               "pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 whitespace-nowrap transition-all duration-200 ease-out",
               isCollapsed ? "translate-x-2 opacity-0" : "translate-x-0 opacity-100"
             )}>
               Log out
             </span>
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-0 min-w-0 overflow-hidden relative">
        
        {/* Dynamic Frosted Topbar */}
        <div className="absolute top-0 w-full z-20 pointer-events-none">
             <div className={cx(
               "h-20 bg-gradient-to-b",
               isDark ? "from-[#17191A] to-transparent" : "from-[#dfe4ea] to-transparent"
             )}></div>
        </div>

        <div className={cx(
          "relative z-30 flex-shrink-0 flex h-20 items-center justify-between px-4 sm:px-8 border-b backdrop-blur-md transition-colors duration-300",
          isDark
            ? "border-slate-800/80 bg-[#17191A]/90 supports-[backdrop-filter]:bg-[#17191A]/80"
            : "border-slate-200 bg-white/80 supports-[backdrop-filter]:bg-white/70"
        )}>
            <button
              onClick={toggleSidebar}
              className={cx(
                "focus:outline-none p-2 rounded-xl transition-all duration-300 mr-4 cursor-pointer border",
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-[#26272E] border-slate-800 hover:border-slate-700"
                  : "text-slate-500 hover:text-slate-950 hover:bg-slate-100 border-transparent hover:border-slate-200"
              )}
              aria-label={isCollapsed || !sidebarOpen ? "Open sidebar" : "Close sidebar"}
            >
              <div className="relative h-6 w-6">
                <PanelLeftOpen className={cx(
                  "absolute inset-0 w-6 h-6 transition-all duration-300",
                  isCollapsed || !sidebarOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
                )} />
                <PanelLeftClose className={cx(
                  "absolute inset-0 w-6 h-6 transition-all duration-300",
                  isCollapsed || !sidebarOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
                )} />
              </div>
            </button>
            <div className="flex-1 min-w-0 flex items-center justify-between lg:justify-end gap-6">
                
                {/* Search Bar */}
                {user?.role !== 'Viewer' && (
                <div ref={searchRef} className="hidden sm:flex flex-col max-w-sm w-full min-w-0 relative">
                    <div className="relative flex items-center">
                        <Search className={cx("w-4 h-4 absolute left-3", isDark ? "text-slate-500" : "text-slate-400")} />
                        <input 
                           type="text" 
                           placeholder="Quick search..." 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           onFocus={() => { if (searchQuery.trim()) setShowSearchResults(true); }}
                           className={cx(
                            "w-full pl-9 pr-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-400 transition-all shadow-sm",
                            isDark
                              ? "bg-[#26272E] border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:bg-[#26272E]"
                              : "bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                           )} 
                        />
                        {isSearching && <Loader2 className="w-4 h-4 absolute right-3 text-sky-600 animate-spin" />}
                    </div>
                    
                    {/* Search Dropdown */}
                    {showSearchResults && (
                        <div className={cx(
                          "absolute top-full mt-2 w-full rounded-2xl overflow-hidden z-50 border",
                          isDark
                            ? "bg-[#26272E] border-slate-800 shadow-xl shadow-black/30"
                            : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
                        )}>
                            {searchResults.length > 0 ? (
                                <ul className={cx(isDark ? "divide-y divide-slate-800" : "divide-y divide-slate-100")}>
                                    {searchResults.map(record => (
                                        <li key={record._id}>
                                           <Link 
                                             to="/records" 
                                             onClick={() => { setShowSearchResults(false); setSearchQuery(''); }}
                                             className={cx(
                                               "block p-3 transition-colors",
                                               isDark ? "hover:bg-[#1f2025]" : "hover:bg-slate-50"
                                             )}
                                           >
                                              <p className={cx("text-sm font-semibold tracking-tight", isDark ? "text-slate-100" : "text-slate-800")}>{record.category}</p>
                                              <div className="flex justify-between items-center mt-1">
                                                <p className={cx("text-xs truncate max-w-[180px]", isDark ? "text-slate-400" : "text-slate-500")}>{record.notes || 'No description'}</p>
                                                <p className={cx("text-xs font-bold", record.type === 'income' ? 'text-emerald-500' : 'text-slate-600')}>
                                                    {record.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(record.amount)}
                                                </p>
                                              </div>
                                           </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className={cx("p-4 text-center text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>No records found</div>
                            )}
                        </div>
                    )}
                </div>
                )}

                <button
                    onClick={toggleTheme}
                    className={cx(
                      "relative p-2 rounded-full shadow-sm border transition-all active:scale-95 cursor-pointer",
                      isDark
                        ? "text-amber-300 bg-[#26272E] border-slate-800 hover:text-amber-200 hover:border-slate-700"
                        : "text-slate-500 bg-slate-50 border-slate-200 hover:text-slate-950 hover:shadow-md"
                    )}
                    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <div ref={notifRef} className="relative">
                    <button 
                        onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                        className={cx(
                          "relative p-2 rounded-full shadow-sm border transition-all active:scale-95 cursor-pointer",
                          isDark
                            ? "text-slate-400 hover:text-white bg-[#26272E] border-slate-800 hover:border-slate-700"
                            : "text-slate-400 hover:text-slate-950 bg-slate-50 border-slate-200 hover:shadow-md"
                        )}
                    >
                        {unreadCount > 0 && <span className={cx(
                          "absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white",
                          isDark ? "border-2 border-[#17191A]" : "border-2 border-white"
                        )}>{unreadCount}</span>}
                        <Bell className="w-5 h-5" />
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className={cx(
                          "absolute top-full right-0 mt-2 w-80 max-h-96 flex flex-col rounded-2xl overflow-hidden z-50 border",
                          isDark
                            ? "bg-[#26272E] border-slate-800 shadow-xl shadow-black/30"
                            : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
                        )}>
                            <div className={cx(
                              "p-3 border-b flex items-center justify-between",
                              isDark ? "border-slate-800 bg-[#1f2025]" : "border-slate-200 bg-slate-50/70"
                            )}>
                                <h4 className={cx("text-sm font-black", isDark ? "text-slate-100" : "text-slate-800")}>Notifications</h4>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs font-bold text-sky-600 hover:text-sky-700">Mark all as read</button>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? (
                                    <ul className={cx(isDark ? "divide-y divide-slate-800" : "divide-y divide-slate-50")}>
                                        {notifications.map(notif => (
                                            <li key={notif._id} className={cx(
                                              "p-3 flex gap-3 transition-colors",
                                              notif.isRead
                                                ? "opacity-60"
                                                : isDark
                                                  ? "bg-sky-500/10"
                                                  : "bg-sky-50/50"
                                            )}>
                                                <div className="mt-0.5">
                                                    {notif.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                                                     notif.type === 'alert' ? <Bell className="w-4 h-4 text-rose-500" /> :
                                                     <Clock className="w-4 h-4 text-sky-500" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={cx(
                                                      "text-sm transition-all",
                                                      notif.isRead
                                                        ? isDark
                                                          ? "text-slate-400 font-medium"
                                                          : "text-slate-600 font-medium"
                                                        : isDark
                                                          ? "text-slate-100 font-semibold"
                                                          : "text-slate-800 font-semibold"
                                                    )}>{notif.message}</p>
                                                    <p className={cx(
                                                      "text-[10px] font-semibold uppercase tracking-wider mt-1.5",
                                                      isDark ? "text-slate-500" : "text-slate-400"
                                                    )}>{new Date(notif.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                {!notif.isRead && (
                                                    <button onClick={() => markAsRead(notif._id)} className="w-2 h-2 rounded-full bg-sky-600 flex-shrink-0 self-center hover:scale-150 transition-transform" title="Mark as read" />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className={cx(
                                      "p-6 text-center text-sm font-medium flex flex-col items-center",
                                      isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        <Bell className={cx("w-8 h-8 mb-2", isDark ? "text-slate-700" : "text-slate-200")} />
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
        <main className={cx(
          "flex-1 relative overflow-y-auto overflow-x-hidden focus:outline-none scroll-smooth transition-colors duration-300",
          isDark ? "bg-transparent" : "bg-transparent"
        )}>
          {/* Subtle Background Elements */}
          <div className={cx(
            "absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full pointer-events-none",
            isDark ? "bg-sky-500/8" : "bg-white/40"
          )}></div>
          <div className={cx(
            "absolute top-[20%] right-[-10%] w-[30%] h-[40%] blur-[120px] rounded-full pointer-events-none",
            isDark ? "bg-indigo-500/8" : "bg-sky-200/25"
          )}></div>

          <div className="py-8 px-4 sm:px-8 h-full relative z-10 mx-auto max-w-[1600px] min-w-0">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
