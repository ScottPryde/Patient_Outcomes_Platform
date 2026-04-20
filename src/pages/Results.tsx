import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { demoMetricSeries, demoLifeEvents } from '../lib/mockData';
import { ReactECharts } from '../components/charts/ReactECharts';
import type { EChartsOption } from '../components/charts/ReactECharts';
import { TrendingUp, TrendingDown, Minus, Pin, EyeOff, BarChart2, LineChart, GitCompare, Pencil, Check, X, Plus, ChevronUp, ChevronDown, Footprints, Droplets, Clock, Activity, Smile, Zap } from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { toast } from 'sonner';

type Range = '1m' | '3m' | '6m' | '1y';

const RANGE_LABELS: Record<Range, string> = {
  '1m': 'Last month',
  '3m': '3 months',
  '6m': '6 months',
  '1y': 'Last year',
};

type GoalDir = 'higher' | 'lower';

interface PGoal {
  id: string; label: string; shortLabel: string;
  current: number; target: number; unit: string; direction: GoalDir;
  streak: number; icon: React.ElementType; color: string;
}

const ALL_GOAL_TYPES: Omit<PGoal, 'streak'>[] = [
  { id: 'sixmwt', label: '6-Minute Walk Test', shortLabel: '6MWT', current: 312, target: 330, unit: 'm', direction: 'higher', icon: Footprints, color: '#0b9b8c' },
  { id: 'fatigue', label: 'Fatigue T-score', shortLabel: 'Fatigue', current: 42, target: 38, unit: '', direction: 'lower', icon: Zap, color: '#f59e0b' },
  { id: 'mood', label: 'Mood average', shortLabel: 'Mood', current: 6.8, target: 7.5, unit: '/10', direction: 'higher', icon: Smile, color: '#7c3aed' },
  { id: 'steps', label: 'Daily steps', shortLabel: 'Steps', current: 5840, target: 7000, unit: '', direction: 'higher', icon: Activity, color: '#1d6abf' },
  { id: 'water', label: 'Water intake', shortLabel: 'Water', current: 5, target: 8, unit: 'glasses', direction: 'higher', icon: Droplets, color: '#0ea5e9' },
  { id: 'fasting', label: 'Fasting window', shortLabel: 'Fast', current: 14, target: 16, unit: 'hrs', direction: 'higher', icon: Clock, color: '#64748b' },
  { id: 'grip', label: 'Grip strength', shortLabel: 'Grip', current: 18, target: 22, unit: 'kg', direction: 'higher', icon: Activity, color: '#10b981' },
];

const GOAL_STREAKS: Record<string, number> = { sixmwt: 3, fatigue: 7, mood: 12, steps: 5, water: 4, fasting: 2, grip: 1 };
const DEFAULT_GOAL_IDS = ['sixmwt', 'fatigue', 'mood', 'steps', 'water', 'fasting'];

const DEFAULT_SELECTED = new Set(['fatigue', 'sixmwt', 'mood', 'steps']);

const EVENT_EMOJI: Record<string, string> = {
  illness: '🤒', exercise: '🏃', medication: '💊', social: '🎉', travel: '✈️', stress: '😰', other: '📝',
};

function sliceByRange(values: { date: string; value: number }[], range: Range) {
  const months = range === '1m' ? 1 : range === '3m' ? 3 : range === '6m' ? 6 : 12;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return values.filter((v) => new Date(v.date) >= cutoff);
}

