import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen, Mail } from 'lucide-react';

const FAQS = [
  {
    q: 'What is TREAT-NMD?',
    a: 'TREAT-NMD is a global network of patient registries and research infrastructure for neuromuscular diseases. Your data contributes to international research that helps develop new treatments for conditions like FSHD.',
  },
  {
    q: 'How is my data protected?',
    a: 'Your health data is special category data under GDPR Article 9 and requires your explicit consent to be processed. Your identity is separated from your research data using a Pseudonymised Subject Identifier (PSI token), and you can withdraw consent at any time.',
  },
  {
    q: 'What are PROMs?',
    a: 'Patient-Reported Outcome Measures (PROMs) are validated questionnaires you complete yourself to measure your health from your own perspective. They include instruments like PROMIS Fatigue, INQoL, and EQ-5D. Your clinician or the system may schedule these periodically.',
  },
  {
    q: 'How do I change my consent settings?',
    a: 'Go to Settings → Consent & Privacy, or visit the Consent Management page directly. You can review, update, or withdraw any consent at any time. Withdrawing research consent does not affect your clinical care.',
  },
  {
    q: 'How do I invite a caregiver?',
    a: 'Go to Settings → Caregiver & Family Access and click "Invite another caregiver". You can set their access level and an optional expiry date. They will receive a QR code or link to accept the invitation.',
  },
  {
    q: 'What do the data health rings mean?',
    a: 'The rings show how complete and up-to-date your five key data areas are. Teal means complete, amber means you need to take action, and grey with a clock means the system or clinic is waiting on something. Click "How to improve my scores" on the Dashboard for specific guidance.',
  },
  {
    q: 'How do I export my data?',
    a: 'Go to My Health Data → Data Export (or visit /health/export). You can download your data in CSV, JSON, or FHIR R4 format. This is your right of access under GDPR Article 15.',
  },
  {
    q: 'How does trial matching work?',
    a: 'Interactium compares your clinical profile (condition, location, age, key measures) against registered FSHD trials on ClinicalTrials.gov. Trials marked "Eligible" match your current profile. You can express interest and we will notify the study team.',
  },
];

const PALADIN_FAQS = [
  {
    q: 'What is PaLaDín?',
    a: 'PaLaDín (Participatory, Longitudinal and Digital) is the research programme that powers Interactium. It is an NIHR-funded initiative designed to collect longitudinal patient-reported and wearable data to support neuromuscular disease research, registry submissions, and clinical trial readiness.',
  },
  {
    q: 'How is PaLaDín different from TREAT-NMD?',
    a: 'TREAT-NMD is the global registry infrastructure that stores and shares your anonymised data with the international research community. PaLaDín is the digital platform and programme through which you interact — capturing your data, presenting insights, and facilitating your participation. Think of TREAT-NMD as the destination and PaLaDín as the pathway.',
  },
  {
    q: 'What research does PaLaDín support?',
    a: 'PaLaDín supports longitudinal research into neuromuscular diseases including FSHD, Myotonic Dystrophy, and DMD. Your data is used to understand disease progression, validate digital outcome measures, assess the impact of interventions, and support regulatory submissions for new therapies.',
  },
  {
    q: 'Is my data used in PaLaDín research?',
    a: 'Only if you have provided explicit research consent. You control exactly which data categories are shared and for what purposes via your Consent & Privacy settings. You can review or withdraw any consent at any time without affecting your clinical care.',
  },
  {
    q: 'Who funds and governs PaLaDín?',
    a: 'PaLaDín is funded by the National Institute for Health and Care Research (NIHR) and governed by a patient and public involvement (PPI) group alongside the research team. Data governance follows NHS DSPT standards and GDPR requirements for special category health data.',
  },
];

const QUICK_LINKS = [
  { label: 'Getting started', href: '/dashboard' },
  { label: 'Questionnaires & PROMs', href: '/health/prom-history' },
  { label: 'Privacy & consent', href: '/consent' },
  { label: 'Glossary of terms', href: '/help/glossary' },
  { label: 'Diagnostics', href: '/diagnostics' },
];

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="space-y-8 max-w-3xl pb-8">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Help &amp; Support</h1>
        <p className="text-sm text-[var(--text-secondary)]">Answers to common questions about Interactium and your health data.</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {QUICK_LINKS.map(({ label, href }) => (
          <Link key={href} to={href}
            className="flex items-center gap-2 p-3 bg-[var(--bg-white)] rounded-lg border border-[var(--border-token)] hover:border-[var(--teal)] text-sm font-medium text-[var(--blue)] transition-colors">
            <BookOpen className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            {label}
          </Link>
        ))}
      </div>

      {/* FAQ accordion */}
      <FaqSection title="Frequently asked questions" faqs={FAQS} prefix="gen" openFaq={openFaq} setOpenFaq={setOpenFaq} />

      {/* PaLaDín section */}
      <FaqSection title="About PaLaDín" faqs={PALADIN_FAQS} prefix="pal" openFaq={openFaq} setOpenFaq={setOpenFaq} />

      {/* Contact section */}
      <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--badge-teal-bg)] flex items-center justify-center text-[var(--teal)] shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Contact the TREAT-NMD registry</p>
            <p className="text-xs text-[var(--text-secondary)] mb-2 leading-relaxed">
              For questions about your registry data, consent, or research participation, contact the registry team directly.
            </p>
            <a href="mailto:registry@treat-nmd.eu"
              className="text-xs text-[var(--teal)] font-medium hover:underline">
              registry@treat-nmd.eu
            </a>
            <p className="text-xs text-[var(--text-muted)] mt-1">Expected response time: 2–5 working days</p>
          </div>
        </div>
      </div>

      {/* Privacy FAQ link */}

      <p className="text-xs text-[var(--text-muted)]">
        For detailed privacy information, see{' '}
        <Link to="/consent" className="text-[var(--blue)] hover:underline">Consent & Privacy settings →</Link>
      </p>
    </div>
  );
}

function FaqSection({
  title, faqs, prefix, openFaq, setOpenFaq,
}: {
  title: string;
  faqs: { q: string; a: string }[];
  prefix: string;
  openFaq: string | null;
  setOpenFaq: (key: string | null) => void;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">{title}</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => {
          const key = `${prefix}-${i}`;
          const isOpen = openFaq === key;
          return (
            <div key={key} className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : key)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--bg-surface)] transition-colors"
              >
                <span className="text-sm font-medium text-[var(--text-primary)] pr-4">{faq.q}</span>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-[var(--border-token)]">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-3">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
