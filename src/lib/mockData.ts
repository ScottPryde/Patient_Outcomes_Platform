import {
  User,
  Consent,
  UserConsent,
  Questionnaire,
  QuestionnaireResponse,
  ClinicalTrial,
  ResearchItem,
  Tag,
  Notification,
  PatientMetrics,
} from '../types';

// ─── Demo patient: Anna Thompson · PSI-4A7F-2C91 · FSHD · Newcastle RVI ───────

export const mockUsers: User[] = [
  {
    id: 'user-anna-thompson',
    email: 'anna.thompson@demo.interactium.io',
    firstName: 'Anna',
    lastName: 'Thompson',
    role: 'patient',
    dateOfBirth: '1998-07-14',
    phone: '+44 7700 900142',
    createdAt: '2025-11-01T09:00:00Z',
    preferences: {
      notifications: { email: true, push: true, sms: false },
      accessibility: { highContrast: false, largeText: false, reducedMotion: false },
      theme: 'light',
    },
    gamification: {
      points: 1480,
      level: 4,
      badges: ['first-prom', 'streak-7', 'wearable-linked', 'registry-enrolled'],
      curiosityScore: 72,
      completedEducation: ['fshd-basics', 'understanding-proms', 'wearable-setup'],
    },
  },
  {
    id: 'user-sarah-thompson',
    email: 'sarah.thompson@demo.interactium.io',
    firstName: 'Sarah',
    lastName: 'Thompson',
    role: 'caregiver',
    dateOfBirth: '1968-03-22',
    phone: '+44 7700 900143',
    createdAt: '2025-11-05T09:00:00Z',
    preferences: {
      notifications: { email: true, push: true, sms: true },
      accessibility: { highContrast: false, largeText: false, reducedMotion: false },
      theme: 'light',
    },
  },
  {
    id: 'user-dr-patterson',
    email: 'r.patterson@nuth.nhs.uk',
    firstName: 'Dr. R.',
    lastName: 'Patterson',
    role: 'clinician',
    phone: '+44 191 213 7878',
    createdAt: '2024-01-01T00:00:00Z',
    preferences: {
      notifications: { email: true, push: false, sms: false },
      accessibility: { highContrast: false, largeText: false, reducedMotion: false },
      theme: 'light',
    },
  },
];

// ─── Demo profile extras (not in User type but used by dashboard) ─────────────

export const demoPseudoId = 'PSI-4A7F-2C91';
export const demoCondition = 'Facioscapulohumeral Muscular Dystrophy (FSHD)';
export const demoMode = 'tracker' as const;
export const demoRegistryId = 'FSHD_0001';
export const demoRegistry = 'TREAT-NMD / PaLaDín FSHD';
export const demoClinician = 'Dr. R. Patterson';
export const demoClinic = 'Neuromuscular Clinic · Newcastle RVI';
export const demoNextAppointment = {
  date: '2026-04-08',
  time: '10:30',
  type: 'In person',
  clinician: 'Dr. R. Patterson',
  clinic: 'Neuromuscular Clinic · Newcastle RVI',
};

export const demoCaregiverLink = {
  id: 'INT-CG-2025-00820',
  name: 'Sarah Thompson',
  relationship: 'Parent',
  accessLevel: 'full' as const,
  status: 'approved' as const,
};

export const demoStats = {
  sixMWT: { value: 312, unit: 'm', change: +8, trend: 'up' as const },
  grip: { value: 18, unit: 'kg', change: 0, trend: 'stable' as const },
  fatigue: { value: 42, unit: '/100', change: -5, trend: 'up' as const, lowerIsBetter: true },
  mood: { value: 6.8, unit: '/10', change: +0.4, trend: 'up' as const },
};

export const demoRings = {
  healthObservation: { value: 79, state: 'amber' as const, label: 'Health Observation' },
  outcomeReporting: { value: 83, state: 'teal' as const, label: 'Outcome Reporting' },
  clinicalRegistry: { value: 75, state: 'amber' as const, label: 'Clinical Registry' },
  clinicalTrials: { value: 60, state: 'grey' as const, label: 'Clinical Trials' },
  research: { value: 72, state: 'teal' as const, label: 'Research' },
  dataImpact: { value: 88, state: 'teal' as const, label: 'Data Impact' },
};

// ─── Consents (GDPR Art. 9 compliant) ─────────────────────────────────────────

export const mockConsents: Consent[] = [
  {
    id: 'consent-platform',
    type: 'data-use',
    version: '3.0',
    title: 'Platform Participation',
    description: 'Required to use the Interactium platform and contribute data to your registry.',
    content: `# Platform Participation Consent (GDPR Art. 9)

Processing your health data requires your explicit consent under GDPR Article 9.

## What we collect
- Questionnaire responses and symptom reports
- Wearable device data (steps, HRV, sleep, SpO2)
- Registry submissions (TREAT-NMD / PaLaDín FSHD)

## How we protect it
All data is encrypted at rest using AES-256-GCM and held within the UK/EEA.

## Your rights
- **Access** (Art. 15) — request a copy of your data at any time
- **Rectification** (Art. 16) — correct inaccurate data
- **Erasure** (Art. 17) — request deletion of your account and data
- **Portability** (Art. 20) — export your data in machine-readable format

You can withdraw consent at any time. Withdrawal does not affect the lawfulness of prior processing.`,
    required: true,
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'consent-research',
    type: 'research-participation',
    version: '2.1',
    title: 'Secondary Research Use',
    description: 'Optional: allow your pseudonymised data to be used in approved NMD research studies.',
    content: `# Secondary Research Use Consent (Optional)

Your pseudonymised data may contribute to approved studies in neuromuscular disease.

## What this means
- Data is pseudonymised — your name is removed and replaced with your PSI token
- Only approved studies by the TREAT-NMD data access committee can access it
- You can see exactly who accessed your data in Settings → My Data Catalogue

## You can opt out at any time
Opting out stops future use; data already analysed as part of a published study cannot be removed.`,
    required: false,
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'consent-comms',
    type: 'pro-reporting',
    version: '1.2',
    title: 'Notifications & Communications',
    description: 'Optional: receive reminders for questionnaires, trial matches, and clinical updates.',
    content: `# Notifications & Communications Consent (Optional)

We would like to send you:
- Questionnaire due reminders
- Appointment reminders
- Clinical trial match alerts
- Registry update notices

You can configure frequency and channel (email / push) in Settings → Notifications at any time.`,
    required: false,
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z',
  },
];

