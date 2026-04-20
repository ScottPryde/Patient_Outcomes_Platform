import { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { demoMetricSeries, demoLifeEvents } from '../../lib/mockData';

type TrendDir = 'up' | 'down' | 'stable';

interface GridRow {
  date: string;
  category: string;
  metric: string;
  value: number;
  unit: string;
  source: string;
  trend: TrendDir;
}

type SortKey = keyof GridRow;
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 20;

function buildRows(): GridRow[] {
  const rows: GridRow[] = [];
  for (const series of demoMetricSeries) {
    const vals = series.values;
    vals.forEach((pt, i) => {
      const prev = vals[i - 1];
      let trend: TrendDir = 'stable';
      if (prev) {
        const delta = pt.value - prev.value;
        if (Math.abs(delta) > 0.01) trend = delta > 0 ? 'up' : 'down';
      }
      const catMap: Record<string, string> = {
        'Physical': 'Clinical', 'Fatigue & Mood': 'PROM', 'Wearable': 'Wearable',
        'Clinical': 'Clinical', 'PROMs': 'PROM',
      };
      rows.push({
        date: pt.date,
        category: catMap[series.domain] ?? series.domain,
        metric: series.label,
        value: pt.value,
        unit: series.unit,
        source: series.domain === 'Wearable' ? 'Apple Watch' : series.domain === 'PROMs' ? 'PROM' : 'Manual',
        trend,
      });
    });
  }
  for (const ev of demoLifeEvents) {
    if (ev.value !== null && ev.metric !== null) {
      rows.push({ date: ev.date, category: 'Life Event', metric: ev.metric, value: ev.value as number, unit: '', source: 'Self-report', trend: 'stable' });
    }
  }
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

const CAT_COLOURS: Record<string, string> = {
  'PROM': 'bg-[var(--badge-vault-bg)] text-[var(--purple)]',
  'Wearable': 'bg-[var(--badge-teal-bg)] text-[var(--teal)]',
  'Clinical': 'bg-[var(--badge-navy-bg)] text-[var(--blue)]',
  'Life Event': 'bg-[var(--state-pending-bg)] text-[var(--state-pending-text)]',
};

function TrendCell({ value }: { value: TrendDir }) {
  if (value === 'up') return <span className="inline-flex items-center gap-1 text-[var(--success)] text-xs font-medium"><TrendingUp className="w-3.5 h-3.5" />Up</span>;
  if (value === 'down') return <span className="inline-flex items-center gap-1 text-[var(--danger)] text-xs font-medium"><TrendingDown className="w-3.5 h-3.5" />Down</span>;
  return <span className="inline-flex items-center gap-1 text-[var(--text-muted)] text-xs"><Minus className="w-3.5 h-3.5" />Stable</span>;
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <span className="w-3 h-3 opacity-0"><ChevronUp className="w-3 h-3" /></span>;
  return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
}

const COLS: { key: SortKey; label: string; className: string }[] = [
  { key: 'date', label: 'Date', className: 'w-28' },
  { key: 'category', label: 'Category', className: 'w-28' },
  { key: 'metric', label: 'Metric', className: '' },
  { key: 'value', label: 'Value', className: 'w-28' },
  { key: 'source', label: 'Source', className: 'w-28 hidden md:table-cell' },
  { key: 'trend', label: 'Trend', className: 'w-24' },
];

export function ObsGridPage() {
  const allRows = useMemo(() => buildRows(), []);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [catFilter, setCatFilter] = useState('All');
  const [page, setPage] = useState(0);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(allRows.map((r) => r.category))).sort()],
    [allRows],
  );

  const filtered = useMemo(() => {
    const base = catFilter === 'All' ? allRows : allRows.filter((r) => r.category === catFilter);
    return [...base].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [allRows, catFilter, sortKey, sortDir]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(0);
  };

  const handleExport = () => {
    const header = 'Date,Category,Metric,Value,Unit,Source,Trend';
    const lines = filtered.map((r) => `${r.date},${r.category},"${r.metric}",${r.value},${r.unit},${r.source},${r.trend}`);
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interactium_data_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Data Grid</h1>
        <p className="text-sm text-[var(--text-secondary)]">All health observations — sortable, filterable, exportable.</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={handleExport}
          className="flex items-center gap-1.5 text-xs bg-[var(--navy)] text-white px-3 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
        <span className="text-xs text-[var(--text-muted)] ml-auto">{filtered.length} observations</span>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((c) => (
          <button key={c} type="button"
            onClick={() => { setCatFilter(c); setPage(0); }}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${catFilter === c ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--badge-navy-bg)] text-xs">
                {COLS.map(({ key, label, className }) => (
                  <th key={key}
                    className={`text-left px-4 py-3 font-semibold text-[var(--blue)] uppercase tracking-wide cursor-pointer select-none hover:text-[var(--navy)] transition-colors ${className}`}
                    onClick={() => handleSort(key)}>
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={`${row.date}-${row.metric}-${i}`}
                  className="border-b border-[var(--border-light)] hover:bg-[var(--bg-surface)] transition-colors">
                  <td className="px-4 py-2.5 text-xs text-[var(--text-muted)] whitespace-nowrap">{fmtDate(row.date)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${CAT_COLOURS[row.category] ?? 'bg-[var(--badge-neutral-bg)] text-[var(--text-secondary)]'}`}>
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-medium text-[var(--text-primary)]">{row.metric}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-[var(--text-primary)]">{row.value}{row.unit ? ` ${row.unit}` : ''}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--text-muted)] hidden md:table-cell">{row.source}</td>
                  <td className="px-4 py-2.5"><TrendCell value={row.trend} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-token)] bg-[var(--bg-surface)]">
            <p className="text-xs text-[var(--text-muted)]">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="First page" onClick={() => setPage(0)} disabled={page === 0}
                className="p-1.5 rounded-lg border border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-3 h-3" />
              </button>
              {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => {
                const p = pageCount <= 7 ? i : i === 0 ? 0 : i === 6 ? pageCount - 1 : page - 2 + i;
                const clamped = Math.max(0, Math.min(p, pageCount - 1));
                return (
                  <button key={clamped} type="button" onClick={() => setPage(clamped)}
                    className={`w-7 h-7 text-xs rounded-lg border transition-colors ${clamped === page ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300'}`}>
                    {clamped + 1}
                  </button>
                );
              })}
              <button type="button" aria-label="Last page" onClick={() => setPage(pageCount - 1)} disabled={page === pageCount - 1}
                className="p-1.5 rounded-lg border border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {pageRows.map((row, i) => (
          <div key={`${row.date}-${row.metric}-${i}`}
            className="bg-[var(--bg-white)] rounded-lg border border-[var(--border-token)] p-3 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{row.metric}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${CAT_COLOURS[row.category] ?? 'bg-[var(--badge-neutral-bg)] text-[var(--text-secondary)]'}`}>
                {row.category}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-bold text-[var(--text-primary)]">{row.value}{row.unit ? ` ${row.unit}` : ''}</span>
              <TrendCell value={row.trend} />
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>{fmtDate(row.date)}</span>
              <span>·</span>
              <span>{row.source}</span>
            </div>
          </div>
        ))}

        {/* Mobile pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-[var(--border-token)] text-[var(--text-muted)] disabled:opacity-40">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="text-xs text-[var(--text-muted)]">Page {page + 1} of {pageCount}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page === pageCount - 1}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-[var(--border-token)] text-[var(--text-muted)] disabled:opacity-40">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
