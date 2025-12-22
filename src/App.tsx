import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ConsentProvider } from './contexts/ConsentContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/diagnostics" element={<DiagnosticsPage />} />

                    {/* Protected routes */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="questionnaires" element={<Questionnaires />} />
                      <Route path="questionnaires/:id" element={<QuestionnaireForm />} />
                      <Route path="care-group" element={<CareGroup />} />
                      <Route path="results" element={<Results />} />
                      <Route path="trials" element={<TrialsHub />} />
                      <Route path="tags" element={<TagsInterests />} />
                      <Route path="education" element={<EducationHub />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="consent" element={<ConsentManagement />} />
                      <Route path="caregiver-linking" element={<CaregiverLinking />} />
                      
                      {/* Admin routes */}
                      <Route
                        path="admin/*"
                        element={
                          <ProtectedRoute requiredRole="administrator">
                            <AdminPanel />
                          </ProtectedRoute>
                        }
                      />
                    </Route>

                    {/* Fallback */}
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