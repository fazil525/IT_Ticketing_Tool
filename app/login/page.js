'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Force a full window reload/redirect to ensure session is recognized
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans relative overflow-hidden p-4">
      {/* Ambient Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-950/15 blur-[120px] pointer-events-none z-0"></div>

      <div className="z-10 w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-2xl shadow-xl shadow-indigo-500/20 mx-auto">
            A
          </div>
          <div className="space-y-1">
            <h1 className="font-extrabold text-3xl tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              AuraTick Portal
            </h1>
            <p className="text-xs text-indigo-400 tracking-wider font-semibold uppercase">
              Enterprise Service Desk Login
            </p>
          </div>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 glass-card shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Username
              </label>
              <input
                type="text"
                placeholder="e.g. user.emily"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-rose-400 text-xs font-semibold bg-rose-500/5 border border-rose-500/10 rounded-lg p-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-indigo-800 disabled:to-violet-800 disabled:text-slate-400 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-indigo-500/20 transition mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign In to Console'
              )}
            </button>
          </form>
        </div>

        {/* Collapsible Demo Accounts helper card */}
        <div className="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden glass-card transition-all duration-300">
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            className="w-full px-5 py-3 flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:bg-white/5 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">💡 <span>Available Demo Accounts</span></span>
            <svg
              className={`w-4 h-4 text-slate-400 transform transition-transform duration-300 ${
                showDemo ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          {showDemo && (
            <div className="px-5 py-4 border-t border-white/5 bg-slate-950/40 space-y-3 text-[11px] leading-relaxed">
              <div className="space-y-1">
                <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Standard Users</p>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-indigo-400 font-mono">user.emily</span>
                  <span className="text-slate-500">pwd: password123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-400 font-mono">user.marcus</span>
                  <span className="text-slate-500">pwd: password123</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mt-2">IT Support Technicians</p>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-indigo-400 font-mono">tech.alex</span>
                  <span className="text-slate-500">pwd: password123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-400 font-mono">tech.jordan</span>
                  <span className="text-slate-500">pwd: password123</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mt-2">IT Administrator</p>
                <div className="flex justify-between">
                  <span className="text-indigo-400 font-mono">admin.sarah</span>
                  <span className="text-slate-500">pwd: password123</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
