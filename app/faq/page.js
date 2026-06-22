'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Network', 'Accounts', 'Hardware', 'Software'];

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const url = `/api/faqs?category=${activeCategory}&search=${encodeURIComponent(search)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setFaqs(data);
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchFaqs();
    }, 200); // 200ms debounce for typing search

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, search]);

  const toggleExpand = (id) => {
    setExpandedFaqId(prev => (prev === id ? null : id));
  };

  return (
    <DashboardShell>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Knowledge Solutions Directory
          </h1>
          <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">
            Self-Service IT Support Resolution Portal
          </p>
        </div>

        {/* Search and Categories Toolbar */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 glass-card space-y-4 shadow-xl">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-xs">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search articles by keyword or system name (e.g. VPN, printer)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setExpandedFaqId(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  activeCategory === cat
                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Accordion Queue */}
        <div className="space-y-3.5">
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Indexing Articles...</span>
            </div>
          ) : faqs.length === 0 ? (
            <div className="bg-slate-900/10 border border-white/5 rounded-2xl p-8 text-center text-slate-500 text-xs">
              No matching knowledge base articles found. Try adjusting your category or search term.
            </div>
          ) : (
            faqs.map(faq => {
              const isExpanded = expandedFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`bg-slate-900/20 border rounded-2xl overflow-hidden glass-card transition-all duration-300 ${
                    isExpanded 
                      ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/5' 
                      : 'border-white/5'
                  }`}
                >
                  {/* Article Title Header */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition duration-300 cursor-pointer"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-100 tracking-wide mt-1">
                        {faq.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {faq.summary}
                      </p>
                    </div>
                    
                    <span className={`w-8 h-8 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-center text-xs text-slate-400 transform transition-transform duration-300 ${
                      isExpanded ? 'rotate-180 text-indigo-400 border-indigo-500/20' : ''
                    }`}>
                      ▼
                    </span>
                  </button>

                  {/* Expanded Content Panel */}
                  {isExpanded && (
                    <div className="px-6 py-5 bg-slate-950/40 border-t border-white/5 text-[11px] leading-relaxed text-slate-300 space-y-4 whitespace-pre-line select-text">
                      <div className="prose prose-invert max-w-none">
                        {faq.content}
                      </div>
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-slate-500">
                        <span>Was this solution helpful?</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-slate-900 border border-white/5 hover:border-emerald-500/20 hover:text-emerald-400 rounded-md transition cursor-pointer">
                            Yes, solved it!
                          </button>
                          <button className="px-3 py-1 bg-slate-900 border border-white/5 hover:border-rose-500/20 hover:text-rose-400 rounded-md transition cursor-pointer">
                            No, need a ticket
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
