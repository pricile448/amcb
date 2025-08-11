import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Clock, AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useKycSync } from '../hooks/useKycSync';

interface KycStatusBannerProps {
  className?: string;
  showDetails?: boolean;
}

const KycStatusBanner: React.FC<KycStatusBannerProps> = ({ 
  className = '', 
  showDetails = true
}) => {
  const { t } = useTranslation();
  const { 
    kycStatus, 
    isVerified, 
    isPending, 
    isUnverified, 
    isRejected, 
    loading, 
    error, 
    lastSync,
    forceSyncKycStatus 
  } = useKycSync();

  // ✅ CORRIGÉ: Afficher la bannière seulement si pas vérifié ET statut existant
  if (!kycStatus || isVerified) {
    return null; // Ne pas afficher si vérifié ou pas de statut
  }

  const getStatusConfig = () => {
    if (isPending) {
      return {
        icon: <Clock className="w-5 h-5" />,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        title: t('kycStatusBanner.verificationInProgress') || 'Vérification en cours',
        description: t('kycStatusBanner.verificationInProgressDescription') || 'Votre demande de vérification est en cours de traitement.',
      };
    }

    if (isRejected) {
      return {
        icon: <XCircle className="w-5 h-5" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        title: t('kycStatusBanner.verificationRejected') || 'Vérification rejetée',
        description: kycStatus.rejectionReason || t('kycStatusBanner.verificationRejectedDescription') || 'Votre demande de vérification a été rejetée.',
      };
    }

    if (isUnverified) {
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        title: t('kycStatusBanner.verificationRequired') || 'Vérification requise',
        description: t('kycStatusBanner.verificationRequiredDescription') || 'Vous devez compléter votre vérification d\'identité pour accéder à toutes les fonctionnalités.',
      };
    }

    return null;
  };

  const config = getStatusConfig();
  if (!config) return null;

  // ✅ NOUVEAU: Formater la dernière synchronisation
  const formatLastSync = () => {
    if (!lastSync) return 'Jamais synchronisé';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 10) return 'À l\'instant';
    if (diffSeconds < 60) return `Il y a ${diffSeconds}s`;
    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
    
    return lastSync.toLocaleString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // ✅ NOUVEAU: Afficher le statut actuel avec le label français
  const currentStatusLabel = kycStatus ? kycStatus.status : 'Inconnu';

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`${config.textColor} flex-shrink-0`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${config.textColor}`}>
              {config.title}
            </h3>
            {/* ✅ OPTIMISÉ: Indicateur de connexion en temps réel avec dernière sync */}
            <div className="flex items-center space-x-2">
              {error ? (
                <div className="flex items-center text-red-500 text-xs">
                  <WifiOff className="w-3 h-3 mr-1" />
                  <span>Hors ligne</span>
                </div>
              ) : (
                <div className="flex items-center text-green-500 text-xs">
                  <Wifi className="w-3 h-3 mr-1" />
                  <span>En temps réel</span>
                </div>
              )}
              {loading && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
              )}
            </div>
          </div>
          
          {showDetails && (
            <p className={`mt-1 text-sm ${config.textColor} opacity-90`}>
              {config.description}
            </p>
          )}
          
          {/* ✅ NOUVEAU: Affichage du statut actuel et de la dernière synchronisation */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {kycStatus && (
                <p className={`text-xs ${config.textColor} opacity-70`}>
                  Statut: <span className="font-medium">{currentStatusLabel}</span>
                </p>
              )}
              {kycStatus?.lastUpdated && (
                <p className={`text-xs ${config.textColor} opacity-70`}>
                  MAJ: {kycStatus.lastUpdated.toLocaleString('fr-FR')}
                </p>
              )}
            </div>
            {lastSync && (
              <p className={`text-xs ${config.textColor} opacity-70`}>
                Sync: {formatLastSync()}
              </p>
            )}
          </div>
          
          <div className="mt-3 flex space-x-3">
            {isRejected && (
              <button
                onClick={() => window.location.href = '/dashboard/verification'}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${config.textColor} ${config.bgColor} hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
              >
                {t('kycStatusBanner.submitAgain') || 'Soumettre à nouveau'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycStatusBanner;
