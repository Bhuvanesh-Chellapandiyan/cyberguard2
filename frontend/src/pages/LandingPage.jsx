import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Cpu,
  Layers,
  BarChart3,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Check,
  FileSearch,
  Database,
  KeyRound,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleAnalyzeClick = () => {
    if (isAuthenticated) {
      navigate('/detect');
    } else {
      navigate('/login?redirect=%2Fdetect');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-[#0a101d] via-[#090d16] to-[#080c14]">
        {/* Ambient Glow Circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/50 text-cyan-400 text-xs font-mono mb-6 shadow-sm">
            <Zap className="w-3.5 h-3.5" />
            <span>SECURE • INTELLIGENT • REAL-TIME</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
            Detect Phishing. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Protect What Matters.
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            CyberGuard uses machine learning to analyze suspicious website URLs and identify potential
            phishing threats before you trust them.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={handleAnalyzeClick}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-cyan-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Shield className="w-5 h-5" />
              <span>Analyze a URL</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold text-base border border-slate-700/80 transition-all hover:scale-[1.02]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold text-base border border-slate-700/80 transition-all hover:scale-[1.02]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Cybersecurity Visual Demo Card */}
          <div className="max-w-xl mx-auto rounded-2xl glass-card border border-cyan-500/30 shadow-2xl p-6 text-left relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                URL Security Analysis
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Visual Demonstration
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-300 mb-4 truncate">
              https://example-login.com
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
                <div>
                  <span className="text-rose-400 font-bold font-mono text-base block">⚠ PHISHING</span>
                  <span className="text-[10px] text-slate-400 font-mono">Suspicious lexical signature</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">
                  Confidence <span className="text-cyan-400 font-bold ml-1">94.3%</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Risk Level <span className="text-rose-400 font-bold ml-1">HIGH</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-slate-400 pt-1">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>URL analyzed & normalized</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>22 structural features extracted</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>ML prediction completed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Analysis Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1">How CyberGuard Works</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
            A fast, multi-stage inspection pipeline engineered for high precision without visiting untrusted web servers.
          </p>
        </div>

        {/* 4-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-800 relative">
            <span className="text-3xl font-black font-mono text-cyan-500/30 absolute top-4 right-4">01</span>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono text-white mb-2">ENTER URL</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter the website URL you want to analyze before clicking or submitting credentials.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-800 relative">
            <span className="text-3xl font-black font-mono text-blue-500/30 absolute top-4 right-4">02</span>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono text-white mb-2">EXTRACT FEATURES</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              CyberGuard analyzes structural and lexical URL characteristics across 22 engineered dimensions.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-800 relative">
            <span className="text-3xl font-black font-mono text-indigo-500/30 absolute top-4 right-4">03</span>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono text-white mb-2">AI ANALYSIS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Random Forest model evaluates the extracted features against learned threat patterns.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-800 relative">
            <span className="text-3xl font-black font-mono text-purple-500/30 absolute top-4 right-4">04</span>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono text-white mb-2">GET RESULT</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive prediction, confidence, risk level, and human-understandable Explainable AI rationales.
            </p>
          </div>
        </div>

        {/* Visual Workflow Diagram */}
        <div className="mt-10 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center font-mono text-xs text-slate-400 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <span className="text-cyan-400 font-bold">URL</span>
          <span className="text-slate-600">→</span>
          <span className="text-blue-400 font-bold">Feature Extraction</span>
          <span className="text-slate-600">→</span>
          <span className="text-indigo-400 font-bold">Machine Learning</span>
          <span className="text-slate-600">→</span>
          <span className="text-amber-400 font-bold">Risk Analysis</span>
          <span className="text-slate-600">→</span>
          <span className="text-emerald-400 font-bold">Result</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#090e1a]/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Core Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1">Powerful Protection, Powered by AI</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
              Comprehensive URL inspection capabilities designed to defend against modern deceptive web threats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: AI-Powered Detection */}
            <div className="p-6 rounded-2xl glass-card border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">AI-Powered Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Machine learning analyzes URL characteristics to identify potentially suspicious websites.
              </p>
            </div>

            {/* Card 2: Explainable Results */}
            <div className="p-6 rounded-2xl glass-card border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Explainable Results</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Understand why a URL was classified as potentially dangerous with grounded XAI rationales.
              </p>
            </div>

            {/* Card 3: Risk Assessment */}
            <div className="p-6 rounded-2xl glass-card border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Risk Assessment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                View prediction confidence and risk level in a simple, standardized format.
              </p>
            </div>

            {/* Card 4: Scan History */}
            <div className="p-6 rounded-2xl glass-card border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Scan History</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review previously analyzed URLs from your personal dashboard with search and filters.
              </p>
            </div>

            {/* Card 5: Secure Authentication */}
            <div className="p-6 rounded-2xl glass-card border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Secure Authentication</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Protected user accounts with JWT authentication and securely hashed passwords.
              </p>
            </div>

            {/* Card 6: Intelligent Analytics */}
            <div className="p-6 rounded-2xl glass-card border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Intelligent Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                View your scanning activity and threat statistics through the real-time dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Technology Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Technical Foundation</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1 mb-4">Powered by Machine Learning</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              CyberGuard leverages a supervised Random Forest classification ensemble to evaluate lexical
              structures, domain entropy, and credential harvesting patterns.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-left">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xl font-bold font-mono text-cyan-400">Random Forest</span>
                <span className="text-xs text-slate-400 block mt-1">100 Decision Trees</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xl font-bold font-mono text-blue-400">22 URL Features</span>
                <span className="text-xs text-slate-400 block mt-1">Lexical & Structural</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xl font-bold font-mono text-purple-400">Explainable AI</span>
                <span className="text-xs text-slate-400 block mt-1">Grounded Rationale</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xl font-bold font-mono text-emerald-400">Confidence Score</span>
                <span className="text-xs text-slate-400 block mt-1">Probability Metric</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 font-mono">
              ℹ Note: The model analyzes URL characteristics rather than automatically opening or executing the submitted website.
            </div>
          </div>

          {/* Feature Weights Preview Card */}
          <div className="p-6 sm:p-8 rounded-2xl glass-card border border-cyan-900/40">
            <h3 className="text-base font-bold font-mono text-white mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Extracted Feature Categories</span>
            </h3>
            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Protocol & Transport (HTTPS presence, Port)</span>
                <span className="text-cyan-400 font-bold">2 Features</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Host & Subdomain Depth (IP usage, Subdomains)</span>
                <span className="text-blue-400 font-bold">5 Features</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Lexical & Token Symbols (Dots, Hyphens, Slashes, @)</span>
                <span className="text-indigo-400 font-bold">9 Features</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Behavioral Heuristics (Keywords, Shorteners, Digits)</span>
                <span className="text-purple-400 font-bold">6 Features</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#090e1a]/30 scroll-mt-20">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">Architecture Integrity</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1 mb-4">Security First</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mb-10">
            Engineered with strict security best practices from data modeling to user session management.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Secure Authentication</span>
                <span className="text-[11px] text-slate-400">Protected user sessions with standard JWT bearer tokens.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Password Hashing</span>
                <span className="text-[11px] text-slate-400">Bcrypt cryptographic one-way salted password hashing.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">User-Isolated History</span>
                <span className="text-[11px] text-slate-400">Scans are scoped strictly to the authenticated user account.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">MongoDB Storage</span>
                <span className="text-[11px] text-slate-400">Indexed NoSQL storage for fast aggregation and audit logs.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Strict Input Validation</span>
                <span className="text-[11px] text-slate-400">Pydantic validation preventing injection and format errors.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Zero-Execution Sandbox</span>
                <span className="text-[11px] text-slate-400">URLs are never executed or visited by the backend server.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl glass-panel border border-cyan-500/30">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Think Before You Click.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
            Check suspicious URLs with CyberGuard before entering sensitive information.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleAnalyzeClick}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Analyze a Website</span>
            </button>

            {!isAuthenticated && (
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
