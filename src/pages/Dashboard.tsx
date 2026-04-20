import { useAuth } from '../contexts/AuthContext';
import { useConsent } from '../contexts/ConsentContext';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, CheckCircle2, ChevronRight, MapPin, ClipboardList,
  FlaskConical, Bell, X,
  Droplets, Clock, Footprints, Zap, Activity, Smile,
} from 'lucide-react';
import {
  mockUpcomingQuestionnaires, mockClinicalTrials,
  demoRings, demoPseudoId, demoNextAppointment,
  demoMetricSeries,
} from '../lib/mockData';
import { ReactECharts } from '../components/charts/ReactECharts';
import type { EChartsOption } from '../components/charts/ReactECharts';
import { DataHealthRings, RingDef } from '../components/rings/DataHealthRings';
import { useUiStore } from '../store/uiStore';
import { toast } from 'sonner';

const SETUP_STEPS = [
  { id: 'account', label: 'Set up account', done: true },
  { id: 'consent', label: 'Give consent', done: true },
  { id: 'profile', label: 'Complete profile', done: false },
  { id: 'settings', label: 'Customise settings', done: false },
];

type GoalDir = 'higher' | 'lower';

interface PGoal {
  id: string;
  label: string;
  shortLabel: string;
  current: number;
  target: number;
  unit: string;
  direction: GoalDir;
  streak: number;
  icon: React.ElementType;
  color: string;
}

const ALL_GOAL_TYPES: Omit<PGoal, 'streak'>[] = [
  { id: 'sixmwt', label: '6-Min Walk Test', shortLabel: '6MWT', current: 312, target: 330, unit: 'm', direction: 'higher', icon: Footprints, color: '#0b9b8c' },
  { id: 'fatigue', label: 'Fatigue T-score', shortLabel: 'Fatigue', current: 42, target: 38, unit: '', direction: 'lower', icon: Zap, color: '#f59e0b' },
  { id: 'mood', label: 'Mood (avg/10)', shortLabel: 'Mood', current: 6.8, target: 7.5, unit: '/10', direction: 'higher', icon: Smile, color: '#7c3aed' },
  { id: 'steps', label: 'Daily Steps', shortLabel: 'Steps', current: 5840, target: 7000, unit: '', direction: 'higher', icon: Activity, color: '#1d6abf' },
  { id: 'water', label: 'Water Intake', shortLabel: 'Water', current: 5, target: 8, unit: 'glasses', direction: 'higher', icon: Droplets, color: '#0ea5e9' },
  { id: 'fasting', label: 'Fasting Window', shortLabel: 'Fast', current: 14, target: 16, unit: 'hrs', direction: 'higher', icon: Clock, color: '#64748b' },
  { id: 'grip', label: 'Grip Strength', shortLabel: 'Grip', current: 18, target: 22, unit: 'kg', direction: 'higher', icon: Activity, color: '#10b981' },
];

const MOCK_STREAKS: Record<string, number> = {
  sixmwt: 3, fatigue: 7, mood: 12, steps: 5, water: 4, fasting: 2, grip: 1,
};

const DEFAULT_GOAL_IDS = ['sixmwt', 'fatigue', 'mood', 'steps'];

function goalPct(g: PGoal) {
  return g.direction === 'higher'
    ? Math.min((g.current / g.target) * 100, 100)
    : Math.min((g.target / g.current) * 100, 100);
}

