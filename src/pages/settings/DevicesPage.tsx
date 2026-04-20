import { useState } from 'react';
import { CheckCircle2, Link2, Link2Off, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { demoWearableData } from '../../lib/mockData';

interface Provider {
  id: string;
  name: string;
  logo: string;
  categories: string[];
  linked: boolean;
  note?: string;
}

const PROVIDERS: Provider[] = [
  {
    id: 'apple',
    name: 'Apple Health',
    logo: '🍎',
    categories: ['Steps', 'HRV', 'Sleep', 'SpO2', 'Heart rate'],
    linked: true,
    note: 'Requires Interactium companion app on iPhone',
  },
  {
    id: 'fitbit',
    name: 'Fitbit / Google Fit',
    logo: '🔵',
    categories: ['Steps', 'Sleep', 'Heart rate', 'Activity'],
    linked: false,
  },
  {
    id: 'garmin',
    name: 'Garmin Connect',
    logo: '⌚',
    categories: ['Steps', 'HRV', 'Sleep', 'SpO2', 'GPS activity'],
    linked: false,
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    logo: '💍',
    categories: ['Sleep', 'HRV', 'Readiness', 'Temperature'],
    linked: false,
  },
  {
    id: 'whoop',
    name: 'WHOOP',
    logo: '🟢',
    categories: ['HRV', 'Strain', 'Recovery', 'Sleep'],
    linked: false,
  },
  {
    id: 'google',
    name: 'Google Health Connect',
    logo: '🔴',
    categories: ['Steps', 'Activity', 'Sleep', 'Heart rate'],
    linked: false,
    note: 'Android only',
  },
];

export function DevicesPage() {
  const [providers, setProviders] = useState(PROVIDERS);
  const wearable = demoWearableData;

  const handleToggle = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.linked) {
          toast.success(`${p.name} disconnected`);
          return { ...p, linked: false };
        } else {
          toast.success(`Connecting to ${p.name}… (OAuth flow would launch here)`);
          return { ...p, linked: true };
        }
      })
    );
  };

  return (
    <div className="space-y-6 pb-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Wearable Devices</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Connect wearables to enrich your health data. All device data is pseudonymised under the same GDPR Art. 9 protections as your PROM data.
        </p>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-3 p-4 bg-[var(--badge-teal-bg)] border border-[var(--teal)]/30 rounded-[var(--radius-card)]">
        <ShieldCheck className="w-4 h-4 text-[var(--teal)] mt-0.5 shrink-0" />
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Wearable data is collected only for categories you authorise, pseudonymised using your PSI token, and stored under the same GDPR Art. 9 protections as your questionnaire data. You can disconnect at any time.
        </p>
      </div>

      {/* Currently linked summary */}
      {wearable && (
        <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">{wearable.device}</h2>
            <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Last synced {new Date(wearable.lastSync).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} today
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <WearableStat label="Avg daily steps" value={wearable.past30Days.avgDailySteps.toLocaleString()} />
            <WearableStat label="Avg HRV" value={`${wearable.past30Days.avgHRV} ms`} />
            <WearableStat label="Avg sleep" value={`${wearable.past30Days.avgSleepHours}h`} />
            <WearableStat label="Avg SpO2" value={`${wearable.past30Days.avgSpO2}%`} />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">{wearable.past30Days.daysWithData}/30 days with data</p>
        </div>
      )}

      {/* Provider tiles */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Available integrations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {providers.map((p) => (
            <div
              key={p.id}
              className={`bg-[var(--bg-white)] rounded-[var(--radius-card)] border p-4 transition-colors ${p.linked ? 'border-[var(--teal)]/40' : 'border-[var(--border-token)]'}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.logo}</span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</p>
                    {p.note && <p className="text-[10px] text-amber-600">{p.note}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(p.id)}
                  className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors min-h-[36px] ${p.linked ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-[var(--badge-teal-bg)] text-[var(--teal)] border border-[var(--teal)]/30 hover:bg-teal-100'}`}
                >
                  {p.linked
                    ? <><Link2Off className="w-3.5 h-3.5" /> Disconnect</>
                    : <><Link2 className="w-3.5 h-3.5" /> Connect</>}
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {p.categories.map((c) => (
                  <span key={c} className="text-[10px] bg-[var(--badge-neutral-bg)] text-[var(--text-muted)] px-1.5 py-0.5 rounded">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Powered by Terra API · Unified OAuth layer for all wearable providers
      </p>
    </div>
  );
}

function WearableStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-lg p-2.5 text-center">
      <p className="text-[10px] text-[var(--text-muted)] mb-0.5">{label}</p>
      <p className="text-sm font-mono font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
