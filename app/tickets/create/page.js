'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';

export default function CreateTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Software');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [locationsList, setLocationsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Fetch locations
        const locRes = await fetch('/api/locations');
        let currentLoc = 'Abu Dhabi (HQ)';
        if (locRes.ok) {
          const locData = await locRes.json();
          setLocationsList(locData);
          if (locData.length > 0) currentLoc = locData[0].name;
        }

        // Fetch departments
        const deptRes = await fetch('/api/departments');
        let currentDept = 'Information Technology (IT)';
        if (deptRes.ok) {
          const deptData = await deptRes.json();
          setDepartmentsList(deptData);
          if (deptData.length > 0) currentDept = deptData[0].name;
        }

        // Fetch session
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setLocation(data.user.location || currentLoc);
            setDepartment(data.user.department || currentDept);
          } else {
            setLocation(currentLoc);
            setDepartment(currentDept);
          }
        } else {
          setLocation(currentLoc);
          setDepartment(currentDept);
        }
      } catch (err) {
        console.error(err);
      }
    };
    bootstrap();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, priority, location, department }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to file issue');
      }

      // Redirect directly to the newly created ticket detailed inspect dashboard!
      router.push(`/tickets/${data.ticketId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* Header Block */}
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Log New Support Request
          </h1>
          <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
            File an issue ticket with the IT Helpdesk
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8 glass-card shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Issue Summary / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Cannot log in to ERP client console"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                required
                disabled={loading}
              />
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                  disabled={loading}
                >
                  <option value="Software">Software</option>
                  <option value="Network">Network</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Accounts">Accounts</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Urgency / Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                  disabled={loading}
                >
                  <option value="Low">Low (SLA: 48h)</option>
                  <option value="Medium">Medium (SLA: 24h)</option>
                  <option value="High">High (SLA: 12h)</option>
                  <option value="Critical">Critical (SLA: 2h)</option>
                </select>
              </div>
            </div>

            {/* Location and Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Corporate Location / Site
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                  disabled={loading}
                >
                  {locationsList.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                  disabled={loading}
                >
                  {departmentsList.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Detailed Problem Description
              </label>
              <textarea
                placeholder="Please describe what happens, including any error messages, error codes, and steps to reproduce the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                required
                disabled={loading}
              ></textarea>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-rose-400 text-xs font-semibold bg-rose-500/5 border border-rose-500/10 rounded-xl p-3">
                {error}
              </div>
            )}

            {/* Actions Toolbar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 text-xs font-bold hover:bg-white/5 transition cursor-pointer"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-indigo-850 disabled:to-violet-850 disabled:text-slate-400 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Logging Issue...</span>
                  </>
                ) : (
                  <span>Log Support Ticket</span>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </DashboardShell>
  );
}
