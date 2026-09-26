import React from 'react';
import { X, ShieldCheck, ShieldAlert, AlertTriangle, Clock, Hash, Globe, CheckCircle2, XCircle } from 'lucide-react';
import RiskBadge from './RiskBadge';

const ScanModal = ({ scan, onClose }) => {
  if (!scan) return null;

  const isPhishing = scan.prediction === 'PHISHING';
  const features = scan.features || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d1322] border border-cyan-900/50 shadow-2xl text-slate-200 p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6 pr-8">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isPhishing
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 glow-rose'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 glow-emerald'
            }`}
          >
            {isPhishing ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-mono tracking-tight text-white">
                {isPhishing ? '⚠️ PHISHING DETECTED' : '✓ LEGITIMATE WEBSITE'}
              </h2>
              <RiskBadge risk={scan.risk_level} />
            </div>
            <p className="text-xs text-slate-400 break-all font-mono mt-1 select-all bg-slate-950/60 p-2 rounded border border-slate-800">
              {scan.url}
            </p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">ML Confidence Score</span>
            <span className="text-lg font-black font-mono text-cyan-400">{scan.confidence}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isPhishing ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
              }`}
              style={{ width: `${Math.min(scan.confidence, 100)}%` }}
            />
          </div>
        </div>

        {/* Explainable AI Reasons */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3 flex items-center gap-2">
            <span>Model Explainability (XAI Rationale)</span>
          </h3>
          <div className="space-y-2">
            {(scan.reasons && scan.reasons.length > 0 ? scan.reasons : ['Standard URL parameters observed.']).map((reason, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-sm flex items-start gap-2.5 ${
                  isPhishing
                    ? 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                    : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                }`}
              >
                {isPhishing ? (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Extracted Features Inspection Grid */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3">
            Extracted Feature Vector (22 Engineered Attributes)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs font-mono">
            {Object.entries(features).map(([key, val]) => (
              <div key={key} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block truncate" title={key}>{key}</span>
                <span className="text-cyan-300 font-bold text-sm">
                  {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            {scan.created_at && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {new Date(scan.created_at).toLocaleString()}
              </span>
            )}
            {scan.id && (
              <span className="flex items-center gap-1.5 text-slate-500 font-mono">
                <Hash className="w-3.5 h-3.5" />
                ID: {scan.id}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanModal;
