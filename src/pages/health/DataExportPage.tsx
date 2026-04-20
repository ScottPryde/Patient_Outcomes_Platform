import { useState } from 'react';
import { Download, Eye, Info } from 'lucide-react';
import { demoMetricSeries, demoLifeEvents, demoPseudoId } from '../../lib/mockData';

type Format = 'csv' | 'json' | 'fhir';
type DatePreset = '1m' | '3m' | '6m' | 'all';

const FORMAT_LABELS: Record<Format, string> = { csv: 'CSV', json: 'JSON', fhir: 'FHIR R4' };
const PRESET_LABELS: Record<DatePreset, string> = { '1m': 'Last month', '3m': '3 months', '6m': '6 months', all: 'All time' };

const DATA_TYPES = [
  { id: 'prom', label: 'PROM responses', count: 24 },
  { id: 'wearable', label: 'Wearable data', count: 84 },
  { id: 'clinical', label: 'Clinical measures', count: 18 },
  { id: 'life', label: 'Life events & notes', count: demoLifeEvents.length },
  { id: 'registry', label: 'Registry submissions', count: 4 },
  { id: 'consent', label: 'Consent records', count: 3 },
];

function buildCsvPreview() {
  const rows = demoMetricSeries.flatMap((s) =>
    s.values.slice(-3).map((v) => `${v.date},${s.domain},${s.label},${v.value},${s.unit},PROM`)
  ).slice(0, 5);
  return ['date,category,metric,value,unit,source', ...rows].join('\n');
}

function buildJsonPreview() {
  const rows = demoMetricSeries.slice(0, 2).map((s) => ({
    metric: s.label, domain: s.domain, unit: s.unit,
    latestValue: s.values[s.values.length - 1],
  }));
  return JSON.stringify(rows, null, 2);
}

function buildFhirPreview() {
  return JSON.stringify({
    resourceType: 'Bundle', type: 'collection',
    entry: [{
      resource: {
        resourceType: 'Observation',
        status: 'final',
        code: { text: 'Fatigue T-score' },
        subject: { identifier: { value: demoPseudoId } },
        valueQuantity: { value: 42, unit: '' },
        effectiveDateTime: '2026-04-01',
      },
    }],
  }, null, 2);
}

export function DataExportPage() {
  const [format, setFormat] = useState<Format>('csv');
  const [preset, setPreset] = useState<DatePreset>('3m');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(DATA_TYPES.map((d) => d.id)));
  const [includeRealName, setIncludeRealName] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const toggleType = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const previewContent = format === 'csv' ? buildCsvPreview()
    : format === 'json' ? buildJsonPreview()
    : buildFhirPreview();

  const handleDownload = () => {
    const ext = format === 'fhir' ? 'json' : format;
    const mime = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `interactium_export_anna_thompson_${new Date().toISOString().slice(0, 10)}.${ext}`;
    const blob = new Blob([previewContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const totalRows = DATA_TYPES.filter((d) => selected.has(d.id)).reduce((sum, d) => sum + d.count, 0);
  const exportDate = new Date().toISOString().slice(0, 10);
  const ext = format === 'fhir' ? 'json' : format;

  return (
    <div className="space-y-5 pb-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Data Export</h1>
        <p className="text-sm text-[var(--text-secondary)]">Download your health data in your preferred format.</p>
      </div>

      {/* GDPR note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--state-info-bg)] text-[var(--state-info-text)] text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        This export is your right of access under <strong className="ml-1">GDPR Article 15</strong>. Your data is pseudonymised by default.
      </div>

      {/* Format */}
      <ExportSection title="Export format">
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
            <button key={f} type="button" onClick={() => setFormat(f)}
              className={`text-sm px-4 py-2 rounded-lg border font-medium transition-colors ${format === f ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border-token)] text-[var(--text-secondary)] hover:border-slate-300'}`}>
              {FORMAT_LABELS[f]}
            </button>
          ))}
        </div>
        {format === 'fhir' && (
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Exports as FHIR R4 Bundle with <code className="bg-[var(--bg-surface)] px-1 rounded">Observation</code> and <code className="bg-[var(--bg-surface)] px-1 rounded">QuestionnaireResponse</code> resources.
          </p>
        )}
      </ExportSection>

      {/* Date range */}
      <ExportSection title="Date range">
        <div className="flex gap-1.5 flex-wrap mb-3">
          {(Object.keys(PRESET_LABELS) as DatePreset[]).map((p) => (
            <button key={p} type="button" onClick={() => setPreset(p)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${preset === p ? 'bg-[var(--teal)] text-white border-[var(--teal)]' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300'}`}>
              {PRESET_LABELS[p]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>Custom:</span>
          <input type="date" aria-label="From date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] focus:outline-none" />
          <span>→</span>
          <input type="date" aria-label="To date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] focus:outline-none" />
        </div>
      </ExportSection>

      {/* Data types */}
      <ExportSection title="Data types">
        <div className="grid grid-cols-2 gap-2">
          {DATA_TYPES.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggleType(d.id)}
                className="accent-[var(--teal)] w-4 h-4 rounded" />
              <span className="flex-1 text-[var(--text-primary)]">{d.label}</span>
              <span className="text-xs text-[var(--text-muted)]">~{d.count}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">~{totalRows} total rows selected</p>
      </ExportSection>

      {/* Privacy */}
      <ExportSection title="Privacy settings">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={true} readOnly className="accent-[var(--teal)] w-4 h-4 rounded" />
            <span className="text-[var(--text-primary)]">
              Include pseudonymised ID{' '}
              <code className="text-xs font-mono text-[var(--purple)] bg-[var(--badge-vault-bg)] px-1 rounded">{demoPseudoId}</code>
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={includeRealName} onChange={(e) => setIncludeRealName(e.target.checked)}
              className="accent-[var(--teal)] w-4 h-4 rounded" />
            <span className="text-[var(--text-primary)]">
              Include real name{' '}
              <span className="text-[10px] text-[var(--danger)]">⚠ increases re-identification risk</span>
            </span>
          </label>
        </div>
      </ExportSection>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button type="button" onClick={() => setShowPreview((v) => !v)}
          className="flex items-center gap-1.5 text-sm border border-[var(--border-token)] px-4 py-2.5 rounded-lg text-[var(--text-secondary)] hover:border-slate-300 transition-colors">
          <Eye className="w-4 h-4" /> {showPreview ? 'Hide preview' : 'Preview export'}
        </button>
        <button type="button" onClick={handleDownload}
          className="flex items-center gap-1.5 text-sm bg-[var(--teal)] text-white px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Download className="w-4 h-4" /> Download — interactium_export_{exportDate}.{ext}
        </button>
      </div>

      {showPreview && (
        <div className="rounded-lg border border-[var(--border-token)] overflow-hidden">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest px-3 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-token)]">
            Preview — first 5 rows
          </p>
          <pre className="text-xs text-[var(--text-primary)] p-4 overflow-x-auto bg-[var(--bg-white)] leading-relaxed">
            {previewContent}
          </pre>
        </div>
      )}
    </div>
  );
}

function ExportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}
