import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../utils/api";
import {
  Plus,
  Search,
  Mail,
  Phone,
  ClipboardList,
  Edit,
  Trash2,
  X,
  PlusCircle
} from "lucide-react";
export default function CustomersView({ currentUser }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [purchaseItemName, setPurchaseItemName] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingCustId, setEditingCustId] = useState(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.get("/customers");
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingCustId(null);
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (cust, e) => {
    e.stopPropagation();
    setModalMode("edit");
    setEditingCustId(cust.id);
    setName(cust.name);
    setCompany(cust.company);
    setEmail(cust.email);
    setPhone(cust.phone);
    setIsModalOpen(true);
  };
  const handleSubmitCustomer = async (e) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !email.trim()) {
      alert("Name, Company, and Email are standard requirements.");
      return;
    }
    const payload = { name, company, email, phone };
    try {
      if (modalMode === "create") {
        const item = await api.post("/customers", payload);
        setCustomers([...customers, item]);
      } else if (modalMode === "edit" && editingCustId) {
        const item = await api.put(`/customers/${editingCustId}`, payload);
        setCustomers(customers.map((c) => c.id === editingCustId ? item : c));
        if (selectedCustomer?.id === editingCustId) {
          setSelectedCustomer(item);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || "Error occurred handling customer data.");
    }
  };
  const handleDeleteCustomer = async (id, e) => {
    e.stopPropagation();
    if (!confirm("This deletes customer, order trails, and notes databases permanently. Proceed?")) return;
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(customers.filter((c) => c.id !== id));
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
    } catch (err) {
      alert(err.message || "Failed deletion.");
    }
  };
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !noteText.trim()) return;
    try {
      const updated = await api.put(`/customers/${selectedCustomer.id}`, { notes: noteText });
      setCustomers(customers.map((c) => c.id === selectedCustomer.id ? updated : c));
      setSelectedCustomer(updated);
      setNoteText("");
    } catch (err) {
      alert(err.message || "Note registering failed.");
    }
  };
  const handleAddPurchase = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !purchaseItemName.trim() || !purchaseAmount) return;
    const newPurchase = {
      itemId: `p-${Date.now()}`,
      itemName: purchaseItemName,
      amount: Number(purchaseAmount),
      date: (/* @__PURE__ */ new Date()).toISOString()
    };
    const updatedHistory = [...selectedCustomer.purchaseHistory, newPurchase];
    try {
      const updated = await api.put(`/customers/${selectedCustomer.id}`, { purchaseHistory: updatedHistory });
      setCustomers(customers.map((c) => c.id === selectedCustomer.id ? updated : c));
      setSelectedCustomer(updated);
      setPurchaseItemName("");
      setPurchaseAmount("");
    } catch (err) {
      alert(err.message || "Transaction submission failed.");
    }
  };
  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );
  return <div className="space-y-5">
      {
    /* Upper options */
  }
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Customer Hub</h1>
          <p className="text-xs text-gray-400 mt-0.5">Maintain direct client relationship records, purchases, and journals.</p>
        </div>
        <button
    onClick={handleOpenCreateModal}
    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
  >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {
    /* Primary search row */
  }
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-3xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
    type="text"
    placeholder="Search verified customers by contact, company, or mail..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 text-gray-800 dark:text-gray-200"
  />
        </div>
      </div>

      {
    /* Main split-view dashboard */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {
    /* Customer catalog columnar sidebar */
  }
        <div className="lg:col-span-2 space-y-3">
          {loading ? <div className="text-center py-20 text-gray-400">
              <ClipboardList className="w-6 h-6 animate-pulse mx-auto mb-1 text-primary-500" />
              Loading catalogs...
            </div> : filteredCustomers.length === 0 ? <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl">
              <span className="text-xs text-gray-400 italic">No customers found. Converted leads show up here automatically.</span>
            </div> : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCustomers.map((cust) => {
    const spendingSum = cust.purchaseHistory.reduce((sum, item) => sum + item.amount, 0);
    return <motion.div
      key={cust.id}
      onClick={() => setSelectedCustomer(cust)}
      whileHover={{ y: -1 }}
      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${selectedCustomer?.id === cust.id ? "bg-primary-50/50 dark:bg-primary-950/15 border-primary-500" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-750"}`}
    >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-xs font-bold text-gray-950 dark:text-white line-clamp-1">{cust.name}</h3>
                          <span className="text-xs font-medium text-primary-500 font-mono mt-0.5 inline-block">{cust.company}</span>
                        </div>
                        {
      /* Dropdown controls */
    }
                        <div className="flex items-center gap-1 opacity-60 hover:opacity-100">
                          <button
      onClick={(e) => handleOpenEditModal(cust, e)}
      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-400 hover:text-blue-500 cursor-pointer"
      title="Edit"
    >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {currentUser.role === "Admin" && <button
      onClick={(e) => handleDeleteCustomer(cust.id, e)}
      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-400 hover:text-red-500 cursor-pointer"
      title="Delete"
    >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>}
                        </div>
                      </div>

                      {
      /* Contact metadata */
    }
                      <div className="mt-3.5 space-y-1.5 text-2xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{cust.email}</span>
                        </div>
                        {cust.phone && <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span>{cust.phone}</span>
                          </div>}
                      </div>
                    </div>

                    {
      /* Spend totals footer */
    }
                    <div className="mt-5 pt-3 border-t border-gray-50 dark:border-gray-800/40 flex justify-between items-center text-3xs font-mono">
                      <span className="text-gray-400 font-medium">Orders: {cust.purchaseHistory.length} ledger logs</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">LTV: ${spendingSum.toLocaleString()}</span>
                    </div>
                  </motion.div>;
  })}
            </div>}
        </div>

        {
    /* Unified details panel slider sidebar */
  }
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-6 shadow-xs">
          {selectedCustomer ? <div className="space-y-6">
              {
    /* Card visual profile */
  }
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Account Identity</h2>
                  <span className="text-3xs text-gray-400">Log added: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-3 p-3.5 bg-gray-50 dark:bg-gray-805 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-gray-900 dark:text-white">{selectedCustomer.name}</div>
                  <div className="text-2xs text-primary-500 font-medium">{selectedCustomer.company}</div>
                  <div className="text-2xs text-gray-500 dark:text-gray-400 space-y-0.5">
                    <div>Email: {selectedCustomer.email}</div>
                    {selectedCustomer.phone && <div>Phone: {selectedCustomer.phone}</div>}
                  </div>
                </div>
              </div>

              {
    /* Transactions / Purchasing Ledger */
  }
              <div>
                <h3 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Sales ledger</span>
                  <span className="text-3xs font-mono bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 px-1.5 py-0.5 rounded">
                    LTV: ${selectedCustomer.purchaseHistory.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                  </span>
                </h3>

                {
    /* Submitting transactions form inline */
  }
                <form onSubmit={handleAddPurchase} className="flex gap-2 mb-3.5">
                  <input
    type="text"
    required
    placeholder="Product Item (e.g. License renewal)"
    value={purchaseItemName}
    onChange={(e) => setPurchaseItemName(e.target.value)}
    className="flex-1 px-2.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg text-3xs text-gray-800 dark:text-gray-200"
  />
                  <input
    type="number"
    required
    min={0}
    placeholder="Amt"
    value={purchaseAmount}
    onChange={(e) => setPurchaseAmount(e.target.value)}
    className="w-18 px-2.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-255 dark:border-gray-700 rounded-lg text-3xs text-gray-800 dark:text-gray-200 font-mono"
  />
                  <button
    type="submit"
    className="px-2.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer flex items-center justify-center"
    title="Log Transaction"
  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedCustomer.purchaseHistory.length > 0 ? selectedCustomer.purchaseHistory.map((item) => <div
    key={item.itemId}
    className="flex justify-between items-center p-2.5 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 rounded-lg text-2xs"
  >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-gray-900 dark:text-white truncate" title={item.itemName}>{item.itemName}</div>
                          <span className="text-[10px] text-gray-400 font-medium">{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">${item.amount.toLocaleString()}</span>
                      </div>) : <div className="text-3xs italic text-gray-400 text-center py-2">No historical ledger items listed.</div>}
                </div>
              </div>

              {
    /* Interactions Internal Notes Journal */
  }
              <div>
                <h3 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider mb-2.5">Interactions Journal</h3>
                <form onSubmit={handleAddNote} className="space-y-1.5 mb-3.5">
                  <textarea
    required
    placeholder="Type an evaluation note, call minutes digest, support update..."
    value={noteText}
    onChange={(e) => setNoteText(e.target.value)}
    rows={2}
    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-2xs text-gray-900 dark:text-gray-100 resize-none focus:outline-hidden"
  />
                  <button
    type="submit"
    className="w-full px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-3xs font-semibold rounded-lg transition-colors cursor-pointer"
  >
                    Commit note entry
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-2xs">
                  {selectedCustomer.notes.map((note, idx) => <div
    key={idx}
    className="p-2.5 bg-gray-50/70 dark:bg-gray-800/25 border border-gray-100/55 dark:border-gray-800/40 rounded-lg text-gray-600 dark:text-gray-400"
  >
                      <p className="whitespace-pre-line leading-relaxed">{note}</p>
                    </div>)}
                </div>
              </div>
            </div> : <div className="text-center py-28 text-gray-400 space-y-2">
              <ClipboardList className="w-8 h-8 mx-auto" />
              <div className="text-xs font-semibold">Select Customer Profile</div>
              <p className="text-4xs uppercase tracking-wider">To audit historical order ledger notes</p>
            </div>}
        </div>

      </div>

      {
    /* CREATE & EDIT CUSTOMER MODAL */
  }
      <AnimatePresence>
        {isModalOpen && <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/40 dark:bg-black/60">
            <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
  >
              <div className="flex justify-between items-center pb-2 border-b border-gray-150 dark:border-gray-800">
                <h2 className="text-md font-bold text-gray-950 dark:text-white">
                  {modalMode === "create" ? "Incorporate Customer" : "Adjust Customer Records"}
                </h2>
                <button
    onClick={() => setIsModalOpen(false)}
    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg text-gray-400 cursor-pointer"
  >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitCustomer} className="space-y-3.5 text-xs">
                {
    /* Name */
  }
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Unified Contact Name *</label>
                  <input
    type="text"
    required
    placeholder="e.g. Clara Oswald"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
  />
                </div>

                {
    /* Company */
  }
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Incorporated Company *</label>
                  <input
    type="text"
    required
    placeholder="e.g. Chronos Laboratories"
    value={company}
    onChange={(e) => setCompany(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-gray-100"
  />
                </div>

                {
    /* Email */
  }
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Primary Contact Email *</label>
                  <input
    type="email"
    required
    placeholder="e.g. oswald@chronos.org"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-gray-100"
  />
                </div>

                {
    /* Phone */
  }
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Direct Telephone No</label>
                  <input
    type="text"
    placeholder="e.g. +1 (555) 0122"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-gray-100"
  />
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 border border-gray-200 dark:border-gray-755 text-gray-650 dark:text-gray-350 rounded-xl text-xs hover:bg-gray-50 cursor-pointer"
  >
                    Cancel
                  </button>
                  <button
    type="submit"
    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
  >
                    {modalMode === "create" ? "Incorporate Client" : "Amend Record"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>}
      </AnimatePresence>
    </div>;
}
