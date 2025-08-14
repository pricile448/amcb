import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { KycVisibilityService } from '../services/kycVisibilityService';
import { logger } from '../utils/logger';

interface KycStatusBannerProps {
  className?: string;
}

const KycStatusBanner: React.FC<KycStatusBannerProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState<string>('unverified');
  const [hasFullAccess, setHasFullAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadKycStatus = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const status = await KycVisibilityService.getVerificationStatus(user.uid);
        setKycStatus(status.kycStatus);
        setHasFullAccess(status.hasFullAccess);
      } catch (error) {
        logger.error('Erreur lors du chargement du statut KYC:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKycStatus();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className={`bg-gray-100 border-l-4 border-gray-400 p-4 ${className}`}>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-3"></div>
          <p className="text-gray-600">{t('kyc.loading')}</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur a un accès complet, ne pas afficher la bannière
  if (hasFullAccess) {
    return null;
  }

  const getBannerStyle = () => {
    switch (kycStatus) {
      case 'verified':
        return 'bg-green-50 border-green-400 text-green-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      case 'rejected':
        return 'bg-red-50 border-red-400 text-red-800';
      default:
        return 'bg-blue-50 border-blue-400 text-blue-800';
    }
  };

  const getBannerIcon = () => {
    switch (kycStatus) {
      case 'verified':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getBannerMessage = () => {
    switch (kycStatus) {
      case 'verified':
        return t('kyc.verifiedMessage');
      case 'pending':
        return t('kyc.pendingMessage');
      case 'rejected':
        return t('kyc.rejectedMessage');
      default:
        return t('kyc.unverifiedMessage');
    }
  };

  const getActionButton = () => {
    switch (kycStatus) {
      case 'unverified':
        return (
          <button
            onClick={() => window.location.href = '/kyc'}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {t('kyc.startVerification')}
          </button>
        );
      case 'pending':
        return (
          <div className="ml-4 text-sm text-gray-600">
            {t('kyc.verificationInProgress')}
          </div>
        );
      case 'rejected':
        return (
          <button
            onClick={() => window.location.href = '/kyc'}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {t('kyc.retryVerification')}
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`border-l-4 p-4 ${getBannerStyle()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-lg mr-3">{getBannerIcon()}</span>
          <div>
            <p className="font-medium">{getBannerMessage()}</p>
            <p className="text-sm opacity-90 mt-1">
              {kycStatus === 'unverified' && t('kyc.unverifiedDescription')}
              {kycStatus === 'pending' && t('kyc.pendingDescription')}
              {kycStatus === 'rejected' && t('kyc.rejectedDescription')}
            </p>
          </div>
        </div>
        {getActionButton()}
      </div>
    </div>
  );
};

export default KycStatusBanner;
