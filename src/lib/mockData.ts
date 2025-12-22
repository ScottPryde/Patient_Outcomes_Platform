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
  PatientMetrics 
} from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-patient-1',
    email: 'patient@example.com',
    firstName: 'Sarah',
    lastName: 'Anderson',
    role: 'patient',
    dateOfBirth: '1985-03-15',
    phone: '+1-555-0101',
    createdAt: '2024-01-15T00:00:00Z',
    preferences: {
      notifications: { email: true, push: true, sms: false },
      accessibility: { highContrast: false, largeText: false, reducedMotion: false },
      theme: 'light',
    },
  },
  {
    id: 'user-caregiver-1',
    email: 'caregiver@example.com',
    firstName: 'Michael',
    lastName: 'Johnson',
    role: 'caregiver',
    dateOfBirth: '1980-07-22',
    phone: '+1-555-0102',
    createdAt: '2024-02-01T00:00:00Z',
    preferences: {
      notifications: { email: true, push: true, sms: true },
      accessibility: { highContrast: false, largeText: false, reducedMotion: false },
      theme: 'light',
    },
  },
  {
    id: 'user-clinician-1',
    email: 'clinician@example.com',
    firstName: 'Dr. Emily',
    lastName: 'Chen',
    role: 'clinician',
    phone: '+1-555-0103',
    createdAt: '2023-11-10T00:00:00Z',
    preferences: {
      notifications: { email: true, push: false, sms: false },
      accessibility: { highContrast: false, largeText: false, reducedMotion: false },
      theme: 'light',
    },
  },
  {
    id: 'user-researcher-1',
    email: 'researcher@example.com',
    firstName: 'Dr. James',
    lastName: 'Martinez',
    role: 'researcher',
    createdAt: '2023-09-05T00:00:00Z',
    preferences: {
      notifications: { email: true, push: false, sms: false },
      accessibility: { highContrast: false, largeText: false, reducedMotion: false },
      theme: 'dark',
    },
  },
  {
    id: 'user-admin-1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'administrator',
    createdAt: '2023-01-01T00:00:00Z',
    preferences: {
      notifications: { email: true, push: true, sms: false },
      accessibility: { highContrast: false, largeText: false, reducedMotion: false },
      theme: 'dark',
    },
  },
];

// Mock Consents
export const mockConsents: Consent[] = [
  {
    id: 'consent-1',
    type: 'data-use',
    version: '2.1',
    title: 'Data Use and Privacy Consent',
    description: 'Agreement for collection and use of health data',
    content: `# Data Use and Privacy Consent

## Purpose
This consent allows us to collect, store, and use your health information for the purpose of improving your care and advancing medical research.

## What We Collect
- Personal health information
- Questionnaire responses
- Treatment outcomes
- Demographic data

## How We Use Your Data
- To provide personalized care recommendations
- To track treatment progress
- For quality improvement initiatives
- For approved research studies (with separate consent)

## Your Rights
- You can withdraw consent at any time
- You can request access to your data
- You can request corrections to your data

## Data Security
All data is encrypted and stored securely in compliance with HIPAA and GDPR regulations.`,
    required: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-15T00:00:00Z',
  },
  {
    id: 'consent-2',
    type: 'pro-reporting',
    version: '1.3',
    title: 'Patient-Reported Outcomes Consent',
    description: 'Permission to collect and share your symptom and outcome reports',
    content: `# Patient-Reported Outcomes Consent

This consent allows your care team to access your self-reported symptoms, quality of life measures, and treatment outcomes.

Your responses will be used to:
- Monitor your health status
- Adjust treatment plans
- Identify potential issues early
- Improve care delivery

Your responses may be shared with:
- Your primary care team
- Specialists involved in your care
- Quality improvement teams (de-identified)`,
    required: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'consent-3',
    type: 'research-participation',
    version: '1.0',
    title: 'Research Participation Consent',
    description: 'Optional consent for participation in research studies',
    content: `# Research Participation Consent

This optional consent allows your de-identified health data to be used in approved research studies.

## What This Means
- Your data will be de-identified before use in research
- You may be contacted about relevant clinical trials
- You can opt out at any time

## Benefits
- Contributing to medical advancement
- Early access to innovative treatments
- Helping future patients`,
    required: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'consent-4',
    type: 'caregiver-access',
    version: '1.1',
    title: 'Caregiver Access Authorization',
    description: 'Authorization for caregivers to access patient data',
    content: `# Caregiver Access Authorization

This consent authorizes a designated caregiver to access your health information and act on your behalf.

## Caregiver Permissions
The authorized caregiver may:
- View your health records
- Complete questionnaires on your behalf
- Receive notifications about your care
- Communicate with your care team
- Manage your consents (with restrictions)

## Access Levels
- **Full Access**: Complete access to all health information
- **Limited Access**: Access to specific information only
- **Read-Only**: View information but cannot make changes

## Duration and Revocation
- Access can be time-limited
- You can revoke access at any time
- Caregiver actions are logged and auditable`,
    required: false,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-05-20T00:00:00Z',
  },
];

