import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Mail, Send, Search, RefreshCw, CheckCircle2 } from "lucide-react";
export default function EmailView({ currentUser }) {
  const [logs, setLogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);
  const loadEmailIntelligence = async () => {
    try {
      setLoading(true);
      const [emailLogs, emailTemplates, leads, customers] = await Promise.all([
        api.get("/emails"),
        api.get("/email-templates"),
        api.get("/leads").catch(() => []),
        api.get("/customers").catch(() => [])
      ]);
      setLogs(emailLogs);
      setTemplates(emailTemplates);
      const combined = [];
      leads.forEach((l) => {
        combined.push({ id: l.id, name: l.name, email: l.email, company: l.company, type: "lead" });
      });
      customers.forEach((c) => {
        combined.push({ id: c.id, name: c.name, email: c.email, company: c.company, type: "customer" });
      });
      setRecipients(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadEmailIntelligence();
  }, []);
  const handleRecipientSelect = (e) => {
    const rId = e.target.value;
    setSelectedRecipientId(rId);
    const recObj = recipients.find((r) => r.id === rId);
    if (recObj) {
      setToEmail(recObj.email);
      if (selectedTemplateId) {
        hydrateTemplate(selectedTemplateId, recObj);
      }
    } else {
      setToEmail("");
    }
  };
  const handleTemplateSelect = (e) => {
    const tId = e.target.value;
    setSelectedTemplateId(tId);
    const recObj = recipients.find((r) => r.id === selectedRecipientId);
    hydrateTemplate(tId, recObj || { name: "[Contact Name]", company: "[Company Group]" });
  };
  const hydrateTemplate = (tempId, rec) => {
    const temp = templates.find((t) => t.id === tempId);
    if (temp) {
      setSubject(temp.subject);
      const outputBody = temp.body.replace(/\{\{name\}\}/g, rec.name).replace(/\{\{company\}\}/g, rec.company).replace(/\{\{sender\}\}/g, currentUser.name);
      setBody(outputBody);
    } else {
      setSubject("");
      setBody("");
    }
  };
  const handleDispatchEmail = async (e) => {
    e.preventDefault();
    if (!toEmail.trim() || !subject.trim() || !body.trim()) {
      alert("Recipient mail, subject line, and body are standard requirements.");
      return;
    }
    const recObj = recipients.find((r) => r.id === selectedRecipientId);
    const payload = {
      to: toEmail,
      subject,
      body,
      targetId: recObj ? recObj.id : void 0,
      targetType: recObj ? recObj.type : void 0,
      templateId: selectedTemplateId || void 0
    };
    try {
      const log = await api.post("/emails", payload);
      setLogs([log, ...logs]);
      setSubject("");
      setBody("");
      setSelectedRecipientId("");
      setToEmail("");
      setSelectedTemplateId("");
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3e3);
    } catch (err) {
      alert(err.message || "Error occurred during simulated delivery.");
    }
  };
  const filteredLogs = logs.filter(
    (log) => log.to.toLowerCase().includes(search.toLowerCase()) || log.subject.toLowerCase().includes(search.toLowerCase()) || log.body.toLowerCase().includes(search.toLowerCase())
  );
  return <div className="space-y-5">
      {
    /* Visual Header */
  }
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Email Integration Hub</h1>
        <p className="text-xs text-gray-400 mt-0.5">Hydrate email templates, dispatch interactions and catalog communication files.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {
    /* Composer section */
  }
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-3xs">
          <h2 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Mail className="w-4 h-4 text-primary-500" /> Simulated Mail Composer
          </h2>

          <form onSubmit={handleDispatchEmail} className="space-y-4 text-xs font-sans">
            {
    /* Quick alert */
  }
            {sendSuccess && <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold text-2xs">Email simulations dispatched and saved to connection timeline log!</span>
              </div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {
    /* Recipient select */
  }
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Choose Contact Coordinate</label>
                <select
    value={selectedRecipientId}
    onChange={handleRecipientSelect}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-805 border border-gray-200 dark:border-gray-700 rounded-xl"
  >
                  <option value="">Manual / Ad-hoc Recipient</option>
                  {recipients.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.company})</option>)}
                </select>
              </div>

              {
    /* Template select */
  }
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Choose Template Hydrator</label>
                <select
    value={selectedTemplateId}
    onChange={handleTemplateSelect}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-805 border border-gray-200 dark:border-gray-700 rounded-xl"
  >
                  <option value="">Custom blank message</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            {
    /* Recipient email details */
  }
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">Recipient Email Coordinate *</label>
              <input
    type="email"
    required
    placeholder="e.g. client@domain.com"
    value={toEmail}
    onChange={(e) => setToEmail(e.target.value)}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-805 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
  />
            </div>

            {
    /* Subject line */
  }
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">Subject Line *</label>
              <input
    type="text"
    required
    placeholder="Type email subject..."
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
  />
            </div>

            {
    /* Body */
  }
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">Message Body *</label>
              <textarea
    required
    rows={6}
    placeholder="Construct email body text..."
    value={body}
    onChange={(e) => setBody(e.target.value)}
    className="w-full px-3.5 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed"
  />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
    type="submit"
    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
  >
                <Send className="w-3.5 h-3.5" /> Dispatch Simulated Email
              </button>
            </div>
          </form>
        </div>

        {
    /* History module list */
  }
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-3xs max-h-[600px]">
          <div className="space-y-3.5 flex-1 flex flex-col">
            <h2 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-800">
              Dispatched Mail Log Catalog
            </h2>

            {
    /* Search within emails */
  }
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
    type="text"
    placeholder="Search dispatched catalog..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-3xs focus:ring-1 focus:ring-primary-500"
  />
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {loading ? <div className="text-center py-10 text-gray-400 text-2xs">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1" />
                  Loading Logs...
                </div> : filteredLogs.length === 0 ? <div className="text-center py-12 text-gray-450 italic text-2xs">
                  No simulations match restrictions
                </div> : filteredLogs.map((log) => <div
    key={log.id}
    className="p-3 bg-gray-50/75 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 rounded-xl space-y-1.5 text-2xs"
  >
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                      <span>Sender: {log.sender}</span>
                      <span>{new Date(log.sentAt).toLocaleDateString()}</span>
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">To: {log.to}</div>
                    <div className="font-bold text-gray-800 dark:text-gray-300 line-clamp-1">Sub: {log.subject}</div>
                    <p className="text-gray-550 dark:text-gray-405 line-clamp-2 italic whitespace-pre-line text-3xs mt-1 bg-white dark:bg-gray-950/20 p-2 border border-gray-100/50 dark:border-gray-800/30 rounded">
                      {log.body}
                    </p>
                  </div>)}
            </div>
          </div>
        </div>

      </div>
    </div>;
}
