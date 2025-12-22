// Core user roles
export type UserRole = 'patient' | 'caregiver' | 'clinician' | 'researcher' | 'administrator';

// User and authentication types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  dateOfBirth?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  preferences: UserPreferences;
  gamification?: GamificationProfile;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

// Gamification types
export interface GamificationProfile {
  points: number;
  level: number;
  badges: string[];
  curiosityScore: number;
  completedEducation: string[];
}

export interface EducationModule {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  content: {
    sections: EducationSection[];
  };
  tags: string[];
  nextModules?: string[];
}

export interface EducationSection {
  title: string;
  content: string;
  type: 'text' | 'quiz' | 'interactive' | 'video';
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

// Caregiver-specific types
export interface CaregiverLink {
  id: string;
  caregiverId: string;
  patientId: string;
  accessLevel: 'full' | 'limited' | 'read-only';
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  requestedAt: string;
  approvedAt?: string;
  expiresAt?: string;
  permissions: CaregiverPermissions;
}

export interface CaregiverPermissions {
  viewResults: boolean;
  completeQuestionnaires: boolean;
  manageConsent: boolean;
  receiveNotifications: boolean;
  viewClinicalNotes: boolean;
}

export interface LinkedPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string;
  accessLevel: 'full' | 'limited' | 'read-only';
  avatarUrl?: string;
}

// Consent types
export interface Consent {
  id: string;
  type: ConsentType;
  version: string;
  title: string;
  description: string;
  content: string;
  required: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ConsentType = 
  | 'data-use'
  | 'pro-reporting'
  | 'research-participation'
  | 'trial-specific'
  | 'caregiver-access';

export interface UserConsent {
  id: string;
  userId: string;
  consentId: string;
  status: 'accepted' | 'declined' | 'withdrawn' | 'pending';
  acceptedAt?: string;
  declinedAt?: string;
  withdrawnAt?: string;
  actingUserId?: string; // For caregiver-mediated consent
  actingUserRole?: UserRole;
  notes?: string;
  version: string;
}

// Questionnaire types
export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: number; // minutes
  questions: Question[];
  schedulingType: 'one-time' | 'recurring' | 'event-driven';
  frequency?: string;
  status: 'draft' | 'active' | 'archived';
  targetRoles: UserRole[];
  tags: string[];
  scoringLogic?: ScoringLogic;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  branchingLogic?: BranchingLogic;
  order: number;
}

export type QuestionType = 
  | 'likert'
  | 'visual-analog-scale'
  | 'multiple-choice'
  | 'multiple-select'
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'symptom-scale'
  | 'rating';

export interface QuestionOption {
  id: string;
  label: string;
  value: string | number;
  score?: number;
}

export interface QuestionValidation {
  min?: number;
  max?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface BranchingLogic {
  condition: {
    questionId: string;
    operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains';
    value: any;
  };
  action: 'show' | 'hide' | 'jump-to';
  targetQuestionId?: string;
}

export interface ScoringLogic {
  type: 'sum' | 'average' | 'weighted' | 'custom';
  ranges?: ScoreRange[];
  interpretation?: Record<string, string>;
}

export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  severity?: 'low' | 'moderate' | 'high' | 'severe';
  color?: string;
}

// Questionnaire response types
export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  userId: string;
  completedBy?: string; // For caregiver-completed
  completedByRole?: UserRole;
  status: 'in-progress' | 'completed' | 'abandoned';
  answers: QuestionAnswer[];
  score?: number;
  startedAt: string;
  completedAt?: string;
  timeSpent?: number; // seconds
}

export interface QuestionAnswer {
  questionId: string;
  value: any;
  score?: number;
  timestamp: string;
}

// Clinical trial types
export interface ClinicalTrial {
  id: string;
  title: string;
  description: string;
  sponsor: string;
  phase: 'early-phase-1' | 'phase-1' | 'phase-2' | 'phase-3' | 'phase-4';
  status: 'recruiting' | 'active' | 'completed' | 'suspended' | 'terminated';
  conditions: string[];
  interventions: string[];
  eligibilityCriteria: {
    minAge?: number;
    maxAge?: number;
    gender?: 'all' | 'male' | 'female';
    criteria: string[];
  };
  locations: TrialLocation[];
  startDate: string;
  endDate?: string;
  enrollmentTarget: number;
  currentEnrollment: number;
  primaryOutcome: string;
  tags: string[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  followCount: number;
}

export interface TrialLocation {
  facility: string;
  city: string;
  state?: string;
  country: string;
  contactEmail?: string;
  contactPhone?: string;
}

// Innovation/Research types
export interface ResearchItem {
  id: string;
  type: 'device' | 'diagnostic' | 'digital' | 'drug' | 'publication';
  title: string;
  description: string;
  summary: string;
  authors?: string[];
  institution?: string;
  publishedDate: string;
  tags: string[];
  relatedConditions: string[];
  url?: string;
  followCount: number;
  isFollowing?: boolean;
}

// Tag/Interest types
export interface Tag {
  id: string;
  name: string;
  category: 'condition' | 'treatment' | 'research-theme' | 'therapy-area' | 'modality';
  description?: string;
  parentId?: string;
  children?: Tag[];
}

export interface UserInterest {
  userId: string;
  tagId: string;
  addedAt: string;
  notificationsEnabled: boolean;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

export type NotificationType = 
  | 'questionnaire-reminder'
  | 'questionnaire-assigned'
  | 'trial-update'
  | 'consent-expiry'
  | 'consent-request'
  | 'research-update'
  | 'caregiver-request'
  | 'caregiver-approved'
  | 'system-alert'
  | 'clinical-note';

// Analytics types
export interface PatientMetrics {
  userId: string;
  period: {
    start: string;
    end: string;
  };
  questionnairesCompleted: number;
  averageScore: number;
  scoreChange: number;
  symptoms: SymptomTrend[];
  qualityOfLife: QoLMetric[];
  adherence: number; // percentage
}

export interface SymptomTrend {
  symptom: string;
  values: DataPoint[];
  severity: 'improving' | 'stable' | 'worsening';
}

export interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface QoLMetric {
  category: string;
  score: number;
  change: number;
  date: string;
}

// Admin types
export interface AdminConfig {
  consentFramework: {
    minorConsentAge: number;
    caregiverVerificationRequired: boolean;
    consentExpiryDays: number;
  };
  questionnaires: {
    allowSaveResume: boolean;
    maxAbandonedDays: number;
    reminderFrequencyDays: number;
  };
  trials: {
    autoMatchEnabled: boolean;
    notificationEnabled: boolean;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}