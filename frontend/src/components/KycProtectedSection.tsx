import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { KycVisibilityService } from '../services/kycVisibilityService';

interface KycProtectedSectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showPending?: boolean; // Si true, affiche aussi pour pending
}

/**
 * Composant qui masque complètement une section tant que le statut KYC n'est pas verified
 * Utilisé pour masquer les sections sensibles comme "Mes Comptes" et "Transactions"
 */
export const KycProtectedSection: React.FC<KycProtectedSectionProps> = ({
  children,
  fallback,
  showPending = false
}) => {
  const { t, ready } = useTranslation();
  const { user } = useAuth();
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
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // Vérifier si l'utilisateur peut voir cette section
  const canView = kycStatus === 'verified' || (showPending && kycStatus === 'pending');

  if (!canView) {
    // Afficher le fallback ou un message par défaut
    if (fallback) {
      return <>{fallback}</>;
    }

            // Message simple et discret au lieu de masquer complètement
        return (
          <div className="text-center py-8 text-gray-500">
            <div className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-600 rounded-md text-sm">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              {ready ? t('kyc.noDataAvailable') : 'Aucune donnée disponible'}
            </div>
          </div>
        );
  }

  // Afficher le contenu protégé
  return <>{children}</>;
};

export default KycProtectedSection;
