import { useState } from 'react';
import { mockClinicalTrials, demoTrialStates } from '../lib/mockData';
import { ClinicalTrial } from '../types';
import {
  Search, MapPin, Map, List, Bookmark, Bell, HandHeart,
  ChevronDown, ChevronUp, CheckCircle2, ExternalLink, Filter,
} from 'lucide-react';
import { toast } from 'sonner';

type EngagementState = 'saved' | 'following' | 'interested' | null;

const PHASE_LABELS: Record<string, string> = {
  'early-phase-1': 'Early Phase 1',
  'phase-1': 'Phase I',
  'phase-2': 'Phase II',
  'phase-3': 'Phase III',
  'phase-4': 'Phase IV',
};

const PHASE_COLOUR: Record<string, string> = {
  'early-phase-1': 'bg-purple-100 text-purple-800',
  'phase-1': 'bg-blue-100 text-blue-700',
  'phase-2': 'bg-indigo-100 text-indigo-700',
  'phase-3': 'bg-green-100 text-green-700',
  'phase-4': 'bg-teal-100 text-teal-700',
};

const STATUS_COLOUR: Record<string, string> = {
  recruiting: 'bg-teal-100 text-teal-700',
  active: 'bg-blue-100 text-blue-700',
  suspended: 'bg-amber-100 text-amber-700',
  terminated: 'bg-red-100 text-red-700',
  completed: 'bg-slate-100 text-slate-600',
};

// Simulated eligibility match for Anna Thompson
const ELIGIBILITY: Record<string, { matched: number; total: number; criteria: string[] }> = {
  'trial-walking-fshd': {
    matched: 5,
    total: 5,
    criteria: ['Genetically confirmed FSHD ✓', 'Ambulatory ✓', '6MWT ≥100m ✓', 'Willing to wear monitor ✓', 'No pacemaker ✓'],
  },
  'trial-ace083-fshd': {
    matched: 4,
    total: 6,
    criteria: ['Confirmed FSHD1 ✓', 'FVC ≥50% ✓', 'Ambulatory ✓', '6MWT ≥200m ✓', 'CSA ≥3cm² — unknown', 'No prior investigational agents — unknown'],
  },
};

