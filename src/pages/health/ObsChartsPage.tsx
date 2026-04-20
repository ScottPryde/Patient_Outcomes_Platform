import { useState, useMemo } from 'react';
import { demoMetricSeries, demoLifeEvents, METRIC_DOMAINS } from '../../lib/mockData';
import { ReactECharts } from '../../components/charts/ReactECharts';
import type { EChartsOption } from '../../components/charts/ReactECharts';
import { Pin, EyeOff, BarChart2, LineChart, X } from 'lucide-react';
import { toast } from 'sonner';

type Range = '1m' | '3m' | '6m' | '1y';

const RANGE_LABELS: Record<Range, string> = {
  '1m': '1 month', '3m': '3 months', '6m': '6 months', '1y': '1 year',
};

const EVENT_EMOJI: Record<string, string> = {
  illness: '🤒', exercise: '🏃', medication: '💊', social: '🎉', travel: '✈️', stress: '😰', other: '📝',
};

const EVENT_TYPES = Object.entries(EVENT_EMOJI);

interface Annotation { date: string; note: string; type: string }

interface PendingTag { seriesId: string; date: string; value: number; xLabel: string }

function sliceByRange(values: { date: string; value: number }[], range: Range) {
  const months = range === '1m' ? 1 : range === '3m' ? 3 : range === '6m' ? 6 : 12;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return values.filter((v) => new Date(v.date) >= cutoff);
}