// Mock User Consents
export const mockUserConsents: UserConsent[] = [
  {
    id: 'uc-1',
    userId: 'user-patient-1',
    consentId: 'consent-1',
    status: 'accepted',
    acceptedAt: '2024-01-16T10:30:00Z',
    version: '2.1',
  },
  {
    id: 'uc-2',
    userId: 'user-patient-1',
    consentId: 'consent-2',
    status: 'accepted',
    acceptedAt: '2024-01-16T10:32:00Z',
    version: '1.3',
  },
  {
    id: 'uc-3',
    userId: 'patient-1',
    consentId: 'consent-1',
    status: 'accepted',
    acceptedAt: '2024-02-05T14:20:00Z',
    actingUserId: 'user-caregiver-1',
    actingUserRole: 'caregiver',
    version: '2.1',
  },
  {
    id: 'uc-4',
    userId: 'patient-1',
    consentId: 'consent-4',
    status: 'accepted',
    acceptedAt: '2024-02-05T14:25:00Z',
    version: '1.1',
  },
];

// Mock Questionnaires
export const mockQuestionnaires: Questionnaire[] = [
  {
    id: 'q-1',
    title: 'Daily Symptom Tracker',
    description: 'Track your symptoms and overall well-being each day',
    category: 'Symptoms',
    estimatedTime: 5,
    schedulingType: 'recurring',
    frequency: 'daily',
    status: 'active',
    targetRoles: ['patient', 'caregiver'],
    tags: ['symptoms', 'daily-monitoring', 'quality-of-life'],
    questions: [
      {
        id: 'q1-1',
        type: 'rating',
        text: 'How would you rate your overall health today?',
        description: 'Rate from 1 (very poor) to 5 (excellent)',
        required: true,
        options: [
          { id: 'opt-1', label: 'Very Poor', value: 1, score: 1 },
          { id: 'opt-2', label: 'Poor', value: 2, score: 2 },
          { id: 'opt-3', label: 'Fair', value: 3, score: 3 },
          { id: 'opt-4', label: 'Good', value: 4, score: 4 },
          { id: 'opt-5', label: 'Excellent', value: 5, score: 5 },
        ],
        order: 1,
      },
      {
        id: 'q1-2',
        type: 'visual-analog-scale',
        text: 'Rate your pain level',
        description: 'Slide from 0 (no pain) to 10 (worst pain imaginable)',
        required: true,
        validation: { min: 0, max: 10 },
        order: 2,
      },
      {
        id: 'q1-3',
        type: 'multiple-select',
        text: 'Which symptoms are you experiencing today?',
        required: false,
        options: [
          { id: 'symp-1', label: 'Fatigue', value: 'fatigue' },
          { id: 'symp-2', label: 'Nausea', value: 'nausea' },
          { id: 'symp-3', label: 'Headache', value: 'headache' },
          { id: 'symp-4', label: 'Dizziness', value: 'dizziness' },
          { id: 'symp-5', label: 'Shortness of breath', value: 'breath' },
          { id: 'symp-6', label: 'Sleep problems', value: 'sleep' },
        ],
        order: 3,
      },
      {
        id: 'q1-4',
        type: 'likert',
        text: 'I was able to perform my daily activities today',
        required: true,
        options: [
          { id: 'lik-1', label: 'Strongly Disagree', value: 1, score: 1 },
          { id: 'lik-2', label: 'Disagree', value: 2, score: 2 },
          { id: 'lik-3', label: 'Neutral', value: 3, score: 3 },
          { id: 'lik-4', label: 'Agree', value: 4, score: 4 },
          { id: 'lik-5', label: 'Strongly Agree', value: 5, score: 5 },
        ],
        order: 4,
      },
      {
        id: 'q1-5',
        type: 'textarea',
        text: 'Additional notes or concerns',
        description: 'Share any additional information about your health today',
        required: false,
        order: 5,
      },
    ],
    scoringLogic: {
      type: 'average',
      ranges: [
        { min: 0, max: 2, label: 'Poor', severity: 'high', color: '#ef4444' },
        { min: 2.1, max: 3.5, label: 'Fair', severity: 'moderate', color: '#f59e0b' },
        { min: 3.6, max: 5, label: 'Good', severity: 'low', color: '#10b981' },
      ],
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'q-2',
    title: 'Quality of Life Assessment (SF-12)',
    description: 'Standard quality of life questionnaire',
    category: 'Quality of Life',
    estimatedTime: 8,
    schedulingType: 'recurring',
    frequency: 'weekly',
    status: 'active',
    targetRoles: ['patient', 'caregiver'],
    tags: ['quality-of-life', 'validated-instrument', 'weekly'],
    questions: [
      {
        id: 'q2-1',
        type: 'multiple-choice',
        text: 'In general, would you say your health is:',
        required: true,
        options: [
          { id: 'sf1', label: 'Excellent', value: 5, score: 5 },
          { id: 'sf2', label: 'Very good', value: 4, score: 4 },
          { id: 'sf3', label: 'Good', value: 3, score: 3 },
          { id: 'sf4', label: 'Fair', value: 2, score: 2 },
          { id: 'sf5', label: 'Poor', value: 1, score: 1 },
        ],
        order: 1,
      },
      {
        id: 'q2-2',
        type: 'likert',
        text: 'During the past 4 weeks, how much did physical health problems limit your usual activities?',
        required: true,
        options: [
          { id: 'sf6', label: 'Not at all', value: 5, score: 5 },
          { id: 'sf7', label: 'A little bit', value: 4, score: 4 },
          { id: 'sf8', label: 'Moderately', value: 3, score: 3 },
          { id: 'sf9', label: 'Quite a bit', value: 2, score: 2 },
          { id: 'sf10', label: 'Extremely', value: 1, score: 1 },
        ],
        order: 2,
      },
    ],
    scoringLogic: {
      type: 'weighted',
      ranges: [
        { min: 0, max: 30, label: 'Low QoL', severity: 'high', color: '#ef4444' },
        { min: 31, max: 60, label: 'Moderate QoL', severity: 'moderate', color: '#f59e0b' },
        { min: 61, max: 100, label: 'High QoL', severity: 'low', color: '#10b981' },
      ],
    },
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'q-3',
    title: 'Treatment Side Effects',
    description: 'Report any side effects from your current treatment',
    category: 'Treatment',
    estimatedTime: 10,
    schedulingType: 'event-driven',
    status: 'active',
    targetRoles: ['patient', 'caregiver', 'clinician'],
    tags: ['side-effects', 'treatment-monitoring', 'safety'],
    questions: [
      {
        id: 'q3-1',
        type: 'multiple-choice',
        text: 'Are you currently experiencing any side effects?',
        required: true,
        options: [
          { id: 'se1', label: 'Yes', value: 'yes' },
          { id: 'se2', label: 'No', value: 'no' },
          { id: 'se3', label: 'Unsure', value: 'unsure' },
        ],
        branchingLogic: {
          condition: { questionId: 'q3-1', operator: 'equals', value: 'no' },
          action: 'jump-to',
          targetQuestionId: 'q3-5',
        },
        order: 1,
      },
      {
        id: 'q3-2',
        type: 'symptom-scale',
        text: 'Rate the severity of each side effect',
        description: 'Rate from 1 (mild) to 5 (severe)',
        required: true,
        order: 2,
      },
      {
        id: 'q3-3',
        type: 'textarea',
        text: 'Describe your side effects in detail',
        required: true,
        validation: { min: 10, errorMessage: 'Please provide at least 10 characters' },
        order: 3,
      },
    ],
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
  },
];

// Mock Questionnaire Responses
export const mockQuestionnaireResponses: QuestionnaireResponse[] = [
  {
    id: 'resp-1',
    questionnaireId: 'q-1',
    userId: 'user-patient-1',
    status: 'completed',
    answers: [
      { questionId: 'q1-1', value: 4, score: 4, timestamp: '2024-03-15T09:00:00Z' },
      { questionId: 'q1-2', value: 3, timestamp: '2024-03-15T09:01:00Z' },
      { questionId: 'q1-3', value: ['fatigue', 'sleep'], timestamp: '2024-03-15T09:02:00Z' },
      { questionId: 'q1-4', value: 4, score: 4, timestamp: '2024-03-15T09:03:00Z' },
    ],
    score: 4,
    startedAt: '2024-03-15T08:58:00Z',
    completedAt: '2024-03-15T09:05:00Z',
    timeSpent: 420,
  },
];

// Mock Clinical Trials
export const mockClinicalTrials: ClinicalTrial[] = [
  {
    id: 'trial-1',
    title: 'Phase 3 Study of Novel Immunotherapy for Advanced Cancer',
    description: 'A randomized, double-blind, placebo-controlled trial evaluating the efficacy and safety of XYZ-101 in patients with advanced solid tumors.',
    sponsor: 'Global Pharma Research',
    phase: 'phase-3',
    status: 'recruiting',
    conditions: ['Cancer', 'Solid Tumors', 'Advanced Cancer'],
    interventions: ['XYZ-101 Immunotherapy', 'Standard of Care'],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 75,
      gender: 'all',
      criteria: [
        'Histologically confirmed advanced solid tumor',
        'ECOG performance status 0-1',
        'Adequate organ function',
        'No prior immunotherapy',
        'Life expectancy > 6 months',
      ],
    },
    locations: [
      {
        facility: 'Memorial Cancer Center',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        contactEmail: 'trials@memorialcancer.org',
        contactPhone: '+1-555-0201',
      },
      {
        facility: 'University Medical Center',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        contactEmail: 'research@umc.edu',
        contactPhone: '+1-555-0202',
      },
    ],
    startDate: '2024-01-15',
    endDate: '2026-12-31',
    enrollmentTarget: 450,
    currentEnrollment: 287,
    primaryOutcome: 'Overall survival at 2 years',
    tags: ['oncology', 'immunotherapy', 'phase-3'],
    contactInfo: {
      name: 'Dr. Sarah Mitchell',
      email: 's.mitchell@globalpharma.com',
      phone: '+1-555-0200',
    },
    followCount: 342,
  },
  {
    id: 'trial-2',
    title: 'Digital Health Intervention for Diabetes Management',
    description: 'Evaluating the effectiveness of an AI-powered mobile app for improving glycemic control in Type 2 diabetes patients.',
    sponsor: 'HealthTech Innovations',
    phase: 'phase-2',
    status: 'recruiting',
    conditions: ['Type 2 Diabetes', 'Metabolic Disorders'],
    interventions: ['DiabetesAssist Mobile App', 'Standard Care + Education'],
    eligibilityCriteria: {
      minAge: 21,
      maxAge: 70,
      gender: 'all',
      criteria: [
        'Diagnosed Type 2 diabetes for at least 1 year',
        'HbA1c between 7.5% and 10%',
        'Owns a smartphone',
        'Willing to use mobile app daily',
        'Not using insulin pump',
      ],
    },
    locations: [
      {
        facility: 'Diabetes Research Institute',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        contactEmail: 'diabetes@research.org',
      },
      {
        facility: 'Metro Endocrinology Center',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
      },
    ],
    startDate: '2024-03-01',
    endDate: '2025-09-30',
    enrollmentTarget: 200,
    currentEnrollment: 128,
    primaryOutcome: 'Change in HbA1c from baseline to 6 months',
    tags: ['digital-health', 'diabetes', 'mobile-intervention'],
    contactInfo: {
      name: 'Dr. Michael Chen',
      email: 'm.chen@healthtech.com',
      phone: '+1-555-0210',
    },
    followCount: 156,
  },
  {
    id: 'trial-3',
    title: 'Novel Device for Chronic Pain Management',
    description: 'Pilot study of a non-invasive neurostimulation device for patients with chronic lower back pain.',
    sponsor: 'NeuroCare Medical Devices',
    phase: 'phase-1',
    status: 'recruiting',
    conditions: ['Chronic Pain', 'Lower Back Pain', 'Neuropathic Pain'],
    interventions: ['NeuroStim-X Device', 'Sham Device'],
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 65,
      gender: 'all',
      criteria: [
        'Chronic lower back pain for > 3 months',
        'Pain intensity VAS ≥ 4/10',
        'Failed at least 2 conservative treatments',
        'No surgical intervention in past 6 months',
        'Willing to attend weekly sessions',
      ],
    },
    locations: [
      {
        facility: 'Pain Management Institute',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        contactEmail: 'pain@research.org',
        contactPhone: '+1-555-0220',
      },
    ],
    startDate: '2024-06-01',
    endDate: '2025-03-31',
    enrollmentTarget: 60,
    currentEnrollment: 23,
    primaryOutcome: 'Safety and tolerability assessment',
    tags: ['pain-management', 'medical-device', 'neurostimulation'],
    contactInfo: {
      name: 'Dr. Jennifer Wu',
      email: 'j.wu@neurocare.com',
      phone: '+1-555-0221',
    },
    followCount: 89,
  },
];

