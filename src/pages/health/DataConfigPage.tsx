import { useState } from 'react';
import { Check, Edit2 } from 'lucide-react';
import { demoWearableData } from '../../lib/mockData';
import { toast } from 'sonner';

const DOMAINS = [
  { id: 'physical', label: 'Physical', description: 'Grip strength, 6MWT, functional assessments' },
  { id: 'fatigue', label: 'Fatigue & Mood', description: 'Daily fatigue ratings, mood scores, energy levels' },
  { id: 'wearable', label: 'Wearable', description: 'Steps, HRV, sleep, SpO2 from connected devices' },
  { id: 'clinical', label: 'Clinical', description: 'FVC%, clinic measurements, lab results' },
  { id: 'proms', label: 'PROMs', description: 'Structured questionnaires — INQoL, PROMIS, EQ-5D' },
];

const WEARABLE_METRICS = [
  { id: 'steps', label: 'Daily Steps', lastSync: demoWearableData.lastSync },
  { id: 'hrv', label: 'Heart Rate Variability', lastSync: demoWearableData.lastSync },
  { id: 'sleep', label: 'Sleep Hours', lastSync: demoWearableData.lastSync },
  { id: 'spo2', label: 'Blood Oxygen (SpO2)', lastSync: demoWearableData.lastSync },
];

const REGISTRY_DOMAINS = ['Physical', 'PROMs', 'Clinical'];

interface Target { id: string; label: string; value: number; unit: string }
const INITIAL_TARGETS: Target[] = [
  { id: 'sixmwt', label: '6-Min Walk Test', value: 330, unit: 'm' },
  { id: 'fatigue', label: 'Fatigue T-score', value: 38, unit: '' },
  { id: 'steps', label: 'Daily steps', value: 7000, unit: 'steps' },
  { id: 'mood', label: 'Mood average', value: 7.5, unit: '/10' },
];

export function DataConfigPage() {
  const [enabledDomains, setEnabledDomains] = useState<Set<string>>(
    new Set(DOMAINS.map((d) => d.id))
  );
  const [enabledWearables, setEnabledWearables] = useState<Set<string>>(
    new Set(WEARABLE_METRICS.map((w) => w.id))
  );
  const [registryDomains, setRegistryDomains] = useState<Set<string>>(new Set(REGISTRY_DOMAINS));
  const [targets, setTargets] = useState<Target[]>(INITIAL_TARGETS);
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');

  const toggleDomain = (id: string) => setEnabledDomains((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleWearable = (id: string) => setEnabledWearables((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleRegistry = (label: string) => setRegistryDomains((prev) => {
    const next = new Set(prev);
    next.has(label) ? next.delete(label) : next.add(label);
    return next;
  });

  const startEdit = (t: Target) => { setEditingTarget(t.id); setDraftValue(String(t.value)); };

  const saveTarget = (id: string) => {
    const num = parseFloat(draftValue);
    if (isNaN(num)) return;
    setTargets((prev) => prev.map((t) => t.id === id ? { ...t, value: num } : t));
    setEditingTarget(null);
    toast.success('Target updated');
  };

  const formatSync = (iso: string) => {
    const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    return diff < 60 ? `${diff}m ago` : `${Math.round(diff / 60)}h ago`;
  };

  return (
    <div className="space-y-5 pb-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Data Configuration</h1>
        <p className="text-sm text-[var(--text-secondary)]">Control which categories are collected, synced, and shared.</p>
      </div>

      {/* Observation categories */}
      <ConfigSection title="Observation categories">
        <div className="space-y-2">
          {DOMAINS.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)]">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{d.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{d.description}</p>
              </div>
              <Toggle checked={enabledDomains.has(d.id)} onChange={() => toggleDomain(d.id)} label={d.label} />
            </div>
          ))}
        </div>
      </ConfigSection>

      {/* Wearable sync */}
      <ConfigSection title={`Wearable sync — ${demoWearableData.device}`}>
        <div className="space-y-2">
          {WEARABLE_METRICS.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)]">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{w.label}</p>
                <p className="text-xs text-[var(--text-muted)]">Last synced: {formatSync(w.lastSync)}</p>
              </div>
              <Toggle checked={enabledWearables.has(w.id)} onChange={() => toggleWearable(w.id)} label={w.label} />
            </div>
          ))}
        </div>
      </ConfigSection>

      {/* Custom targets */}
      <ConfigSection title="Custom targets">
        <div className="space-y-2">
          {targets.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)]">
              <p className="text-sm font-medium text-[var(--text-primary)] flex-1 min-w-0">{t.label}</p>
              {editingTarget === t.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    aria-label={`Target for ${t.label}`}
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    className="w-20 text-xs px-2 py-1.5 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40"
                  />
                  {t.unit && <span className="text-xs text-[var(--text-muted)]">{t.unit}</span>}
                  <button type="button" aria-label="Save target" onClick={() => saveTarget(t.id)}
                    className="p-1.5 rounded-lg bg-[var(--teal)] text-white hover:opacity-90">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                    {t.value}{t.unit && ` ${t.unit}`}
                  </span>
                  <button type="button" aria-label={`Edit target for ${t.label}`} onClick={() => startEdit(t)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ConfigSection>

      {/* Data sharing */}
      <ConfigSection title="Data sharing with TREAT-NMD registry">
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Select which categories are shared with the TREAT-NMD registry. Requires active consent.
        </p>
        <div className="space-y-2">
          {DOMAINS.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={registryDomains.has(d.label)}
                onChange={() => toggleRegistry(d.label)}
                className="accent-[var(--teal)] w-4 h-4 rounded" />
              <span className="text-[var(--text-primary)]">{d.label}</span>
            </label>
          ))}
        </div>
      </ConfigSection>
    </div>
  );
}

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      onClick={onChange}
      className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-[var(--teal)]' : 'bg-slate-200'}`}>
      <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? 'left-[22px]' : 'left-[3px]'}`} />
    </button>
  );
}
