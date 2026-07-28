import { useEffect, useState, useCallback } from 'react';
import { logger } from '../lib/logger';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { notificationsDb } from '../services/db/database.service';
import type { SystemNotification as Notification } from '../services/db/types';

export function useNotifications() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const role = (user as any)?.role || 'student';
  const userId = user?.id || user?.uid;

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await notificationsDb.getNotifications(userId, role);
      setNotifications(data);
    } catch (error) {
      logger.error('Failed to load notifications', { error });
    } finally {
      setIsLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    if (!userId) return;

    loadNotifications();

    // Listen for new notifications in real-time
    const unsubscribe = notificationsDb.onNotificationsChange(userId, role, (newNotes) => {
      setNotifications(newNotes);
      
      // If the latest notification is unread and new, show a toast
      if (newNotes.length > 0 && !newNotes[0].isRead) {
        // Only toast if it was created in the last 10 seconds (avoid toast spam on load)
        const age = Date.now() - new Date(newNotes[0].createdAt).getTime();
        if (age < 10000) {
          showToast(newNotes[0].title, 'info');
        }
      }
    });

    return () => unsubscribe();
  }, [userId, role, loadNotifications, showToast]);

  const markAllRead = async () => {
    if (!userId) return;
    try {
      await notificationsDb.markAllAsRead(userId, role);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      logger.error('Failed to mark all read', { error });
    }
  };

  const clearAll = async () => {
    // We don't have a delete all yet in the adapter, but we can just clear local state for now
    // or implement delete in adapter. For now, mark all as read is better.
    markAllRead();
  };

  return {
    notifications: notifications.map(n => ({
        id: n.id,
        msg: n.message,
        time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: n.type as any,
        read: n.isRead,
        timestamp: new Date(n.createdAt).getTime()
    })),
    unreadCount: notifications.filter(n => !n.isRead).length,
    markAllRead,
    clearAll,
    isLoading
  };
}