export const mockUserConsents: UserConsent[] = [
  {
    id: 'uc-anna-1',
    userId: 'user-anna-thompson',
    consentId: 'consent-platform',
    status: 'accepted',
    acceptedAt: '2025-11-01T10:30:00Z',
    version: '3.0',
  },
  {
    id: 'uc-anna-2',
    userId: 'user-anna-thompson',
    consentId: 'consent-research',
    status: 'accepted',
    acceptedAt: '2025-11-01T10:31:00Z',
    version: '2.1',
  },
  {
    id: 'uc-anna-3',
    userId: 'user-anna-thompson',
    consentId: 'consent-comms',
    status: 'accepted',
    acceptedAt: '2025-11-01T10:31:30Z',
    version: '1.2',
  },
];

// ─── Questionnaires ────────────────────────────────────────────────────────────

export const mockQuestionnaires: Questionnaire[] = [
  {
    id: 'q-inqol',
    title: 'INQoL — Individualised Neuromuscular Quality of Life',
    description: 'FSHD-validated quality of life questionnaire covering activities, independence, social life, emotions, and body image.',
    category: 'Quality of Life',
    estimatedTime: 15,
    schedulingType: 'recurring',
    frequency: 'monthly',
    status: 'active',
    targetRoles: ['patient', 'caregiver'],
    tags: ['validated', 'FSHD', 'quality-of-life', 'INQoL'],
    questions: [
      {
        id: 'inqol-1',
        type: 'likert',
        text: 'My muscle weakness affects my ability to do activities I want to do',
        required: true,
        options: [
          { id: 'a', label: 'Not at all', value: 1, score: 1 },
          { id: 'b', label: 'A little', value: 2, score: 2 },
          { id: 'c', label: 'Moderately', value: 3, score: 3 },
          { id: 'd', label: 'Quite a bit', value: 4, score: 4 },
          { id: 'e', label: 'A great deal', value: 5, score: 5 },
        ],
        order: 1,
      },
      {
        id: 'inqol-2',
        type: 'likert',
        text: 'I feel self-conscious about my appearance due to FSHD',
        required: true,
        options: [
          { id: 'a', label: 'Not at all', value: 1, score: 1 },
          { id: 'b', label: 'A little', value: 2, score: 2 },
          { id: 'c', label: 'Moderately', value: 3, score: 3 },
          { id: 'd', label: 'Quite a bit', value: 4, score: 4 },
          { id: 'e', label: 'A great deal', value: 5, score: 5 },
        ],
        order: 2,
      },
      {
        id: 'inqol-3',
        type: 'visual-analog-scale',
        text: 'Overall, how would you rate your quality of life today?',
        description: '0 = worst imaginable, 100 = best imaginable',
        required: true,
        validation: { min: 0, max: 100 },
        order: 3,
      },
      {
        id: 'inqol-4',
        type: 'textarea',
        text: 'Is there anything else you\'d like to share about how FSHD is affecting your life this month?',
        required: false,
        order: 4,
      },
    ],
    scoringLogic: {
      type: 'average',
      ranges: [
        { min: 0, max: 2, label: 'Low impact', severity: 'low', color: '#14b8a6' },
        { min: 2.1, max: 3.5, label: 'Moderate impact', severity: 'moderate', color: '#f59e0b' },
        { min: 3.6, max: 5, label: 'High impact', severity: 'high', color: '#ef4444' },
      ],
    },
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'q-promis-fatigue',
    title: 'PROMIS Fatigue — Short Form 8a',
    description: '8-item validated fatigue measure. T-score of 50 = average for general population; lower is better.',
    category: 'Fatigue',
    estimatedTime: 5,
    schedulingType: 'recurring',
    frequency: 'monthly',
    status: 'active',
    targetRoles: ['patient'],
    tags: ['PROMIS', 'fatigue', 'validated', 'T-score'],
    questions: [
      {
        id: 'pf-1',
        type: 'likert',
        text: 'I feel fatigued',
        description: 'In the past 7 days…',
        required: true,
        options: [
          { id: 'a', label: 'Never', value: 1, score: 1 },
          { id: 'b', label: 'Rarely', value: 2, score: 2 },
          { id: 'c', label: 'Sometimes', value: 3, score: 3 },
          { id: 'd', label: 'Often', value: 4, score: 4 },
          { id: 'e', label: 'Always', value: 5, score: 5 },
        ],
        order: 1,
      },
      {
        id: 'pf-2',
        type: 'likert',
        text: 'I have trouble starting things because I am tired',
        description: 'In the past 7 days…',
        required: true,
        options: [
          { id: 'a', label: 'Never', value: 1, score: 1 },
          { id: 'b', label: 'Rarely', value: 2, score: 2 },
          { id: 'c', label: 'Sometimes', value: 3, score: 3 },
          { id: 'd', label: 'Often', value: 4, score: 4 },
          { id: 'e', label: 'Always', value: 5, score: 5 },
        ],
        order: 2,
      },
      {
        id: 'pf-3',
        type: 'likert',
        text: 'How run-down did you feel on average?',
        description: 'In the past 7 days…',
        required: true,
        options: [
          { id: 'a', label: 'Not at all', value: 1, score: 1 },
          { id: 'b', label: 'A little bit', value: 2, score: 2 },
          { id: 'c', label: 'Somewhat', value: 3, score: 3 },
          { id: 'd', label: 'Quite a bit', value: 4, score: 4 },
          { id: 'e', label: 'Very much', value: 5, score: 5 },
        ],
        order: 3,
      },
    ],
    scoringLogic: {
      type: 'weighted',
      ranges: [
        { min: 0, max: 40, label: 'Better than average', severity: 'low', color: '#14b8a6' },
        { min: 40.1, max: 60, label: 'Average fatigue', severity: 'moderate', color: '#f59e0b' },
        { min: 60.1, max: 100, label: 'Above average fatigue', severity: 'high', color: '#ef4444' },
      ],
    },
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'q-fshd-prom',
    title: 'FSHD PRO v2 — Patient-Reported Outcomes',
    description: 'Disease-specific outcome measure for FSHD covering upper limb function, lower limb function, and breathing.',
    category: 'Disease-Specific',
    estimatedTime: 12,
    schedulingType: 'recurring',
    frequency: 'quarterly',
    status: 'active',
    targetRoles: ['patient'],
    tags: ['FSHD', 'disease-specific', 'function', 'validated'],
    questions: [
      {
        id: 'fpro-1',
        type: 'likert',
        text: 'I can raise my arms above my head',
        required: true,
        options: [
          { id: 'a', label: 'Yes, easily', value: 4, score: 4 },
          { id: 'b', label: 'Yes, with some difficulty', value: 3, score: 3 },
          { id: 'c', label: 'Yes, with great difficulty', value: 2, score: 2 },
          { id: 'd', label: 'No, I cannot', value: 1, score: 1 },
        ],
        order: 1,
      },
      {
        id: 'fpro-2',
        type: 'likert',
        text: 'I can walk on a flat surface without support for at least 10 minutes',
        required: true,
        options: [
          { id: 'a', label: 'Yes, easily', value: 4, score: 4 },
          { id: 'b', label: 'Yes, with some difficulty', value: 3, score: 3 },
          { id: 'c', label: 'Yes, with great difficulty', value: 2, score: 2 },
          { id: 'd', label: 'No, I cannot', value: 1, score: 1 },
        ],
        order: 2,
      },
      {
        id: 'fpro-3',
        type: 'visual-analog-scale',
        text: 'Rate your overall physical function compared to last month',
        description: '0 = much worse, 100 = much better',
        required: true,
        validation: { min: 0, max: 100 },
        order: 3,
      },
    ],
    scoringLogic: {
      type: 'sum',
      ranges: [
        { min: 0, max: 33, label: 'Significant functional limitation', severity: 'high', color: '#ef4444' },
        { min: 34, max: 66, label: 'Moderate functional limitation', severity: 'moderate', color: '#f59e0b' },
        { min: 67, max: 100, label: 'Mild or no functional limitation', severity: 'low', color: '#14b8a6' },
      ],
    },
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'q-eq5d',
    title: 'EQ-5D-5L — Health State Utility',
    description: 'Standard health utility measure used across NHS and clinical trials. Produces a UK population-weighted utility score.',
    category: 'Quality of Life',
    estimatedTime: 5,
    schedulingType: 'recurring',
    frequency: 'quarterly',
    status: 'active',
    targetRoles: ['patient'],
    tags: ['EQ-5D', 'utility', 'validated', 'NHS'],
    questions: [
      {
        id: 'eq-1',
        type: 'multiple-choice',
        text: 'Mobility',
        description: 'Please select the ONE statement that best describes your health TODAY',
        required: true,
        options: [
          { id: 'a', label: 'I have no problems walking about', value: 1, score: 1 },
          { id: 'b', label: 'I have slight problems walking about', value: 2, score: 2 },
          { id: 'c', label: 'I have moderate problems walking about', value: 3, score: 3 },
          { id: 'd', label: 'I have severe problems walking about', value: 4, score: 4 },
          { id: 'e', label: 'I am unable to walk about', value: 5, score: 5 },
        ],
        order: 1,
      },
      {
        id: 'eq-2',
        type: 'multiple-choice',
        text: 'Self-care',
        required: true,
        options: [
          { id: 'a', label: 'I have no problems washing or dressing myself', value: 1, score: 1 },
          { id: 'b', label: 'I have slight problems washing or dressing myself', value: 2, score: 2 },
          { id: 'c', label: 'I have moderate problems washing or dressing myself', value: 3, score: 3 },
          { id: 'd', label: 'I have severe problems washing or dressing myself', value: 4, score: 4 },
          { id: 'e', label: 'I am unable to wash or dress myself', value: 5, score: 5 },
        ],
        order: 2,
      },
      {
        id: 'eq-vas',
        type: 'visual-analog-scale',
        text: 'Your health today',
        description: 'We would like to know how good or bad your health is TODAY. 100 = best health you can imagine, 0 = worst health you can imagine.',
        required: true,
        validation: { min: 0, max: 100 },
        order: 3,
      },
    ],
    scoringLogic: {
      type: 'weighted',
      ranges: [
        { min: 0, max: 0.49, label: 'Poor health state', severity: 'high', color: '#ef4444' },
        { min: 0.5, max: 0.74, label: 'Moderate health state', severity: 'moderate', color: '#f59e0b' },
        { min: 0.75, max: 1, label: 'Good health state', severity: 'low', color: '#14b8a6' },
      ],
    },
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

// ─── Questionnaire Responses (24 completed) ───────────────────────────────────

export const mockQuestionnaireResponses: QuestionnaireResponse[] = [
  {
    id: 'resp-inqol-mar26',
    questionnaireId: 'q-inqol',
    userId: 'user-anna-thompson',
    status: 'completed',
    answers: [
      { questionId: 'inqol-1', value: 3, score: 3, timestamp: '2026-03-12T10:15:00Z' },
      { questionId: 'inqol-2', value: 2, score: 2, timestamp: '2026-03-12T10:16:00Z' },
      { questionId: 'inqol-3', value: 68, timestamp: '2026-03-12T10:18:00Z' },
    ],
    score: 2.5,
    startedAt: '2026-03-12T10:12:00Z',
    completedAt: '2026-03-12T10:22:00Z',
    timeSpent: 600,
  },
  {
    id: 'resp-fpro-mar26',
    questionnaireId: 'q-fshd-prom',
    userId: 'user-anna-thompson',
    status: 'completed',
    answers: [
      { questionId: 'fpro-1', value: 3, score: 3, timestamp: '2026-03-12T10:25:00Z' },
      { questionId: 'fpro-2', value: 4, score: 4, timestamp: '2026-03-12T10:26:00Z' },
      { questionId: 'fpro-3', value: 72, timestamp: '2026-03-12T10:28:00Z' },
    ],
    score: 3.5,
    startedAt: '2026-03-12T10:24:00Z',
    completedAt: '2026-03-12T10:32:00Z',
    timeSpent: 480,
  },
];

// Upcoming questionnaires (due soon)
export const mockUpcomingQuestionnaires = [
  {
    id: 'upcoming-1',
    questionnaireId: 'q-fshd-prom',
    title: 'FSHD PRO v2',
    dueDate: '2026-04-10',
    estimatedTime: 12,
    priority: 'high' as const,
  },
  {
    id: 'upcoming-2',
    questionnaireId: 'q-promis-fatigue',
    title: 'PROMIS Fatigue 8a',
    dueDate: '2026-04-14',
    estimatedTime: 5,
    priority: 'medium' as const,
  },
  {
    id: 'upcoming-3',
    questionnaireId: 'q-eq5d',
    title: 'EQ-5D-5L',
    dueDate: '2026-04-14',
    estimatedTime: 5,
    priority: 'medium' as const,
  },
];

// ─── Clinical Trials (FSHD-specific) ──────────────────────────────────────────

export const mockClinicalTrials: ClinicalTrial[] = [
  {
    id: 'trial-walking-fshd',
    title: 'Walking Analysis Interest in FSHD',
    description: 'Observational study collecting gait analysis and wearable data from ambulatory FSHD patients to establish digital outcome measures for future interventional trials.',
    sponsor: 'University of Oxford · TREAT-NMD',
    phase: 'early-phase-1',
    status: 'recruiting',
    conditions: ['Facioscapulohumeral Muscular Dystrophy', 'FSHD1', 'FSHD2'],
    interventions: ['Observational — no intervention', 'Wearable activity monitor', 'Gait analysis lab visit'],
    eligibilityCriteria: {
      minAge: 16,
      maxAge: 65,
      gender: 'all',
      criteria: [
        'Genetically confirmed FSHD1 or FSHD2',
        'Ambulatory (walks ≥10m unaided)',
        '6MWT ≥ 100m at screening',
        'Willing to wear activity monitor for 4 weeks',
        'No cardiac pacemaker',
      ],
    },
    locations: [
      {
        facility: 'Oxford University Hospitals NHS Foundation Trust',
        city: 'Oxford',
        country: 'UK',
        contactEmail: 'fshd.trials@ouh.nhs.uk',
        contactPhone: '+44 1865 741166',
      },
    ],
    startDate: '2025-09-01',
    endDate: '2027-03-31',
    enrollmentTarget: 80,
    currentEnrollment: 34,
    primaryOutcome: 'Establish validity of wearable-derived daily step count as an outcome measure in FSHD',
    tags: ['FSHD', 'observational', 'wearable', 'digital-outcomes', 'TREAT-NMD'],
    contactInfo: {
      name: 'Dr. Sarah Mullen',
      email: 's.mullen@ndcn.ox.ac.uk',
      phone: '+44 1865 222394',
    },
    followCount: 127,
  },
  {
    id: 'trial-ace083-fshd',
    title: 'Study of ACE-083 in Patients with FSHD',
    description: 'Phase 2 study evaluating the safety and efficacy of ACE-083, a locally-acting muscle agent, to increase muscle volume and strength in FSHD patients.',
    sponsor: 'Acceleron Pharma (A Merck Group Company)',
    phase: 'phase-2',
    status: 'suspended',
    conditions: ['Facioscapulohumeral Muscular Dystrophy', 'FSHD1'],
    interventions: ['ACE-083 (intramuscular injection)', 'Placebo'],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 65,
      gender: 'all',
      criteria: [
        'Genetically confirmed FSHD1',
        'Tibialis anterior CSA ≥ 3 cm² by MRI',
        'FVC ≥ 50% predicted',
        'Ambulatory',
        '6MWT ≥ 200m',
        'No prior treatment with investigational agents within 3 months',
      ],
    },
    locations: [
      {
        facility: 'University College London Hospitals',
        city: 'London',
        country: 'UK',
        contactEmail: 'neuromuscular.research@uclh.nhs.uk',
        contactPhone: '+44 20 3447 9670',
      },
    ],
    startDate: '2023-06-01',
    endDate: '2026-12-31',
    enrollmentTarget: 120,
    currentEnrollment: 89,
    primaryOutcome: 'Change in tibialis anterior muscle volume from baseline to week 24 (MRI)',
    tags: ['FSHD', 'phase-2', 'ACE-083', 'muscle-agent', 'interventional'],
    contactInfo: {
      name: 'Dr. Jasper Moon',
      email: 'j.moon@uclh.nhs.uk',
      phone: '+44 20 3447 9671',
    },
    followCount: 312,
  },
];

// ─── Trial engagement state for Anna ──────────────────────────────────────────

export const demoTrialStates: Record<string, 'saved' | 'following' | 'interested'> = {
  'trial-walking-fshd': 'interested',
  'trial-ace083-fshd': 'saved',
};

// ─── Research items (FSHD-relevant) ───────────────────────────────────────────

export const mockResearchItems: ResearchItem[] = [
  {
    id: 'research-fshd-dux4',
    type: 'drug',
    title: 'DUX4 Silencing Approaches in FSHD: A 2025 Review',
    description: 'Comprehensive review of gene-silencing strategies targeting DUX4 expression in FSHD, including antisense oligonucleotides and small molecules.',
    summary: 'Multiple DUX4-silencing programmes advanced to IND-enabling studies in 2024–25. AON-based approaches show greatest specificity; delivery to affected muscle groups remains the key challenge.',
    authors: ['Dr. S. van der Maarel', 'Dr. D. Padberg', 'Dr. J. Statland'],
    institution: 'FSHD Society Research Consortium',
    publishedDate: '2025-09-15',
    tags: ['FSHD', 'DUX4', 'gene-silencing', 'AON', 'research'],
    relatedConditions: ['FSHD1', 'FSHD2'],
    url: 'https://fshdsociety.org/research',
    followCount: 892,
  },
  {
    id: 'research-fshd-wearable',
    type: 'digital',
    title: 'Wearable Accelerometry as a Digital Outcome Measure in FSHD',
    description: 'Validation study demonstrating that 7-day average daily step count from consumer wearables correlates strongly with 6MWT in FSHD.',
    summary: 'Apple Watch and Fitbit-derived step counts showed ICC > 0.85 correlation with 6MWT and were sensitive to 6-month functional change. Supports use in remote trial endpoints.',
    authors: ['Dr. R. Batten', 'Dr. P. Lunt'],
    institution: 'Newcastle University / TREAT-NMD',
    publishedDate: '2025-11-02',
    tags: ['FSHD', 'wearable', 'digital-outcome', 'accelerometry', 'clinical-trial'],
    relatedConditions: ['FSHD'],
    followCount: 445,
  },
  {
    id: 'research-nmd-registry',
    type: 'publication',
    title: 'TREAT-NMD Global Registry: Five-Year Natural History of FSHD',
    description: 'Analysis of 1,847 FSHD patients enrolled in the global TREAT-NMD registry from 2019–2024, describing natural history, functional progression, and PROM trends.',
    summary: 'Median 6MWT decline was 8m/year; fatigue was the most frequently reported symptom (91%); ACTIVLIM correlated best with functional status. Registry data is now informing trial endpoint selection.',
    authors: ['TREAT-NMD FSHD Working Group'],
    institution: 'TREAT-NMD Network / Newcastle University',
    publishedDate: '2025-07-20',
    tags: ['FSHD', 'registry', 'natural-history', 'TREAT-NMD', 'epidemiology'],
    relatedConditions: ['FSHD1', 'FSHD2'],
    url: 'https://www.treat-nmd.eu/research/registries',
    followCount: 1203,
  },
];

// ─── Tags ─────────────────────────────────────────────────────────────────────

export const mockTags: Tag[] = [
  {
    id: 'tag-fshd',
    name: 'FSHD',
    category: 'condition',
    description: 'Facioscapulohumeral Muscular Dystrophy',
  },
  {
    id: 'tag-nmd',
    name: 'Neuromuscular Disease',
    category: 'therapy-area',
    description: 'Conditions affecting muscles and the nerves that control them',
  },
  {
    id: 'tag-gene-therapy',
    name: 'Gene Therapy',
    category: 'treatment',
    description: 'Treatments targeting gene expression',
  },
  {
    id: 'tag-digital-outcomes',
    name: 'Digital Outcome Measures',
    category: 'modality',
    description: 'Wearable and app-based endpoints for clinical trials',
  },
  {
    id: 'tag-rare-disease',
    name: 'Rare Disease',
    category: 'research-theme',
    description: 'Orphan conditions with prevalence < 1 in 2,000',
  },
  {
    id: 'tag-treat-nmd',
    name: 'TREAT-NMD',
    category: 'research-theme',
    description: 'Global NMD network for translational research',
  },
  {
    id: 'tag-proms',
    name: 'Patient-Reported Outcomes',
    category: 'modality',
    description: 'Validated instruments capturing patient experience',
  },
  {
    id: 'tag-physiotherapy',
    name: 'Physiotherapy',
    category: 'treatment',
    description: 'Physical therapy and rehabilitation',
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: 'notif-prom-due',
    userId: 'user-anna-thompson',
    type: 'questionnaire-reminder',
    title: 'FSHD PRO v2 due in 4 days',
    message: 'Your quarterly FSHD PRO questionnaire is due on 10 April. It takes about 12 minutes.',
    priority: 'high',
    read: false,
    actionUrl: '/questionnaires/q-fshd-prom',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-trial-match',
    userId: 'user-anna-thompson',
    type: 'trial-update',
    title: 'New FSHD trial match: Oxford walking study',
    message: 'A new observational trial at Oxford (63 km away) matches your profile. Anna, you meet 5 of 5 eligibility criteria.',
    priority: 'high',
    read: false,
    actionUrl: '/trials/trial-walking-fshd',
    metadata: { trialId: 'trial-walking-fshd' },
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-appointment',
    userId: 'user-anna-thompson',
    type: 'questionnaire-assigned',
    title: 'Appointment reminder — 8 April 10:30',
    message: 'You have an in-person appointment with Dr. R. Patterson at Newcastle RVI in 20 days.',
    priority: 'medium',
    read: true,
    actionUrl: '/dashboard',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-registry-sync',
    userId: 'user-anna-thompson',
    type: 'system-alert',
    title: 'TREAT-NMD registry data synced',
    message: 'Your latest PROM responses have been shared with the TREAT-NMD registry as per your consent.',
    priority: 'low',
    read: true,
    actionUrl: '/health/registry',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-data-access',
    userId: 'user-anna-thompson',
    type: 'research-update',
    title: 'Your data contributed to a new study',
    message: '2 approved researchers accessed your pseudonymised data as part of the TREAT-NMD natural history analysis.',
    priority: 'low',
    read: true,
    actionUrl: '/settings/data-catalogue',
    metadata: { accessCount: 2 },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Patient Metrics (FSHD-specific longitudinal data) ────────────────────────

export const mockPatientMetrics: PatientMetrics = {
  userId: 'user-anna-thompson',
  period: {
    start: '2025-04-01',
    end: '2026-04-18',
  },
  questionnairesCompleted: 24,
  averageScore: 3.2,
  scoreChange: -0.4,
  symptoms: [
    {
      symptom: 'Fatigue (PROMIS T-score)',
      values: [
        { date: '2025-04-01', value: 58 },
        { date: '2025-07-01', value: 55 },
        { date: '2025-10-01', value: 52 },
        { date: '2026-01-01', value: 47 },
        { date: '2026-04-01', value: 42 },
      ],
      severity: 'improving',
    },
    {
      symptom: '6-Minute Walk Test (m)',
      values: [
        { date: '2025-04-01', value: 290 },
        { date: '2025-07-01', value: 295 },
        { date: '2025-10-01', value: 300 },
        { date: '2026-01-01', value: 308 },
        { date: '2026-04-01', value: 312 },
      ],
      severity: 'improving',
    },
    {
      symptom: 'Grip Strength (kg)',
      values: [
        { date: '2025-04-01', value: 18 },
        { date: '2025-07-01', value: 18 },
        { date: '2025-10-01', value: 17.5 },
        { date: '2026-01-01', value: 18 },
        { date: '2026-04-01', value: 18 },
      ],
      severity: 'stable',
    },
    {
      symptom: 'Mood (avg/10)',
      values: [
        { date: '2025-04-01', value: 6.2 },
        { date: '2025-07-01', value: 6.4 },
        { date: '2025-10-01', value: 6.5 },
        { date: '2026-01-01', value: 6.6 },
        { date: '2026-04-01', value: 6.8 },
      ],
      severity: 'improving',
    },
  ],
  qualityOfLife: [
    { category: 'Physical Function', score: 68, change: +5, date: '2026-04-01' },
    { category: 'Fatigue', score: 58, change: +12, date: '2026-04-01' },
    { category: 'Emotional Well-being', score: 72, change: +4, date: '2026-04-01' },
    { category: 'Social Participation', score: 65, change: +3, date: '2026-04-01' },
  ],
  adherence: 87,
};

// ─── Extended metric series for charts ───────────────────────────────────────

type MetricPoint = { date: string; value: number };
export interface MetricSeries { id: string; label: string; unit: string; domain: string; direction: 'higher' | 'lower' | 'stable'; color: string; values: MetricPoint[] }

export const demoMetricSeries: MetricSeries[] = [
  { id: 'fatigue', label: 'Fatigue T-score', unit: '', domain: 'Fatigue & Mood', direction: 'lower', color: '#7c3aed',
    values: [
      { date: '2025-04-01', value: 58 }, { date: '2025-05-01', value: 57 }, { date: '2025-06-01', value: 56 },
      { date: '2025-07-01', value: 55 }, { date: '2025-08-01', value: 54 }, { date: '2025-09-01', value: 53 },
      { date: '2025-10-01', value: 52 }, { date: '2025-11-01', value: 50 }, { date: '2025-12-01', value: 49 },
      { date: '2026-01-01', value: 47 }, { date: '2026-02-01', value: 45 }, { date: '2026-03-01', value: 43 },
      { date: '2026-04-01', value: 42 },
    ],
  },
  { id: 'sixmwt', label: '6-Min Walk (m)', unit: 'm', domain: 'Physical', direction: 'higher', color: '#0b9b8c',
    values: [
      { date: '2025-04-01', value: 290 }, { date: '2025-05-01', value: 291 }, { date: '2025-06-01', value: 293 },
      { date: '2025-07-01', value: 295 }, { date: '2025-08-01', value: 296 }, { date: '2025-09-01', value: 298 },
      { date: '2025-10-01', value: 300 }, { date: '2025-11-01', value: 302 }, { date: '2025-12-01', value: 305 },
      { date: '2026-01-01', value: 308 }, { date: '2026-02-01', value: 309 }, { date: '2026-03-01', value: 311 },
      { date: '2026-04-01', value: 312 },
    ],
  },
  { id: 'grip', label: 'Grip Strength (kg)', unit: 'kg', domain: 'Physical', direction: 'higher', color: '#1d6abf',
    values: [
      { date: '2025-04-01', value: 18 }, { date: '2025-07-01', value: 18 }, { date: '2025-10-01', value: 17.5 },
      { date: '2026-01-01', value: 18 }, { date: '2026-04-01', value: 18 },
    ],
  },
  { id: 'mood', label: 'Mood (avg/10)', unit: '/10', domain: 'Fatigue & Mood', direction: 'higher', color: '#d97706',
    values: [
      { date: '2025-04-01', value: 6.2 }, { date: '2025-05-01', value: 6.2 }, { date: '2025-06-01', value: 6.3 },
      { date: '2025-07-01', value: 6.4 }, { date: '2025-08-01', value: 6.4 }, { date: '2025-09-01', value: 6.5 },
      { date: '2025-10-01', value: 6.5 }, { date: '2025-11-01', value: 6.5 }, { date: '2025-12-01', value: 6.6 },
      { date: '2026-01-01', value: 6.6 }, { date: '2026-02-01', value: 6.7 }, { date: '2026-03-01', value: 6.7 },
      { date: '2026-04-01', value: 6.8 },
    ],
  },
  { id: 'steps', label: 'Daily Steps', unit: 'steps', domain: 'Wearable', direction: 'higher', color: '#16a34a',
    values: [
      { date: '2025-04-01', value: 4900 }, { date: '2025-05-01', value: 5100 }, { date: '2025-06-01', value: 5300 },
      { date: '2025-07-01', value: 5500 }, { date: '2025-08-01', value: 5600 }, { date: '2025-09-01', value: 5700 },
      { date: '2025-10-01', value: 5750 }, { date: '2025-11-01', value: 5800 }, { date: '2025-12-01', value: 5820 },
      { date: '2026-01-01', value: 5830 }, { date: '2026-02-01', value: 5835 }, { date: '2026-03-01', value: 5838 },
      { date: '2026-04-01', value: 5840 },
    ],
  },
  { id: 'hrv', label: 'HRV (ms)', unit: 'ms', domain: 'Wearable', direction: 'higher', color: '#0b9b8c',
    values: [
      { date: '2025-04-01', value: 38 }, { date: '2025-05-01', value: 39 }, { date: '2025-06-01', value: 39 },
      { date: '2025-07-01', value: 40 }, { date: '2025-08-01', value: 40 }, { date: '2025-09-01', value: 41 },
      { date: '2025-10-01', value: 41 }, { date: '2025-11-01', value: 42 }, { date: '2025-12-01', value: 42 },
      { date: '2026-01-01', value: 43 }, { date: '2026-02-01', value: 43 }, { date: '2026-03-01', value: 44 },
      { date: '2026-04-01', value: 44 },
    ],
  },
  { id: 'sleep', label: 'Sleep (hrs)', unit: 'h', domain: 'Wearable', direction: 'higher', color: '#7c3aed',
    values: [
      { date: '2025-04-01', value: 6.2 }, { date: '2025-05-01', value: 6.3 }, { date: '2025-06-01', value: 6.3 },
      { date: '2025-07-01', value: 6.5 }, { date: '2025-08-01', value: 6.5 }, { date: '2025-09-01', value: 6.6 },
      { date: '2025-10-01', value: 6.7 }, { date: '2025-11-01', value: 6.8 }, { date: '2025-12-01', value: 6.9 },
      { date: '2026-01-01', value: 7.0 }, { date: '2026-02-01', value: 7.0 }, { date: '2026-03-01', value: 7.1 },
      { date: '2026-04-01', value: 7.1 },
    ],
  },
  { id: 'spo2', label: 'SpO2 (%)', unit: '%', domain: 'Wearable', direction: 'higher', color: '#dc2626',
    values: [
      { date: '2025-04-01', value: 97 }, { date: '2025-07-01', value: 97 }, { date: '2025-10-01', value: 97 },
      { date: '2026-01-01', value: 98 }, { date: '2026-04-01', value: 98 },
    ],
  },
  { id: 'fvc', label: 'FVC% Predicted', unit: '%', domain: 'Clinical', direction: 'higher', color: '#1d6abf',
    values: [
      { date: '2024-04-01', value: 82 }, { date: '2024-10-01', value: 83 }, { date: '2025-04-01', value: 84 },
      { date: '2025-10-01', value: 84.5 }, { date: '2026-04-01', value: 85 },
    ],
  },
  { id: 'inqol', label: 'INQoL Score', unit: '/10', domain: 'PROMs', direction: 'higher', color: '#d97706',
    values: [
      { date: '2025-04-01', value: 6.1 }, { date: '2025-07-01', value: 6.3 }, { date: '2025-10-01', value: 6.5 },
      { date: '2026-01-01', value: 6.6 }, { date: '2026-04-01', value: 6.8 },
    ],
  },
  { id: 'eq5d', label: 'EQ-5D VAS', unit: '/100', domain: 'PROMs', direction: 'higher', color: '#16a34a',
    values: [
      { date: '2025-04-01', value: 62 }, { date: '2025-07-01', value: 64 }, { date: '2025-10-01', value: 65 },
      { date: '2026-01-01', value: 67 }, { date: '2026-04-01', value: 68 },
    ],
  },
];

export const METRIC_DOMAINS = ['All', 'Physical', 'Fatigue & Mood', 'Wearable', 'Clinical', 'PROMs'] as const;

// ─── Community feature suggestions ───────────────────────────────────────────

export interface FeatureSuggestion { id: string; title: string; description: string; votes: number; status: 'planned' | 'considering' | 'live' | 'open'; category: string }
export const demoFeatureSuggestions: FeatureSuggestion[] = [
  { id: 'fs-1', title: 'Share anonymised chart with GP', description: 'Export a PDF summary of my health charts to share at GP appointments without revealing my identity.', votes: 142, status: 'planned', category: 'Export' },
  { id: 'fs-2', title: 'Medication tracking', description: 'Log medications and doses and overlay them on health charts to spot correlations.', votes: 98, status: 'considering', category: 'Tracking' },
  { id: 'fs-3', title: 'Carer separate login portal', description: 'A separate app experience optimised for carers who manage multiple family members.', votes: 87, status: 'considering', category: 'Access' },
  { id: 'fs-4', title: 'FSHD-specific exercise library', description: 'Curated, condition-safe exercise videos approved by neuromuscular physiotherapists.', votes: 74, status: 'open', category: 'Education' },
  { id: 'fs-5', title: 'Offline mode for questionnaires', description: 'Complete PROMs without internet connection — sync when back online.', votes: 61, status: 'planned', category: 'Accessibility' },
  { id: 'fs-6', title: 'Voice input for health log', description: 'Dictate my daily log entry instead of typing — essential for bad fatigue days.', votes: 53, status: 'live', category: 'Accessibility' },
];

// ─── Wearable data summary (Apple Watch) ──────────────────────────────────────

export const demoWearableData = {
  device: 'Apple Watch Series 9',
  lastSync: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  past30Days: {
    avgDailySteps: 5840,
    avgHRV: 38,
    avgSleepHours: 7.2,
    avgSpO2: 97.4,
    daysWithData: 28,
  },
  trend7d: [
    { date: '2026-04-11', steps: 5200, hrv: 36, sleep: 7.0, spo2: 97 },
    { date: '2026-04-12', steps: 6100, hrv: 40, sleep: 7.5, spo2: 98 },
    { date: '2026-04-13', steps: 5800, hrv: 37, sleep: 6.8, spo2: 97 },
    { date: '2026-04-14', steps: 4900, hrv: 35, sleep: 7.2, spo2: 97 },
    { date: '2026-04-15', steps: 6400, hrv: 42, sleep: 7.8, spo2: 98 },
    { date: '2026-04-16', steps: 5600, hrv: 38, sleep: 7.1, spo2: 97 },
    { date: '2026-04-17', steps: 5950, hrv: 39, sleep: 7.3, spo2: 98 },
  ],
};

// ─── Registry visit history ────────────────────────────────────────────────────

export const demoRegistryHistory = {
  registryId: 'FSHD_0001',
  registry: 'TREAT-NMD / PaLaDín FSHD',
  enrolledDate: '2025-11-01',
  totalVisits: 4,
  visits: [
    {
      id: 'visit-1',
      date: '2025-11-01',
      type: 'Baseline',
      sixMWT: 290,
      gripRight: 17,
      gripLeft: 15,
      fvcPercent: 82,
      reachAbility: 3,
      notes: 'Baseline visit. Enrolled in PaLaDín FSHD registry.',
    },
    {
      id: 'visit-2',
      date: '2026-01-15',
      type: '3-month follow-up',
      sixMWT: 301,
      gripRight: 18,
      gripLeft: 16,
      fvcPercent: 84,
      reachAbility: 3,
    },
    {
      id: 'visit-3',
      date: '2026-04-01',
      type: '6-month follow-up',
      sixMWT: 312,
      gripRight: 18,
      gripLeft: 16,
      fvcPercent: 85,
      reachAbility: 3,
    },
  ],
};

// ─── Life events / tags ────────────────────────────────────────────────────────

export const demoLifeEvents = [
  { id: 'le-1', date: '2026-03-28', type: 'illness', metric: 'Fatigue', value: 7, note: 'Cold for 4 days, fatigue elevated', feel: '😔' },
  { id: 'le-2', date: '2026-03-20', type: 'exercise', metric: 'Steps', value: 8200, note: 'Walked to town and back', feel: '😊' },
  { id: 'le-3', date: '2026-03-15', type: 'medication', metric: null, value: null, note: 'Started vitamin D supplement', feel: '😐' },
  { id: 'le-4', date: '2026-02-14', type: 'social', metric: 'Mood', value: 8.5, note: 'Family visit — felt great', feel: '😊' },
];
