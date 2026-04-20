import { useState } from 'react';
import { demoRegistryHistory, demoRegistryId, demoRegistry, demoLifeEvents } from '../../lib/mockData';
import { CheckCircle2, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { ReactECharts } from '../../components/charts/ReactECharts';
import type { EChartsOption } from '../../components/charts/ReactECharts';
import { toast } from 'sonner';

type Direction = 'higher' | 'lower';
const VARIABLES: { id: string; label: string; unit: string; direction: Direction }[] = [
  { id: 'fvc', label: 'FVC% Predicted', unit: '%', direction: 'higher' },
  { id: 'sixmwt', label: '6-Minute Walk Test', unit: 'm', direction: 'higher' },
  { id: 'gripRight', label: 'Grip Strength (right)', unit: 'kg', direction: 'higher' },
  { id: 'gripLeft', label: 'Grip Strength (left)', unit: 'kg', direction: 'higher' },
];

function getValue(visit: typeof demoRegistryHistory.visits[0], id: string) {
  switch (id) {
    case 'fvc': return visit.fvcPercent;
    case 'sixmwt': return visit.sixMWT;
    case 'gripRight': return visit.gripRight;
    case 'gripLeft': return visit.gripLeft;
    default: return 0;
  }
}

const VISIT_LABELS = ['Baseline', '3-month', '6-month', '9-month', '12-month', '18-month'];

const EVENT_EMOJI: Record<string, string> = {
  illness: '🤒', exercise: '🏃', medication: '💊', social: '🎉', travel: '✈️', stress: '😰', other: '📝',
};

interface TagEntry { visitIndex: number; note: string }

function RegistryChart({
  varId, visits, tags, onTag,
}: {
  varId: string;
  visits: typeof demoRegistryHistory.visits;
  tags: TagEntry[];
  onTag: (idx: number, note: string) => void;
}) {
  const v = VARIABLES.find((x) => x.id === varId)!;
  const xLabels = visits.map((_, i) => VISIT_LABELS[i] ?? `Visit ${i + 1}`);
  const values = visits.map((vis) => getValue(vis, varId));
  const [tagForm, setTagForm] = useState<{ idx: number; note: string } | null>(null);

  const latest = values[values.length - 1];
  const first = values[0];
  const delta = latest - first;
  const improving = (v.direction === 'higher' && delta >= 0) || (v.direction === 'lower' && delta <= 0);

  const markLineData = demoLifeEvents.map((ev) => ({
    xAxis: VISIT_LABELS[0],
    label: { formatter: EVENT_EMOJI[ev.type] ?? '📝', fontSize: 10 },
    lineStyle: { color: '#cbd5e1', type: 'dashed' as const, width: 1 },
  }));

  const markPointData = tags.map((t) => ({
    name: t.note,
    coord: [xLabels[t.visitIndex], values[t.visitIndex]],
    symbol: 'pin',
    symbolSize: 22,
    itemStyle: { color: '#7c3aed' },
    label: { show: false },
  }));

  const option: EChartsOption = {
    tooltip: { trigger: 'axis', formatter: (p: unknown) => {
      const params = p as { name: string; value: number }[];
      return `${params[0].name}<br/><b>${params[0].value} ${v.unit}</b>`;
    }},
    grid: { top: 24, bottom: 36, left: 48, right: 16 },
    xAxis: { type: 'category', data: xLabels, axisLabel: { fontSize: 10, color: '#94a3b8' } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10, color: '#94a3b8', formatter: `{value} ${v.unit}` } },
    series: [{
      type: 'line',
      data: values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#14b8a6', width: 2 },
      itemStyle: { color: '#14b8a6' },
      areaStyle: { color: 'rgba(20,184,166,0.08)' },
      markLine: { symbol: 'none', data: markLineData },
      markPoint: markPointData.length > 0 ? { data: markPointData } : undefined,
    }],
  };

  return (
    <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{v.label}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{v.direction === 'higher' ? 'Higher = better' : 'Lower = better'}</p>
        </div>
        <button type="button" onClick={() => setTagForm({ idx: visits.length - 1, note: '' })}
          className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--teal)] border border-[var(--border-token)] px-2 py-1 rounded-lg transition-colors">
          <Tag className="w-3 h-3" /> Tag
        </button>
      </div>

      {tagForm !== null && (
        <div className="mb-3 p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-token)] space-y-2">
          <div className="flex gap-2 items-center">
            <label htmlFor={`tag-visit-${varId}`} className="text-xs text-[var(--text-muted)] shrink-0">Visit</label>
            <select id={`tag-visit-${varId}`} value={tagForm.idx}
              onChange={(e) => setTagForm({ ...tagForm, idx: Number(e.target.value) })}
              className="text-xs px-2 py-1 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)]">
              {visits.map((_, i) => <option key={i} value={i}>{xLabels[i]}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Add a note..." value={tagForm.note}
              onChange={(e) => setTagForm({ ...tagForm, note: e.target.value })}
              className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40" />
            <button type="button" onClick={() => { onTag(tagForm.idx, tagForm.note); setTagForm(null); toast.success('Tag saved'); }}
              className="text-xs bg-[var(--teal)] text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 shrink-0">Save</button>
            <button type="button" onClick={() => setTagForm(null)}
              className="text-xs border border-[var(--border-token)] text-[var(--text-muted)] px-2 py-1.5 rounded-lg hover:bg-[var(--bg-surface)]">Cancel</button>
          </div>
        </div>
      )}

      <ReactECharts option={option} style={{ height: 180 }} />

      <p className={`text-xs mt-2 flex items-center gap-1 ${improving ? 'text-[var(--teal)]' : 'text-amber-500'}`}>
        {improving ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {v.label}: {first}{v.unit} → {latest}{v.unit} over {visits.length - 1} visits
      </p>
    </div>
  );
}

export function RegistryHistoryPage() {
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);
  const history = demoRegistryHistory;
  const [selectedVars, setSelectedVars] = useState<[string, string]>(['fvc', 'sixmwt']);
  const [tags, setTags] = useState<Record<string, TagEntry[]>>({});

  const addTag = (varId: string, idx: number, note: string) => {
    if (!note.trim()) return;
    setTags((prev) => ({ ...prev, [varId]: [...(prev[varId] ?? []), { visitIndex: idx, note }] }));
  };

  const toggleVar = (slot: 0 | 1, id: string) => {
    setSelectedVars((prev) => {
      const next = [...prev] as [string, string];
      next[slot] = id;
      return next;
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Registry History</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {demoRegistry} · ID: <span className="font-pseudo-id">{demoRegistryId}</span>
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Visits submitted" value={history.totalVisits.toString()} />
        <SummaryCard label="Enrolled" value={new Date(history.enrolledDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} />
        <SummaryCard label="Latest visit" value={new Date(history.visits[history.visits.length - 1].date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} />
        <SummaryCard label="FVC% (latest)" value={`${history.visits[history.visits.length - 1].fvcPercent}%`} highlight />
      </div>

      {/* Variable selectors + chart grid */}
      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-widest text-xs">Charts</p>
          {([0, 1] as const).map((slot) => (
            <div key={slot} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${slot === 0 ? 'bg-[var(--teal)]' : 'bg-[var(--purple)]'}`} />
              <label htmlFor={`var-${slot}`} className="sr-only">Chart {slot + 1} variable</label>
              <select id={`var-${slot}`} value={selectedVars[slot]} onChange={(e) => toggleVar(slot, e.target.value)}
                className="text-xs px-2 py-1.5 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40">
                {VARIABLES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedVars.map((varId, slot) => (
            <RegistryChart
              key={`${slot}-${varId}`}
              varId={varId}
              visits={history.visits}
              tags={tags[varId] ?? []}
              onTag={(idx, note) => addTag(varId, idx, note)}
            />
          ))}
        </div>
      </div>

      {/* Submission timeline */}
      <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Submission timeline</h2>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {history.visits.map((visit, i) => (
            <div key={visit.id} className="flex flex-col items-center gap-2 shrink-0">
              <p className="text-[10px] text-[var(--text-muted)]">
                {new Date(visit.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
              </p>
              <div className="w-10 h-10 rounded-full bg-[var(--badge-teal-bg)] border-2 border-[var(--teal)] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[var(--teal)]" />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] text-center max-w-[60px] leading-tight">{VISIT_LABELS[i]}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--teal)] border-2 border-[var(--teal)] inline-block" /> Completed</span>
        </div>
      </div>

      {/* Visit accordion */}
      <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Visit detail</h2>
        <div className="space-y-3">
          {history.visits.map((visit) => (
            <div key={visit.id} className="border border-[var(--border-token)] rounded-lg overflow-hidden">
              <button type="button"
                onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--bg-surface)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[var(--badge-teal-bg)] rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[var(--teal)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{visit.type}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(visit.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-[var(--teal)]">6MWT {visit.sixMWT}m</span>
                  {expandedVisit === visit.id
                    ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                    : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                </div>
              </button>
              {expandedVisit === visit.id && (
                <div className="px-4 pb-4 pt-1 border-t border-[var(--border-token)]">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    <VisitStat label="6MWT" value={`${visit.sixMWT}m`} />
                    <VisitStat label="Grip (right)" value={`${visit.gripRight}kg`} />
                    <VisitStat label="Grip (left)" value={`${visit.gripLeft}kg`} />
                    <VisitStat label="FVC%" value={`${visit.fvcPercent}%`} />
                  </div>
                  {visit.notes && (
                    <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">{visit.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Diagnosis profile */}
      <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Diagnosis profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Condition', value: 'FSHD1' },
            { label: 'Genetic confirmation', value: 'D4Z4 repeat contraction confirmed' },
            { label: 'Ambulatory status', value: 'Ambulatory' },
            { label: 'Onset age', value: 'Adolescent (12–18)' },
            { label: 'Facioscapulohumeral', value: 'Face, shoulder, upper arm' },
            { label: 'Registry', value: 'TREAT-NMD / PaLaDín FSHD' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[var(--bg-surface)] rounded-lg p-3">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-1">{label}</p>
              <p className="text-xs font-medium text-[var(--text-primary)]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4 text-center">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className={`font-mono font-bold text-xl ${highlight ? 'text-[var(--teal)]' : 'text-[var(--text-primary)]'}`}>{value}</p>
    </div>
  );
}

function VisitStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-lg p-2.5 text-center">
      <p className="text-[10px] text-[var(--text-muted)] mb-0.5">{label}</p>
      <p className="text-sm font-mono font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
