import { useState, useMemo } from 'react';
import { Search, Send } from 'lucide-react';
import { toast } from 'sonner';

type GlossaryCategory = 'Clinical' | 'PROMs' | 'Research & Registry' | 'Platform' | 'Abbreviations';

interface GlossaryTerm {
  term: string;
  category: GlossaryCategory;
  definition: string;
  link?: string;
}

const TERMS: GlossaryTerm[] = [
  // Clinical
  { term: '6MWT (Six-Minute Walk Test)', category: 'Clinical', definition: 'Measures walking endurance over 6 minutes; used to track functional mobility in neuromuscular disease. Higher distance = better.' },
  { term: 'FVC% Predicted', category: 'Clinical', definition: 'Forced Vital Capacity as a percentage of the expected value for your age, height and sex. Measures respiratory muscle strength. Higher = better.' },
  { term: 'Grip Strength', category: 'Clinical', definition: 'Hand grip force measured in kilograms using a dynamometer. An indicator of upper limb muscle function in FSHD.' },
  { term: 'HRV (Heart Rate Variability)', category: 'Clinical', definition: 'Variation in time between heartbeats (ms). A higher HRV generally indicates better autonomic function and recovery capacity.' },
  { term: 'SpO2', category: 'Clinical', definition: 'Blood oxygen saturation measured as a percentage by pulse oximetry. Values below 95% may indicate a respiratory concern.' },
  { term: 'FSHD', category: 'Clinical', definition: 'Facioscapulohumeral Muscular Dystrophy — a progressive muscle weakness condition primarily affecting the face, shoulders, and upper arms.' },
  { term: 'T-score', category: 'Clinical', definition: 'A standardised score relative to a reference population. For PROMIS instruments, 50 = population average. For fatigue, a lower T-score means less fatigue.' },
  { term: 'NMD', category: 'Clinical', definition: 'Neuromuscular Disease — umbrella term for conditions affecting the muscles, motor neurons, or neuromuscular junction.' },
  { term: 'EMG', category: 'Clinical', definition: 'Electromyography — a test that measures the electrical activity of muscles; used in NMD diagnosis.' },
  // PROMs
  { term: 'INQoL', category: 'PROMs', definition: 'Individualized Neuromuscular Quality of Life questionnaire. A validated disease-specific quality of life tool for people with neuromuscular conditions.' },
  { term: 'PROMIS Fatigue', category: 'PROMs', definition: 'Patient-Reported Outcomes Measurement Information System — Fatigue domain. T-score scale; lower score = less fatigue impact.' },
  { term: 'EQ-5D-5L', category: 'PROMs', definition: 'A generic quality of life instrument with 5 dimensions and a visual analogue scale (0–100, higher = better perceived health).' },
  { term: 'ACTIVLIM', category: 'PROMs', definition: 'A Rasch-built questionnaire measuring activity limitations in neuromuscular conditions.' },
  { term: 'PedsQL', category: 'PROMs', definition: 'Paediatric Quality of Life Inventory — measures health-related quality of life in children and adolescents.' },
  { term: 'LARS score', category: 'PROMs', definition: 'Low Anterior Resection Syndrome score — measures bowel dysfunction following rectal surgery.' },
  { term: 'IIEF', category: 'PROMs', definition: 'International Index of Erectile Function — a validated questionnaire for assessing erectile function.' },
  { term: 'ICIQ', category: 'PROMs', definition: 'International Consultation on Incontinence Questionnaire — measures the impact of urinary incontinence on daily life.' },
  { term: 'FSHD PRO', category: 'PROMs', definition: 'FSHD Patient-Reported Outcome — a disease-specific PROM developed for people with facioscapulohumeral muscular dystrophy.' },
  // Research & Registry
  { term: 'TREAT-NMD', category: 'Research & Registry', definition: 'A global network of patient registries and research infrastructure for neuromuscular diseases. Anna\'s registry is part of this network.' },
  { term: 'PaLaDín', category: 'Research & Registry', definition: 'Participatory, Longitudinal and Digital platform — the NIHR-funded research programme that Interactium supports.' },
  { term: 'GDPR Art. 9', category: 'Research & Registry', definition: 'Article 9 of the EU General Data Protection Regulation covers "special category" data, which includes health information. Requires explicit consent to process.' },
  { term: 'NCT ID', category: 'Research & Registry', definition: 'ClinicalTrials.gov identifier — a unique reference number for each registered clinical trial (e.g. NCT04123456).' },
  { term: 'PSI Token', category: 'Research & Registry', definition: 'Pseudonymised Subject Identifier — your unique research ID that separates your identity from your data to protect privacy.' },
  { term: 'FAIR data', category: 'Research & Registry', definition: 'Findable, Accessible, Interoperable, Reusable — principles for making research data as useful as possible for science.' },
  { term: 'NIHR', category: 'Research & Registry', definition: 'National Institute for Health and Care Research — the primary funder of clinical research in England.' },
  { term: 'RCT', category: 'Research & Registry', definition: 'Randomised Controlled Trial — the gold-standard trial design in which participants are randomly assigned to treatment or control groups.' },
  { term: 'Biobank', category: 'Research & Registry', definition: 'A secure repository of biological samples and associated health data used for research purposes.' },
  // Platform
  { term: 'Data Health Rings', category: 'Platform', definition: 'Visual indicators in Interactium showing how complete and up-to-date your health data is. Five rings, each measuring a different dimension. Teal = complete, amber = action needed, grey = waiting on clinic.' },
  { term: 'PROM', category: 'Platform', definition: 'Patient-Reported Outcome Measure — a validated questionnaire you complete yourself to measure your health from your perspective.' },
  { term: 'Navigator mode', category: 'Platform', definition: 'An Interactium experience mode designed for newly-diagnosed patients, focused on education and orientation.' },
  { term: 'Tracker mode', category: 'Platform', definition: 'The full Interactium experience with all charts, trends, and analytics visible. Suitable for engaged patients.' },
  { term: 'Contributor mode', category: 'Platform', definition: 'A research-focused experience showing how your data contributes to research, with gamification and data donation features.' },
  { term: 'Minimalist mode', category: 'Platform', definition: 'A simplified Interactium experience showing only essential tasks and appointments — suitable for those who prefer less information.' },
  { term: 'Blame-aware rings', category: 'Platform', definition: 'Ring states that distinguish between actions you need to take (amber) and those waiting on the system or clinic (grey with clock).' },
  { term: 'Wearable sync', category: 'Platform', definition: 'Automatic transfer of health data from a connected smartwatch or fitness device (e.g. Apple Watch, Garmin, Fitbit) to Interactium.' },
  { term: 'Metric anxiety mode', category: 'Platform', definition: 'A settings option that hides declining metrics to reduce health anxiety, showing only stable or improving scores.' },
  // Abbreviations
  { term: 'BAUS', category: 'Abbreviations', definition: 'British Association of Urological Surgeons.' },
  { term: 'GMC', category: 'Abbreviations', definition: 'General Medical Council — the regulatory body for doctors in the UK.' },
  { term: 'NHS DSPT', category: 'Abbreviations', definition: 'NHS Data Security and Protection Toolkit — the framework all NHS organisations use to demonstrate data security compliance.' },
  { term: 'MDT', category: 'Abbreviations', definition: 'Multi-Disciplinary Team — a group of healthcare professionals from different specialities who collectively manage patient care.' },
  { term: 'PRO / PROM', category: 'Abbreviations', definition: 'Patient-Reported Outcome (Measure) — see PROM above.' },
  { term: 'HCP', category: 'Abbreviations', definition: 'Healthcare Professional.' },
  { term: 'EHR', category: 'Abbreviations', definition: 'Electronic Health Record — a digital version of a patient\'s medical history.' },
];

