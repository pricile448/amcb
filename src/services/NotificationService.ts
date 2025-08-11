export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'feature' | 'maintenance';
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  expiresAt?: Date;
  actionUrl?: string;
  actionText?: string;
}

export class NotificationService {
  static async getNotifications(): Promise<Notification[]> {
    // Simulation - à remplacer par un vrai appel API
    return [];
  }

  static async markAsRead(notificationId: string): Promise<void> {
    // Simulation - à remplacer par un vrai appel API
    console.log('Marking notification as read:', notificationId);
  }

  static async markAllAsRead(): Promise<void> {
    // Simulation - à remplacer par un vrai appel API
    console.log('Marking all notifications as read');
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    // Simulation - à remplacer par un vrai appel API
    console.log('Deleting notification:', notificationId);
  }
} 