export function TrialsHub() {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');
  const [showTerminated, setShowTerminated] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'recent'>('relevance');
  const [engagement, setEngagement] = useState<Record<string, EngagementState>>({ ...demoTrialStates });
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = mockClinicalTrials.filter((t) => {
    if (!showTerminated && t.status === 'terminated') return false;
    if (search) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.conditions.join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const handleEngage = (trialId: string, state: EngagementState) => {
    setEngagement((prev) => ({ ...prev, [trialId]: prev[trialId] === state ? null : state }));
    if (state === 'interested') {
      toast.success('Interest flagged to the study team. They\'ll be in touch to confirm eligibility.');
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Clinical Trials</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            FSHD-relevant trials matched to your profile · {visible.length} shown
          </p>
        </div>
        <div className="flex gap-2">
          <ViewToggle active={view === 'list'} onClick={() => setView('list')} icon={<List className="w-4 h-4" />} label="List" />
          <ViewToggle active={view === 'map'} onClick={() => setView('map')} icon={<Map className="w-4 h-4" />} label="Map" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="search"
            placeholder="Search trials…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40"
          />
        </div>
        <SortSelect value={sortBy} onChange={setSortBy} />
        <button
          type="button"
          onClick={() => setShowTerminated((v) => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${showTerminated ? 'bg-[var(--badge-warn-bg)] border-amber-300 text-amber-700' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300'}`}
        >
          <Filter className="w-3.5 h-3.5" />
          {showTerminated ? 'Hide terminated' : 'Show terminated'}
        </button>
      </div>

      {/* Map stub */}
      {view === 'map' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-token)] rounded-[var(--radius-card)] h-64 flex items-center justify-center">
          <div className="text-center text-[var(--text-muted)]">
            <Map className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Map view — Terra integration coming soon</p>
            <p className="text-xs mt-1">Trials are located in Oxford (63 km) and London (300 km)</p>
          </div>
        </div>
      )}

      {/* Trial cards */}
      {view === 'list' && (
        <div className="space-y-4">
          {visible.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">No trials match your search.</p>
          )}
          {visible.map((trial) => (
            <TrialCard
              key={trial.id}
              trial={trial}
              engage={engagement[trial.id] ?? null}
              onEngage={(state) => handleEngage(trial.id, state)}
              eligibility={ELIGIBILITY[trial.id]}
              isExpanded={expanded === trial.id}
              onToggleExpand={() => setExpanded(expanded === trial.id ? null : trial.id)}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)] text-center pt-2">
        Trial data sourced from ClinicalTrials.gov · Last updated today · Eligibility pre-screening is indicative only
      </p>
    </div>
  );
}

// ─── Trial card ───────────────────────────────────────────────────────────────

function TrialCard({
  trial, engage, onEngage, eligibility, isExpanded, onToggleExpand,
}: {
  trial: ClinicalTrial;
  engage: EngagementState;
  onEngage: (s: EngagementState) => void;
  eligibility?: { matched: number; total: number; criteria: string[] };
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const loc = trial.locations[0];
  const allMatched = eligibility && eligibility.matched === eligibility.total;

  return (
    <div className={`bg-[var(--bg-white)] rounded-[var(--radius-card)] border transition-colors ${engage ? 'border-[var(--teal)]/40' : 'border-[var(--border-token)]'}`}>
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start gap-3 flex-wrap mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <StatusBadge status={trial.status} />
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${PHASE_COLOUR[trial.phase] ?? 'bg-slate-100 text-slate-600'}`}>
                {PHASE_LABELS[trial.phase] ?? trial.phase}
              </span>
              {eligibility && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${allMatched ? 'bg-teal-100 text-teal-700' : 'bg-blue-50 text-blue-700'}`}>
                  {eligibility.matched}/{eligibility.total} criteria match
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{trial.title}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">{trial.sponsor}</p>
          </div>
          {/* Engagement badge */}
          {engage && (
            <EngageBadge state={engage} />
          )}
        </div>

        {/* Location row */}
        {loc && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{loc.facility}, {loc.city}</span>
            {trial.id === 'trial-walking-fshd' && <span className="text-teal-600 font-medium">· 63 km</span>}
            {trial.id === 'trial-ace083-fshd' && <span className="text-[var(--text-muted)]">· 300 km</span>}
          </div>
        )}

        {/* Description (truncated unless expanded) */}
        <p className={`text-xs text-[var(--text-secondary)] leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
          {trial.description}
        </p>

        {/* Expanded detail */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Eligibility */}
            {eligibility && (
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">Eligibility screening</p>
                <ul className="space-y-1">
                  {eligibility.criteria.map((c) => (
                    <li key={c} className={`text-xs flex items-start gap-1.5 ${c.includes('✓') ? 'text-teal-700' : 'text-[var(--text-muted)]'}`}>
                      <CheckCircle2 className={`w-3 h-3 mt-0.5 shrink-0 ${c.includes('✓') ? 'text-teal-500' : 'text-slate-300'}`} />
                      {c.replace(' ✓', '')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Enrolment stats */}
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Target enrolment" value={trial.enrollmentTarget.toString()} />
              <Stat label="Currently enrolled" value={trial.currentEnrollment.toString()} />
              <Stat label="Start date" value={trial.startDate} />
            </div>

            {/* Primary outcome */}
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">Primary outcome</p>
              <p className="text-xs text-[var(--text-secondary)]">{trial.primaryOutcome}</p>
            </div>

            {/* Contact */}
            {loc?.contactEmail && (
              <p className="text-xs text-[var(--text-muted)]">
                Contact: <a href={`mailto:${loc.contactEmail}`} className="text-[var(--blue)] hover:underline">{loc.contactEmail}</a>
              </p>
            )}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-token)] flex-wrap gap-2">
          <button type="button" onClick={onToggleExpand} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1">
            {isExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Less detail</> : <><ChevronDown className="w-3.5 h-3.5" /> More detail</>}
          </button>
          <div className="flex gap-2">
            <EngageButton
              icon={<Bookmark className="w-3.5 h-3.5" />}
              label="Save"
              active={engage === 'saved'}
              onClick={() => onEngage('saved')}
            />
            <EngageButton
              icon={<Bell className="w-3.5 h-3.5" />}
              label="Follow"
              active={engage === 'following'}
              onClick={() => onEngage('following')}
            />
            {trial.status === 'recruiting' && (
              <button
                type="button"
                onClick={() => onEngage('interested')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${engage === 'interested' ? 'bg-[var(--teal)] text-white' : 'bg-[var(--badge-teal-bg)] text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white'}`}
              >
                <HandHeart className="w-3.5 h-3.5" />
                Express interest
              </button>
            )}
          </div>
        </div>

        {engage === 'interested' && trial.status === 'recruiting' && (
          <div className="mt-3 p-3 bg-[var(--badge-teal-bg)] rounded-lg text-xs text-teal-800 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
            Interest flagged. The study team at {loc?.city} will contact you to confirm eligibility. This does <strong>not</strong> enrol you in the trial.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${STATUS_COLOUR[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

function EngageBadge({ state }: { state: EngagementState }) {
  if (!state) return null;
  const map: Record<string, string> = {
    saved: '★ Saved',
    following: '🔔 Following',
    interested: '✋ Interested',
  };
  return (
    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[var(--badge-teal-bg)] text-[var(--teal)] shrink-0">
      {map[state]}
    </span>
  );
}

function EngageButton({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${active ? 'bg-[var(--badge-navy-bg)] border-[var(--blue)] text-[var(--blue)]' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300'}`}
    >
      {icon}{label}
    </button>
  );
}

function ViewToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${active ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300'}`}
    >
      {icon}{label}
    </button>
  );
}

function SortSelect({ value, onChange }: { value: string; onChange: (v: any) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40"
      aria-label="Sort trials"
    >
      <option value="relevance">Sort: Relevance</option>
      <option value="distance">Sort: Distance</option>
      <option value="recent">Sort: Most recent</option>
    </select>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-lg p-2.5 text-center">
      <p className="text-xs text-[var(--text-muted)] mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
