import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut, Menu, X, LayoutDashboard, Search, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { systemAPI } from '../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    systemAPI
      .getHealth()
      .then((res) => {
        if (res.data?.status === 'ok') setApiOnline(true);
      })
      .catch(() => setApiOnline(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isLandingPage = location.pathname === '/';

  // Navigation Links definition
  const publicLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: isLandingPage ? '#how-it-works' : '/#how-it-works' },
    { name: 'Features', path: isLandingPage ? '#features' : '/#features' },
    { name: 'About', path: isLandingPage ? '#about' : '/#about' },
  ];

  const authenticatedLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Detect URL', path: '/detect', icon: Search },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-950/40 bg-[#090d16]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-wider text-white font-mono">
                  CYBER<span className="text-cyan-400">GUARD</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight">Phishing Protection</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              authenticatedLinks.map((link) => {
                const active = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })
            ) : (
              publicLinks.map((link) => {
                const isAnchor = link.path.startsWith('#') || link.path.includes('#');
                if (isAnchor && isLandingPage) {
                  return (
                    <a
                      key={link.name}
                      href={link.path.startsWith('/#') ? link.path.substring(1) : link.path}
                      className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      {link.name}
                    </a>
                  );
                }
                const active = location.pathname === link.path && !isAnchor;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })
            )}
          </nav>

          {/* Right Action / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* System Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                }`}
              />
              <span className="text-slate-400">{apiOnline ? 'AI Ready' : 'Connecting'}</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-medium max-w-[120px] truncate">{user?.name || 'User'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 border-t border-slate-800 bg-[#090d16]/95 backdrop-blur-xl">
          {isAuthenticated ? (
            authenticatedLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {link.name}
              </Link>
            ))
          ) : (
            publicLinks.map((link) => {
              const isAnchor = link.path.startsWith('#') || link.path.includes('#');
              if (isAnchor && isLandingPage) {
                return (
                  <a
                    key={link.name}
                    href={link.path.startsWith('/#') ? link.path.substring(1) : link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
                  >
                    {link.name}
                  </a>
                );
              }
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })
          )}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-slate-400 flex items-center justify-between">
                  <span>
                    Signed in as <b className="text-cyan-400">{user?.name}</b>
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-600 text-white"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-950/20 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-500 text-white"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
