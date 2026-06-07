import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../utils/api";
import {
  Plus,
  DollarSign,
  TrendingUp,
  Edit2,
  Trash2,
  X,
  Info
} from "lucide-react";
const STAGES = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost"
];
const STAGE_COLORS = {
  "New Lead": "border-t-4 border-t-blue-500 bg-blue-50/20 dark:bg-blue-950/5",
  "Contacted": "border-t-4 border-t-amber-500 bg-amber-50/20 dark:bg-amber-950/5",
  "Qualified": "border-t-4 border-t-orange-500 bg-orange-50/20 dark:bg-orange-950/5",
  "Proposal Sent": "border-t-4 border-t-purple-500 bg-purple-50/20 dark:bg-purple-950/5",
  "Negotiation": "border-t-4 border-t-pink-500 bg-pink-50/20 dark:bg-pink-950/5",
  "Won": "border-t-4 border-t-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/5",
  "Lost": "border-t-4 border-t-rose-500 bg-rose-50/20 dark:bg-rose-950/5"
};
export default function DealsView({ currentUser }) {
  const [deals, setDeals] = useState([]);
  const [reps, setReps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedDealId, setDraggedDealId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingDealId, setEditingDealId] = useState(null);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState("New Lead");
  const [leadId, setLeadId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const fetchDependenciesAndDeals = async () => {
    try {
      setLoading(true);
      const [dealsList, usersList, leadsList, customersList] = await Promise.all([
        api.get("/deals"),
        api.get("/admin/users").catch(() => []),
        api.get("/leads").catch(() => []),
        api.get("/customers").catch(() => [])
      ]);
      setDeals(dealsList);
      setReps(usersList);
      setLeads(leadsList);
      setCustomers(customersList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDependenciesAndDeals();
  }, []);
  const handleDragStart = (dealId) => {
    setDraggedDealId(dealId);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = async (targetStage) => {
    if (!draggedDealId) return;
    try {
      setDeals((prev) => prev.map((d) => {
        if (d.id === draggedDealId) {
          let prob = 10;
          if (targetStage === "Contacted") prob = 20;
          else if (targetStage === "Qualified") prob = 40;
          else if (targetStage === "Proposal Sent") prob = 60;
          else if (targetStage === "Negotiation") prob = 80;
          else if (targetStage === "Won") prob = 100;
          else if (targetStage === "Lost") prob = 0;
          return {
            ...d,
            stage: targetStage,
            probability: prob,
            expectedRevenue: d.value * (prob / 100)
          };
        }
        return d;
      }));
      await api.put("/deals/stage", { dealId: draggedDealId, stage: targetStage });
    } catch (err) {
      alert(err.message || "Failed to shift pipeline coordinate.");
      fetchDependenciesAndDeals();
    } finally {
      setDraggedDealId(null);
    }
  };
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingDealId(null);
    setName("");
    setValue("");
    setStage("New Lead");
    setLeadId("");
    setAssignedTo(currentUser.id);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (deal) => {
    setModalMode("edit");
    setEditingDealId(deal.id);
    setName(deal.name);
    setValue(String(deal.value));
    setStage(deal.stage);
    setLeadId(deal.leadId);
    setAssignedTo(deal.assignedTo);
    setIsModalOpen(true);
  };
  const handleSubmitDeal = async (e) => {
    e.preventDefault();
    if (!name.trim() || !value || Number(value) < 0) {
      alert("Please fill out correct name & numeric positive valuation.");
      return;
    }
    const payload = {
      name,
      value: Number(value),
      stage,
      leadId,
      assignedTo
    };
    try {
      if (modalMode === "create") {
        const item = await api.post("/deals", payload);
        setDeals([...deals, item]);
      } else if (modalMode === "edit" && editingDealId) {
        const item = await api.put(`/deals/${editingDealId}`, payload);
        setDeals(deals.map((d) => d.id === editingDealId ? item : d));
      }
      setIsModalOpen(false);
      fetchDependenciesAndDeals();
    } catch (err) {
      alert(err.message || "Error configuring deal metrics.");
    }
  };
  const handleDeleteDeal = async (dealId) => {
    if (!confirm("Are you positive you wish to remove this deal parameters from active forecast?")) return;
    try {
      await api.delete(`/deals/${dealId}`);
      setDeals(deals.filter((d) => d.id !== dealId));
    } catch (err) {
      alert(err.message || "Removal failed.");
    }
  };
  const handleQuickMoveStage = async (dealId, destStage) => {
    try {
      setDeals((prev) => prev.map((d) => {
        if (d.id === dealId) {
          let prob = 10;
          if (destStage === "Contacted") prob = 20;
          else if (destStage === "Qualified") prob = 40;
          else if (destStage === "Proposal Sent") prob = 60;
          else if (destStage === "Negotiation") prob = 80;
          else if (destStage === "Won") prob = 100;
          else if (destStage === "Lost") prob = 0;
          return {
            ...d,
            stage: destStage,
            probability: prob,
            expectedRevenue: d.value * (prob / 100)
          };
        }
        return d;
      }));
      await api.put("/deals/stage", { dealId, stage: destStage });
    } catch (err) {
      alert(err.message || "Move aborted.");
      fetchDependenciesAndDeals();
    }
  };
  const getStageStats = (columnStage) => {
    const stageItems = deals.filter((d) => d.stage === columnStage);
    const sumVal = stageItems.reduce((acc, d) => acc + d.value, 0);
    const expectedRevenueSum = stageItems.reduce((acc, d) => acc + d.expectedRevenue, 0);
    return {
      count: stageItems.length,
      value: sumVal,
      expected: expectedRevenueSum
    };
  };
  return <div className="space-y-5">
      {
    /* Upper Options */
  }
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Active Deal Value Pipelines</h1>
          <p className="text-xs text-gray-400 mt-0.5">Drag & drop deals, configure values, tracking conversion streams dynamically.</p>
        </div>
        <button
    onClick={handleOpenCreateModal}
    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
  >
          <Plus className="w-4 h-4" /> Initialize Deal
        </button>
      </div>

      {
    /* Helpful Info Alert */
  }
      <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-2xs text-blue-600 dark:text-gray-400 leading-normal">
          <strong>Tip:</strong> Drag and drop any card between lanes to instantly update stages, or use the interactive mobile stage switcher inside individual cards securely. Move deals to <strong>Won</strong> to automatically log purchase details into Customer logs!
        </p>
      </div>

      {
    /* Kanban Board Container */
  }
      {loading ? <div className="text-center py-24 text-gray-400">
          <TrendingUp className="w-8 h-8 animate-bounce mx-auto mb-2 text-primary-500" />
          Mapping Deal Coordinates...
        </div> : <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4.5 overflow-x-auto pb-4 items-start select-none">
          {STAGES.map((colStage) => {
    const stageStats = getStageStats(colStage);
    const columnDeals = deals.filter((d) => d.stage === colStage);
    return <div
      key={colStage}
      onDragOver={handleDragOver}
      onDrop={() => handleDrop(colStage)}
      className={`flex-shrink-0 w-full min-w-[200px] rounded-2xl p-3 bg-gray-50/40 dark:bg-gray-800/10 border border-gray-100 dark:border-gray-800/50 min-h-[500px] flex flex-col justify-between ${STAGE_COLORS[colStage]}`}
    >
                {
      /* Column Meta */
    }
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate">{colStage}</h3>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-2xs bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {stageStats.count}
                    </span>
                  </div>
                  {
      /* Stats ledger */
    }
                  <div className="space-y-0.5 pb-3 border-b border-gray-200/50 dark:border-gray-800/50 mb-3 text-3xs font-mono font-medium text-gray-500 dark:text-gray-400">
                    <div>Val: <span className="font-bold text-gray-700 dark:text-gray-300">${stageStats.value.toLocaleString()}</span></div>
                    <div>Est: <span className="font-bold text-primary-500 dark:text-primary-400">${Math.round(stageStats.expected).toLocaleString()}</span></div>
                  </div>

                  {
      /* Cards stack */
    }
                  <div className="space-y-3">
                    {columnDeals.map((deal) => {
      const repUser = reps.find((r) => r.id === deal.assignedTo);
      const customerEntity = customers.find((c) => c.id === deal.leadId);
      const leadEntity = leads.find((l) => l.id === deal.leadId);
      const entityName = customerEntity ? customerEntity.company : leadEntity ? leadEntity.company : "Direct Ledger";
      return <div
        key={deal.id}
        draggable
        onDragStart={() => handleDragStart(deal.id)}
        className="p-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl' shadow-3xs cursor-grab hover:shadow-2xs active:cursor-grabbing hover:border-primary-200 dark:hover:border-primary-900 transition-all space-y-2 relative group"
      >
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{deal.name}</h4>
                            <span className="text-3xs text-gray-400 block truncate mt-0.5">{entityName}</span>
                          </div>

                          <div className="flex items-center justify-between text-2xs font-mono">
                            <span className="font-bold text-gray-800 dark:text-gray-200">${deal.value.toLocaleString()}</span>
                            <span className={`px-1.5 py-0.5 rounded-sm text-3xs font-bold ${deal.probability >= 80 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" : deal.probability >= 40 ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20" : "bg-gray-100 text-gray-400 dark:bg-gray-800"}`}>
                              {deal.probability}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-gray-50 dark:border-gray-800/40 text-3xs text-gray-400">
                            <span className="truncate max-w-[80px]">Rep: {repUser ? repUser.name : "Unknown"}</span>
                            
                            {
        /* Touch/Interactive stage transfer */
      }
                            <div className="relative inline-block text-left">
                              <select
        value={deal.stage}
        onChange={(e) => handleQuickMoveStage(deal.id, e.target.value)}
        title="Move Stage"
        className="px-1 py-0.5 bg-gray-50 dark:bg-gray-805 border border-gray-200 dark:border-gray-700 text-3xs rounded-sm text-gray-600 dark:text-gray-400 cursor-pointer focus:outline-hidden"
      >
                                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          </div>

                          {
        /* Quick details edit indicators visible on hover */
      }
                          <div className="absolute top-2.5 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
        onClick={() => handleOpenEditModal(deal)}
        className="p-1 bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-950/40 text-gray-500 hover:text-primary-600 rounded-sm cursor-pointer"
        title="Edit Deal"
      >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            {["Admin", "Sales Manager"].includes(currentUser.role) && <button
        onClick={() => handleDeleteDeal(deal.id)}
        className="p-1 bg-gray-100 dark:bg-gray-800 hover:bg-red-100/60 dark:hover:bg-red-950/40 text-gray-500 hover:text-red-500 rounded-sm cursor-pointer"
        title="Purge Deal"
      >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>}
                          </div>
                        </div>;
    })}
                  </div>
                </div>

                {
      /* Drop footprint spacer */
    }
                <div className="mt-4 px-3 py-2 border-2 border-dashed border-gray-200 dark:border-gray-800 text-center rounded-xl text-4xs text-gray-400 tracking-wider">
                  DROP HERE
                </div>
              </div>;
  })}
        </div>}

      {
    /* CREATE & EDIT DEAL MODAL */
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
                  {modalMode === "create" ? "Inaugurate Deal" : "Revise Deal Metrics"}
                </h2>
                <button
    onClick={() => setIsModalOpen(false)}
    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg text-gray-400 cursor-pointer"
  >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitDeal} className="space-y-4 text-xs">
                {
    /* Name */
  }
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Deal Title *</label>
                  <input
    type="text"
    required
    placeholder="e.g. Enterprise SLA Migration Bundle"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-gray-100"
  />
                </div>

                {
    /* Value */
  }
                <div className="relative space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Contract Valuation (USD) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
    type="number"
    required
    min={0}
    placeholder="e.g. 75000"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-gray-100"
  />
                  </div>
                </div>

                {
    /* Connected Account Link */
  }
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Link to Account (Lead or Customer)</label>
                  <select
    value={leadId}
    onChange={(e) => setLeadId(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
  >
                    <option value="">Select connection coordinates...</option>
                    <optgroup label="Customers">
                      {customers.map((c) => <option key={c.id} value={c.id}>{c.company} ({c.name})</option>)}
                    </optgroup>
                    <optgroup label="Leads">
                      {leads.map((l) => <option key={l.id} value={l.id}>{l.company} ({l.name})</option>)}
                    </optgroup>
                  </select>
                </div>

                {
    /* Stage and Rep Grid */
  }
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 dark:text-gray-300">Stage</label>
                    <select
    value={stage}
    onChange={(e) => setStage(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
  >
                      {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 dark:text-gray-300">Staff Assigned</label>
                    <select
    value={assignedTo}
    onChange={(e) => setAssignedTo(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
  >
                      {reps.map((rep) => <option key={rep.id} value={rep.id}>{rep.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 border border-gray-200 dark:border-gray-750 text-gray-650 dark:text-gray-350 rounded-xl text-xs hover:bg-gray-50 cursor-pointer"
  >
                    Cancel
                  </button>
                  <button
    type="submit"
    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
  >
                    {modalMode === "create" ? "Produce Deal" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>}
      </AnimatePresence>
    </div>;
}
