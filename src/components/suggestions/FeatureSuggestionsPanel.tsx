import { useState } from 'react';
import { X, Heart, Send, Filter } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { demoFeatureSuggestions, FeatureSuggestion } from '../../lib/mockData';
import { useUiStore } from '../../store/uiStore';

const CATEGORIES = ['Feature request', 'PROM idea', 'Observation measure', 'Content & education', 'Accessibility'];

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/health': 'My Health Data',
  '/health/analytics': 'Analytics',
  '/health/charts': 'Health Trends',
  '/health/grid': 'Data Grid',
  '/health/all-obs': 'All Health Data',
  '/health/log': 'Health Log',
  '/health/prom-history': 'PROMs History',
  '/health/reg-history': 'Registry History',
  '/health/export': 'Data Export',
  '/health/dataconfig': 'Data Config',
  '/knowledge': 'Knowledge Hub',
  '/trials': 'Clinical Trials',
  '/settings': 'App Settings',
  '/consent': 'Consent & Privacy',
  '/account': 'My Account',
  '/help': 'Help & Support',
  '/help/glossary': 'Glossary',
};

const STATUS_STYLE: Record<FeatureSuggestion['status'], string> = {
  planned: 'bg-[var(--badge-teal-bg)] text-[var(--teal)]',
  considering: 'bg-[var(--state-pending-bg)] text-[var(--state-pending-text)]',
  live: 'bg-[var(--priority-low-bg)] text-[var(--priority-low-text)]',
  open: 'bg-[var(--badge-neutral-bg)] text-[var(--text-secondary)]',
};

export function FeatureSuggestionsPanel() {
  const { setFeaturePanelOpen } = useUiStore();
  const location = useLocation();

  const [ideas, setIdeas] = useState(demoFeatureSuggestions);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [sort, setSort] = useState<'votes' | 'newest'>('votes');
  const [mySuggestionIds] = useState<Set<string>>(new Set());

  const [text, setText] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [targetPage, setTargetPage] = useState(location.pathname);

  const handleVote = (id: string) => {
    setVoted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); setIdeas((s) => s.map((x) => x.id === id ? { ...x, votes: x.votes - 1 } : x)); }
      else { next.add(id); setIdeas((s) => s.map((x) => x.id === id ? { ...x, votes: x.votes + 1 } : x)); }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    const newIdea: FeatureSuggestion = {
      id: `my-${Date.now()}`,
      title: text.slice(0, 60),
      description: `${text} [Page: ${PAGE_LABELS[targetPage] ?? targetPage}]`,
      votes: 0,
      status: 'open',
      category,
    };
    setIdeas((prev) => [newIdea, ...prev]);
    setText('');
    toast.success('Your suggestion has been submitted — thanks!');
  };

  const displayed = ideas
    .filter((i) => filter === 'mine' ? mySuggestionIds.has(i.id) : true)
    .sort((a, b) => sort === 'votes' ? b.votes - a.votes : 0);

  return (
    <>
      {/* Backdrop */}
      <button type="button" className="fixed inset-0 z-40 bg-black/30 cursor-default" aria-label="Close panel"
        onClick={() => setFeaturePanelOpen(false)} />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-50 h-screen w-full sm:w-1/2 sm:min-w-[480px] bg-[var(--bg-white)] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-token)] bg-[var(--bg-white)]">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Feature Suggestions</p>
            <p className="text-xs text-[var(--text-muted)]">Vote on ideas or suggest your own</p>
          </div>
          <button type="button" onClick={() => setFeaturePanelOpen(false)} aria-label="Close suggestions panel"
            className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-muted)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Submit form */}
          <div className="px-4 py-4 border-b border-[var(--border-token)] space-y-3 bg-[var(--bg-surface)]">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Submit an idea</p>
            <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 280))}
              placeholder="Describe your idea..."
              rows={3}
              className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40 resize-none" />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[var(--text-muted)]">{text.length}/280</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="sugg-category" className="sr-only">Category</label>
                <select id="sugg-category" value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-2 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="sugg-page" className="sr-only">Page context</label>
                <select id="sugg-page" value={targetPage} onChange={(e) => setTargetPage(e.target.value)}
                  className="w-full text-xs px-2 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40">
                  {Object.entries(PAGE_LABELS).map(([path, label]) => (
                    <option key={path} value={path}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="button" onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 text-sm bg-[var(--teal)] text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
              <Send className="w-3.5 h-3.5" /> Submit idea
            </button>
          </div>

          {/* Community ideas */}
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Community ideas</p>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setFilter(filter === 'mine' ? 'all' : 'mine')}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-colors ${filter === 'mine' ? 'bg-[var(--teal)] text-white border-[var(--teal)]' : 'border-[var(--border-token)] text-[var(--text-muted)]'}`}>
                  <Filter className="w-2.5 h-2.5" /> Mine
                </button>
                <button type="button" onClick={() => setSort(sort === 'votes' ? 'newest' : 'votes')}
                  className="text-[10px] px-2 py-1 rounded-lg border border-[var(--border-token)] text-[var(--text-muted)] hover:border-[var(--teal)] transition-colors">
                  {sort === 'votes' ? 'Most votes' : 'Newest'}
                </button>
              </div>
            </div>

            <div className="space-y-2 pb-6">
              {displayed.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-8">No suggestions yet.</p>
              ) : displayed.map((idea) => (
                <div key={idea.id} className="flex gap-3 p-3 bg-[var(--bg-white)] rounded-lg border border-[var(--border-token)]">
                  <button type="button" onClick={() => handleVote(idea.id)}
                    aria-label={`Vote for ${idea.title}`}
                    className={`flex flex-col items-center gap-0.5 shrink-0 w-10 py-1 rounded-lg border transition-colors ${voted.has(idea.id) ? 'bg-[var(--state-error-bg)] border-red-200 text-red-500' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-red-200 hover:text-red-400'}`}>
                    <Heart className={`w-3.5 h-3.5 ${voted.has(idea.id) ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-semibold">{idea.votes}</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1.5 flex-wrap mb-1">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">{idea.title}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium capitalize shrink-0 ${STATUS_STYLE[idea.status]}`}>{idea.status}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--badge-neutral-bg)] text-[var(--text-muted)] font-medium shrink-0">{idea.category}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">{idea.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
