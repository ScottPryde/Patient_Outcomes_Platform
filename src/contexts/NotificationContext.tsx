import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types';
import { useAuth } from './AuthContext';
import { mockNotifications } from '../lib/mockData';
import { apiRequest } from '../utils/supabase/client';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, activePatientId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, activePatientId]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Try live API first; fall back to mock if unavailable
      let live: Notification[] | null = null;
      try {
        const data = await apiRequest('/notifications');
        if (Array.isArray(data)) live = data;
        else if (Array.isArray(data?.notifications)) live = data.notifications;
      } catch {
        // Endpoint 404 or auth error — use mock
      }

      const userId = user?.role === 'caregiver' && activePatientId
        ? activePatientId
        : user?.id;

      const source = live ?? mockNotifications.filter((n) => n.userId === userId || n.userId === 'user-anna-thompson');
      const sorted = source.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(sorted);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    
    // In production, update via API
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    // In production, update via API
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // In production, delete via API
  };

  const clearAll = () => {
    setNotifications([]);
    
    // In production, delete via API
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
