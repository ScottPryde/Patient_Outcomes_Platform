import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LayoutMode = 'sidebar' | 'bottom-nav';

export type PatientMode = 'navigator' | 'tracker' | 'contributor' | 'minimalist';

export type FeatureKey =
  | 'pushNotifications'
  | 'trialsFinder'
  | 'knowledgeHub'
  | 'wearables'
  | 'tagsLifeEvents'
  | 'compareObservations'
  | 'fairCatalogue';

type NotificationPrefs = {
  questionnaire: boolean;
  appointment: boolean;
  trialMatch: boolean;
  registry: boolean;
};

type UiState = {
  layoutMode: LayoutMode;
  patientMode: PatientMode | null;
  healthSubmenuOpen: boolean;
  sidebarCollapsed: boolean;
  featurePanelOpen: boolean;
  features: Record<FeatureKey, boolean>;
  largeText: boolean;
  reducedMotion: boolean;
  language: string;
  ringVisibility: boolean;
  metricAnxietyMode: boolean;
  showGamification: boolean;
  showCohort: boolean;
  notificationPrefs: NotificationPrefs;
  setLayoutMode: (mode: LayoutMode) => void;
  setPatientMode: (mode: PatientMode) => void;
  setHealthSubmenuOpen: (open: boolean) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setFeaturePanelOpen: (v: boolean) => void;
  toggleFeature: (key: FeatureKey) => void;
  setLargeText: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  setLanguage: (v: string) => void;
  setRingVisibility: (v: boolean) => void;
  setMetricAnxietyMode: (v: boolean) => void;
  setShowGamification: (v: boolean) => void;
  setShowCohort: (v: boolean) => void;
  setNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
};

const defaultFeatures: Record<FeatureKey, boolean> = {
  pushNotifications: true,
  trialsFinder: true,
  knowledgeHub: true,
  wearables: true,
  tagsLifeEvents: true,
  compareObservations: true,
  fairCatalogue: true,
};

const defaultNotificationPrefs: NotificationPrefs = {
  questionnaire: true,
  appointment: true,
  trialMatch: true,
  registry: true,
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      layoutMode: 'sidebar',
      patientMode: null,
      healthSubmenuOpen: false,
      sidebarCollapsed: false,
      featurePanelOpen: false,
      features: { ...defaultFeatures },
      largeText: false,
      reducedMotion: false,
      language: 'en-GB',
      ringVisibility: true,
      metricAnxietyMode: false,
      showGamification: true,
      showCohort: false,
      notificationPrefs: { ...defaultNotificationPrefs },
      setLayoutMode: (layoutMode) => set({ layoutMode }),
      setPatientMode: (patientMode) => set({ patientMode }),
      setHealthSubmenuOpen: (healthSubmenuOpen) => set({ healthSubmenuOpen }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setFeaturePanelOpen: (featurePanelOpen) => set({ featurePanelOpen }),
      toggleFeature: (key) =>
        set((s) => ({
          features: { ...s.features, [key]: !s.features[key] },
        })),
      setLargeText: (largeText) => set({ largeText }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setLanguage: (language) => set({ language }),
      setRingVisibility: (ringVisibility) => set({ ringVisibility }),
      setMetricAnxietyMode: (metricAnxietyMode) => set({ metricAnxietyMode }),
      setShowGamification: (showGamification) => set({ showGamification }),
      setShowCohort: (showCohort) => set({ showCohort }),
      setNotificationPrefs: (prefs) =>
        set((s) => ({
          notificationPrefs: { ...s.notificationPrefs, ...prefs },
        })),
    }),
    { name: 'interactium-ui' }
  )
);