export function Results() {
  const { user } = useAuth();
  const { metricAnxietyMode } = useUiStore();
  const [range, setRange] = useState<Range>('6m');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(DEFAULT_SELECTED);
  const [pinned, setPinned] = useState<Set<string>>(new Set(['fatigue']));
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [chartTypes, setChartTypes] = useState<Record<string, 'line' | 'bar'>>({});
  const [showLifeEvents, setShowLifeEvents] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState('fatigue');
  const [compareB, setCompareB] = useState('sixmwt');
  const [goals, setGoals] = useState<PGoal[]>(
    DEFAULT_GOAL_IDS.map((id) => ({ ...ALL_GOAL_TYPES.find((g) => g.id === id)!, streak: GOAL_STREAKS[id] ?? 0 }))
  );
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [draftTarget, setDraftTarget] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState('grip');
  const [addTarget, setAddTarget] = useState('');

  if (!user) return null;

  const visibleSeries = demoMetricSeries.filter((s) => {
    if (!selectedIds.has(s.id)) return false;
    if (hidden.has(s.id)) return false;
    if (metricAnxietyMode) {
      const vals = sliceByRange(s.values, range);
      if (vals.length >= 2 && vals[vals.length - 1].value < vals[0].value && s.direction === 'higher') return false;
      if (vals.length >= 2 && vals[vals.length - 1].value > vals[0].value && s.direction === 'lower') return false;
    }
    return true;
  });

  const sortedSeries = [
    ...visibleSeries.filter((s) => pinned.has(s.id)),
    ...visibleSeries.filter((s) => !pinned.has(s.id)),
  ];

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const saveGoal = (id: string) => {
    const num = parseFloat(draftTarget);
    if (isNaN(num) || num <= 0) return;
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, target: num } : g));
    setEditingGoalId(null);
    toast.success('Goal target updated');
  };

  const moveGoalUp = (idx: number) => {
    if (idx === 0) return;
    setGoals((prev) => { const next = [...prev]; [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; return next; });
  };
  const moveGoalDown = (idx: number) => {
    if (idx === goals.length - 1) return;
    setGoals((prev) => { const next = [...prev]; [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]; return next; });
  };
  const removeGoal = (id: string) => setGoals((prev) => prev.filter((g) => g.id !== id));
  const addGoal = () => {
    const type = ALL_GOAL_TYPES.find((t) => t.id === addType);
    if (!type) return;
    if (goals.find((g) => g.id === type.id)) { toast.error('Goal already added'); return; }
    const target = parseFloat(addTarget) || type.target;
    setGoals((prev) => [...prev, { ...type, target, streak: GOAL_STREAKS[type.id] ?? 0 }]);
    setAddOpen(false);
    setAddTarget('');
    toast.success(`${type.label} added`);
  };
  const availableGoalTypes = ALL_GOAL_TYPES.filter((t) => !goals.find((g) => g.id === t.id));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Health Goals</h1>
          <p className="text-sm text-[var(--text-secondary)]">Set targets, track progress, and see trends over time</p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
            <button key={r} type="button" onClick={() => setRange(r)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${range === r ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300'}`}>
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Goal progress bars with editable targets */}
      <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Progress to goals</h2>
        <div className="space-y-5">
          {goals.map((g) => {
            const pct = g.direction === 'higher'
              ? Math.min(100, Math.round((g.current / g.target) * 100))
              : Math.min(100, Math.round(((g.target * 2 - g.current) / g.target) * 100));
            const onTarget = pct >= 100;
            const isEditing = editingGoalId === g.id;
            return (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                  <span className="text-xs font-medium text-[var(--text-primary)]">{g.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[var(--text-muted)]">{g.current}{g.unit} /</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={draftTarget}
                          onChange={(e) => setDraftTarget(e.target.value)}
                          aria-label={`Target for ${g.label}`}
                          placeholder="Target"
                          className="w-20 text-xs px-2 py-1 rounded-lg border border-[var(--teal)] bg-[var(--bg-white)] focus:outline-none font-mono"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') saveGoal(g.id); if (e.key === 'Escape') setEditingGoalId(null); }}
                        />
                        <span className="text-xs text-[var(--text-muted)]">{g.unit}</span>
                        <button type="button" onClick={() => saveGoal(g.id)} aria-label="Save goal"
                          className="p-1 rounded text-[var(--teal)] hover:bg-[var(--badge-teal-bg)]"><Check className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => setEditingGoalId(null)} aria-label="Cancel"
                          className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-[var(--text-muted)]">{g.target}{g.unit}</span>
                        <button type="button" onClick={() => { setEditingGoalId(g.id); setDraftTarget(String(g.target)); }}
                          aria-label={`Edit target for ${g.label}`}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--teal)] hover:bg-[var(--badge-teal-bg)] transition-colors">
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${onTarget ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                      {onTarget ? 'On target' : `${pct}%`}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">
                      {g.direction === 'lower' ? 'Lower = better' : 'Higher = better'}
                    </span>
                  </div>
                </div>
                <GoalBar pct={pct} onTarget={onTarget} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal priority & management */}
      <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Goal priority</h2>
          {availableGoalTypes.length > 0 && (
            <button type="button" onClick={() => setAddOpen((v) => !v)}
              className="flex items-center gap-1 text-xs bg-[var(--teal)] text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-3 h-3" /> Add goal
            </button>
          )}
        </div>

        <div className="space-y-1.5 mb-3">
          {goals.map((g, idx) => {
            const pct = g.direction === 'higher'
              ? Math.min((g.current / g.target) * 100, 100)
              : Math.min((g.target / g.current) * 100, 100);
            const Icon = g.icon;
            const onTarget = pct >= 100;
            const isEditing = editingGoalId === g.id;
            return (
              <div key={g.id} className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-token)]">
                <div className="flex flex-col shrink-0">
                  <button type="button" aria-label="Move up" onClick={() => moveGoalUp(idx)} disabled={idx === 0}
                    className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors">
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button type="button" aria-label="Move down" onClick={() => moveGoalDown(idx)} disabled={idx === goals.length - 1}
                    className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] w-4 shrink-0">{idx + 1}</span>
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: g.color }} />
                <span className="text-xs font-medium text-[var(--text-primary)] w-32 shrink-0 truncate">{g.label}</span>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[var(--border-token)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: onTarget ? '#16a34a' : g.color }} />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] w-8 text-right shrink-0">{Math.round(pct)}%</span>
                </div>
                <span className="text-xs font-mono text-[var(--text-secondary)] shrink-0 hidden sm:inline">
                  {g.current}{g.unit} →{' '}
                  {isEditing ? (
                    <span className="inline-flex items-center gap-1">
                      <input type="number" value={draftTarget} onChange={(e) => setDraftTarget(e.target.value)}
                        aria-label={`Target for ${g.label}`}
                        className="w-16 text-xs px-1.5 py-0.5 rounded border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none"
                        onKeyDown={(e) => { if (e.key === 'Enter') saveGoal(g.id); if (e.key === 'Escape') setEditingGoalId(null); }} />
                      <button type="button" aria-label="Save" onClick={() => saveGoal(g.id)} className="p-0.5 text-[var(--teal)]"><Check className="w-3 h-3" /></button>
                      <button type="button" aria-label="Cancel" onClick={() => setEditingGoalId(null)} className="p-0.5 text-[var(--text-muted)]"><X className="w-3 h-3" /></button>
                    </span>
                  ) : `${g.target}${g.unit}`}
                </span>
                {g.streak > 0 && <span className="text-[10px] text-orange-500 shrink-0 hidden md:inline">🔥{g.streak}d</span>}
                {!isEditing && (
                  <button type="button" aria-label={`Edit target for ${g.label}`}
                    onClick={() => { setEditingGoalId(g.id); setDraftTarget(String(g.target)); }}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors shrink-0">
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
                <button type="button" aria-label={`Remove ${g.label}`} onClick={() => removeGoal(g.id)}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {addOpen && availableGoalTypes.length > 0 && (
          <div className="flex flex-wrap items-end gap-2 p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-token)]">
            <div>
              <label htmlFor="results-add-type" className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide block mb-1">Goal type</label>
              <select id="results-add-type" value={addType} onChange={(e) => { setAddType(e.target.value); setAddTarget(''); }}
                className="text-xs px-2 py-1.5 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none">
                {availableGoalTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="results-add-target" className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide block mb-1">
                Target ({ALL_GOAL_TYPES.find((t) => t.id === addType)?.unit || '–'})
              </label>
              <input id="results-add-target" type="number" value={addTarget} onChange={(e) => setAddTarget(e.target.value)}
                placeholder={String(ALL_GOAL_TYPES.find((t) => t.id === addType)?.target ?? '')}
                className="w-24 text-xs px-2 py-1.5 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40" />
            </div>
            <button type="button" onClick={addGoal}
              className="text-xs bg-[var(--teal)] text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90">Add</button>
            <button type="button" onClick={() => setAddOpen(false)}
              className="text-xs text-[var(--text-muted)] px-2 py-1.5">Cancel</button>
          </div>
        )}
      </div>

      {/* Compare dual-axis chart */}
      {compareMode && (
        <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Metric comparison</p>
            <MetricSelect id="compare-a" label="Metric A" value={compareA} onChange={setCompareA} color="var(--teal)" />
            <MetricSelect id="compare-b" label="Metric B" value={compareB} onChange={setCompareB} color="var(--purple)" />
          </div>
          <DualAxisChart metricAId={compareA} metricBId={compareB} range={range} showEvents={showLifeEvents} />
        </div>
      )}

      {/* Metric selector + controls */}
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Metrics shown</p>
          <div className="flex gap-1.5 flex-wrap">
            {demoMetricSeries.map((s) => (
              <button key={s.id} type="button" onClick={() => toggleId(s.id)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selectedIds.has(s.id) ? 'text-white border-transparent' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300'}`}
                style={selectedIds.has(s.id) ? { backgroundColor: s.color } : {}}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-5">
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input type="checkbox" checked={showLifeEvents} onChange={(e) => setShowLifeEvents(e.target.checked)} className="accent-[var(--teal)]" />
            Life events
          </label>
          <button type="button" onClick={() => setCompareMode((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${compareMode ? 'bg-[var(--purple)] text-white border-[var(--purple)]' : 'border-[var(--border-token)] text-[var(--text-muted)]'}`}>
            <GitCompare className="w-3.5 h-3.5" /> Compare
          </button>
        </div>
      </div>

      {metricAnxietyMode && (
        <p className="text-xs text-[var(--state-pending-text)] bg-[var(--state-pending-bg)] px-3 py-2 rounded-lg">
          Metric anxiety mode on — declining metrics hidden. <a href="/settings" className="underline font-medium">Change →</a>
        </p>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedSeries.map((s) => {
          const data = sliceByRange(s.values, range);
          const chartType = chartTypes[s.id] ?? 'line';
          return (
            <MetricChartCard key={s.id} series={s} data={data} chartType={chartType}
              pinned={pinned.has(s.id)} showEvents={showLifeEvents}
              onPin={() => setPinned((prev) => { const next = new Set(prev); next.has(s.id) ? next.delete(s.id) : next.add(s.id); return next; })}
              onHide={() => setHidden((prev) => new Set([...prev, s.id]))}
              onChartType={(t) => setChartTypes((prev) => ({ ...prev, [s.id]: t }))}
            />
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

// ─── Metric Select ────────────────────────────────────────────────────────────

function MetricSelect({ id, label, value, onChange, color }: { id: string; label: string; value: string; onChange: (v: string) => void; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <label htmlFor={id} className="text-xs text-[var(--text-muted)] shrink-0">{label}:</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs px-2 py-1 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] focus:outline-none"
      >
        {demoMetricSeries.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Dual-axis Compare Chart ──────────────────────────────────────────────────

function DualAxisChart({ metricAId, metricBId, range, showEvents }: { metricAId: string; metricBId: string; range: Range; showEvents: boolean }) {
  const seriesA = demoMetricSeries.find((s) => s.id === metricAId)!;
  const seriesB = demoMetricSeries.find((s) => s.id === metricBId)!;
  const dataA = sliceByRange(seriesA?.values ?? [], range);
  const dataB = sliceByRange(seriesB?.values ?? [], range);

  const allDates = [...new Set([...dataA.map((d) => d.date), ...dataB.map((d) => d.date)])].sort();
  const mapByDate = (data: { date: string; value: number }[]) => {
    const m = new Map(data.map((d) => [d.date, d.value]));
    return allDates.map((d) => m.get(d) ?? null);
  };

  const option = useMemo<EChartsOption>(() => ({
    grid: { left: 48, right: 48, top: 16, bottom: 32 },
    tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderWidth: 0, textStyle: { color: '#fff' } },
    legend: { data: [seriesA?.label, seriesB?.label], bottom: 0, textStyle: { color: '#64748b', fontSize: 11 } },
    xAxis: {
      type: 'category',
      data: allDates.map((d) => new Date(d).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })),
      axisLabel: { color: '#94a3b8', fontSize: 10 },
    },
    yAxis: [
      { type: 'value', name: seriesA?.unit || seriesA?.label, nameTextStyle: { color: '#0b9b8c', fontSize: 10 }, axisLabel: { color: '#0b9b8c', fontSize: 10 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
      { type: 'value', name: seriesB?.unit || seriesB?.label, nameTextStyle: { color: '#7c3aed', fontSize: 10 }, axisLabel: { color: '#7c3aed', fontSize: 10 }, splitLine: { show: false } },
    ],
    series: [
      {
        name: seriesA?.label, type: 'line', yAxisIndex: 0, smooth: true,
        data: mapByDate(dataA),
        lineStyle: { color: '#0b9b8c', width: 2 },
        itemStyle: { color: '#0b9b8c' },
        ...(showEvents && demoLifeEvents.length > 0 ? {
          markLine: {
            symbol: 'none',
            data: demoLifeEvents.map((ev) => ({
              xAxis: new Date(ev.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
              label: { formatter: `${EVENT_EMOJI[ev.type] ?? '📝'} ${ev.type}`, color: '#64748b', fontSize: 9 },
              lineStyle: { color: '#94a3b8', type: 'dashed', width: 1 },
            })),
          },
        } : {}),
      },
      {
        name: seriesB?.label, type: 'line', yAxisIndex: 1, smooth: true,
        data: mapByDate(dataB),
        lineStyle: { color: '#7c3aed', width: 2 },
        itemStyle: { color: '#7c3aed' },
      },
    ],
  }), [seriesA, seriesB, dataA, dataB, allDates, showEvents]);

  if (!seriesA || !seriesB) return <p className="text-xs text-[var(--text-muted)]">Select two metrics to compare.</p>;
  return <ReactECharts option={option} style={{ height: 220 }} />;
}

// ─── Goal Bar ─────────────────────────────────────────────────────────────────

function GoalBar({ pct, onTarget }: { pct: number; onTarget: boolean }) {
  const clampedPct = Math.min(pct, 100);
  const width = `${clampedPct}%`;
  return (
    <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden relative">
      <div className="h-full rounded-full transition-all" style={{ width, backgroundColor: onTarget ? 'var(--teal)' : '#f59e0b' }} />
      <div className="absolute right-0 top-0 h-full w-0.5 bg-slate-400/40" />
    </div>
  );
}

// ─── Metric Chart Card ────────────────────────────────────────────────────────

function MetricChartCard({
  series, data, chartType, pinned, showEvents, onPin, onHide, onChartType,
}: {
  series: typeof demoMetricSeries[0];
  data: { date: string; value: number }[];
  chartType: 'line' | 'bar';
  pinned: boolean;
  showEvents: boolean;
  onPin: () => void;
  onHide: () => void;
  onChartType: (t: 'line' | 'bar') => void;
}) {
  const severity = useMemo(() => {
    if (data.length < 2) return 'stable';
    const delta = data[data.length - 1].value - data[0].value;
    if (Math.abs(delta) < 0.5) return 'stable';
    const improving = (series.direction === 'higher' && delta > 0) || (series.direction === 'lower' && delta < 0);
    return improving ? 'improving' : 'worsening';
  }, [data, series]);

  const TrendIcon = severity === 'improving' ? TrendingUp : severity === 'worsening' ? TrendingDown : Minus;
  const trendColour = severity === 'improving' ? 'text-teal-600' : severity === 'worsening' ? 'text-red-500' : 'text-[var(--text-muted)]';

  const option = useMemo<EChartsOption>(() => {
    const xData = data.map((d) => new Date(d.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }));
    const yData = data.map((d) => d.value);
    const markLines = showEvents && demoLifeEvents.length > 0 ? {
      markLine: {
        symbol: 'none',
        data: demoLifeEvents.map((ev) => ({
          xAxis: new Date(ev.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
          label: { formatter: `${EVENT_EMOJI[ev.type] ?? '📝'}`, fontSize: 10 },
          lineStyle: { color: '#94a3b8', type: 'dashed' as const, width: 1 },
        })),
      },
    } : {};

    return {
      grid: { left: 36, right: 8, top: 8, bottom: 24 },
      tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderWidth: 0, textStyle: { color: '#fff' } },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
      },
      yAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
      series: [{
        type: chartType,
        smooth: chartType === 'line',
        data: yData,
        lineStyle: chartType === 'line' ? { color: series.color, width: 2 } : undefined,
        itemStyle: { color: series.color },
        areaStyle: chartType === 'line' ? { color: `${series.color}14` } : undefined,
        ...markLines,
      }],
    };
  }, [data, chartType, showEvents, series]);

  return (
    <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{series.label}</p>
            <span className={`flex items-center gap-1 text-xs ${trendColour}`}>
              <TrendIcon className="w-3.5 h-3.5" /> {severity}
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">
            {series.direction === 'lower' ? 'Lower score = better' : series.direction === 'higher' ? 'Higher score = better' : 'Stable target'}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" aria-label="Line chart" onClick={() => onChartType('line')}
            className={`p-1.5 rounded-lg transition-colors ${chartType === 'line' ? 'text-[var(--teal)] bg-[var(--state-active-bg)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
            <LineChart className="w-3.5 h-3.5" />
          </button>
          <button type="button" aria-label="Bar chart" onClick={() => onChartType('bar')}
            className={`p-1.5 rounded-lg transition-colors ${chartType === 'bar' ? 'text-[var(--teal)] bg-[var(--state-active-bg)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
          <button type="button" aria-label={pinned ? 'Unpin chart' : 'Pin to top'} onClick={onPin}
            className={`p-1.5 rounded-lg transition-colors ${pinned ? 'text-[var(--teal)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button type="button" aria-label="Hide chart" onClick={onHide}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {data.length > 1 ? (
        <ReactECharts option={option} style={{ height: 160 }} />
      ) : (
        <div className="h-40 flex items-center justify-center text-xs text-[var(--text-muted)]">
          Not enough data for this range
        </div>
      )}
    </div>
  );
}
