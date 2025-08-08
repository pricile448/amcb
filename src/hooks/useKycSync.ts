import { useState, useEffect } from 'react';
import { kycService, KYCStatus } from '../services/kycService';
import { FirebaseDataService } from '../services/firebaseData';
import { logger } from '../utils/logger';

export const useKycSync = () => {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncKycStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = FirebaseDataService.getCurrentUserId();
      if (!userId) {
        logger.warn('useKycSync: Aucun utilisateur connecté');
        return;
      }

      const status = await kycService.getUserKYCStatus(userId);
      setKycStatus(status);

      // Mettre à jour le localStorage pour la persistance
      if (status) {
        localStorage.setItem('kycStatus', JSON.stringify(status));
      }

      logger.debug('useKycSync: Statut KYC synchronisé:', status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de synchronisation KYC';
      setError(errorMessage);
      logger.error('useKycSync: Erreur synchronisation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger le statut depuis le localStorage au montage
  useEffect(() => {
    const savedStatus = localStorage.getItem('kycStatus');
    if (savedStatus) {
      try {
        const parsedStatus = JSON.parse(savedStatus);
        setKycStatus(parsedStatus);
      } catch (err) {
        logger.error('useKycSync: Erreur parsing localStorage:', err);
      }
    }
  }, []);

  // Synchroniser automatiquement au montage
  useEffect(() => {
    syncKycStatus();
  }, []);

  return {
    kycStatus,
    loading,
    error,
    syncKycStatus,
    isVerified: kycStatus?.status === 'approved',
    isPending: kycStatus?.status === 'pending',
    isUnverified: kycStatus?.status === 'unverified' || !kycStatus,
    isRejected: kycStatus?.status === 'rejected',
  };
};
