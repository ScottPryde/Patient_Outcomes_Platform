import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export type RingState = 'teal' | 'amber' | 'grey';

export interface RingDef {
  id: string;
  label: string;
  value: number;
  state: RingState;
  actionable?: string;
  pendingReason?: string;
}

interface Props {
  rings: RingDef[];
  dataRequests?: { total: number; approved: number; pending: number };
}

const STATE_COLOUR: Record<RingState, { stroke: string; text: string; bg: string }> = {
  teal: { stroke: '#14b8a6', text: 'text-[#14b8a6]', bg: 'bg-teal-50' },
  amber: { stroke: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-50' },
  grey: { stroke: '#94a3b8', text: 'text-slate-400', bg: 'bg-slate-50' },
};

const CIRCUMFERENCE = 2 * Math.PI * 36;

interface ImprovementGuide {
  actions: { label: string; href: string }[];
  tip: string;
  clinicPending?: boolean;
}

const RING_GUIDES: Record<string, ImprovementGuide> = {
  healthObs: {
    actions: [
      { label: 'Log today\'s fatigue reading', href: '/health/log' },
      { label: 'Reconnect Apple Watch in devices', href: '/settings/devices' },
      { label: 'Enable wearable auto-sync', href: '/settings/devices' },
    ],
    tip: 'Health Observation includes wearable data, daily logs, and clinical measures. Logging 5 days per week keeps this score above 80%.',
  },
  outcomes: {
    actions: [
      { label: 'Complete FSHD PRO v2 (due 10 Apr)', href: '/health/prom-history' },
      { label: 'Set a questionnaire reminder', href: '/settings' },
    ],
    tip: 'Completing PROMs on time raises this score by ~15% per submission.',
  },
  registry: {
    actions: [
      { label: 'Submit 6-month visit data to TREAT-NMD', href: '/health/reg-history' },
    ],
    tip: 'Registry submissions are reviewed by the FSHD research team.',
    clinicPending: true,
  },
  trials: {
    actions: [],
    tip: 'Trial matching is updated as new FSHD studies open. You will be notified when eligible.',
    clinicPending: true,
  },
  research: {
    actions: [
      { label: 'Review your research participation settings', href: '/consent' },
      { label: 'See how your data contributes', href: '/knowledge' },
    ],
    tip: 'Research participation includes consent, data sharing, and education engagement.',
  },
  impact: {
    actions: [
      { label: 'Check for missing values in your observations', href: '/health/all-obs' },
    ],
    tip: 'Data Impact measures how usable your data is for clinical, regulatory, and HTA purposes. Consistent longitudinal data maximises impact.',
    clinicPending: true,
  },
};

function Ring({ def, size = 84 }: { def: RingDef; size?: number }) {
  const { stroke } = STATE_COLOUR[def.state];
  const offset = CIRCUMFERENCE * (1 - def.value / 100);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={36} fill="none" stroke="#e2e8f0" strokeWidth={6} />
          <circle
            cx={size / 2} cy={size / 2} r={36} fill="none"
            stroke={stroke} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {def.state === 'grey' ? (
            <Clock className="w-5 h-5 text-slate-400" />
          ) : (
            <span className="font-mono font-bold text-[15px] text-[var(--text-primary)] leading-none">
              {def.value}<span className="text-[9px] text-[var(--text-muted)] font-normal">%</span>
            </span>
          )}
        </div>
      </div>
      <span className="text-[11px] text-[var(--text-muted)] text-center leading-tight max-w-[80px] h-8 flex items-start justify-center">
        {def.label}
      </span>
    </div>
  );
}

export function DataHealthRings({ rings, dataRequests }: Props) {
  const [expanded, setExpanded] = useState(false);

  const amberRings = rings.filter((r) => r.state === 'amber');

  return (
    <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Participation</h2>
        {dataRequests && (
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span><span className="font-medium text-[var(--text-primary)]">{dataRequests.total}</span> data requests</span>
            <span className="text-teal-600"><span className="font-medium">{dataRequests.approved}</span> approved</span>
            {dataRequests.pending > 0 && (
              <span className="text-amber-500"><span className="font-medium">{dataRequests.pending}</span> pending</span>
            )}
          </div>
        )}
      </div>

      {/* Rings row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 justify-items-center">
        {rings.map((r) => <Ring key={r.id} def={r} />)}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        <LegendItem colour="bg-[#14b8a6]" label="Complete" />
        <LegendItem colour="bg-amber-400" label="Action needed" />
        <LegendItem colour="bg-slate-300" label="Waiting on clinic / system" icon={<Clock className="w-2.5 h-2.5" />} />
      </div>

      {/* Expand toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-[var(--border-token)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        {expanded
          ? <><ChevronUp className="w-3.5 h-3.5" /> Hide improvement guides</>
          : <><ChevronDown className="w-3.5 h-3.5" /> How to improve my scores {amberRings.length > 0 && <span className="ml-1 bg-amber-400 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{amberRings.length} action{amberRings.length > 1 ? 's' : ''}</span>}</>}
      </button>

      {/* Per-ring improvement guides */}
      {expanded && (
        <div className="mt-4 space-y-3">
          {rings.map((ring) => {
            const guide = RING_GUIDES[ring.id];
            const isAmber = ring.state === 'amber';
            const isGrey = ring.state === 'grey';
            return (
              <RingGuideCard key={ring.id} ring={ring} guide={guide} defaultOpen={isAmber} isGrey={isGrey} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function RingGuideCard({ ring, guide, defaultOpen, isGrey }: { ring: RingDef; guide?: ImprovementGuide; defaultOpen: boolean; isGrey: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const { bg } = STATE_COLOUR[ring.state];

  return (
    <div className={`rounded-lg border overflow-hidden ${ring.state === 'amber' ? 'border-amber-200' : ring.state === 'teal' ? 'border-teal-200' : 'border-slate-200'}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left ${bg}`}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-[var(--text-primary)]">{ring.value}%</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">{ring.label}</span>
          {ring.state === 'amber' && <span className="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-semibold">Action needed</span>}
          {ring.state === 'grey' && <span className="text-[10px] bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Pending</span>}
          {ring.state === 'teal' && <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-semibold">Complete</span>}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
      </button>

      {open && (
        <div className="px-4 py-3 bg-[var(--bg-white)] space-y-3">
          {isGrey || guide?.clinicPending ? (
            <p className="text-xs text-[var(--text-muted)]">
              Waiting on clinic or system — nothing for you to do right now.
            </p>
          ) : guide ? (
            <>
              <div className="space-y-1.5">
                {guide.actions.map((a) => (
                  <Link key={a.href + a.label} to={a.href}
                    className="flex items-center gap-2 text-xs text-[var(--text-primary)] hover:text-[var(--teal)] group">
                    <ChevronRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--teal)] shrink-0" />
                    {a.label}
                  </Link>
                ))}
              </div>
              <p className="text-[11px] text-[var(--text-muted)] italic border-t border-[var(--border-light)] pt-2">
                💡 {guide.tip}
              </p>
            </>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">No actions required at this time.</p>
          )}
        </div>
      )}
    </div>
  );
}

function LegendItem({ colour, label, icon }: { colour: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <span className={`w-2.5 h-2.5 rounded-full ${colour} flex items-center justify-center`}>{icon}</span>
      {label}
    </div>
  );
}