export function Dashboard() {
  const { user } = useAuth();
  useConsent();
  const { patientMode, features } = useUiStore();
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const [setupDismissed, setSetupDismissed] = useState(() =>
    !!localStorage.getItem('setup-strip-dismissed')
  );

  const showFatigueReminder = !reminderDismissed;

  if (!user) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const stepsComplete = SETUP_STEPS.filter((s) => s.done).length;
  const allStepsDone = stepsComplete === SETUP_STEPS.length;
  const isMinimalist = patientMode === 'minimalist';
  const isTracker = !patientMode || patientMode === 'tracker' || patientMode === 'contributor';

  const rings: RingDef[] = [
    { id: 'healthObs', label: 'Health Observation', value: demoRings.healthObservation.value, state: demoRings.healthObservation.state, actionable: 'Log today\'s observations or check wearable sync' },
    { id: 'outcomes', label: 'Outcome Reporting', value: demoRings.outcomeReporting.value, state: demoRings.outcomeReporting.state, actionable: 'Complete FSHD PRO v2 (due 10 Apr)' },
    { id: 'registry', label: 'Clinical Registry', value: demoRings.clinicalRegistry.value, state: demoRings.clinicalRegistry.state, actionable: 'Submit 6-month registry visit data' },
    { id: 'trials', label: 'Clinical Trials', value: demoRings.clinicalTrials.value, state: demoRings.clinicalTrials.state, pendingReason: 'Awaiting trial matching update' },
    { id: 'research', label: 'Research', value: demoRings.research.value, state: demoRings.research.state },
    { id: 'impact', label: 'Data Impact', value: demoRings.dataImpact.value, state: demoRings.dataImpact.state },
  ];

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">{today}</p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{greeting}, {user.firstName}.</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-pseudo-id">{demoPseudoId}</span>
          <StatusBadge colour="teal" label="Consented" />
          <StatusBadge colour="blue" label="2 active studies" />
          <StatusBadge colour="slate" label="Data synced today" />
        </div>
      </div>

      {/* Getting started strip */}
      {!setupDismissed && !allStepsDone && (
        <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Getting started</h2>
            <button type="button" aria-label="Dismiss" onClick={() => { setSetupDismissed(true); localStorage.setItem('setup-strip-dismissed', 'true'); }} className="text-[var(--text-muted)]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3 flex-wrap mb-3">
            {SETUP_STEPS.map((step) => (
              <div key={step.id} className={`flex items-center gap-1.5 text-xs ${step.done ? 'text-teal-600' : 'text-[var(--text-muted)]'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${step.done ? 'text-teal-500' : 'text-[var(--border-token)]'}`} />
                {step.label}
              </div>
            ))}
          </div>
          <progress value={stepsComplete} max={SETUP_STEPS.length} className="setup-progress w-full h-1.5" aria-label="Setup progress" />
          <p className="text-xs text-[var(--text-muted)] mt-1.5">{stepsComplete}/{SETUP_STEPS.length} complete</p>
        </div>
      )}

      {/* Contextual reminder */}
      {showFatigueReminder && (
        <div className="bg-[var(--badge-teal-bg)] border border-[var(--teal)]/30 rounded-[var(--radius-card)] p-4 flex items-start gap-3">
          <Bell className="w-4 h-4 text-[var(--teal)] mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--text-primary)] font-medium mb-0.5">You've tracked Fatigue a couple of times this week</p>
            <p className="text-xs text-[var(--text-secondary)]">Want to set a regular reminder so you don't miss a day?</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setReminderDismissed(true)} className="text-xs text-[var(--text-muted)] px-2 py-1">No thanks</button>
            <Link to="/settings" className="text-xs bg-[var(--teal)] text-white px-3 py-1 rounded-lg font-medium hover:opacity-90">Yes, set reminder</Link>
          </div>
        </div>
      )}

      {/* Priority Observations & Goals */}
      {isTracker && <PriorityGoalsSection />}

      {/* Participation rings */}
      {!isMinimalist && (
        <DataHealthRings rings={rings} dataRequests={{ total: 7, approved: 5, pending: 2 }} />
      )}

      {/* Compare widget */}
      {isTracker && features.compareObservations && <CompareWidget />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Questionnaire card */}
        <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Questionnaires</h2>
            <Link to="/health/prom-history" className="text-xs text-[var(--blue)] hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3 mb-4">
            {mockUpcomingQuestionnaires.map((q) => (
              <Link key={q.id} to={`/health/prom-history/${q.questionnaireId}`}
                className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-token)] hover:border-[var(--teal)] hover:bg-[var(--badge-teal-bg)] transition-colors group">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--teal)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{q.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">Due {formatDate(q.dueDate)} · {q.estimatedTime} min</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-[var(--badge-neutral-bg)] text-[var(--text-muted)]'}`}>
                  {q.priority === 'high' ? 'Due soon' : 'Upcoming'}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-2">Recently completed</p>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-surface)]">
            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)]">FSHD PRO v2</p>
              <p className="text-xs text-[var(--text-muted)]">Submitted 12 Mar 2026</p>
            </div>
          </div>
        </div>

        {/* Appointment + trials */}
        <div className="space-y-4">
          <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Next appointment</h2>
            <div className="flex items-start gap-4">
              <div className="bg-[var(--badge-navy-bg)] rounded-lg p-3 text-center min-w-[60px]">
                <p className="text-xs font-medium text-[var(--blue)] uppercase">Apr</p>
                <p className="text-2xl font-bold text-[var(--navy)] leading-none">08</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{demoNextAppointment.clinician}</p>
                <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{demoNextAppointment.clinic}</p>
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" />{demoNextAppointment.time} · {demoNextAppointment.type}</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Matched FSHD trials</h2>
              <Link to="/trials" className="text-xs text-[var(--blue)] hover:underline flex items-center gap-0.5">View all <ChevronRight className="w-3 h-3" /></Link>
            </div>
            <div className="space-y-3">
              {mockClinicalTrials.slice(0, 2).map((trial) => (
                <Link key={trial.id} to="/trials"
                  className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border-token)] hover:border-[var(--blue)] transition-colors group">
                  <FlaskConical className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--blue)] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">{trial.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <TrialStatusBadge status={trial.status} />
                      <span className="text-xs text-[var(--text-muted)]">{trial.locations[0]?.city}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Priority Observations & Goals ────────────────────────────────────────────

