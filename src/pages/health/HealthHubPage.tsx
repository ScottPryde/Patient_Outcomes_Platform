import { Link } from 'react-router-dom';
import { Activity, Microscope, BarChart2, Table2, ListTree, ClipboardList, Hospital, Download, SlidersHorizontal, NotebookPen, ChevronRight } from 'lucide-react';
import { demoMetricSeries, demoLifeEvents, demoWearableData, demoRegistryHistory } from '../../lib/mockData';

const NAV_LINKS = [
  { to: '/health/analytics', label: 'Analytics', description: 'Goals and metric trends', icon: Microscope },
  { to: '/health/charts', label: 'Health Trends', description: 'Chart all observations by domain', icon: BarChart2 },
  { to: '/health/grid', label: 'Data Grid', description: 'Filterable table of all data', icon: Table2 },
  { to: '/health/all-obs', label: 'All Health Data', description: 'Searchable observation list', icon: ListTree },
  { to: '/health/log', label: 'Health Log', description: 'Daily observation entry', icon: NotebookPen },
  { to: '/health/prom-history', label: 'PROMs History', description: 'Questionnaire scores over time', icon: ClipboardList },
  { to: '/health/reg-history', label: 'Registry History', description: 'TREAT-NMD visit submissions', icon: Hospital },
  { to: '/health/export', label: 'Data Export', description: 'Download in CSV, JSON, FHIR', icon: Download },
  { to: '/health/dataconfig', label: 'Data Config', description: 'Targets, wearables, sharing', icon: SlidersHorizontal },
];

function latestValue(id: string) {
  const s = demoMetricSeries.find((x) => x.id === id);
  if (!s) return '—';
  const v = s.values[s.values.length - 1];
  return `${v.value}${s.unit ? ' ' + s.unit : ''}`;
}

function syncAgo(iso: string) {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return diff < 60 ? `${diff}m ago` : `${Math.round(diff / 60)}h ago`;
}

const totalObs = demoMetricSeries.reduce((n, s) => n + s.values.length, 0) + demoLifeEvents.length;
const latestProm = latestValue('fatigue');
const lastSync = syncAgo(demoWearableData.lastSync);
const registryVisits = demoRegistryHistory.totalVisits;

const RECENT = [
  { date: demoLifeEvents[0].date, label: demoLifeEvents[0].type, detail: demoLifeEvents[0].note, colour: 'bg-[var(--state-pending-bg)] text-[var(--state-pending-text)]' },
  { date: demoMetricSeries[0].values.at(-1)!.date, label: 'Fatigue T-score', detail: latestValue('fatigue'), colour: 'bg-[var(--badge-vault-bg)] text-[var(--purple)]' },
  { date: demoMetricSeries[1].values.at(-1)!.date, label: '6-Min Walk', detail: latestValue('sixmwt'), colour: 'bg-[var(--badge-teal-bg)] text-[var(--teal)]' },
];

export function HealthHubPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">My Health Data</h1>
        <p className="text-sm text-[var(--text-secondary)]">Explore observations, PROMs, and registry activity.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <HubStat icon={<Activity className="w-4 h-4" />} label="Observations recorded" value={String(totalObs)} />
        <HubStat icon={<ClipboardList className="w-4 h-4" />} label="Latest PROM score" value={latestProm} note="Fatigue T-score" />
        <HubStat icon={<BarChart2 className="w-4 h-4" />} label="Last wearable sync" value={lastSync} />
        <HubStat icon={<Hospital className="w-4 h-4" />} label="Registry visits" value={String(registryVisits)} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        <Link to="/health/log"
          className="flex items-center gap-1.5 text-sm bg-[var(--teal)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
          <NotebookPen className="w-4 h-4" /> Quick log
        </Link>
        <Link to="/health/all-obs"
          className="flex items-center gap-1.5 text-sm border border-[var(--border-token)] text-[var(--text-secondary)] px-4 py-2 rounded-lg hover:border-slate-300 transition-colors">
          View all observations
        </Link>
      </div>

      {/* Recent activity */}
      <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">Recent activity</p>
        <div className="space-y-2">
          {RECENT.map((r, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-[var(--border-light)] last:border-0">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold capitalize ${r.colour}`}>{r.label}</span>
              <span className="text-xs text-[var(--text-secondary)] flex-1 truncate">{r.detail}</span>
              <span className="text-xs text-[var(--text-muted)] shrink-0">
                {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {NAV_LINKS.map(({ to, label, description, icon: Icon }) => (
          <Link key={to} to={to}
            className="flex items-center gap-3 p-4 bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] hover:border-[var(--teal)] hover:shadow-[var(--shadow-sm)] transition-all group">
            <div className="w-9 h-9 rounded-lg bg-[var(--badge-teal-bg)] flex items-center justify-center text-[var(--teal)] shrink-0 group-hover:bg-[var(--teal)] group-hover:text-white transition-colors">
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function HubStat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note?: string }) {
  return (
    <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
      <div className="flex items-center gap-2 text-[var(--teal)] mb-1">{icon}<span className="text-xs text-[var(--text-muted)]">{label}</span></div>
      <p className="font-mono font-bold text-lg text-[var(--text-primary)] leading-tight">{value}</p>
      {note && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{note}</p>}
    </div>
  );
}
