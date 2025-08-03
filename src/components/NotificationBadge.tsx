import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  unreadCount: number;
  onClick?: () => void;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  unreadCount,
  onClick,
  className = ''
}) => {
  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
    >
      <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
      
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  );
}; 