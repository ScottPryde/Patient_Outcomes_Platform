import * as kv from './kv_store.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // ============================================================================
  // CREATE DEMO USERS
  // ============================================================================

  const demoUsers = [
    {
      email: 'anna.thompson@demo.interactium.io',
      password: 'Carepro1234!',
      firstName: 'Anna',
      lastName: 'Thompson',
      role: 'patient',
      dateOfBirth: '1988-03-22',
      phone: '555-0100'
    },
    {
      email: 'patient@carepro.com',
      password: 'CarePRO2024!', 
      firstName: 'Sarah', 
      lastName: 'Johnson', 
      role: 'patient',
      dateOfBirth: '1985-06-15',
      phone: '555-0101'
    },
    { 
      email: 'caregiver@carepro.com', 
      password: 'CarePRO2024!', 
      firstName: 'Michael', 
      lastName: 'Chen', 
      role: 'caregiver',
      phone: '555-0102'
    },
    { 
      email: 'clinician@carepro.com', 
      password: 'CarePRO2024!', 
      firstName: 'Dr. Emily', 
      lastName: 'Rodriguez', 
      role: 'clinician',
      phone: '555-0103'
    },
    { 
      email: 'researcher@carepro.com', 
      password: 'CarePRO2024!', 
      firstName: 'Dr. James', 
      lastName: 'Wilson', 
      role: 'researcher',
      phone: '555-0104'
    },
    { 
      email: 'admin@carepro.com', 
      password: 'CarePRO2024!', 
      firstName: 'Admin', 
      lastName: 'User', 
      role: 'administrator',
      phone: '555-0105'
    },
  ];

  console.log('👥 Creating demo users...');
  for (const user of demoUsers) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const exists = existingUsers?.users?.some(u => u.email === user.email);
      
      if (!exists) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Automatically confirm the user's email since an email server hasn't been configured.
          user_metadata: { 
            firstName: user.firstName, 
            lastName: user.lastName, 
            role: user.role,
            dateOfBirth: user.dateOfBirth,
            phone: user.phone
          },
        });

        if (authError) {
          console.error(`❌ Error creating user ${user.email}:`, authError.message);
          continue;
        }

        // Create user profile in KV store
        const userProfile = {
          id: authData.user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          dateOfBirth: user.dateOfBirth,
          phone: user.phone,
          createdAt: new Date().toISOString(),
          preferences: {
            notifications: { email: true, push: true, sms: false },
            accessibility: { highContrast: false, largeText: false, reducedMotion: false },
            theme: 'auto',
          },
          gamification: {
            points: 0,
            level: 1,
            badges: [],
            completedEducation: [],
            curiosityScore: 0,
          },
        };

        await kv.set(`user:${authData.user.id}`, userProfile);
        console.log(`✅ Created demo user: ${user.email}`);
      } else {
        console.log(`ℹ️  Demo user already exists: ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error);
    }
  }

  // ============================================================================
  // SEED TAGS
  // ============================================================================

  console.log('🏷️  Creating tags...');
  const tags = [
    // Medical Conditions
    { id: 'tag:cancer', name: 'Cancer', category: 'condition', description: 'Cancer-related research and clinical trials', icon: '🎗️' },
    { id: 'tag:diabetes', name: 'Diabetes', category: 'condition', description: 'Diabetes management and treatment research', icon: '💉' },
    { id: 'tag:heart-disease', name: 'Heart Disease', category: 'condition', description: 'Cardiovascular health and research', icon: '❤️' },
    { id: 'tag:mental-health', name: 'Mental Health', category: 'condition', description: 'Mental health and wellbeing research', icon: '🧠' },
    { id: 'tag:chronic-pain', name: 'Chronic Pain', category: 'condition', description: 'Pain management research and treatments', icon: '⚡' },
    { id: 'tag:autoimmune', name: 'Autoimmune', category: 'condition', description: 'Autoimmune disorders and treatments', icon: '🦠' },
    
    // Treatment Types
    { id: 'tag:immunotherapy', name: 'Immunotherapy', category: 'treatment', description: 'Immune system-based treatments', icon: '🛡️' },
    { id: 'tag:gene-therapy', name: 'Gene Therapy', category: 'treatment', description: 'Genetic modification treatments', icon: '🧬' },
    { id: 'tag:biologics', name: 'Biologics', category: 'treatment', description: 'Biologically-based medications', icon: '💊' },
    { id: 'tag:surgery', name: 'Surgery', category: 'treatment', description: 'Surgical interventions and procedures', icon: '🏥' },
    
    // Research Themes
    { id: 'tag:precision-medicine', name: 'Precision Medicine', category: 'research-theme', description: 'Personalized treatment approaches', icon: '🎯' },
    { id: 'tag:digital-health', name: 'Digital Health', category: 'research-theme', description: 'Technology-enabled healthcare solutions', icon: '📱' },
    { id: 'tag:patient-outcomes', name: 'Patient Outcomes', category: 'research-theme', description: 'PRO-focused research studies', icon: '📊' },
    { id: 'tag:rare-diseases', name: 'Rare Diseases', category: 'research-theme', description: 'Research on rare and orphan diseases', icon: '🔬' },
  ];

  for (const tag of tags) {
    await kv.set(tag.id, tag);
  }
  console.log(`✅ Created ${tags.length} tags`);

  // ============================================================================
  // SEED EDUCATION MODULES
  // ============================================================================

  console.log('📚 Creating education modules...');
  const educationModules = [
    {
      id: 'edu-intro-pro',
      title: 'Introduction to Patient-Reported Outcomes',
      description: 'Learn the fundamentals of PROs and why they matter in healthcare',
      category: 'fundamentals',
      estimatedTime: 10,
      difficulty: 'beginner',
      points: 50,
      content: {
        sections: [
          {
            title: 'What are PROs?',
            content: 'Patient-Reported Outcomes (PROs) are health assessments that come directly from you, the patient, without interpretation by a doctor or anyone else. They capture your perspective on your health, symptoms, and quality of life.',
            type: 'text',
          },
          {
            title: 'Why PROs Matter',
            content: 'Your voice helps shape treatment decisions, clinical trials, and healthcare policy. PROs provide valuable insights that clinical tests alone cannot capture, ensuring healthcare is truly patient-centered.',
            type: 'text',
          },
          {
            title: 'Quiz',
            questions: [
              {
                question: 'Who provides Patient-Reported Outcomes?',
                options: ['Doctor', 'Patient', 'Nurse', 'Caregiver'],
                correctAnswer: 1,
              },
              {
                question: 'What is the main benefit of PROs?',
                options: ['Faster appointments', 'Patient perspective on health', 'Lower costs', 'Easier paperwork'],
                correctAnswer: 1,
              },
            ],
            type: 'quiz',
          },
        ],
      },
      tags: ['patient-outcomes'],
      nextModules: ['edu-questionnaires'],
    },
    {
      id: 'edu-questionnaires',
      title: 'Understanding Questionnaires',
      description: 'Master the art of completing health questionnaires effectively',
      category: 'fundamentals',
      estimatedTime: 15,
      difficulty: 'beginner',
      points: 75,
      content: {
        sections: [
          {
            title: 'Types of Questions',
            content: 'Questionnaires use various question types including Likert scales (rating your agreement), visual analog scales (sliding scales), symptom ratings, and open-ended questions. Each type captures different aspects of your health experience.',
            type: 'text',
          },
          {
            title: 'Tips for Accurate Responses',
            content: 'Be honest and consistent. Think about the specified time period. Don\'t overthink - your first instinct is often the most accurate. Complete questionnaires in a quiet space where you can focus.',
            type: 'text',
          },
          {
            title: 'Quiz',
            questions: [
              {
                question: 'What is a Likert scale used for?',
                options: ['Measuring weight', 'Rating agreement or intensity', 'Taking photos', 'Scheduling appointments'],
                correctAnswer: 1,
              },
            ],
            type: 'quiz',
          },
        ],
      },
      tags: ['patient-outcomes'],
      nextModules: ['edu-trials'],
    },
    {
      id: 'edu-trials',
      title: 'Clinical Trials 101',
      description: 'Explore how clinical trials work and how you can participate',
      category: 'trials',
      estimatedTime: 20,
      difficulty: 'intermediate',
      points: 100,
      content: {
        sections: [
          {
            title: 'Trial Phases Explained',
            content: 'Clinical trials progress through phases: Phase 1 tests safety in small groups. Phase 2 evaluates effectiveness and side effects. Phase 3 compares new treatments to standard care in large groups. Phase 4 monitors long-term effects after approval.',
            type: 'text',
          },
          {
            title: 'Understanding Eligibility',
            content: 'Trials have inclusion criteria (who can join) and exclusion criteria (who cannot). These ensure participant safety and study validity. Common criteria include age, diagnosis, prior treatments, and overall health status.',
            type: 'text',
          },
          {
            title: 'Your Rights as a Participant',
            content: 'You can withdraw at any time. You must give informed consent. You have the right to ask questions. Your privacy is protected. You should not be charged for trial-related care.',
            type: 'text',
          },
          {
            title: 'Quiz',
            questions: [
              {
                question: 'Which phase typically involves the largest number of participants?',
                options: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
                correctAnswer: 2,
              },
              {
                question: 'Can you withdraw from a clinical trial after enrolling?',
                options: ['No, never', 'Yes, at any time', 'Only with doctor approval', 'Only before it starts'],
                correctAnswer: 1,
              },
            ],
            type: 'quiz',
          },
        ],
      },
      tags: ['precision-medicine'],
      nextModules: ['edu-consent'],
    },
    {
      id: 'edu-consent',
      title: 'Informed Consent',
      description: 'Understanding your rights and consent in research participation',
      category: 'fundamentals',
      estimatedTime: 12,
      difficulty: 'beginner',
      points: 60,
      content: {
        sections: [
          {
            title: 'What is Informed Consent?',
            content: 'Informed consent is an ongoing process where you learn about a study, understand the risks and benefits, and freely agree to participate. It\'s not just signing a form - it\'s about making an informed decision.',
            type: 'text',
          },
          {
            title: 'Key Elements of Consent',
            content: 'Study purpose and procedures, potential risks and benefits, alternatives to participation, how your privacy is protected, your right to withdraw, who to contact with questions, and voluntary participation.',
            type: 'text',
          },
          {
            title: 'Your Rights',
            content: 'You can withdraw consent at any time without penalty. You can ask questions before, during, and after consenting. You should receive a copy of the consent form. You should never feel pressured to participate.',
            type: 'text',
          },
        ],
      },
      tags: ['patient-outcomes'],
      nextModules: ['edu-data-privacy'],
    },
    {
      id: 'edu-data-privacy',
      title: 'Data Privacy & Security',
      description: 'Learn how your health data is protected and used',
      category: 'privacy',
      estimatedTime: 15,
      difficulty: 'intermediate',
      points: 80,
      content: {
        sections: [
          {
            title: 'HIPAA Basics',
            content: 'HIPAA (Health Insurance Portability and Accountability Act) protects your health information. Healthcare providers must keep your data secure, only share it with authorized parties, and give you access to your own records.',
            type: 'text',
          },
          {
            title: 'Data Sharing in Research',
            content: 'For research, your data is typically de-identified (personal identifiers removed). You control who can access your data through consent. Researchers must follow strict protocols to protect your privacy.',
            type: 'text',
          },
          {
            title: 'Your Data Rights',
            content: 'You have the right to access your data, request corrections, know who has accessed it, and request deletion in certain circumstances. You control the level of data sharing you\'re comfortable with.',
            type: 'text',
          },
        ],
      },
      tags: ['digital-health'],
      nextModules: [],
    },
  ];

  for (const module of educationModules) {
    await kv.set(`education:${module.id}`, module);
  }
  console.log(`✅ Created ${educationModules.length} education modules`);

  // ============================================================================
  // SEED SAMPLE QUESTIONNAIRES
  // ============================================================================

  console.log('📋 Creating questionnaires...');
  const questionnaires = [
    {
      id: 'q-daily-symptoms',
      title: 'Daily Symptom Tracker',
      description: 'Quick daily check-in on your symptoms and wellbeing',
      category: 'symptom-tracking',
      estimatedTime: 3,
      schedulingType: 'recurring',
      frequency: 'daily',
      status: 'active',
      targetRoles: ['patient'],
      tags: ['chronic-pain', 'patient-outcomes'],
      questions: [
        {
          id: 'q1',
          type: 'symptom-scale',
          text: 'How would you rate your pain level today?',
          required: true,
          options: [
            { id: 'opt1', label: 'No pain', value: 0, score: 0, description: 'Pain free' },
            { id: 'opt2', label: 'Mild', value: 1, score: 1, description: 'Noticeable but not bothersome' },
            { id: 'opt3', label: 'Moderate', value: 2, score: 2, description: 'Interferes with some activities' },
            { id: 'opt4', label: 'Severe', value: 3, score: 3, description: 'Significantly limits activities' },
            { id: 'opt5', label: 'Very severe', value: 4, score: 4, description: 'Unable to perform most activities' },
          ],
          order: 1,
        },
        {
          id: 'q2',
          type: 'rating',
          text: 'How well did you sleep last night?',
          required: true,
          validation: { min: 1, max: 5 },
          options: [
            { id: 'opt1', label: 'Very poor', value: 1 },
            { id: 'opt2', label: 'Poor', value: 2 },
            { id: 'opt3', label: 'Fair', value: 3 },
            { id: 'opt4', label: 'Good', value: 4 },
            { id: 'opt5', label: 'Excellent', value: 5 },
          ],
          order: 2,
        },
        {
          id: 'q3',
          type: 'multiple-choice',
          text: 'Did you experience any of the following symptoms today?',
          required: false,
          allowMultiple: true,
          options: [
            { id: 'opt1', label: 'Fatigue', value: 'fatigue' },
            { id: 'opt2', label: 'Nausea', value: 'nausea' },
            { id: 'opt3', label: 'Headache', value: 'headache' },
            { id: 'opt4', label: 'Dizziness', value: 'dizziness' },
            { id: 'opt5', label: 'None', value: 'none' },
          ],
          order: 3,
        },
        {
          id: 'q4',
          type: 'textarea',
          text: 'Any additional notes about your symptoms or wellbeing today?',
          required: false,
          placeholder: 'Share any observations or concerns...',
          order: 4,
        },
      ],
      scoringLogic: {
        type: 'sum',
        ranges: [
          { min: 0, max: 2, label: 'Mild symptoms', severity: 'low', color: '#10b981' },
          { min: 3, max: 5, label: 'Moderate symptoms', severity: 'moderate', color: '#f59e0b' },
          { min: 6, max: 10, label: 'Severe symptoms', severity: 'high', color: '#ef4444' },
        ],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'q-weekly-qol',
      title: 'Weekly Quality of Life Assessment',
      description: 'Comprehensive assessment of your overall quality of life',
      category: 'quality-of-life',
      estimatedTime: 8,
      schedulingType: 'recurring',
      frequency: 'weekly',
      status: 'active',
      targetRoles: ['patient'],
      tags: ['patient-outcomes', 'mental-health'],
      questions: [
        {
          id: 'q1',
          type: 'likert',
          text: 'I have been able to do my usual activities this week',
          required: true,
          options: [
            { id: 'opt1', label: 'Strongly Disagree', value: 1 },
            { id: 'opt2', label: 'Disagree', value: 2 },
            { id: 'opt3', label: 'Neutral', value: 3 },
            { id: 'opt4', label: 'Agree', value: 4 },
            { id: 'opt5', label: 'Strongly Agree', value: 5 },
          ],
          order: 1,
        },
        {
          id: 'q2',
          type: 'likert',
          text: 'I have felt emotionally well this week',
          required: true,
          options: [
            { id: 'opt1', label: 'Strongly Disagree', value: 1 },
            { id: 'opt2', label: 'Disagree', value: 2 },
            { id: 'opt3', label: 'Neutral', value: 3 },
            { id: 'opt4', label: 'Agree', value: 4 },
            { id: 'opt5', label: 'Strongly Agree', value: 5 },
          ],
          order: 2,
        },
        {
          id: 'q3',
          type: 'slider',
          text: 'Overall, how satisfied are you with your quality of life?',
          required: true,
          validation: { min: 0, max: 100 },
          labels: { min: 'Very unsatisfied', max: 'Very satisfied' },
          order: 3,
        },
      ],
      scoringLogic: {
        type: 'average',
        ranges: [
          { min: 0, max: 40, label: 'Low QoL', severity: 'high', color: '#ef4444' },
          { min: 41, max: 70, label: 'Moderate QoL', severity: 'moderate', color: '#f59e0b' },
          { min: 71, max: 100, label: 'High QoL', severity: 'low', color: '#10b981' },
        ],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const q of questionnaires) {
    await kv.set(`questionnaire:${q.id}`, q);
  }
  console.log(`✅ Created ${questionnaires.length} questionnaires`);

  // ============================================================================
  // SEED CLINICAL TRIALS
  // ============================================================================

  console.log('🔬 Creating clinical trials...');
  const trials = [
    {
      id: 'trial-001',
      title: 'Novel Immunotherapy for Advanced Cancer',
      description: 'Phase 2 study evaluating a new immunotherapy approach combining checkpoint inhibitors with personalized vaccines for patients with advanced solid tumors',
      sponsor: 'University Medical Center & BioPharma Research',
      phase: 'phase-2',
      status: 'recruiting',
      conditions: ['cancer'],
      interventions: ['immunotherapy', 'biologics'],
      eligibilityCriteria: {
        minAge: 18,
        maxAge: 75,
        gender: 'all',
        criteria: [
          'Diagnosed with advanced solid tumor (Stage III or IV)',
          'Failed at least one prior systemic treatment',
          'ECOG performance status 0-2',
          'Adequate organ function (liver, kidney, bone marrow)',
          'Life expectancy of at least 3 months',
        ],
        exclusions: [
          'Active autoimmune disease',
          'Prior immunotherapy within 6 months',
          'Concurrent malignancy',
          'Pregnancy or breastfeeding',
        ],
      },
      locations: [
        {
          facility: 'University Hospital Cancer Center',
          city: 'Boston',
          state: 'MA',
          country: 'USA',
          contactEmail: 'cancer-trials@hospital.edu',
          zip: '02115',
        },
        {
          facility: 'Regional Oncology Institute',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          contactEmail: 'trials@oncology-inst.org',
          zip: '94143',
        },
      ],
      startDate: '2024-01-15',
      estimatedCompletionDate: '2026-01-15',
      enrollmentTarget: 120,
      currentEnrollment: 45,
      primaryOutcome: 'Overall response rate at 6 months',
      secondaryOutcomes: [
        'Progression-free survival',
        'Overall survival at 12 months',
        'Quality of life assessment',
        'Safety and tolerability',
      ],
      tags: ['cancer', 'immunotherapy', 'precision-medicine'],
      contactInfo: {
        name: 'Dr. Sarah Johnson, MD, PhD',
        email: 'sjohnson@hospital.edu',
        phone: '555-0123',
        role: 'Principal Investigator',
      },
      followCount: 0,
      curiosityPoints: 15,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'trial-002',
      title: 'Digital Health App for Type 2 Diabetes Management',
      description: 'Evaluating effectiveness of an AI-powered mobile application with continuous glucose monitoring for Type 2 diabetes self-management',
      sponsor: 'Digital Health Institute & TechMed Solutions',
      phase: 'phase-3',
      status: 'recruiting',
      conditions: ['diabetes'],
      interventions: ['digital-health'],
      eligibilityCriteria: {
        minAge: 21,
        maxAge: 75,
        gender: 'all',
        criteria: [
          'Type 2 Diabetes diagnosis for at least 6 months',
          'HbA1c between 7-10%',
          'Owns a compatible smartphone (iOS or Android)',
          'Willing to use app daily and wear CGM sensor',
          'Stable diabetes medication regimen for 3 months',
        ],
        exclusions: [
          'Type 1 Diabetes',
          'Pregnancy or planning pregnancy',
          'Severe diabetes complications',
          'Current insulin pump use',
        ],
      },
      locations: [
        {
          facility: 'Diabetes Research Institute',
          city: 'Miami',
          state: 'FL',
          country: 'USA',
          contactEmail: 'diabetes-trials@dri.org',
          zip: '33136',
        },
        {
          facility: 'Metropolitan Endocrine Center',
          city: 'Seattle',
          state: 'WA',
          country: 'USA',
          contactEmail: 'research@metroendo.org',
          zip: '98101',
        },
      ],
      startDate: '2024-03-01',
      estimatedCompletionDate: '2025-09-01',
      enrollmentTarget: 300,
      currentEnrollment: 187,
      primaryOutcome: 'Change in HbA1c from baseline to 12 months',
      secondaryOutcomes: [
        'Time in target glucose range',
        'Frequency of hypoglycemic events',
        'Patient engagement with app features',
        'Quality of life and diabetes distress',
        'Healthcare utilization',
      ],
      tags: ['diabetes', 'digital-health', 'patient-outcomes'],
      contactInfo: {
        name: 'Dr. Maria Garcia, MD',
        email: 'mgarcia@dri.org',
        phone: '555-0456',
        role: 'Principal Investigator',
      },
      followCount: 0,
      curiosityPoints: 12,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'trial-003',
      title: 'Gene Therapy for Rare Autoimmune Disease',
      description: 'First-in-human Phase 1 trial of CRISPR-based gene therapy for patients with severe autoimmune disorders refractory to standard treatments',
      sponsor: 'National Institutes of Health & GeneEdit Therapeutics',
      phase: 'phase-1',
      status: 'recruiting',
      conditions: ['autoimmune'],
      interventions: ['gene-therapy'],
      eligibilityCriteria: {
        minAge: 18,
        maxAge: 65,
        gender: 'all',
        criteria: [
          'Confirmed diagnosis of target autoimmune condition',
          'Failed at least 2 prior immunosuppressive therapies',
          'Moderate to severe disease activity',
          'Willing to use effective contraception',
          'No active infections',
        ],
        exclusions: [
          'History of cancer within 5 years',
          'HIV, Hepatitis B or C infection',
          'Organ transplant recipient',
          'Current pregnancy or breastfeeding',
        ],
      },
      locations: [
        {
          facility: 'NIH Clinical Center',
          city: 'Bethesda',
          state: 'MD',
          country: 'USA',
          contactEmail: 'genetherapy@nih.gov',
          zip: '20892',
        },
      ],
      startDate: '2024-06-01',
      estimatedCompletionDate: '2027-06-01',
      enrollmentTarget: 20,
      currentEnrollment: 8,
      primaryOutcome: 'Safety and tolerability of gene therapy',
      secondaryOutcomes: [
        'Gene editing efficiency',
        'Disease activity scores',
        'Immune cell function',
        'Long-term safety monitoring',
      ],
      tags: ['autoimmune', 'gene-therapy', 'rare-diseases'],
      contactInfo: {
        name: 'Dr. Robert Kim, MD, PhD',
        email: 'rkim@nih.gov',
        phone: '555-0789',
        role: 'Principal Investigator',
      },
      followCount: 0,
      curiosityPoints: 20,
      lastUpdated: new Date().toISOString(),
    },
  ];

  for (const trial of trials) {
    await kv.set(`trial:${trial.id}`, trial);
  }
  console.log(`✅ Created ${trials.length} clinical trials`);

  // ============================================================================
  // SEED CONSENT TEMPLATES
  // ============================================================================

  console.log('📄 Creating consent templates...');
  const consents = [
    {
      id: 'consent-data-use',
      type: 'data-use',
      version: '1.0',
      title: 'Data Use Agreement',
      description: 'Standard consent for using your health data in the Care-PRO platform',
      content: `
# Data Use Agreement

By accepting this consent, you agree to allow Care-PRO to:

## 1. Data Collection
- Store and process your health information securely
- Collect patient-reported outcomes from questionnaires
- Track your interactions with the platform

## 2. Data Usage
- Provide personalized health insights and recommendations
- Enable communication with your healthcare providers
- Improve platform features and user experience

## 3. Data Security
- Encrypt all personal health information
- Follow HIPAA compliance standards
- Implement industry-standard security measures

## 4. Your Rights
- Access your data at any time
- Request corrections to your data
- Withdraw consent and request data deletion
- Export your data in machine-readable format

## 5. Data Sharing
- We will NEVER sell your personal health information
- Data may be shared with your authorized healthcare providers
- De-identified data may be used for research (with separate consent)

You can modify or withdraw this consent at any time through your account settings.
      `,
      required: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'consent-research',
      type: 'research-participation',
      version: '1.0',
      title: 'Research Participation Consent',
      description: 'Consent for sharing de-identified data with approved researchers',
      content: `
# Research Participation Consent

This consent allows researchers to access your de-identified health data for approved studies.

## What This Means

### Data De-identification
- Your name, email, and other identifying information will be removed
- Data is aggregated with other participants
- Individual participants cannot be identified

### Research Use
- Studies on treatment effectiveness
- Quality of life research
- Healthcare outcomes analysis
- Development of better assessment tools

### Your Control
- This consent is completely optional
- You can withdraw at any time
- Withdrawing does not affect your use of Care-PRO
- You can specify types of research you support

### Researcher Requirements
- All research must be IRB-approved
- Researchers must follow strict data security protocols
- Results may be published in medical journals
- You will never be individually identified

### Benefits
- Contribute to medical knowledge
- Help future patients
- Support development of better treatments
- Advance patient-centered care

You will be notified when your data is requested for specific research projects and can choose to participate or decline on a case-by-case basis.
      `,
      required: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'consent-caregiver-access',
      type: 'caregiver-access',
      version: '1.0',
      title: 'Caregiver Access Consent',
      description: 'Consent for caregivers to access your health information',
      content: `
# Caregiver Access Consent

This consent allows designated caregivers to access portions of your health information.

## Access Levels

### View Only
- See your questionnaire responses
- View symptom tracking data
- Access educational resources

### Limited Management
- All View Only permissions
- Complete questionnaires on your behalf
- Manage notification preferences

### Full Management
- All Limited Management permissions
- Update profile information
- Manage consent preferences
- Communicate with providers

## Your Control
- You specify the access level for each caregiver
- You can revoke access at any time
- You can view caregiver activity logs
- Caregivers cannot delete your account

## Caregiver Responsibilities
- Maintain confidentiality of your information
- Act in your best interests
- Follow your preferences and instructions
- Use access only for care purposes

This consent can be customized for each caregiver relationship and modified at any time.
      `,
      required: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const consent of consents) {
    await kv.set(`consent:${consent.id}`, consent);
  }
  console.log(`✅ Created ${consents.length} consent templates`);

  console.log('✅ Database seeding completed successfully!');
  console.log('');
  console.log('📝 Demo User Credentials:');
  console.log('  Patient:     patient@carepro.com / CarePRO2024!');
  console.log('  Caregiver:   caregiver@carepro.com / CarePRO2024!');
  console.log('  Clinician:   clinician@carepro.com / CarePRO2024!');
  console.log('  Researcher:  researcher@carepro.com / CarePRO2024!');
  console.log('  Admin:       admin@carepro.com / CarePRO2024!');
}
