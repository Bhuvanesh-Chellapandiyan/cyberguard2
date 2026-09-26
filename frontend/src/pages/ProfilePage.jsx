import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Save,
  Activity,
  Cpu,
  Database,
} from 'lucide-react';
import { profileAPI, systemAPI, formatApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateUserData, logout } = useAuth();

  const [profile, setProfile] = useState(user);
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [health, setHealth] = useState(null);

  useEffect(() => {
    profileAPI
      .getProfile()
      .then((res) => {
        setProfile(res.data);
        setName(res.data.name);
        updateUserData(res.data);
      })
      .catch((err) => console.warn('Failed to refresh profile:', err));

    systemAPI
      .getHealth()
      .then((res) => setHealth(res.data))
      .catch(() => {});
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword && newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = {};
      if (name.trim() && name.trim() !== profile?.name) {
        payload.name = name.trim();
      }
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      if (Object.keys(payload).length === 0) {
        setErrorMsg('No modifications provided.');
        setLoading(false);
        return;
      }

      const res = await profileAPI.updateProfile(payload);
      setProfile(res.data);
      updateUserData(res.data);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSuccessMsg('Profile security settings updated successfully.');
    } catch (err) {
      setErrorMsg(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div>
        <h1 className="text-3xl font-black font-mono text-white">Security Analyst Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage credentials, view audit activity, and verify operational system status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Identity Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl glass-card border border-slate-800 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-cyan-500/20 text-white">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-white font-mono">{profile?.name || user?.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{profile?.email || user?.email}</p>

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-left text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Role:</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 uppercase font-bold text-[10px]">
                  {profile?.role || 'user'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Scans:</span>
                <span className="text-white font-bold">{profile?.total_scans ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Member Since:</span>
                <span className="text-slate-300">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-6 w-full py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-900/50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          </div>

          {/* System Telemetry Pill */}
          <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2.5 text-xs font-mono">
            <h3 className="text-slate-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>System Telemetry</span>
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">API Status:</span>
              <span className="text-emerald-400 font-bold">{health?.status || 'Active'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Database:</span>
              <span className="text-cyan-400 font-bold">{health?.database || 'Connected'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">ML Model:</span>
              <span className="text-purple-400 font-bold">{health?.model || 'Loaded'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">API Version:</span>
              <span className="text-slate-400">{health?.version || '1.0.0'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Update Profile Settings */}
        <div className="md:col-span-2">
          <div className="p-6 sm:p-8 rounded-2xl glass-card border border-slate-800">
            <h2 className="text-lg font-bold font-mono text-white mb-1">Account & Security Preferences</h2>
            <p className="text-xs text-slate-400 mb-6">
              Update your analyst profile name and secure account password
            </p>

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address (Immutable)
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-sm text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold font-mono text-slate-200 mb-3 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Change Password</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Required only when changing password"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-sm text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-sm text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-sm text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
