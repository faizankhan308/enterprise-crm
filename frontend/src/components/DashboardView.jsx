import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { api } from "../utils/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Briefcase,
  Users,
  Flame,
  Percent,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Star,
  Activity as ActIcon
} from "lucide-react";
export default function DashboardView({ darkMode, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const fetchedStats = await api.get("/analytics/dashboard");
        const fetchedActs = await api.get("/activities");
        setStats(fetchedStats);
        setActivities(fetchedActs.slice(0, 5));
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard intelligence.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading enterprise dashboards...</p>
      </div>;
  }
  if (error || !stats) {
    return <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-center max-w-2xl mx-auto mt-10">
        <h3 className="text-red-700 dark:text-red-400 font-semibold mb-2">Error Retrieving System Stats</h3>
        <p className="text-sm text-red-600 dark:text-red-500 mb-4">{error}</p>
        <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs transition"
    >
          Retry Load
        </button>
      </div>;
  }
  const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#c3ddfd", "#a7f3d0"];
  const revenueGoalPercentage = Math.round(stats.wonRevenue / stats.monthlyRevenueTarget * 100);
  return <div className="space-y-6">
      {
    /* Visual Header */
  }
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            System Dashboard
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time visual reports of sales pipeline velocity, metrics, and operations representing <span className="font-semibold text-primary-500 text-xs md:text-sm">{stats.companyName}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>PORTAL ACTIVE</span>
        </div>
      </div>

      {
    /* KPI Stats Cards */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {
    /* Card 1 */
  }
        <motion.div
    whileHover={{ y: -2 }}
    className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs"
  >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Active Leads</p>
              <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mt-1">
                {stats.totalLeads}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-primary-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xs text-gray-400 mt-2.5 flex items-center gap-1">
            <span className="text-emerald-500 font-medium">Synced</span> across channels
          </p>
        </motion.div>

        {
    /* Card 2 */
  }
        <motion.div
    whileHover={{ y: -2 }}
    className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs"
  >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Deals in Pipeline</p>
              <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mt-1">
                {stats.activeDeals}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-purple-500">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xs text-gray-400 mt-2.5 flex items-center gap-1">
            <span className="text-purple-500 font-medium">{stats.activeDeals} ongoing</span> evaluations
          </p>
        </motion.div>

        {
    /* Card 3 */
  }
        <motion.div
    whileHover={{ y: -2 }}
    className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs"
  >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Won Revenue</p>
              <h3 className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
                ${stats.wonRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div
    className="bg-emerald-500 h-1.5 rounded-full"
    style={{ width: `${Math.min(100, revenueGoalPercentage)}%` }}
  />
            </div>
            <p className="text-2xs text-gray-400 mt-1 flex justify-between">
              <span>Goal: ${stats.monthlyRevenueTarget.toLocaleString()}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{revenueGoalPercentage}%</span>
            </p>
          </div>
        </motion.div>

        {
    /* Card 4 */
  }
        <motion.div
    whileHover={{ y: -2 }}
    className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs"
  >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Weighted Forecast</p>
              <h3 className="text-2xl font-bold font-display text-primary-500 mt-1">
                ${stats.revenueForecast.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-500">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xs text-gray-400 mt-2.5">
            Based on conversion probability
          </p>
        </motion.div>

        {
    /* Card 5 */
  }
        <motion.div
    whileHover={{ y: -2 }}
    className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs"
  >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Lead Conversion</p>
              <h3 className="text-2xl font-bold font-display text-orange-500 mt-1">
                {stats.conversionRate}%
              </h3>
            </div>
            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/30 rounded-xl text-orange-500">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xs text-gray-400 mt-2.5 flex items-center gap-1">
            Ratio of leads turned customers
          </p>
        </motion.div>
      </div>

      {
    /* Main Charts Row */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {
    /* Core Sales Performance Line/Area Area */
  }
        <div className="lg:col-span-2 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Monthly Sales Performance</h3>
              <p className="text-2xs text-gray-400 leading-normal">Actual closed won revenue contrasted against quota targets</p>
            </div>
            <span className="text-xs font-mono text-primary-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Direct ledger
            </span>
          </div>

          <div className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#374151" : "#e5e7eb"} />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip
    contentStyle={{
      backgroundColor: darkMode ? "#111827" : "#ffffff",
      borderRadius: "12px",
      borderColor: darkMode ? "#374151" : "#e5e7eb",
      color: darkMode ? "#ffffff" : "#000000"
    }}
  />
                <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="target" name="Quota Target ($)" stroke="#f97316" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {
    /* Lead Sources Pie */
  }
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Lead Acquisition Sources</h3>
            <p className="text-2xs text-gray-400 leading-normal">Distribution of ongoing potential contact sources</p>
          </div>

          <div className="h-44 my-2 flex items-center justify-center">
            {stats.leadSourceDistribution.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
    data={stats.leadSourceDistribution}
    innerRadius={50}
    outerRadius={70}
    paddingAngle={3}
    dataKey="value"
  >
                    {stats.leadSourceDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
    contentStyle={{
      backgroundColor: darkMode ? "#111827" : "#ffffff",
      borderRadius: "12px",
      borderColor: darkMode ? "#374151" : "#e5e7eb",
      color: darkMode ? "#ffffff" : "#000000"
    }}
  />
                </PieChart>
              </ResponsiveContainer> : <div className="text-2xs text-gray-400 italic">No attribution coordinates logged</div>}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {stats.leadSourceDistribution.map((item, index) => <div key={item.name} className="flex items-center gap-2">
                <div
    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
    style={{ backgroundColor: COLORS[index % COLORS.length] }}
  />
                <span className="text-2xs font-medium text-gray-600 dark:text-gray-400 truncate">{item.name} ({item.value})</span>
              </div>)}
          </div>
        </div>
      </div>

      {
    /* Leaderboard and Recent Activity Row */
  }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {
    /* Core Leaderboard */
  }
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Top Performing Sales Agents</h3>
              <p className="text-2xs text-gray-400">Leaderboard by total closed-won contract value</p>
            </div>
            <Star className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>

          <div className="space-y-3.5">
            {stats.topSalesReps.map((rep, idx) => <div
    key={rep.name}
    className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-800/50"
  >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-medium text-xs bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{rep.name}</h4>
                    <p className="text-2xs text-gray-400">{rep.count} won deal{rep.count !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${rep.total.toLocaleString()}
                  </span>
                </div>
              </div>)}
          </div>
        </div>

        {
    /* Recent Communication Timeline Log */
  }
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold heading-tight text-gray-900 dark:text-white">Recent Activity Stream</h3>
                <p className="text-2xs text-gray-400">Consolidated calls, status shifts, and meeting digests</p>
              </div>
              <button
    onClick={() => onNavigate("Activities")}
    className="text-2xs font-medium text-primary-500 flex items-center hover:underline cursor-pointer"
  >
                Inspect All <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="space-y-3 font-sans">
              {activities.length > 0 ? activities.map((act) => <div key={act.id} className="flex gap-3 text-xs">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary-500">
                        <ActIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{act.title}</p>
                        <span className="text-2xs text-gray-400 flex-shrink-0">{new Date(act.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-2xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{act.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-3xs font-mono px-1.5 py-0.5 rounded-sm bg-gray-100 dark:bg-gray-800 text-gray-500">
                          {act.type}
                        </span>
                        <span className="text-3xs text-gray-400">
                          by {act.createdByName || "Staff"}
                        </span>
                      </div>
                    </div>
                  </div>) : <div className="text-xs italic text-gray-400 text-center py-6">No interactions recorded recently</div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
}
