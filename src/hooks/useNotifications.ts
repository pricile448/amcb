import { useState, useEffect, useCallback, useRef } from 'react';
import { FirebaseDataService, FirebaseNotification } from '../services/firebaseData';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'feature';
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'general' | 'security' | 'transaction' | 'chat' | 'feature';
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const userId = FirebaseDataService.getCurrentUserId();

  // Fonction pour charger les notifications
  const loadNotifications = useCallback(async () => {
    if (!userId || loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const firebaseNotifications = await FirebaseDataService.getNotifications(userId);
      
      // Convertir FirebaseNotification vers Notification
      const data = firebaseNotifications.map(firebaseNotif => ({
        id: firebaseNotif.id,
        userId: firebaseNotif.userId,
        title: firebaseNotif.title,
        message: firebaseNotif.message,
        type: firebaseNotif.type as 'success' | 'info' | 'warning' | 'error' | 'feature',
        date: firebaseNotif.date.toDate ? firebaseNotif.date.toDate().toISOString() : firebaseNotif.date,
        read: firebaseNotif.read,
        priority: firebaseNotif.priority as 'low' | 'medium' | 'high',
        category: firebaseNotif.category as 'general' | 'security' | 'transaction' | 'chat' | 'feature',
        createdAt: firebaseNotif.date.toDate ? firebaseNotif.date.toDate().toISOString() : firebaseNotif.date
      }));
      
      if (Array.isArray(data)) {
        setNotifications(data);
        const unread = data.filter(notif => !notif.read).length;
        setUnreadCount(unread);
        setLastCheck(new Date());
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userId]);

  // Fonction pour marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await FirebaseDataService.updateNotification(notificationId, { read: true });

      if (success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
    }
  }, [userId]);

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(notif => !notif.read);
      
      for (const notif of unreadNotifications) {
        await markAsRead(notif.id);
      }
    } catch (error) {
      console.error('❌ Erreur marquage toutes notifications:', error);
    }
  }, [notifications, markAsRead]);

  // Fonction pour supprimer une notification (réservée aux admins)
  const deleteNotification = useCallback(async (notificationId: string) => {
    // Cette fonction est réservée aux admins uniquement
    console.log('🔒 Suppression de notification réservée aux admins');
    return false;
  }, []);

  // Chargement initial uniquement (pas de polling automatique)
  useEffect(() => {
    if (!userId) return;

    // Charger les notifications une seule fois au démarrage
    loadNotifications();
  }, [userId, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    lastCheck,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: loadNotifications,
    showSuccess: (title: string | null, message?: string | null) => {
      const safeTitle = title || 'Succès';
      const safeMessage = message || '';
      const fullMessage = safeMessage ? `${safeTitle}: ${safeMessage}` : safeTitle;
      console.log('✅ Success:', fullMessage);
      // Ici vous pouvez intégrer avec un système de toast comme react-hot-toast
    },
    showError: (title: string | null, message?: string | null) => {
      const safeTitle = title || 'Erreur';
      const safeMessage = message || '';
      const fullMessage = safeMessage ? `${safeTitle}: ${safeMessage}` : safeTitle;
      console.error('❌ Error:', fullMessage);
      // Ici vous pouvez intégrer avec un système de toast comme react-hot-toast
    }
  };
};

// Hook pour gérer la synchronisation du statut KYC
export const useKycSync = () => {
  const [userStatus, setUserStatus] = useState<string>('unverified');
  const [isUnverified, setIsUnverified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const syncKycStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userId = user.id;
        
        if (userId) {
          // Synchroniser le statut KYC depuis Firestore
          await FirebaseDataService.syncKycStatus(userId);
          
          // Récupérer le statut mis à jour
          const updatedUserStr = localStorage.getItem('user');
          if (updatedUserStr) {
            const updatedUser = JSON.parse(updatedUserStr);
            const status = updatedUser.verificationStatus || 'unverified';
            setUserStatus(status);
            setIsUnverified(status !== 'verified');
            console.log('🔄 Statut KYC synchronisé:', status);
            return status;
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation KYC:', error);
      setUserStatus('unverified');
      setIsUnverified(true);
    } finally {
      setIsLoading(false);
    }
    return 'unverified';
  }, []);

  // Synchroniser automatiquement le statut KYC au démarrage
  useEffect(() => {
    syncKycStatus();
  }, [syncKycStatus]);

  return {
    userStatus,
    isUnverified,
    isLoading,
    syncKycStatus
  };
}; 