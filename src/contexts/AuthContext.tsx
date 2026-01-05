import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, LinkedPatient } from '../types';
import { apiRequest, setSessionToken, getSessionToken } from '../utils/supabase/client';

interface AuthContextType {
  user: User | null;
  linkedPatients: LinkedPatient[];
  activePatientId: string | null;
  activePatient: LinkedPatient | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  switchPatient: (patientId: string | null) => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  dateOfBirth?: string;
  phone?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Diagnostic: module initialization timestamp
console.log('[AuthContext] module init:', new Date().toISOString());

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('[AuthContext] AuthProvider render');
  const [user, setUser] = useState<User | null>(null);
  const [linkedPatients, setLinkedPatients] = useState<LinkedPatient[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const token = getSessionToken();
      
      if (token) {
        try {
          const sessionData = await apiRequest('/auth/session');
          if (sessionData.authenticated && sessionData.user) {
            setUser(sessionData.user);
            
            // Load linked patients if caregiver
            if (sessionData.user.role === 'caregiver') {
              await loadLinkedPatients(sessionData.user.id);
            }
          } else {
            // Token invalid, clear it
            setSessionToken(null);
          }
        } catch (error) {
          console.error('Session check failed:', error);
          setSessionToken(null);
        }
      }
      
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const loadLinkedPatients = async (caregiverId: string) => {
    try {
      const links = await apiRequest('/caregiver/links');
      const approvedLinks = links.filter((link: any) => link.status === 'approved');
      
      // Convert caregiver links to LinkedPatient format
      const patients = await Promise.all(
        approvedLinks.map(async (link: any) => {
          const patientProfile = await apiRequest(`/user/profile?userId=${link.patientId}`);
          return {
            id: link.patientId,
            firstName: patientProfile.firstName,
            lastName: patientProfile.lastName,
            dateOfBirth: patientProfile.dateOfBirth,
            relationship: link.relationship || 'Patient',
            accessLevel: link.accessLevel,
          };
        })
      );
      
      setLinkedPatients(patients);
      
      // Set first patient as active by default
      const storedActivePatient = localStorage.getItem('activePatientId');
      if (storedActivePatient && patients.find(p => p.id === storedActivePatient)) {
        setActivePatientId(storedActivePatient);
      } else if (patients.length > 0) {
        setActivePatientId(patients[0].id);
        localStorage.setItem('activePatientId', patients[0].id);
      }
    } catch (error) {
      console.error('Error loading linked patients:', error);
      setLinkedPatients([]);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      
      if (response.session && response.session.access_token) {
        setSessionToken(response.session.access_token);
        setUser(response.user);
        
        // Load linked patients if caregiver
        if (response.user.role === 'caregiver') {
          await loadLinkedPatients(response.user.id);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!response.success) {
        // Show specific error message from backend
        const errorMessage = response.error || 'Registration failed';
        
        // If it's a config error, provide helpful instructions
        if (errorMessage.includes('SUPABASE_SERVICE_ROLE_KEY')) {
          throw new Error(
            'Server configuration error: The backend is not properly configured. ' +
            'Please visit /diagnostics for setup instructions.'
          );
        }
        
        throw new Error(errorMessage);
      }
      
      // Auto-login after registration
      await login(data.email, data.password);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/signout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setSessionToken(null);
    setUser(null);
    setLinkedPatients([]);
    setActivePatientId(null);
    localStorage.removeItem('activePatientId');
  };

  const switchPatient = (patientId: string | null) => {
    setActivePatientId(patientId);
    if (patientId) {
      localStorage.setItem('activePatientId', patientId);
    } else {
      localStorage.removeItem('activePatientId');
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const response = await apiRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      if (response.success) {
        setUser(response.profile);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const activePatient = activePatientId 
    ? linkedPatients.find(p => p.id === activePatientId) || null
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        linkedPatients,
        activePatientId,
        activePatient,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchPatient,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}