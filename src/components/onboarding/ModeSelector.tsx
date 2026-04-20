import { PatientMode } from '../../store/uiStore';

interface ModeDef {
  id: PatientMode;
  emoji: string;
  title: string;
  tagline: string;
  description: string;
  color: string;
  border: string;
  bg: string;
}

const MODES: ModeDef[] = [
  {
    id: 'navigator',
    emoji: '🧭',
    title: 'Navigator',
    tagline: 'Newly diagnosed — help me understand',
    description: 'Focuses on education, key tasks, and understanding your condition. No empty charts or scores that might feel confusing.',
    color: 'text-blue-700',
    border: 'border-blue-300',
    bg: 'bg-blue-50',
  },
  {
    id: 'tracker',
    emoji: '📈',
    title: 'Tracker',
    tagline: 'I want to see my trends over time',
    description: 'Full dashboard with charts, longitudinal data, wearable sync, and comparison tools. For engaged, data-curious patients.',
    color: 'text-teal-700',
    border: 'border-teal-300',
    bg: 'bg-teal-50',
  },
  {
    id: 'contributor',
    emoji: '🔬',
    title: 'Contributor',
    tagline: 'I want to contribute to research',
    description: 'Everything in Tracker, plus: FAIR data catalogue, who accessed your data, gamification, and study contribution badges.',
    color: 'text-purple-700',
    border: 'border-purple-300',
    bg: 'bg-purple-50',
  },
  {
    id: 'minimalist',
    emoji: '☑️',
    title: 'Minimalist',
    tagline: 'Just my tasks and appointments',
    description: 'A calm, simple view — upcoming questionnaires and appointments only. No scores, rings, or charts.',
    color: 'text-slate-700',
    border: 'border-slate-300',
    bg: 'bg-slate-50',
  },
];

interface Props {
  value: PatientMode | null;
  onChange: (mode: PatientMode) => void;
}

export function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {MODES.map((mode) => {
        const selected = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={[
              'text-left p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1',
              selected
                ? `${mode.bg} ${mode.border} ring-2 ring-offset-1 ring-current`
                : 'bg-white border-[var(--border-token)] hover:border-slate-300',
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none mt-0.5">{mode.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${selected ? mode.color : 'text-[var(--text-primary)]'}`}>
                  {mode.title}
                </div>
                <div className="text-xs font-medium text-[var(--text-secondary)] mt-0.5 mb-1">
                  {mode.tagline}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {mode.description}
                </p>
              </div>
              {selected && (
                <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${mode.color.replace('text-', 'bg-')}`}>
                  ✓
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
