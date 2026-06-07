import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  getAuthToken,
  setAuthToken,
  getUserData,
  setUserData,
  api
} from "./utils/api";
import DashboardView from "./components/DashboardView";
import LeadsView from "./components/LeadsView";
import DealsView from "./components/DealsView";
import CustomersView from "./components/CustomersView";
import EmailView from "./components/EmailView";
import ActivitiesView from "./components/ActivitiesView";
import ReportsView from "./components/ReportsView";
import AdminView from "./components/AdminView";
import {
  Briefcase,
  Users,
  LayoutDashboard,
  Calendar,
  Mail,
  FileSpreadsheet,
  ShieldAlert,
  LogOut,
  Sun,
  Moon,
  Clock,
  Bell,
  UserCheck,
  Menu,
  X,
  Landmark
} from "lucide-react";
export default function App() {
  const [token, setToken] = useState(getAuthToken());
  const [currentUser, setCurrentUser] = useState(getUserData());
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("Sales Executive");
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [utcTime, setUtcTime] = useState((/* @__PURE__ */ new Date()).toUTCString());
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);
  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime((/* @__PURE__ */ new Date()).toUTCString());
    }, 1e3);
    return () => clearInterval(interval);
  }, []);
  const syncAuthenticationState = async () => {
    const currentToken = getAuthToken();
    if (currentToken) {
      try {
        const user = await api.get("/auth/me");
        setCurrentUser(user);
        setUserData(user);
        fetchNotifications();
      } catch {
        handleLogout();
      }
    }
  };
  useEffect(() => {
    if (token) {
      syncAuthenticationState();
    }
  }, [token]);
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const data = await api.get("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    if (token) {
      const timer = setInterval(fetchNotifications, 12e3);
      return () => clearInterval(timer);
    }
  }, [token]);
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    try {
      setAuthLoading(true);
      setAuthError(null);
      const res = await api.post("/auth/login", { email: loginEmail, password: loginPassword });
      setAuthToken(res.token);
      setToken(res.token);
      setCurrentUser(res.user);
      setUserData(res.user);
    } catch (err) {
      setAuthError(err.message || "Credentials invalid. Please retry.");
    } finally {
      setAuthLoading(false);
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regName) return;
    try {
      setAuthLoading(true);
      setAuthError(null);
      const res = await api.post("/auth/register", {
        email: regEmail,
        password: regPassword,
        name: regName,
        role: regRole
      });
      setAuthToken(res.token);
      setToken(res.token);
      setCurrentUser(res.user);
      setUserData(res.user);
    } catch (err) {
      setAuthError(err.message || "Registration failure.");
    } finally {
      setAuthLoading(false);
    }
  };
  const handleLogout = () => {
    setAuthToken(null);
    setUserData(null);
    setToken(null);
    setCurrentUser(null);
    setActiveTab("Dashboard");
    setNotifications([]);
    setUnreadCount(0);
  };
  const handleMarkNotificationReadApp = async (noteId) => {
    try {
      const updated = await api.put(`/notifications/${noteId}/read`);
      setNotifications(notifications.map((n) => n.id === noteId ? updated : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
    }
  };
  const applyDemoCredential = (email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setIsRegisterMode(false);
  };
  const handleTabNavigate = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };
  const TABS = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Leads", icon: Users },
    { name: "Deals", icon: Briefcase },
    { name: "Customers", icon: Landmark },
    { name: "Email", icon: Mail },
    { name: "Activities", icon: Calendar },
    { name: "Reports", icon: FileSpreadsheet },
    { name: "Admin", icon: ShieldAlert, adminOnly: true }
  ];
  if (!token || !currentUser) {
    return <div className={`min-h-screen flex items-center justify-center p-4 bg-gray-50 text-gray-900 transition-colors ${darkMode ? "dark:bg-[#030712] dark:text-gray-100" : ""}`}>
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl relative">
          
          {
      /* Brand Panel */
    }
          <div className="space-y-6 md:pr-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-mono font-bold">
                C
              </div>
              <div>
                <h1 className="text-xl font-bold font-display tracking-tight text-gray-950 dark:text-white">Enterprise CRM</h1>
                <span className="text-4xs font-mono text-gray-400">REST SYSTEM LAYER v1.0.4</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-md font-bold text-gray-900 dark:text-white font-display">Simulated Sandbox Environment</h2>
              <p className="text-xs text-gray-500 leading-normal">
                This app runs on combined client-side React + node server assets, backed with secure disk files persistence in memory database.
              </p>
            </div>

            {
      /* DEMO PROFILES SPEED CONFIG SHEET */
    }
            <div className="space-y-2.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-805/40 border border-gray-100 dark:border-gray-800">
              <h3 className="text-2xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-primary-500" /> Presets Evaluators Accounts
              </h3>
              <p className="text-3xs text-gray-400 leading-normal mb-1">Click any profile beneath to instantly load testing qualifications:</p>
              
              <div className="space-y-2 text-2xs">
                <button
      onClick={() => applyDemoCredential("admin@crm.com", "admin123")}
      className="w-full p-2 text-left bg-white dark:bg-gray-900 hover:border-primary-500 border border-gray-150 dark:border-gray-800 rounded-lg flex justify-between items-center transition cursor-pointer"
    >
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Sarah Jenkins</div>
                    <div className="text-[10px] text-gray-400">admin@crm.com &middot; password: admin123</div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-300">Admin</span>
                </button>

                <button
      onClick={() => applyDemoCredential("manager@crm.com", "manager123")}
      className="w-full p-2 text-left bg-white dark:bg-gray-900 hover:border-primary-500 border border-gray-150 dark:border-gray-800 rounded-lg flex justify-between items-center transition cursor-pointer"
    >
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Marcus Vance</div>
                    <div className="text-[10px] text-gray-400">manager@crm.com &middot; password: manager123</div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-300">Manager</span>
                </button>

                <button
      onClick={() => applyDemoCredential("executive1@crm.com", "sales123")}
      className="w-full p-2 text-left bg-white dark:bg-gray-900 hover:border-primary-500 border border-gray-150 dark:border-gray-800 rounded-lg flex justify-between items-center transition cursor-pointer"
    >
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Elena Rostova</div>
                    <div className="text-[10px] text-gray-400">executive1@crm.com &middot; password: sales123</div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-300">Executive</span>
                </button>
              </div>
            </div>
          </div>

          {
      /* Login/Register Form */
    }
          <div>
            {!isRegisterMode ? <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <h2 className="text-xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Secure Log In</h2>
                  <p className="text-gray-400 mt-1">Enter registered email address and credentials coordinates to proceed.</p>
                </div>

                {authError && <div className="px-3.5 py-2.5 rounded-xl bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-150 dark:border-red-900/30 font-semibold leading-normal">
                    {authError}
                  </div>}

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 dark:text-gray-350">Email Address</label>
                  <input
      type="email"
      required
      placeholder="e.g. admin@crm.com"
      value={loginEmail}
      onChange={(e) => setLoginEmail(e.target.value)}
      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-805"
    />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 dark:text-gray-350">Password Key</label>
                  <input
      type="password"
      required
      placeholder="Your password"
      value={loginPassword}
      onChange={(e) => setLoginPassword(e.target.value)}
      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-805"
    />
                </div>

                <div className="pt-2">
                  <button
      type="submit"
      disabled={authLoading}
      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
    >
                    {authLoading ? "Signing in..." : "Enter System Realm"}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <span className="text-gray-400">Need a distinct account? </span>
                  <button
      type="button"
      onClick={() => {
        setIsRegisterMode(true);
        setAuthError(null);
      }}
      className="text-primary-500 hover:underline font-bold cursor-pointer"
    >
                    Register free
                  </button>
                </div>
              </form> : <form onSubmit={handleRegister} className="space-y-4 text-xs font-sans">
                <div>
                  <h2 className="text-xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Register Account</h2>
                  <p className="text-gray-400 mt-1">Establish custom workspace logins to evaluate role-based controls.</p>
                </div>

                {authError && <div className="px-3.5 py-2.5 rounded-xl bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-150 dark:border-red-900/30 font-semibold leading-normal">
                    {authError}
                  </div>}

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 dark:text-gray-355">Full Name</label>
                  <input
      type="text"
      required
      placeholder="e.g. John Doe"
      value={regName}
      onChange={(e) => setRegName(e.target.value)}
      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-805"
    />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 dark:text-gray-355">Email Address</label>
                  <input
      type="email"
      required
      placeholder="e.g. user@crm.com"
      value={regEmail}
      onChange={(e) => setRegEmail(e.target.value)}
      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-805"
    />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 dark:text-gray-355">Password Key</label>
                  <input
      type="password"
      required
      placeholder="Choose password"
      value={regPassword}
      onChange={(e) => setRegPassword(e.target.value)}
      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-805"
    />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-gray-700 dark:text-gray-355">Select System Role Privileges</label>
                  <select
      value={regRole}
      onChange={(e) => setRegRole(e.target.value)}
      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-805 text-gray-800 dark:text-gray-250"
    >
                    <option value="Sales Executive">Sales Executive (Standard CRM privileges)</option>
                    <option value="Sales Manager">Sales Manager (Can generate reports, delete entries)</option>
                    <option value="Admin">Admin (Full administrative configurations override)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
      type="submit"
      disabled={authLoading}
      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center"
    >
                    {authLoading ? "Creating account..." : "Create Account and Enter"}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <span className="text-gray-400">Already registered? </span>
                  <button
      type="button"
      onClick={() => {
        setIsRegisterMode(false);
        setAuthError(null);
      }}
      className="text-primary-500 hover:underline font-bold cursor-pointer"
    >
                    Log In
                  </button>
                </div>
              </form>}
          </div>

          {
      /* Quick dark mode toggle on login panel top corner */
    }
          <button
      type="button"
      onClick={() => setDarkMode(!darkMode)}
      className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-200 cursor-pointer"
    >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>
      </div>;
  }
  const renderTab = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardView darkMode={darkMode} onNavigate={handleTabNavigate} />;
      case "Leads":
        return <LeadsView currentUser={currentUser} />;
      case "Deals":
        return <DealsView currentUser={currentUser} />;
      case "Customers":
        return <CustomersView currentUser={currentUser} />;
      case "Email":
        return <EmailView currentUser={currentUser} />;
      case "Activities":
        return <ActivitiesView />;
      case "Reports":
        return <ReportsView />;
      case "Admin":
        return <AdminView currentUser={currentUser} />;
      default:
        return <DashboardView darkMode={darkMode} onNavigate={handleTabNavigate} />;
    }
  };
  return <div className={`min-h-screen text-gray-900 bg-gray-50/50 transition-colors ${darkMode ? "dark:bg-[#030712] dark:text-gray-100" : ""}`}>
      
      {
    /* MOBILE HEADER */
  }
      <div className="lg:hidden p-4 flex items-center justify-between border-b bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white font-mono font-bold text-xs">C</div>
          <span className="font-bold text-sm tracking-tight text-gray-950 dark:text-white">CRM Portal</span>
        </div>

        <div className="flex items-center gap-2">
          <button
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg cursor-pointer text-gray-600 dark:text-gray-400"
  >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {
    /* MOBILE SLIDE-OVER NAVIGATION PANEL */
  }
      <AnimatePresence>
        {mobileMenuOpen && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/40 dark:bg-black/60 lg:hidden z-40 flex justify-end"
  >
            <motion.div
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    className="w-64 h-full bg-white dark:bg-gray-900 p-5 flex flex-col justify-between"
  >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-400">Main Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-400"><X className="w-4 h-4" /></button>
                </div>

                <nav className="space-y-1.5 text-xs font-semibold">
                  {TABS.map((tab) => {
    if (tab.adminOnly && currentUser.role === "Sales Executive") return null;
    const Icon = tab.icon;
    return <button
      key={tab.name}
      onClick={() => handleTabNavigate(tab.name)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition cursor-pointer text-left ${activeTab === tab.name ? "bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-300" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850"}`}
    >
                        <Icon className="w-4 h-4" /> {tab.name}
                      </button>;
  })}
                </nav>
              </div>

              {
    /* Mobile logout and system switch details */
  }
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                <div className="text-2xs text-gray-400 truncate">Login: {currentUser.name}</div>
                <button
    onClick={handleLogout}
    className="w-full flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl font-semibold text-xs cursor-pointer"
  >
                  <LogOut className="w-4 h-4" /> End Session
                </button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      <div className="flex">
        
        {
    /* DESKTOP PERMANENT NAVIGATION SIDEBAR */
  }
        <aside className="hidden lg:flex flex-col justify-between w-64 h-screen border-r border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-5 sticky top-0 flex-shrink-0 z-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white font-mono font-bold text-sm shadow-xs">
                C
              </div>
              <div>
                <h1 className="text-md font-bold tracking-tight text-gray-950 dark:text-white">Enterprise CRM</h1>
                <span className="text-[9px] font-mono font-medium text-emerald-500 block uppercase">Operational Node</span>
              </div>
            </div>

            {
    /* Sidebar selection */
  }
            <nav className="space-y-1.5 text-xs font-semibold">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider pl-3 block mb-2">Workspace Navigation</span>
              {TABS.map((tab) => {
    if (tab.adminOnly && currentUser.role === "Sales Executive") return null;
    const Icon = tab.icon;
    return <button
      key={tab.name}
      onClick={() => handleTabNavigate(tab.name)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition cursor-pointer text-left ${activeTab === tab.name ? "bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-300 font-bold ring-1 ring-primary-500/10" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850"}`}
    >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{tab.name}</span>
                  </button>;
  })}
            </nav>
          </div>

          {
    /* User Profile Card bottom of Sidebar */
  }
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
            <div className="flex items-center gap-2.5 p-1 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-gray-150 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-primary-600 uppercase">
                {currentUser.name.substring(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-gray-900 dark:text-white truncate" title={currentUser.name}>{currentUser.name}</div>
                <div className="text-3xs text-gray-400 truncate">{currentUser.role}</div>
              </div>
            </div>

            <button
    onClick={handleLogout}
    className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold text-xs transition-colors cursor-pointer"
  >
              <LogOut className="w-4.5 h-4.5" /> Log Out Workspace
            </button>
          </div>
        </aside>

        {
    /* MAIN BODY AND UPPER NAVIGATION CONTAINER */
  }
        <main className="flex-1 w-full min-w-0 flex flex-col min-h-screen">
          
          {
    /* TOP HEADER CONTROLS (Common Desktop Layout) */
  }
          <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-white dark:bg-[#111827]/40 border-b border-gray-150 dark:border-gray-850/60 sticky top-0 z-25 backdrop-blur-md">
            
            {
    /* Server Clock Ticker */
  }
            <div className="flex items-center gap-2 text-2xs text-gray-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-primary-500" />
              <span>TIME: {utcTime} (UTC)</span>
            </div>

            {
    /* Notification triggers, theme selection */
  }
            <div className="flex items-center gap-4 relative">
              
              {
    /* Dark mode button */
  }
              <button
    onClick={() => setDarkMode(!darkMode)}
    className="p-1 px-2.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-105 dark:hover:bg-gray-850 transition flex items-center gap-1 text-2xs font-bold cursor-pointer"
    title="Toggle visual style"
  >
                {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-purple-600" />}
                <span>{darkMode ? "Light" : "Dark"} Mode</span>
              </button>

              {
    /* Notification badge and popdown */
  }
              <div className="relative">
                <button
    onClick={() => {
      setShowNotificationsDropdown(!showNotificationsDropdown);
      fetchNotifications();
    }}
    className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850 relative cursor-pointer"
    title="Check system notifications"
  >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>}
                </button>

                {
    /* Popdown notifications menu */
  }
                <AnimatePresence>
                  {showNotificationsDropdown && <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowNotificationsDropdown(false)} />
                      <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-4 z-40 space-y-3 text-xs"
  >
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800 font-medium">
                          <span className="font-bold text-gray-905 dark:text-white uppercase tracking-wider">Alerts & Reminders</span>
                          {unreadCount > 0 && <span className="bg-rose-100 text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{unreadCount} Pending</span>}
                        </div>

                        <div className="space-y-2">
                          {notifications.length > 0 ? notifications.slice(0, 5).map((note) => <div
    key={note.id}
    className={`p-2.5 rounded-lg border text-4xs space-y-0.5 ${note.read ? "bg-gray-50/50 dark:bg-gray-900 opacity-60" : "bg-primary-50/15 dark:bg-primary-950/10 border-primary-50 dark:border-primary-950 shadow-3xs"}`}
  >
                                <div className="flex justify-between text-4xs text-gray-400">
                                  <span className="font-bold text-primary-500 uppercase">{note.type}</span>
                                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-2xs text-gray-900 dark:text-white">{note.title}</h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-450 leading-relaxed">{note.message}</p>
                                {!note.read && <button
    onClick={() => handleMarkNotificationReadApp(note.id)}
    className="text-[9px] font-bold text-primary-500 hover:underline pt-1 cursor-pointer"
  >
                                    Mark Read
                                  </button>}
                              </div>) : <div className="text-3xs italic text-gray-400 text-center py-4">No notifications yet.</div>}
                        </div>
                      </motion.div>
                    </>}
                </AnimatePresence>
              </div>

            </div>
          </header>

          {
    /* CENTRAL CONTENT GRID WITH ROUTED TAB VIEW */
  }
          <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderTab()}
          </div>

        </main>
      </div>
    </div>;
}
