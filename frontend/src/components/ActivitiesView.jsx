import { useState, useEffect } from "react";
import { api } from "../utils/api";
import {
  Activity as ActIcon,
  CheckSquare,
  Calendar,
  Bell,
  Trash2,
  RefreshCw
} from "lucide-react";
export default function ActivitiesView() {
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const fetchActivitiesAndNotifications = async () => {
    try {
      setLoading(true);
      const [actsList, notesList] = await Promise.all([
        api.get("/activities"),
        api.get("/notifications")
      ]);
      setActivities(actsList);
      setNotifications(notesList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchActivitiesAndNotifications();
  }, []);
  const handleMarkReminderComplete = async (actId) => {
    try {
      const updated = await api.put(`/activities/${actId}`, { reminderDone: true });
      setActivities(activities.map((a) => a.id === actId ? updated : a));
    } catch (e) {
      alert("Error finalizing reminder.");
    }
  };
  const handleMarkNotificationRead = async (noteId) => {
    try {
      const updated = await api.put(`/notifications/${noteId}/read`);
      setNotifications(notifications.map((n) => n.id === noteId ? updated : n));
    } catch (e) {
      console.error(e);
    }
  };
  const handleDeleteActivity = async (actId) => {
    if (!confirm("Permanently wipe this activity log entry?")) return;
    try {
      await api.delete(`/activities/${actId}`);
      setActivities(activities.filter((a) => a.id !== actId));
    } catch (e) {
      alert("Failed deleting activity log.");
    }
  };
  const filteredActs = filterType === "All" ? activities : activities.filter((a) => a.type === filterType);
  const pendingReminders = activities.filter((a) => a.reminderDate && !a.reminderDone);
  return <div className="space-y-5">
      {
    /* Visual Header */
  }
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Timeline & Reminders</h1>
        <p className="text-xs text-gray-400 mt-0.5">Audit company interaction histories, follow-ups, and operational alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {
    /* Large activities timeline stream (Left span 2) */
  }
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-3xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
              <ActIcon className="w-4 h-4 text-primary-500" /> Interaction Chronicles
            </h2>
            
            {
    /* Filter buttons inline */
  }
            <div className="flex flex-wrap gap-1 text-3xs">
              {["All", "Call", "Meeting", "Email", "Note", "Status Change"].map((t) => <button
    key={t}
    onClick={() => setFilterType(t)}
    className={`px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-650 dark:text-gray-300 font-medium cursor-pointer ${filterType === t ? "ring-1 ring-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 font-bold" : ""}`}
  >
                  {t}
                </button>)}
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {loading ? <div className="text-center py-10 text-xs text-gray-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-primary-500" />
                Retrieving ledger chronicles...
              </div> : filteredActs.length === 0 ? <div className="text-center py-16 text-gray-450 italic text-2xs">
                No archived interaction notes match this tag
              </div> : <div className="relative border-l border-gray-100 dark:border-gray-800/80 pl-5.5 space-y-6">
                {filteredActs.map((act) => <div key={act.id} className="relative group/timeline text-xs font-sans">
                    {
    /* Ring Marker */
  }
                    <div className="absolute -left-[28px] top-1 w-3.5 h-3.5 rounded-full border bg-white dark:bg-gray-900 border-primary-500" />

                    <div className="p-3.5 bg-gray-50/50 dark:bg-gray-805 border border-gray-100 dark:border-gray-800/80 rounded-2xl space-y-1.5">
                      <div className="flex justify-between items-center text-4xs uppercase tracking-wider text-gray-400 font-medium">
                        <span>{act.type} &middot; by {act.createdByName || "Staff Assigned"}</span>
                        <div className="flex items-center gap-2">
                          <span>{new Date(act.date).toLocaleString()}</span>
                          <button
    onClick={() => handleDeleteActivity(act.id)}
    className="text-red-500 opacity-0 group-hover/timeline:opacity-100 transition-opacity p-0.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded cursor-pointer"
    title="Delete Log"
  >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-gray-950 dark:text-white">{act.title}</h4>
                      <p className="text-2xs text-gray-500 leading-relaxed whitespace-pre-wrap">{act.description}</p>
                      
                      {act.reminderDate && <div className="flex items-center justify-between pt-2 border-t border-gray-100/40 mt-2">
                          <span className={`${act.reminderDone ? "text-gray-450 line-through text-3xs" : "text-orange-500 font-bold text-3xs"} flex items-center gap-1 font-mono`}>
                            <Calendar className="w-3 h-3" /> 
                            Reminder follow up: {new Date(act.reminderDate).toLocaleDateString()}
                          </span>
                          {!act.reminderDone && <button
    onClick={() => handleMarkReminderComplete(act.id)}
    className="px-2 py-0.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-900/30 font-medium text-3xs cursor-pointer"
  >
                              Finalize
                            </button>}
                        </div>}
                    </div>
                  </div>)}
              </div>}
          </div>
        </div>

        {
    /* Reminders list + System notification widgets panel (Right span 1) */
  }
        <div className="space-y-6">
          
          {
    /* Reminders section */
  }
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-3.5 shadow-3xs max-h-[350px] overflow-y-auto">
            <h2 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-gray-800">
              <CheckSquare className="w-4 h-4 text-orange-500" /> Pending Reminders Checklist
            </h2>

            <div className="space-y-2.5">
              {pendingReminders.length > 0 ? pendingReminders.map((rem) => <div
    key={rem.id}
    className="p-3 bg-orange-50/20 dark:bg-orange-950/5 border border-orange-100/50 dark:border-orange-900/10 rounded-xl flex items-start gap-2.5"
  >
                    <button
    onClick={() => handleMarkReminderComplete(rem.id)}
    className="mt-0.5 p-1 bg-white hover:bg-emerald-50 dark:bg-gray-850 hover:text-emerald-500 text-gray-400 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
    title="Complete Reminder"
  >
                      <CheckSquare className="w-3.5 h-3.5" />
                    </button>
                    <div className="min-w-0 flex-1 text-2xs font-sans">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{rem.title}</div>
                      <p className="text-gray-500 dark:text-gray-450 line-clamp-1 mt-0.5">{rem.description}</p>
                      <div className="text-[10px] text-orange-600 dark:text-orange-400 font-mono mt-1 font-semibold">
                        Due: {new Date(rem.reminderDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>) : <div className="text-3xs italic text-gray-400 text-center py-6">All reminders completed! 🎉</div>}
            </div>
          </div>

          {
    /* System Notifications Module */
  }
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-3.5 shadow-3xs max-h-[350px] overflow-y-auto">
            <h2 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-gray-800">
              <Bell className="w-4 h-4 text-red-500" /> Operational Notifications ({notifications.filter((n) => !n.read).length})
            </h2>

            <div className="space-y-2.5">
              {notifications.length > 0 ? notifications.map((note) => <div
    key={note.id}
    className={`p-3 border rounded-xl flex flex-col gap-1.5 transition ${note.read ? "bg-gray-50/50 dark:bg-gray-800/10 border-gray-100 dark:border-gray-850 opacity-60" : "bg-primary-50/20 dark:bg-primary-950/5 border-primary-100 dark:border-primary-900/30 shadow-3xs"}`}
  >
                    <div className="flex justify-between items-center text-3xs font-mono text-gray-400">
                      <span className="font-semibold uppercase text-primary-500">{note.type}</span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-2xs font-semibold text-gray-900 dark:text-white">{note.title}</div>
                    <p className="text-2xs text-gray-500 dark:text-gray-400 leading-normal">{note.message}</p>
                    
                    {!note.read && <div className="flex justify-end mt-1">
                        <button
    onClick={() => handleMarkNotificationRead(note.id)}
    className="px-2 py-0.5 border border-primary-200 bg-white hover:bg-primary-100 dark:bg-gray-850 dark:text-primary-300 rounded font-medium text-3xs text-primary-650 cursor-pointer"
  >
                          Mark Read
                        </button>
                      </div>}
                  </div>) : <div className="text-3xs italic text-gray-400 text-center py-6">No notifications history mapped.</div>}
            </div>
          </div>

        </div>

      </div>
    </div>;
}
