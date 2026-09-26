import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { detectAPI, formatApiError } from '../services/api';
import RiskBadge from '../components/RiskBadge';

const PRESET_SAMPLES = [
  { label: 'Legitimate: Google', url: 'https://www.google.com/search?q=cybersecurity' },
  { label: 'Legitimate: GitHub', url: 'https://github.com/fastapi/fastapi' },
  { label: 'Legitimate: Wikipedia', url: 'https://en.wikipedia.org/wiki/Machine_learning' },
  { label: 'Phishing: IP Address', url: 'http://192.168.1.1/banking/login.php' },
  { label: 'Phishing: Spoofed PayPal', url: 'http://paypa1-security-verify.com/login.html' },
  { label: 'Phishing: Keyword Stuffing', url: 'http://login.secure.update.account.banking.paypal.verify-user.co.vu/login' },
];

const DetectionPage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleScan = async (e) => {
    e?.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Please provide a URL to analyze.');
      return;
    }

    if (cleanUrl.length > 2048) {
      setError('URL length exceeds maximum limit of 2048 characters.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    // Simulate stepping for realistic visual UX
    setCurrentStep(1);
    const stepTimer = setTimeout(() => setCurrentStep(2), 200);

    try {
      const res = await detectAPI.scanUrl(cleanUrl);
      setCurrentStep(3);
      setResult(res.data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      clearTimeout(stepTimer);
      setLoading(false);
      setCurrentStep(0);
    }
  };

  const handleCopyUrl = () => {
    if (result?.url) {
      navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPhishing = result?.prediction === 'PHISHING';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-mono mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>Real-time Random Forest Threat Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Is this website safe?
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">
          Analyze a URL using machine learning before entering sensitive information or credentials.
        </p>
      </div>

      {/* Main Analysis Card */}
      <div className="p-6 sm:p-8 rounded-2xl glass-card border border-cyan-500/30 shadow-2xl mb-8">
        <form onSubmit={handleScan} className="space-y-4">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
            Target Website URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://secure-login-example.com/auth"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-600 font-mono text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing URL...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Analyze URL</span>
                </>
              )}
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-mono">Sample URLs:</span>
            {PRESET_SAMPLES.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(s.url);
                  setError('');
                }}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 font-mono transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Loading Progress State */}
        {loading && (
          <div className="mt-6 pt-6 border-t border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="text-cyan-400 font-bold">Scanning in progress...</span>
              <span>Running 22-Feature Extractor</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 animate-pulse w-3/4 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Result Section */}
      {result && (
        <div className="rounded-2xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          {/* Result Banner */}
          <div
            className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isPhishing
                ? 'bg-rose-950/30 border-rose-600/40 glow-rose'
                : 'bg-emerald-950/30 border-emerald-600/40 glow-emerald'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  isPhishing
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {isPhishing ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  ML Prediction Result
                </span>
                <h2 className="text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                  {isPhishing ? '⚠️ PHISHING DETECTED' : '✓ LEGITIMATE URL'}
                </h2>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
              <RiskBadge risk={result.risk_level} size="lg" />
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400 block">Confidence Score</span>
                <span className="text-xl font-black font-mono text-cyan-400">{result.confidence}%</span>
              </div>
            </div>
          </div>

          {/* Inspected URL Display */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5">
                Target URL
              </span>
              <p className="text-xs font-mono text-slate-300 break-all select-all">{result.url}</p>
            </div>
            <button
              onClick={handleCopyUrl}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Explainable AI Reasons */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Why This URL Was {isPhishing ? 'Flagged as Suspicious' : 'Classified as Legitimate'}</span>
            </h3>
            <div className="space-y-2">
              {(result.reasons || []).map((reason, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-sm flex items-start gap-3 ${
                    isPhishing
                      ? 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                      : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                  }`}
                >
                  {isPhishing ? (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Analysis Grid */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3">
              Technical Feature Extraction (22 Lexical & Structural Metrics)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs font-mono">
              {Object.entries(result.features || {}).map(([key, val]) => (
                <div key={key} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block truncate text-[11px]" title={key}>
                    {key}
                  </span>
                  <span className="text-cyan-300 font-bold text-sm">
                    {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-mono text-slate-500">
              Scanned on: {result.created_at ? new Date(result.created_at).toLocaleString() : 'Just now'}
            </span>
            <button
              onClick={() => {
                setResult(null);
                setUrl('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Analyze Another URL</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionPage;
