import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Consent, UserConsent } from '../types';
import { AuthContext } from './AuthContext';
import { mockConsents, mockUserConsents } from '../lib/mockData';

interface ConsentContextType {
  consents: Consent[];
  userConsents: UserConsent[];
  isLoading: boolean;
  acceptConsent: (consentId: string, actingAsPatientId?: string) => Promise<void>;
  declineConsent: (consentId: string, actingAsPatientId?: string) => Promise<void>;
  withdrawConsent: (userConsentId: string, reason?: string) => Promise<void>;
  getUserConsentStatus: (consentId: string, userId?: string) => UserConsent | undefined;
  hasRequiredConsents: (userId?: string) => boolean;
  refreshConsents: () => Promise<void>;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  if (auth === undefined) throw new Error('ConsentProvider must be used within an AuthProvider');
  const { user, activePatientId } = auth;
  const [consents, setConsents] = useState<Consent[]>([]);
  const [userConsents, setUserConsents] = useState<UserConsent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConsents();
  }, [user, activePatientId]);

  const loadConsents = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setConsents(mockConsents);
      
      // Load user consents based on role
      if (user) {
        const userId = user.role === 'caregiver' && activePatientId 
          ? activePatientId 
          : user.id;
        
        const userConsentData = mockUserConsents.filter(
          uc => uc.userId === userId
        );
        
        setUserConsents(userConsentData);
      }
    } catch (error) {
      console.error('Failed to load consents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptConsent = async (
    consentId: string, 
    actingAsPatientId?: string
  ): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const consent = consents.find(c => c.id === consentId);
      if (!consent) throw new Error('Consent not found');
      
      const userId = actingAsPatientId || user.id;
      
      const newUserConsent: UserConsent = {
        id: `uc-${Date.now()}`,
        userId,
        consentId,
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        version: consent.version,
        ...(actingAsPatientId && {
          actingUserId: user.id,
          actingUserRole: user.role,
        }),
      };
      
      setUserConsents(prev => {
        // Remove any existing consent for this type
        const filtered = prev.filter(
          uc => !(uc.userId === userId && uc.consentId === consentId)
        );
        return [...filtered, newUserConsent];
      });
      
      // In production, save to API
    } catch (error) {
      throw error;
    }
  };

  const declineConsent = async (
    consentId: string, 
    actingAsPatientId?: string
  ): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const consent = consents.find(c => c.id === consentId);
      if (!consent) throw new Error('Consent not found');
      
      const userId = actingAsPatientId || user.id;
      
      const newUserConsent: UserConsent = {
        id: `uc-${Date.now()}`,
        userId,
        consentId,
        status: 'declined',
        declinedAt: new Date().toISOString(),
        version: consent.version,
        ...(actingAsPatientId && {
          actingUserId: user.id,
          actingUserRole: user.role,
        }),
      };
      
      setUserConsents(prev => {
        const filtered = prev.filter(
          uc => !(uc.userId === userId && uc.consentId === consentId)
        );
        return [...filtered, newUserConsent];
      });
    } catch (error) {
      throw error;
    }
  };

  const withdrawConsent = async (
    userConsentId: string, 
    reason?: string
  ): Promise<void> => {
    try {
      setUserConsents(prev =>
        prev.map(uc =>
          uc.id === userConsentId
            ? {
                ...uc,
                status: 'withdrawn' as const,
                withdrawnAt: new Date().toISOString(),
                notes: reason,
              }
            : uc
        )
      );
      
      // In production, save to API
    } catch (error) {
      throw error;
    }
  };

  const getUserConsentStatus = (
    consentId: string, 
    userId?: string
  ): UserConsent | undefined => {
    const targetUserId = userId || 
      (user?.role === 'caregiver' && activePatientId ? activePatientId : user?.id);
    
    return userConsents.find(
      uc => uc.userId === targetUserId && uc.consentId === consentId
    );
  };

  const hasRequiredConsents = (userId?: string): boolean => {
    const targetUserId = userId || 
      (user?.role === 'caregiver' && activePatientId ? activePatientId : user?.id);
    
    const requiredConsents = consents.filter(c => c.required);
    
    return requiredConsents.every(consent => {
      const userConsent = userConsents.find(
        uc => uc.userId === targetUserId && uc.consentId === consent.id
      );
      return userConsent && userConsent.status === 'accepted';
    });
  };

  const refreshConsents = async () => {
    await loadConsents();
  };

  return (
    <ConsentContext.Provider
      value={{
        consents,
        userConsents,
        isLoading,
        acceptConsent,
        declineConsent,
        withdrawConsent,
        getUserConsentStatus,
        hasRequiredConsents,
        refreshConsents,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
}
