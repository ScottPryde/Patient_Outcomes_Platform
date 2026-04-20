import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ConsentProvider } from './contexts/ConsentContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { InteractiumLayout } from './components/layouts/InteractiumLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PlatformConsentRoute } from './components/auth/PlatformConsentRoute';
import { RootRedirect } from './components/routing/RootRedirect';
import { LegacyQuestionnaireRedirect } from './components/routing/LegacyQuestionnaireRedirect';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { Questionnaires } from './pages/Questionnaires';
import { QuestionnaireForm } from './pages/QuestionnaireForm';
import { Results } from './pages/Results';
import { TrialsHub } from './pages/TrialsHub';
import { TagsInterests } from './pages/TagsInterests';
import { Profile } from './pages/Profile';
import { ConsentManagement } from './pages/ConsentManagement';
import { AdminPanel } from './pages/admin/AdminPanel';
import { CaregiverLinking } from './pages/CaregiverLinking';
import { CareGroup } from './pages/CareGroup';
import { EducationHub } from './pages/EducationHub';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard';
import { HealthHubPage } from './pages/health/HealthHubPage';
import { ObsChartsPage } from './pages/health/ObsChartsPage';
import { ObsGridPage } from './pages/health/ObsGridPage';
import { AllObservationsPage } from './pages/health/AllObservationsPage';
import { RegistryHistoryPage } from './pages/health/RegistryHistoryPage';
import { HealthLogPage } from './pages/health/HealthLogPage';
import { DevicesPage } from './pages/settings/DevicesPage';
import { DataExportPage } from './pages/health/DataExportPage';
import { DataConfigPage } from './pages/health/DataConfigPage';
import { HelpPage } from './pages/HelpPage';
import { GlossaryPage } from './pages/GlossaryPage';
import { SettingsHubPage } from './pages/SettingsHubPage';
import { SupabaseInit } from './components/SupabaseInit';
import { ConfigurationWarning } from './components/ConfigurationWarning';
import { BackendErrorBanner } from './components/BackendErrorBanner';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <SupabaseInit>
      <ConfigurationWarning />
      <BackendErrorBanner />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ConsentProvider>
              <NotificationProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<RootRedirect />} />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/diagnostics" element={<DiagnosticsPage />} />

                    <Route
                      path="/onboarding"
                      element={
                        <ProtectedRoute>
                          <OnboardingWizard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      element={
                        <ProtectedRoute>
                          <PlatformConsentRoute>
                            <InteractiumLayout />
                          </PlatformConsentRoute>
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/health" element={<HealthHubPage />} />
                      <Route path="/health/analytics" element={<Results />} />
                      <Route path="/health/charts" element={<ObsChartsPage />} />
                      <Route path="/health/grid" element={<ObsGridPage />} />
                      <Route path="/health/all-obs" element={<AllObservationsPage />} />
                      <Route path="/health/prom-history" element={<Questionnaires />} />
                      <Route path="/health/prom-history/:id" element={<QuestionnaireForm />} />
                      <Route path="/health/reg-history" element={<RegistryHistoryPage />} />
                      <Route path="/health/log" element={<HealthLogPage />} />
                      <Route path="/health/export" element={<DataExportPage />} />
                      <Route path="/health/dataconfig" element={<DataConfigPage />} />
                      <Route path="/knowledge" element={<EducationHub />} />
                      <Route path="/trials" element={<TrialsHub />} />
                      <Route path="/settings" element={<SettingsHubPage />} />
                      <Route path="/settings/devices" element={<DevicesPage />} />
                      <Route path="/help" element={<HelpPage />} />
                      <Route path="/help/glossary" element={<GlossaryPage />} />
                      <Route path="/account" element={<Profile />} />
                      <Route path="/tags" element={<TagsInterests />} />
                      <Route path="/consent" element={<ConsentManagement />} />
                      <Route path="/caregiver-linking" element={<CaregiverLinking />} />
                      <Route path="/care-group" element={<CareGroup />} />
                      <Route
                        path="/admin/*"
                        element={
                          <ProtectedRoute requiredRole="administrator">
                            <AdminPanel />
                          </ProtectedRoute>
                        }
                      />
                    </Route>

                    <Route
                      path="/questionnaires"
                      element={
                        <ProtectedRoute>
                          <Navigate to="/health/prom-history" replace />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/questionnaires/:id"
                      element={
                        <ProtectedRoute>
                          <LegacyQuestionnaireRedirect />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/results"
                      element={
                        <ProtectedRoute>
                          <Navigate to="/health/analytics" replace />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/education" element={<Navigate to="/knowledge" replace />} />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Navigate to="/account" replace />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Router>
                <Toaster position="top-right" richColors />
              </NotificationProvider>
            </ConsentProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SupabaseInit>
  );
}
