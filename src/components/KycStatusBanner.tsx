import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
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
  const { kycStatus, isVerified, isPending, isUnverified, isRejected } = useKycSync();

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
        title: 'Vérification en cours',
        description: 'Vos documents sont en cours de vérification. Cela peut prendre 24-48h.',
      };
    }

    if (isRejected) {
      return {
        icon: <XCircle className="w-5 h-5" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        title: 'Vérification rejetée',
        description: kycStatus.rejectionReason || 'Votre vérification a été rejetée. Veuillez soumettre de nouveaux documents.',
      };
    }

    if (isUnverified) {
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        title: 'Vérification requise',
        description: 'Pour accéder à toutes les fonctionnalités, veuillez compléter votre vérification d\'identité.',
      };
    }

    return null;
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`${config.textColor} flex-shrink-0`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h3>
          {showDetails && (
            <p className={`mt-1 text-sm ${config.textColor} opacity-90`}>
              {config.description}
            </p>
          )}
          <div className="mt-3 flex space-x-3">
            <a
              href="/dashboard/verification"
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${config.textColor} ${config.bgColor} hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <Shield className="w-4 h-4 mr-2" />
              {isPending ? 'Voir le statut' : 'Commencer la vérification'}
            </a>
            {isRejected && (
              <button
                onClick={() => window.location.href = '/dashboard/verification'}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${config.textColor} ${config.bgColor} hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
              >
                Soumettre à nouveau
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycStatusBanner;
