import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#060911] text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: Brand & Tagline */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-white font-mono font-bold tracking-wider text-base">CYBERGUARD</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            AI-powered phishing website detection using 22-dimensional URL feature extraction,
            Random Forest machine learning, and Explainable AI.
          </p>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h4 className="text-white text-xs font-mono uppercase tracking-wider font-semibold mb-3">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="hover:text-cyan-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              {isLandingPage ? (
                <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
                  How It Works
                </a>
              ) : (
                <Link to="/#how-it-works" className="hover:text-cyan-400 transition-colors">
                  How It Works
                </Link>
              )}
            </li>
            <li>
              {isLandingPage ? (
                <a href="#features" className="hover:text-cyan-400 transition-colors">
                  Features
                </a>
              ) : (
                <Link to="/#features" className="hover:text-cyan-400 transition-colors">
                  Features
                </Link>
              )}
            </li>
            <li>
              {isLandingPage ? (
                <a href="#about" className="hover:text-cyan-400 transition-colors">
                  About
                </a>
              ) : (
                <Link to="/#about" className="hover:text-cyan-400 transition-colors">
                  About
                </Link>
              )}
            </li>
          </ul>
        </div>

        {/* Col 3: Authentication Links */}
        <div>
          <h4 className="text-white text-xs font-mono uppercase tracking-wider font-semibold mb-3">
            Account & Access
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/login" className="hover:text-cyan-400 transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-cyan-400 transition-colors">
                Create Account
              </Link>
            </li>
            <li>
              <Link to="/detect" className="hover:text-cyan-400 transition-colors">
                URL Scanner
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">
                Threat Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar & Disclaimer */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 CyberGuard. All rights reserved.</p>
        <p className="text-center sm:text-right max-w-lg text-[11px] text-slate-500">
          CyberGuard provides automated URL analysis and should not be considered a guarantee that a website is safe.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