// Mock Research Items
export const mockResearchItems: ResearchItem[] = [
  {
    id: 'research-1',
    type: 'publication',
    title: 'Breakthrough in Personalized Cancer Treatment Using AI-Guided Therapy Selection',
    description: 'New research demonstrates how artificial intelligence can predict optimal cancer treatment combinations based on genomic profiles.',
    summary: 'A multicenter study published in Nature Medicine shows that AI-guided therapy selection improves response rates by 35% compared to standard protocols. The study analyzed data from 5,000 patients across 12 cancer types.',
    authors: ['Dr. Lisa Zhang', 'Dr. Robert Taylor', 'Dr. Priya Patel'],
    institution: 'Stanford Cancer Research Center',
    publishedDate: '2024-10-15',
    tags: ['oncology', 'artificial-intelligence', 'personalized-medicine'],
    relatedConditions: ['Cancer', 'Solid Tumors'],
    url: 'https://example.com/research/ai-cancer-treatment',
    followCount: 1247,
  },
  {
    id: 'research-2',
    type: 'device',
    title: 'Wearable Glucose Monitor with Predictive Alerts',
    description: 'Next-generation continuous glucose monitoring system with AI-powered hypoglycemia prediction.',
    summary: 'GlucoWatch Pro features painless monitoring, 14-day wear time, and predictive algorithms that alert users up to 60 minutes before dangerous glucose levels. FDA approved for adults and children 6+.',
    institution: 'MedTech Innovations Inc.',
    publishedDate: '2024-11-01',
    tags: ['diabetes', 'wearable-device', 'continuous-monitoring'],
    relatedConditions: ['Type 1 Diabetes', 'Type 2 Diabetes'],
    followCount: 892,
  },
  {
    id: 'research-3',
    type: 'drug',
    title: 'New Oral Medication Shows Promise for Alzheimer\'s Disease',
    description: 'Phase 2 trial results show significant cognitive improvement with novel oral drug targeting amyloid pathways.',
    summary: 'MemorRx demonstrated 28% reduction in cognitive decline over 18 months in early-stage Alzheimer\'s patients. The once-daily oral medication shows better tolerability than current treatments.',
    institution: 'NeuroPharm Research',
    publishedDate: '2024-09-22',
    tags: ['neurology', 'alzheimers', 'drug-development'],
    relatedConditions: ['Alzheimer\'s Disease', 'Dementia', 'Cognitive Decline'],
    url: 'https://example.com/research/memorrx',
    followCount: 2103,
  },
  {
    id: 'research-4',
    type: 'digital',
    title: 'Virtual Reality Therapy for PTSD Treatment',
    description: 'Immersive VR platform showing remarkable results in treating post-traumatic stress disorder.',
    summary: 'PTSDRelief VR uses gradual exposure therapy in controlled virtual environments. Clinical trials show 67% of participants experienced significant symptom reduction after 12 sessions.',
    institution: 'Digital Therapeutics Alliance',
    publishedDate: '2024-08-10',
    tags: ['mental-health', 'virtual-reality', 'digital-therapeutics'],
    relatedConditions: ['PTSD', 'Anxiety', 'Trauma'],
    followCount: 534,
  },
  {
    id: 'research-5',
    type: 'diagnostic',
    title: 'Blood Test for Early Cancer Detection Across Multiple Types',
    description: 'Liquid biopsy technology can detect 12 types of cancer from a single blood draw.',
    summary: 'The MultiCancer Early Detection (MCED) test analyzes circulating tumor DNA and protein markers. In validation studies, it detected cancer with 91% specificity and 76% sensitivity across 12 cancer types.',
    authors: ['Dr. Amanda Chen', 'Dr. David Kumar'],
    institution: 'Precision Diagnostics Lab',
    publishedDate: '2024-07-18',
    tags: ['diagnostics', 'early-detection', 'liquid-biopsy'],
    relatedConditions: ['Cancer', 'Early Detection'],
    url: 'https://example.com/research/mced-test',
    followCount: 3456,
  },
];

