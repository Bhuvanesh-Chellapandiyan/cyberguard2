import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { detectAPI, formatApiError } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import ScanModal from '../components/ScanModal';

const HistoryPage = () => {
  const [scans, setScans] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [predictionFilter, setPredictionFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModalScan, setActiveModalScan] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
      };
      if (search.trim()) params.search = search.trim();
      if (predictionFilter) params.prediction = predictionFilter;
      if (riskFilter) params.risk_level = riskFilter;

      const res = await detectAPI.getHistory(params);
      setScans(res.data.scans || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, predictionFilter, riskFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleResetFilters = () => {
    setSearch('');
    setPredictionFilter('');
    setRiskFilter('');
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;
    try {
      await detectAPI.deleteScan(id);
      fetchHistory();
    } catch (err) {
      alert(formatApiError(err));
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white">Detection History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and audit all URL scans conducted under your account
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono text-cyan-400 border border-slate-700">
            Total Records: <b>{total}</b>
          </span>
          <button
            onClick={fetchHistory}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by URL substring..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-600 font-mono"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={predictionFilter}
            onChange={(e) => {
              setPredictionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono focus:border-cyan-400"
          >
            <option value="">All Predictions</option>
            <option value="PHISHING">Phishing Only</option>
            <option value="LEGITIMATE">Legitimate Only</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono focus:border-cyan-400"
          >
            <option value="">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>

          {(search || predictionFilter || riskFilter) && (
            <button
              onClick={handleResetFilters}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-mono">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
            Loading scan history...
          </div>
        ) : scans.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs font-mono">
            No detection logs found matching query filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Target URL</th>
                  <th className="py-3 px-4">Prediction</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scans.map((scan) => {
                  const isPhish = scan.prediction === 'PHISHING';
                  return (
                    <tr key={scan.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm truncate text-slate-200">
                        {scan.url}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold inline-flex items-center gap-1.5 ${
                            isPhish ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isPhish ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          {isPhish ? 'PHISHING' : 'LEGITIMATE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-cyan-300 font-semibold">{scan.confidence}%</td>
                      <td className="py-3.5 px-4">
                        <RiskBadge risk={scan.risk_level} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(scan.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setActiveModalScan(scan)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-cyan-400 transition-colors"
                            title="Inspect features"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(scan.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Inspector */}
      {activeModalScan && (
        <ScanModal scan={activeModalScan} onClose={() => setActiveModalScan(null)} />
      )}
    </div>
  );
};

export default HistoryPage;
