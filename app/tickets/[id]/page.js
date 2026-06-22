'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [ticket, setTicket] = useState(null);
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [sessionUser, setSessionUser] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [chatMsg, setChatMsg] = useState('');
  const [submittingChat, setSubmittingChat] = useState(false);

  // Fix Notes states
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Technician controls values
  const [statusVal, setStatusVal] = useState('Open');
  const [priorityVal, setPriorityVal] = useState('Medium');
  const [assigneeVal, setAssigneeVal] = useState('');
  const [submittingTech, setSubmittingTech] = useState(false);

  // CSAT feedback values
  const [ratingVal, setRatingVal] = useState(5);
  const [feedbackVal, setFeedbackVal] = useState('');
  const [submittingCsat, setSubmittingCsat] = useState(false);

  const [error, setError] = useState('');
  const chatBottomRef = useRef(null);
  const prevChatsLengthRef = useRef(0);

  // Fetch all ticket details
  const fetchTicketDetails = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/tickets');
          return;
        }
        throw new Error('Could not fetch ticket details');
      }
      const data = await res.json();
      setTicket(data);
      setStatusVal(data.status);
      setPriorityVal(data.priority);
      setAssigneeVal(data.assignee_id || '');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Fetch chat history
  const fetchChats = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}/chat`);
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      // 1. Fetch current session user
      const meRes = await fetch('/api/auth/me');
      let currentSession = null;
      if (meRes.ok) {
        const meData = await meRes.json();
        setSessionUser(meData.user);
        currentSession = meData.user;
      }

      // 2. Fetch ticket details and chats
      await fetchTicketDetails();
      await fetchChats();
      await fetchNotes();
 
      // 3. Fetch users for reassignment (admins and technicians only)
      if (currentSession) {
        try {
          const uRes = await fetch('/api/users');
          if (uRes.ok) {
            const uData = await uRes.json();
            setUsers(uData);
          }
        } catch (err) {
          console.error(err);
        }
      }
 
      setLoading(false);
    };

    bootstrap();
  }, [id, router]);

  // Polling for live support chat & audit logs
  useEffect(() => {
    if (!ticket) return;

    const interval = setInterval(() => {
      fetchChats();
      fetchTicketDetails(); // Keeps SLA and audit logs updated live!
      fetchNotes();
    }, 3000);

    return () => clearInterval(interval);
  }, [ticket]);

  // Auto-scroll to bottom of chat only when a new message actually arrives
  useEffect(() => {
    if (chats.length > prevChatsLengthRef.current) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevChatsLengthRef.current = chats.length;
  }, [chats]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() || submittingChat) return;

    setSubmittingChat(true);
    try {
      const res = await fetch(`/api/tickets/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatMsg })
      });

      if (res.ok) {
        setChatMsg('');
        // Instant load
        await fetchChats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingChat(false);
    }
  };

  const handleUpdateTech = async (e) => {
    e.preventDefault();
    setSubmittingTech(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusVal,
          priority: priorityVal,
          assigneeId: assigneeVal || null
        })
      });

      if (res.ok) {
        await fetchTicketDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTech(false);
    }
  };

  const handleSendCsat = async (e) => {
    e.preventDefault();
    setSubmittingCsat(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: ratingVal,
          feedback: feedbackVal
        })
      });

      if (res.ok) {
        await fetchTicketDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingCsat(false);
    }
  };

  const handleReopenTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Open' })
      });
      if (res.ok) {
        await fetchTicketDetails();
        await fetchChats();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to reopen ticket');
      }
    } catch (err) {
      console.error('Reopen ticket error:', err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Error fetching fix notes:', err);
    }
  };

  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || submittingNote) return;
    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/tickets/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote })
      });
      if (res.ok) {
        setNewNote('');
        await fetchNotes();
        await fetchTicketDetails();
      }
    } catch (err) {
      console.error('Error sending fix note:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleForwardTicket = async (targetUserId, targetUserName) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId: targetUserId })
      });
      if (res.ok) {
        await fetchTicketDetails();
        alert(`Ticket forwarded successfully to ${targetUserName}!`);
      } else {
        alert('Failed to forward ticket');
      }
    } catch (err) {
      console.error('Forward ticket error:', err);
    }
  };

  if (loading || !ticket) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-4">
          <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">Loading Ticket Console...</span>
        </div>
      </DashboardShell>
    );
  }

  // Calculate SLA countdown
  const getSlaCount = () => {
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      return 'SLA Requirement Met';
    }
    const due = new Date(ticket.sla_due);
    const now = new Date();
    const diff = due - now;

    if (diff < 0) {
      return 'SLA Violation Alert';
    }
    const hours = Math.round(diff / (3600 * 1000));
    return `SLA Due: ${hours} hours remaining`;
  };

  const statusColors = {
    'Open': 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    'In Progress': 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    'Resolved': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    'Closed': 'bg-slate-500/10 border-slate-500/20 text-slate-400'
  };

  const priorityColors = {
    'Low': 'bg-slate-900/50 border-white/5 text-slate-400',
    'Medium': 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    'High': 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    'Critical': 'bg-rose-500/10 border-rose-500/20 text-rose-400 border animate-pulse'
  };

  const slaMessage = getSlaCount();

  return (
    <DashboardShell>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link href="/tickets" className="text-xs font-bold text-indigo-400 hover:underline">
                &larr; Return to queue
              </Link>
              <span className="text-slate-700">&bull;</span>
              <span className="text-[10px] font-bold font-mono text-slate-400">{ticket.id}</span>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{ticket.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Escalation Forwarding Controls */}
            {sessionUser && (sessionUser.role === 'admin' || sessionUser.role === 'technician') && (
              <>
                {ticket.assigneeName === 'Fazil' && users.find(u => u.username === 'tech.irfan') && (
                  <button
                    onClick={() => handleForwardTicket(users.find(u => u.username === 'tech.irfan').id, 'Irfan')}
                    className="bg-amber-500/10 hover:bg-amber-600/20 border border-amber-500/20 text-amber-450 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 mr-1"
                  >
                    ➡️ Forward to Irfan
                  </button>
                )}
                {ticket.assigneeName === 'Irfan' && users.find(u => u.username === 'admin.hakeem') && (
                  <button
                    onClick={() => handleForwardTicket(users.find(u => u.username === 'admin.hakeem').id, 'Hakeem (IT Manager)')}
                    className="bg-rose-500/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-450 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 mr-1"
                  >
                    ➡️ Forward to Hakeem
                  </button>
                )}
              </>
            )}

            {(ticket.status === 'Closed' || ticket.status === 'Resolved') && (
              <button
                onClick={handleReopenTicket}
                className="bg-indigo-600/10 hover:bg-indigo-650/20 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-md shadow-indigo-500/5 mr-1"
              >
                🔓 Reopen Ticket
              </button>
            )}
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${statusColors[ticket.status]}`}>
              {ticket.status}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${priorityColors[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-white/5 text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
              {ticket.category}
            </span>
          </div>
        </div>

        {/* 3 Column Grid: Left details & actions, Center live chat, Right timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: Details & Controls (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Ticket Info Card */}
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 glass-card space-y-4 shadow-lg">
              <div className="border-b border-white/5 pb-2.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Issue Description</span>
                <span className={new Date(ticket.sla_due) < new Date() && ticket.status !== 'Resolved' && ticket.status !== 'Closed' ? 'text-rose-500 font-extrabold' : 'text-indigo-400'}>
                  {slaMessage}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300 font-medium whitespace-pre-wrap select-text">
                {ticket.description}
              </p>
              
              <div className="border-t border-white/5 pt-3.5 space-y-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Requester:</span>
                  <span className="font-bold text-slate-300">{ticket.creatorName} ({ticket.department})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Company Node:</span>
                  <span className="text-slate-400 font-medium">{ticket.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Logged At:</span>
                  <span className="text-slate-450 font-mono">{new Date(ticket.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SLA Expiry:</span>
                  <span className="text-slate-450 font-mono">{new Date(ticket.sla_due).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* COLUMN 1a: Technician controls (Admins & Techs only) */}
            {sessionUser && (sessionUser.role === 'admin' || sessionUser.role === 'technician') && (
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 glass-card space-y-4 shadow-lg">
                <div className="border-b border-white/5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Console Actions
                </div>

                <form onSubmit={handleUpdateTech} className="space-y-3.5">
                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Update Status</label>
                    <select
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                      disabled={submittingTech}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Update Priority</label>
                    <select
                      value={priorityVal}
                      onChange={(e) => setPriorityVal(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-slate-355 focus:outline-none focus:border-indigo-500 transition"
                      disabled={submittingTech}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Assign technician</label>
                    <select
                      value={assigneeVal}
                      onChange={(e) => setAssigneeVal(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-slate-360 focus:outline-none focus:border-indigo-500 transition"
                      disabled={submittingTech}
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTech}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white rounded-xl py-2.5 text-xs font-bold transition shadow shadow-indigo-500/10 cursor-pointer"
                  >
                    {submittingTech ? 'Applying Changes...' : 'Save Queue Status'}
                  </button>
                </form>
              </div>
            )}

            {/* COLUMN 1b: User Satisfaction CSAT feedback Form (If ticket is resolved/closed and user is creator) */}
            {sessionUser && sessionUser.id === ticket.creator_id && (ticket.status === 'Resolved' || ticket.status === 'Closed') && (
              <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5 glass-card space-y-4 shadow-lg">
                <div className="border-b border-white/5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Customer Satisfaction feedback (CSAT)
                </div>

                {ticket.rating ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex gap-1.5 text-amber-400">
                      {Array.from({ length: ticket.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <p className="text-slate-400 leading-relaxed italic select-text">
                      &ldquo;{ticket.feedback || 'No comments left.'}&rdquo;
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSendCsat} className="space-y-3">
                    {/* Stars select */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Rating Score</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingVal(star)}
                            className={`text-lg transition cursor-pointer ${
                              ratingVal >= star ? 'text-amber-400 hover:scale-110' : 'text-slate-650 hover:text-amber-500'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback text */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Comments</label>
                      <textarea
                        placeholder="Let us know how the support team handled your request..."
                        value={feedbackVal}
                        onChange={(e) => setFeedbackVal(e.target.value)}
                        rows={2.5}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingCsat}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-850 text-white rounded-xl py-2.5 text-xs font-bold transition shadow shadow-emerald-500/10 cursor-pointer"
                    >
                      {submittingCsat ? 'Submitting...' : 'Submit Satisfaction Survey'}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

          {/* COLUMN 2: Support Live Chat Box (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl glass-card flex flex-col h-[520px] shadow-2xl relative overflow-hidden">
              {/* Header Box */}
              <div className="p-4 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Live Support Chat</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>

              {/* Chats Log Display Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin select-text">
                {chats.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-slate-600 text-xs py-10">
                    No chat log exists for this ticket. Write a message below to start chatting.
                  </div>
                ) : (
                  chats.map((msg) => {
                    const isCurrentUser = sessionUser && msg.sender_id === sessionUser.id;
                    const roleLabels = {
                      'admin': 'Admin',
                      'technician': 'Support Tech',
                      'user': 'Employee'
                    };

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 max-w-[85%] ${
                          isCurrentUser ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        <img
                          src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={msg.senderName}
                          className="w-6.5 h-6.5 rounded-full object-cover border border-white/10 mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <div className={`flex items-center gap-1.5 text-[9px] ${isCurrentUser ? 'justify-end text-slate-400' : 'text-slate-400'}`}>
                            <span className="font-bold text-slate-300">{msg.senderName}</span>
                            <span className="text-[8px] bg-white/5 border border-white/5 text-slate-500 px-1 rounded">
                              {roleLabels[msg.senderRole]}
                            </span>
                          </div>
                          
                          <div
                            className={`p-3 rounded-2xl text-[11px] leading-relaxed select-text ${
                              isCurrentUser
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-slate-950 border border-white/5 text-slate-200 rounded-tl-none'
                            }`}
                          >
                            {msg.message}
                          </div>
                          
                          <div className={`text-[8px] text-slate-500 font-mono ${isCurrentUser ? 'text-right' : ''}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef}></div>
              </div>

              {/* Chat Input Toolbar Footer */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-white/5 bg-slate-950/60 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or request a configuration patch..."
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  disabled={submittingChat || ticket.status === 'Closed'}
                />
                <button
                  type="submit"
                  disabled={!chatMsg.trim() || submittingChat || ticket.status === 'Closed'}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 disabled:text-slate-550 text-white rounded-xl px-4 py-2 text-xs font-bold transition flex items-center justify-center cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* COLUMN 3: Audit Log Timeline Panel (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 glass-card shadow-lg flex flex-col h-[520px]">
              <div className="border-b border-white/5 pb-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Service Desk Audit Logs
              </div>

              <div className="flex-1 overflow-y-auto pt-3 pr-1 scrollbar-thin select-text relative space-y-4">
                {/* Timeline Line */}
                <div className="absolute left-[9px] top-4 bottom-4 w-0.5 bg-indigo-500/10 pointer-events-none"></div>

                {ticket.logs && ticket.logs.length === 0 ? (
                  <p className="text-[10px] text-slate-650 text-center py-6">No audit records exist.</p>
                ) : (
                  ticket.logs && ticket.logs.map((log, idx) => (
                    <div key={idx} className="relative pl-6 flex items-start gap-2.5">
                      {/* Bullet Point Node */}
                      <span className="absolute left-[6.5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500/40 border border-indigo-400 shadow shadow-indigo-500/40"></span>
                      
                      <div className="space-y-0.5 text-[10px]">
                        <div className="text-[9px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div className="font-bold text-slate-300">
                          {log.action}
                        </div>
                        <div className="text-[9px] text-slate-450">
                          Actor: <span className="font-semibold text-slate-400">{log.user}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Technical Fix Notes History console */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <span className="w-1.5 h-4.5 rounded bg-indigo-500"></span>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">🔧 Technical Fix Notes History</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Notes List (2 Cols) */}
            <div className="md:col-span-2 space-y-3.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin select-text">
              {notes.length === 0 ? (
                <div className="text-slate-500 text-xs py-8 text-center italic">
                  No technical fix notes have been documented for this issue yet.
                </div>
              ) : (
                notes.map(n => (
                  <div key={n.id} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span className="font-bold text-indigo-400">{n.user_name}</span>
                      <span>{new Date(n.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-350 font-medium select-text whitespace-pre-wrap leading-relaxed">
                      {n.note}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Fix Note Form (1 Col) - visible to tech/admins */}
            <div className="md:col-span-1">
              {sessionUser && (sessionUser.role === 'admin' || sessionUser.role === 'technician') ? (
                <form onSubmit={handleSendNote} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Insert Fix Note</label>
                    <textarea
                      placeholder="Explain how the issue was fixed, AD group configuration details, or troubleshooting steps..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition resize-none"
                      required
                      disabled={submittingNote}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingNote || !newNote.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white rounded-xl py-2.5 text-xs font-bold transition shadow shadow-indigo-500/10 cursor-pointer"
                  >
                    {submittingNote ? 'Saving Note...' : '💾 Save Fix Note'}
                  </button>
                </form>
              ) : (
                <div className="bg-slate-950/30 border border-white/5 rounded-xl p-4 text-slate-550 text-center text-xs leading-normal">
                  🔒 Fix notes documentation is restricted to IT service desk staff members.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
