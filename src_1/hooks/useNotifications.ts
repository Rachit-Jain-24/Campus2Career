import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export interface Notification {
  id: string;
  msg: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  timestamp: number;
}

export function useNotifications() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    const storageKey = `c2c_notifications_${user.uid || user.email}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {}
    }

    // Subscribe to new placement drives (System-wide alert for students)
    const drivesSub = supabase
      .channel('public:drives:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'drives' },
        (payload) => {
          const newDrive = payload.new;
          showToast(`New placement drive announced: ${newDrive.title}`, 'info');
          
          setNotifications(prev => {
            const updated = [
              {
                id: `drive_${newDrive.id}`,
                msg: `New Drive: ${newDrive.title}`,
                time: 'Just now',
                type: 'info' as const,
                read: false,
                timestamp: Date.now()
              },
              ...prev
            ].slice(0, 50);
            localStorage.setItem(storageKey, JSON.stringify(updated));
            return updated;
          });
        }
      )
      .subscribe();

    // Subscribe to new offers specifically for this user
    const offersSub = supabase
      .channel('public:offers:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'offers' },
        (payload) => {
          const newOffer = payload.new;
          // Check if this offer is for the logged in user using their sap_id or uid
          // Since offers schema might use student_id (UID) or sap_id:
          if (user.uid === newOffer.student_id || (user as any).sapId === newOffer.student_id) {
             showToast(`Congratulations! You received an offer`, 'success');
             
             setNotifications(prev => {
               const updated = [
                 {
                   id: `offer_${newOffer.id}`,
                   msg: `Offer Received: ${newOffer.ctc ? newOffer.ctc + ' LPA' : 'Check portal'}`,
                   time: 'Just now',
                   type: 'success' as const,
                   read: false,
                   timestamp: Date.now()
                 },
                 ...prev
               ].slice(0, 50);
               localStorage.setItem(storageKey, JSON.stringify(updated));
               return updated;
             });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(drivesSub);
      supabase.removeChannel(offersSub);
    };
  }, [user, showToast]);

  const markAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      if (user) localStorage.setItem(`c2c_notifications_${user.uid || user.email}`, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    if (user) localStorage.removeItem(`c2c_notifications_${user.uid || user.email}`);
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAllRead,
    clearAll
  };
}
