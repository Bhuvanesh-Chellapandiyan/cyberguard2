import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Activity,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { dashboardAPI, detectAPI, formatApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RiskBadge from '../components/RiskBadge';
import ScanModal from '../components/ScanModal';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeModalScan, setActiveModalScan] = useState(null);

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError('');
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteScan = async (scanId) => {
    if (!window.confirm('Delete this scan record from history?')) return;
    try {
      await detectAPI.deleteScan(scanId);
      fetchStats();
    } catch (err) {
      alert(formatApiError(err));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
        <p className="text-sm font-mono text-slate-400">Loading threat intelligence telemetry...</p>
      </div>
    );
  }

  const phishingCount = stats?.phishing_count || 0;
  const legitimateCount = stats?.legitimate_count || 0;
  const totalScans = stats?.total_scans || 0;
  const avgConfidence = stats?.average_confidence || 0.0;

  // Chart data: Phishing vs Legitimate Donut
  const pieData = [
    { name: 'Legitimate', value: legitimateCount, color: '#10b981' },
    { name: 'Phishing', value: phishingCount, color: '#f43f5e' },
  ];

  // Chart data: Risk Distribution
  const riskDist = stats?.risk_distribution || { LOW: 0, MEDIUM: 0, HIGH: 0 };
  const riskData = [
    { name: 'Low Risk', count: riskDist.LOW || 0, fill: '#10b981' },
    { name: 'Medium Risk', count: riskDist.MEDIUM || 0, fill: '#f59e0b' },
    { name: 'High Risk', count: riskDist.HIGH || 0, fill: '#f43f5e' },
  ];

  // Timeline data: Activity over time
  const timelineData = stats?.timeline || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-cyan-900/50">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-mono text-white">
              Welcome back, <span className="text-cyan-400">{user?.name || 'Analyst'}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Threat Intelligence & ML URL Inspection Overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <Link
            to="/detect"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Analyze New URL</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Scans</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white">{totalScans}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">Aggregated user scans</p>
        </div>

        {/* Phishing Detected */}
        <div className="p-5 rounded-2xl glass-card border border-rose-900/40">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Phishing Detected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-rose-400">{phishingCount}</div>
          <p className="text-[11px] text-rose-400/70 mt-1 font-mono">
            {totalScans > 0 ? `${((phishingCount / totalScans) * 100).toFixed(1)}% of total` : '0%'}
          </p>
        </div>

        {/* Legitimate URLs */}
        <div className="p-5 rounded-2xl glass-card border border-emerald-900/40">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Legitimate URLs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">{legitimateCount}</div>
          <p className="text-[11px] text-emerald-400/70 mt-1 font-mono">
            {totalScans > 0 ? `${((legitimateCount / totalScans) * 100).toFixed(1)}% of total` : '0%'}
          </p>
        </div>

        {/* Average Confidence */}
        <div className="p-5 rounded-2xl glass-card border border-cyan-900/40">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Avg Confidence</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-cyan-400">{avgConfidence}%</div>
          <p className="text-[11px] text-cyan-400/70 mt-1 font-mono">Random Forest probability</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phishing vs Legitimate Donut */}
        <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col">
          <h3 className="text-sm font-bold font-mono text-white mb-1">Threat Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Phishing vs Legitimate classification ratio</p>

          <div className="h-64 flex items-center justify-center">
            {totalScans === 0 ? (
              <div className="text-center text-slate-500 text-xs font-mono">
                No scan data recorded yet.<br />
                <Link to="/detect" className="text-cyan-400 underline mt-1 block">Scan a URL to populate</Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 7-Day Scan Timeline */}
        <div className="p-6 rounded-2xl glass-card border border-slate-800 lg:col-span-2 flex flex-col">
          <h3 className="text-sm font-bold font-mono text-white mb-1">Scan Activity (Last 7 Days)</h3>
          <p className="text-xs text-slate-400 mb-4">Inspection volume categorized by threat verdict</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="legitimate" name="Legitimate" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="phishing" name="Phishing" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="rounded-2xl glass-card border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-mono text-white">Recent Security Scans</h3>
            <p className="text-xs text-slate-400">Latest URLs inspected under this account</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All History</span>
            <span>→</span>
          </Link>
        </div>

        {(!stats?.recent_scans || stats.recent_scans.length === 0) ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No scans recorded yet.{' '}
            <Link to="/detect" className="text-cyan-400 underline font-bold">
              Run your first detection
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Target URL</th>
                  <th className="pb-3 px-3">Prediction</th>
                  <th className="pb-3 px-3">Confidence</th>
                  <th className="pb-3 px-3">Risk Level</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.recent_scans.map((scan) => {
                  const isPhish = scan.prediction === 'PHISHING';
                  return (
                    <tr key={scan.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 max-w-[280px] truncate text-slate-200">
                        {scan.url}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isPhish ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isPhish ? '⚠️ PHISHING' : '✓ LEGITIMATE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-cyan-300 font-semibold">{scan.confidence}%</td>
                      <td className="py-3 px-3">
                        <RiskBadge risk={scan.risk_level} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setActiveModalScan(scan)}
                            className="p-1.5 rounded hover:bg-slate-700 text-cyan-400"
                            title="Inspect details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteScan(scan.id)}
                            className="p-1.5 rounded hover:bg-rose-900/40 text-slate-500 hover:text-rose-400"
                            title="Delete scan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Detail Inspection Modal */}
      {activeModalScan && (
        <ScanModal scan={activeModalScan} onClose={() => setActiveModalScan(null)} />
      )}
    </div>
  );
};

export default DashboardPage;