const CATEGORIES: (GlossaryCategory | 'All')[] = ['All', 'Clinical', 'PROMs', 'Research & Registry', 'Platform', 'Abbreviations'];
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<GlossaryCategory | 'All'>('All');
  const [suggestTerm, setSuggestTerm] = useState('');
  const [suggestDef, setSuggestDef] = useState('');

  const filtered = useMemo(() => {
    let terms = TERMS;
    if (category !== 'All') terms = terms.filter((t) => t.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      terms = terms.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
    }
    return [...terms].sort((a, b) => a.term.localeCompare(b.term));
  }, [search, category]);

  const byLetter = useMemo(() => {
    const map: Record<string, GlossaryTerm[]> = {};
    for (const t of filtered) {
      const letter = t.term[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(t);
    }
    return map;
  }, [filtered]);

  const activeLetters = new Set(Object.keys(byLetter));

  const handleSuggest = () => {
    if (!suggestTerm.trim()) return;
    toast.success('Thanks! Your suggestion has been submitted.');
    setSuggestTerm('');
    setSuggestDef('');
  };

  const CATEGORY_COLOUR: Record<GlossaryCategory, string> = {
    'Clinical': 'bg-[var(--badge-navy-bg)] text-[var(--blue)]',
    'PROMs': 'bg-[var(--badge-vault-bg)] text-[var(--purple)]',
    'Research & Registry': 'bg-[var(--priority-low-bg)] text-[var(--priority-low-text)]',
    'Platform': 'bg-[var(--badge-teal-bg)] text-[var(--teal)]',
    'Abbreviations': 'bg-[var(--badge-neutral-bg)] text-[var(--text-secondary)]',
  };

  return (
    <div className="space-y-5 pb-8 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Glossary</h1>
        <p className="text-sm text-[var(--text-secondary)]">Clinical, research, and platform terms explained.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search terms and definitions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${category === c ? 'bg-[var(--teal)] text-white border-[var(--teal)]' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-[var(--teal)]'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* A–Z index */}
      <div className="flex gap-1 flex-wrap text-xs">
        {ALPHA.map((l) => (
          <a key={l} href={`#letter-${l}`}
            className={`w-6 h-6 flex items-center justify-center rounded font-medium transition-colors ${activeLetters.has(l) ? 'text-[var(--teal)] hover:bg-[var(--state-active-bg)]' : 'text-[var(--text-faint)] cursor-default'}`}>
            {l}
          </a>
        ))}
      </div>

      {/* Terms */}
      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] py-8 text-center">No matching terms found.</p>
      ) : (
        <div className="space-y-6">
          {ALPHA.filter((l) => byLetter[l]).map((letter) => (
            <div key={letter} id={`letter-${letter}`}>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 border-b border-[var(--border-token)] pb-1">
                {letter}
              </p>
              <div className="space-y-3">
                {byLetter[letter].map((t) => (
                  <div key={t.term} className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{t.term}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${CATEGORY_COLOUR[t.category]}`}>
                          {t.category}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{t.definition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggest a term */}
      <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4 space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Suggest a missing term</p>
        <input type="text" placeholder="Term name" value={suggestTerm} onChange={(e) => setSuggestTerm(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40" />
        <textarea placeholder="Suggested definition (optional)" value={suggestDef} onChange={(e) => setSuggestDef(e.target.value)}
          rows={2} className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40 resize-none" />
        <button type="button" onClick={handleSuggest}
          className="flex items-center gap-1.5 text-sm bg-[var(--teal)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Send className="w-3.5 h-3.5" /> Submit suggestion
        </button>
      </div>
    </div>
  );
}
