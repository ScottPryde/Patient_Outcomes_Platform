import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConsent } from '../../contexts/ConsentContext';
import { useUiStore, PatientMode } from '../../store/uiStore';
import { ModeSelector } from '../../components/onboarding/ModeSelector';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

const STEPS = ['Welcome', 'Your experience', 'Consent', 'Profile', 'Ready'] as const;

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { consents, hasRequiredConsents, acceptConsent, declineConsent, isLoading: consentLoading } = useConsent();
  const { setPatientMode } = useUiStore();

  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<PatientMode | null>('tracker');

  // Consent step state — no pre-ticking per GDPR Art. 7
  const [platformAccepted, setPlatformAccepted] = useState(false);
  const [researchOptIn, setResearchOptIn] = useState(false);
  const [commsOptIn, setCommsOptIn] = useState(false);
  const [expandedConsent, setExpandedConsent] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!consentLoading && user && hasRequiredConsents()) {
      navigate('/dashboard', { replace: true });
    }
  }, [consentLoading, user, hasRequiredConsents, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--border-token)] border-t-[var(--teal)]" />
      </div>
    );
  }

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      if (selectedMode) setPatientMode(selectedMode);

      const platformConsent = consents.find((c) => c.id === 'consent-platform');
      const researchConsent = consents.find((c) => c.id === 'consent-research');
      const commsConsent = consents.find((c) => c.id === 'consent-comms');

      if (platformConsent && platformAccepted) {
        await acceptConsent(platformConsent.id);
      }
      if (researchConsent) {
        if (researchOptIn) await acceptConsent(researchConsent.id);
        else await declineConsent(researchConsent.id);
      }
      if (commsConsent) {
        if (commsOptIn) await acceptConsent(commsConsent.id);
        else await declineConsent(commsConsent.id);
      }

      navigate('/dashboard', { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  const platformConsent = consents.find((c) => c.id === 'consent-platform');
  const researchConsent = consents.find((c) => c.id === 'consent-research');
  const commsConsent = consents.find((c) => c.id === 'consent-comms');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[linear-gradient(135deg,#0f172a_0%,#1e3a5f_60%,#0b4d43_100%)]">
      <div className="w-full max-w-[640px] bg-[var(--bg-white)] rounded-[var(--radius-modal)] shadow-2xl p-6 md:p-8">

        {/* Step progress */}
        <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-1">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5 shrink-0">
              <div
                className={[
                  'h-1.5 rounded-full transition-all',
                  i === step ? 'w-8 bg-[var(--teal)]' : i < step ? 'w-5 bg-[var(--teal)]/50' : 'w-5 bg-[var(--border-token)]',
                ].join(' ')}
              />
              <span className={`text-xs ${i === step ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-[var(--teal)] uppercase tracking-wider mb-2">
                TREAT-NMD / PaLaDín FSHD Platform
              </p>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Good to meet you, {user.firstName}.
              </h1>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                This takes about <strong>4 minutes</strong>. We'll set up your experience, capture consent, and get your dashboard ready for PROMs, health tracking, and registry participation.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 py-2">
              {[
                { n: '65,750+', l: 'Patients enrolled' },
                { n: '44', l: 'Active studies' },
                { n: '40+', l: 'Countries' },
              ].map(({ n, l }) => (
                <div key={l} className="text-center p-3 bg-[var(--bg-surface)] rounded-lg">
                  <div className="font-bold text-[var(--navy)] text-lg">{n}</div>
                  <div className="text-xs text-[var(--text-muted)]">{l}</div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setStep(1)}
              className="w-full py-3 rounded-lg bg-[var(--navy)] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 min-h-11">
              Get started <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 1: Mode selector ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                How do you want to use this platform?
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Choose a mode that fits how you think about your health. You can change this any time in Settings.
              </p>
            </div>
            <ModeSelector value={selectedMode} onChange={setSelectedMode} />
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setStep(0)}
                className="flex-1 py-2.5 rounded-lg border border-[var(--border-token)] text-sm flex items-center justify-center gap-1.5 hover:bg-[var(--bg-surface)] min-h-11">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button type="button" onClick={() => setStep(2)} disabled={!selectedMode}
                className="flex-1 py-2.5 rounded-lg bg-[var(--navy)] text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-40 min-h-11">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Consent (GDPR Art. 7 / Art. 9 compliant) ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                Consent &amp; privacy
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Under GDPR Article 9, we need your explicit consent to process health data. Required items keep the platform working; optional items are your choice.
              </p>
            </div>

            {/* Required section */}
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Required to use this platform
              </p>
              {platformConsent && (
                <ConsentItem
                  id={platformConsent.id}
                  title={platformConsent.title}
                  summary="Allows us to process your health data to run this platform and contribute to the TREAT-NMD registry."
                  fullText={platformConsent.content}
                  required
                  checked={platformAccepted}
                  expanded={expandedConsent === platformConsent.id}
                  onToggleExpand={() => setExpandedConsent(expandedConsent === platformConsent.id ? null : platformConsent.id)}
                  onChange={setPlatformAccepted}
                  articleCite="GDPR Art. 9(2)(a)"
                />
              )}
            </div>

            {/* Optional section */}
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Optional — your choice
              </p>
              <div className="space-y-3">
                {researchConsent && (
                  <ConsentItem
                    id={researchConsent.id}
                    title={researchConsent.title}
                    summary="Lets your pseudonymised data be used in approved NMD research studies. You can see exactly who accesses it."
                    fullText={researchConsent.content}
                    checked={researchOptIn}
                    expanded={expandedConsent === researchConsent.id}
                    onToggleExpand={() => setExpandedConsent(expandedConsent === researchConsent.id ? null : researchConsent.id)}
                    onChange={setResearchOptIn}
                    articleCite="GDPR Art. 9(2)(j)"
                  />
                )}
                {commsConsent && (
                  <ConsentItem
                    id={commsConsent.id}
                    title={commsConsent.title}
                    summary="Questionnaire reminders, appointment alerts, and trial match notifications. Configurable in Settings."
                    fullText={commsConsent.content}
                    checked={commsOptIn}
                    expanded={expandedConsent === commsConsent.id}
                    onToggleExpand={() => setExpandedConsent(expandedConsent === commsConsent.id ? null : commsConsent.id)}
                    onChange={setCommsOptIn}
                  />
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-lg border border-[var(--border-token)] text-sm flex items-center justify-center gap-1.5 hover:bg-[var(--bg-surface)] min-h-11">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button type="button"
                onClick={() => {
                  setResearchOptIn(false);
                  setCommsOptIn(false);
                  setStep(3);
                }}
                disabled={!platformAccepted}
                className="flex-1 py-2.5 rounded-lg border border-[var(--teal)] text-[var(--teal)] text-sm font-medium hover:bg-teal-50 disabled:opacity-40 min-h-11">
                Required only
              </button>
              <button type="button" onClick={() => setStep(3)} disabled={!platformAccepted}
                className="flex-1 py-2.5 rounded-lg bg-[var(--teal)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 min-h-11">
                Accept all
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] text-center">
              You can review and change your consent at any time in Settings → Consent &amp; Privacy.
            </p>
          </div>
        )}

        {/* ── Step 3: Profile ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Your profile</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Pre-filled from your account. You can update this later in Settings.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First name" value={user.firstName} readOnly />
              <FormField label="Last name" value={user.lastName} readOnly />
              <FormField label="Date of birth" value={user.dateOfBirth ?? '—'} readOnly />
              <FormField label="Condition" value="FSHD" readOnly />
            </div>
            <FormField label="Registry" value="TREAT-NMD / PaLaDín FSHD (FSHD_0001)" readOnly />
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-lg border border-[var(--border-token)] text-sm flex items-center justify-center gap-1.5 min-h-11">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button type="button" onClick={() => setStep(4)}
                className="flex-1 py-2.5 rounded-lg bg-[var(--navy)] text-white text-sm font-semibold hover:opacity-90 min-h-11 flex items-center justify-center gap-1.5">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Ready ── */}
        {step === 4 && (
          <div className="space-y-5 text-center">
            <CheckCircle2 className="w-14 h-14 text-[var(--teal)] mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                You're all set, {user.firstName}!
              </h1>
              <p className="text-[var(--text-secondary)]">
                Your dashboard is ready. We'll check in with contextual tips as you explore — no overwhelming tour.
              </p>
            </div>
            <div className="text-left bg-[var(--bg-surface)] rounded-lg p-4 space-y-2">
              <Summary label="Experience mode" value={selectedMode ? capitalize(selectedMode) : '—'} />
              <Summary label="Platform consent" value={platformAccepted ? 'Accepted' : 'Pending'} ok={platformAccepted} />
              <Summary label="Research use" value={researchOptIn ? 'Opted in' : 'Declined'} />
              <Summary label="Notifications" value={commsOptIn ? 'Opted in' : 'Declined'} />
            </div>
            <button type="button" onClick={handleFinish} disabled={isSaving || !platformAccepted}
              className="w-full py-3 rounded-lg bg-[var(--navy)] text-white font-semibold hover:opacity-90 disabled:opacity-50 min-h-11">
              {isSaving ? 'Saving…' : 'Go to my dashboard'}
            </button>
            {!platformAccepted && (
              <p className="text-xs text-red-500">
                You need to accept the required platform consent to continue. <button type="button" className="underline" onClick={() => setStep(2)}>Go back</button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ConsentItem({
  id, title, summary, fullText, required, checked, expanded, onToggleExpand, onChange, articleCite,
}: {
  id: string;
  title: string;
  summary: string;
  fullText?: string;
  required?: boolean;
  checked: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onChange: (v: boolean) => void;
  articleCite?: string;
}) {
  return (
    <div className={`rounded-lg border p-4 transition-colors ${checked ? 'border-[var(--teal)] bg-teal-50/40' : 'border-[var(--border-token)] bg-[var(--bg-surface)]'}`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[var(--teal)]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
            {required && (
              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Required</span>
            )}
            {articleCite && (
              <span className="text-xs text-[var(--text-muted)]">{articleCite}</span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{summary}</p>
          {fullText && (
            <button type="button" onClick={(e) => { e.preventDefault(); onToggleExpand(); }}
              className="text-xs text-[var(--teal)] hover:underline mt-1">
              {expanded ? 'Hide full text ▲' : 'Learn more ▼'}
            </button>
          )}
          {expanded && fullText && (
            <div className="mt-2 max-h-40 overflow-y-auto text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap border-t border-[var(--border-token)] pt-2">
              {fullText}
            </div>
          )}
        </div>
      </label>
    </div>
  );
}

function FormField({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div>
      <label htmlFor={fieldId} className="block text-xs font-medium text-[var(--text-muted)] mb-1">{label}</label>
      <input
        id={fieldId}
        type="text"
        value={value}
        readOnly={readOnly}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40"
      />
    </div>
  );
}

function Summary({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className={`font-medium ${ok === false ? 'text-amber-600' : 'text-[var(--text-primary)]'}`}>{value}</span>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