function fmtXLabel(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

export function ObsChartsPage() {
  const [domain, setDomain] = useState<string>('All');
  const [range, setRange] = useState<Range>('6m');
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [chartTypes, setChartTypes] = useState<Record<string, 'line' | 'bar'>>({});
  const [annotations, setAnnotations] = useState<Record<string, Annotation[]>>({});

  const [pendingTag, setPendingTag] = useState<PendingTag | null>(null);
  const [tagDraft, setTagDraft] = useState({ type: 'other', note: '' });

  const filtered = useMemo(() => {
    const base = domain === 'All' ? demoMetricSeries : demoMetricSeries.filter((s) => s.domain === domain);
    const sorted = [...base.filter((s) => pinned.has(s.id)), ...base.filter((s) => !pinned.has(s.id))];
    return sorted.filter((s) => !hidden.has(s.id));
  }, [domain, pinned, hidden]);

  const saveTag = () => {
    if (!pendingTag) return;
    const note = tagDraft.note.trim() || EVENT_EMOJI[tagDraft.type];
    setAnnotations((prev) => ({
      ...prev,
      [pendingTag.seriesId]: [...(prev[pendingTag.seriesId] ?? []), {
        date: pendingTag.date, note, type: tagDraft.type,
      }],
    }));
    setTagDraft({ type: 'other', note: '' });
    setPendingTag(null);
    toast.success('Tag saved');
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Health Trends</h1>
          <p className="text-sm text-[var(--text-secondary)]">Your health metrics over time — click any data point to tag it.</p>
        </div>
        <div className="flex gap-1">
          {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
            <button key={r} type="button" onClick={() => setRange(r)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${range === r ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300'}`}>
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Domain tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {METRIC_DOMAINS.map((d) => (
          <button key={d} type="button" onClick={() => setDomain(d)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${domain === d ? 'bg-[var(--teal)] text-white border-[var(--teal)]' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-[var(--teal)]'}`}>
            {d}
          </button>
        ))}
      </div>

      {/* Tag form modal */}
      {pendingTag && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/30" onClick={() => setPendingTag(null)} aria-label="Close tag form" />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto bg-[var(--bg-white)] rounded-[var(--radius-modal)] shadow-[var(--shadow-modal)] p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Tag this data point</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {demoMetricSeries.find(s => s.id === pendingTag.seriesId)?.label} · {pendingTag.xLabel} · <span className="font-mono">{pendingTag.value}</span>
                </p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setPendingTag(null)} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event type pills */}
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Event type</p>
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TYPES.map(([type, emoji]) => (
                  <button key={type} type="button"
                    onClick={() => setTagDraft((d) => ({ ...d, type }))}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors capitalize ${tagDraft.type === type ? 'bg-[var(--teal)] text-white border-[var(--teal)]' : 'border-[var(--border-token)] text-[var(--text-secondary)] hover:border-[var(--teal)]'}`}>
                    {emoji} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label htmlFor="tag-note" className="text-xs font-medium text-[var(--text-muted)] block mb-1.5">Note (optional)</label>
              <textarea id="tag-note" value={tagDraft.note}
                onChange={(e) => setTagDraft((d) => ({ ...d, note: e.target.value }))}
                placeholder={`${EVENT_EMOJI[tagDraft.type]} Add a note...`}
                rows={2}
                className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40 resize-none" />
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setPendingTag(null)}
                className="flex-1 text-sm py-2 rounded-lg border border-[var(--border-token)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors">
                Cancel
              </button>
              <button type="button" onClick={saveTag}
                className="flex-1 text-sm py-2 rounded-lg bg-[var(--teal)] text-white font-medium hover:opacity-90 transition-opacity">
                Save tag
              </button>
            </div>
          </div>
        </>
      )}

      {/* Chart grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s) => {
          const data = sliceByRange(s.values, range);
          const chartType = chartTypes[s.id] ?? 'line';
          const seriesAnnotations = annotations[s.id] ?? [];
          const xLabels = data.map((d) => fmtXLabel(d.date));

          const option: EChartsOption = {
            grid: { left: 38, right: 8, top: 10, bottom: 28 },
            tooltip: {
              trigger: 'axis',
              backgroundColor: '#1e293b',
              borderWidth: 0,
              textStyle: { color: '#fff' },
            },
            xAxis: {
              type: 'category',
              data: xLabels,
              axisLabel: { color: '#94a3b8', fontSize: 10 },
              axisLine: { lineStyle: { color: '#e2e8f0' } },
            },
            yAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
            series: [{
              type: chartType,
              smooth: chartType === 'line',
              data: data.map((d) => d.value),
              lineStyle: chartType === 'line' ? { color: s.color, width: 2 } : undefined,
              itemStyle: { color: s.color },
              areaStyle: chartType === 'line' ? { color: `${s.color}14` } : undefined,
              markLine: demoLifeEvents.length > 0 ? {
                symbol: 'none',
                data: demoLifeEvents.map((ev) => ({
                  xAxis: fmtXLabel(ev.date),
                  label: { formatter: `${EVENT_EMOJI[ev.type] ?? '📝'}`, fontSize: 10 },
                  lineStyle: { color: '#cbd5e1', type: 'dashed' as const, width: 1 },
                })),
              } : undefined,
              markPoint: seriesAnnotations.length > 0 ? {
                tooltip: { show: true },
                data: seriesAnnotations.map((a) => {
                  const matchIdx = data.findIndex((d) => fmtXLabel(d.date) === fmtXLabel(a.date));
                  const yVal = matchIdx >= 0 ? data[matchIdx].value : 0;
                  return {
                    name: `${EVENT_EMOJI[a.type] ?? '📝'} ${a.note}`,
                    coord: [fmtXLabel(a.date), yVal],
                    symbol: 'circle',
                    symbolSize: 22,
                    itemStyle: { color: 'rgba(11,155,140,0.12)', borderColor: '#0b9b8c', borderWidth: 2 },
                    label: { show: false },
                    tooltip: {
                      formatter: `<b>${EVENT_EMOJI[a.type] ?? '📝'} ${a.type}</b><br/>${a.note || ''}`,
                      backgroundColor: '#1e293b',
                      borderWidth: 0,
                      textStyle: { color: '#fff', fontSize: 12 },
                    },
                  };
                }),
              } : undefined,
            }],
          };

          const handleChartClick = (params: unknown) => {
            const p = params as { componentType?: string; dataIndex?: number; value?: number };
            if (p.componentType !== 'series') return;
            const idx = p.dataIndex ?? 0;
            const pt = data[idx];
            if (!pt) return;
            setPendingTag({ seriesId: s.id, date: pt.date, value: p.value ?? pt.value, xLabel: xLabels[idx] });
            setTagDraft({ type: 'other', note: '' });
          };

          return (
            <div key={s.id} className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
              {/* Card header */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{s.label}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {s.direction === 'lower' ? 'Lower = better' : s.direction === 'higher' ? 'Higher = better' : 'Stable target'}
                    {' · click a point to tag'}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  <button type="button" aria-label="Line chart" onClick={() => setChartTypes((p) => ({ ...p, [s.id]: 'line' }))}
                    className={`p-1.5 rounded-lg transition-colors ${(chartTypes[s.id] ?? 'line') === 'line' ? 'text-[var(--teal)] bg-[var(--state-active-bg)]' : 'text-[var(--text-muted)]'}`}>
                    <LineChart className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" aria-label="Bar chart" onClick={() => setChartTypes((p) => ({ ...p, [s.id]: 'bar' }))}
                    className={`p-1.5 rounded-lg transition-colors ${chartTypes[s.id] === 'bar' ? 'text-[var(--teal)] bg-[var(--state-active-bg)]' : 'text-[var(--text-muted)]'}`}>
                    <BarChart2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" aria-label={pinned.has(s.id) ? 'Unpin' : 'Pin to top'}
                    onClick={() => setPinned((p) => { const n = new Set(p); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n; })}
                    className={`p-1.5 rounded-lg transition-colors ${pinned.has(s.id) ? 'text-[var(--teal)]' : 'text-[var(--text-muted)]'}`}>
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" aria-label="Hide chart"
                    onClick={() => setHidden((p) => new Set([...p, s.id]))}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] transition-colors">
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {data.length > 1 ? (
                <ReactECharts option={option} style={{ height: 160 }} onEvents={{ click: handleChartClick }} />
              ) : (
                <div className="h-40 flex items-center justify-center text-xs text-[var(--text-muted)]">Not enough data for this period</div>
              )}

              {seriesAnnotations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {seriesAnnotations.map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 text-[10px] bg-[var(--badge-teal-bg)] text-[var(--teal)] px-1.5 py-0.5 rounded">
                      {EVENT_EMOJI[a.type] ?? '📝'} {a.note || a.type}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hidden.size > 0 && (
        <button type="button" onClick={() => setHidden(new Set())} className="text-xs text-[var(--blue)] hover:underline">
          Show {hidden.size} hidden chart{hidden.size > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