function PriorityGoalsSection() {
  const goals: PGoal[] = DEFAULT_GOAL_IDS.map((id) => ({
    ...ALL_GOAL_TYPES.find((g) => g.id === id)!,
    streak: MOCK_STREAKS[id] ?? 0,
  }));

  const maxStreak = Math.max(...goals.map((g) => g.streak));

  return (
    <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Priority Observations & Goals</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Best streak: <span className="font-semibold text-orange-500">🔥 {maxStreak} days</span></p>
        </div>
        <Link to="/health/analytics" className="text-xs text-[var(--blue)] hover:underline">Health Goals →</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {goals.map((g) => {
          const pct = goalPct(g);
          const Icon = g.icon;
          const onTarget = pct >= 100;
          return (
            <div key={g.id} className="bg-[var(--bg-surface)] rounded-[var(--radius-card)] p-3 flex flex-col gap-1.5 border border-[var(--border-token)]">
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4" style={{ color: g.color }} />
                {g.streak > 0 && (
                  <span className="text-[9px] font-semibold text-orange-500">🔥{g.streak}d</span>
                )}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-medium leading-tight">{g.shortLabel}</p>
              <p className="font-mono font-bold text-base text-[var(--text-primary)] leading-none">
                {g.current}<span className="text-[10px] font-normal text-[var(--text-muted)] ml-0.5">{g.unit}</span>
              </p>
              <div className="w-full h-1.5 bg-[var(--border-token)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: onTarget ? '#16a34a' : g.color }} />
              </div>
              <p className="text-[9px] text-[var(--text-muted)]">{Math.round(pct)}% of {g.target}{g.unit}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ colour, label }: { colour: string; label: string }) {
  const cls: Record<string, string> = {
    teal: 'bg-[var(--badge-teal-bg)] text-teal-700 border-[var(--teal)]/20',
    blue: 'bg-[var(--badge-navy-bg)] text-[var(--blue)] border-[var(--blue)]/20',
    slate: 'bg-[var(--badge-neutral-bg)] text-[var(--text-muted)] border-[var(--border-token)]',
  };
  return <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${cls[colour] ?? cls.slate}`}>{label}</span>;
}

function TrialStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    recruiting: 'bg-teal-100 text-teal-700', suspended: 'bg-amber-100 text-amber-700',
    terminated: 'bg-red-100 text-red-700', active: 'bg-blue-100 text-blue-700',
  };
  return <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Compare widget ────────────────────────────────────────────────────────────

function CompareWidget() {
  const [metricA, setMetricA] = useState('fatigue');
  const [metricB, setMetricB] = useState('sixmwt');
  const seriesA = demoMetricSeries.find((s) => s.id === metricA);
  const seriesB = demoMetricSeries.find((s) => s.id === metricB);
  const cutoff = useMemo(() => { const d = new Date(); d.setMonth(d.getMonth() - 6); return d; }, []);
  const dataA = seriesA?.values.filter((v) => new Date(v.date) >= cutoff) ?? [];
  const dataB = seriesB?.values.filter((v) => new Date(v.date) >= cutoff) ?? [];
  const allDates = [...new Set([...dataA.map((d) => d.date), ...dataB.map((d) => d.date)])].sort();

  const option = useMemo<EChartsOption>(() => ({
    grid: { left: 36, right: 36, top: 8, bottom: 20 },
    tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderWidth: 0, textStyle: { color: '#fff', fontSize: 11 } },
    xAxis: { type: 'category', data: allDates.map((d) => new Date(d).toLocaleDateString('en-GB', { month: 'short' })), axisLabel: { color: '#94a3b8', fontSize: 9 } },
    yAxis: [
      { type: 'value', axisLabel: { color: '#0b9b8c', fontSize: 9 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
      { type: 'value', axisLabel: { color: '#7c3aed', fontSize: 9 }, splitLine: { show: false } },
    ],
    series: [
      { name: seriesA?.label, type: 'line', smooth: true, yAxisIndex: 0, data: allDates.map((d) => dataA.find((v) => v.date === d)?.value ?? null), lineStyle: { color: '#0b9b8c', width: 2 }, itemStyle: { color: '#0b9b8c' } },
      { name: seriesB?.label, type: 'line', smooth: true, yAxisIndex: 1, data: allDates.map((d) => dataB.find((v) => v.date === d)?.value ?? null), lineStyle: { color: '#7c3aed', width: 2 }, itemStyle: { color: '#7c3aed' } },
    ],
  }), [allDates, dataA, dataB, seriesA, seriesB]);

  return (
    <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Compare observations</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <MetricPick id="dash-a" color="#0b9b8c" value={metricA} onChange={setMetricA} />
          <MetricPick id="dash-b" color="#7c3aed" value={metricB} onChange={setMetricB} />
          <Link to="/health/analytics" className="text-xs text-[var(--blue)] hover:underline">Full view →</Link>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: 180 }} />
    </div>
  );
}

function MetricPick({ id, color, value, onChange }: { id: string; color: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <label htmlFor={id} className="sr-only">Metric</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="text-xs px-2 py-1 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] focus:outline-none">
        {demoMetricSeries.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </div>
  );
}

