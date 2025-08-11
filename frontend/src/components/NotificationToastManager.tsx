import React, { useEffect, useState } from 'react';
import { NotificationToast } from './NotificationToast';
import { Notification, useNotifications } from '../hooks/useNotifications';

export const NotificationToastManager: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();
  const [activeToasts, setActiveToasts] = useState<Notification[]>([]);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  // Détecter les nouvelles notifications
  useEffect(() => {
    const newNotifications = notifications.filter(
      notif => !notif.read && !processedIds.has(notif.id)
    );

    if (newNotifications.length > 0) {
      // Ajouter les nouvelles notifications aux toasts actifs
      setActiveToasts(prev => [...prev, ...newNotifications]);
      
      // Marquer comme traitées
      setProcessedIds(prev => {
        const newSet = new Set(prev);
        newNotifications.forEach(notif => newSet.add(notif.id));
        return newSet;
      });
    }
  }, [notifications, processedIds]);

  const handleToastClose = (notificationId: string) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== notificationId));
  };

  return (
    <>
      {activeToasts.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => handleToastClose(notification.id)}
          onMarkAsRead={markAsRead}
          duration={notification.priority === 'high' ? 8000 : 5000}
        />
      ))}
    </>
  );
}; 