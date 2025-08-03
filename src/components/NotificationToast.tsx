import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle, Star } from 'lucide-react';
import { Notification } from '../hooks/useNotifications';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  duration?: number;
}

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'feature':
      return <Star className="w-5 h-5 text-purple-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const getBgColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'info':
      return 'bg-blue-50 border-blue-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    case 'feature':
      return 'bg-purple-50 border-purple-200';
    default:
      return 'bg-blue-50 border-blue-200';
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onMarkAsRead,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Attendre l'animation de sortie
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          ${getBgColor(notification.type)}
          border rounded-lg shadow-lg p-4 cursor-pointer
          hover:shadow-xl transition-shadow duration-200
        `}
        onClick={handleClick}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">
                {notification.title}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="mt-1 text-sm text-gray-600">
              {notification.message}
            </p>
            
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {new Date(notification.date).toLocaleTimeString()}
              </span>
              
              {!notification.read && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Nouveau
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 