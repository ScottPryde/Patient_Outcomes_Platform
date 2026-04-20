import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUiStore, PatientMode } from '../store/uiStore';
import { useConsent } from '../contexts/ConsentContext';
import { useTheme } from '../contexts/ThemeContext';
import { ModeSelector } from '../components/onboarding/ModeSelector';
import {
  Sparkles, Layout, ToggleLeft, Lightbulb, BookOpen, Users,
  Database, ShieldCheck, Bell, BarChart3, UserCircle, HelpCircle,
  ChevronDown, ChevronUp, QrCode, CheckCircle2, Heart, Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { demoFeatureSuggestions } from '../lib/mockData';

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SECTIONS: Section[] = [
  { id: 'experience', icon: <Sparkles className="w-4 h-4" />, title: 'My Experience', description: 'Mode, rings, metric anxiety, cohort comparison' },
  { id: 'display', icon: <Layout className="w-4 h-4" />, title: 'App Display & Layout', description: 'Language, dark mode, text size, nav style' },
  { id: 'features', icon: <ToggleLeft className="w-4 h-4" />, title: 'My Features', description: 'Enable / disable platform modules' },
  { id: 'suggestions', icon: <Lightbulb className="w-4 h-4" />, title: 'Feature Suggestions', description: 'Vote on community ideas or suggest your own' },
  { id: 'content', icon: <BookOpen className="w-4 h-4" />, title: 'Content Preferences', description: 'Topics and formats you want to see' },
  { id: 'caregiver', icon: <Users className="w-4 h-4" />, title: 'Caregiver & Family Access', description: 'Invite a caregiver, manage permissions' },
  { id: 'registry', icon: <Database className="w-4 h-4" />, title: 'My Data & Registry', description: 'TREAT-NMD registration, PSI token, contributions' },
  { id: 'consent', icon: <ShieldCheck className="w-4 h-4" />, title: 'Consent & Privacy', description: 'GDPR rights, consent history, data access log' },
  { id: 'notifications', icon: <Bell className="w-4 h-4" />, title: 'Notifications & Reminders', description: 'Channels, frequency, per-type toggles' },
  { id: 'catalogue', icon: <BarChart3 className="w-4 h-4" />, title: 'My Data Catalogue', description: 'FAIR assets, who accessed your data' },
  { id: 'account', icon: <UserCircle className="w-4 h-4" />, title: 'Account & Security', description: 'Sign-in, 2FA, connected devices' },
  { id: 'help', icon: <HelpCircle className="w-4 h-4" />, title: 'Help & Support', description: 'Guides, questionnaire help, contact registry' },
];

const STATUS_VARIANT: Record<string, string> = {
  planned: 'bg-[var(--state-active-bg)] text-[var(--state-active-text)]',
  considering: 'bg-[var(--state-pending-bg)] text-[var(--state-pending-text)]',
  live: 'bg-[var(--priority-low-bg)] text-[var(--priority-low-text)]',
  open: 'bg-[var(--badge-neutral-bg)] text-[var(--text-secondary)]',
};

const CATALOGUE_ASSETS = [
  { asset: 'PROMIS Fatigue responses', domain: 'PROMs', format: 'FHIR R4', sharedWith: 'TREAT-NMD', updated: '2026-04-10' },
  { asset: 'Apple Watch daily steps', domain: 'Wearable', format: 'JSON', sharedWith: 'PaLaDín study', updated: '2026-04-17' },
  { asset: 'INQoL questionnaire', domain: 'PROMs', format: 'FHIR R4', sharedWith: 'TREAT-NMD', updated: '2026-01-15' },
  { asset: 'Registry visit data', domain: 'Clinical', format: 'CSV', sharedWith: 'FSHD Registry', updated: '2026-02-20' },
];

export function SettingsHubPage() {
  const [open, setOpen] = useState<string | null>('experience');
  const {
    patientMode, setPatientMode, features, toggleFeature,
    largeText, setLargeText,
    reducedMotion, setReducedMotion,
    language, setLanguage,
    ringVisibility, setRingVisibility,
    metricAnxietyMode, setMetricAnxietyMode,
    showGamification, setShowGamification,
    showCohort, setShowCohort,
    notificationPrefs, setNotificationPrefs,
  } = useUiStore();
  const { theme, setTheme } = useTheme();
  const { consents, getUserConsentStatus } = useConsent();

  // Apply accessibility classes to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText);
  }, [largeText]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [reducedMotion]);

  const toggle = (id: string) => setOpen(open === id ? null : id);
  const isDark = theme === 'dark';

  return (
    <div className="space-y-2 pb-8 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage your experience, consent, data, and account.</p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.id} className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggle(section.id)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--bg-surface)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-[var(--teal)]">{section.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{section.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{section.description}</p>
              </div>
            </div>
            {open === section.id
              ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              : <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
          </button>

          {open === section.id && (
            <div className="px-4 pb-5 border-t border-[var(--border-token)]">

              {/* ── My Experience ── */}
              {section.id === 'experience' && (
                <div className="space-y-5 pt-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Experience mode</p>
                    <ModeSelector
                      value={patientMode}
                      onChange={(m: PatientMode) => {
                        setPatientMode(m);
                        toast.success(`Mode switched to ${m.charAt(0).toUpperCase() + m.slice(1)}`);
                      }}
                    />
                  </div>
                  <ToggleRow
                    label="Show data health rings"
                    description="Hide rings if they cause anxiety"
                    checked={ringVisibility}
                    onChange={() => setRingVisibility(!ringVisibility)}
                  />
                  <ToggleRow
                    label="Metric anxiety mode"
                    description="Show only stable or improving metrics; hide declining scores"
                    checked={metricAnxietyMode}
                    onChange={() => setMetricAnxietyMode(!metricAnxietyMode)}
                  />
                  <ToggleRow
                    label="Cohort comparison"
                    description="Show FSHD cohort percentile overlays on your charts"
                    checked={showCohort}
                    onChange={() => setShowCohort(!showCohort)}
                  />
                  <ToggleRow
                    label="Gamification"
                    description="Enable contribution badges and XP (Contributor mode only)"
                    checked={showGamification}
                    onChange={() => setShowGamification(!showGamification)}
                  />
                </div>
              )}

              {/* ── App Display ── */}
              {section.id === 'display' && (
                <div className="space-y-4 pt-4">
                  <ToggleRow
                    label="Dark mode"
                    description="Switch between light and dark theme"
                    checked={isDark}
                    onChange={() => setTheme(isDark ? 'light' : 'dark')}
                  />
                  <ToggleRow
                    label="Large text"
                    description="Increase base font size for readability"
                    checked={largeText}
                    onChange={() => setLargeText(!largeText)}
                  />
                  <ToggleRow
                    label="Reduced motion"
                    description="Disable animations and transitions"
                    checked={reducedMotion}
                    onChange={() => setReducedMotion(!reducedMotion)}
                  />
                  <div>
                    <label htmlFor="lang-select" className="text-xs font-medium text-[var(--text-muted)] block mb-1.5">Language</label>
                    <select
                      id="lang-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] focus:outline-none"
                    >
                      <option value="en-GB">English (UK)</option>
                      <option value="cy">Welsh</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── My Features ── */}
              {section.id === 'features' && (
                <div className="space-y-4 pt-4">
                  {(Object.keys(features) as Array<keyof typeof features>).map((key) => (
                    <ToggleRow
                      key={key}
                      label={featureLabel(key)}
                      description={featureDesc(key)}
                      checked={features[key]}
                      onChange={() => toggleFeature(key)}
                    />
                  ))}
                </div>
              )}

              {/* ── Feature Suggestions ── */}
              {section.id === 'suggestions' && (
                <FeatureSuggestionsSection />
              )}

              {/* ── Caregiver & Family Access ── */}
              {section.id === 'caregiver' && (
                <CaregiverSection />
              )}

              {/* ── Consent & Privacy ── */}
              {section.id === 'consent' && (
                <div className="space-y-4 pt-4">
                  <p className="text-xs text-[var(--text-secondary)]">
                    Your rights under GDPR: <strong>Access</strong> (Art. 15) · <strong>Rectification</strong> (Art. 16) · <strong>Erasure</strong> (Art. 17) · <strong>Portability</strong> (Art. 20)
                  </p>
                  {consents.map((c) => {
                    const uc = getUserConsentStatus(c.id);
                    return (
                      <div key={c.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)]">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{c.title}</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{c.description}</p>
                          {uc?.acceptedAt && (
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              Accepted {new Date(uc.acceptedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · v{uc.version}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          {uc?.status === 'accepted'
                            ? <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-semibold">Active</span>
                            : <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Declined</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex gap-2 flex-wrap">
                    <Link to="/health/export" className="text-xs border border-[var(--border-token)] px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:border-slate-300">
                      Export my data (Art. 20)
                    </Link>
                    <button type="button" className="text-xs border border-red-200 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50">
                      Request erasure (Art. 17)
                    </button>
                  </div>
                </div>
              )}

              {/* ── Notifications ── */}
              {section.id === 'notifications' && (
                <div className="space-y-4 pt-4">
                  <ToggleRow
                    label="Questionnaire reminders"
                    description="Remind me when a PROM is due"
                    checked={notificationPrefs.questionnaire}
                    onChange={() => setNotificationPrefs({ questionnaire: !notificationPrefs.questionnaire })}
                  />
                  <ToggleRow
                    label="Appointment reminders"
                    description="Notify me before clinic visits"
                    checked={notificationPrefs.appointment}
                    onChange={() => setNotificationPrefs({ appointment: !notificationPrefs.appointment })}
                  />
                  <ToggleRow
                    label="Trial match alerts"
                    description="Alert me when a new matching trial is found"
                    checked={notificationPrefs.trialMatch}
                    onChange={() => setNotificationPrefs({ trialMatch: !notificationPrefs.trialMatch })}
                  />
                  <ToggleRow
                    label="Registry update notices"
                    description="Notify me when registry data is synced"
                    checked={notificationPrefs.registry}
                    onChange={() => setNotificationPrefs({ registry: !notificationPrefs.registry })}
                  />
                  <div>
                    <label htmlFor="notif-channel" className="text-xs font-medium text-[var(--text-muted)] block mb-1.5">Preferred channel</label>
                    <select id="notif-channel" className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] focus:outline-none">
                      <option>Email + Push</option>
                      <option>Email only</option>
                      <option>Push only</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── Data Catalogue ── */}
              {section.id === 'catalogue' && (
                <div className="space-y-4 pt-4">
                  <p className="text-xs text-[var(--text-secondary)]">FAIR data assets associated with your record. FAIR = Findable, Accessible, Interoperable, Reusable.</p>
                  <div className="overflow-x-auto rounded-lg border border-[var(--border-token)]">
                    <table className="w-full text-xs min-w-[500px]">
                      <thead>
                        <tr className="bg-[var(--navy)] text-white">
                          <th className="px-3 py-2.5 text-left font-semibold">Asset</th>
                          <th className="px-3 py-2.5 text-left font-semibold">Domain</th>
                          <th className="px-3 py-2.5 text-left font-semibold">Format</th>
                          <th className="px-3 py-2.5 text-left font-semibold">Shared with</th>
                          <th className="px-3 py-2.5 text-left font-semibold">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CATALOGUE_ASSETS.map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-[var(--bg-white)]' : 'bg-[var(--bg-surface)]'}>
                            <td className="px-3 py-2 text-[var(--text-primary)] font-medium">{row.asset}</td>
                            <td className="px-3 py-2 text-[var(--text-secondary)]">{row.domain}</td>
                            <td className="px-3 py-2 text-[var(--text-muted)]">{row.format}</td>
                            <td className="px-3 py-2 text-[var(--text-secondary)]">{row.sharedWith}</td>
                            <td className="px-3 py-2 text-[var(--text-muted)]">{row.updated}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Account ── */}
              {section.id === 'account' && (
                <div className="space-y-3 pt-4">
                  <Link to="/account" className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-token)] hover:border-[var(--blue)] transition-colors text-sm text-[var(--text-primary)]">
                    View &amp; edit profile <span className="text-[var(--text-muted)] text-xs">→</span>
                  </Link>
                  <Link to="/settings/devices" className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-token)] hover:border-[var(--blue)] transition-colors text-sm text-[var(--text-primary)]">
                    Wearable devices &amp; integrations <span className="text-[var(--text-muted)] text-xs">→</span>
                  </Link>
                  <ToggleRow label="Two-factor authentication" description="Secure your account with an authenticator app" checked={false} onChange={() => {}} />
                </div>
              )}

              {/* ── Help ── */}
              {section.id === 'help' && (
                <div className="space-y-2 pt-4">
                  {[
                    { label: 'Getting started guide', href: '/help' },
                    { label: 'Questionnaire help', href: '/help' },
                    { label: 'Privacy FAQ', href: '/help' },
                    { label: 'Glossary of terms', href: '/help/glossary' },
                    { label: 'Contact the TREAT-NMD registry', href: '/help' },
                  ].map(({ label, href }) => (
                    <Link key={label} to={href} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-token)] hover:border-[var(--blue)] transition-colors text-sm text-[var(--text-primary)]">
                      {label} <span className="text-[var(--text-muted)] text-xs">→</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* ── Generic stub for remaining sections ── */}
              {!['experience', 'display', 'features', 'suggestions', 'caregiver', 'consent', 'notifications', 'catalogue', 'account', 'help'].includes(section.id) && (
                <div className="pt-4">
                  <p className="text-sm text-[var(--text-muted)]">This section is being built. Check back soon.</p>
                </div>
              )}

            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Feature Suggestions section ─────────────────────────────────────────────

function FeatureSuggestionsSection() {
  const [suggestions, setSuggestions] = useState(demoFeatureSuggestions);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('Feature request');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');

  const handleVote = (id: string) => {
    setVoted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setSuggestions((s) => s.map((x) => x.id === id ? { ...x, votes: x.votes - 1 } : x));
      } else {
        next.add(id);
        setSuggestions((s) => s.map((x) => x.id === id ? { ...x, votes: x.votes + 1 } : x));
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!formText.trim()) return;
    toast.success('Your idea has been submitted. Thank you!');
    setFormText('');
  };

  const sorted = [...suggestions].sort((a, b) =>
    sortBy === 'votes' ? b.votes - a.votes : b.id.localeCompare(a.id)
  );

  return (
    <div className="space-y-5 pt-4">
      {/* Submit form */}
      <div className="p-4 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Submit an idea</p>
        <textarea
          value={formText}
          onChange={(e) => setFormText(e.target.value.slice(0, 280))}
          placeholder="Describe your idea..."
          rows={3}
          className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40 resize-none"
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <label htmlFor="suggestion-category" className="sr-only">Category</label>
            <select
              id="suggestion-category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none"
            >
              {['Feature request', 'PROM idea', 'Observation measure', 'Content & education', 'Accessibility'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <span className="text-xs text-[var(--text-muted)]">{formText.length}/280</span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 text-xs bg-[var(--teal)] text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Send className="w-3 h-3" /> Submit idea
          </button>
        </div>
      </div>

      {/* Sort control */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Community ideas</p>
        <div className="flex gap-1">
          {(['votes', 'newest'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSortBy(s)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${sortBy === s ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border-token)] text-[var(--text-muted)]'}`}
            >
              {s === 'votes' ? 'Most votes' : 'Newest'}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions list */}
      <div className="space-y-2">
        {sorted.map((s) => (
          <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)]">
            <button
              type="button"
              onClick={() => handleVote(s.id)}
              className={`shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border transition-colors ${voted.has(s.id) ? 'bg-red-50 border-red-200 text-red-500' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-red-200 hover:text-red-400'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${voted.has(s.id) ? 'fill-current' : ''}`} />
              <span className="text-[11px] font-semibold">{s.votes}</span>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap mb-0.5">
                <p className="text-sm font-medium text-[var(--text-primary)]">{s.title}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold capitalize ${STATUS_VARIANT[s.status]}`}>
                  {s.status}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--badge-neutral-bg)] text-[var(--text-secondary)]">
                  {s.category}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{s.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status legend */}
      <div className="flex gap-3 flex-wrap text-xs text-[var(--text-muted)]">
        {Object.entries(STATUS_VARIANT).map(([status, cls]) => (
          <span key={status} className={`px-2 py-0.5 rounded capitalize font-medium ${cls}`}>{status}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Caregiver section (3-step QR invite) ────────────────────────────────────

function CaregiverSection() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  return (
    <div className="space-y-4 pt-4">
      {/* Existing caregiver */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--teal)]/30 bg-[var(--badge-teal-bg)]">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Sarah Thompson</p>
          <p className="text-xs text-[var(--text-muted)]">Parent · Full access · INT-CG-2025-00820</p>
        </div>
        <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-semibold">Active</span>
      </div>

      {step === 0 && (
        <button type="button" onClick={() => setStep(1)}
          className="w-full flex items-center justify-center gap-2 text-sm border border-[var(--border-token)] px-4 py-2.5 rounded-lg hover:border-[var(--teal)] transition-colors text-[var(--text-secondary)]">
          <QrCode className="w-4 h-4" /> Invite another caregiver
        </button>
      )}

      {step === 1 && (
        <div className="border border-[var(--border-token)] rounded-lg p-4 space-y-4">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Step 1 of 3 — Permissions</p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Under GDPR Art. 9, sharing health data with a caregiver requires your explicit consent. Choose their access level.
          </p>
          <div className="space-y-2">
            {(['Full access', 'Limited — questionnaires only', 'Read-only'] as const).map((level) => (
              <label key={level} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="caregiver-level" className="accent-[var(--teal)]" />
                {level}
              </label>
            ))}
          </div>
          <div>
            <label htmlFor="cg-expiry" className="text-xs text-[var(--text-muted)] block mb-1">Access expiry (optional)</label>
            <input id="cg-expiry" type="date" className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(0)} className="flex-1 py-2 rounded-lg border border-[var(--border-token)] text-sm">Cancel</button>
            <button type="button" onClick={() => setStep(2)} className="flex-1 py-2 rounded-lg bg-[var(--navy)] text-white text-sm font-medium">Next →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="border border-[var(--border-token)] rounded-lg p-4 space-y-4">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Step 2 of 3 — Share invite</p>
          <div className="bg-[var(--bg-surface)] rounded-lg p-6 flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-24 h-24 text-[var(--navy)] mx-auto mb-2" />
              <p className="text-xs text-[var(--text-muted)]">QR code — expires in 24 hours</p>
            </div>
          </div>
          <p className="text-xs text-center text-[var(--text-muted)]">Or share the link below:</p>
          <div className="flex gap-2">
            <input readOnly value="https://app.interactium.io/caregiver/invite/abc123" className="flex-1 text-xs px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] text-[var(--text-muted)]" aria-label="Invite link" />
            <button type="button" onClick={() => toast.success('Link copied')} className="text-xs px-3 py-2 rounded-lg bg-[var(--badge-navy-bg)] text-[var(--blue)] font-medium">Copy</button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="flex-1 py-2 rounded-lg border border-[var(--border-token)] text-sm">Back</button>
            <button type="button" onClick={() => setStep(3)} className="flex-1 py-2 rounded-lg bg-[var(--teal)] text-white text-sm font-medium">Done</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="border border-teal-200 rounded-lg p-4 bg-[var(--badge-teal-bg)] flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Invite sent</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              When your caregiver accepts, their access will appear here. You can revoke at any time.
            </p>
            <button type="button" onClick={() => setStep(0)} className="text-xs text-[var(--teal)] mt-2 hover:underline">Invite another</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked ? 'true' : 'false'}
        onClick={onChange}
        className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-[var(--teal)]' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? 'left-[22px]' : 'left-[3px]'}`} />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}

function featureLabel(key: string): string {
  const map: Record<string, string> = {
    pushNotifications: 'Push notifications',
    trialsFinder: 'Clinical trials finder',
    knowledgeHub: 'Knowledge hub',
    wearables: 'Wearable device sync',
    tagsLifeEvents: 'Life events & tags',
    compareObservations: 'Compare observations',
    fairCatalogue: 'FAIR data catalogue',
  };
  return map[key] ?? key;
}

function featureDesc(key: string): string {
  const map: Record<string, string> = {
    pushNotifications: 'Browser / app push notifications',
    trialsFinder: 'Discover matched FSHD clinical trials',
    knowledgeHub: 'Education and research articles',
    wearables: 'Apple Health, Fitbit, Garmin integration',
    tagsLifeEvents: 'Log life events alongside your health data',
    compareObservations: 'Side-by-side metric comparison charts',
    fairCatalogue: 'View and manage your FAIR data assets',
  };
  return map[key] ?? '';
}