// Mock Tags
export const mockTags: Tag[] = [
  {
    id: 'tag-1',
    name: 'Oncology',
    category: 'therapy-area',
    description: 'Cancer treatment and research',
  },
  {
    id: 'tag-2',
    name: 'Diabetes',
    category: 'condition',
    description: 'Type 1 and Type 2 diabetes',
  },
  {
    id: 'tag-3',
    name: 'Cardiovascular',
    category: 'therapy-area',
    description: 'Heart and vascular conditions',
  },
  {
    id: 'tag-4',
    name: 'Immunotherapy',
    category: 'treatment',
    description: 'Immune system-based treatments',
  },
  {
    id: 'tag-5',
    name: 'Digital Therapeutics',
    category: 'modality',
    description: 'Software-based medical interventions',
  },
  {
    id: 'tag-6',
    name: 'Rare Diseases',
    category: 'research-theme',
    description: 'Orphan diseases and conditions',
  },
  {
    id: 'tag-7',
    name: 'Neurology',
    category: 'therapy-area',
    description: 'Neurological conditions and treatments',
  },
  {
    id: 'tag-8',
    name: 'Pain Management',
    category: 'treatment',
    description: 'Chronic and acute pain treatments',
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-patient-1',
    type: 'questionnaire-reminder',
    title: 'Daily Symptom Tracker Due',
    message: 'Please complete your daily symptom tracker for today.',
    priority: 'medium',
    read: false,
    actionUrl: '/questionnaires/q-1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-2',
    userId: 'user-patient-1',
    type: 'trial-update',
    title: 'New Trial Match Found',
    message: 'A clinical trial matching your profile is now recruiting in your area.',
    priority: 'high',
    read: false,
    actionUrl: '/trials',
    metadata: { trialId: 'trial-2' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'notif-3',
    userId: 'user-patient-1',
    type: 'research-update',
    title: 'New Research in Your Areas of Interest',
    message: 'A breakthrough study on personalized cancer treatment has been published.',
    priority: 'low',
    read: true,
    actionUrl: '/trials',
    metadata: { researchId: 'research-1' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 'notif-4',
    userId: 'user-patient-1',
    type: 'consent-expiry',
    title: 'Consent Renewal Required',
    message: 'Your research participation consent will expire in 30 days. Please review and renew.',
    priority: 'high',
    read: false,
    actionUrl: '/consent',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: 'notif-5',
    userId: 'patient-1',
    type: 'caregiver-request',
    title: 'Caregiver Access Request',
    message: 'Michael Johnson has requested access to manage your health information.',
    priority: 'urgent',
    read: false,
    actionUrl: '/caregiver-linking',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  },
];

// Mock Patient Metrics
export const mockPatientMetrics: PatientMetrics = {
  userId: 'user-patient-1',
  period: {
    start: '2024-01-01',
    end: '2024-03-15',
  },
  questionnairesCompleted: 87,
  averageScore: 3.8,
  scoreChange: 0.4,
  symptoms: [
    {
      symptom: 'Pain Level',
      values: [
        { date: '2024-01-01', value: 6 },
        { date: '2024-01-15', value: 5.5 },
        { date: '2024-02-01', value: 4.8 },
        { date: '2024-02-15', value: 4.2 },
        { date: '2024-03-01', value: 3.5 },
        { date: '2024-03-15', value: 3 },
      ],
      severity: 'improving',
    },
    {
      symptom: 'Fatigue',
      values: [
        { date: '2024-01-01', value: 7 },
        { date: '2024-01-15', value: 6.5 },
        { date: '2024-02-01', value: 6 },
        { date: '2024-02-15', value: 5.8 },
        { date: '2024-03-01', value: 5.5 },
        { date: '2024-03-15', value: 5 },
      ],
      severity: 'improving',
    },
  ],
  qualityOfLife: [
    { category: 'Physical Health', score: 72, change: 8, date: '2024-03-15' },
    { category: 'Mental Well-being', score: 68, change: 5, date: '2024-03-15' },
    { category: 'Social Function', score: 75, change: 3, date: '2024-03-15' },
    { category: 'Daily Activities', score: 70, change: 6, date: '2024-03-15' },
  ],
  adherence: 92,
};
