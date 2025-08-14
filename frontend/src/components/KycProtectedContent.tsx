import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { KycVisibilityService } from '../services/kycVisibilityService';

interface KycProtectedContentProps {
  titleKey: string; // Changé de 'title' à 'titleKey' pour indiquer que c'est une clé de traduction
  children: React.ReactNode;
  fallbackMessage?: string;
  showPending?: boolean; // Si true, affiche aussi pour pending
  className?: string;
}

/**
 * Composant qui affiche le titre de la section mais masque le contenu selon le statut KYC
 * Utilisé pour garder la structure visuelle tout en protégeant le contenu sensible
 */
export const KycProtectedContent: React.FC<KycProtectedContentProps> = ({
  titleKey,
  children,
  fallbackMessage,
  showPending = false,
  className = ""
}) => {
  const { t, ready } = useTranslation();
  const { user } = useAuth();
  
  // Utiliser le fallback personnalisé ou la traduction par défaut
  const defaultMessage = fallbackMessage || (ready ? t('kyc.noDataAvailable') : 'Aucune donnée disponible') || 'Aucune donnée disponible';
  const [kycStatus, setKycStatus] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkKycStatus = async () => {
      try {
        const verificationStatus = await KycVisibilityService.getVerificationStatus(user.uid);
        setKycStatus(verificationStatus.kycStatus);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut KYC:', error);
        setKycStatus('unverified');
      } finally {
        setIsLoading(false);
      }
    };

    checkKycStatus();
  }, [user]);

  // Pendant le chargement, afficher un placeholder
  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-4 md:p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{t(titleKey)}</h2>
        </div>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur peut voir le contenu
  const canView = kycStatus === 'verified' || (showPending && kycStatus === 'pending');

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-4 md:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">{t(titleKey)}</h2>
      </div>
      
      {canView ? (
        // Afficher le contenu protégé
        <>{children}</>
      ) : (
        // Afficher le message de fallback
        <div className="text-center py-8 text-gray-500">
          <div className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-600 rounded-md text-sm">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            {defaultMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default KycProtectedContent;
