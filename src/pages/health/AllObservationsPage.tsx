import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { demoMetricSeries, demoLifeEvents, demoRegistryHistory } from '../../lib/mockData';

type Category = 'All' | 'PROMs' | 'Wearable' | 'Clinical' | 'Registry' | 'Life Events';
type SortDir = 'newest' | 'oldest' | 'category';

const PAGE_SIZE = 20;

const CATEGORY_COLOUR: Record<string, string> = {
  PROMs: 'bg-[var(--badge-vault-bg)] text-[var(--purple)]',
  Wearable: 'bg-[var(--badge-teal-bg)] text-[var(--teal)]',
  Clinical: 'bg-[var(--badge-navy-bg)] text-[var(--blue)]',
  Registry: 'bg-[var(--priority-low-bg)] text-[var(--priority-low-text)]',
  'Life Events': 'bg-[var(--state-pending-bg)] text-[var(--state-pending-text)]',
};

interface ObsRow {
  id: string;
  date: string;
  category: Category;
  metric: string;
  value: string;
  source: string;
  trend: 'up' | 'down' | 'stable';
}

function buildRows(): ObsRow[] {
  const rows: ObsRow[] = [];

  for (const s of demoMetricSeries) {
    const catMap: Record<string, Category> = {
      'Physical': 'Clinical', 'Fatigue & Mood': 'PROMs', 'Wearable': 'Wearable',
      'Clinical': 'Clinical', 'PROMs': 'PROMs',
    };
    const cat: Category = catMap[s.domain] ?? 'Clinical';
    s.values.forEach((v, i) => {
      const prev = s.values[i - 1];
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (prev) {
        const d = v.value - prev.value;
        if (Math.abs(d) > 0.01) trend = d > 0 ? 'up' : 'down';
      }
      rows.push({
        id: `${s.id}-${v.date}`,
        date: v.date,
        category: cat,
        metric: s.label,
        value: `${v.value}${s.unit ? ' ' + s.unit : ''}`,
        source: s.domain === 'Wearable' ? 'Apple Watch' : 'Self-report',
        trend,
      });
    });
  }

  for (const ev of demoLifeEvents) {
    rows.push({
      id: ev.id,
      date: ev.date,
      category: 'Life Events',
      metric: ev.type,
      value: ev.note,
      source: 'Self-report',
      trend: 'stable',
    });
  }

  for (const visit of demoRegistryHistory.visits) {
    rows.push({
      id: `reg-${visit.date}`,
      date: visit.date,
      category: 'Registry',
      metric: 'Registry visit',
      value: visit.type,
      source: 'TREAT-NMD',
      trend: 'stable',
    });
  }

  return rows;
}

const ALL_ROWS = buildRows();

export function AllObservationsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [sortDir, setSortDir] = useState<SortDir>('newest');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = ALL_ROWS;
    if (category !== 'All') rows = rows.filter((r) => r.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.metric.toLowerCase().includes(q) || r.value.toLowerCase().includes(q) || r.source.toLowerCase().includes(q));
    }
    if (sortDir === 'newest') rows = [...rows].sort((a, b) => b.date.localeCompare(a.date));
    else if (sortDir === 'oldest') rows = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    else rows = [...rows].sort((a, b) => a.category.localeCompare(b.category));
    return rows;
  }, [search, category, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCategoryChange = (c: Category) => { setCategory(c); setPage(1); };
  const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };

  const CATEGORIES: Category[] = ['All', 'PROMs', 'Wearable', 'Clinical', 'Registry', 'Life Events'];

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">All Health Data</h1>
        <p className="text-sm text-[var(--text-secondary)]">{ALL_ROWS.length} observations — searchable and filterable.</p>
      </div>

      {/* Search + sort */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search metrics, values, sources..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40"
          />
        </div>
        <label htmlFor="sort-select" className="sr-only">Sort by</label>
        <select
          id="sort-select"
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value as SortDir)}
          className="text-sm px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="category">By category</option>
        </select>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => handleCategoryChange(c)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${category === c ? 'bg-[var(--teal)] text-white border-[var(--teal)]' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-[var(--teal)]'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Table */}
      {pageRows.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-[var(--text-muted)]">No observations match your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border-token)]">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-[var(--badge-navy-bg)] text-xs">
                <th className="px-4 py-3 text-left font-semibold text-[var(--blue)] uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--blue)] uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--blue)] uppercase tracking-wide">Metric</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--blue)] uppercase tracking-wide">Value</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--blue)] uppercase tracking-wide">Source</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--blue)] uppercase tracking-wide">Trend</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={row.id} className={i % 2 === 0 ? 'bg-[var(--bg-white)]' : 'bg-[var(--bg-surface)]'}>
                  <td className="px-4 py-2.5 text-xs text-[var(--text-muted)] whitespace-nowrap">
                    {new Date(row.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${CATEGORY_COLOUR[row.category] ?? 'bg-[var(--badge-neutral-bg)] text-[var(--text-secondary)]'}`}>
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-medium text-[var(--text-primary)] capitalize">{row.metric}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--text-secondary)] max-w-[180px] truncate">{row.value}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--text-muted)]">{row.source}</td>
                  <td className="px-4 py-2.5 text-xs">
                    {row.trend === 'up' ? <span className="text-[var(--success)]">↑</span>
                      : row.trend === 'down' ? <span className="text-[var(--danger)]">↓</span>
                      : <span className="text-[var(--text-muted)]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Previous page" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg border border-[var(--border-token)] disabled:opacity-40 hover:bg-[var(--bg-surface)] transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 font-medium text-[var(--text-primary)]">{page} / {totalPages}</span>
            <button type="button" aria-label="Next page" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-[var(--border-token)] disabled:opacity-40 hover:bg-[var(--bg-surface)] transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
