'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';

function TicketQueueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterView = searchParams.get('view') || 'global'; // 'global', 'self', 'trashed'

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    global: { all: 0, recent: 0, active: 0, suspended: 0, closed: 0 },
    self: { all: 0, active: 0, closed: 0, suspended: 0 }
  });
  const [sessionUser, setSessionUser] = useState(null);
  
  // Controls
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [category, setCategory] = useState('All');
  const [slaFilter, setSlaFilter] = useState('All'); // 'All', 'breached'
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch session profile
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setSessionUser(meData.user);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSession();
  }, []);

  // Fetch stats dashboard metrics
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/tickets/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch queue support tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (status !== 'All') queryParams.append('status', status);
      if (priority !== 'All') queryParams.append('priority', priority);
      if (category !== 'All') queryParams.append('category', category);
      if (search.trim()) queryParams.append('search', search.trim());

      const res = await fetch(`/api/tickets?${queryParams.toString()}`);
      if (res.ok) {
        let data = await res.json();

        // Client-side view filtering
        if (filterView === 'self' && sessionUser) {
          data = data.filter(t => t.assignee_id === sessionUser.id);
        } else if (filterView === 'trashed') {
          // Empty or filtered, since SQLite does not support permanent trash without status
          data = data.filter(t => t.status === 'Closed');
        }

        // Apply SLA breach client-side filter
        if (slaFilter === 'breached') {
          data = data.filter(t => {
            const isActive = t.status === 'Open' || t.status === 'In Progress';
            const isPastDue = new Date(t.sla_due) < new Date();
            return isActive && isPastDue;
          });
        }

        // Apply Active Queue client-side filter
        if (searchParams.get('activeQueue') === 'true') {
          data = data.filter(t => t.status === 'Open' || t.status === 'In Progress');
        }

        setTickets(data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch support team list
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.filter(u => u.role === 'admin' || u.role === 'technician'));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [sessionUser]);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    const categoryParam = searchParams.get('category');
    const slaParam = searchParams.get('sla');
    
    if (statusParam) setStatus(statusParam);
    if (priorityParam) setPriority(priorityParam);
    if (categoryParam) setCategory(categoryParam);
    if (slaParam) setSlaFilter(slaParam);
  }, [searchParams]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTickets();
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [search, status, priority, category, filterView, sessionUser, slaFilter]);

  // Handle re-assignment selection live
  const handleAssignTo = async (ticketId, assigneeId) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId: assigneeId || null })
      });
      if (res.ok) {
        await fetchTickets();
        await fetchStats();
      }
    } catch (err) {
      console.error('Re-assign API Error:', err);
    }
  };

  // Handle single ticket deletion
  const handleDeleteTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchTickets();
        await fetchStats();
      } else {
        const data = await res.json();
        alert(data.error || 'Access Denied: Only Administrators can delete tickets.');
      }
    } catch (err) {
      console.error('Delete Ticket Error:', err);
    }
  };

  // Handle bulk deletes
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected tickets?`)) return;

    try {
      let failedCount = 0;
      for (const id of selectedIds) {
        const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
        if (!res.ok) failedCount++;
      }
      if (failedCount > 0) {
        alert(`Deleted tickets. ${failedCount} could not be deleted (Only admins can delete).`);
      }
      setSelectedIds([]);
      await fetchTickets();
      await fetchStats();
    } catch (err) {
      console.error('Bulk Delete Error:', err);
    }
  };

  // Checkbox interactions
  const handleCheckboxToggle = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedTickets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedTickets.map(t => t.id));
    }
  };

  // Pagination Calculations
  const totalPages = Math.ceil(tickets.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTickets = tickets.slice(startIndex, startIndex + pageSize);

  const timeAgo = (dateStr) => {
    const created = new Date(dateStr);
    const now = new Date();
    const diffMs = now - created;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <DashboardShell>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">IT Support Console</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">
              Enterprise Workflows &amp; Operations Center
            </p>
          </div>
          <Link
            href="/tickets/create"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>➕</span> Log Support Issue
          </Link>
        </div>        {/* --- GLOBAL TICKETS ROW (HIDDEN FOR STANDARD EMPLOYEES) --- */}
        {sessionUser?.role !== 'user' && (
          <div className="space-y-2 animate-in fade-in">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Global Tickets</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              
              {/* All */}
              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4.5 glass-card flex items-center justify-between shadow-md">
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">All Tickets</div>
                  <div className="text-xl font-extrabold text-white">{stats.global.all}</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-base">🎫</div>
              </div>

              {/* Recent */}
              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4.5 glass-card flex items-center justify-between shadow-md">
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recent Tickets</div>
                  <div className="text-xl font-extrabold text-white">{stats.global.recent}</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-450 text-base">⏳</div>
              </div>

              {/* Active */}
              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4.5 glass-card flex items-center justify-between shadow-md">
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Tickets</div>
                  <div className="text-xl font-extrabold text-white">{stats.global.active}</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-base">🟢</div>
              </div>

              {/* Suspended */}
              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4.5 glass-card flex items-center justify-between shadow-md">
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Suspended Tickets</div>
                  <div className="text-xl font-extrabold text-white">{stats.global.suspended}</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-550 text-base">⚠️</div>
              </div>

              {/* Closed */}
              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4.5 glass-card flex items-center justify-between shadow-md col-span-2 md:col-span-1">
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Closed Tickets</div>
                  <div className="text-xl font-extrabold text-white">{stats.global.closed}</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-450 text-base">🔒</div>
              </div>

            </div>
          </div>
        )}

        {/* --- PERSONAL / SELF TICKETS ROW --- */}
        <div className="space-y-2">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
            {sessionUser?.role === 'user' ? 'My Ticket Metrics' : 'Self Tickets'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Self Assigned / Created */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4.5 glass-card flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {sessionUser?.role === 'user' ? 'All My Tickets' : 'Self assigned Tickets'}
                </div>
                <div className="text-xl font-extrabold text-white">
                  {sessionUser?.role === 'user' ? stats.global.all : stats.self.all}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-455 text-base">🗂️</div>
            </div>

            {/* My Assigned Active / My Created Active */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4.5 glass-card flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {sessionUser?.role === 'user' ? 'Active Issues' : 'My Assigned Tickets'}
                </div>
                <div className="text-xl font-extrabold text-white">
                  {sessionUser?.role === 'user' ? stats.global.active : stats.self.active}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-base">⚡</div>
            </div>

            {/* Closed / Resolved */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4.5 glass-card flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Closed/Resolved</div>
                <div className="text-xl font-extrabold text-white">
                  {sessionUser?.role === 'user' ? stats.global.closed : stats.self.closed}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-base">⛔</div>
            </div>

            {/* Suspended */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4.5 glass-card flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Suspended</div>
                <div className="text-xl font-extrabold text-white">
                  {sessionUser?.role === 'user' ? stats.global.suspended : stats.self.suspended}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-455 text-base">⏸️</div>
            </div>
          </div>
        </div>

        {/* --- RECENT TICKETS TABLE VIEW --- */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl glass-card shadow-xl overflow-hidden">
          
          {/* Header & Filter Controls Bar */}
          <div className="p-5 border-b border-white/5 space-y-4">
            
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4.5 rounded bg-indigo-500"></span>
              <h3 className="text-sm font-bold text-slate-200">Recent Tickets</h3>
            </div>

            {/* Action Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left sizing controls & delete/refresh */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-450 font-medium">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-950 border border-white/5 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries</span>
                </div>

                {/* Bulk Delete */}
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  className="bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1"
                >
                  🗑️ Delete
                </button>

                {/* Reload */}
                <button
                  onClick={() => {
                    fetchTickets();
                    fetchStats();
                  }}
                  className="w-7.5 h-7.5 rounded-lg bg-slate-950 border border-white/5 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                  title="Refresh Queue"
                >
                  🔄
                </button>
              </div>

              {/* Right search input */}
              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

            </div>
          </div>

          {/* Grid view wrapper */}
          <div className="overflow-x-auto select-text scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/45 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-5 py-3.5 w-16">Sl.No</th>
                  <th className="px-3 py-3.5 w-12">
                    <input
                      type="checkbox"
                      checked={paginatedTickets.length > 0 && selectedIds.length === paginatedTickets.length}
                      onChange={handleSelectAll}
                      className="rounded border-white/10 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-5 py-3.5">Ticket Details</th>
                  <th className="px-5 py-3.5 w-32">Status</th>
                  <th className="px-5 py-3.5 w-48">Assign To</th>
                  <th className="px-5 py-3.5 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                      Synchronizing active ticket pipeline...
                    </td>
                  </tr>
                ) : paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                      No matching tickets found in this queue view.
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((t, idx) => {
                    const globalIdx = startIndex + idx + 1;
                    const isSelected = selectedIds.includes(t.id);

                    const statusBadges = {
                      'Open': 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
                      'In Progress': 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                      'Suspended': 'bg-slate-900 border-white/5 text-slate-400',
                      'Resolved': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                      'Closed': 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                    };

                    const canReassign = sessionUser && (sessionUser.role === 'admin' || sessionUser.role === 'technician');

                    return (
                      <tr key={t.id} className={`hover:bg-white/1.5 transition ${isSelected ? 'bg-indigo-500/2' : ''}`}>
                        
                        {/* 1. Sl.No */}
                        <td className="px-5 py-4 text-xs font-mono font-bold text-slate-500">{globalIdx}</td>
                        
                        {/* 2. Checkbox */}
                        <td className="px-3 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCheckboxToggle(t.id)}
                            className="rounded border-white/10 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                        
                        {/* 3. Ticket Details */}
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <Link href={`/tickets/${t.id}`} className="text-xs font-bold text-slate-200 hover:text-indigo-400 transition tracking-wide hover:underline">
                              {t.title}
                            </Link>
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-1.5">
                              <span className="font-mono text-indigo-400 font-bold">{t.id}</span>
                              <span>&bull;</span>
                              <span>{new Date(t.created_at).toLocaleDateString()}</span>
                              <span>&bull;</span>
                              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                                {t.category}
                              </span>
                              <span>&bull;</span>
                              <span>{timeAgo(t.created_at)}</span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Status Badge */}
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${statusBadges[t.status]}`}>
                            {t.status}
                          </span>
                        </td>

                        {/* 5. Assign To selector dropdown or static text */}
                        <td className="px-5 py-4">
                          {canReassign ? (
                            <div className="flex items-center gap-1">
                              <select
                                value={t.assignee_id || ''}
                                onChange={(e) => handleAssignTo(t.id, e.target.value)}
                                className="bg-slate-950 border border-white/5 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                              >
                                <option value="">Multi Assign</option>
                                {users.map(u => (
                                  <option key={u.id} value={u.id}>
                                    {u.name}
                                  </option>
                                ))}
                              </select>
                              {t.assignee_id && (
                                <button
                                  onClick={() => handleAssignTo(t.id, '')}
                                  className="w-5.5 h-5.5 rounded-md bg-slate-950 border border-white/5 text-slate-500 hover:text-white flex items-center justify-center text-[10px] transition cursor-pointer"
                                  title="Clear Assignment"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold">
                              {t.assigneeName || 'Unassigned'}
                            </span>
                          )}
                        </td>

                        {/* 6. Action buttons */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Inspect */}
                            <Link
                              href={`/tickets/${t.id}`}
                              className="w-7.5 h-7.5 bg-slate-950 border border-white/5 hover:border-indigo-500/20 hover:text-indigo-400 rounded-lg flex items-center justify-center text-xs transition cursor-pointer"
                              title="Inspect Ticket"
                            >
                              👁️
                            </Link>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteTicket(t.id)}
                              className="w-7.5 h-7.5 bg-slate-950 border border-white/5 hover:border-rose-500/20 hover:text-rose-450 rounded-lg flex items-center justify-center text-xs transition cursor-pointer text-slate-450"
                              title="Delete Ticket"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination Navigation Controls */}
          <div className="p-4 border-t border-white/5 bg-slate-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="text-[11px] text-slate-500 font-medium">
              Showing page {currentPage} of {totalPages} ({tickets.length} total entries)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="bg-slate-950 border border-white/5 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 text-slate-300 text-xs px-3.5 py-1.5 rounded-lg transition font-semibold cursor-pointer"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7.5 h-7.5 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer border ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-500/10'
                        : 'bg-slate-950 border-white/5 text-slate-450 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="bg-slate-950 border border-white/5 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 text-slate-300 text-xs px-3.5 py-1.5 rounded-lg transition font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>

          </div>

        </div>

      </div>
    </DashboardShell>
  );
}

export default function TicketQueuePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 font-sans">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-xl mx-auto animate-spin">
            A
          </div>
          <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
            Loading Support Console...
          </div>
        </div>
      </div>
    }>
      <TicketQueueContent />
    </Suspense>
  );
}
