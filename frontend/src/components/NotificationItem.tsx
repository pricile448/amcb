import React from 'react';
import { Check, AlertCircle, Info, Wrench, Star, ExternalLink, Clock, Shield } from 'lucide-react';
import { Notification } from '../services/NotificationService';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onActionClick?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onActionClick
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'feature':
        return <Star className="w-4 h-4 text-purple-600" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <Shield className="w-3 h-3" />;
      case 'maintenance':
        return <Wrench className="w-3 h-3" />;
      case 'feature':
        return <Star className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  };

  const isExpired = notification.expiresAt && notification.expiresAt < new Date();

  if (isExpired) {
    return null;
  }

  return (
    <div className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
      !notification.read ? 'bg-blue-50' : ''
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${getPriorityColor(notification.priority).replace('border-l-', 'bg-').replace('-50', '-100')}`}>
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
              {notification.category !== 'general' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {getCategoryIcon(notification.category)}
                  <span className="ml-1 capitalize">{notification.category}</span>
                </span>
              )}
              {notification.priority === 'urgent' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Urgent
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(notification.date)}
              </span>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          
          {/* Action button if available */}
          {notification.actionUrl && notification.actionText && (
            <button
              onClick={() => onActionClick?.(notification)}
              className="mt-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              {notification.actionText}
            </button>
          )}
          
          <div className="flex items-center space-x-2 mt-2">
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Marquer comme lu
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="text-xs text-red-600 hover:text-red-800 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem; 