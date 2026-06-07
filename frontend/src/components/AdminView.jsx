import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { ShieldCheck, Settings, Trash2, RefreshCw, AlertTriangle, Save } from "lucide-react";
export default function AdminView({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [leadTarget, setLeadTarget] = useState(30);
  const [revenueTarget, setRevenueTarget] = useState(15e4);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("Sales Executive");
  const [savingSettings, setSavingSettings] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const loadAdminMetrics = async () => {
    try {
      setLoading(true);
      const [usersList, systemSettings] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/settings")
      ]);
      setUsers(usersList);
      setSettings(systemSettings);
      setCompanyName(systemSettings.companyName);
      setCurrency(systemSettings.currency);
      setLeadTarget(systemSettings.leadConversionRateTarget);
      setRevenueTarget(systemSettings.monthlyRevenueTarget);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAdminMetrics();
  }, []);
  const handleUpdateRole = async (userId, targetRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: targetRole });
      setUsers(users.map((u) => u.id === userId ? { ...u, role: targetRole } : u));
    } catch (err) {
      alert(err.message || "Failure updating user privilege role.");
    }
  };
  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      alert("You are strictly forbidden from deleting your own administrative login.");
      return;
    }
    if (!confirm("Purge this staff completely from the network access?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.message || "Purging failed.");
    }
  };
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const payload = {
        companyName,
        currency,
        leadConversionRateTarget: Number(leadTarget),
        monthlyRevenueTarget: Number(revenueTarget)
      };
      const updated = await api.put("/admin/settings", payload);
      setSettings(updated);
      alert("Configuration checkpoints locked and saved!");
    } catch (err) {
      alert(err.message || "Failed saving system settings.");
    } finally {
      setSavingSettings(false);
    }
  };
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim() || !newPassword.trim()) {
      alert("All credentials criteria are standard requirements.");
      return;
    }
    try {
      setCreatingUser(true);
      const res = await api.post("/auth/register", {
        email: newEmail,
        name: newName,
        password: newPassword,
        role: newRole
      });
      const formattedUser = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role
      };
      setUsers([...users, formattedUser]);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("Sales Executive");
      alert(`User account "${formattedUser.name}" seeded into the system!`);
    } catch (err) {
      alert(err.message || "Form submission failure.");
    } finally {
      setCreatingUser(false);
    }
  };
  if (currentUser.role === "Sales Executive") {
    return <div className="p-8 text-center bg-amber-50/25 dark:bg-amber-950/5 border border-amber-150 rounded-2xl max-w-lg mx-auto space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-sm font-bold text-amber-800 dark:text-amber-500">Access Restricted</h3>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          The administration portal requires Admin or Sales Manager authorization credentials. Please interact and login using our pre-seeded Sarah Jenkins Admin profile (admin@crm.com) to access checking modules.
        </p>
      </div>;
  }
  return <div className="space-y-6">
      {
    /* Visual Header */
  }
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">System Settings & Members</h1>
        <p className="text-xs text-gray-400 mt-0.5 font-display">Coordinate active sales teams representation, role tiers, and company metrics goals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {
    /* Sales Representatives controls panel */
  }
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-3xs">
            <h2 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5 leading-normal">
              <ShieldCheck className="w-4 h-4 text-primary-500" /> Member Database Listings ({users.length})
            </h2>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {loading ? <div className="text-center py-6 text-2xs text-gray-400"><RefreshCw className="animate-spin w-4 h-4 mx-auto mb-1 text-primary-400" /> Loading Representatives...</div> : users.map((u) => <div
    key={u.id}
    className="p-3.5 bg-gray-50/50 dark:bg-gray-805/30 border border-gray-100 dark:border-gray-850 rounded-xl flex items-center justify-between gap-4 text-xs font-sans"
  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-950 dark:text-white truncate">{u.name}</div>
                      <div className="text-2xs text-gray-400 mt-0.5 truncate">{u.email}</div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {
    /* Role shifting selector (Admin restricted) */
  }
                      {currentUser.role === "Admin" ? <select
    value={u.role}
    onChange={(e) => handleUpdateRole(u.id, e.target.value)}
    className="px-2.5 py-1.5 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg text-2xs"
  >
                          <option value="Admin">Admin</option>
                          <option value="Sales Manager">Sales Manager</option>
                          <option value="Sales Executive">Sales Executive</option>
                        </select> : <span className="text-2xs font-bold font-mono px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-650 dark:text-gray-300 rounded uppercase">
                          {u.role}
                        </span>}

                      {
    /* Delete */
  }
                      {currentUser.role === "Admin" && u.id !== currentUser.id && <button
    onClick={() => handleDeleteUser(u.id)}
    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
    title="Purge Staff Account"
  >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>}
                    </div>
                  </div>)}
            </div>
          </div>

          {
    /* Seed/Add coordinates user manually */
  }
          {currentUser.role === "Admin" && <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-3xs">
              <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-150 dark:border-gray-800">
                Register New Sales Representative
              </h2>

              <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans">
                <input
    type="text"
    required
    placeholder="Full Name"
    value={newName}
    onChange={(e) => setNewName(e.target.value)}
    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-5/50 dark:bg-gray-800 rounded-xl"
  />
                <input
    type="email"
    required
    placeholder="Email Address"
    value={newEmail}
    onChange={(e) => setNewEmail(e.target.value)}
    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-5/50 dark:bg-gray-800 rounded-xl"
  />
                <input
    type="password"
    required
    placeholder="Password"
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-5/50 dark:bg-gray-800 rounded-xl"
  />
                <select
    value={newRole}
    onChange={(e) => setNewRole(e.target.value)}
    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-5/50 dark:bg-gray-805 rounded-xl"
  >
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Admin">Admin</option>
                </select>

                <div className="sm:col-span-2 flex justify-end">
                  <button
    type="submit"
    disabled={creatingUser}
    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-2xs rounded-xl shadow-xs transition"
  >
                    {creatingUser ? "Registering..." : "Authorize and Seed User"}
                  </button>
                </div>
              </form>
            </div>}
        </div>

        {
    /* System parameters goal configurations */
  }
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-3xs">
            <h2 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-gray-500" /> Quota Settings
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Tenant Enterprise Name</label>
                <input
    type="text"
    required
    placeholder="e.g. Acme Corporation Systems"
    value={companyName}
    onChange={(e) => setCompanyName(e.target.value)}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
  />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Local Currency Symbol</label>
                <select
    value={currency}
    onChange={(e) => setCurrency(e.target.value)}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
  >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300 font-sans">Monthly Revenue Target (Quotas)</label>
                <input
    type="number"
    required
    min={0}
    value={revenueTarget}
    onChange={(e) => setRevenueTarget(Number(e.target.value))}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-mono font-bold text-emerald-600"
  />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Conversion Rate Benchmark Target (%)</label>
                <input
    type="number"
    required
    min={1}
    max={100}
    value={leadTarget}
    onChange={(e) => setLeadTarget(Number(e.target.value))}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-orange-500"
  />
              </div>

              <button
    type="submit"
    disabled={savingSettings}
    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-2xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
  >
                <Save className="w-3.5 h-3.5" /> Save Configuration Parameters
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>;
}
