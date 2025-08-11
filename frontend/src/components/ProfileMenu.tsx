import React, { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { User, Shield, CreditCard as CardIcon, Download, LogOut, Heart, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userStatus: string;
  onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  userStatus,
  onLogout
}) => {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  const getDashboardLink = (path: string) => {
    const currentLang = lang || 'fr';
    return `/${currentLang}/dashboard/${path}`;
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute right-0 mt-2 w-80 sm:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-60 max-w-[calc(100vw-2rem)]" ref={menuRef}>
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {userStatus === 'verified' ? (
                    <>
                      <Shield className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-green-600 dark:text-green-400">{t('nav.profile.verifiedAccount')}</span>
                    </>
                  ) : userStatus === 'pending' ? (
                    <>
                      <Shield className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">{t('nav.profile.verificationInProgress')}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <span className="text-xs text-red-600 dark:text-red-400">{t('nav.profile.unverifiedAccount')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        <div className="py-1 sm:py-2">
          <Link
            to={getDashboardLink('parametres')}
            onClick={handleLinkClick}
            className="flex items-center px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer w-full"
          >
            <User className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="truncate">{t('nav.profile.myProfile')}</span>
          </Link>
          <Link
            to={getDashboardLink('parametres')}
            onClick={handleLinkClick}
            className="flex items-center px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer w-full"
          >
            <Shield className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="truncate">{t('nav.profile.security')}</span>
          </Link>
          <Link
            to={getDashboardLink('cartes')}
            onClick={handleLinkClick}
            className="flex items-center px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer w-full"
          >
            <CardIcon className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="truncate">{t('nav.profile.myCards')}</span>
          </Link>
          <Link
            to={getDashboardLink('documents')}
            onClick={handleLinkClick}
            className="flex items-center px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer w-full"
          >
            <Download className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="truncate">{t('nav.profile.documents')}</span>
          </Link>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 py-2">
          {userStatus === 'verified' ? (
            <button
              onClick={onLogout}
              className="flex items-center w-full px-3 sm:px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">{t('nav.profile.logout')}</span>
            </button>
          ) : (
            <div className="px-3 sm:px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center mb-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                  <Heart className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">{t('nav.profile.trustMessage')}</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300 ml-6 sm:ml-8">{t('nav.profile.verifyIdentityMessage')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu; 