import { useState, useEffect, useCallback } from 'react';
import { useKycSync } from './useKycSync';

export const useKycState = () => {
  const { kycStatus, loading } = useKycSync();
  const [stableKycStatus, setStableKycStatus] = useState(kycStatus);
  const [isStable, setIsStable] = useState(false);

  // ✅ NOUVEAU: Éviter le flash en gardant l'état précédent
  useEffect(() => {
    if (kycStatus && !loading) {
      // Si on a un statut et qu'on n'est plus en chargement
      if (!stableKycStatus) {
        // Premier chargement
        setStableKycStatus(kycStatus);
        setIsStable(true);
      } else if (kycStatus.status !== stableKycStatus.status) {
        // Changement de statut (ex: unverified → pending)
        setStableKycStatus(kycStatus);
        setIsStable(true);
      } else {
        // Même statut, on peut afficher
        setIsStable(true);
      }
    }
  }, [kycStatus, loading, stableKycStatus]);

  // ✅ NOUVEAU: Persister l'état dans sessionStorage pour éviter le flash
  useEffect(() => {
    if (stableKycStatus && isStable) {
      sessionStorage.setItem('stableKycStatus', JSON.stringify(stableKycStatus));
    }
  }, [stableKycStatus, isStable]);

  // ✅ NOUVEAU: Charger l'état stable depuis sessionStorage au montage
  useEffect(() => {
    const savedStatus = sessionStorage.getItem('stableKycStatus');
    if (savedStatus) {
      try {
        const parsedStatus = JSON.parse(savedStatus);
        setStableKycStatus(parsedStatus);
        setIsStable(true);
      } catch (err) {
        console.error('Erreur parsing sessionStorage:', err);
      }
    }
  }, []);

  // ✅ NOUVEAU: Nettoyer sessionStorage quand on se déconnecte
  const clearStableStatus = useCallback(() => {
    sessionStorage.removeItem('stableKycStatus');
    setStableKycStatus(null);
    setIsStable(false);
  }, []);

  return {
    kycStatus: stableKycStatus,
    loading: loading || !isStable,
    isStable,
    clearStableStatus
  };
};
