import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'feature';
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'feature':
        return '🆕';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'feature':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getDashboardLink = (path: string) => {
    const currentLang = lang || 'fr';
    return `/${currentLang}/dashboard/${path}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de notifications */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)]">
          {/* Header */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">{t('nav.notifications.title')}</h3>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  <span className="hidden sm:inline">{t('nav.notifications.markAllAsRead')}</span>
                  <span className="sm:hidden">{t('nav.notifications.markAllAsReadShort')}</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-0.5"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div 
            ref={scrollContainerRef}
            className="max-h-80 sm:max-h-96 overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f3f4f6'
            }}
          >
            {notifications.length === 0 ? (
              <div className="p-3 sm:p-4 md:p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-xs sm:text-sm font-medium">{t('nav.notifications.noNotifications')}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t('nav.notifications.noNotificationsMessage')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2.5 sm:p-3 md:p-4 border-l-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => {
                      setSelectedNotification(notification);
                      if (!notification.read) {
                        onMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1">
                          <span className="text-sm sm:text-base md:text-lg">{getNotificationIcon(notification.type)}</span>
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1.5 sm:mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(notification.date).toLocaleString(i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es-ES' : i18n.language === 'de' ? 'de-DE' : i18n.language === 'it' ? 'it-IT' : i18n.language === 'nl' ? 'nl-NL' : i18n.language === 'pt' ? 'pt-PT' : 'fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 sm:p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
            <Link
              to={getDashboardLink('messages')}
              className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium block text-center"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.notifications.viewAllNotifications')}
            </Link>
          </div>
        </div>
      )}

      {/* Modal pour afficher le contenu complet de la notification */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 max-w-sm sm:max-w-md w-full max-h-80 sm:max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1 min-w-0">
                <span className="text-lg sm:text-xl md:text-2xl">{getNotificationIcon(selectedNotification.type)}</span>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {selectedNotification.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 ml-1.5 sm:ml-2 p-0.5"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
            </div>
            
            <div className={`p-2.5 sm:p-3 md:p-4 rounded-lg mb-3 sm:mb-4 ${getNotificationColor(selectedNotification.type)}`}>
              <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedNotification.message}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
              <span>
                {new Date(selectedNotification.date).toLocaleString(i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es-ES' : i18n.language === 'de' ? 'de-DE' : i18n.language === 'it' ? 'it-IT' : i18n.language === 'nl' ? 'nl-NL' : i18n.language === 'pt' ? 'pt-PT' : 'fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm md:text-base"
              >
                {t('nav.notifications.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 