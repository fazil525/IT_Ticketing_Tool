'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check authentication and load user data
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    // Load active notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();

    // Poll for notifications every 10 seconds to keep live alerts ticking!
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'POST' });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read_status: 1 }))
        );
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      // Mark single notification as read in database
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notif.id })
      });

      // Update state locally
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, read_status: 1 } : n)
      );

      // Close dropdown
      setShowNotifications(false);

      // Route to ticket
      if (notif.ticket_id) {
        router.push(`/tickets/${notif.ticket_id}`);
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
      // Fallback redirect
      if (notif.ticket_id) {
        router.push(`/tickets/${notif.ticket_id}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 font-sans">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-xl mx-auto">
            A
          </div>
          <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
            Loading Console...
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n.read_status === 0).length;

  const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: '🎛️' },
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'Global Tickets', href: '/tickets?view=global', icon: '🎟️', badge: user.role === 'admin' || user.role === 'technician' ? 'Queue' : null },
    { name: 'Self Tickets', href: '/tickets?view=self', icon: '🎫', badge: 'My' },
    { name: 'Trashed Tickets', href: '/tickets?view=trashed', icon: '🗑️' },
    { name: 'Categories', href: '/faq', icon: '🗂️' },
    { name: 'Knowledge', href: '/faq', icon: '📖' },
    { name: 'Projects', href: '/dashboard', icon: '📁' },
    { name: 'Department', href: '/dashboard', icon: '🏢' },
    { name: 'Location', href: '/dashboard', icon: '📍' }
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      
      {/* 1. Sticky Sidebar on Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/5 flex flex-col justify-between transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-0'} md:relative md:translate-x-0 transition-transform duration-350 ease-out`}>
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-white/5 justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                A
              </div>
              <span className="font-extrabold text-base tracking-tight bg-clip-text bg-gradient-to-r from-white to-slate-350">
                AuraTick
              </span>
            </Link>
            {/* Close button for mobile screen view */}
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white cursor-pointer">
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
            {sidebarLinks.map((link, index) => {
              const isActive = pathname === link.href || (link.href.startsWith('/tickets') && pathname.startsWith('/tickets') && !pathname.includes('/create'));
              return (
                <Link
                  key={index}
                  href={link.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group border ${
                    isActive
                      ? 'bg-indigo-600/10 border-indigo-500/25 text-indigo-400 font-bold'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm opacity-80 group-hover:scale-110 transition-transform">{link.icon}</span>
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-500 uppercase tracking-widest">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {user.role === 'admin' && (
              <Link
                href="/admin/users"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all ${
                  pathname === '/admin/users'
                    ? 'bg-indigo-600/10 border-indigo-500/25 text-indigo-400 font-bold'
                    : 'text-slate-450 border-transparent hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className="text-sm">👥</span>
                <span>User Registry</span>
              </Link>
            )}
          </div>
        </div>

        {/* User Card Profile bottom of sidebar */}
        <div className="p-4 border-t border-white/5 bg-slate-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user.name}
              className="w-8 h-8 rounded-lg object-cover border border-white/10"
            />
            <div className="text-left max-w-[110px] truncate">
              <div className="text-xs font-bold text-slate-200 leading-tight truncate">{user.name}</div>
              <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                {user.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-xs hover:bg-rose-500/20 text-rose-450 transition cursor-pointer"
            title="Sign Out"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"></div>
      )}

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Navigation Header */}
        <header className="sticky top-0 z-30 h-16 bg-slate-950/70 border-b border-white/5 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Mobile menu toggle & brand */}
          <div className="flex items-center gap-3 md:gap-0">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 border border-white/5 text-slate-300 hover:text-white cursor-pointer">
              ☰
            </button>
            <div className="md:hidden font-extrabold text-sm tracking-tight text-white pl-1">
              AuraTick
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Quick Create Button */}
            <Link
              href="/tickets/create"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition shadow-md shadow-indigo-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <span>➕</span> <span className="hidden sm:inline">File Request</span>
            </Link>

            {/* Notification bell dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-white/5 hover:bg-white/5 flex items-center justify-center transition text-slate-450 hover:text-white relative cursor-pointer"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl glass-card z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-slate-350">Live Support Alerts</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-indigo-400 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin">
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-slate-505 text-center py-4">No active alerts</p>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-2.5 rounded-lg border text-[11px] leading-relaxed transition cursor-pointer hover:border-indigo-500/20 ${
                            notif.read_status === 0
                              ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-100 font-medium'
                              : 'bg-slate-950/40 border-white/5 text-slate-450'
                          }`}
                        >
                          <div>{notif.message}</div>
                          <div className="text-[9px] text-slate-500 mt-1 flex justify-between items-center">
                            <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {notif.read_status === 0 && <span className="w-1 h-1 rounded-full bg-indigo-500"></span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Top-Right Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-450 text-[10px] font-bold uppercase tracking-widest px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              title="Sign Out"
            >
              <span>🚪</span> <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-white/5 py-5 bg-slate-950/30 text-center">
          <div className="text-[10px] text-slate-500">
            &copy; {new Date().getFullYear()} AuraTick Portal. Emirates Reem Investments PJSC.
          </div>
        </footer>
      </div>
    </div>
  );
}
