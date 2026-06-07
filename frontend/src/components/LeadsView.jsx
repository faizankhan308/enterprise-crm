import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../utils/api";
import {
  Search,
  Plus,
  ArrowUpDown,
  Trash2,
  Edit,
  CheckCircle2,
  Phone,
  Mail,
  Link,
  AlertCircle,
  Calendar,
  RefreshCw,
  X,
  User as UserIcon
} from "lucide-react";
export default function LeadsView({ currentUser }) {
  const [leads, setLeads] = useState([]);
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadActivities, setLeadActivities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [newActivityType, setNewActivityType] = useState("Call");
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityDesc, setNewActivityDesc] = useState("");
  const [newActivityReminder, setNewActivityReminder] = useState("");
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSource, setFormSource] = useState("Website");
  const [formStatus, setFormStatus] = useState("New");
  const [formAssignedTo, setFormAssignedTo] = useState("");
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        search,
        source,
        status,
        assignedTo,
        sortBy,
        order: sortOrder
      });
      const data = await api.get(`/leads?${queryParams}`);
      setLeads(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Could not load leads database.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLeads();
  }, [search, source, status, assignedTo, sortBy, sortOrder]);
  useEffect(() => {
    async function loadRepresentatives() {
      try {
        const users = await api.get("/admin/users");
        setReps(users);
      } catch (e) {
        setReps([
          { id: currentUser.id, email: currentUser.email, name: currentUser.name, role: currentUser.role }
        ]);
      }
    }
    loadRepresentatives();
  }, []);
  const fetchLeadActivities = async (leadId) => {
    try {
      const data = await api.get(`/activities?targetType=lead&targetId=${leadId}`);
      setLeadActivities(data);
    } catch (e) {
      console.error("Failed to load lead timeline:", e);
    }
  };
  const handleOpenCreateMode = () => {
    setModalMode("create");
    setEditingLeadId(null);
    setFormName("");
    setFormCompany("");
    setFormEmail("");
    setFormPhone("");
    setFormSource("Website");
    setFormStatus("New");
    setFormAssignedTo(currentUser.id);
    setIsModalOpen(true);
  };
  const handleOpenEditMode = (lead, e) => {
    e.stopPropagation();
    setModalMode("edit");
    setEditingLeadId(lead.id);
    setFormName(lead.name);
    setFormCompany(lead.company);
    setFormEmail(lead.email);
    setFormPhone(lead.phone);
    setFormSource(lead.source);
    setFormStatus(lead.status);
    setFormAssignedTo(lead.assignedTo);
    setIsModalOpen(true);
  };
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formCompany.trim() || !formEmail.trim()) {
      alert("Name, Company, and Email are mandatory.");
      return;
    }
    const payload = {
      name: formName,
      company: formCompany,
      email: formEmail,
      phone: formPhone,
      source: formSource,
      status: formStatus,
      assignedTo: formAssignedTo
    };
    try {
      if (modalMode === "create") {
        const item = await api.post("/leads", payload);
        setLeads([item, ...leads]);
      } else if (modalMode === "edit" && editingLeadId) {
        const item = await api.put(`/leads/${editingLeadId}`, payload);
        setLeads(leads.map((l) => l.id === editingLeadId ? item : l));
        if (selectedLead?.id === editingLeadId) {
          setSelectedLead(item);
        }
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (err) {
      alert(err.message || "Failure handling lead operation.");
    }
  };
  const handleDeleteLead = async (leadId, e) => {
    e.stopPropagation();
    if (!confirm("Are you absolutely sure you want to delete this lead?")) return;
    try {
      await api.delete(`/leads/${leadId}`);
      setLeads(leads.filter((l) => l.id !== leadId));
      if (selectedLead?.id === leadId) setSelectedLead(null);
    } catch (err) {
      alert(err.message || "Error deleting lead.");
    }
  };
  const handleConvertLead = async (lead) => {
    if (!confirm(`Do you want to convert "${lead.name}" of "${lead.company}" into an official registered Customer?`)) return;
    try {
      await api.post(`/leads/${lead.id}/convert`);
      alert(`\u{1F389} Lead "${lead.name}" converted successfully inside the Customer ledger!`);
      if (selectedLead?.id === lead.id) setSelectedLead(null);
      fetchLeads();
    } catch (err) {
      alert(err.message || "Lead conversion encountered an error.");
    }
  };
  const handleAddTimelineActivity = async (e) => {
    e.preventDefault();
    if (!selectedLead || !newActivityTitle.trim()) return;
    try {
      const payload = {
        targetType: "lead",
        targetId: selectedLead.id,
        type: newActivityType,
        title: newActivityTitle,
        description: newActivityDesc,
        reminderDate: newActivityReminder || void 0
      };
      const act = await api.post("/activities", payload);
      setLeadActivities([act, ...leadActivities]);
      setNewActivityTitle("");
      setNewActivityDesc("");
      setNewActivityReminder("");
    } catch (err) {
      alert(err.message || "Timeline creation aborted.");
    }
  };
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };
  return <div className="space-y-5">
      {
    /* Upper Panel */
  }
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Leads Pipeline</h1>
          <p className="text-xs text-gray-400 mt-0.5">Filter, configure, and convert leads securely within the system.</p>
        </div>
        <button
    onClick={handleOpenCreateMode}
    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
  >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {
    /* Interactive Search Tool Board */
  }
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {
    /* Search */
  }
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
    type="text"
    placeholder="Search leads, company, email..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-800 dark:text-gray-200"
  />
          </div>

          {
    /* Status filter */
  }
          <div>
            <select
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-700 dark:text-gray-300"
  >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Unqualified">Unqualified</option>
            </select>
          </div>

          {
    /* Source filter */
  }
          <div>
            <select
    value={source}
    onChange={(e) => setSource(e.target.value)}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-700 dark:text-gray-300"
  >
              <option value="">All Sources</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Social Media">Social Media</option>
              <option value="Partner">Partner</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {
    /* Rep Assigned Filter */
  }
          <div>
            <select
    value={assignedTo}
    onChange={(e) => setAssignedTo(e.target.value)}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-700 dark:text-gray-300"
  >
              <option value="">All Representatives</option>
              {reps.map((rep) => <option key={rep.id} value={rep.id}>{rep.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {
    /* Main Grid: list + drawer overlay */
  }
      <div className="relative">
        <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xs">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-2xs uppercase tracking-wider text-gray-400 font-semibold bg-gray-50/50 dark:bg-gray-900">
                <th className="p-4 cursor-pointer" onClick={() => toggleSort("name")}>
                  <div className="flex items-center gap-1">Lead <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => toggleSort("company")}>
                  <div className="flex items-center gap-1">Company <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4">Contact Info</th>
                <th className="p-4 cursor-pointer" onClick={() => toggleSort("source")}>
                  <div className="flex items-center gap-1">Source <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Rep</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-xs">
              {loading ? <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                    Fetching latest pipeline records...
                  </td>
                </tr> : leads.length === 0 ? <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="mb-2.5 mx-auto w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 block">No leads match constraints</span>
                    <span className="text-2xs text-gray-400 block mt-0.5">Try altering the queries or adding new leads.</span>
                  </td>
                </tr> : leads.map((lead) => {
    const assignedUser = reps.find((r) => r.id === lead.assignedTo);
    return <tr
      key={lead.id}
      onClick={() => {
        setSelectedLead(lead);
        fetchLeadActivities(lead.id);
      }}
      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer group"
    >
                      {
      /* Name */
    }
                      <td className="p-4 font-semibold text-gray-900 dark:text-white">
                        {lead.name}
                      </td>
                      {
      /* Company */
    }
                      <td className="p-4 text-gray-700 dark:text-gray-330">
                        {lead.company}
                      </td>
                      {
      /* Contact Info */
    }
                      <td className="p-4 text-gray-500 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" /> 
                          <span>{lead.email}</span>
                        </div>
                        {lead.phone && <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" /> 
                            <span>{lead.phone}</span>
                          </div>}
                      </td>
                      {
      /* Source */
    }
                      <td className="p-4">
                        <span className="px-2 py-1.5 rounded-lg text-2xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {lead.source}
                        </span>
                      </td>
                      {
      /* Status badge */
    }
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-3xs font-semibold uppercase tracking-wider
                          ${lead.status === "New" && "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"}
                          ${lead.status === "Contacted" && "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"}
                          ${lead.status === "Qualified" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"}
                          ${lead.status === "Unqualified" && "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"}
                        `}>
                          {lead.status}
                        </span>
                      </td>
                      {
      /* Rep representation */
    }
                      <td className="p-4 text-gray-600 dark:text-gray-400 font-medium">
                        {assignedUser ? assignedUser.name : "Unassigned"}
                      </td>
                      {
      /* Actions */
    }
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {lead.status !== "Qualified" && <button
      onClick={(e) => {
        e.stopPropagation();
        handleConvertLead(lead);
      }}
      className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg cursor-pointer"
      title="Convert to Customer"
    >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>}
                          <button
      onClick={(e) => handleOpenEditMode(lead, e)}
      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg cursor-pointer"
      title="Edit Record"
    >
                            <Edit className="w-4 h-4" />
                          </button>
                          {["Admin", "Sales Manager"].includes(currentUser.role) && <button
      onClick={(e) => handleDeleteLead(lead.id, e)}
      className="p-1 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
      title="Delete Lead"
    >
                              <Trash2 className="w-4 h-4" />
                            </button>}
                        </div>
                      </td>
                    </tr>;
  })}
            </tbody>
          </table>
        </div>

        {
    /* Lead Timeline & Detail Slider Drawer */
  }
        <AnimatePresence>
          {selectedLead && <>
              {
    /* Overlay Backdrop */
  }
              <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setSelectedLead(null)}
    className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40"
  />

              {
    /* Drawer Container */
  }
              <motion.div
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    transition={{ type: "spring", damping: 25, stiffness: 220 }}
    className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 p-6 shadow-2xl z-50 overflow-y-auto"
  >
                {
    /* Header widget */
  }
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedLead.name}</h2>
                    <p className="text-xs text-primary-500 font-medium">{selectedLead.company}</p>
                  </div>
                  <button
    onClick={() => setSelectedLead(null)}
    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg text-gray-400 cursor-pointer"
  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {
    /* Lead fast contact information */
  }
                <div className="space-y-2 border-b border-gray-50 dark:border-gray-800/40 pb-4 mb-4">
                  <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedLead.email}</span>
                  </div>
                  {selectedLead.phone && <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedLead.phone}</span>
                    </div>}
                  <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span>Representative: {reps.find((r) => r.id === selectedLead.assignedTo)?.name || "Staff"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-630 dark:text-gray-400">
                    <Link className="w-4 h-4 text-gray-400" />
                    <span>Channel attribution: <strong className="font-semibold text-gray-700 dark:text-gray-300">{selectedLead.source}</strong></span>
                  </div>
                  {selectedLead.status !== "Qualified" && <div className="pt-2">
                      <button
    onClick={() => handleConvertLead(selectedLead)}
    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
  >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Convert to Customer
                      </button>
                    </div>}
                </div>

                {
    /* Form to submit interaction note */
  }
                <form onSubmit={handleAddTimelineActivity} className="space-y-2 mb-6">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Log Activity</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <select
    value={newActivityType}
    onChange={(e) => setNewActivityType(e.target.value)}
    className="px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
  >
                      <option value="Call">Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Email">Email</option>
                      <option value="Note">Note</option>
                    </select>
                    <input
    type="date"
    value={newActivityReminder}
    onChange={(e) => setNewActivityReminder(e.target.value)}
    title="Follow-up Reminder Date"
    className="px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
  />
                  </div>
                  <input
    type="text"
    required
    placeholder="Short Title (e.g. Call callback, web onboarding demo)"
    value={newActivityTitle}
    onChange={(e) => setNewActivityTitle(e.target.value)}
    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-primary-500"
  />
                  <textarea
    required
    placeholder="Enter details of conversation..."
    value={newActivityDesc}
    onChange={(e) => setNewActivityDesc(e.target.value)}
    rows={2}
    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-primary-500 resize-none"
  />
                  <button
    type="submit"
    className="w-full px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-2xs transition font-semibold cursor-pointer"
  >
                    Log Interaction
                  </button>
                </form>

                {
    /* Interactive Timeline Stream */
  }
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Contact Log Timeline</h3>
                  <div className="relative border-l border-gray-100 dark:border-gray-800/80 pl-4.5 space-y-4">
                    {leadActivities.length > 0 ? leadActivities.map((act) => <div key={act.id} className="relative">
                          {
    /* Dot marker */
  }
                          <div className="absolute -left-[24px] top-1.5 w-3 h-3 rounded-full border bg-white dark:bg-gray-900 border-primary-500" />
                          
                          <div className="timeline-card">
                            <div className="flex justify-between text-2xs text-gray-400 font-medium">
                              <span>{act.type} &middot; by {act.createdByName || "Staff"}</span>
                              <span>{new Date(act.date).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{act.title}</h4>
                            <p className="text-2xs text-gray-500 mt-1">{act.description}</p>
                            {act.reminderDate && <div className="mt-1.5 flex items-center gap-1 text-[10px] text-orange-500 font-mono">
                                <Calendar className="w-3 h-3" />
                                <span>Reminder: {new Date(act.reminderDate).toLocaleDateString()}</span>
                              </div>}
                          </div>
                        </div>) : <div className="text-2xs italic text-gray-400 text-center py-4">No historic notes compiled yet.</div>}
                  </div>
                </div>
              </motion.div>
            </>}
        </AnimatePresence>
      </div>

      {
    /* CREATE & EDIT LEAD MODAL */
  }
      <AnimatePresence>
        {isModalOpen && <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/40 dark:bg-black/60">
            <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
  >
              <div className="flex justify-between items-center pb-2 border-b border-gray-150 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-950 dark:text-white">
                  {modalMode === "create" ? "Incorporate New Lead" : "Modify Lead Coordinates"}
                </h2>
                <button
    onClick={() => setIsModalOpen(false)}
    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg text-gray-400 cursor-pointer"
  >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitLead} className="space-y-3.5 text-xs">
                {
    /* Name */
  }
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Target Contact Name *</label>
                  <input
    type="text"
    required
    placeholder="e.g. Liam Patterson"
    value={formName}
    onChange={(e) => setFormName(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
  />
                </div>

                {
    /* Company */
  }
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Company Name *</label>
                  <input
    type="text"
    required
    placeholder="e.g. Horizon Labs Corp"
    value={formCompany}
    onChange={(e) => setFormCompany(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
  />
                </div>

                {
    /* Email */
  }
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Direct Email Address *</label>
                  <input
    type="email"
    required
    placeholder="e.g. liam@horizonlabs.com"
    value={formEmail}
    onChange={(e) => setFormEmail(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
  />
                </div>

                {
    /* Phone */
  }
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Telephone Number</label>
                  <input
    type="text"
    placeholder="e.g. +1 (555) 0192"
    value={formPhone}
    onChange={(e) => setFormPhone(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
  />
                </div>

                {
    /* Source & Status Grid */
  }
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 dark:text-gray-300">Source</label>
                    <select
    value={formSource}
    onChange={(e) => setFormSource(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
  >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Partner">Partner</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 dark:text-gray-300">Status</label>
                    <select
    value={formStatus}
    onChange={(e) => setFormStatus(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
  >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Unqualified">Unqualified</option>
                    </select>
                  </div>
                </div>

                {
    /* Assigned Representative */
  }
                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Owner Representative</label>
                  <select
    value={formAssignedTo}
    onChange={(e) => setFormAssignedTo(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
  >
                    {reps.map((rep) => <option key={rep.id} value={rep.id}>{rep.name} ({rep.role})</option>)}
                  </select>
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 border border-gray-200 dark:border-gray-750 text-gray-600 dark:text-gray-300 rounded-xl text-xs hover:bg-gray-50 cursor-pointer"
  >
                    Cancel
                  </button>
                  <button
    type="submit"
    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
  >
                    {modalMode === "create" ? "Assemble Lead" : "Commit Revisions"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>}
      </AnimatePresence>
    </div>;
}
