import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { FileSpreadsheet, ArrowUpRight, Download, Printer } from "lucide-react";
export default function ReportsView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Sales");
  const [selectedReport, setSelectedReport] = useState(null);
  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.get("/reports");
      setReports(data);
      if (data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReports();
  }, []);
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Report Title is required.");
      return;
    }
    try {
      const payload = {
        title,
        type,
        criteria: { generatedAt: (/* @__PURE__ */ new Date()).toISOString() }
      };
      const created = await api.post("/reports/generate", payload);
      setReports([created, ...reports]);
      setSelectedReport(created);
      setTitle("");
    } catch (err) {
      alert(err.message || "Failed generating report.");
    }
  };
  const handleDownloadCSV = (repId) => {
    window.open(`/api/reports/${repId}/export`, "_blank");
  };
  const renderReportContent = (rep) => {
    const data = rep.generatedData;
    if (rep.type === "Sales") {
      return <table className="w-full text-left text-2xs border-collapse">
          <thead>
            <tr className="border-b border-gray-150 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
              <th className="py-2">Metric</th>
              <th className="py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-gray-700 dark:text-gray-300">
            <tr>
              <td className="py-2.5 font-medium">Total Deals Tracked</td>
              <td className="py-2.5 text-right font-semibold font-mono">{data.totalDeals}</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Won Deals Count</td>
              <td className="py-2.5 text-right font-semibold font-mono text-emerald-500">{data.wonCount}</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Closed Won Revenue</td>
              <td className="py-2.5 text-right font-extrabold font-mono text-emerald-600 dark:text-emerald-450">${data.wonTotalRevenue?.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Active ongoing opportunities</td>
              <td className="py-2.5 text-right font-semibold font-mono">{data.pipelineCount}</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Pipeline aggregate estimation</td>
              <td className="py-2.5 text-right font-bold font-mono text-primary-500">${data.pipelineTotalValue?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>;
    } else if (rep.type === "Conversion") {
      return <table className="w-full text-left text-2xs border-collapse">
          <thead>
            <tr className="border-b border-gray-150 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
              <th className="py-2">Conversion Area</th>
              <th className="py-2 text-right">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-gray-700 dark:text-gray-300">
            <tr>
              <td className="py-2.5 font-medium">Unconverted contacts</td>
              <td className="py-2.5 text-right font-mono">{data.unconvertedLeads}</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Converted customer pipelines</td>
              <td className="py-2.5 text-right font-mono text-emerald-500">{data.convertedLeads}</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Total Customers logged</td>
              <td className="py-2.5 text-right font-mono">{data.totalCustomers}</td>
            </tr>
            <tr className="bg-primary-50/25 dark:bg-primary-950/10">
              <td className="py-2.5 font-semibold text-primary-600 dark:text-primary-350">System Conversion Rate Goal Achievement</td>
              <td className="py-2.5 text-right font-extrabold text-xs text-primary-500 font-mono">{data.calculatedRatePercentage}%</td>
            </tr>
          </tbody>
        </table>;
    } else if (rep.type === "LeadSource") {
      return <table className="w-full text-left text-2xs border-collapse">
          <thead>
            <tr className="border-b border-gray-150 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
              <th className="py-2">Acquisition Coordinates Channel</th>
              <th className="py-2 text-right">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-gray-700 dark:text-gray-300 font-mono">
            {Object.keys(data).map((key) => <tr key={key}>
                <td className="py-2.5 font-sans font-medium">{key}</td>
                <td className="py-2.5 text-right font-bold text-gray-900 dark:text-white">{data[key]}</td>
              </tr>)}
          </tbody>
        </table>;
    } else if (rep.type === "Revenue") {
      return <table className="w-full text-left text-2xs border-collapse">
          <thead>
            <tr className="border-b border-gray-150 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
              <th className="py-2">Revenue Element</th>
              <th className="py-2 text-right">Target Metrics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-gray-700 dark:text-gray-300">
            <tr>
              <td className="py-2.5 font-medium">Current secured won LTV</td>
              <td className="py-2.5 text-right font-semibold font-mono text-emerald-500">${data.currentWonRevenue?.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Expected forecast probabilities</td>
              <td className="py-2.5 text-right font-semibold font-mono text-primary-500">${Math.round(data.expectedPipelineForecast || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Assigned company monthly quota</td>
              <td className="py-2.5 text-right font-semibold font-mono">${data.targetValue?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>;
    }
  };
  return <div className="space-y-5">
      {
    /* Visual Header */
  }
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Reports Module</h1>
        <p className="text-xs text-gray-400 mt-0.5">Synthesize PDF-like print catalogs and export spreadsheets databases instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {
    /* Creation drawer panel */
  }
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-3xs">
            <h2 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Generate Snapshot
            </h2>

            <form onSubmit={handleGenerateReport} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Report Label / Name *</label>
                <input
    type="text"
    required
    placeholder="e.g. Q2 Conversion & Revenue Auditing"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-805 border border-gray-200 dark:border-gray-700 rounded-xl"
  />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Report Evaluation Category</label>
                <select
    value={type}
    onChange={(e) => setType(e.target.value)}
    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-805 border border-gray-200 dark:border-gray-700 rounded-xl"
  >
                  <option value="Sales">Sales & Opportunity Volume</option>
                  <option value="Conversion">Lead-to-Customer Conversions</option>
                  <option value="LeadSource">Acquisition Attribution Logs</option>
                  <option value="Revenue">Quota Progress & Predictions</option>
                </select>
              </div>

              <button
    type="submit"
    className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-2xs font-semibold rounded-xl transition cursor-pointer"
  >
                Synthesize Report Snapshot
              </button>
            </form>
          </div>

          {
    /* List of generation snapshot files */
  }
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-3 shadow-3xs max-h-[300px] overflow-y-auto">
            <h2 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-800">
              Snapshot Archive Ledger
            </h2>

            <div className="space-y-2">
              {loading ? <div className="text-center py-4 text-3xs text-gray-400">Loading catalog...</div> : reports.length === 0 ? <div className="text-center py-4 text-3xs text-gray-400 italic">No historical reports found.</div> : reports.map((rep) => <div
    key={rep.id}
    onClick={() => setSelectedReport(rep)}
    className={`p-3 border rounded-xl cursor-pointer text-2xs transition flex justify-between items-center ${selectedReport?.id === rep.id ? "bg-primary-50/40 dark:bg-primary-950/10 border-primary-500" : "bg-gray-50/50 dark:bg-gray-805/30 border-gray-100 dark:border-gray-850"}`}
  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-bold text-gray-900 dark:text-white truncate" title={rep.title}>{rep.title}</div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{rep.type} &middot; {new Date(rep.createdAt).toLocaleDateString()}</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  </div>)}
            </div>
          </div>

        </div>

        {
    /* Detailed Sheet presentation lookalike (Right span 2) */
  }
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between shadow-3xs">
          {selectedReport ? <div className="space-y-6">
              
              {
    /* Report Header sheet style */
  }
              <div className="border-b border-gray-150 dark:border-gray-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-3xs font-mono font-bold px-2 py-1 rounded bg-gray-150 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    REPORT: #{selectedReport.id}
                  </span>
                  <h2 className="text-sm font-bold text-gray-950 dark:text-white mt-2 heading-tight">{selectedReport.title}</h2>
                  <p className="text-3xs text-gray-400 mt-1">
                    System generated snapshot parameters &middot; Creator: <span className="font-semibold text-primary-500">{selectedReport.createdBy}</span>
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
    onClick={() => window.print()}
    className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 dark:border-gray-750 text-gray-600 dark:text-gray-300 rounded-lg text-3xs hover:bg-gray-50 cursor-pointer"
  >
                    <Printer className="w-3.5 h-3.5" /> Print Sheet
                  </button>
                  <button
    onClick={() => handleDownloadCSV(selectedReport.id)}
    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-3xs font-semibold cursor-pointer"
  >
                    <Download className="w-3.5 h-3.5" /> Export Excel CSV
                  </button>
                </div>
              </div>

              {
    /* Data Table contents */
  }
              <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-805/30 border border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider mb-3">Snapshot Metrics Summary</h3>
                {renderReportContent(selectedReport)}
              </div>

              {
    /* Subscript */
  }
              <div className="text-4xs text-gray-400 italic font-mono space-y-1">
                <div>* System snapshot is compiled real-time on top of current local active MongoDB database logs.</div>
                <div>* Generated: {new Date(selectedReport.createdAt).toLocaleString()} (Standard UTC System Time).</div>
              </div>

            </div> : <div className="text-center py-28 text-gray-400 space-y-1">
              <FileSpreadsheet className="w-8 h-8 mx-auto" />
              <div className="text-xs font-semibold">Select Report File</div>
              <p className="text-4xs uppercase tracking-wider">To audit printable sheet profiles</p>
            </div>}
        </div>

      </div>
    </div>;
}
