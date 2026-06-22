'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';

export default function DashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch current user details
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setSessionUser(meData.user);
        }

        // Fetch tickets
        const tktRes = await fetch('/api/tickets');
        if (tktRes.ok) {
          const tktData = await tktRes.json();
          setTickets(tktData);
        }

        // Fetch emails
        const emailRes = await fetch('/api/emails');
        if (emailRes.ok) {
          const emailData = await emailRes.json();
          setEmails(emailData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-4">
          <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold tracking-widest uppercase">Calculating Metrics...</span>
        </div>
      </DashboardShell>
    );
  }

  // Calculations
  const totalCount = tickets.length;
  const activeCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  const criticalCount = tickets.filter(t => t.priority === 'Critical' && (t.status === 'Open' || t.status === 'In Progress')).length;
  
  // SLA breach calculation: Active tickets that are past their sla_due date
  const slaBreachCount = tickets.filter(t => {
    const isActive = t.status === 'Open' || t.status === 'In Progress';
    const isPastDue = new Date(t.sla_due) < new Date();
    return isActive && isPastDue;
  }).length;

  // Category counts
  const categories = ['Network', 'Hardware', 'Software', 'Accounts'];
  const categoryStats = categories.map(cat => {
    const count = tickets.filter(t => t.category === cat).length;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { name: cat, count, percentage };
  });

  return (
    <DashboardShell>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Operations Center
            </h1>
            <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase mt-1">
              Active Monitoring &amp; Analytics Console
            </p>
          </div>
          <Link
            href="/tickets/create"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <span>➕</span> File New Issue
          </Link>
        </div>

        {/* 4 Dashboard Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <Link href="/tickets?activeQueue=true" className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 glass-card flex items-center justify-between shadow-lg hover:scale-[1.02] hover:border-indigo-500/30 transition-all duration-300 group cursor-pointer">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Queue</span>
              <span className="text-3xl font-extrabold text-white tracking-tight">{activeCount}</span>
              <span className="text-[10px] text-slate-400 block font-semibold">{totalCount} total issues logged</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg shadow-inner group-hover:bg-indigo-500/20 transition-colors">
              📥
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/tickets?priority=Critical" className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 glass-card flex items-center justify-between shadow-lg hover:scale-[1.02] hover:border-amber-500/30 transition-all duration-300 group cursor-pointer">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Critical Escalations</span>
              <span className={`text-3xl font-extrabold tracking-tight ${criticalCount > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                {criticalCount}
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">Requiring immediate fix</span>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg border transition-all group-hover:scale-105 ${
              criticalCount > 0 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' 
                : 'bg-white/5 border-white/5 text-slate-400'
            }`}>
              ⚠️
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/tickets?sla=breached" className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 glass-card flex items-center justify-between shadow-lg hover:scale-[1.02] hover:border-rose-500/30 transition-all duration-300 group cursor-pointer">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">SLA Breaches</span>
              <span className={`text-3xl font-extrabold tracking-tight ${slaBreachCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {slaBreachCount}
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">Exceeded response limits</span>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg border transition-all group-hover:scale-105 ${
              slaBreachCount > 0 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              ⏱️
            </div>
          </Link>

          {/* Card 4 */}
          <Link href="/tickets?status=Resolved" className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 glass-card flex items-center justify-between shadow-lg hover:scale-[1.02] hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Resolution Rate</span>
              <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                {totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}%` : '100%'}
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">{resolvedCount} tickets completed</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg transition-all group-hover:scale-105">
              ✅
            </div>
          </Link>
        </div>

        {/* Categories & Operations Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Category Distribution */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-6 shadow-xl lg:col-span-1">
            <div className="border-b border-white/5 pb-3">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Category Distribution</h2>
              <p className="text-[10px] text-slate-400">Analysis of issues logged by core category</p>
            </div>
            
            <div className="space-y-5">
              {categoryStats.map(stat => (
                <div key={stat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{stat.name}</span>
                    <span className="text-slate-400">{stat.count} ({stat.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Ticket Activity Log */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4 shadow-xl lg:col-span-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Your Action Log</h2>
                <p className="text-[10px] text-slate-400">Real-time status tracking of support tickets</p>
              </div>
              <Link href="/tickets" className="text-[10px] font-bold text-indigo-400 hover:underline">
                View All Queue &rarr;
              </Link>
            </div>

            <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
              {tickets.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No tickets logged. Get started by filing a new issue.
                </div>
              ) : (
                tickets.slice(0, 4).map(t => {
                  const statusColors = {
                    'Open': 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
                    'In Progress': 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                    'Resolved': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                    'Closed': 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                  };

                  return (
                    <div 
                      key={t.id} 
                      className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors duration-300"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono text-indigo-400">{t.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${statusColors[t.status]}`}>
                            {t.status}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-200 line-clamp-1">{t.title}</h3>
                        <p className="text-[10px] text-slate-400">
                          Created by <span className="font-semibold text-slate-300">{t.creatorName}</span> &bull; {new Date(t.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link 
                        href={`/tickets/${t.id}`}
                        className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:bg-white/5 hover:border-indigo-500/20 text-[10px] font-bold text-slate-300 hover:text-indigo-400 transition"
                      >
                        Inspect
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Simulated Email Outbox Log */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4 shadow-xl">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Simulated Email Outbox (Email Log)</h2>
            <p className="text-[10px] text-slate-400">
              Audit log of simulated SMTP email alerts sent by the support portal engine
            </p>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {emails.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-xs">
                No emails dispatched yet. Dispatches occur on new tickets and support replies.
              </div>
            ) : (
              emails.map(email => (
                <div 
                  key={email.id} 
                  className="p-3 bg-slate-950/60 border border-white/5 rounded-xl space-y-2 hover:border-white/10 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-white/5 pb-1.5 text-[10px]">
                    <div className="space-y-0.5">
                      <div>
                        <span className="text-slate-500 font-semibold">FROM:</span> <span className="text-indigo-400 font-mono">{email.from_email}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold">TO:</span> <span className="text-indigo-400 font-mono">{email.to_email}</span>
                      </div>
                    </div>
                    <div className="text-slate-500 font-medium">
                      Dispatched: {new Date(email.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-200">{email.subject}</div>
                  <div 
                    className="text-[10px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 overflow-x-auto leading-relaxed max-h-24 scrollbar-thin"
                    dangerouslySetInnerHTML={{ __html: email.html_content }}
                  ></div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
