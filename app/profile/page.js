'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ all: 0, active: 0, closed: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);

  // Password update form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch session
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
          
          // Fetch stats for active/closed ticket counts
          const statsRes = await fetch('/api/tickets/stats');
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            // If they are admin/technician, their tickets might be 'self' or we show their personal stats
            if (meData.user.role === 'user') {
              // Standard users see global stats because stats API filters global by creator_id
              setStats(statsData.global);
            } else {
              // Technicians/admins see self-assigned ticket stats
              setStats(statsData.self);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Your password has been changed securely.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update password.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20 text-slate-400 text-xs font-mono animate-pulse">
          Synchronizing credentials with Active Directory...
        </div>
      </DashboardShell>
    );
  }

  // Active Directory permissions mapping based on role
  const adGroups = user.role === 'admin' 
    ? ['CN=Domain_Admins,CN=Users,DC=reem,DC=ae', 'CN=IT_Admins,OU=Security_Groups,DC=reem,DC=ae', 'CN=Schema_Admins,CN=Configuration,DC=reem,DC=ae']
    : user.role === 'technician'
    ? ['CN=IT_Support_Staff,OU=Security_Groups,DC=reem,DC=ae', 'CN=Domain_Users,CN=Users,DC=reem,DC=ae']
    : ['CN=Domain_Users,CN=Users,DC=reem,DC=ae', 'CN=Reem_Employees,OU=Distribution_Groups,DC=reem,DC=ae'];

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Security Credentials &amp; Profile</h1>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">
            Identity Provisioning &amp; Access Controls
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Basic Information Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card shadow-xl flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/30 p-1 bg-slate-950 shadow-2xl"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full" title="Active SSO Session"></span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-200">{user.name}</h2>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">{user.role}</p>
              </div>

              <div className="w-full border-t border-white/5 my-2"></div>

              <div className="w-full space-y-3.5 text-left text-xs">
                <div>
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Employee ID</span>
                  <span className="font-mono font-bold text-slate-355">{user.employeeId || 'EMP-UNKNOWN'}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Corporate Email</span>
                  <span className="text-slate-300 font-medium break-all">{user.email}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Department</span>
                  <span className="text-slate-300 font-semibold">{user.department || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Company</span>
                  <span className="text-slate-300 font-semibold">{user.company || 'Emirates Reem Investments PJSC'}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Corporate Site (Location)</span>
                  <span className="text-slate-300 font-semibold flex items-center gap-1">
                    📍 {user.location || 'Abu Dhabi (HQ)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Stats widget */}
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 glass-card shadow-xl space-y-3.5">
              <h3 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
                📈 Queue Performance
              </h3>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5 text-center">
                  <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">My Tickets</div>
                  <div className="text-base font-extrabold text-white mt-0.5">{stats.all || 0}</div>
                </div>
                <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5 text-center">
                  <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Active</div>
                  <div className="text-base font-extrabold text-indigo-400 mt-0.5">{stats.active || 0}</div>
                </div>
                <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5 text-center">
                  <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Resolved</div>
                  <div className="text-base font-extrabold text-emerald-450 mt-0.5">{stats.closed || 0}</div>
                </div>
                <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5 text-center">
                  <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SLA Met</div>
                  <div className="text-base font-extrabold text-amber-500 mt-0.5">100%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Security privileges & Password Form */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Active Directory Security Privileges */}
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4.5 rounded bg-indigo-500"></span>
                  <h3 className="text-sm font-bold text-slate-200">Active Directory Privileges</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-bold uppercase tracking-widest">
                  Kerberos SSO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your account is bound to <strong>EMIRATES_REEM_INVESTMENTS_PJSC</strong> Active Directory directory tree. The security node credentials below list the authentication nodes mapped to your workstation profile.
              </p>

              <div className="space-y-2.5">
                {adGroups.map((group, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-slate-950/50 border border-white/5 rounded-xl px-3.5 py-2.5 text-slate-350 font-mono text-[10px] break-all leading-normal">
                    <span className="text-emerald-500 text-xs">🛡️</span>
                    <span>{group}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Password Change Form */}
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card shadow-xl space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4.5 rounded bg-rose-500"></span>
                <h3 className="text-sm font-bold text-slate-200">Update Account Password</h3>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {message.text && (
                  <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
                    message.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                  }`}>
                    {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Current Password */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-rose-500 transition"
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-rose-500 transition"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-rose-500 transition"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-rose-550 hover:bg-rose-600 border border-rose-500/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-rose-550/15 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {updating ? 'Updating Password...' : '🔒 Change Password'}
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
