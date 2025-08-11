import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VerificationBannerProps {
  userStatus: string;
  onClose?: () => void;
}

const VerificationBanner: React.FC<VerificationBannerProps> = ({ userStatus, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Ne pas afficher la bannière si l'utilisateur est vérifié
  if (userStatus === 'verified') {
    return null;
  }

  const handleVerifyClick = () => {
    navigate('/dashboard/kyc');
  };

  const getBannerContent = () => {
    if (userStatus === 'unverified') {
      return {
        title: t('verification.banner.unverified.title'),
        message: t('verification.banner.unverified.message'),
        buttonText: t('verification.banner.unverified.button'),
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        buttonColor: 'bg-red-600 hover:bg-red-700'
      };
    } else if (userStatus === 'pending') {
      return {
        title: t('verification.banner.pending.title'),
        message: t('verification.banner.pending.message'),
        buttonText: t('verification.banner.pending.button'),
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        buttonColor: 'bg-blue-600 hover:bg-blue-700'
      };
    }
    return null;
  };

  const content = getBannerContent();
  if (!content) return null;

  return (
    <div className={`${content.bgColor} ${content.borderColor} border-b px-4 py-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`${content.iconColor}`}>
            {userStatus === 'unverified' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${content.textColor}`}>
              {content.title}
            </h3>
            <p className={`text-sm ${content.textColor} opacity-90`}>
              {content.message}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleVerifyClick}
            className={`${content.buttonColor} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
          >
            {content.buttonText}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`${content.textColor} hover:opacity-70 transition-opacity`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationBanner; 