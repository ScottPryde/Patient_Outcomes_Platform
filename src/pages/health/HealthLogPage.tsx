import { useState } from 'react';
import { demoLifeEvents } from '../../lib/mockData';
import { ChevronLeft, ChevronRight, Mic, Zap, Activity, Smile, Droplets, Clock } from 'lucide-react';
import { LifeEventModal } from '../../components/modals/LifeEventModal';
import { toast } from 'sonner';

type Period = 'day' | 'week' | 'month';

// Weekly streak data (simulated — last 7 days, Sun=0..Sat=6)
const LOGGED_DAYS = new Set([0, 1, 2, 4, 5, 6]); // Mon–Wed logged, Fri–Sun logged

function WeeklyStreak() {
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayDow = new Date().getDay(); // 0=Sun..6=Sat
  // Map display index 0=Mon..6=Sun to JS day: Mon=1..Sun=0
  const streak = LOGGED_DAYS.size;
  return (
    <div className="flex items-center justify-between bg-[var(--bg-surface)] rounded-lg px-4 py-3 border border-[var(--border-token)]">
      <div className="flex gap-2">
        {dayLetters.map((letter, i) => {
          // i=0→Mon(1), i=6→Sun(0)
          const jsDow = i === 6 ? 0 : i + 1;
          // daysAgo: how many days ago was this day
          const daysAgo = (todayDow - jsDow + 7) % 7;
          const isToday = daysAgo === 0;
          const logged = LOGGED_DAYS.has(i);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={[
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                logged
                  ? 'bg-[var(--teal)] text-white'
                  : isToday
                    ? 'bg-[var(--badge-teal-bg)] text-[var(--teal)] border-2 border-[var(--teal)]'
                    : 'bg-[var(--bg-white)] text-[var(--text-faint)] border border-[var(--border-token)]',
              ].join(' ')}>
                {logged ? '✓' : letter}
              </div>
              <span className="text-[9px] text-[var(--text-faint)] font-medium">{letter}</span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col items-end ml-4">
        <span className="text-base font-bold text-orange-500 leading-none">🔥 {streak}</span>
        <span className="text-[10px] text-[var(--text-muted)]">day streak</span>
      </div>
    </div>
  );
}

export function HealthLogPage() {
  const [period, setPeriod] = useState<Period>('day');
  const [offset, setOffset] = useState(0);
  const [fatigue, setFatigue] = useState(1);
  const [mood, setMood] = useState(3);
  const [pain, setPain] = useState(0);
  const [water, setWater] = useState(5);
  const [fasting, setFasting] = useState(14);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [lifeEventModalOpen, setLifeEventModalOpen] = useState(false);

  const today = new Date();
  today.setDate(today.getDate() - offset);
  const dateLabel = offset === 0 ? 'Today' : offset === 1 ? 'Yesterday'
    : today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  const handleSave = () => {
    setSaved(true);
    toast.success('Journal entry saved 🔥');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Health Journal</h1>
          <p className="text-sm text-[var(--text-secondary)]">Daily check-in — track how you're feeling</p>
        </div>
      </div>

      {/* Weekly streak */}
      <WeeklyStreak />

      {/* Date navigation */}
      <div className="flex items-center justify-between gap-4 bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] px-4 py-3">
        <div className="flex gap-1">
          {(['day', 'week', 'month'] as Period[]).map((p) => (
            <button key={p} type="button" onClick={() => { setPeriod(p); setOffset(0); }}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors capitalize ${period === p ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border-token)] text-[var(--text-muted)]'}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous" onClick={() => setOffset((o) => o + 1)}
            className="p-1.5 rounded-lg border border-[var(--border-token)] text-[var(--text-muted)] min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-[var(--text-primary)] min-w-[80px] text-center">{dateLabel}</span>
          <button type="button" aria-label="Next" onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0}
            className="p-1.5 rounded-lg border border-[var(--border-token)] text-[var(--text-muted)] disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* Left: wellness sliders */}
        <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5 space-y-5">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Wellness check-in</p>

          <MetricSlider
            id="fatigue-slider"
            label="Fatigue"
            icon={Zap}
            iconColor="#f59e0b"
            value={fatigue}
            onChange={setFatigue}
            min={0} max={4}
            lowLabel="No fatigue"
            highLabel="Extreme"
            colorClass="accent-amber-400"
          />
          <MetricSlider
            id="pain-slider"
            label="Pain"
            icon={Activity}
            iconColor="#ef4444"
            value={pain}
            onChange={setPain}
            min={0} max={4}
            lowLabel="No pain"
            highLabel="Severe"
            colorClass="accent-red-400"
          />
          <MetricSlider
            id="mood-slider"
            label="Mood"
            icon={Smile}
            iconColor="#7c3aed"
            value={mood}
            onChange={setMood}
            min={0} max={4}
            lowLabel="Very low"
            highLabel="Great"
            colorClass="accent-purple-500"
          />

          <div className="border-t border-[var(--border-light)] pt-4 space-y-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Daily goals</p>

            {/* Water intake stepper */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-medium text-[var(--text-primary)]">Water</span>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Decrease water" onClick={() => setWater((w) => Math.max(0, w - 1))}
                  className="w-8 h-8 rounded-full border border-[var(--border-token)] text-[var(--text-muted)] flex items-center justify-center text-lg font-bold hover:border-sky-400 hover:text-sky-500 transition-colors">−</button>
                <div className="text-center min-w-[56px]">
                  <span className="font-mono font-bold text-xl text-[var(--text-primary)]">{water}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-1">/ 8 gl</span>
                </div>
                <button type="button" aria-label="Increase water" onClick={() => setWater((w) => Math.min(20, w + 1))}
                  className="w-8 h-8 rounded-full border border-[var(--border-token)] text-[var(--text-muted)] flex items-center justify-center text-lg font-bold hover:border-sky-400 hover:text-sky-500 transition-colors">+</button>
              </div>
              <WaterDots value={water} max={8} />
            </div>

            {/* Fasting window stepper */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-[var(--text-primary)]">Fasting</span>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Decrease fasting" onClick={() => setFasting((f) => Math.max(0, f - 1))}
                  className="w-8 h-8 rounded-full border border-[var(--border-token)] text-[var(--text-muted)] flex items-center justify-center text-lg font-bold hover:border-slate-400 hover:text-slate-600 transition-colors">−</button>
                <div className="text-center min-w-[56px]">
                  <span className="font-mono font-bold text-xl text-[var(--text-primary)]">{fasting}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-1">/ 16 hr</span>
                </div>
                <button type="button" aria-label="Increase fasting" onClick={() => setFasting((f) => Math.min(24, f + 1))}
                  className="w-8 h-8 rounded-full border border-[var(--border-token)] text-[var(--text-muted)] flex items-center justify-center text-lg font-bold hover:border-slate-400 hover:text-slate-600 transition-colors">+</button>
              </div>
              <div className="w-24 h-1.5 bg-[var(--border-token)] rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full transition-all" style={{ width: `${Math.min((fasting / 16) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          <button type="button" onClick={handleSave}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors min-h-[44px] ${saved ? 'bg-teal-500 text-white' : 'bg-[var(--navy)] text-white hover:opacity-90'}`}>
            {saved ? '✓ Entry saved' : 'Save entry'}
          </button>
        </div>

        {/* Right: note + life events */}
        <div className="space-y-4">
          <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5 space-y-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Journal note</p>
            <textarea id="health-note" value={note} onChange={(e) => setNote(e.target.value)} rows={4}
              placeholder="How are you feeling today? Note any symptoms, activities, or observations..."
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40 resize-none" />

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">Voice note</p>
              <label htmlFor="voice-note" className="flex items-center gap-2 text-xs text-[var(--text-secondary)] px-4 py-3 rounded-lg border border-dashed border-[var(--border-token)] cursor-pointer hover:border-[var(--teal)] transition-colors">
                <Mic className="w-4 h-4 text-[var(--teal)]" />
                Tap to record or attach an audio file
                <input id="voice-note" type="file" accept="audio/*" className="sr-only" />
              </label>
            </div>

            <button type="button" onClick={() => setLifeEventModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 text-sm border border-dashed border-[var(--teal)] text-[var(--teal)] py-2.5 rounded-lg hover:bg-[var(--badge-teal-bg)] transition-colors font-medium">
              + Log a life event
            </button>
          </div>

          {/* Recent life events */}
          <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">Recent events</p>
            <div className="space-y-2">
              {demoLifeEvents.slice(0, 5).map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-[var(--border-light)] last:border-0">
                  <span className="text-base w-6 shrink-0 text-center">{ev.feel}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] capitalize">{ev.type}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{ev.note}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                    {new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {lifeEventModalOpen && <LifeEventModal onClose={() => setLifeEventModalOpen(false)} />}
    </div>
  );
}

// ─── MetricSlider ─────────────────────────────────────────────────────────────

function MetricSlider({
  id, label, icon: Icon, iconColor, value, onChange, min, max, lowLabel, highLabel, colorClass,
}: {
  id: string; label: string; icon: React.ElementType; iconColor: string;
  value: number; onChange: (v: number) => void; min: number; max: number;
  lowLabel: string; highLabel: string; colorClass: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const steps = max - min + 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
          <label htmlFor={id} className="text-sm font-semibold text-[var(--text-primary)]">{label}</label>
        </div>
        <div className="flex items-center gap-1">
          {/* Dot indicators */}
          {Array.from({ length: steps }, (_, i) => (
            <button key={i} type="button" aria-label={`${label} level ${i}`}
              onClick={() => onChange(i)}
              className="w-2.5 h-2.5 rounded-full transition-all duration-150 border"
              style={{
                backgroundColor: i <= value ? iconColor : 'transparent',
                borderColor: i <= value ? iconColor : '#e2e8f0',
                transform: i === value ? 'scale(1.4)' : 'scale(1)',
              }} />
          ))}
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <span className="text-[10px] text-[var(--text-muted)] w-14 shrink-0 text-right">{lowLabel}</span>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`flex-1 h-2 rounded-full appearance-none cursor-pointer ${colorClass}`}
          style={{
            background: `linear-gradient(to right, ${iconColor} ${pct}%, #e2e8f0 ${pct}%)`,
          }}
        />
        <span className="text-[10px] text-[var(--text-muted)] w-14 shrink-0">{highLabel}</span>
        <span className="font-mono font-bold text-sm min-w-[2.5rem] text-right" style={{ color: iconColor }}>
          {value}/{max}
        </span>
      </div>
    </div>
  );
}

// ─── WaterDots ────────────────────────────────────────────────────────────────

function WaterDots({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex gap-1 flex-wrap max-w-[88px]">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < value ? 'bg-sky-400' : 'bg-[var(--border-token)]'}`} />
      ))}
    </div>
  );
}
